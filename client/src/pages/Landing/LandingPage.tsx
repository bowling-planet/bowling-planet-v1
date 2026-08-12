import { type FC } from 'react'
import SEO from '../../components/SEO'
import SectionProgressNav from '../../components/SectionProgressNav'
import { homePageApi } from '../../services/homePageApi'
import { useQuery } from '@tanstack/react-query'

// Sections
import Hero from './components/Hero'
import VideoShowcase from './components/VideoShowcase'
import CredibilityStrip from './components/CredibilityStrip'
import TrustedBrands from './components/TrustedBrands'
import ServicesSection from './components/ServicesSection'
import PortfolioSection from './components/PortfolioSection'
import CaseStudiesSection from './components/CaseStudiesSection'
import ProductsSection from './components/ProductsSection'
import BlogPreviewSection from './components/BlogPreviewSection'
const LandingPage: FC = () => {
  const { data } = useQuery<any>({
    queryKey: ['landing-page'],
    queryFn: async () => {
      const response = await homePageApi.getHomePageData();
      return response;
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="landing-page">
      <SEO
        title="Bowling Planet | Premium FEC Consulting & Equipment"
        description="India's leading FEC consulting firm. From ROI feasibility to grand opening — we design, equip, and operate world-class family entertainment centers."
      />

      <SectionProgressNav />

      {/* 1. Hero (Dark) */}
      <Hero data={data?.hero} />

      {/* 1.5. Credibility Strip (Dark) */}
      <CredibilityStrip data={data?.stats} />

      {/* 2. Video Showcase (Dark) */}
      <VideoShowcase />

      {/* 3. Trusted Brands (Dark) */}
      <TrustedBrands data={data?.trustedBrands} />

      {/* 4. Services (Dark) */}
      <ServicesSection data={data?.services} />

      {/* 6. Portfolio (Dark) */}
      <PortfolioSection data={data?.featuredProjects} />

      {/* 7. Case Studies */}
      <CaseStudiesSection data={data?.caseStudies}/>

      {/* 8. Products (Dark/Surface) */}
      <ProductsSection data={data} />

      {/* 9. Blog Preview (Dark) */}
      <BlogPreviewSection />

      {/* 10. Franchise (Dark) */}
      {/* <FranchiseSection /> */}

      {/* 11. Careers */}
      {/* <CareersSection /> */}
    </div>
  )
}

export default LandingPage
