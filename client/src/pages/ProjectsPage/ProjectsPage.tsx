import { type FC, useCallback, useEffect, useState } from 'react'
import SEO from '../../components/SEO'
import ErrorState from '../../components/common/ErrorState'
import ProjectFilters, { type ProjectFilterState } from './components/ProjectFilters'
import ProjectGrid from './components/ProjectGrid'
import Pagination from './components/Pagination'
import type { IPaginationMeta, IProject } from './types'
import { getAllProjects } from './services/projectsApi'

const DEFAULT_FILTERS: ProjectFilterState = {
  search: '',
  tags: [],
  sort: 'newest',
}

const ProjectsPage: FC = () => {
  const [filters, setFilters] = useState<ProjectFilterState>(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [projects, setProjects] = useState<IProject[]>([])
  const [pagination, setPagination] = useState<IPaginationMeta>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  })
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAllProjects({
        page,
        limit: 12,
        search: filters.search || undefined,
        tags: filters.tags.length ? filters.tags : undefined,
        sort: filters.sort,
        isPublished: true,
      })
      setProjects(data.projects)
      setPagination(data.pagination)
      const tags = Array.from(new Set(data.projects.flatMap((p) => p.tags))).sort()
      if (tags.length) setAvailableTags((prev) => {
        const merged = Array.from(new Set([...prev, ...tags])).sort()
        return merged
      })
    } catch {
      setError('Unable to load projects.')
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="projects-catalogue min-h-[60vh] bg-black text-[#F5F5F7]">
      <SEO
        title="Our Projects & Installations | Bowling Planet"
        description="Explore the world-class family entertainment centers, bowling alleys, and gaming zones we have built across India."
      />

      {/* Hero — 3D architectural wireframe backdrop */}
      <header className="relative overflow-hidden border-b border-white/[0.08]">
        <div className="absolute inset-0">
          <img
            src="https://www.shutterstock.com/image-photo/banner-group-business-people-meeting-260nw-2527279181.jpg"
            alt=""
            aria-hidden
            className="h-full w-full object-cover object-center"
          />
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{
              background:
                'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.98) 100%), radial-gradient(ellipse 80% 60% at 70% 40%, rgba(95,193,209,0.15), transparent 60%)',
            }}
          />
        </div>

        <div className="relative z-[1] mx-auto max-w-[1280px] px-5 pb-8 pt-24 sm:px-7 sm:pb-10 sm:pt-28">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5FC1D1]">
                Catalogue
              </p>
              <h1 className="font-display text-[clamp(1.5rem,3vw,2rem)] font-extrabold tracking-[-0.02em] text-[#F5F5F7]">
                Project portfolio
              </h1>
            </div>
            {!loading && !error ? (
              <p className="text-sm text-[#A1A1A6]">
                {pagination.total} project{pagination.total === 1 ? '' : 's'}
              </p>
            ) : null}
          </div>

          <ProjectFilters
            value={filters}
            availableTags={availableTags}
            onChange={(next) => {
              setFilters(next)
              setPage(1)
            }}
          />
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] px-5 pb-16 pt-8 sm:px-7">
        {error ? (
          <ErrorState message={error} onRetry={() => void load()} />
        ) : (
          <>
            <ProjectGrid projects={projects} loading={loading} />
            {!loading ? <Pagination meta={pagination} onPageChange={setPage} /> : null}
          </>
        )}
      </div>
    </div>
  )
}

export default ProjectsPage
