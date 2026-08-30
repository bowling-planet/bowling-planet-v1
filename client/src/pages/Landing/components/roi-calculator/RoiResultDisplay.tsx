import { type FC } from 'react'
import { formatINR, getRoiRow, TIER_LABELS, type FranchiseType } from './data/roidata'
import { TrendingUp, BarChart3, Briefcase, Calendar, Users } from 'lucide-react'
import { theme } from '../../../../theme'
import type { RoiInputs } from '../../../../hooks/useRoiMatch'
import { useLeadTracker } from '../../../../context/LeadTrackerContext'
import { useGlobalSettings } from '../../../../context/GlobalSettingsContext'


interface RoiResultsDisplayProps {
  matched: FranchiseType
  inputs: RoiInputs
  tier: number
}

// TODO: replace with the real business WhatsApp number (country code, no + or spaces), e.g. '919876543210'


const WhatsAppIcon: FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
      fill="currentColor"
    />
    <path
      d="M12.05 22c-1.674 0-3.32-.437-4.766-1.267L2 22l1.3-5.146A9.918 9.918 0 0 1 2.05 12C2.05 6.477 6.527 2 12.05 2c5.523 0 10 4.477 10 10s-4.477 10-10 10zm0-18.4C7.36 3.6 3.55 7.41 3.55 12c0 1.68.494 3.246 1.343 4.56l-.85 3.163 3.24-.85A8.36 8.36 0 0 0 12.05 20.4c4.69 0 8.5-3.81 8.5-8.4s-3.81-8.4-8.5-8.4z"
      fill="currentColor"
    />
  </svg>
)
function MetricCard({ icon, label, value, subtext, color }: { icon: React.ReactNode; label: string; value: string; subtext?: string; color: string }) {
  return (
    <div
      style={{
        background: `linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))`,
        border: `1px solid ${theme.colors.border}60`,
        borderRadius: 14,
        padding: '18px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        minWidth: 0,
        flex: '1 1 160px', // Keeps grow: 1, shrink: 1, basis: 160px
      }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: color }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 12, color: theme.colors.text2, fontFamily: theme.typography.fontBody, marginBottom: 2 }}>
          {label}
        </div>
        <div className="font-display" style={{ fontSize: 20, fontWeight: 800, color: theme.colors.text1, letterSpacing: '-0.01em' }}>
          {value}
        </div>
        {subtext && (
          <div style={{ fontSize: 11, color: theme.colors.text3, marginTop: 2, fontFamily: theme.typography.fontBody }}>
            {subtext}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * WhatsApp CTA — invites the lead to discuss their specific projection directly
 */
function WhatsAppCta({ matched, tier }: { matched: FranchiseType; tier: number }) {
  const { logCTAEvent } = useLeadTracker()

  const { settings } = useGlobalSettings()
  const WHATSAPP_NUMBER = settings?.socials?.whatsappNumber || '919876543210'

  const message = `Hi! I just ran an ROI projection for the ${matched.name} setup in ${TIER_LABELS[tier]} and I'd like to discuss it in more detail.`
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    logCTAEvent('ROI Results: WhatsApp CTA Clicked')
    setTimeout(() => {
      window.open(whatsappUrl, '_blank')
    }, 300)
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
        background: 'linear-gradient(135deg, rgba(37,211,102,0.1), rgba(255,255,255,0.01))',
        border: `1px solid ${theme.colors.border}60`,
        borderRadius: 16,
        padding: '20px 24px',
      }}
    >
      <div>
        <h4 className="font-display" style={{ fontSize: 15, fontWeight: 700, color: theme.colors.text1, marginBottom: 4 }}>
          Want to go over these numbers with someone?
        </h4>
        <p style={{ fontSize: 13, color: theme.colors.text2, fontFamily: theme.typography.fontBody }}>
          Get in touch on WhatsApp for a detailed, no-obligation breakdown.
        </p>
      </div>
      <a
        href={whatsappUrl}
        onClick={handleClick}
        target="_blank" rel="noopener noreferrer"
        aria-label="Get in touch on WhatsApp"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 20px',
          borderRadius: 999,
          background: '#25D366',
          color: '#fff',
          fontSize: 14,
          fontWeight: 700,
          fontFamily: theme.typography.fontBody,
          textDecoration: 'none',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          boxShadow: '0 6px 18px rgba(37,211,102,0.35)',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 10px 24px rgba(37,211,102,0.45)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 6px 18px rgba(37,211,102,0.35)'
        }}
      >
        <WhatsAppIcon size={18} />
        Get in touch
      </a>
    </div>
  )
}

const RoiResultsDisplay: FC<RoiResultsDisplayProps> = ({ matched, tier }) => {
  const { row } = getRoiRow(matched.key, tier)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Title */}
      <div style={{ borderBottom: `1px solid ${theme.colors.border}40`, paddingBottom: 20 }}>
        <span style={{
          display: 'inline-flex',
          padding: '6px 12px',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 700,
          background: `${matched.color}15`,
          color: matched.color,
          marginBottom: 12,
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}>
          Configured Solution Match
        </span>
        <h3 className="font-display" style={{ fontSize: 26, fontWeight: 800, color: theme.colors.text1, marginBottom: 8, letterSpacing: '-0.02em' }}>
          {matched.name} <span style={{ color: theme.colors.text3, fontWeight: 400 }}>in</span> {TIER_LABELS[tier]}
        </h3>
        <p style={{ fontSize: 14, color: theme.colors.text2, fontFamily: theme.typography.fontBody, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Users size={14} /> {row.weeklyFootfall.toLocaleString()} Traffic /wk</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={14} /> {row.breakEvenMonths} Mo. Payback</span>
        </p>
      </div>

      {/* Key Metrics Row */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <MetricCard
          icon={<Briefcase size={18} />}
          label="Capital Investment required"
          value={formatINR(matched.totalInvestment)}
          color={matched.color}
        />
        <MetricCard
          icon={<TrendingUp size={18} />}
          label="Year 1 Forecasted Profits"
          value={formatINR(row.monthlyNetProfit * 12)}
          subtext={`${row.annualRoiPct}% Projected Annual ROI`}
          color={matched.color}
        />
        <MetricCard
          icon={<BarChart3 size={18} />}
          label="Average Monthly Cashflow"
          value={formatINR(row.monthlyRevenue)}
          subtext={`Expected Clean Yield: ${formatINR(row.monthlyNetProfit)}/mo`}
          color={matched.color}
        />
      </div>

      {/* WhatsApp CTA — replaces the previous tab bar / tab content */}
      <WhatsAppCta matched={matched} tier={tier} />
    </div>
  )
}

export default RoiResultsDisplay