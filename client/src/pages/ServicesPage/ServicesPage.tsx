import { type FC, useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'
import { ArrowRight, Check, Plus } from 'lucide-react'
import { useLeadTracker } from '../../context/LeadTrackerContext'
import { servicesPageApi, type ServicesPageData } from '../../services/servicesPageApi'

// ---------- ANIMATED COUNTER ----------
function useCounter(target: number, inView: boolean) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!inView) return
    const step = Math.ceil(target / 60)
    let current = 0
    const timer = setInterval(() => {
      current += step
      if (current >= target) { setCount(target); clearInterval(timer) }
      else setCount(current)
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target])
  return count
}

function StatCard({ m, metricsInView }: { m: any, metricsInView: boolean }) {
  const count = useCounter(m.raw, metricsInView)
  return (
    <div className="group relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0A0A0F] aspect-square flex flex-col justify-end p-6 cursor-default hover:border-[#5FC1D1]/30 transition-all duration-300">
      <img
        src={m.img}
        alt=""
        aria-hidden
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-20 group-hover:opacity-40 transition-opacity duration-500 scale-105 group-hover:scale-100"
      />
      <div className="relative z-10">
        <p className="font-display text-4xl font-black text-[#5FC1D1] leading-none mb-1">
          {count}{m.suffix}
        </p>
        <p className="font-bold text-white text-base">{m.label}</p>
        <p className="text-[#6A6A74] text-xs mt-1">{m.sublabel}</p>
      </div>
    </div>
  )
}

