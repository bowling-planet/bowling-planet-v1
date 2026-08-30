import React, { useState, useEffect } from 'react';
import { theme } from '../../../../../theme';
import { ArrowLeft, Save, Loader2, Edit2, X, Plus, Trash2, Share2, Building2, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { globalSettingsApi, type GlobalSettingsData } from '../../../../../services/globalSettingsApi';
import { useGlobalSettings } from '../../../../../context/GlobalSettingsContext';
import { FaLink } from 'react-icons/fa';
import { SocialIcon } from 'react-social-icons';

const card: React.CSSProperties = {
  backgroundColor: theme.colors.adminSurface,
  borderRadius: '16px',
  border: `1px solid ${theme.colors.adminBorder}`,
  padding: '28px 32px',
  marginBottom: '20px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  backgroundColor: '#F8FAFC',
  border: `1.5px solid ${theme.colors.adminBorder}`,
  borderRadius: '8px',
  color: theme.colors.adminText,
  fontSize: '14px',
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: theme.colors.adminTextMuted,
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; subtitle: string }> = ({ icon, title, subtitle }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: `1px solid ${theme.colors.adminBorder}` }}>
    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
      <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: theme.colors.adminText }}>{title}</h2>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: theme.colors.adminTextMuted }}>{subtitle}</p>
      </div>
    </div>
  </div>
);

const POPULAR_PLATFORMS = ['Facebook', 'Instagram', 'LinkedIn', 'X', 'YouTube', 'TikTok'];

