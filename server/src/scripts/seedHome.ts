import mongoose from 'mongoose';
import { HomePage } from '../models/HomePage';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const DEFAULT_HOME_PAGE = {
  hero: {
    eyebrow: "India's Premier FEC Authority",
    headingPrefix: "Consulting & Setup For",
    subheadline: "Turn your space into a **thriving entertainment business**. We provide end-to-end setup, equipment, and operations backed by **17+ years** and **50+ venues** across India.",
    rotatingActivities: [
      'Bowling Lanes',
      'VR Gaming',
      'Mini Golf',
      'Trampoline Parks',
      'Go-Kart Tracks',
      'Cricket Simulators',
      'Ziplines',
      'Rope Courses',
      'Soft Play Areas',
      'Laser Tag',
      'Bumper Cars',
      'Rock Climbing',
    ]
  },
};

const DEFAULT_STATS = {
  yearsOfExperience: '17+',
  productsAndEquip: '700+',
  projectsDelivered: '50+',
  citiesServed: '10+',
};

const DEFAULT_CATEGORIES = [
  {
    title: 'Arcade & Video',
    desc: 'Latest-generation skill, racing, and video arcade machines. From classic redemption to immersive 4D experiences.',
    icon: '🕹',
    count: '200+ Titles',
    color: '#5FC1D1',
    image: { url: '/products/Arcade_Games_Calicut.avif', public_id: 'local' },
  },
  {
    title: 'Major Attractions',
    desc: 'Headline centrepieces — bowling lanes, VR arenas, trampoline parks, mini golf, go-kart tracks, cricket simulators, and rope courses.',
    icon: '🎳',
    count: '30+ Categories',
    color: '#6DBD4E',
    image: { url: '/products/Bowling_Lane_Dubai.avif', public_id: 'local' },
  },
  {
    title: 'Redemption Games',
    desc: 'High-engagement ticket-based games with proven repeat-visit ROI. Data-backed selection to maximise in-venue spend.',
    icon: '🎫',
    count: '500+ SKUs',
    color: '#FFAA33',
    image: { url: '/products/Softplay_Ahemdabad.avif', public_id: 'local' },
  },
  {
    title: 'Outdoor & Adventure',
    desc: 'Large scale outdoor equipment, ziplines, and adventure park structural builds designed for high-throughput and safety.',
    icon: '🧗',
    count: '15+ Types',
    color: '#C084FC',
    image: { url: '/products/Softplay_New_Delhi.avif', public_id: 'local' },
  },
];

const DEFAULT_SERVICES = [
  {
    step: '01',
    eyebrow: 'Phase One',
    title: 'Pre-Opening Consulting',
    subtitle: 'We partner with you before a single brick is laid — running location analytics, modeling your ROI, designing the optimal floor layout, and building the team that will make your opening day unforgettable.',
    bullets: [
      'Location analytics & feasibility',
      'ROI & financial modeling',
      'Optimal layout & space planning',
      'Game & equipment sourcing',
      'Staffing structure & training',
      'Agency & regulatory liaison',
    ],
    color: '#5FC1D1',
    rgb: '95,193,209',
    image: { url: '/products/Bowling_Lane_Dubai.avif', public_id: 'local' },
  },
  {
    step: '02',
    eyebrow: 'Phase Two',
    title: 'Operations Management',
    subtitle: 'Running a profitable FEC demands operational excellence every day. We design your SOPs, HR frameworks, finance structures, and data-driven marketing engines — then monitor KPIs continuously.',
    bullets: [
      'SOP & process documentation',
      'HR frameworks & team structure',
      'Finance & cost optimization',
      'Marketing & digital execution',
      'Safety systems & compliance',
      'Real-time KPI monitoring',
    ],
    color: '#6DBD4E',
    rgb: '109,189,78',
    image: { url: '/products/Softplay_New_Delhi.avif', public_id: 'local' },
  },
  {
    step: '03',
    eyebrow: 'Distribution',
    title: 'Equipment Supply',
    subtitle: 'We source and distribute world-class FEC equipment globally — from a single arcade cabinet to a complete multi-zone entertainment destination, turnkey. ROI-modeled game selection included.',
    bullets: [
      'Bowling lanes & pinsetters',
      'VR & immersive technology',
      'Arcade & redemption games',
      'Trampoline & soft play',
      'Outdoor adventure equipment',
      'Turnkey project management',
    ],
    color: '#FFAA33',
    rgb: '255,170,51',
    image: { url: '/products/Arcade_Games_Calicut.avif', public_id: 'local' },
  },
];

const DEFAULT_CASE_STUDIES = [
  {
    client: 'Woop! Entertainment',
    challenge: 'Optimizing floor layout for maximum throughput during peak weekend hours without compromising the premium guest experience.',
    solution: 'Redesigned the zone flow to separate high-energy arcade traffic from the premium bowling lanes, and introduced a centralized F&B hub.',
    result: 'Increased peak-hour capacity by 22% and boosted F&B attach rate.',
    metric: '+22% Capacity',
    image: { url: '/products/Bowling_Lane_Dubai.avif', public_id: 'local' },
  },
  {
    client: 'Shott India',
    challenge: 'Selecting a game mix that appealed to both corporate event crowds and weekend family demographics to maximize ROI.',
    solution: 'Data-driven curation of 80+ arcade titles, balancing high-turnover redemption games with immersive VR anchor attractions.',
    result: 'Achieved projected 18-month ROI target in just 14 months.',
    metric: '14mo ROI',
    image: { url: '/products/Arcade_Games_Calicut.avif', public_id: 'local' },
  },
  {
    client: 'Idea Crate',
    challenge: 'Setting up SOPs and training a green team for a massive 40,000 sq ft multi-attraction venue.',
    solution: 'Deployed our proprietary 4-week pre-opening training module, complete with shadow shifts and stress-test soft openings.',
    result: 'Zero operational downtime in the critical first 90 days of launch.',
    metric: 'Zero Downtime',
    image: { url: '/products/Softplay_Ahemdabad.avif', public_id: 'local' },
  },
];

const DEFAULT_BRANDS = [
  { name: 'Roongta Group' },
  { name: 'Woop' },
  { name: 'Shott' },
  { name: 'Idea Crate' },
  { name: 'Playaza' },
  { name: 'KidZania' },
  { name: 'Cinemax' },
  { name: 'Inox' },
  { name: 'Essel World' }
];

const DEFAULT_EQUIPMENT_TAGS = [
  'Bowling Lanes', 'VR Gaming', 'Mini Golf', 'Trampoline Parks',
  'Go-Kart Tracks', 'Cricket Simulators', 'Ziplines', 'Rope Courses',
  'Soft Play Areas', 'Laser Tag', 'Bumper Cars', 'Rock Climbing'
];

const seedHome = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI is missing');

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const updateData = {
      hero: DEFAULT_HOME_PAGE.hero,
      stats: DEFAULT_STATS,
      productCategories: DEFAULT_CATEGORIES,
      services: DEFAULT_SERVICES,
      caseStudies: DEFAULT_CASE_STUDIES,
      trustedBrands: DEFAULT_BRANDS,
      equipmentTags: DEFAULT_EQUIPMENT_TAGS,
    };

    const updated = await HomePage.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true }
    );

    console.log('Successfully seeded HomePage default data!');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

seedHome();
