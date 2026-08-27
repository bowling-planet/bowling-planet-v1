// /**
//  * PortfolioSection — Our Work
//  * Interactive list + preview showcase. Layout stays balanced with any project count.
//  */

// import { type FC, useEffect, useMemo, useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { AnimatePresence, motion } from 'framer-motion'
// import { ArrowRight, ArrowUpRight, MapPin } from 'lucide-react'
// import { useLeadTracker } from '../../../context/LeadTrackerContext'
// import { useReducedMotion } from '../../../hooks/useReducedMotion'
// import { MOCK_PROJECTS } from '../../ProjectsPage/services/mockdata'

// const CATEGORIES = ['All', 'Bowling', 'Softplay', 'Arcade', 'VR'] as const

// const LOCAL_IMAGES = [
//   '/products/Bowling_Lane_Dubai.avif',
//   '/products/Arcade_Games_Calicut.avif',
//   '/products/Softplay_Ahemdabad.avif',
//   '/products/Softplay_New_Delhi.avif',
// ] as const

// const FALLBACK_IMAGE = LOCAL_IMAGES[0]

// const BROKEN_URL_SNIPPETS = [
//   'photo-1561571175-901768826500',
//   'photo-1596558450255-7c0b7be9d56a',
//   'photo-1566442539401-44754a6db240',
//   'photo-1628102491629-778571d893a3',
// ]

// type Category = (typeof CATEGORIES)[number]

// type ProjectCardData = {
//   id: string
//   slug?: string
//   name: string
//   image: string
//   location: string
//   category: Category
//   description?: string
// }

// const categoryFromTags = (tags?: string[], fallback: Category = 'Bowling'): Category => {
//   const joined = (tags || []).join(' ').toLowerCase()
//   if (joined.includes('soft') || joined.includes('kids')) return 'Softplay'
//   if (joined.includes('arcade') || joined.includes('redemption')) return 'Arcade'
//   if (joined.includes('vr') || joined.includes('immersive')) return 'VR'
//   if (joined.includes('bowl') || joined.includes('duckpin') || joined.includes('lane')) return 'Bowling'
//   return fallback
// }

// const resolveImage = (url: string | undefined, index: number): string => {
//   if (!url || !url.trim()) return LOCAL_IMAGES[index % LOCAL_IMAGES.length]
//   if (BROKEN_URL_SNIPPETS.some((s) => url.includes(s))) {
//     return LOCAL_IMAGES[index % LOCAL_IMAGES.length]
//   }
//   // Prefer local product assets when already pointing at them
//   if (url.startsWith('/products/')) return url
//   return url
// }

// const DEFAULT_PROJECTS: ProjectCardData[] = MOCK_PROJECTS.slice(0, 6).map((p, i) => ({
//   id: p._id || p.slug || String(i),
//   slug: p.slug,
//   name: p.title || '',
//   // Always use reliable local assets for mock showcase (avoids dead Unsplash URLs)
//   image: LOCAL_IMAGES[i % LOCAL_IMAGES.length],
//   location: ['Dubai', 'Delhi', 'Ahmedabad', 'Calicut', 'Mumbai', 'Surat'][i % 6],
//   category: categoryFromTags(p.tags as string[] | undefined, (['Bowling', 'Softplay', 'Arcade', 'VR', 'Bowling', 'Softplay'] as Category[])[i % 6]),
//   description: p.description,
// }))

// const ProjectImage: FC<{ src: string; alt: string; className?: string }> = ({
//   src,
//   alt,
//   className,
// }) => {
//   const [current, setCurrent] = useState(src)

//   useEffect(() => {
//     setCurrent(src)
//   }, [src])

//   return (
//     <img
//       src={current}
//       alt={alt}
//       loading="lazy"
//       decoding="async"
//       className={className}
//       onError={() => {
//         if (current !== FALLBACK_IMAGE) setCurrent(FALLBACK_IMAGE)
//       }}
//     />
//   )
// }

