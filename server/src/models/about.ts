import mongoose, { Schema, Document } from 'mongoose';

// ------------------------------------------------------------------
// AboutPage — singleton document (one record) that drives every
// editable block on the public /about page, EXCEPT team members,
// which continue to live in their own `TeamMember` collection
// (see models/team.ts) and are managed from the same admin screen.
// ------------------------------------------------------------------

export interface IAboutImage {
    url: string;
    public_id: string;
}

export interface IAboutIntro {
    title: string;
    subtitle: string;
}

export interface IAboutCertification {
    title: string;
    sub: string;
    image?: IAboutImage;
}

export interface IAboutPartner {
    name: string;
    image?: IAboutImage;
}

export interface IAboutGalleryItem {
    title: string;
    image?: IAboutImage;
}

export interface IAboutStat {
    num: string;
    label: string;
}

export interface IAboutVisionMission {
    vision: string;
    mission: string;
}

export interface IAboutJourneyItem {
    year: string;
    event: string;
}

export interface IAboutFounderNote {
    quote: string;
    bio: string;
    name: string;
    designation: string;
    image?: IAboutImage;
}

export interface IAboutWhyUsItem {
    title: string;
    text: string;
    icon: string; // lucide-react icon name, matched on the frontend
}

export interface IAboutPage extends Document {
    intro: IAboutIntro;
    certifications: IAboutCertification[];
    partners: IAboutPartner[];
    gallery: IAboutGalleryItem[];
    stats: IAboutStat[];
    visionMission: IAboutVisionMission;
    journey: IAboutJourneyItem[];
    founderNote: IAboutFounderNote;
    whyUs: IAboutWhyUsItem[];
}

const AboutImageSchema = new Schema<IAboutImage>(
    { url: String, public_id: String },
    { _id: false }
);

const AboutPageSchema = new Schema<IAboutPage>(
    {
        intro: {
            title: { type: String, default: 'About Bowling Planet' },
            subtitle: {
                type: String,
                default:
                    'Entertainment consulting firm for Family Entertainment Centers—providing strategy, sourcing, and delivery for malls, hotels, resorts, and private investors.',
            },
        },
        certifications: {
            type: [
                {
                    title: { type: String, required: true },
                    sub: { type: String, required: true },
                    image: AboutImageSchema,
                },
            ],
            default: [],
        },
        partners: {
            type: [
                {
                    name: { type: String, required: true },
                    image: AboutImageSchema,
                },
            ],
            default: [],
        },
        gallery: {
            type: [
                {
                    title: { type: String, required: true },
                    image: AboutImageSchema,
                },
            ],
            default: [],
        },
        stats: {
            type: [
                {
                    num: { type: String, required: true },
                    label: { type: String, required: true },
                },
            ],
            default: [],
        },
        visionMission: {
            vision: { type: String, default: '' },
            mission: { type: String, default: '' },
        },
        journey: {
            type: [
                {
                    year: { type: String, required: true },
                    event: { type: String, required: true },
                },
            ],
            default: [],
        },
        founderNote: {
            quote: { type: String, default: '' },
            bio: { type: String, default: '' },
            name: { type: String, default: '' },
            designation: { type: String, default: '' },
            image: AboutImageSchema,
        },
        whyUs: {
            type: [
                {
                    title: { type: String, required: true },
                    text: { type: String, required: true },
                    icon: { type: String, default: 'Briefcase' },
                },
            ],
            default: [],
        },
    },
    { timestamps: true }
);

export const AboutPage = mongoose.model<IAboutPage>('AboutPage', AboutPageSchema);
