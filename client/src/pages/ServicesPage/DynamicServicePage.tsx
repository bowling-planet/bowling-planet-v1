import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SEO from '../../components/SEO';
import {
  MapPin, ClipboardCheck, Rocket, Tag, Gift, GraduationCap,
  UserCheck, Users, ShoppingCart, Wrench, Gamepad2, LayoutDashboard,
  CheckCircle2, Circle, ArrowUpRight, Check, Plus,
  Settings, FileText, TrendingUp, ShieldCheck, Layers, PieChart, Target, Award, BookOpen, Activity, BarChart
} from 'lucide-react';
import { useLeadTracker } from '../../context/LeadTrackerContext';
import { serviceDetailApi, type IServiceDetail } from '../../services/serviceDetailApi';
import { getOptimizedImageUrl } from '../../utils/imageUtils';


// Map of string icon names to Lucide components
const IconMap: Record<string, any> = {
  MapPin, ClipboardCheck, Rocket, Tag, Gift, GraduationCap,
  UserCheck, Users, ShoppingCart, Wrench, Gamepad2, LayoutDashboard,
  Settings, FileText, TrendingUp, ShieldCheck, Layers, PieChart, Target, Award, BookOpen, Activity, BarChart
};

// ── COUNTER ──
function useCounter(target: number, inView: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const step = Math.ceil(target / 60);
    let cur = 0;
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { setCount(target); clearInterval(t); }
      else setCount(cur);
    }, 16);
    return () => clearInterval(t);
  }, [inView, target]);
  return count;
}

