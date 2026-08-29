import { useState, useEffect, type FC } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { theme } from '../../theme'
import { useReveal } from '../../hooks/useReveal'
import { authApi } from './services/authApi'
import { useAuth } from '../../context/AuthContext'
import { AuthHero } from './components/AuthHero'
import { AuthOverlay } from './components/AuthOverlay'
import { OtpInput } from './components/OtpInput'
import { PasswordInput } from './components/PasswordInput'
import { ResendOtpButton } from './components/ResendOtpButton'
import { Turnstile } from '@marsidev/react-turnstile'

const LoginPage: FC = () => {
  const containerRef = useReveal()
  const [role, setRole] = useState<'SuperAdmin' | 'Admin'>('SuperAdmin')
  const [form, setForm] = useState({ email: '', password: '' })
  const [focused, setFocused] = useState<string | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  // OTP State
  const [step, setStep] = useState<'LOGIN' | 'OTP'>('LOGIN')
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const { isAuthenticated, login: setGlobalUser } = useAuth()

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  useEffect(() => {
    if (!loading) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; // Required for most modern browsers to show the default alert
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [loading]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!captchaToken) {
      return setError('Please complete the captcha')
    }
    setLoading(true)
    try {
      await authApi.login({ ...form, role, captchaToken })
      setSuccess('OTP sent to your email.')
      setStep('OTP')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    const otp = otpDigits.join('')
    try {
      const data = await authApi.verifyOtp({ email: form.email, otp, purpose: 'login' })
      setSuccess('Login successful! Redirecting...')
      setTimeout(() => { 
        setGlobalUser(data.user) 
      }, 1000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const activeColor = role === 'SuperAdmin' ? theme.colors.teal : theme.colors.green
  const activeColorRgba = role === 'SuperAdmin' ? 'rgba(95,193,209,0.2)' : 'rgba(74,222,128,0.2)'

  const inputStyle = (isFocused: boolean) => ({
    width: '100%',
    background: 'rgba(0,0,0,0.4)',
    border: `1px solid ${isFocused ? activeColor : 'rgba(255,255,255,0.08)'}`,
    borderRadius: 12,
    padding: '16px 20px',
    color: theme.colors.text1,
    fontSize: 15,
    fontFamily: theme.typography.fontBody,
    outline: 'none',
    transition: 'all 0.3s ease',
    boxShadow: isFocused ? `0 0 0 3px ${activeColor}33` : 'inset 0 2px 4px rgba(0,0,0,0.5)',
  })

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  const labelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: theme.colors.text2,
    marginBottom: 10,
  }

  return (
    <>
      <AuthOverlay loading={loading} />

      <div className="flex flex-col lg:flex-row min-h-screen" style={{
        background: role === 'SuperAdmin' ? '#090b10' : '#0a0d0a',
        transition: 'background 0.5s ease',
      }}>

        {/* ── Left Side: Brand (Desktop Only) ──────────────────────── */}
        <AuthHero role={role} type="login" />

        {/* ── Right Side: Form ──────────────────────── */}
        <div className="auth-form-side flex-1 flex flex-col items-center justify-center p-6 relative" style={{
          background: `radial-gradient(circle at center, ${role === 'SuperAdmin' ? 'rgba(95,193,209,0.07)' : 'rgba(74,222,128,0.07)'} 0%, rgba(20,20,24,0.9) 60%, #000 100%)`,
          transition: 'background 0.5s ease'
        }}>

          {/* Mobile Logo (hidden on desktop) */}
          <div className="auth-mobile-logo block lg:hidden text-center mb-10 mt-8">
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none', marginBottom: 16 }}>
              <img src="/logo.avif" alt="Bowling Planet" style={{ height: 52, width: 'auto' }} />
              <span style={{
                fontFamily: theme.typography.fontDisplay,
                fontWeight: 800,
                fontSize: 24,
                letterSpacing: '-0.02em',
                color: theme.colors.text1,
              }}>
                Bowling Planet
              </span>
            </Link>
            <div>
              <div style={{
                display: 'inline-block', padding: '6px 14px', borderRadius: 20,
                background: 'rgba(95,193,209,0.15)', color: theme.colors.teal,
                fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
                border: `1px solid rgba(95,193,209,0.3)`
              }}>
                Admin Portal Login
              </div>
            </div>
          </div>

          <div ref={containerRef} className="reveal w-full max-w-[480px] p-6 md:p-12 rounded-3xl" style={{
            background: 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}>
            <h2 className="font-display text-metallic" style={{ fontSize: 28, fontWeight: 800, marginBottom: step === 'OTP' ? 20 : 32, textAlign: 'center' }}>
              {step === 'OTP' ? 'Verify OTP' : 'Sign In'}
            </h2>

            {/* Portal tag shown only on OTP step */}
            {step === 'OTP' && (
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <span style={{
                  display: 'inline-block',
                  padding: '5px 16px',
                  borderRadius: 20,
                  background: role === 'SuperAdmin' ? 'rgba(95,193,209,0.12)' : 'rgba(74,222,128,0.12)',
                  color: role === 'SuperAdmin' ? theme.colors.teal : theme.colors.green,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  border: `1px solid ${role === 'SuperAdmin' ? 'rgba(95,193,209,0.3)' : 'rgba(74,222,128,0.3)'}`,
                }}>
                  {role === 'SuperAdmin' ? '⬡ SuperAdmin Portal' : '⬡ Admin Portal'}
                </span>
              </div>
            )}

            {/* Role Tabs - Only visible during LOGIN step */}
            {step === 'LOGIN' && (
              <div style={{
                display: 'flex',
                background: 'rgba(0,0,0,0.4)',
                borderRadius: 12,
                padding: 6,
                marginBottom: 32,
                border: `1px solid ${theme.colors.border}`,
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
              }}>
                <button
                  type="button"
                  onClick={() => setRole('SuperAdmin')}
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    borderRadius: 8,
                    border: role === 'SuperAdmin' ? '1px solid rgba(95,193,209,0.3)' : '1px solid transparent',
                    background: role === 'SuperAdmin' ? 'rgba(95,193,209,0.1)' : 'transparent',
                    color: role === 'SuperAdmin' ? theme.colors.teal : theme.colors.text2,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: role === 'SuperAdmin' ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
                  }}
                >
                  SuperAdmin
                </button>
                <button
                  type="button"
                  onClick={() => setRole('Admin')}
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    borderRadius: 8,
                    border: role === 'Admin' ? '1px solid rgba(74,222,128,0.3)' : '1px solid transparent',
                    background: role === 'Admin' ? 'rgba(74,222,128,0.1)' : 'transparent',
                    color: role === 'Admin' ? theme.colors.green : theme.colors.text2,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: role === 'Admin' ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
                  }}
                >
                  Admin
                </button>
              </div>
            )}

            {error && <div style={{ color: '#ff4d4f', marginBottom: 16, textAlign: 'center', fontSize: 14 }}>{error}</div>}
            {success && <div style={{ color: theme.colors.teal, marginBottom: 16, textAlign: 'center', fontSize: 14 }}>{success}</div>}

            {step === 'LOGIN' && (
              <form onSubmit={handleLoginSubmit}>
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="rahul@bowlingplanet.in"
                    value={form.email}
                    onChange={update('email')}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    style={inputStyle(focused === 'email')}
                  />
                </div>

                <PasswordInput
                  value={form.password}
                  onChange={update('password')}
                  role={role}
                />

                <div style={{ textAlign: 'right', marginBottom: 24, marginTop: -8 }}>
                  <Link to="/forgot-password" style={{ color: theme.colors.text2, fontSize: 13, textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = activeColor)} onMouseLeave={e => (e.currentTarget.style.color = theme.colors.text2)}>
                    Forgot Password?
                  </Link>
                </div>

                <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
                  <Turnstile
                    siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                    onSuccess={(token) => setCaptchaToken(token)}
                    onExpire={() => setCaptchaToken(null)}
                    onError={() => setCaptchaToken(null)}
                    options={{ theme: 'dark' }}
                  />
                </div>

                <button type="submit" style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${activeColor}, ${role === 'SuperAdmin' ? theme.colors.tealMid : '#22c55e'})`,
                  color: theme.colors.void,
                  fontWeight: 700,
                  fontSize: 16,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  boxShadow: `0 10px 20px ${activeColorRgba}, inset 0 1px 0 rgba(255,255,255,0.4)`
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
                  disabled={loading}
                >
                  {loading ? 'Authenticating...' : 'Authenticate'}
                </button>
              </form>
            )}

            {step === 'OTP' && (
              <form onSubmit={handleVerifyOtp}>
                {/* Email context */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                  <p style={{ color: theme.colors.text2, fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                    A 6-digit code was sent to<br />
                    <span style={{
                      background: 'linear-gradient(90deg, #5FC1D1, #4ade80)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 700,
                    }}>{form.email}</span>
                  </p>
                </div>

                {/* 6-box OTP input */}
                <OtpInput value={otpDigits} onChange={setOtpDigits} role={role} />

                <ResendOtpButton
                  email={form.email}
                  purpose="login"
                  role={role}
                  onResendSuccess={(msg) => { setSuccess(msg); setError(''); }}
                  onResendError={(err) => { setError(err); setSuccess(''); }}
                />

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, opacity: 0.3 }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.15)' }} />
                  <span style={{ color: theme.colors.text2, fontSize: 12 }}>SECURE CHANNEL</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.15)' }} />
                </div>

                <button
                  type="submit"
                  disabled={loading || otpDigits.join('').length < 6}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: 12,
                    background: otpDigits.join('').length === 6
                      ? 'linear-gradient(135deg, #5FC1D1, #4ade80)'
                      : 'rgba(255,255,255,0.05)',
                    color: otpDigits.join('').length === 6 ? '#000' : theme.colors.text2,
                    fontWeight: 700,
                    fontSize: 16,
                    border: 'none',
                    cursor: otpDigits.join('').length === 6 ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s ease',
                    boxShadow: otpDigits.join('').length === 6
                      ? '0 10px 30px rgba(95,193,209,0.3), inset 0 1px 0 rgba(255,255,255,0.4)'
                      : 'none',
                    letterSpacing: '0.03em',
                  }}
                  onMouseEnter={e => { if (otpDigits.join('').length === 6) (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
                >
                  {loading ? 'Verifying...' : 'Verify & Access Portal'}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep('LOGIN'); setOtpDigits(['', '', '', '', '', '']); setError(''); setSuccess('') }}
                  style={{
                    width: '100%',
                    marginTop: 12,
                    padding: '12px',
                    borderRadius: 10,
                    background: 'transparent',
                    color: theme.colors.text2,
                    fontWeight: 500,
                    fontSize: 14,
                    border: '1px solid rgba(255,255,255,0.07)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)'; (e.currentTarget as HTMLElement).style.color = theme.colors.text1 }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.color = theme.colors.text2 }}
                >
                  ← Back to Sign In
                </button>
              </form>
            )}

            {step === 'LOGIN' && (
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <p style={{ color: theme.colors.text2, fontSize: 14 }}>
                  Don't have an account?{' '}
                  <Link to="/signup" style={{ color: theme.colors.teal, textDecoration: 'none', fontWeight: 600 }}>
                    Sign up
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>

        <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 40px rgba(95,193,209,0.15); }
          50% { box-shadow: 0 0 60px rgba(95,193,209,0.35), 0 0 80px rgba(74,222,128,0.15); }
        }
        @media (max-width: 900px) {
          .auth-brand-side { display: none !important; }
          .auth-form-side { padding: 80px 20px !important; justify-content: flex-start !important; }
          .auth-mobile-logo { display: block !important; }
        }
        @media (max-width: 500px) {
          .auth-form-side .glass-card { padding: 32px 24px !important; }
        }
      `}</style>
      </div>
    </>
  )
}

export default LoginPage
