/**
 * CaseStudiesSection — "Consulting that Compounds"
 * Expanding accordion kept, but hover is debounced and flex animates via CSS
 * (no Framer layout springs) to stop lag / oversensitivity.
 */

import { type FC, useState, useEffect, useRef, useCallback } from 'react'
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { getShowcaseTestimonials, type ITestimonialShowcase } from '../services'


interface CaseStudy {
  id: string
  client: string
  challenge: string
  solution: string
  result: string
  metric: string
  image: string
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'cs1',
    client: 'Woop! Entertainment',
    challenge:
      'Optimizing floor layout for maximum throughput during peak weekend hours without compromising the premium guest experience.',
    solution:
      'Redesigned the zone flow to separate high-energy arcade traffic from the premium bowling lanes, and introduced a centralized F&B hub.',
    result: 'Increased peak-hour capacity by 22% and boosted F&B attach rate.',
    metric: '+22% Capacity',
    image: '/products/Bowling_Lane_Dubai.avif',
  },
  {
    id: 'cs2',
    client: 'Shott India',
    challenge:
      'Selecting a game mix that appealed to both corporate event crowds and weekend family demographics to maximize ROI.',
    solution:
      'Data-driven curation of 80+ arcade titles, balancing high-turnover redemption games with immersive VR anchor attractions.',
    result: 'Achieved projected 18-month ROI target in just 14 months.',
    metric: '14mo ROI',
    image: '/products/Arcade_Games_Calicut.avif',
  },
  {
    id: 'cs3',
    client: 'Idea Crate',
    challenge: 'Setting up SOPs and training a green team for a massive 40,000 sq ft multi-attraction venue.',
    solution:
      'Deployed our proprietary 4-week pre-opening training module, complete with shadow shifts and stress-test soft openings.',
    result: 'Zero operational downtime in the critical first 90 days of launch.',
    metric: 'Zero Downtime',
    image: '/products/Softplay_Ahemdabad.avif',
  },
]

const FALLBACK_SIDE_IMAGE = '/products/Bowling_Lane_Dubai.avif'

