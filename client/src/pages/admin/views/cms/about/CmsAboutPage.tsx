import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
    ArrowLeft, Plus, Trash2, Save, Loader2, Eye, Pencil,
    Info, Award, Network, Image as ImageIcon, BarChart3, Target,
    Clock, Quote, Sparkles, Users, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { theme } from '../../../../../theme';
import { useToast } from '../../../components/Toast';

import { teamService, type ITeamMember } from '../team/services';
import { TeamMemberModal } from '../team/components/TeamMemberModal';
import { TeamMemberViewModal } from '../team/components/TeamMemberViewModal';
import { aboutPageApi, type AboutPageData } from '../../../../../services/aboutApi';

// ─── Style Constants (matches the rest of the admin CMS — see CmsFranchiseView) ───

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

const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: '90px',
    resize: 'vertical',
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

const deleteBtn: React.CSSProperties = {
    background: 'rgba(239,68,68,0.07)',
    border: 'none',
    color: theme.colors.adminDanger,
    cursor: 'pointer',
    padding: '0 12px',
    borderRadius: '8px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
};

const addRowBtn: React.CSSProperties = {
    background: 'none',
    border: `1.5px dashed ${theme.colors.adminBorder}`,
    color: theme.colors.prussianBlue,
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: '14px',
    marginTop: '8px',
};

const rowCard: React.CSSProperties = {
    border: `1px solid ${theme.colors.adminBorder}`,
    borderRadius: '10px',
    padding: '16px',
    marginBottom: '12px',
    backgroundColor: '#FAFBFC',
};

const ICON_OPTIONS = ['Briefcase', 'Wrench', 'Boxes', 'LineChart', 'ShieldCheck', 'Handshake', 'Award', 'Package'];

const EMPTY_DATA: AboutPageData = {
    intro: { title: '', subtitle: '' },
    certifications: [],
    partners: [],
    gallery: [],
    stats: [],
    visionMission: { vision: '', mission: '' },
    journey: [],
    founderNote: { quote: '', bio: '', name: '', designation: '' },
    whyUs: [],
};

type TabKey = 'intro' | 'certifications' | 'partners' | 'gallery' | 'stats' | 'vision' | 'journey' | 'founder' | 'whyus' | 'team';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'intro', label: 'Intro', icon: <Info size={16} /> },
    { key: 'certifications', label: 'Certifications', icon: <Award size={16} /> },
    { key: 'partners', label: 'Partners', icon: <Network size={16} /> },
    { key: 'gallery', label: 'Gallery', icon: <ImageIcon size={16} /> },
    { key: 'stats', label: 'Stats', icon: <BarChart3 size={16} /> },
    { key: 'vision', label: 'Vision & Mission', icon: <Target size={16} /> },
    { key: 'journey', label: 'Journey', icon: <Clock size={16} /> },
    { key: 'founder', label: "Founder's Note", icon: <Quote size={16} /> },
    { key: 'whyus', label: 'Why Us', icon: <Sparkles size={16} /> },
    { key: 'team', label: 'Team Members', icon: <Users size={16} /> },
];

// ─── Section Header (matches CmsFranchiseView) ─────────────────────────────

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; subtitle: string }> = ({ icon, title, subtitle }) => (
    <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: `1px solid ${theme.colors.adminBorder}` }}>
        <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {icon}
        </div>
        <div>
            <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: theme.colors.adminText }}>{title}</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: theme.colors.adminTextMuted }}>{subtitle}</p>
        </div>
    </div>
);

const ImageField: React.FC<{
    currentUrl?: string;
    file: File | null;
    onChange: (file: File | null) => void;
}> = ({ currentUrl, file, onChange }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {file ? (
            <span style={{ fontSize: 13, color: theme.colors.prussianBlue }}>
                {file.name}{' '}
                <button type="button" onClick={() => onChange(null)} style={{ border: 'none', background: 'none', color: theme.colors.adminDanger, cursor: 'pointer', marginLeft: 8 }}>
                    Remove
                </button>
            </span>
        ) : currentUrl ? (
            <>
                <img src={currentUrl} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, border: `1px solid ${theme.colors.adminBorder}` }} />
                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onChange(e.target.files[0])} style={{ fontSize: 13 }} />
            </>
        ) : (
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onChange(e.target.files[0])} style={{ fontSize: 13 }} />
        )}
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────