// const PortfolioSection: FC<{ data?: { projectIds: any[] } }> = ({ data }) => {
//   const { logCTAEvent } = useLeadTracker()
//   const navigate = useNavigate()
//   const reduced = useReducedMotion()
//   const [activeFilter, setActiveFilter] = useState<Category>('All')
//   const [activeId, setActiveId] = useState<string>('')
//   const [paused, setPaused] = useState(false)

//   const projects = useMemo(() => {
//     if (data?.projectIds?.length) {
//       return data.projectIds.map((p, i) => ({
//         id: String(p._id || p.id || i),
//         slug: p.slug,
//         name: p.title || p.name || 'Untitled project',
//         image: resolveImage(p.media?.[0]?.url || p.image, i),
//         location: p.location || p.city || ['Dubai', 'Delhi', 'Ahmedabad', 'Calicut'][i % 4],
//         category: categoryFromTags(
//           p.tags,
//           (['Bowling', 'Softplay', 'Arcade', 'VR'] as Category[])[i % 4],
//         ),
//         description: p.description,
//       })) as ProjectCardData[]
//     }
//     return DEFAULT_PROJECTS
//   }, [data])

//   const filtered =
//     activeFilter === 'All' ? projects : projects.filter((p) => p.category === activeFilter)

//   // Keep selection valid when filter changes
//   useEffect(() => {
//     if (!filtered.length) {
//       setActiveId('')
//       return
//     }
//     if (!filtered.some((p) => p.id === activeId)) {
//       setActiveId(filtered[0].id)
//     }
//   }, [filtered, activeId])

//   const active = filtered.find((p) => p.id === activeId) || filtered[0]

//   // Gentle autoplay through the list
//   useEffect(() => {
//     if (reduced || paused || filtered.length < 2) return
//     const timer = setInterval(() => {
//       setActiveId((prev) => {
//         const idx = filtered.findIndex((p) => p.id === prev)
//         const next = filtered[(idx + 1) % filtered.length]
//         return next.id
//       })
//     }, 4200)
//     return () => clearInterval(timer)
//   }, [filtered, paused, reduced])

//   const openProject = (project: ProjectCardData) => {
//     const href = project.slug ? `/projects/${project.slug}` : '/projects'
//     navigate(href)
//   }

//   return (
//     <section id="portfolio" className="relative overflow-hidden bg-black px-4 py-10 sm:px-6 sm:py-12">
//       <div className="orb orb-green pointer-events-none absolute right-[-8%] top-[5%] h-[420px] w-[420px] opacity-20" />
//       <div aria-hidden="true" className="grid-bg pointer-events-none absolute inset-0 opacity-20" />

//       <div className="relative z-[1] mx-auto max-w-[1100px]">
//         <div className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
//           <div>
//             <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5FC1D1]">
//               Prestigious projects
//             </p>
//             <h2 className="font-display landing-section-heading text-[clamp(1.75rem,3.5vw,2.75rem)]">
//               Our Work
//             </h2>
//           </div>
//           <Link
//             to="/projects"
//             onClick={() => logCTAEvent('Landing: View All Projects')}
//             className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-[#F5F5F7] transition-colors hover:border-[#5FC1D1]/45 hover:text-[#5FC1D1]"
//           >
//             View all <ArrowRight size={14} />
//           </Link>
//         </div>

//         <div
//           className="mb-5 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
//           aria-label="Filter projects"
//         >
//           {CATEGORIES.map((cat) => {
//             const isActive = activeFilter === cat
//             return (
//               <button
//                 key={cat}
//                 type="button"
//                 onClick={() => setActiveFilter(cat)}
//                 className={`shrink-0 cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
//                   isActive
//                     ? 'border-[#5FC1D1] bg-[#5FC1D1]/15 text-[#5FC1D1]'
//                     : 'border-white/15 bg-[#111118] text-[#A1A1A6] hover:border-[#5FC1D1]/40 hover:text-[#F5F5F7]'
//                 }`}
//               >
//                 {cat}
//               </button>
//             )
//           })}
//         </div>

