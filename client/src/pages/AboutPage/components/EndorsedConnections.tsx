import type { FC } from 'react'
import { motion } from 'framer-motion'
import { Network } from 'lucide-react'

export interface Partner {
  name: string
  logo: string
}

interface EndorsedConnectionsProps {
  partners: Partner[]
}

const EndorsedConnections: FC<EndorsedConnectionsProps> = ({ partners }) => {
  if (!partners || partners.length === 0) return null

  // Duplicate the list so the loop can reset seamlessly at -50%
  const loopPartners = [...partners, ...partners]

  return (
    <section
      aria-labelledby="about-partners-heading"
      className="border-t border-white/[0.08] py-8 sm:py-10"
    >
      <div className="mb-6 flex items-center gap-2 px-4 sm:px-6">
        <Network size={16} className="shrink-0 text-[#5FC1D1]" />
        <h2
          id="about-partners-heading"
          className="font-display text-[clamp(1.25rem,4vw,2rem)] font-extrabold tracking-[-0.02em] text-[#F5F5F7]"
        >
          Endorsed Connection With
        </h2>
      </div>

      <div className="group relative w-full overflow-hidden">
        {/* Edge fades matching the section's dark background */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#0A0A0F] to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#0A0A0F] to-transparent sm:w-24" />

        <motion.div
          className="flex w-max items-center gap-4 sm:gap-6"
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            duration: 28,
            ease: 'linear',
            repeat: Infinity,
          }}
          style={{ willChange: 'transform' }}
          whileHover={{ transitionDuration: '0s' }}
        >
          {loopPartners.map((partner, i) => (
            <div
              key={`${partner.name}-${i}`}
              className="flex h-20 w-40 shrink-0 items-center justify-center rounded-xl bg-white px-4 shadow-[0_4px_14px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(95,193,209,0.25)] sm:h-24 sm:w-48"
              title={partner.name}
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="max-h-12 w-auto max-w-full object-contain opacity-90 transition-opacity duration-300 hover:opacity-100 sm:max-h-16"
                loading="lazy"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default EndorsedConnections