export const CmsAboutView: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showToast: showTeamToast } = useToast();

    const [data, setData] = useState<AboutPageData>(EMPTY_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<TabKey>('intro');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Pending image files, keyed exactly the way the backend expects:
    // certificationsImage_<idx>, partnersImage_<idx>, galleryImage_<idx>, founderImage
    const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({});

    // Team members (separate collection, managed inline on the "Team Members" tab)
    const [members, setMembers] = useState<ITeamMember[]>([]);
    const [membersLoading, setMembersLoading] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [activeMember, setActiveMember] = useState<ITeamMember | null>(null);

    useEffect(() => {
        fetchData();
        fetchMembers();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const res = await aboutPageApi.getAboutPageData();
            if (res.success && res.data) {
                setData({ ...EMPTY_DATA, ...res.data });
            }
        } catch (error) {
            console.error('Failed to fetch about page data:', error);
            showToast('Failed to load About page data', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMembers = async () => {
        try {
            setMembersLoading(true);
            const res = await teamService.getAll();
            setMembers(res.data);
        } catch (error) {
            console.error('Failed to fetch team members:', error);
        } finally {
            setMembersLoading(false);
        }
    };

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await aboutPageApi.updateAboutPageData(data, pendingFiles);
            if (res.success) {
                setData({ ...EMPTY_DATA, ...res.data });
                setPendingFiles({});
                queryClient.invalidateQueries({ queryKey: ['about-page'] });
                showToast('About page updated successfully!', 'success');
            }
        } catch (error) {
            console.error('Failed to save About page:', error);
            showToast('Failed to save changes. Please try again.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteMember = async (member: ITeamMember) => {
        if (!window.confirm(`Remove "${member.name}" from the team? This cannot be undone.`)) return;
        try {
            await teamService.delete(member._id);
            showTeamToast('success', 'Team member deleted successfully');
            fetchMembers();
        } catch (err: any) {
            showTeamToast('error', err.message || 'Failed to delete team member');
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: 16 }}>
                <Loader2 size={36} color={theme.colors.prussianBlue} style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ color: theme.colors.adminTextMuted, fontSize: 15 }}>Loading About Page CMS…</p>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const tabStyle = (isActive: boolean): React.CSSProperties => ({
        padding: '10px 16px',
        background: isActive ? '#F1F5F9' : 'transparent',
        color: isActive ? theme.colors.prussianBlue : theme.colors.adminTextMuted,
        borderBottom: `2px solid ${isActive ? theme.colors.prussianBlue : 'transparent'}`,
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '13.5px',
        fontFamily: 'Inter, sans-serif',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        userSelect: 'none',
        whiteSpace: 'nowrap',
    });

    return (
        <div style={{ paddingBottom: 100, maxWidth: 1100 }}>
            {toast && (
                <div style={{
                    position: 'fixed', top: 24, right: 24, zIndex: 9999,
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '14px 20px', borderRadius: 12, maxWidth: 380,
                    backgroundColor: toast.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                    border: `1px solid ${toast.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
                    color: toast.type === 'success' ? '#065F46' : '#991B1B',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    fontWeight: 500, fontSize: 14,
                }}>
                    {toast.type === 'success' ? <CheckCircle2 size={18} color="#059669" /> : <AlertCircle size={18} color="#DC2626" />}
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button
                        onClick={() => navigate('/admin/cms')}
                        style={{ background: theme.colors.adminSurface, border: `1px solid ${theme.colors.adminBorder}`, borderRadius: 10, padding: '9px 10px', cursor: 'pointer', color: theme.colors.adminText, display: 'flex' }}
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 800, color: theme.colors.adminText, margin: 0, letterSpacing: '-0.4px' }}>About Page</h1>
                        <p style={{ color: theme.colors.adminTextMuted, margin: '4px 0 0', fontSize: 14 }}>
                            Everything shown on the public About page — including the team.
                        </p>
                    </div>
                </div>

                {activeTab !== 'team' && (
                    <button onClick={handleSave} disabled={isSaving} style={{
                        padding: '10px 20px', borderRadius: 9, border: 'none',
                        backgroundColor: theme.colors.prussianBlue, color: 'white',
                        cursor: isSaving ? 'default' : 'pointer', fontWeight: 600, fontSize: 14,
                        display: 'flex', alignItems: 'center', gap: 8, opacity: isSaving ? 0.7 : 1,
                    }}>
                        {isSaving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                        {isSaving ? 'Saving…' : 'Save Changes'}
                    </button>
                )}
            </div>

            {/* Tabs */}
            {/* Tabs */}
            <div className="cms-about-tabs" style={{ display: 'flex', overflowX: 'auto', gap: 4, borderBottom: `1px solid ${theme.colors.adminBorder}`, marginBottom: 24 }}>
                {TABS.map((t) => (
                    <button key={t.key} onClick={() => setActiveTab(t.key)} style={tabStyle(activeTab === t.key)}>
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>
            <style>{`
        .cms-about-tabs {
          scrollbar-width: thin;
          scrollbar-color: ${theme.colors.adminBorderStrong} transparent;
        }
        .cms-about-tabs::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }
        .cms-about-tabs::-webkit-scrollbar-track {
          background: transparent;
        }
        .cms-about-tabs::-webkit-scrollbar-thumb {
          background: ${theme.colors.adminBorderStrong};
          border-radius: 3px;
        }
        .cms-about-tabs::-webkit-scrollbar-thumb:hover {
          background: ${theme.colors.adminAccent};
        }
      `}</style>

            {/* ── Intro ────────────────────────────────────────────────────── */}
            {activeTab === 'intro' && (
                <div style={card}>
                    <SectionHeader icon={<Info size={20} color={theme.colors.prussianBlue} />} title="Page Intro" subtitle="The heading and subheading shown at the top of the About page." />
                    <div style={{ marginBottom: 16 }}>
                        <label style={labelStyle}>Title</label>
                        <input style={inputStyle} value={data.intro.title} onChange={(e) => setData({ ...data, intro: { ...data.intro, title: e.target.value } })} placeholder="About Bowling Planet" />
                    </div>
                    <div>
                        <label style={labelStyle}>Subtitle</label>
                        <textarea style={textareaStyle} value={data.intro.subtitle} onChange={(e) => setData({ ...data, intro: { ...data.intro, subtitle: e.target.value } })} placeholder="Entertainment consulting firm for..." />
                    </div>
                </div>
            )}

            {/* ── Certifications ───────────────────────────────────────────── */}
            {activeTab === 'certifications' && (
                <div style={card}>
                    <SectionHeader icon={<Award size={20} color={theme.colors.prussianBlue} />} title="Trusted Industry Credentials" subtitle="Badges shown near the top of the page (ISO, memberships, etc.)." />
                    {data.certifications.map((c, i) => (
                        <div key={i} style={rowCard}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                                <div>
                                    <label style={labelStyle}>Title</label>
                                    <input style={inputStyle} value={c.title} onChange={(e) => {
                                        const next = [...data.certifications]; next[i] = { ...next[i], title: e.target.value };
                                        setData({ ...data, certifications: next });
                                    }} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Subtitle</label>
                                    <input style={inputStyle} value={c.sub} onChange={(e) => {
                                        const next = [...data.certifications]; next[i] = { ...next[i], sub: e.target.value };
                                        setData({ ...data, certifications: next });
                                    }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                <div>
                                    <label style={labelStyle}>Logo / Badge Image</label>
                                    <ImageField
                                        currentUrl={c.image?.url}
                                        file={pendingFiles[`certificationsImage_${i}`] || null}
                                        onChange={(file) => {
                                            const next = { ...pendingFiles };
                                            if (file) next[`certificationsImage_${i}`] = file; else delete next[`certificationsImage_${i}`];
                                            setPendingFiles(next);
                                        }}
                                    />
                                </div>
                                <button style={deleteBtn} onClick={() => setData({ ...data, certifications: data.certifications.filter((_, idx) => idx !== i) })}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    <button style={addRowBtn} onClick={() => setData({ ...data, certifications: [...data.certifications, { title: '', sub: '' }] })}>
                        <Plus size={16} /> Add Certification
                    </button>
                </div>
            )}

            {/* ── Partners ──────────────────────────────────────────────────── */}
            {activeTab === 'partners' && (
                <div style={card}>
                    <SectionHeader icon={<Network size={20} color={theme.colors.prussianBlue} />} title="Endorsed Connections" subtitle="Partner logos shown in the scrolling marquee." />
                    {data.partners.map((p, i) => (
                        <div key={i} style={rowCard}>
                            <div style={{ marginBottom: 12 }}>
                                <label style={labelStyle}>Partner Name</label>
                                <input style={inputStyle} value={p.name} onChange={(e) => {
                                    const next = [...data.partners]; next[i] = { ...next[i], name: e.target.value };
                                    setData({ ...data, partners: next });
                                }} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                <div>
                                    <label style={labelStyle}>Logo</label>
                                    <ImageField
                                        currentUrl={p.image?.url}
                                        file={pendingFiles[`partnersImage_${i}`] || null}
                                        onChange={(file) => {
                                            const next = { ...pendingFiles };
                                            if (file) next[`partnersImage_${i}`] = file; else delete next[`partnersImage_${i}`];
                                            setPendingFiles(next);
                                        }}
                                    />
                                </div>
                                <button style={deleteBtn} onClick={() => setData({ ...data, partners: data.partners.filter((_, idx) => idx !== i) })}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    <button style={addRowBtn} onClick={() => setData({ ...data, partners: [...data.partners, { name: '' }] })}>
                        <Plus size={16} /> Add Partner
                    </button>
                </div>
            )}

            {/* ── Gallery ───────────────────────────────────────────────────── */}
            {activeTab === 'gallery' && (
                <div style={card}>
                    <SectionHeader icon={<ImageIcon size={20} color={theme.colors.prussianBlue} />} title="Gallery" subtitle="The scrollable photo strip further down the page." />
                    {data.gallery.map((g, i) => (
                        <div key={i} style={rowCard}>
                            <div style={{ marginBottom: 12 }}>
                                <label style={labelStyle}>Caption</label>
                                <input style={inputStyle} value={g.title} onChange={(e) => {
                                    const next = [...data.gallery]; next[i] = { ...next[i], title: e.target.value };
                                    setData({ ...data, gallery: next });
                                }} placeholder="Premium Arcade Centers" />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                <div>
                                    <label style={labelStyle}>Photo</label>
                                    <ImageField
                                        currentUrl={g.image?.url}
                                        file={pendingFiles[`galleryImage_${i}`] || null}
                                        onChange={(file) => {
                                            const next = { ...pendingFiles };
                                            if (file) next[`galleryImage_${i}`] = file; else delete next[`galleryImage_${i}`];
                                            setPendingFiles(next);
                                        }}
                                    />
                                </div>
                                <button style={deleteBtn} onClick={() => setData({ ...data, gallery: data.gallery.filter((_, idx) => idx !== i) })}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    <button style={addRowBtn} onClick={() => setData({ ...data, gallery: [...data.gallery, { title: '' }] })}>
                        <Plus size={16} /> Add Photo
                    </button>
                </div>
            )}

            {/* ── Stats ─────────────────────────────────────────────────────── */}
            {activeTab === 'stats' && (
                <div style={card}>
                    <SectionHeader icon={<BarChart3 size={20} color={theme.colors.prussianBlue} />} title="Stats Strip" subtitle="The four-up numbers row (e.g. 17+ Years, 700+ Games)." />
                    {data.stats.map((s, i) => (
                        <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>Number</label>
                                <input style={inputStyle} value={s.num} onChange={(e) => {
                                    const next = [...data.stats]; next[i] = { ...next[i], num: e.target.value };
                                    setData({ ...data, stats: next });
                                }} placeholder="17+" />
                            </div>
                            <div style={{ flex: 2 }}>
                                <label style={labelStyle}>Label</label>
                                <input style={inputStyle} value={s.label} onChange={(e) => {
                                    const next = [...data.stats]; next[i] = { ...next[i], label: e.target.value };
                                    setData({ ...data, stats: next });
                                }} placeholder="Years" />
                            </div>
                            <button style={deleteBtn} onClick={() => setData({ ...data, stats: data.stats.filter((_, idx) => idx !== i) })}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    <button style={addRowBtn} onClick={() => setData({ ...data, stats: [...data.stats, { num: '', label: '' }] })}>
                        <Plus size={16} /> Add Stat
                    </button>
                </div>
            )}

            {/* ── Vision & Mission ──────────────────────────────────────────── */}
            {activeTab === 'vision' && (
                <div style={card}>
                    <SectionHeader icon={<Target size={20} color={theme.colors.prussianBlue} />} title="Vision & Mission" subtitle="The two side-by-side statements." />
                    <div style={{ marginBottom: 16 }}>
                        <label style={labelStyle}>Vision</label>
                        <textarea style={textareaStyle} value={data.visionMission.vision} onChange={(e) => setData({ ...data, visionMission: { ...data.visionMission, vision: e.target.value } })} />
                    </div>
                    <div>
                        <label style={labelStyle}>Mission</label>
                        <textarea style={textareaStyle} value={data.visionMission.mission} onChange={(e) => setData({ ...data, visionMission: { ...data.visionMission, mission: e.target.value } })} />
                    </div>
                </div>
            )}

            {/* ── Journey ───────────────────────────────────────────────────── */}
            {activeTab === 'journey' && (
                <div style={card}>
                    <SectionHeader icon={<Clock size={20} color={theme.colors.prussianBlue} />} title="Our Journey" subtitle="The company history timeline." />
                    {data.journey.map((j, i) => (
                        <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
                            <div style={{ width: 120 }}>
                                <label style={labelStyle}>Year</label>
                                <input style={inputStyle} value={j.year} onChange={(e) => {
                                    const next = [...data.journey]; next[i] = { ...next[i], year: e.target.value };
                                    setData({ ...data, journey: next });
                                }} placeholder="2020" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>Event</label>
                                <input style={inputStyle} value={j.event} onChange={(e) => {
                                    const next = [...data.journey]; next[i] = { ...next[i], event: e.target.value };
                                    setData({ ...data, journey: next });
                                }} placeholder="Bowling Planet founded" />
                            </div>
                            <button style={{ ...deleteBtn, marginTop: 22 }} onClick={() => setData({ ...data, journey: data.journey.filter((_, idx) => idx !== i) })}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    <button style={addRowBtn} onClick={() => setData({ ...data, journey: [...data.journey, { year: '', event: '' }] })}>
                        <Plus size={16} /> Add Milestone
                    </button>
                </div>
            )}

            {/* ── Founder's Note ────────────────────────────────────────────── */}
            {activeTab === 'founder' && (
                <div style={card}>
                    <SectionHeader icon={<Quote size={20} color={theme.colors.prussianBlue} />} title="Founder's Note" subtitle="The quote card next to the journey timeline." />
                    <div style={{ marginBottom: 16 }}>
                        <label style={labelStyle}>Quote</label>
                        <textarea style={textareaStyle} value={data.founderNote.quote} onChange={(e) => setData({ ...data, founderNote: { ...data.founderNote, quote: e.target.value } })} />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <label style={labelStyle}>Bio</label>
                        <textarea style={textareaStyle} value={data.founderNote.bio} onChange={(e) => setData({ ...data, founderNote: { ...data.founderNote, bio: e.target.value } })} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                        <div>
                            <label style={labelStyle}>Name</label>
                            <input style={inputStyle} value={data.founderNote.name} onChange={(e) => setData({ ...data, founderNote: { ...data.founderNote, name: e.target.value } })} />
                        </div>
                        <div>
                            <label style={labelStyle}>Designation</label>
                            <input style={inputStyle} value={data.founderNote.designation} onChange={(e) => setData({ ...data, founderNote: { ...data.founderNote, designation: e.target.value } })} />
                        </div>
                    </div>
                    <div>
                        <label style={labelStyle}>Photo (optional)</label>
                        <ImageField
                            currentUrl={data.founderNote.image?.url}
                            file={pendingFiles['founderImage'] || null}
                            onChange={(file) => {
                                const next = { ...pendingFiles };
                                if (file) next['founderImage'] = file; else delete next['founderImage'];
                                setPendingFiles(next);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* ── Why Us ────────────────────────────────────────────────────── */}
            {activeTab === 'whyus' && (
                <div style={card}>
                    <SectionHeader icon={<Sparkles size={20} color={theme.colors.prussianBlue} />} title="Why Partners Choose Us" subtitle="The grid of reasons near the bottom of the page." />
                    {data.whyUs.map((w, i) => (
                        <div key={i} style={rowCard}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                                <div>
                                    <label style={labelStyle}>Title</label>
                                    <input style={inputStyle} value={w.title} onChange={(e) => {
                                        const next = [...data.whyUs]; next[i] = { ...next[i], title: e.target.value };
                                        setData({ ...data, whyUs: next });
                                    }} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Icon</label>
                                    <select style={inputStyle} value={w.icon} onChange={(e) => {
                                        const next = [...data.whyUs]; next[i] = { ...next[i], icon: e.target.value };
                                        setData({ ...data, whyUs: next });
                                    }}>
                                        {ICON_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>Description</label>
                                    <textarea style={textareaStyle} value={w.text} onChange={(e) => {
                                        const next = [...data.whyUs]; next[i] = { ...next[i], text: e.target.value };
                                        setData({ ...data, whyUs: next });
                                    }} />
                                </div>
                                <button style={deleteBtn} onClick={() => setData({ ...data, whyUs: data.whyUs.filter((_, idx) => idx !== i) })}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    <button style={addRowBtn} onClick={() => setData({ ...data, whyUs: [...data.whyUs, { title: '', text: '', icon: 'Briefcase' }] })}>
                        <Plus size={16} /> Add Reason
                    </button>
                </div>
            )}

            {/* ── Team Members (separate collection, merged in here for one-stop editing) ── */}
            {activeTab === 'team' && (
                <div style={card}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: `1px solid ${theme.colors.adminBorder}` }}>
                        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                            <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Users size={20} color={theme.colors.prussianBlue} />
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: theme.colors.adminText }}>Team Members</h2>
                                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: theme.colors.adminTextMuted }}>
                                    Shown in the "Leadership &amp; team" section at the bottom of the About page.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => { setActiveMember(null); setEditModalOpen(true); }}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: '#3b82f6', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, fontSize: '14px', cursor: 'pointer', flexShrink: 0 }}
                        >
                            <Plus size={16} /> Add Member
                        </button>
                    </div>

                    {membersLoading ? (
                        <div style={{ padding: 32, textAlign: 'center', color: theme.colors.adminTextMuted }}>Loading team members…</div>
                    ) : members.length === 0 ? (
                        <div style={{ padding: 32, textAlign: 'center', color: theme.colors.adminTextMuted }}>No team members yet. Add your first one.</div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                            {members.map((m) => (
                                <div key={m._id} style={{ backgroundColor: '#FAFBFC', border: `1px solid ${theme.colors.adminBorder}`, borderRadius: '12px', padding: '16px' }}>
                                    <img src={m.image?.url} alt={m.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '50%', margin: '0 auto', display: 'block' }} />
                                    <div style={{ textAlign: 'center', marginTop: '10px' }}>
                                        <h3 style={{ margin: 0, color: theme.colors.adminText, fontSize: '15px' }}>{m.name}</h3>
                                        <div style={{ color: theme.colors.adminTextMuted, fontSize: '13px', marginTop: '2px' }}>{m.designation}</div>
                                        <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: m.status === 'active' ? '#10b981' : '#ef4444' }}>{m.status}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                        <button onClick={() => { setActiveMember(m); setViewModalOpen(true); }} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', border: `1px solid ${theme.colors.adminBorder}`, borderRadius: '6px', background: 'none', color: theme.colors.adminText, cursor: 'pointer' }}>
                                            <Eye size={14} />
                                        </button>
                                        <button onClick={() => { setActiveMember(m); setEditModalOpen(true); }} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', border: `1px solid ${theme.colors.adminBorder}`, borderRadius: '6px', background: 'none', color: theme.colors.adminText, cursor: 'pointer' }}>
                                            <Pencil size={14} />
                                        </button>
                                        <button onClick={() => handleDeleteMember(m)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', border: `1px solid ${theme.colors.adminBorder}`, borderRadius: '6px', background: 'none', color: '#ff4d4d', cursor: 'pointer' }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <TeamMemberModal
                        member={activeMember}
                        isOpen={editModalOpen}
                        onClose={() => setEditModalOpen(false)}
                        onSaveSuccess={() => { setEditModalOpen(false); fetchMembers(); }}
                    />
                    <TeamMemberViewModal
                        member={activeMember}
                        isOpen={viewModalOpen}
                        onClose={() => setViewModalOpen(false)}
                    />
                </div>
            )}
        </div>
    );
};

export default CmsAboutView;