// ---------- MAIN PAGE ----------
const ServicesPage: FC = () => {
  const [activeStep, setActiveStep] = useState(0)
  const [data, setData] = useState<ServicesPageData | null>(null)
  const [loading, setLoading] = useState(true)

  const { state, addToEnquiry } = useLeadTracker()
  const isAdded = (id: string) => state.enquiryCart.some(item => item.id === id)

  const metricsRef = useRef<HTMLDivElement>(null)
  const [metricsInView, setMetricsInView] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const res = await servicesPageApi.getServicesPageData()
      setData(res)
      setLoading(false)
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (loading || !metricsRef.current) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setMetricsInView(true) }, { threshold: 0.3 })
    obs.observe(metricsRef.current)
    return () => obs.disconnect()
  }, [loading])

  // Auto-advance process steps
  useEffect(() => {
    if (!data?.processSteps || data.processSteps.length === 0) return
    const t = setInterval(() => setActiveStep(s => (s + 1) % data.processSteps.length), 3000)
    return () => clearInterval(t)
  }, [data?.processSteps])

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Services...</div>
  }

  const services = data?.services || []
  const processSteps = data?.processSteps || []
  const galleryImages = data?.galleryImages || []

  return (
    <div className="services-hub bg-black text-[#F5F5F7] min-h-screen">
      <SEO
        title="Our Services | FEC Consulting & Setup | Bowling Planet"
        description="End-to-end family entertainment center consulting, pre-opening setup, and operations management by Bowling Planet. 150+ FECs launched across India."
      />

      {/* ── PAGE HEADER (same as Projects/Products) ── */}
      <header className="relative overflow-hidden border-b border-white/[0.08]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
            alt=""
            aria-hidden
            className="h-full w-full object-cover object-center"
          />
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.98) 100%), radial-gradient(ellipse 80% 60% at 70% 40%, rgba(95,193,209,0.15), transparent 60%)' }}
          />
        </div>
        <div className="relative z-[1] mx-auto max-w-[1280px] px-5 pb-8 pt-32 sm:px-7 sm:pb-10 sm:pt-36">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5FC1D1]">
                What we do
              </p>
              <h1 className="font-display text-[clamp(1.5rem,3vw,2rem)] font-extrabold tracking-[-0.02em] text-[#F5F5F7]">
                Our Services
              </h1>
            </div>
            <p className="text-sm text-[#A1A1A6]">{services.length} core service tracks</p>
          </div>
        </div>
      </header>

      {/* ── SERVICE OVERVIEW CARDS (60/40 visual-first bento) ── */}
      <section className="mx-auto max-w-[1280px] px-5 py-14 sm:px-7">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {services.map((svc, idx) => (
            <div
              key={idx}
              className="group relative rounded-3xl overflow-hidden border border-white/[0.08] bg-[#0A0A0F] transition-all duration-500 hover:border-[#5FC1D1]/30 hover:shadow-[0_0_60px_rgba(95,193,209,0.08)]"
            >
              {/* Large image: smaller proportion */}
              <div className="relative h-[220px] w-full overflow-hidden">
                {svc.image?.url && (
                  <img
                    src={svc.image.url}
                    alt={svc.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                )}
                {/* gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/40 to-transparent" />

                {/* Tag badge */}
                <div className="absolute top-4 left-4 z-20">
                  <span
                    className="inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest backdrop-blur-md shadow-lg"
                    style={{ background: 'rgba(0, 0, 0, 0.6)', color: svc.accentColor, border: `1px solid ${svc.accentColor}60` }}
                  >
                    {svc.tag}
                  </span>
                </div>

                {/* Stats row overlaid on image bottom */}
                <div className="absolute bottom-4 left-4 right-4 flex gap-3">
                  {svc.stats?.map((stat, si) => (
                    <div key={si} className="flex-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 px-2 py-2 text-center">
                      <p className="text-base font-extrabold" style={{ color: svc.accentColor }}>{stat.value}</p>
                      <p className="text-[9px] text-[#A1A1A6] leading-tight">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Text: compressed padding */}
              <div className="p-5">
                <h2 className="font-display text-lg font-bold text-white mb-2 leading-tight">{svc.title}</h2>
                <p className="text-[#A1A1A6] text-xs leading-relaxed mb-4">{svc.subtitle}</p>

                {/* Feature pills grid */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {svc.features?.map((f, fi) => (
                    <div key={fi} className="flex items-center gap-2 rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-2">
                      <span style={{ color: svc.accentColor }} className="shrink-0"><Check className="h-4 w-4" /></span>
                      <span className="text-[11px] text-[#C1C1C6] font-medium leading-tight">{f}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-4">
                  {svc.link ? (
                    <Link to={svc.link} className="flex items-center gap-2 font-semibold text-sm cursor-pointer hover:opacity-80 transition-opacity" style={{ color: svc.accentColor }}>
                      Explore Service
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2 font-semibold text-sm" style={{ color: svc.accentColor }}>
                      Explore Service
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToEnquiry({ id: `svc-${idx}`, type: 'service', title: svc.title });
                    }}
                    className={`inline-flex h-9 items-center justify-center rounded-full px-4 text-xs font-bold transition-all border gap-1.5 z-10 ${isAdded(`svc-${idx}`)
                      ? 'bg-white/10 border-white/20 text-white cursor-default'
                      : 'bg-transparent border-white/20 text-[#A1A1A6] hover:text-white hover:border-white/50 cursor-pointer'
                      }`}
                  >
                    {isAdded(`svc-${idx}`) ? <><Check className="h-3.5 w-3.5 text-[#5FC1D1]" /> Added</> : <><Plus className="h-3.5 w-3.5" /> Enquire</>}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── VISUAL PROCESS TIMELINE ── */}
      {processSteps.length > 0 && (
        <section className="border-t border-white/[0.08] py-16 sm:py-20">
          <div className="mx-auto max-w-[1280px] px-5 sm:px-7">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5FC1D1]">How it works</p>
                <h2 className="font-display text-3xl font-extrabold text-white tracking-tight">Our Process</h2>
              </div>
              <p className="text-sm text-[#A1A1A6] max-w-[360px] text-right">From discovery to sustained growth — every step is mapped and measurable.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Step selector */}
              <div className="lg:w-[40%] flex flex-col gap-3">
                {processSteps.map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    className={`flex items-start gap-4 rounded-2xl p-5 text-left transition-all duration-300 border cursor-pointer w-full ${activeStep === idx
                      ? 'bg-[#5FC1D1]/10 border-[#5FC1D1]/40 shadow-[0_0_20px_rgba(95,193,209,0.1)]'
                      : 'bg-[#0A0A0F] border-white/[0.06] hover:border-[#5FC1D1]/20 hover:bg-[#0e0e14]'
                      }`}
                  >
                    <span className={`text-3xl font-black tabular-nums leading-none transition-colors duration-300 ${activeStep === idx ? 'text-[#5FC1D1]' : 'text-[#3A3A42]'}`}>
                      {step.num}
                    </span>
                    <div>
                      <p className={`font-display text-lg font-bold transition-colors duration-300 ${activeStep === idx ? 'text-white' : 'text-[#A1A1A6]'}`}>{step.title}</p>
                      <p className="text-[#6A6A74] text-sm leading-relaxed mt-1">{step.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Dynamic image panel */}
              <div className="lg:w-[60%] w-full relative rounded-3xl overflow-hidden bg-[#0A0A0F] h-[400px] lg:h-auto lg:min-h-[400px] border border-white/[0.08]">
                {processSteps.map((step, idx) => (
                  <img
                    key={idx}
                    src={step.image?.url}
                    alt={step.title}
                    className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-in-out ${activeStep === idx ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'}`}
                    loading="lazy"
                  />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none" />

                {/* Step progress dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                  {processSteps.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveStep(idx)}
                      className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${activeStep === idx ? 'w-10 bg-[#5FC1D1]' : 'w-2.5 bg-white/40 hover:bg-white/60'}`}
                      aria-label={`Step ${idx + 1}`}
                    />
                  ))}
                </div>
                {/* Active step label overlay */}
                {processSteps[activeStep] && (
                  <div className="absolute top-6 right-6 z-20">
                    <span className="rounded-full bg-black/80 backdrop-blur-md border border-white/20 px-5 py-2.5 text-sm font-bold text-white shadow-xl">
                      Step {processSteps[activeStep].num} — {processSteps[activeStep].title}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── ANIMATED METRICS ── */}
      <section className="border-t border-white/[0.08] py-16 sm:py-20 bg-[#050508]" ref={metricsRef}>
        <div className="mx-auto max-w-[1280px] px-5 sm:px-7">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5FC1D1]">Impact at scale</p>
          <h2 className="font-display text-3xl font-extrabold text-white mb-12 tracking-tight">Results That Speak</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(data?.results || []).map((m: any, idx: number) => (
              <StatCard key={idx} m={{ ...m, img: m.image?.url || m.img }} metricsInView={metricsInView} />
            ))}
          </div>
        </div>
      </section>

      {/* ── INDUSTRY GALLERY ── */}
      {galleryImages.length > 0 && (
        <section className="border-t border-white/[0.08] py-16 sm:py-20">
          <div className="mx-auto max-w-[1280px] px-5 sm:px-7">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5FC1D1]">Portfolio glimpse</p>
            <h2 className="font-display text-3xl font-extrabold text-white mb-10 tracking-tight">Venues We've Shaped</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {galleryImages.map((img, idx) => (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.06] aspect-[4/3] cursor-pointer"
                >
                  {img.image?.url && (
                    <img
                      src={img.image.url}
                      alt={img.label}
                      loading="lazy"
                      className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex items-end p-4">
                    <span className="text-white font-semibold text-sm drop-shadow-md">{img.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default ServicesPage
