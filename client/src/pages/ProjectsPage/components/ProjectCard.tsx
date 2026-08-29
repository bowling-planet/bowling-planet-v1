import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import MediaItem from '../../../components/common/MediaItem'
import type { IProject } from '../types'
import { Plus, Check, ArrowUpRight, Building2 } from 'lucide-react'
import { useLeadTracker } from '../../../context/LeadTrackerContext'

interface ProjectCardProps {
  project: IProject
}

function truncate(text: string, max = 90): string {
  if (text.length <= max) return text
  return `${text.slice(0, max).trimEnd()}…`
}

const ProjectCard: FC<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate()
  const { state, addToEnquiry } = useLeadTracker()
  const projectId = project._id || project.slug
  const isAdded = state.enquiryCart.some((i) => i.id === projectId)
  const thumb = project.media?.[0]

  const goToDetails = () => navigate(`/projects/${project.slug}`)

  return (
    <article
      id={`project-${project.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-[#111118] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#5FC1D1]/45 hover:shadow-[0_12px_40px_rgba(95,193,209,0.1)]"
    >
      <button
        type="button"
        onClick={goToDetails}
        className="relative block aspect-[16/9] w-full cursor-pointer overflow-hidden bg-[#0A0A0F] text-left"
        aria-label={`View ${project.title}`}
      >
        {thumb ? (
          <MediaItem
            media={thumb}
            alt={project.title}
            className="transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="h-full w-full bg-[#1A1A24]" aria-hidden="true" />
        )}
        {/* Removed vignette effect per user request */}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#5FC1D1] backdrop-blur-sm">
          <Building2 size={11} />
          Project
        </span>
        <span className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/50 text-[#F5F5F7] backdrop-blur-sm transition-colors group-hover:border-[#5FC1D1]/50 group-hover:text-[#5FC1D1]">
          <ArrowUpRight size={14} />
        </span>
      </button>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        {project.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {project.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-[#A1A1A6]"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <button type="button" onClick={goToDetails} className="cursor-pointer text-left">
          <h3 className="font-display text-base font-bold leading-snug text-[#F5F5F7] transition-colors group-hover:text-[#5FC1D1]">
            {project.title}
          </h3>
          {project.description ? (
            <p className="mt-1.5 text-sm leading-relaxed text-[#A1A1A6]">
              {truncate(project.description)}
            </p>
          ) : null}
        </button>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/[0.06] pt-3">
          <button
            type="button"
            onClick={goToDetails}
            className="cursor-pointer text-sm font-semibold text-[#5FC1D1] hover:underline"
          >
            View project →
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              addToEnquiry({ id: projectId, type: 'project', title: project.title })
            }}
            className={`inline-flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              isAdded
                ? 'border-[#6DBD4E]/45 bg-[#6DBD4E]/10 text-[#6DBD4E]'
                : 'border-white/15 text-[#F5F5F7] hover:border-[#5FC1D1]/45 hover:text-[#5FC1D1]'
            }`}
          >
            {isAdded ? <Check size={12} /> : <Plus size={12} />}
            {isAdded ? 'Added' : 'Enquire'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default ProjectCard