export default function DynamicServicePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<IServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeIndex, setActiveIndex] = useState(0);
  const metricsRef = useRef<HTMLDivElement>(null);
  const [metricsInView, setMetricsInView] = useState(false);

  const { state, addToEnquiry } = useLeadTracker();

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        setLoading(true);
        if (slug) {
          const res = await serviceDetailApi.getBySlug(slug);
          setData(res);
        }
      } catch (err) {
        console.error('Failed to load service page', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setMetricsInView(true); }, { threshold: 0.3 });
    if (metricsRef.current) obs.observe(metricsRef.current);
    return () => obs.disconnect();
  }, [data]);

  // Handle up to 3 metrics for the counter hooks
  const m1 = data?.metrics?.[0]?.target || 0;
  const m2 = data?.metrics?.[1]?.target || 0;
  const m3 = data?.metrics?.[2]?.target || 0;

  const c1 = useCounter(m1, metricsInView);
  const c2 = useCounter(m2, metricsInView);
  const c3 = useCounter(m3, metricsInView);
  const counterValues = [c1, c2, c3];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #333', borderTop: `3px solid #A78BFA`, animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: 'white' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>Service Not Found</h1>
        <p style={{ color: '#A1A1A6', marginBottom: 24 }}>The service you are looking for does not exist or has been removed.</p>
        <button onClick={() => navigate('/services')} style={{ padding: '12px 24px', background: '#A78BFA', color: 'black', borderRadius: 8, fontWeight: 600 }}>
          Back to Services
        </button>
      </div>
    );
  }

  const isAdded = state.enquiryCart.some(i => i.id === (data.header.leadId || slug));

  return (
    <div className="service-consult bg-black text-[#F5F5F7] min-h-screen">
      <SEO
        title={data.seo.title.includes('Bowling Planet') ? data.seo.title : `${data.seo.title} | Services | Bowling Planet`}
        description={data.seo.description}
      />

      {/* ── PAGE HEADER ── */}
      <header className="relative overflow-hidden border-b border-white/[0.08]">
        <div className="absolute inset-0">
          <img
            src={getOptimizedImageUrl(data.header.image?.url)}
            alt=""
            aria-hidden
            className="h-full w-full object-cover object-center"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 backdrop-blur-sm"
            style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.98) 100%), radial-gradient(ellipse 80% 60% at 70% 40%, rgba(167,139,250,0.15), transparent 60%)' }}
          />
        </div>
        <div className="relative z-[1] mx-auto max-w-[1280px] px-5 pb-8 pt-24 sm:px-7 sm:pb-10 sm:pt-28">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: data.header.accentColor }}>{data.header.subtitle}</p>
              <h1 className="font-display text-[clamp(1.5rem,3vw,2rem)] font-extrabold tracking-[-0.02em] text-[#F5F5F7]">
                {data.header.title}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm text-[#A1A1A6]">{data.features?.length || 0} service areas</p>
              <button
                onClick={() => addToEnquiry({ id: data.header.leadId || slug || '', type: 'service', title: data.header.title })}
                className={`inline-flex h-9 items-center justify-center rounded-full px-5 text-xs font-bold transition-all border gap-1.5 ${
                  isAdded
                    ? 'bg-white/10 border-white/20 text-white cursor-default'
                    : 'cursor-pointer'
                }`}
                style={!isAdded ? { backgroundColor: data.header.accentColor, borderColor: data.header.accentColor, color: '#000' } : {}}
              >
                {isAdded ? <><Check className="h-3.5 w-3.5" /> Added</> : <><Plus className="h-3.5 w-3.5" /> Add to Enquiry</>}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── HERO: split layout ── */}
      <section className="mx-auto max-w-[1280px] px-5 py-12 sm:px-7">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Image 60% */}
          <div className="lg:col-span-3 relative rounded-3xl overflow-hidden h-[400px] border border-white/[0.08]">
            <img
              src={getOptimizedImageUrl(data.hero.image?.url)}
              alt="Mission"
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: data.header.accentColor }}>Mission</p>
              <p className="text-white text-xl font-bold leading-snug">
                {data.hero.missionText}
              </p>
            </div>
          </div>

          {/* Timeline 40% */}
          <div className="lg:col-span-2 flex flex-col justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: data.header.accentColor }}>{data.hero.timelineTitle}</p>
            {data.timeline.map((stage, i) => {
              const Icon = IconMap[stage.iconName] || Circle;
              return (
                <div key={i} className="flex items-center gap-4 rounded-2xl bg-[#0A0A0F] border border-white/[0.06] p-4 hover:border-white/[0.15] transition-all duration-300 group">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `${stage.color}15`, border: `1px solid ${stage.color}30`, color: stage.color }}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: stage.color }}>{stage.phase}</p>
                    <p className="text-white text-sm font-semibold">{stage.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── ANIMATED IMPACT METRICS ── */}
      {data.metrics && data.metrics.length > 0 && (
        <section className="border-t border-white/[0.08] py-16 bg-[#050508]" ref={metricsRef}>
          <div className="mx-auto max-w-[1280px] px-5 sm:px-7">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: data.header.accentColor }}>Proven results</p>
            <h2 className="font-display text-3xl font-extrabold text-white mb-10 tracking-tight">Impact at a Glance</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.metrics.slice(0, 3).map((m, i) => (
                <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/[0.08] h-[200px] cursor-default hover:border-opacity-30 transition-all duration-300">
                  <img src={getOptimizedImageUrl(m.image?.url)} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-20 group-hover:opacity-40 transition-opacity duration-500 scale-105 group-hover:scale-100" loading="lazy" decoding="async" />
                  <div className="relative z-10 flex flex-col justify-end h-full p-7">
                    <p className="font-display text-5xl font-black leading-none mb-2" style={{ color: m.color }}>{counterValues[i]}{m.suffix}</p>
                    <p className="text-white font-semibold text-base">{m.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── INTERACTIVE CHECKLIST EXPLORER ── */}
      {data.features && data.features.length > 0 && (
        <section className="border-t border-white/[0.08] py-20">
          <div className="mx-auto max-w-[1280px] px-5 sm:px-7">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: data.header.accentColor }}>Scope of work</p>
                <h2 className="font-display text-3xl font-extrabold text-white tracking-tight">What We Cover</h2>
              </div>
              <p className="text-sm text-[#A1A1A6]">Click any item to explore</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
              {/* Checklist */}
              <div className="lg:w-[42%] flex flex-col gap-2">
                {data.features.map((f, idx) => {
                  const isActive = activeIndex === idx;
                  const Icon = IconMap[f.iconName] || Circle;
                  return (
                    <div key={idx} className="flex flex-col">
                      <button
                        onClick={() => setActiveIndex(isActive ? -1 : idx)}
                        className={`group flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 border text-left w-full ${
                          isActive
                            ? 'bg-white/5 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)] rounded-b-none'
                            : 'bg-[#0A0A0F] border-white/[0.06] hover:border-white/20 hover:bg-[#0e0e14]'
                        }`}
                        style={isActive ? { borderColor: `${data.header.accentColor}66`, backgroundColor: `${data.header.accentColor}11` } : {}}
                      >
                        <div className={`transition-colors duration-300 shrink-0 ${isActive ? 'text-white' : 'text-[#3A3A42] group-hover:text-white/60'}`} style={isActive ? { color: data.header.accentColor } : {}}>
                          {isActive ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm transition-colors duration-300 ${isActive ? 'text-white' : 'text-[#A1A1A6] group-hover:text-white'}`}>{f.title}</p>
                          {isActive && <p className="text-[#6A6A74] text-xs mt-0.5 hidden lg:block">{f.short}</p>}
                        </div>
                        <div className={`lg:hidden shrink-0 transition-transform duration-300 ${isActive ? 'rotate-180' : 'text-[#3A3A42]'}`} style={isActive ? { color: data.header.accentColor } : {}}>
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M6 9l6 6 6-6"/></svg>
                        </div>
                      </button>

                      {/* MOBILE ACCORDION PANEL */}
                      {isActive && (
                        <div className="lg:hidden border border-t-0 rounded-b-xl overflow-hidden bg-[#0A0A0F]" style={{ borderColor: `${data.header.accentColor}66` }}>
                          <div className="relative h-[200px] overflow-hidden">
                            <img src={getOptimizedImageUrl(f.image?.url)} alt={f.title} className="h-full w-full object-cover opacity-80" loading="lazy" decoding="async" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/10 to-transparent" />
                          </div>
                          <div className="px-5 py-4 flex items-start gap-3 -mt-6 relative z-10">
                            <div className="w-9 h-9 rounded-lg border flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${data.header.accentColor}15`, borderColor: `${data.header.accentColor}33`, color: data.header.accentColor }}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm mb-1">{f.title}</p>
                              <p className="text-[#A1A1A6] text-xs leading-relaxed">{f.short}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Desktop Dynamic Preview */}
              <div className="hidden lg:block lg:w-[58%] sticky top-24 self-start">
                <div className="rounded-3xl border border-white/[0.08] bg-[#0A0A0F] overflow-hidden">
                  <div className="relative h-[300px] overflow-hidden">
                    {data.features.map((f, idx) => (
                      <img
                        key={idx}
                        src={getOptimizedImageUrl(f.image?.url)}
                        alt={f.title}
                        className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${activeIndex === idx ? 'opacity-70 scale-100 z-10' : 'opacity-0 scale-105 z-0'}`}
                        loading="lazy"
                        decoding="async"
                      />
                    ))}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/10 to-transparent z-20" />
                  </div>
                  <div className="p-8 -mt-10 relative z-30">
                    <div className="w-11 h-11 rounded-xl border flex items-center justify-center mb-5"
                      style={{ backgroundColor: `${data.header.accentColor}15`, borderColor: `${data.header.accentColor}33`, color: data.header.accentColor }}>
                      {(() => {
                        const Icon = IconMap[data.features[activeIndex < 0 ? 0 : activeIndex].iconName] || Circle;
                        return <Icon className="h-6 w-6" />;
                      })()}
                    </div>
                    <h3 className="font-display text-2xl font-bold text-white mb-2">{data.features[activeIndex < 0 ? 0 : activeIndex].title}</h3>
                    <p className="text-[#A1A1A6] text-base leading-relaxed">{data.features[activeIndex < 0 ? 0 : activeIndex].short}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── INDUSTRY BENTO GALLERY ── */}
      {data.gallery && data.gallery.length > 0 && (
        <section className="border-t border-white/[0.08] py-20 bg-[#050508]">
          <div className="mx-auto max-w-[1280px] px-5 sm:px-7">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: data.header.accentColor }}>Visual tour</p>
            <h2 className="font-display text-3xl font-extrabold text-white mb-10 tracking-tight">What We Build</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.gallery.map((g, i) => {
                const isWide = (i === 0 || i === 3) && data.gallery.length >= 4;
                return (
                  <div key={i} className={`${isWide ? 'md:col-span-2' : ''} relative rounded-3xl overflow-hidden ${isWide && i===3 ? 'h-[240px]' : (i < 2 ? 'h-[280px]' : 'h-[240px]')} border border-white/[0.08] group`}>
                    <img src={getOptimizedImageUrl(g.image?.url)} alt={g.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" decoding="async" />
                    <div className={`absolute inset-0 ${isWide ? 'bg-gradient-to-r from-black/60 to-transparent' : 'bg-gradient-to-t from-black/70 to-transparent'} flex items-end ${isWide ? 'p-8' : 'p-6'}`}>
                      {isWide ? (
                        <div>
                          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: data.header.accentColor }}>{g.tag}</p>
                          <p className="text-white text-xl font-bold">{g.title}</p>
                        </div>
                      ) : (
                        <p className="text-white font-bold text-lg">{g.title}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── BOTTOM CROSS-LINK BAR ── */}
      {data.crossLink && data.crossLink.text && (
        <section className="border-t border-white/[0.08] py-10 sm:py-12">
          <div className="mx-auto max-w-[1280px] px-5 sm:px-7 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[#A1A1A6] text-sm">{data.crossLink.text}</p>
            <button
              onClick={() => navigate(data.crossLink.buttonLink)}
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/20 px-7 text-sm font-semibold text-white transition-all hover:border-white/40 hover:bg-white/5 gap-2 shrink-0"
            >
              {data.crossLink.buttonText} <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
