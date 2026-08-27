
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './layouts/AdminLayout';
import { DashboardView } from './views/dashboard/DashboardView';
import { CmsIndexView } from './views/cms/index/CmsIndexView';
import { CmsHomeView } from './views/cms/home/CmsHomeView';
import { CmsProductsView } from './views/cms/products/CmsProductsView';
import { CmsProjectsView } from './views/cms/projects/CmsProjectsView';
import { CmsCareersView } from './views/cms/careers/CmsCareersView';
import { CmsBlogView } from './views/cms/blog/CmsBlogView';
import CmsSettingsView from './views/cms/settings/CmsSettingsView';
import CmsFranchiseView from './views/cms/franchise/CmsFranchiseView';
import { LeadsView } from './views/leads/LeadsView';
import { LeadDetailView } from './views/leads/LeadDetailView';
import { CmsAnalyticsView } from './views/analytics/CmsAnalyticsView';
import { ProfileView } from './views/profile/ProfileView';
import { ProductItemsView } from './views/cms/products/components/ProductItemsView';
import { CmsTeamView } from './views/cms/team/CmsTeamView';
import { CmsResourceView } from './views/cms/resources/CmsResourceView';
import { BlogEditorPage } from './views/cms/blog/components/BlogEditorPage';
import { MediaManagement } from './views/media/MediaManagement';
import { CmsServicesView } from './views/cms/services/CmsServicesView';
import CmsServiceDetailsView from './views/cms/services/CmsServiceDetailsView';
import CmsAboutView from './views/cms/about/CmsAboutPage';

export default function AdminPage() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        {/* Dashboard is the default view */}
        <Route index element={<DashboardView />} />

        {/* Profile */}
        <Route path="profile" element={<ProfileView />} />

        {/* Analytics */}
        <Route path="analytics" element={<CmsAnalyticsView />} />

        {/* Leads and CRM */}
        <Route path="leads" element={<LeadsView />} />
        <Route path="leads/:id" element={<LeadDetailView />} />

        {/* Content Management System (CMS) */}
        <Route path="cms" element={<CmsIndexView />} />
        <Route path="cms/home" element={<CmsHomeView />} />

        <Route path="cms/products" element={<CmsProductsView />} />
        <Route path="cms/products/:slug/items" element={<ProductItemsView />} />

        <Route path="cms/projects" element={<CmsProjectsView />} />
        <Route path="cms/careers" element={<CmsCareersView />} />

        <Route path="cms/blog" element={<CmsBlogView />} />
        <Route path="cms/blog/new" element={<BlogEditorPage />} />
        <Route path="cms/blog/edit/:id" element={<BlogEditorPage />} />

        <Route path="cms/franchise" element={<CmsFranchiseView />} />

        <Route path="cms/resources" element={<CmsResourceView />} />
        <Route path="cms/settings" element={<CmsSettingsView />} />
        <Route path="cms/about" element={<CmsAboutView />} />
        <Route path="cms/services" element={<CmsServicesView />} />
        <Route path="cms/service-details" element={<CmsServiceDetailsView />} />

        {/* Placeholders for future views */}
        <Route path="media" element={<MediaManagement />} />

        {/* Catch-all redirect back to dashboard */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}
