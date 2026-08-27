import { apiClient } from './apiClient';

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
    icon: string;
}

export interface AboutPageData {
    _id?: string;
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

export const aboutPageApi = {
    getAboutPageData: async (): Promise<{ success: boolean; data: AboutPageData }> => {
        const res = await apiClient('/about-page', {
            method: 'GET',
            headers: { 'x-skip-auth-refresh': 'true' },
        });
        return res;
    },

    // `data` should already have any newly-selected File objects merged into the
    // relevant `image` slots by the caller (see CmsAboutView for the convention:
    // certificationsImage_<idx>, partnersImage_<idx>, galleryImage_<idx>, founderImage)
    updateAboutPageData: async (
        data: AboutPageData,
        files?: Record<string, File>
    ): Promise<{ success: boolean; data: AboutPageData; message?: string }> => {
        const formData = new FormData();

        formData.append('intro', JSON.stringify(data.intro));
        formData.append('certifications', JSON.stringify(data.certifications));
        formData.append('partners', JSON.stringify(data.partners));
        formData.append('gallery', JSON.stringify(data.gallery));
        formData.append('stats', JSON.stringify(data.stats));
        formData.append('visionMission', JSON.stringify(data.visionMission));
        formData.append('journey', JSON.stringify(data.journey));
        formData.append('founderNote', JSON.stringify(data.founderNote));
        formData.append('whyUs', JSON.stringify(data.whyUs));

        if (files) {
            Object.entries(files).forEach(([fieldName, file]) => {
                formData.append(fieldName, file);
            });
        }

        const res = await apiClient('/about-page', {
            method: 'PUT',
            headers: { 'Content-Type': undefined as any },
            body: formData,
        });
        return res;
    },
};