const TestimonialCarousel: FC = () => {
  const [testimonials, setTestimonials] = useState<ITestimonialShowcase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduced = useReducedMotion()

  // Fetch real testimonials from the landing API
  useEffect(() => {
    let isMounted = true

    const loadTestimonials = async () => {
      try {
        setIsLoading(true)
        setHasError(false)
        const res = await getShowcaseTestimonials({ limit: 8 })
        if (!isMounted) return
        setTestimonials(res.data)
      } catch {
        if (!isMounted) return
        setHasError(true)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadTestimonials()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (reduced || paused || testimonials.length < 2) return
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length)
    }, 6500)
    return () => clearInterval(timer)
  }, [reduced, paused, testimonials.length])

  // Keep index valid if the list shrinks
  useEffect(() => {
    if (index >= testimonials.length && testimonials.length > 0) {
      setIndex(0)
    }
  }, [testimonials.length, index])

  const go = (dir: -1 | 1) => {
    setIndex((i) => (i + dir + testimonials.length) % testimonials.length)
  }

  if (isLoading) {
    return (
      <div id="testimonials" className="relative mx-auto mt-10 max-w-[900px] sm:mt-12">
        <div className="rounded-2xl border border-white/10 bg-[#0A0A0F] px-5 py-12 text-center text-sm text-[#86868B]">
          Loading testimonials…
        </div>
      </div>
    )
  }

  if (hasError || testimonials.length === 0) {
    return (
      <div id="testimonials" className="relative mx-auto mt-10 max-w-[900px] sm:mt-12">
        <div className="rounded-2xl border border-white/10 bg-[#0A0A0F] px-5 py-12 text-center text-sm text-[#86868B]">
          {hasError ? "Couldn't load testimonials right now." : 'No testimonials yet.'}
        </div>
      </div>
    )
  }

  const active = testimonials[index]
  const sideImageUrl = active.testimonialImage?.url || FALLBACK_SIDE_IMAGE
  const roleLine = [active.designation, active.companyName].filter(Boolean).join(', ')

  return (
    <div
      id="testimonials"
      className="relative mx-auto mt-20 max-w-[1100px] pb-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Top Label */}
      <div className="flex justify-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#5FC1D1] backdrop-blur-md"
        >
          <Star size={14} fill="#5FC1D1" />
          Partner Success Stories
        </motion.div>
      </div>

      {/* Ambient background glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[800px] bg-gradient-to-r from-[#5FC1D1]/20 to-[#FFAA33]/10 blur-[140px] rounded-full pointer-events-none" />

      <div
        className="relative overflow-hidden rounded-[40px]"
        style={{
          background: 'linear-gradient(145deg, rgba(30,30,35,0.6) 0%, rgba(15,15,20,0.8) 100%)',
          backdropFilter: 'blur(40px)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 0 40px rgba(255,255,255,0.02)',
        }}
      >
        {/* Subtle Edge Light */}
        <div className="absolute inset-0 rounded-[40px] border border-white/10 pointer-events-none mix-blend-overlay" />

        <div className="relative z-[1] grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] min-h-[460px]">
          
          {/* Left: Content */}
          <div className="flex flex-col justify-center px-5 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-20 relative">
            <Quote 
              size={180} 
              className="absolute top-10 left-10 text-[#5FC1D1] opacity-5 pointer-events-none transform -rotate-12"
            />
            
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30, filter: 'blur(10px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: 30, filter: 'blur(10px)' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10"
              >
                <div className="flex items-center gap-1.5 mb-8">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      fill={i < (active.rating || 5) ? '#FFAA33' : 'none'}
                      color={i < (active.rating || 5) ? '#FFAA33' : 'rgba(255,255,255,0.1)'}
                      className="drop-shadow-[0_0_8px_rgba(255,170,51,0.4)]"
                    />
                  ))}
                </div>

                <p className="font-display mb-12 text-[clamp(1.4rem,2.5vw,2rem)] font-light leading-tight text-white tracking-wide" style={{ textWrap: 'balance' }}>
                  &ldquo;{active.message}&rdquo;
                </p>

                <div className="flex items-center gap-5">
                  {active.clientImage?.url ? (
                    <img
                      src={active.clientImage.url}
                      alt={active.clientName}
                      loading="lazy"
                      className="h-16 w-16 shrink-0 rounded-full border border-white/20 object-cover shadow-2xl"
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 text-xl font-bold text-white shadow-2xl">
                      {active.clientName?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div>
                    <div className="text-xl font-bold text-white tracking-wide">{active.clientName}</div>
                    {roleLine && <div className="text-sm font-semibold tracking-wider uppercase text-[#8B93A0] mt-1">{roleLine}</div>}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Image */}
          <div className="relative h-[350px] lg:h-auto overflow-hidden rounded-r-[40px] lg:rounded-l-none rounded-b-[40px]">
            <AnimatePresence mode="wait">
              <motion.img
                key={sideImageUrl}
                src={sideImageUrl}
                alt="Showcase"
                initial={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-r from-[rgba(15,15,20,0.9)] via-transparent to-transparent lg:from-[rgba(15,15,20,1)] opacity-100" />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(15,15,20,0.95)] via-[rgba(15,15,20,0.4)] to-transparent lg:hidden" />
          </div>

        </div>

        {/* Controls */}
        <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 z-20 flex items-center gap-4 sm:gap-6">
          <div className="hidden sm:flex items-center gap-3 mr-6">
             {testimonials.map((_, i) => (
               <button
                 key={i}
                 onClick={() => setIndex(i)}
                 aria-label={`Go to slide ${i + 1}`}
                 className={`h-1.5 rounded-full transition-all duration-500 ease-out ${i === index ? 'w-10 bg-[#FFAA33] shadow-[0_0_12px_rgba(255,170,51,0.6)]' : 'w-2 bg-white/20 hover:bg-white/50'}`}
               />
             ))}
          </div>

          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => go(-1)}
              aria-label="Previous"
              className="group flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-xl transition-all hover:bg-white hover:text-black hover:scale-105"
            >
              <ChevronLeft size={18} className="sm:hidden transition-transform group-hover:-translate-x-1" />
              <ChevronLeft size={24} className="hidden sm:block transition-transform group-hover:-translate-x-1" />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next"
              className="group flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-xl transition-all hover:bg-white hover:text-black hover:scale-105"
            >
              <ChevronRight size={18} className="sm:hidden transition-transform group-hover:translate-x-1" />
              <ChevronRight size={24} className="hidden sm:block transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const HOVER_DELAY_MS = 200

interface CaseStudiesSectionProps {
  data?: {
    _id?: string;
    client: string;
    challenge: string;
    solution: string;
    result: string;
    metric: string;
    image?: { url: string; public_id: string };
  }[];
}

const CaseStudiesSection: FC<CaseStudiesSectionProps> = ({ data }) => {
  const [activeIdx, setActiveIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reduced = useReducedMotion()

  const clearHoverTimer = useCallback(() => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current)
      hoverTimer.current = null
    }
  }, [])

  const select = useCallback(
    (i: number, immediate = false) => {
      clearHoverTimer()
      if (immediate || reduced) {
        setActiveIdx(i)
        return
      }
      hoverTimer.current = setTimeout(() => setActiveIdx(i), HOVER_DELAY_MS)
    },
    [clearHoverTimer, reduced],
  )

  useEffect(() => () => clearHoverTimer(), [clearHoverTimer])

  // Use CMS data if available, otherwise fallback to hardcoded
  const caseStudies = Array.isArray(data) ? data.map((cs, i) => ({
    id: cs._id || `cs-${i}`,
    client: cs.client,
    challenge: cs.challenge,
    solution: cs.solution,
    result: cs.result,
    metric: cs.metric,
    image: cs.image?.url || FALLBACK_SIDE_IMAGE,
  })) : CASE_STUDIES;

  useEffect(() => {
    if (reduced || paused || caseStudies.length === 0) return
    const timer = setInterval(() => {
      setActiveIdx((i) => (i + 1) % caseStudies.length)
    }, 5500)
    return () => clearInterval(timer)
  }, [reduced, paused, caseStudies.length])

  return (
    <section
      id="case-studies"
      className="relative overflow-x-clip bg-black px-4 pb-10 pt-6 sm:px-6 sm:pb-12"
    >
      <div aria-hidden="true" className="grid-bg pointer-events-none absolute inset-0 opacity-30" />

      <div className="relative z-[1] mx-auto max-w-[1100px]">
        <div className="mb-8 text-center sm:mb-10">
          <div
            className="label mb-3 justify-center"
            style={{
              color: '#5FC1D1',
              borderColor: 'rgba(95,193,209,0.3)',
              background: 'rgba(95,193,209,0.08)',
            }}
          >
            Proven Results
          </div>
          <h2 className="font-display landing-section-heading text-[clamp(1.75rem,3.5vw,2.75rem)]">
            Consulting that Compounds.
          </h2>
        </div>

        {/* Expanding accordion — CSS flex only, debounced hover */}
        <div
          className="flex h-auto w-full flex-col gap-3 md:h-[400px] md:flex-row md:gap-3"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => {
            setPaused(false)
            clearHoverTimer()
          }}
        >
          {caseStudies.map((study, i) => {
            const isActive = activeIdx === i
            return (
              <button
                key={study.id}
                type="button"
                onMouseEnter={() => select(i)}
                onFocus={() => select(i, true)}
                onClick={() => select(i, true)}
                aria-pressed={isActive}
                className="relative cursor-pointer overflow-hidden rounded-2xl border text-left"
                style={{
                  flex: isActive ? '3.2 1 0%' : '0.85 1 0%',
                  minHeight: isActive ? 360 : 88,
                  borderColor: isActive ? 'rgba(95,193,209,0.45)' : 'rgba(255,255,255,0.1)',
                  boxShadow: isActive ? '0 0 28px rgba(95,193,209,0.18)' : 'none',
                  background: '#0A0A0F',
                  transition:
                    'flex 0.45s cubic-bezier(0.22, 1, 0.36, 1), min-height 0.45s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.3s ease, box-shadow 0.3s ease',
                }}
              >
                <img
                  src={study.image}
                  alt={study.client}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{
                    filter: isActive ? 'brightness(0.85)' : 'brightness(0.35)',
                    transform: isActive ? 'scale(1.03)' : 'scale(1)',
                    transition: 'filter 0.45s ease, transform 0.55s ease',
                  }}
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.7) 45%, rgba(0,0,0,0.1) 80%, transparent 100%)',
                  }}
                />

                {/* Active content — CSS opacity (no AnimatePresence thrash) */}
                <div
                  className="absolute inset-0 z-10 flex flex-col justify-end p-4 sm:p-6 md:p-7"
                  style={{
                    opacity: isActive ? 1 : 0,
                    pointerEvents: isActive ? 'auto' : 'none',
                    transition: 'opacity 0.28s ease',
                  }}
                  aria-hidden={!isActive}
                >
                  <span className="mb-2 inline-flex w-fit rounded-full border border-[#5FC1D1]/40 bg-[#5FC1D1]/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#5FC1D1]">
                    {study.client}
                  </span>
                  <h3 className="font-display mb-3 text-[clamp(1.6rem,3vw,2.4rem)] leading-none tracking-[-0.02em] text-[#F5F5F7]">
                    {study.metric}
                  </h3>
                  <div className="grid gap-3 rounded-xl border border-white/20 bg-black/80 p-3 sm:grid-cols-2 sm:gap-4 sm:p-4 backdrop-blur-md">
                    <div>
                      <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-white/45">
                        Challenge
                      </div>
                      <p className="text-[12px] leading-relaxed text-white/85 sm:text-[13px]">
                        {study.challenge}
                      </p>
                    </div>
                    <div>
                      <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-white/45">
                        Solution
                      </div>
                      <p className="text-[12px] leading-relaxed text-white/85 sm:text-[13px]">
                        {study.solution}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Idle label */}
                <div
                  className="absolute inset-0 z-10 flex items-end justify-start p-4 md:items-center md:justify-center md:p-0"
                  style={{
                    opacity: isActive ? 0 : 1,
                    pointerEvents: 'none',
                    transition: 'opacity 0.28s ease',
                  }}
                  aria-hidden={isActive}
                >
                  <div className="flex items-center gap-3 opacity-80 md:flex-col md:gap-4">
                    <span className="border-b border-[#5FC1D1]/40 pb-0.5 text-xs font-bold tracking-widest text-[#5FC1D1] md:-rotate-90">
                      0{i + 1}
                    </span>
                    <h3 className="m-0 text-base font-extrabold uppercase tracking-widest text-white md:-rotate-90 md:whitespace-nowrap md:text-lg">
                      {study.client}
                    </h3>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <TestimonialCarousel />
      </div>
    </section>
  )
}

export default CaseStudiesSection