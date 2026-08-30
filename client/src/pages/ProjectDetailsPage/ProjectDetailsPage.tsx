import { type FC, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import SEO from '../../components/SEO'
import { Link, useParams } from 'react-router-dom'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import ProjectHero from './components/ProjectHero'
import ProjectGallery from './components/ProjectGallery'
import FeaturePointsList from './components/FeaturePointsList'
import BulletListSection from './components/BulletListSection'
import SetupStepsTimeline from './components/SetupStepsTimeline'
import TestimonialsCarousel from './components/TestimonialsCarousel'

import { getProjectBySlug } from './services/projectDetailsApi'
import { Building2, Plus, Check } from 'lucide-react'
import { useLeadTracker } from '../../context/LeadTrackerContext'
import { getOptimizedImageUrl } from '../../utils/imageUtils'

const ProjectDetailsPage: FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const { state, addToEnquiry } = useLeadTracker()
  const [activeSection, setActiveSection] = useState('features')

  const { data: project, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['public-project-details', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Project not found.')
      return await getProjectBySlug(slug)
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  })

  const navItems = useMemo(() => {
    if (!project) return []
    const items: { id: string; label: string }[] = []
    if (project.media && project.media.length > 0) {
      items.push({ id: 'gallery', label: 'Gallery' })
    }
    if (project.featurePoints && project.featurePoints.length > 0) {
      items.push({ id: 'features', label: 'Features' })
    }
    if (project.setupSteps && project.setupSteps.length > 0) {
      items.push({ id: 'steps', label: 'Steps' })
    }
    if (project.testimonials && project.testimonials.length > 0) {
      items.push({ id: 'testimonials', label: 'Testimonials' })
    }
    if (project.bulletList && project.bulletList.length > 0) {
      items.push({ id: 'highlights', label: 'Highlights' })
    }
    return items
  }, [project])

  useEffect(() => {
    if (navItems.length === 0) return
    setActiveSection(navItems[0].id)

    const observers: IntersectionObserver[] = []
    navItems.forEach((item) => {
      const el = document.getElementById(item.id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(item.id)
        },
        { rootMargin: '-30% 0px -55% 0px', threshold: 0 },
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [navItems, project])

  if (loading) {
    return (
      <div className="project-details-page flex min-h-[60vh] items-center justify-center bg-black px-5 pt-28">
        <Loader label="Loading project…" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="project-details-page flex min-h-[60vh] items-center justify-center bg-black px-5 pt-28">
        <div className="mx-auto max-w-xl text-center">
          {error ? (
            <ErrorState message={error instanceof Error ? error.message : 'Unable to load this project.'} onRetry={() => void refetch()} />
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-[#F5F5F7]">Project not found</h1>
              <p className="mt-2 text-[#A1A1A6]">This project is unavailable or the link is incorrect.</p>
            </>
          )}
          <Link to="/projects" className="mt-6 inline-block cursor-pointer text-sm text-[#5FC1D1] hover:underline">
            Back to projects
          </Link>
        </div>
      </div>
    )
  }

  const projectId = project._id || project.slug
  const isAdded = state.enquiryCart.some((i) => i.id === projectId)
  const thumb = project.media?.[0]

  return (
    <div className="project-details-page min-h-[60vh] bg-black text-[#F5F5F7]">
      <SEO
        title={`${project.title} | Projects | Bowling Planet`}
        description={project.description || `Explore ${project.title}, a premier family entertainment center and bowling alley project by Bowling Planet.`}
        ogImage={thumb?.url}
      />

      <div className="mx-auto max-w-[1280px] px-5 pb-16 pt-24 sm:px-7 sm:pt-28">
        {/* Compact project header — cover media as backdrop */}
        <div className="relative mb-5 overflow-hidden rounded-2xl border border-[#5FC1D1]/20 p-4 sm:p-5">
          {thumb?.url ? (
            <div className="absolute inset-0">
              <img
                src={getOptimizedImageUrl(thumb.url)}
                alt=""
                aria-hidden
                className="h-full w-full object-cover object-center"
              />
              <div
                className="absolute inset-0 backdrop-blur-sm"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 48%, rgba(0,0,0,0.75) 100%), radial-gradient(ellipse 70% 80% at 15% 50%, rgba(95,193,209,0.15), transparent 55%)',
                }}
              />
            </div>
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(120% 140% at 0% 0%, rgba(95,193,209,0.22) 0%, rgba(95,193,209,0.08) 38%, rgba(109,189,78,0.05) 62%, transparent 100%), linear-gradient(180deg, rgba(17,17,24,0.95) 0%, rgba(10,10,15,0.4) 70%, transparent 100%)',
              }}
            />
          )}

          <div className="relative z-[1] flex w-full flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="min-w-0 w-full sm:flex-1">
              <Link
                to="/projects"
                className="mb-3 inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-[#A1A1A6] transition-colors hover:text-[#5FC1D1]"
              >
                ← All projects
              </Link>

              <div className="min-w-0">
                <p className="mb-0.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5FC1D1]">
                  <Building2 size={12} />
                  Project
                </p>
                <h1 className="font-display text-[clamp(1.35rem,2.8vw,1.85rem)] font-extrabold tracking-[-0.02em] text-[#F5F5F7]">
                  {project.title}
                </h1>
                {project.description ? (
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#A1A1A6] line-clamp-2">
                    {project.description}
                  </p>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              onClick={() => addToEnquiry({ id: projectId, type: 'project', title: project.title })}
              className={`inline-flex w-full sm:w-auto justify-center sm:justify-start cursor-pointer items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-semibold backdrop-blur-md transition-colors ${
                isAdded
                  ? 'border-[#6DBD4E]/45 bg-[#6DBD4E]/10 text-[#6DBD4E]'
                  : 'border-[#5FC1D1]/45 bg-[#5FC1D1]/10 text-[#5FC1D1] hover:bg-[#5FC1D1]/20'
              }`}
            >
              {isAdded ? <Check size={15} /> : <Plus size={15} />}
              {isAdded ? 'In enquiry' : 'Enquire project'}
            </button>
          </div>
        </div>

        {/* Section pills */}
        {navItems.length > 0 ? (
          <div className="mb-6 flex gap-2 overflow-x-auto pb-1 hide-scrollbar" aria-label="Project sections">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setActiveSection(item.id)}
                className={`shrink-0 cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  activeSection === item.id
                    ? 'border-[#5FC1D1] bg-[#5FC1D1]/15 text-[#5FC1D1]'
                    : 'border-white/15 bg-[#111118] text-[#A1A1A6] hover:border-[#5FC1D1]/40 hover:text-[#F5F5F7]'
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
        ) : null}

        {/* Two-column catalogue detail */}
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-10">
          <div className="space-y-4 lg:sticky lg:top-24">
            <ProjectGallery media={project.media} />
            <div className="rounded-2xl border border-white/[0.1] bg-[#111118] p-4">
              <button
                type="button"
                onClick={() => addToEnquiry({ id: projectId, type: 'project', title: project.title })}
                className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-sm font-bold transition-colors ${
                  isAdded
                    ? 'border-[#6DBD4E]/45 bg-[#6DBD4E]/15 text-[#6DBD4E]'
                    : 'border-[#5FC1D1]/50 bg-[#5FC1D1]/15 text-[#5FC1D1] hover:bg-[#5FC1D1]/25'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check size={16} />
                    In enquiry cart
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Add to enquiry
                  </>
                )}
              </button>
              <p className="mt-2.5 text-center text-xs leading-relaxed text-[#636366]">
                We’ll respond with programme options and next steps.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <ProjectHero
              description={project.description}
              tags={project.tags}
            />
            <FeaturePointsList featurePoints={project.featurePoints} />
            <SetupStepsTimeline setupSteps={project.setupSteps} />
            <TestimonialsCarousel testimonials={project.testimonials} />
            <BulletListSection bulletList={project.bulletList} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetailsPage
