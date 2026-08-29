import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ------------------------------------------------------------------
// Copies documents straight from an OLD database into a NEW one —
// no intermediate files. Connects to both at once and streams each
// collection across.
//
// Collections copied: projects, baseproducts, productitems, jobs, blogs
//
// Documents are upserted by their original _id, so this script is
// safe to re-run (it will not create duplicates, and re-running
// after fixing an error will just pick up where it left off).
//
// USAGE — pick ONE of these:
//
//   A) Command line flags:
//      npx ts-node src/scripts/migrateCollections.ts \
//        --old="mongodb+srv://user:pass@old-cluster.mongodb.net/oldDb" \
//        --new="mongodb+srv://user:pass@new-cluster.mongodb.net/newDb"
//
//   B) Environment variables (e.g. in .env, or inline):
//      OLD_MONGO_URI="mongodb+srv://.../oldDb" \
//      NEW_MONGO_URI="mongodb+srv://.../newDb" \
//      npx ts-node src/scripts/migrateCollections.ts
//
// CLI flags win if both are supplied.
// ------------------------------------------------------------------

const COLLECTIONS = ['projects', 'baseproducts', 'productitems', 'jobs', 'blogs'];

const getArg = (flag: string): string | undefined => {
    const arg = process.argv.find((a) => a.startsWith(`--${flag}=`));
    return arg ? arg.split('=').slice(1).join('=') : undefined;
};

const OLD_URI = getArg('old') || process.env.OLD_MONGO_URI;
const NEW_URI = getArg('new') || process.env.NEW_MONGO_URI;

const BATCH_SIZE = 500;

const migrate = async () => {
    if (!OLD_URI || !NEW_URI) {
        console.error(
            '❌ Missing connection strings.\n\n' +
            'Provide both, either as flags:\n' +
            '  npx ts-node src/scripts/migrateCollections.ts --old="<old-uri>" --new="<new-uri>"\n\n' +
            'or as environment variables OLD_MONGO_URI / NEW_MONGO_URI.'
        );
        process.exitCode = 1;
        return;
    }

    if (OLD_URI === NEW_URI) {
        console.error('❌ --old and --new point at the exact same URI. Refusing to run to avoid accidental data loss.');
        process.exitCode = 1;
        return;
    }

    console.log('Connecting to OLD database...');
    const oldConn = await mongoose.createConnection(OLD_URI).asPromise();
    console.log('Connected to OLD database:', oldConn.name);

    console.log('Connecting to NEW database...');
    const newConn = await mongoose.createConnection(NEW_URI).asPromise();
    console.log('Connected to NEW database:', newConn.name);

    try {
        if (!oldConn.db || !newConn.db) {
            throw new Error('Could not establish a database handle on one of the connections.');
        }

        for (const collectionName of COLLECTIONS) {
            const sourceCollection = oldConn.db.collection(collectionName);
            const targetCollection = newConn.db.collection(collectionName);

            const total = await sourceCollection.countDocuments();
            if (total === 0) {
                console.log(`ℹ️  "${collectionName}": nothing to copy (0 documents in source).`);
                continue;
            }

            console.log(`→ Copying "${collectionName}" (${total} document(s))...`);

            const cursor = sourceCollection.find({});
            let batch: Record<string, any>[] = [];
            let copied = 0;

            const flushBatch = async () => {
                if (batch.length === 0) return;
                const ops = batch.map((doc) => {
                    const { _id, ...rest } = doc;
                    return {
                        updateOne: {
                            filter: { _id },
                            update: { $set: rest },
                            upsert: true,
                        },
                    };
                });
                await targetCollection.bulkWrite(ops, { ordered: false });
                copied += batch.length;
                batch = [];
            };

            for await (const doc of cursor) {
                batch.push(doc);
                if (batch.length >= BATCH_SIZE) {
                    await flushBatch();
                }
            }
            await flushBatch();

            console.log(`✅ "${collectionName}": copied ${copied}/${total} document(s).`);
        }

        console.log('\n🎉 Migration complete.');
    } catch (error) {
        console.error('❌ Error during migration:', error);
        process.exitCode = 1;
    } finally {
        await oldConn.close();
        await newConn.close();
        console.log('Both connections closed.');
    }
};

migrate();