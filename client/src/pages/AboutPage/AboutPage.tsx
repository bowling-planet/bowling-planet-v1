import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Award,
  Package,
  Briefcase,
  Wrench,
  LineChart,
  ShieldCheck,
  Handshake,
  Boxes,
  Target,
  Eye,
  Quote,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import SEO from '../../components/SEO'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import TeamSection from './components/TeamSection'
import EndorsedConnections from './components/EndorsedConnections'
import { aboutPageApi, type AboutPageData } from '../../services/aboutApi'


// Maps the icon "key" an admin picks in the CMS to an actual lucide-react
// component. Keep this list in sync with the options offered in
// admin/views/cms/about/CmsAboutView.tsx. Anything unrecognised (or blank)
// simply falls back to Briefcase so a bad value never breaks the page.
const WHY_US_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Briefcase,
  Wrench,
  Boxes,
  LineChart,
  ShieldCheck,
  Handshake,
  Award,
  Package,
}

const AboutPage: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [data, setData] = useState<AboutPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await aboutPageApi.getAboutPageData()
      setData(res.data)
    } catch {
      setError('Unable to load the About page right now.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const el = scrollRef.current
    if (!el || !data?.gallery?.length) return

    const scrollInterval = setInterval(() => {
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        const itemWidth = (el.firstChild as HTMLElement)?.clientWidth || 300
        const gap = 24
        el.scrollBy({ left: itemWidth + gap, behavior: 'smooth' })
      }
    }, 3500)

    return () => clearInterval(scrollInterval)
  }, [data?.gallery?.length])

  const scrollPrev = () => {
    if (scrollRef.current) {
      const itemWidth = (scrollRef.current.firstChild as HTMLElement)?.clientWidth || 300
      scrollRef.current.scrollBy({ left: -(itemWidth + 24), behavior: 'smooth' })
    }
  }

  const scrollNext = () => {
    if (scrollRef.current) {
      const itemWidth = (scrollRef.current.firstChild as HTMLElement)?.clientWidth || 300
      scrollRef.current.scrollBy({ left: itemWidth + 24, behavior: 'smooth' })
    }
  }

  if (loading) {
    return (
      <div className="about-catalogue min-h-[60vh] bg-black text-[#F5F5F7] flex items-center justify-center py-24">
        <Loader label="Loading About page…" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="about-catalogue min-h-[60vh] bg-black text-[#F5F5F7] flex items-center justify-center py-24">
        <ErrorState message={error || 'Something went wrong.'} onRetry={() => void load()} />
      </div>
    )
  }

  const certs = data.certifications || []
  const partners = (data.partners || [])
    .filter((p) => p.image?.url)
    .map((p) => ({ name: p.name, logo: p.image!.url }))
  const gallery = data.gallery || []
  const stats = data.stats || []
  const journey = data.journey || []
  const whyUs = data.whyUs || []
  const { vision, mission } = data.visionMission || { vision: '', mission: '' }
  const founder = data.founderNote

  return (
    <div className="about-catalogue min-h-[60vh] bg-black text-[#F5F5F7]">
      <SEO
        title="About Us"
        description="Bowling Planet — FEC consulting, planning, supply and installation for malls, hotels and investors."
      />

      <div className="mx-auto max-w-[1200px] space-y-16 px-5 pb-16 pt-24 sm:space-y-24 sm:px-7 sm:pt-28">
        {/* Standard Intro */}
        <header className="mb-16 text-center max-w-3xl mx-auto pt-8 flex flex-col items-center">
          <img src="/logo.png" alt="Bowling Planet" className="h-auto max-h-32 sm:max-h-36 w-auto max-w-[85vw] mb-6 object-contain" />
          <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-tight text-[#F5F5F7]">
            {data.intro?.title || 'About Bowling Planet'}
          </h1>
          {data.intro?.subtitle ? (
            <p className="mt-6 text-[17px] leading-relaxed text-[#A1A1A6]">{data.intro.subtitle}</p>
          ) : null}
        </header>

        {/* Credentials as a horizontal showcase */}
        {certs.length > 0 ? (
          <section aria-labelledby="about-certs-heading" className="mb-16 rounded-3xl border border-white/[0.08] bg-[#0A0A0F]/50 p-6 sm:p-10">
            <div className="mb-6 flex items-center justify-center gap-2 text-center">
              <Award size={18} className="text-[#5FC1D1]" />
              <h2 id="about-certs-heading" className="font-display text-xl font-extrabold tracking-tight text-[#F5F5F7]">
                Trusted Industry Credentials
              </h2>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {certs.map((c, i) => (
                <article
                  key={`${c.title}-${i}`}
                  className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-[#111118] px-6 py-4 shadow-lg"
                >
                  <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-xl border border-[#5FC1D1]/20 bg-[#5FC1D1]/5 text-[#5FC1D1] overflow-hidden p-2 bg-white">
                    {c.image?.url ? (
                      <img src={c.image.url} alt="" aria-hidden className="h-full w-full object-contain" />
                    ) : (
                      <Award size={20} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-[#F5F5F7]">{c.title}</h3>
                    <p className="text-xs text-[#86868B] mt-0.5">{c.sub}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <div className="mb-16">
          <EndorsedConnections partners={partners} />
        </div>

        {/* Gallery Section */}
        {gallery.length > 0 ? (
          <section className="mb-16 -mx-5 sm:-mx-7 overflow-hidden relative group">
            <div
              ref={scrollRef}
              className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory px-5 sm:px-7 pb-6 hide-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {gallery.map((item, idx) => (
                <div key={idx} className="shrink-0 w-[85vw] sm:w-[60vw] md:w-[45vw] snap-center rounded-2xl overflow-hidden bg-[#111118] border border-white/[0.08]">
                  {item.image?.url ? (
                    <img src={item.image.url} alt={item.title} className="w-full h-[300px] sm:h-[400px] object-cover" />
                  ) : (
                    <div className="w-full h-[300px] sm:h-[400px] bg-[#1A1A24]" />
                  )}
                  <div className="p-4 bg-[#111118]">
                    <p className="text-sm font-semibold text-[#F5F5F7]">{item.title}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={scrollPrev}
              className="absolute left-6 top-1/2 -translate-y-1/2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-6 top-1/2 -translate-y-1/2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>
          </section>
        ) : null}

        {/* Simple Stats */}
        {stats.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 border-y border-white/[0.08] py-8">
            {stats.map((s, i) => (
              <div key={`${s.label}-${i}`} className="text-center">
                <div className="font-display text-3xl font-extrabold text-[#5FC1D1]">{s.num}</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#86868B]">{s.label}</div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Vision / Mission — two column */}
        {(vision || mission) ? (
          <section
            aria-labelledby="about-purpose-heading"
            className="grid gap-4 md:grid-cols-2 mb-16"
          >
            <h2 id="about-purpose-heading" className="sr-only">
              Vision and mission
            </h2>
            {vision ? (
              <article className="relative overflow-hidden rounded-3xl border border-[#5FC1D1]/25 p-8 sm:p-10">
                <div className="absolute inset-0">
                  <img
                    src="/about/vision-particles.png"
                    alt=""
                    aria-hidden
                    className="h-full w-full object-cover object-center opacity-80"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.78) 100%), radial-gradient(ellipse 80% 70% at 80% 20%, rgba(95,193,209,0.18), transparent 55%)',
                    }}
                  />
                </div>
                <div className="relative z-[1]">
                  <div className="mb-4 flex items-center gap-2 text-[#5FC1D1]">
                    <Eye size={18} />
                    <span className="text-[12px] font-semibold uppercase tracking-[0.14em]">Vision</span>
                  </div>
                  <p className="text-[16px] leading-relaxed text-[#D1D1D6] font-medium">{vision}</p>
                </div>
              </article>
            ) : null}
            {mission ? (
              <article className="relative overflow-hidden rounded-3xl border border-[#6DBD4E]/25 p-8 sm:p-10">
                <div className="absolute inset-0">
                  <img
                    src="/about/mission-particles.png"
                    alt=""
                    aria-hidden
                    className="h-full w-full object-cover object-center opacity-80"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.78) 100%), radial-gradient(ellipse 80% 70% at 80% 20%, rgba(109,189,78,0.16), transparent 55%)',
                    }}
                  />
                </div>
                <div className="relative z-[1]">
                  <div className="mb-4 flex items-center gap-2 text-[#6DBD4E]">
                    <Target size={18} />
                    <span className="text-[12px] font-semibold uppercase tracking-[0.14em]">Mission</span>
                  </div>
                  <p className="text-[16px] leading-relaxed text-[#D1D1D6] font-medium">{mission}</p>
                </div>
              </article>
            ) : null}
          </section>
        ) : null}

        {/* Journey + Founder note */}
        {(journey.length > 0 || founder?.quote) ? (
          <div className="grid gap-12 lg:grid-cols-2 mb-16">
            {journey.length > 0 ? (
              <section aria-labelledby="about-journey-heading">
                <h2 id="about-journey-heading" className="mb-6 font-display text-2xl font-extrabold text-[#F5F5F7]">
                  Our Journey
                </h2>
                <ol className="space-y-6 border-l border-white/[0.1] pl-6 ml-2">
                  {journey.map((item, i) => (
                    <li key={`${item.year}-${i}`} className="relative">
                      <span className="absolute -left-[1.9rem] top-1.5 h-3 w-3 rounded-full border-2 border-[#5FC1D1] bg-black" />
                      <p className="text-sm font-bold text-[#F5F5F7]">{item.year}</p>
                      <p className="mt-1 text-[15px] leading-relaxed text-[#A1A1A6]">{item.event}</p>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            {founder?.quote ? (
              <section aria-labelledby="about-founder-heading">
                <h2 id="about-founder-heading" className="mb-6 font-display text-2xl font-extrabold text-[#F5F5F7]">
                  Founder&apos;s Note
                </h2>
                <div className="rounded-2xl border border-white/[0.08] bg-[#0A0A0F] p-6 sm:p-8">
                  <Quote size={24} className="text-[#6DBD4E] mb-4 opacity-50" />
                  <p className="text-[16px] italic leading-relaxed text-[#D8DCE3]">&ldquo;{founder.quote}&rdquo;</p>
                  {founder.bio ? (
                    <p className="mt-5 text-[14.5px] leading-relaxed text-[#86868B]">{founder.bio}</p>
                  ) : null}
                  {founder.name ? (
                    <div className="mt-6 pt-6 border-t border-white/[0.08]">
                      <p className="text-[15px] font-bold text-[#F5F5F7]">{founder.name}</p>
                      {founder.designation ? (
                        <p className="text-[12px] text-[#86868B] mt-0.5 uppercase tracking-wide">{founder.designation}</p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}
          </div>
        ) : null}

        {/* Simple Why Us */}
        {whyUs.length > 0 ? (
          <section aria-labelledby="about-why-heading" className="mb-16">
            <div className="mb-10 text-center">
              <h2 id="about-why-heading" className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-extrabold tracking-tight text-[#F5F5F7]">
                Why Partners Choose Us
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {whyUs.map((item, i) => {
                const Icon = WHY_US_ICONS[item.icon] || Briefcase
                return (
                  <div key={`${item.title}-${i}`} className="p-6 rounded-2xl bg-[#0A0A0F] border border-white/[0.06] transition-colors hover:border-[#6DBD4E]/40">
                    <Icon size={24} className="text-[#6DBD4E] mb-4" />
                    <h3 className="text-lg font-bold text-[#F5F5F7] font-display">{item.title}</h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-[#86868B]">{item.text}</p>
                  </div>
                )
              })}
            </div>
          </section>
        ) : null}

        <TeamSection />
      </div>
    </div>
  )
}

export default AboutPage
