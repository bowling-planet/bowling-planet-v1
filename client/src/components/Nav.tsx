import { useState, useEffect, type FC } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLeadTracker } from '../context/LeadTrackerContext'

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Services', path: '/services' },
  { label: 'Projects', path: '/projects' },
  { label: 'Products', path: '/products' },
  { label: 'Careers', path: '/careers' },
  { label: 'Blog', path: '/blog' },
  { label: 'Franchise', path: '/franchise' },
]

const Nav: FC = () => {
  const [solid, setSolid] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { isAuthenticated } = useAuth()
  const { logCTAEvent } = useLeadTracker()
  const location = useLocation()

  /* ── Scroll solid ─────────────────────── */
  useEffect(() => {
    const fn = () => setSolid(window.scrollY > 56)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  /* ── Body scroll lock when drawer is open ─ */
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
      document.body.classList.add('nav-drawer-open')
    } else {
      document.body.style.overflow = ''
      document.body.classList.remove('nav-drawer-open')
    }
    return () => {
      document.body.style.overflow = ''
      document.body.classList.remove('nav-drawer-open')
    }
  }, [menuOpen])

  /* ── Close drawer on route change ──────── */
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (path.startsWith('/#') && window.location.pathname === '/') {
      e.preventDefault()
      const id = path.replace('/#', '')
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      setMenuOpen(false)
    } else {
      setMenuOpen(false)
    }
    logCTAEvent(`Navigated to ${path}`)
  }

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <>
      {/* ── Main nav bar ─────────────────────────────────── */}
      <nav
        role="navigation"
        aria-label="Main navigation"
        className={`nav-wrap ${solid ? 'solid' : ''}`}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200 }}
      >
        <div style={{
          maxWidth: 1320, margin: '0 auto', padding: '0 clamp(16px, 4vw, 28px)',
          height: 96, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12,
        }}>

          {/* Logo */}
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Bowling Planet — Home"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              minWidth: 0,
              height: '100%',
            }}
          >
            <img
              src="/logo.png"
              alt="Bowling Planet"
              style={{
                height: 'clamp(64px, 8vw, 88px)', // increased from clamp(52px, 6.9vw, 72px)
                width: 'auto',
                flexShrink: 0,
                objectFit: 'contain',
                display: 'block',
              }}
              onError={e => {
                const t = e.currentTarget
                if (!t.dataset.fb) { t.dataset.fb = '1'; t.src = '/logo.png' }
              }}
            />
          </Link>

          {/* Desktop links */}
          <ul
            className="nav-desktop-links"
            style={{ gap: 32, listStyle: 'none', padding: 0, margin: 0 }}
          >
            {NAV_LINKS.map(({ label, path }) => (
              <li key={label}>
                <Link
                  to={path}
                  onClick={(e) => handleLinkClick(e, path)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: '"Inter", sans-serif', fontSize: 14, fontWeight: 500,
                    color: isActive(path) ? '#5FC1D1' : 'rgba(245,245,247,0.65)',
                    letterSpacing: '0.01em',
                    padding: '4px 0', transition: 'color 0.2s ease', textDecoration: 'none',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#F5F5F7' }}
                  onMouseLeave={e => { e.currentTarget.style.color = isActive(path) ? '#5FC1D1' : 'rgba(245,245,247,0.65)' }}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* CTA's */}
            <Link
              to={isAuthenticated ? "/admin" : "/login"}
              className="btn nav-desktop-cta"
              style={{
                padding: '10px 22px', fontSize: 14, textDecoration: 'none',
                background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', borderRadius: 8, transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              {isAuthenticated ? "Admin Portal" : "Login"}
            </Link>

            <Link
              to="/contact"
              onClick={() => logCTAEvent('Header: Get in Touch')}
              className="btn btn-primary nav-desktop-cta"
              style={{ padding: '10px 22px', fontSize: 14, textDecoration: 'none' }}
              aria-label="Get in touch"
            >
              Get in Touch
            </Link>

            {/* Hamburger */}
            <button
              id="nav-hamburger-btn"
              className="nav-hamburger"
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-drawer"
              style={{
                background: menuOpen ? 'rgba(95,193,209,0.1)' : 'none',
                border: menuOpen ? '1px solid rgba(95,193,209,0.2)' : '1px solid transparent',
                borderRadius: 8,
                cursor: 'pointer', padding: '8px 10px',
                display: 'flex', flexDirection: 'column', gap: 5,
                transition: 'background 0.25s ease, border-color 0.25s ease',
              }}
            >
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  display: 'block', width: 22, height: 2,
                  background: menuOpen ? '#5FC1D1' : '#F5F5F7',
                  borderRadius: 2,
                  transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.25s ease, background 0.25s ease',
                  transform: menuOpen
                    ? i === 0 ? 'rotate(45deg) translate(5px, 5px)'
                      : i === 2 ? 'rotate(-45deg) translate(5px,-5px)'
                        : 'none'
                    : 'none',
                  opacity: menuOpen && i === 1 ? 0 : 1,
                }} />
              ))}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Overlay backdrop ──────────────────────────────── */}
      <div
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 149,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transition: 'opacity 0.35s ease',
        }}
      />

      {/* ── Mobile drawer ────────────────────────────────── */}
      <div
        id="mobile-nav-drawer"
        role="dialog"
        aria-label="Mobile navigation"
        aria-modal="true"
        aria-hidden={!menuOpen}
        className={`mobile-drawer ${menuOpen ? 'open' : ''}`}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 'min(320px, 90vw)', zIndex: 150,
          background: 'linear-gradient(160deg, #070B14 0%, #0A0A0F 60%, #050810 100%)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          borderLeft: '1px solid rgba(95,193,209,0.12)',
          boxShadow: '-20px 0 80px rgba(0,0,0,0.6), -1px 0 0 rgba(95,193,209,0.05)',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
        }}
      >
        {/* Nav links */}
        <nav aria-label="Mobile navigation links" style={{ padding: '12px 0', paddingTop: '110px', flex: 1 }}>
          {NAV_LINKS.map(({ label, path }, idx) => {
            const active = isActive(path)
            return (
              <Link
                key={label}
                to={path}
                onClick={(e) => handleLinkClick(e, path)}
                className={menuOpen ? `mobile-nav-link mobile-nav-link--in` : 'mobile-nav-link'}
                style={{
                  '--delay': `${idx * 40}ms`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 24px',
                  fontFamily: '"Inter", sans-serif', fontWeight: active ? 600 : 500,
                  fontSize: 16, letterSpacing: '-0.01em',
                  color: active ? '#5FC1D1' : 'rgba(245,245,247,0.82)',
                  textDecoration: 'none',
                  background: active ? 'rgba(95,193,209,0.07)' : 'transparent',
                  borderLeft: active ? '2px solid #5FC1D1' : '2px solid transparent',
                  transition: 'background 0.2s ease, color 0.2s ease, border-color 0.2s ease',
                  position: 'relative',
                } as React.CSSProperties}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                    e.currentTarget.style.color = '#F5F5F7'
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'rgba(245,245,247,0.82)'
                  }
                }}
              >
                <span>{label}</span>
                {active && (
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#5FC1D1',
                    boxShadow: '0 0 8px rgba(95,193,209,0.8)',
                    flexShrink: 0,
                  }} />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Divider */}
        <div style={{ height: 1, margin: '0 24px', background: 'rgba(255,255,255,0.06)' }} />

        {/* CTA section */}
        <div style={{ padding: '20px 20px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link
            to="/contact"
            className="btn btn-primary"
            style={{
              justifyContent: 'center', textDecoration: 'none',
              fontSize: 15, fontWeight: 600, letterSpacing: '0.01em',
              padding: '14px 24px', borderRadius: 12,
            }}
            onClick={() => {
              setMenuOpen(false)
              logCTAEvent('Mobile Nav: Get in Touch')
            }}
          >
            <span style={{ marginRight: 6 }}>✉</span>
            Get in Touch
          </Link>
          <Link
            to={isAuthenticated ? "/admin" : "/login"}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '13px 24px',
              background: 'rgba(255,255,255,0.04)',
              color: 'rgba(245,245,247,0.75)',
              textAlign: 'center', borderRadius: 12,
              textDecoration: 'none', fontWeight: 500, fontSize: 15,
              border: '1px solid rgba(255,255,255,0.08)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.color = '#F5F5F7'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              e.currentTarget.style.color = 'rgba(245,245,247,0.75)'
            }}
            onClick={() => setMenuOpen(false)}
          >
            <span style={{ fontSize: 14 }}>⚙</span>
            {isAuthenticated ? "Admin Portal" : "Login"}
          </Link>
        </div>

        {/* Teal glow orb for visual polish */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: '30%', right: '-60px',
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(95,193,209,0.08) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />
      </div>
    </>
  )
}

export default Nav
