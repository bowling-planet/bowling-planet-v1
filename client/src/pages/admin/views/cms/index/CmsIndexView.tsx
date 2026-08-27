import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutTemplate, ShoppingBag, FolderKanban, FileText, Share2, ChevronRight, Users, BookOpen, MonitorPlay } from 'lucide-react';
import { theme } from '../../../../../theme';

const cmsCards = [
  {
    title: 'Home Page',
    description: 'Edit hero text, highlights, and key landing page sections.',
    icon: LayoutTemplate,
    path: '/admin/cms/home',
    tag: 'Core'
  },
  {
    title: 'Franchise Page',
    description: 'Manage value propositions, investment tiers, and frequently asked questions.',
    icon: MonitorPlay,
    path: '/admin/cms/franchise',
    tag: 'Core'
  },
  {
    title: 'About Page',
    description: 'Manage about page and team details',
    icon: Users,
    path: '/admin/cms/about',
    tag: 'About'
  },
  {
    title: 'Products',
    description: 'Manage product catalog, pricing and availability.',
    icon: ShoppingBag,
    path: '/admin/cms/products',
    tag: 'Catalog'
  },
  {
    title: 'Services Page',
    description: 'Manage the standalone services pages content and options.',
    icon: FolderKanban,
    path: '/admin/cms/services',
    tag: 'Core'
  },
  {
    title: 'Service Details',
    description: 'Manage standalone, dynamic service pages (inside pages).',
    icon: FolderKanban,
    path: '/admin/cms/service-details',
    tag: 'Core'
  },
  {
    title: 'Projects',
    description: 'Upload project gallery photos and detail pages.',
    icon: FolderKanban,
    path: '/admin/cms/projects',
    tag: 'Gallery'
  },
  {
    title: 'Careers',
    description: 'Post job openings and manage job descriptions.',
    icon: FileText,
    path: '/admin/cms/careers',
    tag: 'HR'
  },
  {
    title: 'Blog',
    description: 'Write and publish insights, resources, and articles.',
    icon: FileText,
    path: '/admin/cms/blog',
    tag: 'Content'
  },
  {
    title: 'Resources',
    description: 'Manage educational materials and helpful resources.',
    icon: BookOpen,
    path: '/admin/cms/resources',
    tag: 'Resources'
  },
  {
    title: 'Global Settings',
    description: 'Update footer links, contact info, and social media.',
    icon: Share2,
    path: '/admin/cms/settings',
    tag: 'Settings'
  },
];

const tagColors: Record<string, string> = {
  Core: '#3B82F6',
  Catalog: '#8B5CF6',
  Gallery: '#10B981',
  HR: '#F59E0B',
  Content: '#EC4899',
  Settings: '#64748B',
};

export const CmsIndexView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: theme.colors.adminText, margin: '0 0 4px 0', letterSpacing: '-0.4px' }}>
          Content Management
        </h1>
        <p style={{ color: theme.colors.adminTextMuted, margin: 0, fontSize: '14px' }}>
          Manage your website content directly — no developers required.
        </p>
      </div>

      {/* CMS Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '16px' }}>
        {cmsCards.map((card, i) => {
          const tagColor = tagColors[card.tag] || '#64748B';
          return (
            <div
              key={i}
              onClick={() => navigate(card.path)}
              style={{
                backgroundColor: theme.colors.adminSurface,
                borderRadius: '14px',
                padding: '22px',
                border: `1px solid ${theme.colors.adminBorder}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = theme.colors.adminAccent;
                e.currentTarget.style.boxShadow = `0 6px 24px rgba(0,0,0,0.08), 0 0 0 1px ${theme.colors.adminAccent}22`;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = theme.colors.adminBorder;
                e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              {/* Top row: icon + tag */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                  width: '44px', height: '44px',
                  backgroundColor: theme.colors.adminAccentBg,
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <card.icon size={22} color={theme.colors.adminAccent} />
                </div>
                <span style={{
                  fontSize: '11px', fontWeight: 600,
                  color: tagColor,
                  backgroundColor: `${tagColor}12`,
                  padding: '3px 8px', borderRadius: '20px',
                  letterSpacing: '0.2px'
                }}>
                  {card.tag}
                </span>
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: theme.colors.adminText, margin: '0 0 6px 0' }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: '14px', color: theme.colors.adminTextMuted, margin: 0, lineHeight: 1.55 }}>
                  {card.description}
                </p>
              </div>

              {/* Footer */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingTop: '14px',
                borderTop: `1px solid ${theme.colors.adminBorder}`,
              }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: theme.colors.adminAccent }}>
                  Open Editor
                </span>
                <ChevronRight size={16} color={theme.colors.adminAccent} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
