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

const SignupPage: FC = () => {
  const containerRef = useReveal()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminSecret: ''
  })
  const [focused, setFocused] = useState<string | null>(null)

  // OTP State
  const [step, setStep] = useState<'SIGNUP' | 'OTP'>('SIGNUP')
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  const { isAuthenticated, login } = useAuth()

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  useEffect(() => {
    if (!loading) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [loading]);

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match')
    }
    if (!captchaToken) {
      return setError('Please complete the captcha')
    }

    setLoading(true)
    try {
      await authApi.signup({
        name: form.name,
        email: form.email,
        password: form.password,
        adminSecret: form.adminSecret,
        captchaToken
      })

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
      const res = await authApi.verifyOtp({ email: form.email, otp, purpose: 'signup' })
      setSuccess('Account verified! Redirecting to dashboard...')
      if (res.user) {
        setTimeout(() => {
          login(res.user)
        }, 1000)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (isFocused: boolean) => ({
    width: '100%',
    background: 'rgba(0,0,0,0.4)',
    border: `1px solid ${isFocused ? theme.colors.green : 'rgba(255,255,255,0.08)'}`,
    borderRadius: 12,
    padding: '16px 20px',
    color: theme.colors.text1,
    fontSize: 15,
    fontFamily: theme.typography.fontBody,
    outline: 'none',
    transition: 'all 0.3s ease',
    boxShadow: isFocused ? `0 0 0 3px rgba(109,189,78,0.2)` : 'inset 0 2px 4px rgba(0,0,0,0.5)',
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
      <AuthOverlay loading={loading} message="Processing Request..." />

      <div className="flex flex-col lg:flex-row min-h-screen" style={{ background: theme.colors.void }}>

        {/* ── Left Side: Brand (Desktop Only) ──────────────────────── */}
        <AuthHero role="Admin" type="signup" />

        {/* ── Right Side: Form ──────────────────────── */}
        <div className="auth-form-side flex-1 flex flex-col items-center justify-center p-6 relative" style={{
          background: 'radial-gradient(circle at center, rgba(26,26,36,0.5) 0%, #000 100%)'
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
                background: 'rgba(109,189,78,0.15)', color: theme.colors.green,
                fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
                border: `1px solid rgba(109,189,78,0.3)`
              }}>
                Admin Registration Portal
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
              {step === 'OTP' ? 'Verify OTP' : 'Sign Up'}
            </h2>

            {/* Portal tag shown only on OTP step */}
            {step === 'OTP' && (
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <span style={{
                  display: 'inline-block',
                  padding: '5px 16px',
                  borderRadius: 20,
                  background: 'rgba(74,222,128,0.12)',
                  color: theme.colors.green,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  border: '1px solid rgba(74,222,128,0.3)',
                }}>
                  ⬡ Admin Portal
                </span>
              </div>
            )}

            {error && <div style={{ color: '#ff4d4f', marginBottom: 16, textAlign: 'center', fontSize: 14 }}>{error}</div>}
            {success && <div style={{ color: theme.colors.green, marginBottom: 16, textAlign: 'center', fontSize: 14 }}>{success}</div>}

            {step === 'SIGNUP' && (
              <form onSubmit={handleSignupSubmit}>
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Rahul Sharma"
                    value={form.name}
                    onChange={update('name')}
                    onFocus={() => setFocused('name')}
                    onBlur={() => setFocused(null)}
                    style={inputStyle(focused === 'name')}
                  />
                </div>

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
                  label="Password"
                  value={form.password}
                  onChange={update('password')}
                  role="Admin"
                />

                <PasswordInput
                  label="Confirm Password"
                  value={form.confirmPassword}
                  onChange={update('confirmPassword')}
                  role="Admin"
                />

                <div style={{ marginBottom: 32 }}>
                  <label style={labelStyle}>Admin Secret</label>
                  <input
                    type="password"
                    required
                    placeholder="SuperAdmin provided token"
                    value={form.adminSecret}
                    onChange={update('adminSecret')}
                    onFocus={() => setFocused('adminSecret')}
                    onBlur={() => setFocused(null)}
                    style={inputStyle(focused === 'adminSecret')}
                  />
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
                  background: `linear-gradient(135deg, ${theme.colors.green}, ${theme.colors.greenMid})`,
                  color: theme.colors.void,
                  fontWeight: 700,
                  fontSize: 16,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  boxShadow: `0 10px 20px rgba(109,189,78,0.2), inset 0 1px 0 rgba(255,255,255,0.4)`
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Account'}
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
                      background: 'linear-gradient(90deg, #4ade80, #5FC1D1)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 700,
                    }}>{form.email}</span>
                  </p>
                </div>

                {/* 6-box OTP input */}
                <div style={{ marginBottom: 24 }}>
                  <OtpInput value={otpDigits} onChange={setOtpDigits} role="Admin" />
                  <ResendOtpButton
                    email={form.email}
                    purpose="signup"
                    role="Admin"
                    onResendSuccess={(msg) => { setSuccess(msg); setError(''); }}
                    onResendError={(err) => { setError(err); setSuccess(''); }}
                  />
                </div>

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
                      ? 'linear-gradient(135deg, #4ade80, #5FC1D1)'
                      : 'rgba(255,255,255,0.05)',
                    color: otpDigits.join('').length === 6 ? '#000' : theme.colors.text2,
                    fontWeight: 700,
                    fontSize: 16,
                    border: 'none',
                    cursor: otpDigits.join('').length === 6 ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s ease',
                    boxShadow: otpDigits.join('').length === 6
                      ? '0 10px 30px rgba(74,222,128,0.3), inset 0 1px 0 rgba(255,255,255,0.4)'
                      : 'none',
                    letterSpacing: '0.03em',
                  }}
                  onMouseEnter={e => { if (otpDigits.join('').length === 6) (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
                >
                  {loading ? 'Verifying...' : 'Verify & Complete Signup'}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep('SIGNUP'); setOtpDigits(['', '', '', '', '', '']); setError(''); setSuccess('') }}
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
                  ← Back to Sign Up
                </button>
              </form>
            )}

            {step === 'SIGNUP' && (
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <p style={{ color: theme.colors.text2, fontSize: 14 }}>
                  Already have an account?{' '}
                  <Link to="/login" style={{ color: theme.colors.teal, textDecoration: 'none', fontWeight: 600 }}>
                    Sign in
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
          0%, 100% { box-shadow: 0 0 40px rgba(109,189,78,0.15); }
          50% { box-shadow: 0 0 60px rgba(109,189,78,0.35), 0 0 80px rgba(95,193,209,0.15); }
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

export default SignupPage
