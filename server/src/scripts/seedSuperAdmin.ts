import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User';

// Load environment variables from .env
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL;
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD;

const seedSuperAdmin = async () => {
    if (!MONGO_URI) {
        console.error('❌ Error: MONGO_URI is not defined in the environment variables.');
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGO_URI);
        console.log('📦 Connected to MongoDB');

        // Check if the SuperAdmin already exists
        const existingUser = await User.findOne({ email: SUPERADMIN_EMAIL });

        if (existingUser) {
            console.log(`⚠️ User with email "${SUPERADMIN_EMAIL}" already exists.`);
            await mongoose.disconnect();
            process.exit(0);
        }

        // Hash the password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(SUPERADMIN_PASSWORD, saltRounds);

        // Create SuperAdmin user
        const superAdmin = new User({
            name: 'Super Admin',
            email: SUPERADMIN_EMAIL,
            passwordHash: passwordHash,
            role: 'SuperAdmin',
            isVerified: true,
            isActive: true,
        });

        await superAdmin.save();
        console.log(`✅ SuperAdmin user seeded successfully: ${SUPERADMIN_EMAIL}`);

    } catch (error) {
        console.error('❌ Error seeding SuperAdmin:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
};

seedSuperAdmin();