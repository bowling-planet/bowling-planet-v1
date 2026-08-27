import { apiClient } from './apiClient';

export interface HomePageData {
  _id?: string;
  hero: {
    eyebrow: string;
    headingPrefix: string;
    subheadline: string;
    rotatingActivities: string[];
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
    projectIds: any[]; // Depending on if it's populated or just IDs
  };
  productCategories?: {
    _id?: string;
    title: string;
    desc: string;
    icon: string;
    count: string;
    color: string;
    image?: { url: string; public_id: string };
  }[];
  services?: {
    _id?: string;
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
  caseStudies?: {
    _id?: string;
    client: string;
    challenge: string;
    solution: string;
    result: string;
    metric: string;
    image?: { url: string; public_id: string };
  }[];
  equipmentTags?: string[];
}

export const homePageApi = {
  getHomePageData: async (): Promise<HomePageData> => {
    const res = await apiClient('/homepage', { method: 'GET' });
    return res.data;
  },
  
  updateHomePageData: async (
    data: Partial<HomePageData>,
    files?: { [key: string]: File }
  ): Promise<{ success: boolean; data: HomePageData }> => {
    const formData = new FormData();
    
    // Append standard JSON fields
    if (data.hero) formData.append('hero', JSON.stringify(data.hero));
    if (data.stats) formData.append('stats', JSON.stringify(data.stats));
    if (data.trustedBrands) formData.append('trustedBrands', JSON.stringify(data.trustedBrands));
    if (data.featuredProjects) formData.append('featuredProjects', JSON.stringify(data.featuredProjects));
    if (data.productCategories) formData.append('productCategories', JSON.stringify(data.productCategories));
    if (data.equipmentTags) formData.append('equipmentTags', JSON.stringify(data.equipmentTags));
    
    // Arrays for which we might have files
    if (data.services) formData.append('services', JSON.stringify(data.services));
    if (data.caseStudies) formData.append('caseStudies', JSON.stringify(data.caseStudies));

    // Append files
    if (files) {
      Object.entries(files).forEach(([key, file]) => {
        formData.append(key, file);
      });
    }

    const res = await apiClient('/homepage', {
      method: 'PUT',
      headers: { 'Content-Type': undefined as any },
      body: formData,
    });
    return res;
  }
};
