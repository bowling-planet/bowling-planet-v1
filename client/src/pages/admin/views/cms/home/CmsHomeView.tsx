import React, { useState, useEffect } from 'react';
import { theme } from '../../../../../theme';
import {
  ArrowLeft, Plus, Trash2, Save, Loader2, Edit2, X,
  Activity, BarChart2, Star, Target, CheckCircle2, AlertCircle,
  Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { homePageApi, type HomePageData } from '../../../../../services/homePageApi';
import { projectService } from '../projects/services/index';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ─── Style Constants (matching admin light theme) ────────────────────────────

const card: React.CSSProperties = {
  backgroundColor: theme.colors.adminSurface,
  borderRadius: '16px',
  border: `1px solid ${theme.colors.adminBorder}`,
  padding: '28px 32px',
  marginBottom: '20px',
};

const input: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  backgroundColor: '#F8FAFC',
  border: `1.5px solid ${theme.colors.adminBorder}`,
  borderRadius: '8px',
  color: theme.colors.adminText,
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
};

const tagChip: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 14px',
  backgroundColor: '#F1F5F9',
  border: `1px solid rgba(3,13,26,0.1)`,
  borderRadius: '100px',
  color: theme.colors.prussianBlue,
  fontSize: '13px',
  fontWeight: 600,
};

const metricCard = (highlight = false): React.CSSProperties => ({
  backgroundColor: highlight ? 'rgba(95,193,209,0.06)' : '#F8FAFC',
  border: `1.5px solid ${highlight ? 'rgba(95,193,209,0.3)' : theme.colors.adminBorder}`,
  borderRadius: '12px',
  padding: '20px 24px',
  textAlign: 'center',
});

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