//         {filtered.length === 0 || !active ? (
//           <p className="py-10 text-center text-sm text-[#86868B]">No projects in this category yet.</p>
//         ) : (
//           <div
//             className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)] lg:gap-5"
//             onMouseEnter={() => setPaused(true)}
//             onMouseLeave={() => setPaused(false)}
//           >
//             {/* Project list */}
//             <div
//               className="flex max-h-[420px] flex-col gap-2 overflow-y-auto pr-1 lg:max-h-[480px]"
//               role="listbox"
//               aria-label="Projects"
//             >
//               <AnimatePresence mode="popLayout">
//                 {filtered.map((project, i) => {
//                   const isActive = project.id === active.id
//                   return (
//                     <motion.button
//                       key={project.id}
//                       type="button"
//                       role="option"
//                       aria-selected={isActive}
//                       layout={!reduced}
//                       initial={reduced ? false : { opacity: 0, y: 8 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       exit={{ opacity: 0, y: -6 }}
//                       transition={{ duration: 0.25, delay: reduced ? 0 : Math.min(i * 0.04, 0.2) }}
//                       onMouseEnter={() => setActiveId(project.id)}
//                       onFocus={() => setActiveId(project.id)}
//                       onClick={() => {
//                         setActiveId(project.id)
//                         openProject(project)
//                       }}
//                       className="group relative flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border px-3.5 py-3 text-left transition-colors duration-300"
//                       style={{
//                         borderColor: isActive ? 'rgba(95,193,209,0.45)' : 'rgba(255,255,255,0.1)',
//                         background: isActive ? 'rgba(95,193,209,0.1)' : 'rgba(17,17,24,0.9)',
//                       }}
//                     >
//                       <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#0A0A0F]">
//                         <ProjectImage
//                           src={project.image}
//                           alt=""
//                           className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
//                         />
//                       </div>
//                       <div className="min-w-0 flex-1">
//                         <div className="mb-1 flex items-center gap-2">
//                           <span className="font-[family-name:var(--font-data)] text-[11px] font-bold tracking-wider text-[#5FC1D1]/80">
//                             {String(i + 1).padStart(2, '0')}
//                           </span>
//                           <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#A1A1A6]">
//                             {project.category}
//                           </span>
//                         </div>
//                         <h3
//                           className={`truncate text-[15px] font-bold leading-snug transition-colors ${
//                             isActive ? 'text-[#5FC1D1]' : 'text-[#F5F5F7] group-hover:text-[#5FC1D1]'
//                           }`}
//                         >
//                           {project.name}
//                         </h3>
//                         <p className="mt-0.5 flex items-center gap-1 text-xs text-[#86868B]">
//                           <MapPin size={11} />
//                           {project.location}
//                         </p>
//                       </div>
//                       <ArrowUpRight
//                         size={16}
//                         className={`shrink-0 transition-all duration-300 ${
//                           isActive
//                             ? 'text-[#5FC1D1] translate-x-0 opacity-100'
//                             : 'translate-x-1 text-white/30 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
//                         }`}
//                       />
//                       {isActive && (
//                         <motion.span
//                           layoutId={reduced ? undefined : 'portfolio-active-bar'}
//                           className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#5FC1D1]"
//                         />
//                       )}
//                     </motion.button>
//                   )
//                 })}
//               </AnimatePresence>
//             </div>

