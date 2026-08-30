import type { FC } from 'react'
import type { IResource } from '../../services/resourcesApi'
import Tag from '../../../../components/common/Tag'
import ResourceTypeBadge from '../ResourceTypeBadge'
import { theme } from '../../../../theme'

interface ResourceCardProps {
  resource: IResource
}

function truncate(text: string, max = 120): string {
  if (text.length <= max) return text
  return `${text.slice(0, max).trimEnd()}…`
}

const TYPE_COLORS: Record<string, string> = {
  pdf: '#FF5A5F',
  guide: '#5FC1D1',
  template: '#6DBD4E',
  video: '#C084FC',
  article: '#FFAA33',
}

const ResourceCard: FC<ResourceCardProps> = ({ resource }) => {
  const accent = TYPE_COLORS[resource.type] ?? '#5FC1D1'

  return (
    <a
      href={resource.externalUrl}
      target="_blank" rel="noopener noreferrer"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        textDecoration: 'none',
        color: 'inherit',
        background: `linear-gradient(135deg, ${accent}08, rgba(255,255,255,0.02))`,
        border: `1px solid ${accent}20`,
        borderRadius: 16,
        padding: '22px 22px 20px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = `${accent}45`
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = `0 12px 28px ${accent}12`
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = `${accent}20`
        ;(e.currentTarget as HTMLElement).style.transform = 'none'
        ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${accent}, transparent)` }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <h3 className="font-display" style={{ margin: 0, fontSize: 15, fontWeight: 700, color: theme.colors.text1, letterSpacing: '-0.02em', lineHeight: 1.35 }}>
          {resource.title}
        </h3>
        <ResourceTypeBadge type={resource.type} />
      </div>
      <p style={{ margin: 0, fontSize: 13, color: theme.colors.text2, lineHeight: 1.6, fontFamily: theme.typography.fontBody }}>
        {truncate(resource.description)}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <Tag label={resource.category} />
        {resource.tags.map((tag) => (
          <Tag key={tag} label={tag} />
        ))}
      </div>
    </a>
  )
}

export default ResourceCard
