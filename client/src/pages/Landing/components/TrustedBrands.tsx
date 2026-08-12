/**
 * TrustedBrands — Partner showcase
 * Mobile: responsive card grid
 * Desktop: multi-row marquee
 */

import { type FC, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReveal } from '../../../hooks/useReveal'
import { X } from 'lucide-react'

interface BrandInfo {
  name: string
  note: string
  year: string
  category: string
  logo: string
}

const BRANDS: BrandInfo[] = [
  { name: 'Roongta Group', note: '4 bowling lanes installed across cinema multiplexes', year: '2022', category: 'Cinema / FEC', logo: '/brands/roongta.svg' },
  { name: 'Woop', note: 'Full FEC layout design and equipment supply', year: '2021', category: 'FEC', logo: '/brands/woop.svg' },
  { name: 'Shott', note: 'Pre-opening consulting and staffing framework', year: '2022', category: 'FEC', logo: '/brands/shott.svg' },
  { name: 'Idea Crate', note: 'Game selection, ROI modeling, operations setup', year: '2020', category: 'FEC', logo: '/brands/idea-crate.svg' },
  { name: 'Playaza', note: 'Arcade sourcing and redemption game distribution', year: '2023', category: 'Arcade', logo: '/brands/playaza.svg' },
  { name: 'KidZania', note: 'Equipment supply and venue advisory', year: '2019', category: 'FEC', logo: '/brands/kidzania.svg' },
  { name: 'Cinemax', note: 'FEC annexe consulting for multiplex lobby revenue', year: '2018', category: 'Cinema', logo: '/brands/cinemax.svg' },
  { name: 'Inox', note: 'Bowling and VR integration advisory', year: '2019', category: 'Cinema', logo: '/brands/inox.svg' },
  { name: 'Essel World', note: 'Major attraction sourcing and ops consulting', year: '2020', category: 'Theme Park', logo: '/brands/essel-world.svg' },
]

