/**
 * FranchiseOfferings — Product categories showcase
 * Highly professional, typography-led Bento-box display
 */
import { type FC } from 'react'
import { theme } from '../../../theme'
import { useReveal } from '../../../hooks/useReveal'
import type { IFranchiseOffering } from '../../../services/franchisePageApi'
import OptimizedImage from '../../../components/common/OptimizedImage'

const HARDCODED_MAJOR_ATTRACTIONS = [
  { id: '01', label: 'Bowling Infrastructure', desc: 'Professional lanes, string pinsetters, and premium ball returns. The ultimate anchor attraction.', size: 'large', color: '#5FC1D1', image: '/franchise/f_bowling.png' },
  { id: '02', label: 'Arcade & Simulators', desc: 'Next-gen video cabinets and multiplayer racing simulators.', size: 'wide', color: '#6DBD4E', image: '/franchise/f_arcade.png' },
  { id: '03', label: 'Virtual Reality', desc: 'Immersive free-roam arenas and interactive VR pods.', size: 'tall', color: '#5FC1D1', image: '/franchise/f_vr.png' },
  { id: '04', label: 'Redemption', desc: 'Ticket-based skill games driving high replay value.', size: 'standard', color: '#FFAA33', image: '/franchise/f_redemption.png' },
  { id: '05', label: 'Prize Vending', desc: 'High-ROI automated merchandisers.', size: 'standard', color: '#C084FC', image: '/franchise/f_vending.png' },
  { id: '06', label: 'Toddler Zones', desc: 'Safe, engaging soft play and interactive kiddie rides.', size: 'standard', color: '#6DBD4E', image: '/about/gallery_trampoline.png' },
  { id: '07', label: 'Carnival Attractions', desc: 'Classic midway games reimagined for modern FECs.', size: 'standard', color: '#FFAA33', image: '/about/gallery_lasertag.png' },
  { id: '08', label: 'Cashless Systems', desc: 'End-to-end facility management and debit card readers.', size: 'wide', color: '#C084FC', image: '/about/gallery_arcade.png' },
  { id: '09', label: 'Pre-Owned Hardware', desc: 'Fully refurbished, certified premium machines.', size: 'standard', color: '#5FC1D1', image: '/about/gallery_gokart.png' },
  { id: '10', label: 'Spares & Support', desc: 'Lifetime operational backing and technical parts.', size: 'standard', color: '#6DBD4E', image: '/about/about_hero_fec.png' },
]

const OTHER_HORIZONS = [
  'Restaurants & Cafés',
  'Banquet Halls',
  'Open Lawn Spaces',
  'Selfie & Insta Zones',
  'Outdoor Theme Rides',
  'F&B Kiosks',
  'Bumper Cars',
]

interface FranchiseOfferingsProps {
  offerings?: IFranchiseOffering[];
}

