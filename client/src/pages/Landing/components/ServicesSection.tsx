/**
 * ServicesSection — What We Do
 * Professional horizontal phase stepper + detail panel.
 * Keeps color-synced background + card enter/exit animation.
 */

import { type FC, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReveal } from '../../../hooks/useReveal'
import { useLeadTracker } from '../../../context/LeadTrackerContext'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'

interface Pillar {
  id: string
  step: string
  title: string
  eyebrow: string
  desc: string
  bullets: string[]
  color: string
  rgb: string
  image: string
}

const PILLARS: Pillar[] = [
  {
    id: 'pre-opening',
    step: '01',
    eyebrow: 'Phase One',
    title: 'Pre-Opening Consulting',
    desc: 'We partner with you before a single brick is laid — running location analytics, modeling your ROI, designing the optimal floor layout, and building the team that will make your opening day unforgettable.',
    bullets: [
      'Location analytics & feasibility',
      'ROI & financial modeling',
      'Optimal layout & space planning',
      'Game & equipment sourcing',
      'Staffing structure & training',
      'Agency & regulatory liaison',
    ],
    color: '#5FC1D1',
    rgb: '95,193,209',
    image: '/products/Bowling_Lane_Dubai.avif',
  },
  {
    id: 'operations',
    step: '02',
    eyebrow: 'Phase Two',
    title: 'Operations Management',
    desc: 'Running a profitable FEC demands operational excellence every day. We design your SOPs, HR frameworks, finance structures, and data-driven marketing engines — then monitor KPIs continuously.',
    bullets: [
      'SOP & process documentation',
      'HR frameworks & team structure',
      'Finance & cost optimization',
      'Marketing & digital execution',
      'Safety systems & compliance',
      'Real-time KPI monitoring',
    ],
    color: '#6DBD4E',
    rgb: '109,189,78',
    image: '/products/Softplay_New_Delhi.avif',
  },
  {
    id: 'equipment',
    step: '03',
    eyebrow: 'Distribution',
    title: 'Equipment Supply',
    desc: 'We source and distribute world-class FEC equipment globally — from a single arcade cabinet to a complete multi-zone entertainment destination, turnkey. ROI-modeled game selection included.',
    bullets: [
      'Bowling lanes & pinsetters',
      'VR & immersive technology',
      'Arcade & redemption games',
      'Trampoline & soft play',
      'Outdoor adventure equipment',
      'Turnkey project management',
    ],
    color: '#FFAA33',
    rgb: '255,170,51',
    image: '/products/Arcade_Games_Calicut.avif',
  },
]

interface ServicesSectionProps {
  data?: {
    step?: string;
    eyebrow?: string;
    title: string;
    subtitle: string;
    bullets?: string[];
    color?: string;
    rgb?: string;
    image?: { url: string; public_id: string };
  }[];
}

