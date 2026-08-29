/**
 * ProductsSection — Distribution / Equipment Attractions
 * Redesign v2: vivid background (no scale/blur), two-column layout,
 * rich category cards, crisp right-side image panel.
 */

import { type FC, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useReveal } from '../../../hooks/useReveal'
import { useLeadTracker } from '../../../context/LeadTrackerContext'
import { Plus, Check, ArrowRight, BarChart } from 'lucide-react'



const ATTRACTION_TAGS = [
  'Bowling Lanes', 'VR Gaming', 'Mini Golf', 'Trampoline Parks',
  'Go-Kart Tracks', 'Cricket Simulators', 'Ziplines', 'Rope Courses',
  'Soft Play Areas', 'Laser Tag', 'Bumper Cars', 'Rock Climbing',
]

const ProductsSection: FC<{ data?: any }> = ({ data }) => {
  const titleRef = useReveal()
  const { state, addToEnquiry, logCTAEvent } = useLeadTracker()
  const [activeIdx, setActiveIdx] = useState<number>(0)
  let equipmentTags = ATTRACTION_TAGS;
  if (data?.equipmentTags?.length) {
    // Sometimes the CMS saves arrays as a single stringified JSON array inside another array
    if (data.equipmentTags.length === 1 && typeof data.equipmentTags[0] === 'string' && data.equipmentTags[0].startsWith('[')) {
      try {
        equipmentTags = JSON.parse(data.equipmentTags[0]);
      } catch (e) {
        equipmentTags = data.equipmentTags;
      }
    } else {
      equipmentTags = data.equipmentTags;
    }
  }

  const isAdded = (id: string) => state.enquiryCart.some(item => item.id === id)

  // Helper to convert hex to rgb
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` : '255,255,255';
  };

  const activeCategories = data?.productCategories?.length ? data.productCategories.map((cat: any, i: number) => ({
    id: `cat-${i}`,
    num: String(i + 1).padStart(2, '0'),
    title: cat.title,
    desc: cat.desc,
    icon: cat.icon,
    count: cat.count,
    color: cat.color || '#ffffff',
    rgb: hexToRgb(cat.color || '#ffffff'),
    image: cat.image?.url || '',
  })) : [];

  const activeCat = activeCategories[activeIdx] || { rgb: '255,255,255', image: '', title: '', id: 'empty' }

  return (
    <section
      id="products"
      style={{ background: '#0B0B0F', position: 'relative', overflow: 'hidden' }}
    >
      {/* Ambient glow behind everything */}
      <AnimatePresence>
        {activeCategories.map((cat: any, i: number) =>
          activeIdx === i ? (
            <motion.div
              key={cat.id + '-ambient'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              style={{
                position: 'absolute',
                top: '10%',
                right: '-5%',
                width: '70vw',
                height: '70vw',
                background: `radial-gradient(circle at center, rgba(${cat.rgb}, 0.12) 0%, transparent 65%)`,
                filter: 'blur(80px)',
                zIndex: 0,
                pointerEvents: 'none',
              }}
            />
          ) : null
        )}
      </AnimatePresence>

      {/* Content */}
      <div
        style={{
          maxWidth: 1280,
          width: '100%',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
          padding: 'clamp(32px, 5vw, 64px) clamp(20px, 5vw, 40px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(48px, 7vw, 80px)',
        }}
      >
        {/* Top Header Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'flex-start', justifyContent: 'space-between' }}>
          {/* Title */}
          <div ref={titleRef} className="reveal" style={{ maxWidth: 800, flex: '1 1 min(100%, 600px)' }}>
            <div className="label" style={{ marginBottom: 24, display: 'inline-block', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: 100, fontSize: 12, letterSpacing: '0.1em', background: 'rgba(255,255,255,0.03)' }}>Distribution</div>
            <h2
              className="font-display landing-section-heading"
              style={{ fontWeight: 400, fontSize: 'clamp(2.5rem, 5vw, 4rem)', margin: 0, lineHeight: 1.1 }}
            >
              Equipment &amp; Attractions.
            </h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 18, color: 'var(--text-2)', margin: '24px 0 0', lineHeight: 1.7, maxWidth: 680 }}>
              We source and distribute world-class FEC equipment globally — from a single arcade cabinet
              to a complete multi-zone entertainment destination.
            </p>
          </div>
          
          {/* ROI Link moved to top */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ flex: '1 1 auto', marginTop: 12 }}
          >
            <Link
              to="/franchise"
              onClick={() => logCTAEvent('Landing: View ROI Models')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: 'clamp(12px, 1.5vw, 20px) clamp(20px, 3vw, 40px)',
                borderRadius: 100,
                background: 'linear-gradient(135deg, #FFAA33 0%, #FF8C00 100%)',
                border: 'none',
                color: '#000',
                textDecoration: 'none',
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(14px, 1.2vw, 18px)',
                fontWeight: 800,
                boxShadow: '0 12px 32px rgba(255,170,51,0.4)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 48px rgba(255,170,51,0.6), inset 0 0 0 1px rgba(255,255,255,0.5)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(255,170,51,0.4)'
              }}
            >
              <BarChart size={20} />
              View Game ROI Models
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>

        {/* Two-column: list + image card */}
        <div
          className="distribution-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) minmax(340px, 440px)',
            gap: 'clamp(24px, 5vw, 80px)',
            alignItems: 'center',
          }}
        >
          {/* Left: category list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {activeCategories.map((cat: any, i: number) => {
              const isActive = activeIdx === i

              return (
                <div
                  key={cat.id}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isActive}
                  onMouseEnter={() => setActiveIdx(i)}
                  onClick={() => setActiveIdx(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setActiveIdx(i)
                    }
                  }}
                  style={{
                    position: 'relative',
                    padding: 'clamp(16px, 2.5vw, 24px) clamp(16px, 2.5vw, 24px)',
                    cursor: 'pointer',
                    opacity: isActive ? 1 : 0.5,
                    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    background: isActive ? `linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)` : 'transparent',
                    borderRadius: 20,
                    border: isActive ? `1px solid rgba(255,255,255,0.1)` : '1px solid transparent',
                    borderBottom: !isActive && i !== activeCategories.length - 1 ? '1px solid rgba(255,255,255,0.06)' : (isActive ? `1px solid rgba(255,255,255,0.1)` : '1px solid transparent'),
                    boxShadow: isActive ? `0 16px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)` : 'none',
                    backdropFilter: isActive ? 'blur(20px)' : 'none',
                    transform: isActive ? 'scale(1.02)' : 'scale(1)',
                    zIndex: isActive ? 10 : 1,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px 16px' }}>
                    {/* Active accent bar */}
                    {isActive && (
                      <motion.div
                        layoutId="accent-bar"
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: '20%',
                          bottom: '20%',
                          width: 4,
                          borderRadius: 4,
                          background: cat.color,
                          boxShadow: `0 0 12px ${cat.color}`,
                        }}
                      />
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(14px, 2vw, 24px)', flex: '1 1 auto', minWidth: 0 }}>
                      <span style={{
                        fontFamily: 'var(--font-data)',
                        fontSize: 'clamp(1rem, 2vw, 1.4rem)',
                        fontWeight: 300,
                        color: isActive ? cat.color : 'rgba(255,255,255,0.2)',
                        transition: 'color 0.4s ease',
                        minWidth: '2ch',
                      }}>
                        {cat.num}
                      </span>
                      <h3
                        className="font-display"
                        style={{
                          margin: 0,
                          fontSize: 'clamp(1.2rem, 2.5vw, 2rem)',
                          fontWeight: 400,
                          letterSpacing: '-0.02em',
                          color: isActive ? '#fff' : 'rgba(255,255,255,0.75)',
                          transition: 'color 0.4s ease, transform 0.4s ease',
                          transform: isActive ? 'translateX(8px)' : 'translateX(0)',
                        }}
                      >
                        {cat.title}
                      </h3>
                    </div>
                  </div>

                  {/* Expanding detail card */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateRows: isActive ? '1fr' : '0fr',
                      transition: 'grid-template-rows 0.5s cubic-bezier(0.16,1,0.3,1)',
                      overflow: 'hidden',
                      paddingLeft: 'clamp(40px, 4vw, 56px)', // Align with title
                    }}
                  >
                    <div style={{ minHeight: 0 }}>
                      <div
                        style={{
                          paddingTop: 12,
                          opacity: isActive ? 1 : 0,
                          transition: 'opacity 0.4s ease 0.1s',
                        }}
                      >
                        <p style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: 14,
                          color: 'rgba(255,255,255,0.85)',
                          lineHeight: 1.6,
                          marginBottom: 20,
                          maxWidth: 480,
                        }}>
                          {cat.desc}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                          <span style={{
                            fontFamily: 'var(--font-data)',
                            fontSize: 'clamp(10px, 1.5vw, 12px)',
                            fontWeight: 700,
                            color: cat.color,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            background: `rgba(${cat.rgb},0.12)`,
                            padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 2.5vw, 16px)',
                            borderRadius: 100,
                            border: `1px solid rgba(${cat.rgb},0.22)`,
                          }}>
                            <span style={{ fontSize: 'clamp(14px, 2vw, 16px)' }}>{cat.icon}</span>
                            {cat.count}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              addToEnquiry({ id: cat.id, type: 'product', title: cat.title })
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: 'clamp(8px, 1.5vw, 10px) clamp(16px, 2.5vw, 24px)',
                              borderRadius: 100,
                              border: '1px solid transparent',
                              background: isAdded(cat.id) ? 'rgba(255,255,255,0.1)' : '#fff',
                              color: isAdded(cat.id) ? '#fff' : '#000',
                              fontFamily: 'var(--font-sans)',
                              fontSize: 'clamp(12px, 1.5vw, 14px)',
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              boxShadow: isAdded(cat.id) ? 'none' : `0 8px 24px rgba(255,255,255,0.15)`,
                            }}
                            onMouseEnter={e => {
                              if (!isAdded(cat.id)) {
                                e.currentTarget.style.transform = 'translateY(-2px)'
                                e.currentTarget.style.boxShadow = `0 12px 32px rgba(255,255,255,0.25)`
                              }
                            }}
                            onMouseLeave={e => {
                              if (!isAdded(cat.id)) {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = `0 8px 24px rgba(255,255,255,0.15)`
                              }
                            }}
                          >
                            {isAdded(cat.id) ? <><Check size={16} /> Added</> : <><Plus size={16} /> Add to Enquiry</>}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right: vivid image card */}
          <div
            className="distribution-image-card"
            style={{
              position: 'relative',
              borderRadius: 32,
              overflow: 'hidden',
              aspectRatio: '3 / 4.2',
              boxShadow: `0 40px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.1), 0 20px 60px rgba(${activeCat.rgb}, 0.2)`,
              flexShrink: 0,
            }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={activeCat.id}
                src={activeCat.image}
                alt={activeCat.title}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  display: 'block',
                }}
              />
            </AnimatePresence>
            {/* Bottom overlay for label */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 40%, transparent 60%)',
              pointerEvents: 'none',
            }} />
            {/* Inner border for glass effect */}
            <div style={{
              position: 'absolute', inset: 0,
              borderRadius: 32,
              border: '1px solid rgba(255,255,255,0.15)',
              pointerEvents: 'none',
            }} />
            
            {/* Label */}
            <motion.div
              key={activeCat.id + '-label'}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              style={{ position: 'absolute', bottom: 32, left: 32, right: 32 }}
            >
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                fontFamily: 'var(--font-data)',
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#fff',
                background: `rgba(${activeCat.rgb},0.8)`,
                padding: '10px 20px',
                borderRadius: 100,
                backdropFilter: 'blur(10px)',
                boxShadow: `0 8px 24px rgba(0,0,0,0.3)`,
              }}>
                <span style={{ fontSize: 18 }}>{activeCat.icon}</span> {activeCat.title}
              </span>
            </motion.div>
          </div>
        </div>

        {/* Bottom: tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(32px, 4vw, 48px)', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 40, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ flex: '1 1 min(100%, 300px)', maxWidth: 800, minWidth: 0 }}>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ fontFamily: 'var(--font-data)', fontSize: 13, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#fff', marginBottom: 24 }}
            >
              Equipment Types We Cover
            </motion.p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {equipmentTags.map((tag: string, i: number) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  style={{
                    padding: '12px 20px',
                    borderRadius: 100,
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: 600,
                    fontFamily: 'var(--font-sans)',
                    background: 'rgba(255,255,255,0.05)',
                    transition: 'all 0.3s ease',
                    cursor: 'default',
                    display: 'inline-block',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .distribution-grid { grid-template-columns: 1fr !important; }
          .distribution-image-card { display: none !important; }
        }
        @media (max-width: 640px) {
          .distribution-grid { gap: 16px !important; }
        }
      `}</style>
    </section>
  )
}

export default ProductsSection
