/**
 * Hero — Cinematic hero with rotating activity ticker, cursor parallax,
 * magnetic CTAs, and an authority micro-row.
 */

import { type FC, useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion'

import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { ChevronDown } from 'lucide-react'

const ACTIVITIES = [
  'Bowling Lanes',
  'VR Gaming',
  'Mini Golf',
  'Trampoline Parks',
  'Go-Kart Tracks',
  'Cricket Simulators',
  'Ziplines',
  'Rope Courses',
  'Soft Play Areas',
  'Laser Tag',
  'Bumper Cars',
  'Rock Climbing',
]

/** Rotating activity word in the hero heading */
const RotatingWord: FC<{ activities?: string[] }> = ({ activities = ACTIVITIES }) => {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)
  const reduced = useReducedMotion()

  const activeActivities = activities.length > 0 ? activities : ACTIVITIES

  useEffect(() => {
    if (reduced) return
    const cycle = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % activeActivities.length)
        setVisible(true)
      }, 350)
    }, 2500)
    return () => clearInterval(cycle)
  }, [activeActivities.length, reduced])

  return (
    <span
      style={{
        display: 'inline-block',
        whiteSpace: 'nowrap',
        maxWidth: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        background: 'linear-gradient(135deg, #7FD4E0 0%, #6DBD4E 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        paddingRight: '0.15em',
        paddingBottom: '0.1em',
      }}
    >
      {activeActivities[idx]}
    </span>
  )
}

/* ── Magnetic Button ──────────────────────────────────────────── */
const MagneticButton: FC<{
  children: React.ReactNode
  className?: string
  onClick?: () => void
  style?: React.CSSProperties
  'aria-label'?: string
}> = ({ children, className, onClick, style, 'aria-label': ariaLabel }) => {
  const reduced = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const xSpring = useSpring(x, { stiffness: 220, damping: 18 })
  const ySpring = useSpring(y, { stiffness: 220, damping: 18 })

  const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (reduced) return
    const rect = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - rect.left - rect.width / 2) * 0.28)
    y.set((e.clientY - rect.top - rect.height / 2) * 0.28)
  }
  const handleLeave = () => { x.set(0); y.set(0) }

  return (
    <motion.button
      className={className}
      style={{ ...style, x: xSpring, y: ySpring }}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      aria-label={ariaLabel}
    >
      {children}
    </motion.button>
  )
}
// @ts-ignore - MagneticButton is preserved for future use
const _MagneticButton = MagneticButton;

/* ── Hero ─────────────────────────────────────────────────────── */
const parseHighlights = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span key={i} style={{ color: '#FFAA33', fontWeight: 600 }}>
          {part.slice(2, -2)}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