const ServicesSection: FC<ServicesSectionProps> = ({ data }) => {
  const titleRef = useReveal()
  const { logCTAEvent } = useLeadTracker()
  const navigate = useNavigate()
  const [active, setActive] = useState('pre-opening')
  const [paused, setPaused] = useState(false)

  // Merge CMS data with hardcoded structural data
  const pillars = PILLARS.map((p, index) => {
    const cmsItem = data?.[index];
    if (!cmsItem) return p;
    return {
      ...p,
      step: cmsItem.step || p.step,
      eyebrow: cmsItem.eyebrow || p.eyebrow,
      title: cmsItem.title || p.title,
      desc: cmsItem.subtitle || p.desc,
      bullets: cmsItem.bullets && cmsItem.bullets.length > 0 ? cmsItem.bullets : p.bullets,
      color: cmsItem.color || p.color,
      rgb: cmsItem.rgb || p.rgb,
      image: cmsItem.image?.url || p.image,
    };
  });

  useEffect(() => {
    if (paused) return
    const interval = setInterval(() => {
      setActive((prev) => {
        const currentIndex = pillars.findIndex((p) => p.id === prev)
        return pillars[(currentIndex + 1) % pillars.length].id
      })
    }, 5500)
    return () => clearInterval(interval)
  }, [paused, pillars])

  const activePillar = pillars.find((p) => p.id === active)!

  return (
    <section
      id="services"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20"
      style={{
        backgroundColor: `rgba(${activePillar.rgb}, 0.03)`,
        transition: 'background-color 1.2s ease',
      }}
    >
      <div className="orb orb-teal pointer-events-none absolute -left-[8%] -top-[12%] h-[480px] w-[480px] opacity-28" />
      <div className="orb orb-green pointer-events-none absolute -bottom-[10%] -right-[6%] h-[420px] w-[420px] opacity-22" />
      <div aria-hidden="true" className="grid-bg pointer-events-none absolute inset-0 opacity-[0.15]" />

      <div className="relative z-[1] mx-auto max-w-[1100px]">
        {/* Header */}
        <div ref={titleRef} className="reveal mb-10 max-w-[640px]">
          <div className="label mb-4 inline-block border border-white/10 bg-white/5 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-[0.15em] uppercase">
            What We Do
          </div>
          <h2 className="font-display landing-section-heading mb-4 text-[clamp(1.75rem,4.5vw,2.75rem)]">
            Three Pillars.
          </h2>
          <p className="m-0 font-[family-name:var(--font-sans)] text-[15px] sm:text-[16px] leading-relaxed text-[color:var(--text-2)]">
            One seamless partner — from site selection to compounding ROI.
          </p>
        </div>

        {/* Phase stepper */}
        <div
          role="tablist"
          aria-label="Service pillars"
          className="mb-8 flex overflow-x-auto snap-x snap-mandatory sm:grid sm:grid-cols-3 gap-3 pb-2 sm:pb-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style>{`
            div[role="tablist"]::-webkit-scrollbar { display: none; }
          `}</style>
          {pillars.map((p) => {
            const isActive = active === p.id
            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(p.id)}
                className="relative flex w-[260px] sm:w-auto shrink-0 snap-start cursor-pointer flex-col items-start gap-2.5 rounded-2xl px-5 py-4.5 text-left transition-all duration-300"
                style={{
                  border: `1px solid ${isActive ? `rgba(${p.rgb}, 0.4)` : 'rgba(255,255,255,0.08)'}`,
                  background: isActive ? `rgba(${p.rgb}, 0.08)` : 'rgba(255,255,255,0.02)',
                  transform: isActive ? 'translateY(-2px)' : 'none',
                  boxShadow: isActive ? `0 12px 32px rgba(${p.rgb}, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)` : 'none',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="flex w-full items-center gap-3">
                  <span
                    className="font-[family-name:var(--font-data)] text-[13px] font-extrabold tracking-wider transition-colors duration-300"
                    style={{ color: isActive ? p.color : 'rgba(255,255,255,0.3)' }}
                  >
                    {p.step}
                  </span>
                  <span
                    className="font-[family-name:var(--font-sans)] text-[11px] font-bold uppercase tracking-[0.15em] transition-colors duration-300"
                    style={{ color: isActive ? p.color : 'rgba(255,255,255,0.4)' }}
                  >
                    {p.eyebrow}
                  </span>
                </div>
                <span
                  className="font-[family-name:var(--font-sans)] text-[16px] font-bold leading-snug transition-colors duration-300"
                  style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.6)' }}
                >
                  {p.title}
                </span>
                {/* Active indicator bar */}
                {isActive && (
                  <motion.div
                    layoutId="pillar-active-bar"
                    className="absolute bottom-0 left-5 right-5 h-[3px] rounded-t-sm"
                    style={{ background: p.color, boxShadow: `0 0 10px ${p.color}` }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Detail panel */}
        <div
          className="relative overflow-hidden rounded-[24px] backdrop-blur-xl"
          style={{
            background: 'linear-gradient(145deg, rgba(20,20,25,0.8) 0%, rgba(10,10,15,0.95) 100%)',
            border: `1px solid rgba(255,255,255,0.1)`,
            boxShadow: '0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Edge Glow */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none transition-colors duration-1000"
            style={{ background: `radial-gradient(circle at top left, ${activePillar.color}, transparent 60%)` }}
          />

          <div className="relative z-[1] flex flex-col lg:grid lg:grid-cols-[1.3fr_1fr] min-h-[500px]">
            
            {/* Image (Mobile Top, Desktop Right) */}
            <div className="order-1 lg:order-2 relative h-[250px] sm:h-[320px] lg:h-auto overflow-hidden lg:border-l border-white/10">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activePillar.image}
                  src={activePillar.image}
                  alt={activePillar.title}
                  initial={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </AnimatePresence>
            </div>

            {/* Content (Mobile Bottom, Desktop Left) */}
            <div className="order-2 lg:order-1 flex flex-col p-6 sm:p-8 lg:p-12 lg:pr-14">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePillar.id + '-content'}
                  initial={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="flex h-full flex-col"
                >
                  <div
                    className="mb-5 h-[3px] w-12 rounded-sm"
                    style={{ background: `linear-gradient(90deg, ${activePillar.color}, transparent)` }}
                  />
                  <h3 className="font-display mb-4 text-[clamp(1.6rem,3vw,2.4rem)] font-normal leading-[1.1] tracking-wide text-white">
                    {activePillar.title}
                  </h3>
                  <p className="mb-10 font-[family-name:var(--font-sans)] text-[16px] leading-relaxed text-white/70">
                    {activePillar.desc}
                  </p>

                  <div className="mb-10">
                    <p className="mb-5 font-[family-name:var(--font-sans)] text-[12px] font-bold uppercase tracking-[0.15em] text-white/40">
                      What's included
                    </p>
                    <ul className="m-0 grid grid-cols-1 sm:grid-cols-2 gap-3 p-0 list-none">
                      {activePillar.bullets.map((b) => (
                        <li
                          key={b}
                          className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-3 transition-colors hover:bg-white/[0.04]"
                        >
                          <span
                            className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
                            style={{
                              background: `rgba(${activePillar.rgb}, 0.15)`,
                              color: activePillar.color,
                            }}
                          >
                            <Check size={12} strokeWidth={3} />
                          </span>
                          <span className="font-[family-name:var(--font-sans)] text-[13.5px] leading-snug text-white/80">
                            {b}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto">
                    <button
                      type="button"
                      className="group inline-flex w-fit cursor-pointer items-center gap-3 rounded-full px-7 py-4 text-[15px] font-bold text-black transition-all hover:scale-105"
                      style={{
                        background: `linear-gradient(135deg, ${activePillar.color}, ${activePillar.color}ee)`,
                        boxShadow: `0 10px 24px rgba(${activePillar.rgb}, 0.3)`
                      }}
                      onClick={() => {
                        logCTAEvent(`Services CTA: ${activePillar.title}`)
                        navigate('/contact')
                      }}
                    >
                      Get Free Consultation
                      <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

export default ServicesSection
