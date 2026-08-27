import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

import { AboutPage } from '../models/about';

// Load env vars (same convention as scripts/masterSeed.ts)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ------------------------------------------------------------------
// This is the content that used to be hardcoded inside
// client/src/pages/AboutPage/AboutPage.tsx and
// client/src/pages/AboutPage/components/EndorsedConnections.tsx
// before those pages became CMS-driven.
//
// Image `url`s here point at the static files already sitting in
// client/public (e.g. /iso.jpg, /partners/nag.png, /about/gallery_*.png).
// They are left with no `public_id`, which is fine — the site can
// serve them exactly as before, and the moment an admin uploads a
// replacement through the About Page CMS, that field gets a real
// Cloudinary url + public_id automatically.
// ------------------------------------------------------------------

const aboutPageSeedData = {
    intro: {
        title: 'About Bowling Planet',
        subtitle:
            'Entertainment consulting firm for Family Entertainment Centers—providing strategy, sourcing, and delivery for malls, hotels, resorts, and private investors.',
    },
    certifications: [
        { title: 'ISO 9001:2015', sub: 'Quality certified', image: { url: '/iso.jpg', public_id: '' } },
        { title: 'IAAPA Member', sub: 'Global attractions', image: { url: '/iaapa.png', public_id: '' } },
        { title: 'Authorized Exporter', sub: 'Sourcing & logistics', image: { url: '', public_id: '' } },
    ],
    partners: [
        { name: 'Nordic Amusement Group', image: { url: '/partners/nag.png', public_id: '' } },
        { name: 'Semnox', image: { url: '/partners/semnox.png', public_id: '' } },
        { name: 'ASI', image: { url: '/partners/asi.png', public_id: '' } },
        { name: 'WAB', image: { url: '/partners/wab.png', public_id: '' } },
        { name: 'Lasertag NET', image: { url: '/partners/lasernet.png', public_id: '' } },
        { name: 'JUMP', image: { url: '/partners/jump.png', public_id: '' } },
        { name: 'FuninVR', image: { url: '/partners/funin.png', public_id: '' } },
        { name: 'IFUN', image: { url: '/partners/ifun.png', public_id: '' } },
        { name: 'Cheer Amusement', image: { url: '/partners/cheerAmusement.png', public_id: '' } },
        { name: 'Yuto', image: { url: '/partners/yuto.png', public_id: '' } },
    ],
    gallery: [
        { title: 'Premium Arcade Centers', image: { url: '/about/gallery_arcade.png', public_id: '' } },
        { title: 'High-End Bowling Lanes', image: { url: '/about/gallery_bowling.png', public_id: '' } },
        { title: 'Indoor Trampoline Parks', image: { url: '/about/gallery_trampoline.png', public_id: '' } },
        { title: 'Electric Go-Kart Tracks', image: { url: '/about/gallery_gokart.png', public_id: '' } },
        { title: 'Immersive Laser Tag', image: { url: '/about/gallery_lasertag.png', public_id: '' } },
        { title: 'Virtual Reality Zones', image: { url: '/about/gallery_vr.png', public_id: '' } },
    ],
    stats: [
        { num: '17+', label: 'Years' },
        { num: '21+', label: 'Projects' },
        { num: '700+', label: 'Games' },
        { num: '32%', label: 'Avg. ROI' },
    ],
    visionMission: {
        vision: 'The most trusted partner for building and operating FECs across India and key markets.',
        mission: 'Complete programmes—consult, plan, supply, install, operate—for lasting commercial outcomes.',
    },
    journey: [
        { year: '2006', event: "Ranjith Pillai begins career in India's cinema & FEC industry" },
        { year: '2012', event: 'Leads operations for Cinemax & Inox FEC annexe rollouts' },
        { year: '2017', event: 'Consulting mandate for KidZania, Essel World, and Woop' },
        { year: '2020', event: 'Bowling Planet founded — full-stack FEC consulting firm' },
        { year: 'Today', event: '50+ venues across PAN-India & the Middle East' },
    ],
    founderNote: {
        quote:
            "Great entertainment centers don't happen by accident. They are engineered — with data, design, and seventeen years of hard-won insight.",
        bio:
            "Ranjith Pillai founded Bowling Planet in 2020 after two decades at the center of India's cinema and FEC expansion — advising on site selection, revenue modeling, and operations for recognizable entertainment brands.",
        name: 'Ranjith Pillai',
        designation: 'Founder & Managing Director',
        image: { url: '', public_id: '' },
    },
    whyUs: [
        { title: 'FEC consulting', text: 'Programme, layout and commercial planning.', icon: 'Briefcase' },
        { title: 'Turnkey delivery', text: 'Supply, install, train and open.', icon: 'Wrench' },
        { title: 'Global catalogue', text: 'Curated attractions and games.', icon: 'Boxes' },
        { title: 'ROI discipline', text: 'Decisions tied to unit economics.', icon: 'LineChart' },
        { title: 'Safety standards', text: 'Installation and ops guidance.', icon: 'ShieldCheck' },
        { title: 'Aftercare', text: 'AMC and advisory post-opening.', icon: 'Handshake' },
    ],
};

const seedAboutPage = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/bowling-planet';
        console.log(`Connecting to MongoDB: ${mongoUri}`);
        await mongoose.connect(mongoUri);
        console.log('MongoDB connected successfully!');

        const existing = await AboutPage.findOne();

        if (existing) {
            console.log('An About page document already exists — updating it in place (no duplicate created).');
            await AboutPage.findOneAndUpdate({}, { $set: aboutPageSeedData }, { new: true });
        } else {
            console.log('No About page document found — creating one.');
            await AboutPage.create(aboutPageSeedData);
        }

        console.log('✅ About page seeded successfully!');
    } catch (error) {
        console.error('❌ Error seeding About page:', error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB disconnected.');
    }
};

seedAboutPage();