const FranchiseOfferings: FC<FranchiseOfferingsProps> = ({ offerings = [] }) => {
  const headRef = useReveal()
  const gridRef = useReveal()

  // Map dynamic offerings onto the hardcoded layout specs (id, size, color)
  const displayOfferings = (offerings.length > 0 ? offerings : HARDCODED_MAJOR_ATTRACTIONS).map((p, i) => {
    const defaultSpec = HARDCODED_MAJOR_ATTRACTIONS[i % HARDCODED_MAJOR_ATTRACTIONS.length];
    return {
      id: defaultSpec.id,
      label: p.label,
      desc: p.desc,
      size: defaultSpec.size,
      color: defaultSpec.color,
      image: 'image' in p && (p.image as any)?.url ? (p.image as any).url : ('image' in p && typeof p.image === 'string' ? p.image : defaultSpec.image),
    };
  });

  return (
    <section
      style={{
        background: theme.colors.void,
        padding: '40px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div ref={headRef} className="reveal" style={{ textAlign: 'center', marginBottom: 28 }}>
          <div className="label" style={{ justifyContent: 'center', marginBottom: 8 }}>
            Our Catalogue
          </div>
          <h2 className="font-display text-metallic" style={{
            fontSize: 'clamp(1.35rem, 2.8vw, 1.85rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: 8,
          }}>
            700+ global attractions
          </h2>
          <p style={{ color: theme.colors.text2, fontSize: 14, maxWidth: 480, margin: '0 auto' }}>
            Procure, install and maintain world-class entertainment technology.
          </p>
        </div>

        {/* Bento Grid */}
        <div ref={gridRef} className="reveal">
          <div className="bento-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            marginBottom: 24,
          }}>
            {displayOfferings.map((item) => {
              const isLarge = item.size === 'large'
              const isWide = item.size === 'wide'
              const isTall = item.size === 'tall'
              
              return (
                <div
                  key={item.id}
                  className={`bento-item ${item.size}`}
                  style={{
                    borderRadius: 16,
                    background: '#0A0A0F',
                    border: `1px solid ${item.color}15`,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    minHeight: isLarge ? 400 : (isTall ? 300 : 250),
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = `${item.color}30`;
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 10px 30px ${item.color}10`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = `${item.color}15`;
                    (e.currentTarget as HTMLElement).style.transform = 'none';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  <div className="relative w-full flex-grow overflow-hidden bg-black">
                    <OptimizedImage src={item.image} alt={item.label} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" decoding="async" />
                  </div>

                  {/* Subtle top accent line */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${item.color}, transparent)`, zIndex: 10 }} />
                  
                  <div style={{ padding: '20px', background: '#0A0A0F', position: 'relative', zIndex: 10, borderTop: `1px solid ${item.color}15` }}>
                    <div style={{ 
                      fontFamily: theme.typography.fontDisplay,
                      fontWeight: 600,
                      fontSize: 12,
                      color: item.color,
                      marginBottom: 6,
                      letterSpacing: '0.1em',
                    }}>
                      {item.id}
                    </div>
                    
                    <div>
                      <div style={{
                        fontFamily: theme.typography.fontDisplay,
                        fontWeight: 600,
                        fontSize: isLarge ? 28 : (isWide ? 22 : 18),
                        color: theme.colors.text1,
                        lineHeight: 1.2,
                        letterSpacing: '-0.02em',
                        marginBottom: (isLarge || isWide || isTall) ? 10 : 0,
                      }}>
                        {item.label}
                      </div>
                      
                      {/* Only show description on larger cards to keep small cards ultra-clean */}
                      {(isLarge || isWide || isTall) && (
                        <div style={{ 
                          color: theme.colors.text2, 
                          fontSize: 14, 
                          fontFamily: theme.typography.fontBody,
                          lineHeight: 1.6,
                        }}>
                          {item.desc}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Supplementary Revenue Streams — Sleek Glowing Tags */}
          <div className="supplementary-revenue" style={{
            padding: '24px 20px',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.02), transparent)',
            borderRadius: 16,
            border: `1px solid rgba(255,255,255,0.05)`,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Glowing top line */}
            <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 1, background: `linear-gradient(90deg, transparent, ${theme.colors.teal}80, transparent)` }} />
            
            <h3 style={{ 
              fontSize: 13, 
              color: theme.colors.teal, 
              fontWeight: 700, 
              letterSpacing: '0.15em', 
              textTransform: 'uppercase', 
              marginBottom: 32,
              fontFamily: theme.typography.fontDisplay 
            }}>
              Supplementary Revenue Streams
            </h3>
            
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 16, 
              justifyContent: 'center',
            }}>
              {OTHER_HORIZONS.map((item) => (
                <div
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '16px 24px',
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid rgba(255,255,255,0.08)`,
                    borderRadius: 12, // Sophisticated rounded rectangle
                    fontSize: 15,
                    color: theme.colors.text1,
                    fontFamily: theme.typography.fontBody,
                    fontWeight: 500,
                    transition: 'all 0.3s ease',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                    (e.currentTarget as HTMLElement).style.borderColor = `${theme.colors.teal}80`;
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px rgba(95, 193, 209, 0.15)`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                    (e.currentTarget as HTMLElement).style.transform = 'none';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  <div style={{ 
                    width: 6, 
                    height: 6, 
                    borderRadius: '50%', 
                    background: theme.colors.teal, 
                    boxShadow: `0 0 10px ${theme.colors.teal}` 
                  }} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* Desktop Bento */
        .bento-grid {
          grid-template-columns: repeat(4, 1fr);
          grid-auto-flow: dense;
        }
        .bento-item.large { grid-column: span 2; grid-row: span 2; }
        .bento-item.wide { grid-column: span 2; }
        .bento-item.tall { grid-row: span 2; }
        .bento-item.standard { grid-column: span 1; grid-row: span 1; }

        /* Tablet Bento */
        @media (max-width: 900px) {
          .bento-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .bento-item.large { grid-column: span 2; grid-row: span 2; }
          .bento-item.wide { grid-column: span 2; }
          .bento-item.tall { grid-column: span 1; grid-row: span 1; }
          .bento-item.standard { grid-column: span 1; }
        }

        /* Mobile Stack */
        @media (max-width: 520px) {
          .bento-grid { grid-template-columns: 1fr !important; }
          .bento-item { grid-column: span 1 !important; grid-row: span 1 !important; padding: 24px !important; }
          .supplementary-revenue { padding: 32px 16px !important; border-radius: 16px !important; }
        }
      `}</style>
    </section>
  )
}

export default FranchiseOfferings

