import type { FC } from 'react'
import SEO from '../../components/SEO'
import BlogsColumn from './components/BlogsColumn'
import ResourcesColumn from './components/ResourcesColumn'

const InsightsPage: FC = () => {
  return (
    <div className="insights-catalogue min-h-[60vh] bg-black text-[#F5F5F7]">
      <SEO 
        title="Insights & Resources" 
        description="Practical notes, blogs, and downloadable tools for FEC operators, investors, and destination partners."
      />

      {/* Hero */}
      <header className="relative overflow-hidden border-b border-white/[0.08]">
        <div className="absolute inset-0">
          <img
            src="https://www.esearchadvisors.com/blog/wp-content/uploads/2018/12/Blog-banner.jpg"
            alt=""
            aria-hidden
            className="h-full w-full object-cover object-center" 
          />
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{
              background:
                'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0.98) 100%), radial-gradient(ellipse 80% 60% at 70% 40%, rgba(95,193,209,0.15), transparent 60%)',
            }}
          />
        </div>

        <div className="relative z-[1] mx-auto max-w-[1280px] px-5 pb-8 pt-32 sm:px-7 sm:pb-10 sm:pt-36">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5FC1D1]">
                Resources
              </p>
              <h1 className="font-display text-[clamp(1.5rem,3vw,2rem)] font-extrabold tracking-[-0.02em] text-[#F5F5F7]">
                Blogs & Resources
              </h1>
            </div>
            <p className="text-sm leading-relaxed text-[#A1A1A6] max-w-[400px] text-right">
              Practical notes and downloadable tools for FEC operators, investors and destination partners.
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] px-5 pb-16 pt-8 sm:px-7">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <BlogsColumn />
          <ResourcesColumn />
        </div>
      </div>
    </div>
  )
}

export default InsightsPage