//             {/* Preview stage */}
//             <div className="relative min-h-[280px] overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0F] sm:min-h-[340px] lg:min-h-[480px]">
//               <AnimatePresence mode="wait">
//                 <motion.div
//                   key={active.id}
//                   initial={reduced ? false : { opacity: 0, scale: 1.02 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   exit={{ opacity: 0, scale: 0.99 }}
//                   transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
//                   className="absolute inset-0"
//                 >
//                   <ProjectImage
//                     src={active.image}
//                     alt={active.name}
//                     className="h-full w-full object-cover"
//                   />
//                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
//                   <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
//                     <div className="mb-3 flex flex-wrap gap-2">
//                       <span className="rounded-full border border-[#5FC1D1]/40 bg-[#5FC1D1]/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#5FC1D1]">
//                         {active.category}
//                       </span>
//                       <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[11px] font-medium text-[#E8E8ED] backdrop-blur-sm">
//                         <MapPin size={11} />
//                         {active.location}
//                       </span>
//                     </div>
//                     <h3 className="font-display mb-2 text-[clamp(1.35rem,2.5vw,2rem)] font-bold leading-tight text-[#F5F5F7]">
//                       {active.name}
//                     </h3>
//                     {active.description && (
//                       <p className="mb-4 line-clamp-2 max-w-xl text-sm leading-relaxed text-white/70">
//                         {active.description}
//                       </p>
//                     )}
//                     <button
//                       type="button"
//                       onClick={() => {
//                         logCTAEvent(`Portfolio: ${active.name}`)
//                         openProject(active)
//                       }}
//                       className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#5FC1D1] px-4 py-2.5 text-sm font-bold text-black transition-transform hover:scale-[1.02]"
//                     >
//                       View project <ArrowRight size={14} />
//                     </button>
//                   </div>
//                 </motion.div>
//               </AnimatePresence>
//             </div>
//           </div>
//         )}
//       </div>
//     </section>
//   )
// }

// export default PortfolioSection



/**
 * PortfolioSection — Our Work
 * Interactive list + preview showcase. Layout stays balanced with any project count.
 */

import { type FC, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useLeadTracker } from '../../../context/LeadTrackerContext'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { getAllProjects, type IProjectSummary } from '../services'



const LOCAL_IMAGES = [
  '/products/Bowling_Lane_Dubai.avif',
  '/products/Arcade_Games_Calicut.avif',
  '/products/Softplay_Ahemdabad.avif',
  '/products/Softplay_New_Delhi.avif',
] as const

const FALLBACK_IMAGE = LOCAL_IMAGES[0]

const BROKEN_URL_SNIPPETS = [
  'photo-1561571175-901768826500',
  'photo-1596558450255-7c0b7be9d56a',
  'photo-1566442539401-44754a6db240',
  'photo-1628102491629-778571d893a3',
]



type ProjectCardData = {
  id: string
  slug?: string
  name: string
  image: string
  year: string
  description?: string
}



const resolveImage = (url: string | undefined, index: number): string => {
  if (!url || !url.trim()) return LOCAL_IMAGES[index % LOCAL_IMAGES.length]
  if (BROKEN_URL_SNIPPETS.some((s) => url.includes(s))) {
    return LOCAL_IMAGES[index % LOCAL_IMAGES.length]
  }
  // Prefer local product assets when already pointing at them
  if (url.startsWith('/products/')) return url
  return url
}

// Map a raw IProjectSummary (from the API) into the shape this section renders
const mapProjectToCard = (p: IProjectSummary, i: number): ProjectCardData => ({
  id: p._id,
  slug: p.slug,
  name: p.title,
  image: resolveImage(p.media?.[0]?.url, i),
  year: p.createdAt ? new Date(p.createdAt).getFullYear().toString() : new Date().getFullYear().toString(),
  description: p.description,
})

const ProjectImage: FC<{ src: string; alt: string; className?: string }> = ({
  src,
  alt,
  className,
}) => {
  const [current, setCurrent] = useState(src)

  useEffect(() => {
    setCurrent(src)
  }, [src])

  return (
    <img
      src={current}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      onError={() => {
        if (current !== FALLBACK_IMAGE) setCurrent(FALLBACK_IMAGE)
      }}
    />
  )
}

