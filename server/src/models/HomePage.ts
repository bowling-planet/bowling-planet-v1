import mongoose, { Schema, Document } from 'mongoose';

export interface IHomePage extends Document {
  hero: {
    eyebrow: string;
    headingPrefix: string;
    rotatingActivities: string[];
    subheadline: string;
  };
  stats: {
    yearsOfExperience: string;
    productsAndEquip: string;
    projectsDelivered: string;
    citiesServed: string;
  };
  trustedBrands: {
    name: string;
    image?: { url: string; public_id: string };
  }[];
  featuredProjects: {
    projectIds: mongoose.Types.ObjectId[];
  };
  productCategories: {
    title: string;
    desc: string;
    icon: string;
    count: string;
    color: string;
    image?: { url: string; public_id: string };
  }[];
  services: {
    step: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    shortDescription?: string;
    bullets: string[];
    color: string;
    rgb: string;
    image?: { url: string; public_id: string };
  }[];
  caseStudies: {
    client: string;
    challenge: string;
    solution: string;
    result: string;
    metric: string;
    image?: { url: string; public_id: string };
  }[];
  equipmentTags: string[];
}

const HomePageSchema: Schema = new Schema(
  {
    hero: {
      eyebrow: { type: String, default: "India's Premier FEC Authority" },
      headingPrefix: { type: String, default: "Consulting & Setup For" },
      rotatingActivities: [{ type: String }],
      subheadline: { type: String, default: "Turn your space into a **thriving entertainment business**. We provide end-to-end setup, equipment, and operations backed by **17+ years** and **50+ venues** across India." },
    },
    stats: {
      yearsOfExperience: { type: String, default: '17+' },
      productsAndEquip: { type: String, default: '700+' },
      projectsDelivered: { type: String, default: '50+' },
      citiesServed: { type: String, default: '10+' },
    },
    trustedBrands: {
      type: [
        {
          name: String,
          image: { url: String, public_id: String },
        },
      ],
      default: [],
    },
    featuredProjects: {
      projectIds: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    },
    productCategories: {
      type: [
        {
          title: String,
          desc: String,
          icon: String,
          count: String,
          color: String,
          image: { url: String, public_id: String },
        },
      ],
      default: [],
    },
    services: {
      type: [
        {
          step: String,
          eyebrow: String,
          title: String,
          subtitle: String,
          shortDescription: String,
          bullets: [String],
          color: String,
          rgb: String,
          image: { url: String, public_id: String },
        },
      ],
      default: [],
    },
    caseStudies: {
      type: [
        {
          client: String,
          challenge: String,
          solution: String,
          result: String,
          metric: String,
          image: { url: String, public_id: String },
        },
      ],
      default: [],
    },
    equipmentTags: {
      type: [String],
      default: [
        'Bowling Lanes', 'VR Gaming', 'Mini Golf', 'Trampoline Parks',
        'Go-Kart Tracks', 'Cricket Simulators', 'Ziplines', 'Rope Courses',
        'Soft Play Areas', 'Laser Tag', 'Bumper Cars', 'Rock Climbing'
      ]
    },
  },
  { timestamps: true }
);

export const HomePage = mongoose.model<IHomePage>('HomePage', HomePageSchema);
