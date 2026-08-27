import { type FC, useRef } from 'react'
import { motion } from 'framer-motion'

const VideoShowcase: FC = () => {
  const containerRef = useRef<HTMLElement>(null)

  return (
    <section
      id="video-showcase"
      ref={containerRef}
      className="bg-black pt-[clamp(40px,7vw,100px)]"
    >
      <div className="mx-auto mb-[clamp(20px,4vw,48px)] max-w-[1100px] px-4 text-center sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8 }}
          className="font-display landing-section-heading text-[clamp(1.5rem,5vw,3.5rem)] leading-[1.12] tracking-[-0.02em]"
        >
          <span className="block sm:inline">Immersive Experiences,</span>{' '}
          <span className="block italic text-[#5FC1D1] sm:inline">Engineered.</span>
        </motion.h2>
      </div>

      <div className="relative mx-auto w-full max-w-[1200px] bg-black px-4 sm:px-6">
        <motion.video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          src="/showcase.mp4"
          className="w-full max-h-[70vh] object-contain block mx-auto rounded-lg"
        />
      </div>
    </section>
  )
}

export default VideoShowcase
