/**
 * BlogPreviewSection — Dark section featuring recent insights.
 * Includes magnetic hover cards and an animated reading-time chip.
 */

import { type FC, useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useReveal } from '../../../hooks/useReveal'
import { useLeadTracker } from '../../../context/LeadTrackerContext'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { ArrowRight, Clock } from 'lucide-react'
import { getPublishedBlogs, type IBlogSummary } from '../services'


const FALLBACK_IMAGE = '/products/Arcade_Games_Calicut.avif'

type BlogCardData = {
  id: string
  slug: string
  title: string
  excerpt: string
  date: string
  readTime: string
  category: string
  img: string
}

const formatDate = (iso?: string): string => {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

// Schema doesn't store readTime or content in the summary response — approximate
// from excerpt length as a lightweight stand-in until word-count/content is available.
const estimateReadTime = (excerpt?: string): string => {
  const words = excerpt ? excerpt.trim().split(/\s+/).length : 0
  const minutes = Math.max(1, Math.round(words / 40))
  return `${minutes} min`
}

const mapBlogToCard = (b: IBlogSummary): BlogCardData => ({
  id: b._id,
  slug: b.slug,
  title: b.title,
  excerpt: b.excerpt || '',
  date: formatDate(b.publishedAt || b.createdAt),
  readTime: estimateReadTime(b.excerpt),
  category: b.tags?.[0] ? b.tags[0].charAt(0).toUpperCase() + b.tags[0].slice(1) : 'Insights',
  img: b.coverImage?.url || FALLBACK_IMAGE,
})

/* ── Magnetic Blog Card ───────────────────────────────────────── */
const BlogCard: FC<{ post: BlogCardData; index: number }> = ({ post, index }) => {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLAnchorElement>(null)
  const [hover, setHover] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const xSpring = useSpring(x, { stiffness: 150, damping: 20 })
  const ySpring = useSpring(y, { stiffness: 150, damping: 20 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (reduced || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    // Move card slightly toward cursor
    x.set((e.clientX - rect.left - rect.width / 2) * 0.05)
    y.set((e.clientY - rect.top - rect.height / 2) * 0.05)
  }

  const handleMouseLeave = () => {
    setHover(false)
    x.set(0)
    y.set(0)
  }

  return (
    <motion.a
      href={`/blog/${post.slug}`}
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      style={{
        ...(!reduced ? { x: xSpring, y: ySpring } : {}),
        display: 'flex', flexDirection: 'column',
        textDecoration: 'none',
        borderRadius: 20,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Image container */}
      <div style={{ height: 220, position: 'relative', overflow: 'hidden' }}>
        <motion.img
          src={post.img}
          alt={post.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          animate={{ scale: hover ? 1.05 : 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
        {/* Animated reading-time chip */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: hover ? 1 : 0, y: hover ? 0 : -10 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            color: '#fff', padding: '6px 12px', borderRadius: 100,
            display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600,
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <Clock size={12} />
          {post.readTime}
        </motion.div>
      </div>

      {/* Content */}
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700, color: '#5FC1D1', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {post.category}
          </span>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-3)' }}>
            {post.date}
          </span>
        </div>
        <h3 className="font-display" style={{ fontSize: 22, color: '#F5F5F7', lineHeight: 1.3, marginBottom: 12 }}>
          {post.title}
        </h3>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, flex: 1 }}>
          {post.excerpt}
        </p>

        {/* Animated read more link */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginTop: 24,
          fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 700,
          color: hover ? '#5FC1D1' : 'white',
          transition: 'color 0.3s ease'
        }}>
          Read full article
          <motion.div
            animate={{ x: hover ? 4 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <ArrowRight size={14} />
          </motion.div>
        </div>
      </div>
    </motion.a>
  )
}

/* ── BlogPreviewSection ───────────────────────────────────────── */
const BlogPreviewSection: FC = () => {
  const titleRef = useReveal()
  const { logCTAEvent } = useLeadTracker()

  const [posts, setPosts] = useState<BlogCardData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadBlogs = async () => {
      try {
        setIsLoading(true)
        setHasError(false)
        const res = await getPublishedBlogs({ page: 1, limit: 3 })
        console.log(res)
        if (!isMounted) return
        setPosts(res.blogs.map(mapBlogToCard))
      } catch {
        if (!isMounted) return
        setHasError(true)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadBlogs()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section id="blog" style={{ background: '#000', padding: 'clamp(48px, 8vw, 72px) clamp(16px, 4vw, 28px)', position: 'relative' }}>
      <div aria-hidden="true" className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.25, pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div ref={titleRef} className="reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24, marginBottom: 56 }}>
          <div>
            <div className="label" style={{ marginBottom: 16 }}>Insights</div>
            <h2 className="font-display landing-section-heading" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', margin: 0 }}>
              Blogs and Resources
            </h2>
          </div>
          <Link
            to="/blog"
            onClick={() => logCTAEvent('Landing: View All Insights')}
            className="btn btn-ghost"
          >
            View All Insights &rarr;
          </Link>
        </div>

        {/* Cards */}
        {isLoading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 14, padding: '40px 0' }}>
            Loading insights…
          </p>
        ) : hasError ? (
          <p style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 14, padding: '40px 0' }}>
            Couldn&apos;t load insights right now.
          </p>
        ) : posts.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 14, padding: '40px 0' }}>
            No insights published yet.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 24 }}>
            {posts.map((post, i) => (
              <BlogCard key={post.id} post={post} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default BlogPreviewSection