const PortfolioSection: FC<{ data?: { projectIds: any[] } }> = ({ data }) => {
  const { logCTAEvent } = useLeadTracker()
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const [activeId, setActiveId] = useState<string>('')
  const [paused, setPaused] = useState(false)

  const [fetchedProjects, setFetchedProjects] = useState<ProjectCardData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (data && Array.isArray(data.projectIds)) {
      setIsLoading(false)
      return
    }

    let isMounted = true

    const loadProjects = async () => {
      try {
        setIsLoading(true)
        setHasError(false)
        const res = await getAllProjects({ page: 1, limit: 4 })
        if (!isMounted) return
        setFetchedProjects(res.projects.map(mapProjectToCard))
      } catch {
        if (!isMounted) return
        setHasError(true)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadProjects()

    return () => {
      isMounted = false
    }
  }, [data])

  const projects = useMemo(() => {
    if (data && Array.isArray(data.projectIds)) {
      return data.projectIds.map((p, i) => ({
        id: String(p._id || p.id || i),
        slug: p.slug,
        name: p.title || p.name || 'Untitled project',
        image: resolveImage(p.media?.[0]?.url || p.image, i),
        year: p.createdAt ? new Date(p.createdAt).getFullYear().toString() : new Date().getFullYear().toString(),
        description: p.description,
      })) as ProjectCardData[]
    }
    return fetchedProjects
  }, [data, fetchedProjects])

  const filtered = projects

  // Keep selection valid when filter changes
  useEffect(() => {
    if (!filtered.length) {
      setActiveId('')
      return
    }
    if (!filtered.some((p) => p.id === activeId)) {
      setActiveId(filtered[0].id)
    }
  }, [filtered, activeId])

  const active = filtered.find((p) => p.id === activeId) || filtered[0]

  // Gentle autoplay through the list
  useEffect(() => {
    if (reduced || paused || filtered.length < 2) return
    const timer = setInterval(() => {
      setActiveId((prev) => {
        const idx = filtered.findIndex((p) => p.id === prev)
        const next = filtered[(idx + 1) % filtered.length]
        return next.id
      })
    }, 4200)
    return () => clearInterval(timer)
  }, [filtered, paused, reduced])

  const openProject = (project: ProjectCardData) => {
    const href = project.slug ? `/projects/${project.slug}` : '/projects'
    navigate(href)
  }

  return (
    <section id="portfolio" className="relative overflow-hidden bg-black px-4 py-10 sm:px-6 sm:py-12">
      <div className="orb orb-green pointer-events-none absolute right-[-8%] top-[5%] h-[420px] w-[420px] opacity-20" />
      <div aria-hidden="true" className="grid-bg pointer-events-none absolute inset-0 opacity-20" />

      <div className="relative z-[1] mx-auto max-w-[1100px]">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5FC1D1]">
              Prestigious projects
            </p>
            <h2 className="font-display landing-section-heading text-[clamp(1.75rem,3.5vw,2.75rem)]">
              Our Work
            </h2>
          </div>
          <Link
            to="/projects"
            onClick={() => logCTAEvent('Landing: View All Projects')}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-[#F5F5F7] transition-colors hover:border-[#5FC1D1]/45 hover:text-[#5FC1D1]"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>


        {isLoading ? (
          <p className="py-10 text-center text-sm text-[#86868B]">Loading projects…</p>
        ) : hasError ? (
          <p className="py-10 text-center text-sm text-[#86868B]">
            Couldn&apos;t load projects right now. Please try again later.
          </p>
        ) : filtered.length === 0 || !active ? (
          <p className="py-10 text-center text-sm text-[#86868B]">No projects in this category yet.</p>
        ) : (
          <>
            {/* Mobile View: Horizontal Carousel */}
            <div className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory lg:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {filtered.map((project) => (
                <div
                  key={project.id}
                  className="relative flex-shrink-0 w-[85vw] sm:w-[320px] min-h-[360px] overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0F] snap-center"
                >
                  <ProjectImage
                    src={project.image}
                    alt={project.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />

                  <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end">

                    <h3 className="font-display mb-2 text-2xl font-bold leading-tight text-[#F5F5F7]">
                      {project.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        logCTAEvent(`Portfolio Mobile: ${project.name}`)
                        openProject(project)
                      }}
                      className="mt-3 inline-flex w-fit cursor-pointer items-center gap-2 rounded-full bg-[#5FC1D1] px-4 py-2.5 text-xs font-bold text-black transition-transform hover:scale-[1.02]"
                    >
                      View project <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Interactive List + Preview */}
            <div
              className="hidden lg:grid grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)] gap-5"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              {/* Project list */}
              <div
                className="flex max-h-[480px] flex-col gap-2 overflow-y-auto pr-1"
                role="listbox"
                aria-label="Projects"
              >
                <AnimatePresence mode="popLayout">
                  {filtered.map((project, i) => {
                    const isActive = project.id === active.id
                    return (
                      <motion.button
                        key={project.id}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        layout={!reduced}
                        initial={reduced ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.25, delay: reduced ? 0 : Math.min(i * 0.04, 0.2) }}
                        onMouseEnter={() => setActiveId(project.id)}
                        onFocus={() => setActiveId(project.id)}
                        onClick={() => {
                          setActiveId(project.id)
                          openProject(project)
                        }}
                        className="group relative flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border px-3.5 py-3 text-left transition-colors duration-300"
                        style={{
                          borderColor: isActive ? 'rgba(95,193,209,0.45)' : 'rgba(255,255,255,0.1)',
                          background: isActive ? 'rgba(95,193,209,0.1)' : 'rgba(17,17,24,0.9)',
                        }}
                      >
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#0A0A0F]">
                          <ProjectImage
                            src={project.image}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="font-[family-name:var(--font-data)] text-[11px] font-bold tracking-wider text-[#5FC1D1]/80">
                              {String(i + 1).padStart(2, '0')}
                            </span>

                          </div>
                          <h3
                            className={`truncate text-[15px] font-bold leading-snug transition-colors ${isActive ? 'text-[#5FC1D1]' : 'text-[#F5F5F7] group-hover:text-[#5FC1D1]'
                              }`}
                          >
                            {project.name}
                          </h3>
                        </div>
                        <ArrowUpRight
                          size={16}
                          className={`shrink-0 transition-all duration-300 ${isActive
                            ? 'text-[#5FC1D1] translate-x-0 opacity-100'
                            : 'translate-x-1 text-white/30 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                            }`}
                        />
                        {isActive && (
                          <motion.span
                            layoutId={reduced ? undefined : 'portfolio-active-bar'}
                            className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#5FC1D1]"
                          />
                        )}
                      </motion.button>
                    )
                  })}
                </AnimatePresence>
              </div>

              {/* Preview stage */}
              <div className="relative min-h-[480px] overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0F]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active.id}
                    initial={reduced ? false : { opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.99 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0"
                  >
                    <ProjectImage
                      src={active.image}
                      alt={active.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-7">

                      <h3 className="font-display mb-2 text-[clamp(1.35rem,2.5vw,2rem)] font-bold leading-tight text-[#F5F5F7]">
                        {active.name}
                      </h3>
                      {active.description && (
                        <p className="mb-4 line-clamp-2 max-w-xl text-sm leading-relaxed text-white/70">
                          {active.description}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          logCTAEvent(`Portfolio: ${active.name}`)
                          openProject(active)
                        }}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#5FC1D1] px-4 py-2.5 text-sm font-bold text-black transition-transform hover:scale-[1.02]"
                      >
                        View project <ArrowRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default PortfolioSection