const Hero: FC<{ data?: any, services?: any[] }> = ({ data, services }) => {
  // const navigate = useNavigate()
  // const { logCTAEvent } = useLeadTracker()
  const reduced = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)

  const activeActivities = data?.rotatingActivities?.length ? data.rotatingActivities : ACTIVITIES;

  // Cursor parallax
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  // const bg1X = useTransform(mouseX, [-1, 1], reduced ? [0, 0] : [-18, 18])
  // const bg1Y = useTransform(mouseY, [-1, 1], reduced ? [0, 0] : [-10, 10])
  const bg2X = useTransform(mouseX, [-1, 1], reduced ? [0, 0] : [-8, 8])
  const bg2Y = useTransform(mouseY, [-1, 1], reduced ? [0, 0] : [-5, 5])
  
  const rawCardRotateX = useTransform(mouseY, [-1, 1], reduced ? [0, 0] : [12, -12])
  const rawCardRotateY = useTransform(mouseX, [-1, 1], reduced ? [0, 0] : [-12, 12])
  const cardRotateX = useSpring(rawCardRotateX, { stiffness: 80, damping: 25 })
  const cardRotateY = useSpring(rawCardRotateY, { stiffness: 80, damping: 25 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (reduced) return
    const { clientX, clientY } = e
    mouseX.set((clientX / window.innerWidth) * 2 - 1)
    mouseY.set((clientY / window.innerHeight) * 2 - 1)
  }

  // Scroll cue visibility
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <section
      id="hero"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 128,
        paddingBottom: 'clamp(80px, 10vh, 120px)',
        background: '#000',
      }}
    >

      {/* ── Background Video ────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}>
        <motion.video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 1.5 }}
          src="/hero.mp4"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
      {/* ── Parallax Layer 2 (gradient overlay) ───────────────── */}
      <motion.div
        style={{
          position: 'absolute', inset: 0,
          x: bg2X, y: bg2Y,
          background: 'radial-gradient(ellipse 80% 70% at 40% 50%, rgba(95,193,209,0.07) 0%, transparyent 65%), radial-gradient(ellipse 60% 60% at 70% 60%, rgba(109,189,78,0.05) 0%, transparent 65%)',
        }}
        aria-hidden="true"
      />

      {/* ── Noise texture ─────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
          opacity: 0.03,
          pointerEvents: 'none',
        }}
      />

      {/* ── Grid overlay ──────────────────────────────────────── */}
      <div aria-hidden="true" className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.35, pointerEvents: 'none' }} />

      {/* ── Teal glow orb ─────────────────────────────────────── */}
      <div className="orb orb-teal" style={{ width: '50vw', height: '50vw', maxWidth: 800, maxHeight: 800, top: '-10%', left: '-5%', opacity: 0.7 }} />
      <div className="orb orb-green" style={{ width: '40vw', height: '40vw', maxWidth: 700, maxHeight: 700, bottom: '-15%', right: '-5%', opacity: 0.5 }} />

      {/* ── Content ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          width: '100%',
          maxWidth: 1300,
          padding: 'clamp(0px, 2vw, 0px) clamp(16px, 5vw, 32px)',
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: 'clamp(28px, 5vw, 72px)',
          alignItems: 'center'
        }}
      >
        {/* ── LEFT COLUMN ── */}
        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 24 }}
          >
            <div style={{
              padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 20px)',
              borderRadius: 100,
              background: 'rgba(95,193,209,0.12)',
              border: '1px solid rgba(95,193,209,0.4)',
              boxShadow: '0 0 24px rgba(95,193,209,0.25), inset 0 0 12px rgba(95,193,209,0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: 6, height: 6, borderRadius: '50%', background: '#5FC1D1',
                  boxShadow: '0 0 8px #5FC1D1, 0 0 16px #5FC1D1'
                }}
              />
              <span style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(9px, 2.5vw, 11px)',
                fontWeight: 800,
                letterSpacing: 'clamp(0.08em, 1.5vw, 0.18em)',
                textTransform: 'uppercase',
                color: '#F5F5F7',
                textShadow: '0 0 12px rgba(95,193,209,0.8)',
                whiteSpace: 'nowrap'
              }}>
                {data?.eyebrow || "India's Premier FEC Authority"}
              </span>
            </div>
          </motion.div>

          {/* H1 — DM Serif Display, featuring rotating text */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-display"
            style={{
              fontSize: 'clamp(1.75rem, 3.8vw, 3.25rem)',
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              marginBottom: 0,
            }}
          >
            <span style={{ display: 'block', fontSize: '0.85em', marginBottom: 8, color: '#F5F5F7', letterSpacing: '-0.01em' }}>{data?.headingPrefix || "Consulting & Setup For"}</span>
            <span style={{
              display: 'flex',
              height: 'clamp(2rem, 4.2vw, 3.8rem)',
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingTop: 4,
            }}>
              <RotatingWord activities={activeActivities} />
            </span>
          </motion.h1>

          {/* Sub headline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'var(--font-sans)',
              color: 'rgba(255,255,255,0.7)',
              fontSize: 'clamp(1rem, 1.4vw, 1.15rem)',
              lineHeight: 1.7,
              maxWidth: 580,
              margin: '20px 0 36px 0',
              fontWeight: 400,
            }}
          >
            {parseHighlights(data?.subheadline || "Turn your space into a **\"thriving entertainment business\"**. We provide end-to-end setup, equipment, and operations backed by **17+ years** and **50+ venues** across India.")}
          </motion.p>

          {/* Activity chips row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'flex', gap: 8, justifyContent: 'flex-start', flexWrap: 'wrap',
              marginBottom: 44, maxWidth: 500
            }}
          >
            {activeActivities.slice(0, 6).map((a: string) => (
              <div key={a} style={{
                padding: '6px 14px',
                borderRadius: 100,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
                fontFamily: 'var(--font-sans)',
                fontSize: 11, fontWeight: 600,
                letterSpacing: '0.06em',
                color: 'rgba(255,255,255,0.4)',
              }}>
                {a}
              </div>
            ))}
            <div style={{
              padding: '6px 14px', borderRadius: 100,
              background: 'rgba(95,193,209,0.08)',
              border: '1px solid rgba(95,193,209,0.2)',
              fontFamily: 'var(--font-sans)',
              fontSize: 11, fontWeight: 600,
              letterSpacing: '0.06em',
              color: '#5FC1D1',
            }}>
              +6 more
            </div>
          </motion.div>



          {/* Certification Logos */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'flex-start', alignItems: 'center', marginTop: 'clamp(28px,4vw,48px)', flexWrap: 'wrap' }}
          >
            <div
              title="IAAPA Member"
              style={{
                display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 14px)',
                padding: 'clamp(4px, 1vw, 8px) clamp(8px, 2vw, 16px)', borderRadius: 16,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(8px)',
                cursor: 'default',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <img
                src="/iaapa.png"
                alt="IAAPA"
                style={{ height: 'clamp(40px, 8vw, 56px)', width: 'auto', maxWidth: 200, objectFit: 'contain', display: 'block' }}
              />
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(8.5px, 1.5vw, 10px)', color: '#fff', fontWeight: 800, textTransform: 'uppercase', lineHeight: 1.3, borderLeft: '2px solid rgba(255,255,255,0.4)', paddingLeft: 'clamp(8px, 1.5vw, 12px)', letterSpacing: '0.1em' }}>Member<br />Certified</div>
            </div>

            <div
              title="ISO 9001:2015 Certified"
              style={{
                display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 14px)',
                padding: 'clamp(4px, 1vw, 8px) clamp(8px, 2vw, 16px)', borderRadius: 16,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(8px)',
                cursor: 'default',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <img
                src="/iso.jpg"
                alt="ISO"
                style={{ height: 'clamp(44px, 9vw, 64px)', width: 'auto', objectFit: 'contain', display: 'block', borderRadius: 4 }}
              />
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(8.5px, 1.5vw, 10px)', color: '#fff', fontWeight: 800, textTransform: 'uppercase', lineHeight: 1.3, borderLeft: '2px solid rgba(255,255,255,0.4)', paddingLeft: 'clamp(8px, 1.5vw, 12px)', letterSpacing: '0.1em' }}>9001:2015<br />Certified</div>
            </div>
          </motion.div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', perspective: 1000 }}
        >
          <motion.div 
            animate={reduced ? {} : { y: [-12, 12, -12] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            style={{
            rotateX: cardRotateX,
            rotateY: cardRotateY,
            background: 'rgba(20,20,30,0.4)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderTop: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 32,
            padding: 'clamp(24px, 5vw, 48px) clamp(20px, 4vw, 40px)',
            boxShadow: '0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
            width: '100%',
            maxWidth: 480,
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Subtle top corner glow */}
            <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: '#5FC1D1', filter: 'blur(80px)', opacity: 0.15, pointerEvents: 'none' }} />

            <h3 style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 12,
              fontWeight: 800,
              color: '#5FC1D1',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              marginBottom: 'clamp(24px, 4vw, 48px)',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#5FC1D1', boxShadow: '0 0 12px #5FC1D1' }} />
              End-to-End Solutions
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(20px, 3vw, 36px)', position: 'relative' }}>
              {/* Vertical timeline line */}
              <div style={{ position: 'absolute', left: 15, top: 24, bottom: 24, width: 2, background: 'linear-gradient(to bottom, rgba(95,193,209,0.3) 0%, rgba(109,189,78,0.3) 50%, rgba(155,81,224,0.3) 100%)', zIndex: 0 }} />

              {(services?.length ? services.slice(0, 3) : [
                { title: 'Pre-Opening Consulting', desc: 'Data-driven location analysis, ROI modeling, and 3D architectural design.', color: '#5FC1D1' },
                { title: 'Operations Management', desc: 'Staff training, operational SOPs, and full facility management.', color: '#6DBD4E' },
                { title: 'Equipment Supply', desc: 'Procurement of premium arcade games, bowling lanes, and global sourcing.', color: '#9B51E0' },
              ]).map((item, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + (i * 0.15) }}
                  whileHover={{ x: 8 }}
                  style={{ display: 'flex', gap: 24, alignItems: 'flex-start', position: 'relative', zIndex: 1, cursor: 'default' }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: '#0B0B0F',
                    border: `2px solid ${item.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: item.color, fontSize: 13, fontWeight: 900,
                    flexShrink: 0,
                    boxShadow: `0 0 24px ${item.color}40`,
                    marginTop: 2
                  }}>
                    {i + 1}
                  </div>
                  <div>
                    <h4 style={{ 
                      fontFamily: 'var(--font-sans)', 
                      color: '#fff', 
                      fontSize: 'clamp(14px, 1.5vw, 18px)', 
                      fontWeight: 700, 
                      margin: '0 0 6px 0',
                      letterSpacing: '-0.01em'
                    }}>
                      {item.title}
                    </h4>
                    <p 
                      style={{ 
                        fontFamily: 'var(--font-sans)', 
                        color: 'rgba(255,255,255,0.5)', 
                        fontSize: 'clamp(12px, 1.2vw, 15px)', 
                        margin: 0, 
                        lineHeight: 1.6,
                        maxWidth: '90%',
                        transition: 'color 0.3s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                    >
                      {item.shortDescription || item.subtitle || item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ── Scroll cue ────────────────────────────────────────── */}
      <AnimatePresence>
        {!scrolled && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'absolute',
              bottom: 36,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              color: 'rgba(255,255,255,0.3)',
              zIndex: 2,
            }}
            aria-hidden="true"
          >
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              Scroll
            </span>
            <motion.div
              animate={reduced ? {} : { y: [0, 6, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDown size={18} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default Hero
