/**
 * Bowling Planet — App entry point
 * Nested layout, lazy routes, Helmet for SEO.
 */
/**
 * Bowling Planet — App entry point
 * Nested layout, lazy routes, Helmet for SEO.
 */

import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'


import { GlobalSettingsProvider } from './context/GlobalSettingsContext'
import Layout from './components/Layout'
import { theme } from './theme'
import { AuthProvider } from './context/AuthContext'
import { LeadTrackerProvider } from './context/LeadTrackerContext'
import TopProgressBar from './components/common/TopProgressBar'

const LandingPage = lazy(() => import('./pages/Landing/LandingPage'))
const AboutPage = lazy(() => import('./pages/AboutPage/AboutPage'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage/ProjectsPage'))
const ProjectDetailsPage = lazy(() => import('./pages/ProjectDetailsPage/ProjectDetailsPage'))
const ProductsPage = lazy(() => import('./pages/ProductsPage/ProductsPage'))
const BaseProductDetailsPage = lazy(
  () => import('./pages/BaseProductDetailsPage/BaseProductDetailsPage'),
)
const ProductItemDetailsPage = lazy(
  () => import('./pages/ProductItemDetailsPage/ProductItemDetailsPage'),
)
const FranchisePage = lazy(() => import('./pages/Franchise/FranchisePage'))
const JobsPage = lazy(() => import('./pages/JobsPage/JobsPage'))
const JobDetailsPage = lazy(() => import('./pages/JobDetailsPage/JobDetailsPage'))
const ContactPage = lazy(() => import('./pages/Contact/ContactPage'))
const InsightsPage = lazy(() => import('./pages/InsightsPage/InsightsPage'))
const BlogDetailsPage = lazy(() => import('./pages/BlogDetailsPage/BlogDetailsPage'))
const ServicesPage = lazy(() => import('./pages/ServicesPage/ServicesPage'))
const DynamicServicePage = lazy(() => import('./pages/ServicesPage/DynamicServicePage'))
import LoginPage from './pages/Auth/LoginPage'
import SignupPage from './pages/Auth/SignupPage'
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage'
const AdminPage = lazy(() => import('./pages/admin/AdminPage'))
import { AdminGuard } from './pages/admin/AdminGuard'
import { ToastProvider } from './pages/admin/components/Toast'

function RouteFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight: '40vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.colors.text2,
        padding: 48,
      }}
    >
      Loading…
    </div>
  )
}

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <GlobalSettingsProvider>
          <BrowserRouter>
            <TopProgressBar />
            <LeadTrackerProvider>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<LandingPage />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="projects" element={<ProjectsPage />} />
                    <Route path="projects/:slug" element={<ProjectDetailsPage />} />
                    <Route path="products" element={<ProductsPage />} />
                    <Route
                      path="products/:baseSlug/:itemSlug"
                      element={<ProductItemDetailsPage />}
                    />
                    <Route path="products/:slug" element={<BaseProductDetailsPage />} />
                    <Route path="/franchise" element={<FranchisePage />} />
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/services/:slug" element={<DynamicServicePage />} />
                    <Route path="/careers" element={<JobsPage />} />
                    <Route path="careers/:slug" element={<JobDetailsPage />} />
                    <Route path="contact" element={<ContactPage />} />
                    <Route path="blog" element={<InsightsPage />} />
                    <Route path="blog/:slug" element={<BlogDetailsPage />} />
                  </Route>

                  <Route path="login" element={<LoginPage />} />
                  <Route path="signup" element={<SignupPage />} />
                  <Route path="forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="admin/*" element={
                    <AdminGuard>
                      <ToastProvider>
                        <AdminPage />
                      </ToastProvider>
                    </AdminGuard>
                  } />
                </Routes>
              </Suspense>
            </LeadTrackerProvider>
          </BrowserRouter>
        </GlobalSettingsProvider>
      </AuthProvider>
    </HelmetProvider>
  )
}