export const CmsGlobalView: React.FC = () => {
  const navigate = useNavigate();
  const { settings, loading: isLoading, refreshSettings } = useGlobalSettings();
  
  const [data, setData] = useState<GlobalSettingsData | null>(null);
  const [liveData, setLiveData] = useState<GlobalSettingsData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const getPlatformIcon = (platform: string) => {
    const p = platform.toLowerCase();
    
    // Map platform names to react-social-icons network strings
    let network = p;
    if (p.includes('facebook')) network = 'facebook';
    else if (p.includes('instagram')) network = 'instagram';
    else if (p.includes('linkedin')) network = 'linkedin';
    else if (p.includes('twitter') || p.includes('x')) network = 'x';
    else if (p.includes('youtube')) network = 'youtube';
    else return <FaLink size={24} color="#6B7280" />;

    return <SocialIcon network={network} style={{ height: 26, width: 26 }} />;
  };

  useEffect(() => {
    if (settings && !isEditing) {
      setData(settings);
      setLiveData(settings);
    }
  }, [settings, isEditing]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async () => {
    if (!data) return;
    setIsSaving(true);
    try {
      const response = await globalSettingsApi.updateSettings(data);
      if (response.success) {
        setData(response.data);
        setLiveData(response.data);
        setIsEditing(false);
        refreshSettings();
        showToast('Settings updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      showToast('Failed to save changes.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (liveData) setData(liveData);
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: 16 }}>
        <Loader2 size={36} color={theme.colors.prussianBlue} style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: theme.colors.adminTextMuted, fontSize: 15 }}>Loading Global Settings…</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={{ paddingBottom: 100, maxWidth: 900 }}>
      {toast && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderRadius: 12, backgroundColor: toast.type === 'success' ? '#ECFDF5' : '#FEF2F2', border: `1px solid ${toast.type === 'success' ? '#A7F3D0' : '#FECACA'}`, color: toast.type === 'success' ? '#065F46' : '#991B1B', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontWeight: 500, fontSize: 14 }}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate('/admin/cms')} style={{ background: theme.colors.adminSurface, border: `1px solid ${theme.colors.adminBorder}`, borderRadius: 10, padding: '9px 10px', cursor: 'pointer', color: theme.colors.adminText, display: 'flex' }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: theme.colors.adminText, margin: 0, letterSpacing: '-0.4px' }}>Global Settings</h1>
            <p style={{ color: theme.colors.adminTextMuted, margin: '4px 0 0', fontSize: 14 }}>Footer content, social links, and company details.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {isEditing ? (
            <>
              <button onClick={handleCancel} style={{ padding: '10px 20px', borderRadius: 9, border: `1px solid ${theme.colors.adminBorder}`, backgroundColor: theme.colors.adminSurface, color: theme.colors.adminText, cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <X size={16} /> Cancel
              </button>
              <button onClick={handleSave} disabled={isSaving} style={{ padding: '10px 22px', borderRadius: 9, border: 'none', backgroundColor: theme.colors.prussianBlue, color: '#fff', cursor: isSaving ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                {isSaving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />} Save Changes
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} style={{ padding: '10px 22px', borderRadius: 9, border: 'none', backgroundColor: theme.colors.prussianBlue, color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Edit2 size={16} /> Edit Settings
            </button>
          )}
        </div>
      </div>

      <div style={card}>
        <SectionHeader icon={<Building2 size={20} color={theme.colors.prussianBlue} />} title="Company Details" subtitle="Shown in the footer and metadata." />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Company Name</label>
            {isEditing ? <input value={data.company.name} onChange={e => setData({ ...data, company: { ...data.company, name: e.target.value } })} style={inputStyle} /> : <div style={{ fontSize: 14, color: theme.colors.adminText }}>{data.company.name}</div>}
          </div>
          <div>
            <label style={labelStyle}>Tagline / Description</label>
            {isEditing ? <textarea value={data.company.tagline} onChange={e => setData({ ...data, company: { ...data.company, tagline: e.target.value } })} style={{ ...inputStyle, minHeight: 80 }} /> : <div style={{ fontSize: 14, color: theme.colors.adminText }}>{data.company.tagline}</div>}
          </div>
        </div>
      </div>

      <div style={card}>
        <SectionHeader icon={<Phone size={20} color={theme.colors.prussianBlue} />} title="Contact Information" subtitle="Publicly displayed contact channels." />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Public Email</label>
            {isEditing ? <input value={data.contact.email} onChange={e => setData({ ...data, contact: { ...data.contact, email: e.target.value } })} style={inputStyle} /> : <div style={{ fontSize: 14, color: theme.colors.adminText }}>{data.contact.email}</div>}
          </div>
          <div>
            <label style={labelStyle}>Display Phone Number</label>
            {isEditing ? <input value={data.contact.phoneDisplay} onChange={e => setData({ ...data, contact: { ...data.contact, phoneDisplay: e.target.value } })} style={inputStyle} /> : <div style={{ fontSize: 14, color: theme.colors.adminText }}>{data.contact.phoneDisplay}</div>}
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Location / Address</label>
            {isEditing ? <input value={data.contact.location} onChange={e => setData({ ...data, contact: { ...data.contact, location: e.target.value } })} style={inputStyle} /> : <div style={{ fontSize: 14, color: theme.colors.adminText }}>{data.contact.location}</div>}
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>WhatsApp Number (for floating CTA)</label>
            {isEditing ? <input value={data.socials.whatsappNumber} onChange={e => setData({ ...data, socials: { ...data.socials, whatsappNumber: e.target.value } })} style={inputStyle} placeholder="e.g. 919512545959" /> : <div style={{ fontSize: 14, color: theme.colors.adminText }}>{data.socials.whatsappNumber}</div>}
          </div>
        </div>
      </div>

      <div style={card}>
        <SectionHeader icon={<Share2 size={20} color={theme.colors.prussianBlue} />} title="Social Media Platforms" subtitle="Links displayed in the footer with their respective icons." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {data.socials.links.map((link, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ flex: 1, display: 'flex', gap: 12 }}>
                {isEditing ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, color: theme.colors.prussianBlue }}>
                      {getPlatformIcon(link.platform)}
                    </div>
                    <select
                      value={link.platform}
                      onChange={e => {
                        const newLinks = [...data.socials.links];
                        newLinks[i].platform = e.target.value;
                        setData({ ...data, socials: { ...data.socials, links: newLinks } });
                      }}
                      style={{ ...inputStyle, width: '150px' }}
                    >
                      {POPULAR_PLATFORMS.includes(link.platform) ? null : <option value={link.platform}>{link.platform}</option>}
                      {POPULAR_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                      <option value="Other">Other</option>
                    </select>
                    {link.platform === 'Other' && (
                      <input
                        placeholder="Custom Platform"
                        style={{ ...inputStyle, width: '150px' }}
                        onChange={e => {
                          const newLinks = [...data.socials.links];
                          newLinks[i].platform = e.target.value;
                          setData({ ...data, socials: { ...data.socials, links: newLinks } });
                        }}
                      />
                    )}
                    <input
                      value={link.url}
                      placeholder="https://..."
                      onChange={e => {
                        const newLinks = [...data.socials.links];
                        newLinks[i].url = e.target.value;
                        setData({ ...data, socials: { ...data.socials, links: newLinks } });
                      }}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                  </>
                ) : (
                  <div style={{ fontSize: 14, color: theme.colors.adminText, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.colors.prussianBlue }}>
                      {getPlatformIcon(link.platform)}
                    </div>
                    <strong>{link.platform}:</strong> <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: theme.colors.prussianBlue }}>{link.url}</a>
                  </div>
                )}
              </div>
              {isEditing && (
                <button
                  onClick={() => {
                    const newLinks = [...data.socials.links];
                    newLinks.splice(i, 1);
                    setData({ ...data, socials: { ...data.socials, links: newLinks } });
                  }}
                  style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: 'none', borderRadius: 8, padding: '10px', cursor: 'pointer' }}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
        {isEditing && (
          <button
            onClick={() => setData({ ...data, socials: { ...data.socials, links: [...data.socials.links, { platform: 'Facebook', url: '' }] } })}
            style={{ background: 'none', border: `1.5px dashed ${theme.colors.adminBorder}`, color: theme.colors.prussianBlue, padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', fontWeight: 600, fontSize: '14px', width: '100%', marginTop: 16 }}
          >
            <Plus size={16} /> Add Social Link
          </button>
        )}
      </div>
    </div>
  );
};
