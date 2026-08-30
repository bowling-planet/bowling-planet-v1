import { type FC, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import SEO from '../../components/SEO'
import ErrorState from '../../components/common/ErrorState'
import JobFilters, { type JobFilterState } from './components/JobFilters'
import JobGrid from './components/JobGrid'
import Pagination from './components/Pagination'
import {
  getAllJobs,
} from './services/jobsApi'

const DEFAULT_FILTERS: JobFilterState = {
  search: '',
  jobType: '',
  workMode: '',
  experience: '',
  department: '',
  tags: [],
  sort: 'newest',
}

const JobsPage: FC = () => {
  const [filters, setFilters] = useState<JobFilterState>(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)

  const { data, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['public-jobs-page', page, filters],
    queryFn: async () => {
      return await getAllJobs({
        status: 'open', page, limit: 10,
        search: filters.search || undefined,
        jobType: filters.jobType || undefined,
        workMode: filters.workMode || undefined,
        experience: filters.experience || undefined,
        department: filters.department || undefined,
        tags: filters.tags.length ? filters.tags : undefined,
        sort: filters.sort,
      })
    },
    staleTime: 5 * 60 * 1000,
  })

  // We can fetch filters separately or derive them from data just like the previous code
  const { data: allData } = useQuery({
    queryKey: ['public-jobs-page-all'],
    queryFn: async () => {
      return await getAllJobs({ status: 'open', page: 1, limit: 100 })
    },
    staleTime: 5 * 60 * 1000,
  })

  const availableDepartments = Array.from(new Set(allData?.jobs.map((j) => j.department).filter((d): d is string => Boolean(d)) || [])).sort()
  const availableTags = Array.from(new Set(allData?.jobs.flatMap((j) => j.tags || []) || [])).sort()

  const jobs = data?.jobs || []
  const pagination = data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 }

  return (
    <div className="jobs-catalogue min-h-[60vh] bg-black text-[#F5F5F7]">
      <SEO
        title="Careers & Jobs"
        description="Join Bowling Planet and build India's best entertainment destinations. Explore our open roles."
      />

      {/* Hero — futuristic digital studio backdrop */}
      <header className="relative overflow-hidden border-b border-white/[0.08]">
        <div className="absolute inset-0">
          <img
            src="https://t4.ftcdn.net/jpg/04/63/64/49/360_F_463644972_o0GOJQ7qnIk85UXnQHYPrqwjOE7JbSa6.jpg"
            alt=""
            aria-hidden
            className="h-full w-full object-cover object-[center_40%]"
          />
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{
              background:
                'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.85) 55%, rgba(0,0,0,0.98) 100%), radial-gradient(ellipse 95% 75% at 70% 35%, rgba(95,193,209,0.15), transparent 75%)',
            }}
          />
        </div>

        <div className="relative z-[1] mx-auto max-w-[1280px] px-5 pb-8 pt-32 sm:px-7 sm:pb-10 sm:pt-36">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5FC1D1]">
                Opportunities
              </p>
              <h1 className="font-display text-[clamp(1.5rem,3vw,2rem)] font-extrabold tracking-[-0.02em] text-[#F5F5F7]">
                Careers
              </h1>
            </div>
            {!loading && !error ? (
              <p className="text-sm text-[#A1A1A6]">
                {pagination.total} {pagination.total === 1 ? 'position' : 'positions'}
              </p>
            ) : null}
          </div>

          <JobFilters
            value={filters}
            availableDepartments={availableDepartments}
            availableTags={availableTags}
            onChange={(next) => { setFilters(next); setPage(1) }}
          />
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] px-5 pb-16 pt-8 sm:px-7">
        {error ? (
          <ErrorState message="Unable to load jobs." onRetry={() => void refetch()} />
        ) : (
          <>
            <JobGrid jobs={jobs} loading={loading} />
            {!loading ? <Pagination meta={pagination} onPageChange={setPage} /> : null}
          </>
        )}
      </div>
    </div>
  )
}

export default JobsPage