const BrandModal: FC<{ brand: BrandInfo; onClose: () => void }> = ({ brand, onClose }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[500] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[420px] rounded-2xl border border-white/10 bg-[#111118] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:p-7"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2 text-[#A1A1A6] transition-colors hover:text-[#F5F5F7]"
        >
          <X size={16} />
        </button>
        <div className="mb-3 inline-flex items-center rounded-full border border-[#5FC1D1]/30 bg-[#5FC1D1]/10 px-2.5 py-1">
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#5FC1D1]">
            {brand.category}
          </span>
        </div>
        {brand.logo ? (
          <img
            src={brand.logo}
            alt={brand.name}
            className="mb-4 h-16 sm:h-20 w-auto max-w-[250px] object-contain object-left drop-shadow-lg"
          />
        ) : (
          <h3 className="mb-2 font-display text-[clamp(1.35rem,4vw,1.75rem)] font-normal leading-tight text-[#F5F5F7]">
            {brand.name}
          </h3>
        )}
        <p className="mb-5 text-sm leading-relaxed text-[#A1A1A6]">{brand.note}</p>
        {brand.year ? (
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-black/40 px-3.5 py-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#636366]">Year</span>
            <span className="font-[family-name:var(--font-data)] text-lg font-extrabold text-[#F5F5F7]">
              {brand.year}
            </span>
          </div>
        ) : null}
      </motion.div>
    </motion.div>
  </AnimatePresence>
)

const BrandCard: FC<{
  brand: BrandInfo
  i: number
  onClick: () => void
  compact?: boolean
}> = ({ brand, i, onClick, compact }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex cursor-pointer flex-col items-start justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-left transition-[transform,border-color,background] duration-300 hover:-translate-y-0.5 hover:border-[#5FC1D1]/40 hover:bg-white/[0.05] ${
      compact
        ? 'min-h-[80px] w-full p-3 sm:p-3.5'
        : 'h-auto min-h-[100px] w-[min(220px,70vw)] shrink-0 px-4 py-4'
    }`}
  >
    <div className="mb-2 flex items-center gap-2">
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{
          background: i % 2 === 0 ? '#5FC1D1' : '#6DBD4E',
          boxShadow: `0 0 10px ${i % 2 === 0 ? 'rgba(95,193,209,0.55)' : 'rgba(109,189,78,0.55)'}`,
        }}
      />
      <span className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">
        {brand.category}
      </span>
    </div>
    {brand.logo ? (
      <div className="flex flex-1 w-full items-center">
        <img
          src={brand.logo}
          alt={brand.name}
          className={`w-auto max-w-full object-contain object-left drop-shadow-md ${
            compact ? 'h-[60px] sm:h-[70px]' : 'h-[80px] sm:h-[100px]'
          }`}
        />
      </div>
    ) : (
      <span
        className={`font-[family-name:var(--font-data)] font-extrabold leading-snug tracking-[-0.02em] text-white ${
          compact ? 'text-[15px] sm:text-base' : 'text-xl sm:text-2xl'
        }`}
      >
        {brand.name}
      </span>
    )}
  </button>
)

const TrustedBrands: FC<{ data?: { name: string, image?: { url: string, public_id: string } }[] }> = ({ data }) => {
  const ref = useReveal()
  const [selected, setSelected] = useState<BrandInfo | null>(null)

  const activeBrands: BrandInfo[] =
    data && Array.isArray(data)
      ? data.map(
          (dbBrand) => {
            const hardcodedBrand = BRANDS.find((b) => b.name === dbBrand.name);
            return {
              name: dbBrand.name,
              note: hardcodedBrand ? hardcodedBrand.note : 'Trusted partner.',
              year: hardcodedBrand ? hardcodedBrand.year : '',
              category: hardcodedBrand ? hardcodedBrand.category : 'FEC',
              logo: dbBrand.image?.url || (hardcodedBrand ? hardcodedBrand.logo : ''),
            };
          }
        )
      : BRANDS

  const chunkSize = Math.max(1, Math.ceil(activeBrands.length / 3))
  const rows = [
    activeBrands.slice(0, chunkSize),
    activeBrands.slice(chunkSize, chunkSize * 2),
    activeBrands.slice(chunkSize * 2),
  ].filter((r) => r.length > 0)

  return (
    <>
      <section
        id="trusted"
        className="relative overflow-hidden border-y border-white/[0.05] bg-black py-10 sm:py-14"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(95,193,209,0.05) 0%, transparent 60%)',
          }}
        />

        <div ref={ref} className="reveal relative z-[1]">
          <div className="mx-auto mb-7 max-w-[640px] px-4 text-center sm:mb-10 sm:px-6">
            <h2 className="font-display landing-section-heading mb-3 text-[clamp(1.5rem,4vw,2.75rem)]">
              Trusted by India&apos;s Leading
              <br />
              <span className="italic text-[#5FC1D1]">FEC &amp; Cinema Brands</span>
            </h2>
            <p className="mx-auto max-w-[480px] text-sm leading-relaxed text-white/60 sm:text-base">
              Tap any partner to see the consulting and equipment work we delivered.
            </p>
          </div>

          {/* Mobile / tablet: static grid — no horizontal overflow */}
          <div className="mx-auto grid max-w-[1100px] grid-cols-2 gap-2.5 px-4 sm:grid-cols-3 sm:gap-3 sm:px-6 lg:hidden">
            {activeBrands.map((brand, i) => (
              <BrandCard
                key={brand.name}
                brand={brand}
                i={i}
                compact
                onClick={() => setSelected(brand)}
              />
            ))}
          </div>

          {/* Desktop: marquee rows */}
          <div className="relative hidden flex-col gap-5 overflow-hidden lg:flex">
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-0 left-0 top-0 z-[2] w-24 bg-gradient-to-r from-black to-transparent xl:w-36"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-0 right-0 top-0 z-[2] w-24 bg-gradient-to-l from-black to-transparent xl:w-36"
            />

            {rows.map((row, rowIdx) => {
              // Ensure the repeating block has enough items to span wide screens
              let repeatBlock = [...row];
              while (repeatBlock.length < 15) {
                repeatBlock = [...repeatBlock, ...row];
              }
              
              return (
                <div
                  key={rowIdx}
                  className="flex w-max"
                  style={{
                    animation:
                      rowIdx % 2 === 0
                        ? `trusted-marquee-left ${30 + rowIdx * 5}s linear infinite`
                        : `trusted-marquee-right ${35 + rowIdx * 5}s linear infinite`,
                  }}
                >
                  {[0, 1].map((blockIdx) => (
                    <div key={blockIdx} className="flex shrink-0 gap-5 pr-5">
                      {repeatBlock.map((brand, i) => (
                        <BrandCard
                          key={`r${rowIdx}-b${blockIdx}-${i}`}
                          brand={brand}
                          i={i + rowIdx * 10}
                          onClick={() => setSelected(brand)}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        <style>{`
          @keyframes trusted-marquee-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes trusted-marquee-right {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          @media (prefers-reduced-motion: reduce) {
            #trusted [style*="trusted-marquee"] {
              animation: none !important;
              transform: none !important;
            }
          }
        `}</style>
      </section>

      {selected && <BrandModal brand={selected} onClose={() => setSelected(null)} />}
    </>
  )
}

export default TrustedBrands