const deleteBtn: React.CSSProperties = {
  background: 'rgba(239,68,68,0.07)',
  border: 'none',
  color: theme.colors.adminDanger,
  cursor: 'pointer',
  padding: '0 14px',
  borderRadius: '8px',
  height: '42px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const emptyData: HomePageData = {
  hero: { rotatingActivities: [] },
  stats: { yearsOfExperience: '', productsAndEquip: '', projectsDelivered: '', citiesServed: '' },
  trustedBrands: [],
  featuredProjects: { projectIds: [] },
  productCategories: [],
  services: [],
  caseStudies: [],
};

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
}> = ({ icon, title, subtitle, badge }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
      <div style={{
        width: 44, height: 44, borderRadius: '12px',
        backgroundColor: '#F1F5F9',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: theme.colors.adminText }}>{title}</h2>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: theme.colors.adminTextMuted }}>{subtitle}</p>
      </div>
    </div>
    {badge && (
      <span style={{
        fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.05em', padding: '4px 10px', borderRadius: '100px',
        backgroundColor: '#F1F5F9', color: theme.colors.prussianBlue,
        border: '1px solid rgba(3,13,26,0.1)', alignSelf: 'center',
      }}>
        {badge}
      </span>
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const CmsHomeView: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editData, setEditData] = useState<HomePageData>(emptyData);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [caseStudiesFiles, setCaseStudiesFiles] = useState<{ [index: number]: File }>({});
  const [trustedBrandsFiles, setTrustedBrandsFiles] = useState<{ [index: number]: File }>({});
  const [productCategoriesFiles, setProductCategoriesFiles] = useState<{ [index: number]: File }>({});
  const [servicesFiles, setServicesFiles] = useState<{ [index: number]: File }>({});

  const { data: liveData, isLoading: loading } = useQuery({
    queryKey: ['cms-home-page'],
    queryFn: async () => {
      const res = await homePageApi.getHomePageData();
      if (res) {
        const pIds = (res.featuredProjects?.projectIds || []).map((p: any) =>
          typeof p === 'string' ? p : p._id
        );
        return { ...res, featuredProjects: { projectIds: pIds } };
      }
      return emptyData;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects', 'all'],
    queryFn: async () => {
      const response = await projectService.getAll({ page: 1, limit: 100 });
      return response.success ? response.data.projects : [];
    },
    staleTime: 5 * 60 * 1000,
  });
  const projects = projectsData || [];

  // When liveData changes, or when entering edit mode, sync editData
  useEffect(() => {
    if (liveData && !isEditing) {
      setEditData(liveData);
    }
  }, [liveData, isEditing]);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      const allFiles: { [key: string]: File } = {};
      Object.entries(caseStudiesFiles).forEach(([idx, file]) => allFiles[`caseStudiesImage_${idx}`] = file);
      Object.entries(trustedBrandsFiles).forEach(([idx, file]) => allFiles[`trustedBrandsImage_${idx}`] = file);
      Object.entries(productCategoriesFiles).forEach(([idx, file]) => allFiles[`productCategoriesImage_${idx}`] = file);
      Object.entries(servicesFiles).forEach(([idx, file]) => allFiles[`servicesImage_${idx}`] = file);
      
      await homePageApi.updateHomePageData(editData, Object.keys(allFiles).length ? allFiles : undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-home-page'] });
      queryClient.invalidateQueries({ queryKey: ['landing-page'] });
      setIsEditing(false);
      setCaseStudiesFiles({});
      setTrustedBrandsFiles({});
      setProductCategoriesFiles({});
      setServicesFiles({});
      showToast('Home page saved successfully!', 'success');
    },
    onError: () => {
      showToast('Failed to save changes.', 'error');
    }
  });

  const handleSave = () => updateMutation.mutate();

  const handleCancel = () => {
    setIsEditing(false);
    if (liveData) setEditData(liveData);
    setCaseStudiesFiles({});
    setTrustedBrandsFiles({});
    setProductCategoriesFiles({});
    setServicesFiles({});
  };

  // ── Edit data handlers ───────────────────────────────────────────────────
  const setActivity = (i: number, v: string) => {
    const a = [...editData.hero.rotatingActivities]; a[i] = v;
    setEditData(p => ({ ...p, hero: { rotatingActivities: a } }));
  };
  const removeActivity = (i: number) =>
    setEditData(p => ({ ...p, hero: { rotatingActivities: p.hero.rotatingActivities.filter((_, x) => x !== i) } }));
  const addActivity = () =>
    setEditData(p => ({ ...p, hero: { rotatingActivities: [...p.hero.rotatingActivities, ''] } }));

  const setBrandName = (i: number, v: string) => {
    const b = [...editData.trustedBrands]; 
    b[i] = { ...b[i], name: v };
    setEditData(p => ({ ...p, trustedBrands: b }));
  };
  const removeBrand = (i: number) => {
    setEditData(p => ({ ...p, trustedBrands: p.trustedBrands.filter((_, x) => x !== i) }));
    const newFiles = { ...trustedBrandsFiles }; delete newFiles[i]; setTrustedBrandsFiles(newFiles);
  };
  const addBrand = () =>
    setEditData(p => ({ ...p, trustedBrands: [...p.trustedBrands, { name: '' }] }));
  const handleBrandFile = (i: number, file: File | null) => {
    if (file) setTrustedBrandsFiles(prev => ({ ...prev, [i]: file }));
    else { const newF = { ...trustedBrandsFiles }; delete newF[i]; setTrustedBrandsFiles(newF); }
  };

  const setStat = (k: keyof HomePageData['stats'], v: string) =>
    setEditData(p => ({ ...p, stats: { ...p.stats, [k]: v } }));

  // --- Product Categories Handlers ---
  const addProductCategory = () => setEditData(p => ({ ...p, productCategories: [...(p.productCategories || []), { title: '', desc: '', icon: '', count: '', color: '#000000' }] }));
  const removeProductCategory = (i: number) => {
    setEditData(p => ({ ...p, productCategories: (p.productCategories || []).filter((_, x) => x !== i) }));
    const newFiles = { ...productCategoriesFiles }; delete newFiles[i]; setProductCategoriesFiles(newFiles);
  };
  const setProductCategoryField = (i: number, field: 'title' | 'desc' | 'icon' | 'count' | 'color', val: string) => {
    const arr = [...(editData.productCategories || [])]; arr[i] = { ...arr[i], [field]: val };
    setEditData(p => ({ ...p, productCategories: arr }));
  };
  const handleProductCategoryFile = (i: number, file: File | null) => {
    if (file) setProductCategoriesFiles(prev => ({ ...prev, [i]: file }));
    else { const newF = { ...productCategoriesFiles }; delete newF[i]; setProductCategoriesFiles(newF); }
  };

  const toggleProject = (id: string) => {
    const current = editData.featuredProjects.projectIds;
    if (current.includes(id)) {
      setEditData(p => ({ ...p, featuredProjects: { projectIds: current.filter(x => x !== id) } }));
    } else {
      if (current.length >= 4) return showToast('Maximum 4 featured projects allowed.', 'error');
      setEditData(p => ({ ...p, featuredProjects: { projectIds: [...current, id] } }));
    }
  };

  // --- Services Handlers ---
  const addService = () => setEditData(p => ({ ...p, services: [...(p.services || []), { title: '', subtitle: '' }] }));
  const removeService = (i: number) => {
    setEditData(p => ({ ...p, services: (p.services || []).filter((_, x) => x !== i) }));
    const newFiles = { ...servicesFiles }; delete newFiles[i]; setServicesFiles(newFiles);
  };
  const setServiceField = (i: number, field: 'title' | 'subtitle', val: string) => {
    const arr = [...(editData.services || [])]; arr[i] = { ...arr[i], [field]: val };
    setEditData(p => ({ ...p, services: arr }));
  };
  const handleServiceFile = (i: number, file: File | null) => {
    if (file) setServicesFiles(prev => ({ ...prev, [i]: file }));
    else { const newF = { ...servicesFiles }; delete newF[i]; setServicesFiles(newF); }
  };

  // --- Case Studies Handlers ---
  const addCaseStudy = () => setEditData(p => ({ ...p, caseStudies: [...(p.caseStudies || []), { client: '', challenge: '', solution: '', result: '', metric: '' }] }));
  const removeCaseStudy = (i: number) => {
    setEditData(p => ({ ...p, caseStudies: (p.caseStudies || []).filter((_, x) => x !== i) }));
    const newFiles = { ...caseStudiesFiles }; delete newFiles[i]; setCaseStudiesFiles(newFiles);
  };
  const setCaseStudyField = (i: number, field: 'client' | 'challenge' | 'solution' | 'result' | 'metric', val: string) => {
    const arr = [...(editData.caseStudies || [])]; arr[i] = { ...arr[i], [field]: val };
    setEditData(p => ({ ...p, caseStudies: arr }));
  };
  const handleCaseStudyFile = (i: number, file: File | null) => {
    if (file) setCaseStudiesFiles(prev => ({ ...prev, [i]: file }));
    else { const newF = { ...caseStudiesFiles }; delete newF[i]; setCaseStudiesFiles(newF); }
  };

  // ─────────────────────────────────────────────────────────────────────────

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: 16 }}>
      <Loader2 size={36} color={theme.colors.prussianBlue} style={{ animation: 'spin 1s linear infinite' }} />
      <p style={{ color: theme.colors.adminTextMuted, fontSize: 15 }}>Loading page configuration…</p>
    </div>
  );

  const d = (isEditing ? editData : liveData) || emptyData;

  return (
    <div style={{ paddingBottom: 80 }}>

      {/* ── TOAST ── */}
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
          {toast.type === 'success'
            ? <CheckCircle2 size={18} color="#059669" />
            : <AlertCircle size={18} color="#DC2626" />
          }
          {toast.msg}
        </div>
      )}

      {/* ── PAGE HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => navigate('/admin/cms')}
            style={{
              background: theme.colors.adminSurface,
              border: `1px solid ${theme.colors.adminBorder}`,
              borderRadius: 10, padding: '9px 10px', cursor: 'pointer',
              color: theme.colors.adminText, display: 'flex',
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: theme.colors.adminText, margin: 0, letterSpacing: '-0.4px' }}>
              Home Page
            </h1>
            <p style={{ color: theme.colors.adminTextMuted, margin: '4px 0 0', fontSize: 14 }}>
              Configure dynamic content displayed on the public landing page.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {isEditing ? (
            <>
              <button onClick={handleCancel} style={{ padding: '10px 20px', borderRadius: '8px', border: `1px solid ${theme.colors.adminBorder}`, backgroundColor: theme.colors.adminSurface, color: theme.colors.adminText, cursor: 'pointer', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <X size={16} /> Cancel
              </button>
              <button onClick={handleSave} disabled={updateMutation.isPending} style={{
                padding: '10px 22px', borderRadius: '8px', border: 'none',
                backgroundColor: theme.colors.prussianBlue, color: '#fff',
                cursor: updateMutation.isPending ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 14,
                display: 'flex', alignItems: 'center', gap: 8,
                opacity: updateMutation.isPending ? 0.75 : 1,
                boxShadow: '0 4px 12px rgba(3,13,26,0.15)',
              }}>
                {updateMutation.isPending ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} style={{
              padding: '10px 22px', borderRadius: 9, border: 'none',
              backgroundColor: theme.colors.prussianBlue, color: '#fff',
              cursor: 'pointer', fontWeight: 700, fontSize: 14,
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 4px 12px rgba(3,13,26,0.15)',
            }}>
              <Edit2 size={16} /> Edit Page
            </button>
          )}
        </div>
      </div>

      {/* ── STATUS BANNER (View mode) ── */}
      {!isEditing && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
          backgroundColor: '#F0FDFA', border: '1px solid #A7F3D0',
          borderRadius: 12, marginBottom: 24, color: '#065F46',
        }}>
          <CheckCircle2 size={18} color="#059669" />
          <span style={{ fontSize: 14, fontWeight: 500 }}>
            You are viewing the <strong>live configuration</strong>. Click <em>Edit Page</em> to make changes.
          </span>
        </div>
      )}
      {isEditing && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
          backgroundColor: '#FFFBEB', border: '1px solid #FDE68A',
          borderRadius: 12, marginBottom: 24, color: '#92400E',
        }}>
          <AlertCircle size={18} color="#D97706" />
          <span style={{ fontSize: 14, fontWeight: 500 }}>
            You are in <strong>edit mode</strong>. Changes are not saved until you click <em>Save Changes</em>.
          </span>
        </div>
      )}

      {/* ─────────────── SECTION 1 — HERO ACTIVITIES ─────────────── */}
      <div style={card}>
        <SectionHeader
          icon={<Activity size={20} color={theme.colors.prussianBlue} />}
          title="Hero Activities"
          subtitle="Rotating words in the main headline — e.g. 'Bowling Lanes', 'VR Gaming'."
        />
        {!isEditing ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {d.hero.rotatingActivities.length === 0
              ? <p style={{ color: theme.colors.adminTextMuted, fontSize: 14 }}>No activities configured yet.</p>
              : d.hero.rotatingActivities.map((a, i) => (
                <span key={i} style={tagChip}>{a}</span>
              ))
            }
          </div>
        ) : (
          <>
            {editData.hero.rotatingActivities.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  style={input}
                  value={a}
                  onChange={e => setActivity(i, e.target.value)}
                  placeholder="e.g. Trampoline Parks"
                />
                <button onClick={() => removeActivity(i)} style={deleteBtn}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button onClick={addActivity} style={addRowBtn}>
              <Plus size={16} /> Add Activity
            </button>
          </>
        )}
      </div>

      {/* ─────────────── SECTION 2 — KEY STATISTICS ─────────────── */}
      <div style={card}>
        <SectionHeader
          icon={<BarChart2 size={20} color={theme.colors.prussianBlue} />}
          title="Key Statistics"
          subtitle="The 4 headline metrics shown in the stats bar below the hero."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {(
            [
              { key: 'yearsOfExperience', label: 'Years of Experience', placeholder: 'e.g. 15+' },
              { key: 'productsAndEquip', label: 'Products & Equipment', placeholder: 'e.g. 500+' },
              { key: 'projectsDelivered', label: 'Projects Delivered', placeholder: 'e.g. 200+' },
              { key: 'citiesServed', label: 'Cities Served', placeholder: 'e.g. 10+' },
            ] as const
          ).map(({ key, label, placeholder }) => (
            <div key={key} style={metricCard(!isEditing)}>
              {!isEditing ? (
                <>
                  <div style={{ fontSize: 32, fontWeight: 800, color: theme.colors.adminText, letterSpacing: '-1px' }}>
                    {d.stats[key] || '—'}
                  </div>
                  <div style={{ fontSize: 12, color: theme.colors.adminTextMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 6 }}>
                    {label}
                  </div>
                </>
              ) : (
                <>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: theme.colors.adminTextMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {label}
                  </label>
                  <input style={input} value={editData.stats[key]} onChange={e => setStat(key, e.target.value)} placeholder={placeholder} />
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─────────────── SECTION 3 — TRUSTED BRANDS ─────────────── */}
      <div style={card}>
        <SectionHeader
          icon={<Star size={20} color={theme.colors.prussianBlue} />}
          title="Trusted Brands"
          subtitle="Client names scrolling in the marquee strip on the landing page."
        />
        {!isEditing ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {d.trustedBrands.length === 0
              ? <p style={{ color: theme.colors.adminTextMuted, fontSize: 14 }}>No brands configured yet.</p>
              : d.trustedBrands.map((b, i) => (
                <div key={i} style={{ border: `1px solid ${theme.colors.adminBorder}`, borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
                  {b.image?.url ? (
                    <img src={b.image.url} alt={b.name} style={{ width: '100%', height: 60, objectFit: 'contain', marginBottom: 8 }} />
                  ) : (
                    <div style={{ width: '100%', height: 60, backgroundColor: '#E2E8F0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: theme.colors.adminTextLight, marginBottom: 8 }}>No image</div>
                  )}
                  <span style={{ fontSize: 14, fontWeight: 600, color: theme.colors.adminText }}>{b.name || 'Unnamed Brand'}</span>
                </div>
              ))
            }
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {editData.trustedBrands.map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, border: `1px solid ${theme.colors.adminBorder}`, borderRadius: 12, backgroundColor: '#F8FAFC', position: 'relative' }}>
                <button onClick={() => removeBrand(i)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: theme.colors.adminDanger, cursor: 'pointer' }}><Trash2 size={16} /></button>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: theme.colors.adminText }}>Brand Name</label>
                  <input style={input} value={b.name} onChange={e => setBrandName(i, e.target.value)} placeholder="e.g. Fun City" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: theme.colors.adminText }}>Brand Logo</label>
                  {trustedBrandsFiles[i] ? (
                    <div style={{ fontSize: 13, color: theme.colors.prussianBlue }}>{trustedBrandsFiles[i].name} <button onClick={() => handleBrandFile(i, null)} style={{ border: 'none', background: 'none', color: theme.colors.adminDanger, cursor: 'pointer', marginLeft: 8 }}>Remove</button></div>
                  ) : b.image?.url ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src={b.image.url} alt="" style={{ width: 60, height: 40, objectFit: 'contain', borderRadius: 4, backgroundColor: 'white' }} />
                      <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleBrandFile(i, e.target.files[0])} style={{ fontSize: 13 }} />
                    </div>
                  ) : (
                    <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleBrandFile(i, e.target.files[0])} style={{ fontSize: 13 }} />
                  )}
                </div>
              </div>
            ))}
            <button onClick={addBrand} style={addRowBtn}><Plus size={16} /> Add Brand</button>
          </div>
        )}
      </div>

      {/* ─────────────── SECTION 4 — FEATURED PROJECTS ─────────────── */}
      <div style={card}>
        <SectionHeader
          icon={<Target size={20} color={theme.colors.prussianBlue} />}
          title="Featured Projects"
          subtitle="Pick up to 4 projects to spotlight in the 'Our Work' section."
          badge={`${d.featuredProjects.projectIds.length} / 4 selected`}
        />

        {projectsLoading ? (
          <div style={{ textAlign: 'center', padding: '24px', color: theme.colors.adminTextMuted, fontSize: 14 }}>
            Loading projects…
          </div>
        ) : projects.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: theme.colors.adminTextMuted, fontSize: 14 }}>
            No projects found. Add projects in the Projects CMS first.
          </div>
        ) : !isEditing ? (
          // VIEW MODE — show selected projects as cards
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {d.featuredProjects.projectIds.length === 0 && (
              <p style={{ color: theme.colors.adminTextMuted, fontSize: 14, gridColumn: '1/-1' }}>No featured projects selected yet.</p>
            )}
            {d.featuredProjects.projectIds.map(id => {
              const p = projects.find(x => x._id === id);
              if (!p) return null;
              return (
                <div key={id} style={{ borderRadius: 12, overflow: 'hidden', border: `1.5px solid ${theme.colors.prussianBlue}`, backgroundColor: theme.colors.adminSurface }}>
                  <div style={{ height: 120, backgroundColor: theme.colors.adminBorder, position: 'relative' }}>
                    {p.media?.[0]?.url
                      ? <img src={p.media[0].url} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: theme.colors.adminTextLight, fontSize: 12 }}>No image</div>
                    }
                    <div style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: '50%', backgroundColor: theme.colors.prussianBlue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 size={14} color="white" />
                    </div>
                  </div>
                  <div style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: theme.colors.adminText }}>{p.title}</div>
                </div>
              );
            })}
          </div>
        ) : (
          // EDIT MODE — toggleable grid of all projects
          <>
            <p style={{ fontSize: 13, color: theme.colors.adminTextMuted, marginBottom: 16, marginTop: 0 }}>
              Click a project to select / deselect it. Maximum 4 can be selected at once.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 14 }}>
              {projects.map(p => {
                const isSelected = editData.featuredProjects.projectIds.includes(p._id);
                const isDisabled = !isSelected && editData.featuredProjects.projectIds.length >= 4;
                return (
                  <div
                    key={p._id}
                    onClick={() => !isDisabled && toggleProject(p._id)}
                    style={{
                      borderRadius: 12, overflow: 'hidden', cursor: isDisabled ? 'not-allowed' : 'pointer',
                      border: `2px solid ${isSelected ? theme.colors.prussianBlue : theme.colors.adminBorder}`,
                      opacity: isDisabled ? 0.45 : 1,
                      transition: 'all 0.18s ease',
                      boxShadow: isSelected ? `0 0 0 3px rgba(3,13,26,0.15)` : 'none',
                      position: 'relative',
                    }}
                  >
                    <div style={{ height: 100, backgroundColor: '#F1F5F9', position: 'relative' }}>
                      {p.media?.[0]?.url
                        ? <img src={p.media[0].url} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: isSelected ? 'none' : 'saturate(0.6)' }} />
                        : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: theme.colors.adminTextLight, fontSize: 12 }}>No image</div>
                      }
                      {isSelected && (
                        <div style={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: '50%', backgroundColor: theme.colors.prussianBlue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CheckCircle2 size={13} color="white" />
                        </div>
                      )}
                    </div>
                    <div style={{
                      padding: '10px 12px', fontSize: 12, fontWeight: 600,
                      color: isSelected ? theme.colors.prussianBlue : theme.colors.adminText,
                      backgroundColor: isSelected ? '#F1F5F9' : theme.colors.adminSurface,
                    }}>
                      {p.title}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ─────────────── SECTION 5 — PRODUCT CATEGORIES ─────────────── */}
      <div style={card}>
        <SectionHeader
          icon={<Layers size={20} color={theme.colors.prussianBlue} />}
          title="Product Categories"
          subtitle="Manage the categories displayed in the Products section on the landing page."
        />
        {!isEditing ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {d.productCategories?.length === 0 && <p style={{ color: theme.colors.adminTextMuted, fontSize: 14 }}>No product categories added.</p>}
            {d.productCategories?.map((cat, i) => (
              <div key={i} style={{ border: `1px solid ${theme.colors.adminBorder}`, borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span style={{ fontSize: 24, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9', borderRadius: 8 }}>{cat.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16, color: cat.color }}>{cat.title || 'Untitled'}</div>
                    <div style={{ fontSize: 13, color: theme.colors.adminTextMuted, fontWeight: 500 }}>{cat.count}</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: theme.colors.adminTextMuted, marginBottom: 12 }}>{cat.desc}</div>
                {cat.image?.url ? <img src={cat.image.url} alt="Category" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }} /> : <div style={{ width: '100%', height: 120, backgroundColor: '#f1f5f9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: theme.colors.adminTextLight }}>No image</div>}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {editData.productCategories?.map((cat, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, border: `1px solid ${theme.colors.adminBorder}`, borderRadius: 12, backgroundColor: '#F8FAFC', position: 'relative' }}>
                <button onClick={() => removeProductCategory(i)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: theme.colors.adminDanger, cursor: 'pointer' }}><Trash2 size={16} /></button>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: theme.colors.adminText }}>Title</label>
                    <input style={input} value={cat.title} onChange={e => setProductCategoryField(i, 'title', e.target.value)} placeholder="e.g. Arcade & Video" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: theme.colors.adminText }}>Count/Metric</label>
                    <input style={input} value={cat.count} onChange={e => setProductCategoryField(i, 'count', e.target.value)} placeholder="e.g. 200+ Titles" />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: theme.colors.adminText }}>Description</label>
                    <input style={input} value={cat.desc} onChange={e => setProductCategoryField(i, 'desc', e.target.value)} placeholder="Short description..." />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: theme.colors.adminText }}>Icon (Emoji)</label>
                    <input style={input} value={cat.icon} onChange={e => setProductCategoryField(i, 'icon', e.target.value)} placeholder="🕹" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: theme.colors.adminText }}>Theme Color (Hex)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="color" value={cat.color || '#000000'} onChange={e => setProductCategoryField(i, 'color', e.target.value)} style={{ width: 40, height: 40, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                      <input style={{ ...input, flex: 1 }} value={cat.color} onChange={e => setProductCategoryField(i, 'color', e.target.value)} placeholder="#5FC1D1" />
                    </div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: theme.colors.adminText }}>Image</label>
                    {productCategoriesFiles[i] ? <div style={{ fontSize: 13, color: theme.colors.prussianBlue }}>{productCategoriesFiles[i].name} <button onClick={() => handleProductCategoryFile(i, null)} style={{ border: 'none', background: 'none', color: theme.colors.adminDanger, cursor: 'pointer', marginLeft: 8 }}>Remove</button></div> : cat.image?.url ? <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><img src={cat.image.url} alt="" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4 }} /><input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleProductCategoryFile(i, e.target.files[0])} style={{ fontSize: 13 }} /></div> : <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleProductCategoryFile(i, e.target.files[0])} style={{ fontSize: 13 }} />}
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addProductCategory} style={addRowBtn}><Plus size={16} /> Add Category</button>
          </div>
        )}
      </div>


      {/* ─────────────── SECTION 6 — SERVICES ─────────────── */}
      <div style={card}>
        <SectionHeader
          icon={<Layers size={20} color={theme.colors.prussianBlue} />}
          title="What We Do (Services)"
          subtitle="Manage the service pillars displayed in the 'What We Do' section on the landing page."
        />
        {!isEditing ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {d.services?.length === 0 && <p style={{ color: theme.colors.adminTextMuted, fontSize: 14 }}>No services added.</p>}
            {d.services?.map((svc, i) => (
              <div key={i} style={{ border: `1px solid ${theme.colors.adminBorder}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4, color: theme.colors.adminText }}>{svc.title || 'Untitled'}</div>
                <div style={{ fontSize: 13, color: theme.colors.adminTextMuted, marginBottom: 12 }}>{svc.subtitle}</div>
                {svc.image?.url ? <img src={svc.image.url} alt="Service" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }} /> : <div style={{ width: '100%', height: 120, backgroundColor: '#f1f5f9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: theme.colors.adminTextLight }}>No image</div>}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {editData.services?.map((svc, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, border: `1px solid ${theme.colors.adminBorder}`, borderRadius: 12, backgroundColor: '#F8FAFC', position: 'relative' }}>
                <button onClick={() => removeService(i)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: theme.colors.adminDanger, cursor: 'pointer' }}><Trash2 size={16} /></button>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: theme.colors.adminText }}>Title</label>
                    <input style={input} value={svc.title} onChange={e => setServiceField(i, 'title', e.target.value)} placeholder="e.g. Pre-Opening Consulting" />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: theme.colors.adminText }}>Subtitle / Description</label>
                    <input style={input} value={svc.subtitle} onChange={e => setServiceField(i, 'subtitle', e.target.value)} placeholder="Description..." />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: theme.colors.adminText }}>Image</label>
                    {servicesFiles[i] ? <div style={{ fontSize: 13, color: theme.colors.prussianBlue }}>{servicesFiles[i].name} <button onClick={() => handleServiceFile(i, null)} style={{ border: 'none', background: 'none', color: theme.colors.adminDanger, cursor: 'pointer', marginLeft: 8 }}>Remove</button></div> : svc.image?.url ? <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><img src={svc.image.url} alt="" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4 }} /><input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleServiceFile(i, e.target.files[0])} style={{ fontSize: 13 }} /></div> : <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleServiceFile(i, e.target.files[0])} style={{ fontSize: 13 }} />}
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addService} style={addRowBtn}><Plus size={16} /> Add Service</button>
          </div>
        )}
      </div>

      {/* ─────────────── SECTION 7 — CASE STUDIES ─────────────── */}
      <div style={card}>
        <SectionHeader
          icon={<BarChart2 size={20} color={theme.colors.prussianBlue} />}
          title="Case Studies"
          subtitle="Manage the case studies highlighted on the landing page."
        />
        {!isEditing ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {d.caseStudies?.length === 0 && <p style={{ color: theme.colors.adminTextMuted, fontSize: 14 }}>No case studies added.</p>}
            {d.caseStudies?.map((cs, i) => (
              <div key={i} style={{ border: `1px solid ${theme.colors.adminBorder}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4, color: theme.colors.adminText }}>{cs.client || 'Untitled'}</div>
                <div style={{ fontSize: 13, color: theme.colors.adminTextMuted, marginBottom: 4 }}><b>Challenge:</b> {cs.challenge}</div>
                <div style={{ fontSize: 13, color: theme.colors.adminTextMuted, marginBottom: 4 }}><b>Solution:</b> {cs.solution}</div>
                <div style={{ fontSize: 13, color: theme.colors.prussianBlue, fontWeight: 600, marginBottom: 12 }}>{cs.metric}</div>
                {cs.image?.url ? <img src={cs.image.url} alt="Case Study" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }} /> : <div style={{ width: '100%', height: 120, backgroundColor: '#f1f5f9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: theme.colors.adminTextLight }}>No image</div>}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {editData.caseStudies?.map((cs, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, border: `1px solid ${theme.colors.adminBorder}`, borderRadius: 12, backgroundColor: '#F8FAFC', position: 'relative' }}>
                <button onClick={() => removeCaseStudy(i)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: theme.colors.adminDanger, cursor: 'pointer' }}><Trash2 size={16} /></button>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: theme.colors.adminText }}>Client / Project Name</label>
                    <input style={input} value={cs.client} onChange={e => setCaseStudyField(i, 'client', e.target.value)} placeholder="Client name" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: theme.colors.adminText }}>Metric / Result Highlight</label>
                    <input style={input} value={cs.metric} onChange={e => setCaseStudyField(i, 'metric', e.target.value)} placeholder="e.g. +40% Revenue" />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: theme.colors.adminText }}>Challenge</label>
                    <input style={input} value={cs.challenge} onChange={e => setCaseStudyField(i, 'challenge', e.target.value)} placeholder="What was the challenge?" />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: theme.colors.adminText }}>Solution</label>
                    <input style={input} value={cs.solution} onChange={e => setCaseStudyField(i, 'solution', e.target.value)} placeholder="How did we solve it?" />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: theme.colors.adminText }}>Detailed Result</label>
                    <input style={input} value={cs.result} onChange={e => setCaseStudyField(i, 'result', e.target.value)} placeholder="Detailed outcome" />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: theme.colors.adminText }}>Image</label>
                    {caseStudiesFiles[i] ? <div style={{ fontSize: 13, color: theme.colors.prussianBlue }}>{caseStudiesFiles[i].name} <button onClick={() => handleCaseStudyFile(i, null)} style={{ border: 'none', background: 'none', color: theme.colors.adminDanger, cursor: 'pointer', marginLeft: 8 }}>Remove</button></div> : cs.image?.url ? <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><img src={cs.image.url} alt="" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4 }} /><input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleCaseStudyFile(i, e.target.files[0])} style={{ fontSize: 13 }} /></div> : <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleCaseStudyFile(i, e.target.files[0])} style={{ fontSize: 13 }} />}
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addCaseStudy} style={addRowBtn}><Plus size={16} /> Add Case Study</button>
          </div>
        )}
      </div>

      {/* ── Bottom CTA when editing ── */}
      {isEditing && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 100,
          display: 'flex', justifyContent: 'flex-end', gap: 12,
          backgroundColor: 'rgba(244,246,249,0.92)',
          backdropFilter: 'blur(8px)',
          padding: '16px 24px',
          borderRadius: 14,
          border: `1px solid ${theme.colors.adminBorder}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}>
          <button onClick={handleCancel} style={{
            padding: '10px 20px', borderRadius: 9, border: `1px solid ${theme.colors.adminBorder}`,
            backgroundColor: theme.colors.adminSurface, color: theme.colors.adminText,
            cursor: 'pointer', fontWeight: 600, fontSize: 14,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <X size={16} /> Cancel
          </button>
          <button onClick={handleSave} disabled={updateMutation.isPending} style={{
            padding: '10px 24px', borderRadius: 9, border: 'none',
            backgroundColor: theme.colors.prussianBlue, color: '#fff',
            cursor: updateMutation.isPending ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 14,
            display: 'flex', alignItems: 'center', gap: 8,
            opacity: updateMutation.isPending ? 0.75 : 1,
            boxShadow: '0 4px 12px rgba(3,13,26,0.15)',
          }}>
            {updateMutation.isPending ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
            {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
