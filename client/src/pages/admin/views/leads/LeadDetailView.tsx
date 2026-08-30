import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, MapPin, Phone, Mail, Building, MessageCircle } from 'lucide-react';
import { theme } from '../../../../theme';
import { leadService } from './lead.service';
import { useToast } from '../../components/Toast';

export const LeadDetailView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>('');
  const [visibleEvents, setVisibleEvents] = useState(5);

  const fetchLead = async () => {
    setLoading(true);
    try {
      const res = await leadService.getById(id!);
      const leadData = res?.data || res;
      setLead(leadData);
      setStatus(leadData?.status || 'New');
    } catch {
      showToast('error', 'Failed to load lead details');
      navigate('/admin/leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchLead();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    try {
      await leadService.updateStatus(id!, newStatus);
      showToast('success', 'Lead status updated');
    } catch {
      showToast('error', 'Failed to update status');
      setStatus(lead.status); // revert
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      await leadService.delete(id!);
      showToast('success', 'Lead deleted');
      navigate('/admin/leads');
    } catch {
      showToast('error', 'Failed to delete lead');
    }
  };

  if (loading) return <div style={{ padding: '32px', color: theme.colors.adminTextMuted }}>Loading lead...</div>;
  if (!lead) return null;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/admin/leads')} style={{ background: 'none', border: `1px solid ${theme.colors.adminBorder}`, borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: theme.colors.adminText }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: theme.colors.adminText, margin: 0 }}>{lead.name || 'Anonymous Lead'}</h1>
            <p style={{ color: theme.colors.adminTextMuted, margin: '4px 0 0 0', fontSize: '14px' }}>
              Submitted on {new Date(lead.createdAt).toLocaleString()} 
              {lead.isPartial && <span style={{ marginLeft: '8px', color: '#EF4444', fontWeight: 600 }}>(Abandoned Form)</span>}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select 
            value={status} 
            onChange={(e) => handleStatusChange(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${theme.colors.adminBorder}`, backgroundColor: theme.colors.adminSurface, color: theme.colors.adminText, fontSize: '14px', outline: 'none', cursor: 'pointer' }}
          >
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Closed">Closed</option>
            <option value="Abandoned">Abandoned</option>
          </select>
          <button onClick={handleDelete} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#EF4444', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Contact Information */}
          <div style={{ backgroundColor: theme.colors.adminSurface, borderRadius: '12px', border: `1px solid ${theme.colors.adminBorder}`, padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: theme.colors.adminText, margin: '0 0 20px 0', borderBottom: `1px solid ${theme.colors.adminBorder}`, paddingBottom: '12px' }}>Contact Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4B5563' }}><Phone size={20} /></div>
                <div>
                  <div style={{ fontSize: '12px', color: theme.colors.adminTextMuted, marginBottom: '4px' }}>Phone</div>
                  {lead.phone ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {lead.phone.split(',').map((phoneStr:any, idx:any) => {
                        const trimmedPhone = phoneStr.trim();
                        return (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ fontSize: '15px', color: theme.colors.adminText, fontWeight: 500 }}>{trimmedPhone}</div>
                            <a 
                              href={`https://wa.me/${trimmedPhone.replace(/[^0-9]/g, '')}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ 
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                backgroundColor: '#25D366', color: 'white', padding: '4px', borderRadius: '4px',
                                textDecoration: 'none'
                              }}
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle size={14} />
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ fontSize: '15px', color: theme.colors.adminText, fontWeight: 500 }}>-</div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4B5563' }}><Mail size={20} /></div>
                <div>
                  <div style={{ fontSize: '12px', color: theme.colors.adminTextMuted, marginBottom: '4px' }}>Email</div>
                  {lead.email ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {lead.email.split(',').map((eStr:any, idx:any) => (
                        <div key={idx} style={{ fontSize: '15px', color: theme.colors.adminText, fontWeight: 500 }}>{eStr.trim()}</div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '15px', color: theme.colors.adminText, fontWeight: 500 }}>-</div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4B5563' }}><MapPin size={20} /></div>
                <div>
                  <div style={{ fontSize: '12px', color: theme.colors.adminTextMuted, marginBottom: '4px' }}>City/Location</div>
                  <div style={{ fontSize: '15px', color: theme.colors.adminText, fontWeight: 500 }}>{lead.city || '-'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4B5563' }}><Building size={20} /></div>
                <div>
                  <div style={{ fontSize: '12px', color: theme.colors.adminTextMuted, marginBottom: '4px' }}>Business Details</div>
                  {lead.businessDetails ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {lead.businessDetails.split('|').map((detail:any, idx:any) => (
                        <div key={idx} style={{ fontSize: '14px', color: theme.colors.adminText, fontWeight: 500, backgroundColor: theme.colors.adminBg, padding: '8px', borderRadius: '6px' }}>
                          {detail.trim()}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '15px', color: theme.colors.adminText, fontWeight: 500 }}>-</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Enquiry Items */}
          <div style={{ backgroundColor: theme.colors.adminSurface, borderRadius: '12px', border: `1px solid ${theme.colors.adminBorder}`, padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: theme.colors.adminText, margin: '0 0 20px 0', borderBottom: `1px solid ${theme.colors.adminBorder}`, paddingBottom: '12px' }}>Interested In (Enquiry Cart)</h2>
            {lead.enquiryItems && lead.enquiryItems.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {lead.enquiryItems.map((item: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: theme.colors.adminBg, borderRadius: '8px', border: `1px solid ${theme.colors.adminBorder}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: theme.colors.adminText }}>{item.title}</div>
                    </div>
                    <span style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: '#E5E7EB', color: '#374151', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.type}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: theme.colors.adminTextMuted, fontSize: '14px' }}>No specific items Remove from Enquiry.</div>
            )}
          </div>

        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Tracking & UTM */}
          <div style={{ backgroundColor: theme.colors.adminSurface, borderRadius: '12px', border: `1px solid ${theme.colors.adminBorder}`, padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: theme.colors.adminText, margin: '0 0 20px 0', borderBottom: `1px solid ${theme.colors.adminBorder}`, paddingBottom: '12px' }}>Acquisition</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: theme.colors.adminTextMuted, marginBottom: '4px' }}>Visitor Type</div>
                <div style={{ fontSize: '14px', color: theme.colors.adminText, fontWeight: 500 }}>
                  {lead.behavior?.isReturningVisitor ? 'Returning Visitor' : 'New Visitor'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: theme.colors.adminTextMuted, marginBottom: '4px' }}>UTM Source</div>
                <div style={{ fontSize: '14px', color: theme.colors.adminText, fontWeight: 500 }}>{lead.utm?.source || 'Direct'}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: theme.colors.adminTextMuted, marginBottom: '4px' }}>UTM Medium</div>
                <div style={{ fontSize: '14px', color: theme.colors.adminText, fontWeight: 500 }}>{lead.utm?.medium || '-'}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: theme.colors.adminTextMuted, marginBottom: '4px' }}>UTM Campaign</div>
                <div style={{ fontSize: '14px', color: theme.colors.adminText, fontWeight: 500 }}>{lead.utm?.campaign || '-'}</div>
              </div>
            </div>
          </div>

          {/* Behavior / Event Log */}
          <div style={{ backgroundColor: theme.colors.adminSurface, borderRadius: '12px', border: `1px solid ${theme.colors.adminBorder}`, padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: theme.colors.adminText, margin: '0 0 20px 0', borderBottom: `1px solid ${theme.colors.adminBorder}`, paddingBottom: '12px' }}>User Journey (CTA Tracking)</h2>
            {lead.behavior?.eventLog && lead.behavior.eventLog.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '12px' }}>
                {lead.behavior.eventLog.slice(0, visibleEvents).map((ev: any, idx: number) => {
                  const isLastVisible = idx === Math.min(visibleEvents, lead.behavior.eventLog.length) - 1;
                  return (
                  <div key={idx} style={{ position: 'relative', paddingBottom: isLastVisible ? '0' : '24px' }}>
                    {/* Timeline Line */}
                    {!isLastVisible && (
                      <div style={{ position: 'absolute', left: '-1px', top: '24px', bottom: '0', width: '2px', backgroundColor: '#E2E8F0' }} />
                    )}
                    {/* Timeline Dot */}
                    <div style={{ position: 'absolute', left: '-5px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: theme.colors.teal, border: '2px solid #ffffff', boxShadow: '0 0 0 1px #E2E8F0' }} />
                    
                    <div style={{ paddingLeft: '24px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: theme.colors.adminText }}>{ev.label}</div>
                      <div style={{ fontSize: '12px', color: theme.colors.adminTextMuted, marginTop: '4px' }}>
                        {new Date(ev.timestamp).toLocaleString()} <span style={{ margin: '0 8px' }}>&bull;</span> <span style={{ fontFamily: 'monospace', backgroundColor: '#F1F5F9', padding: '2px 6px', borderRadius: '4px', color: '#475569' }}>{ev.path}</span>
                      </div>
                    </div>
                  </div>
                )})}
                {visibleEvents < lead.behavior.eventLog.length && (
                  <button 
                    onClick={() => setVisibleEvents(prev => prev + 5)}
                    style={{ marginTop: '20px', padding: '8px 16px', backgroundColor: '#F3F4F6', color: '#4B5563', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, alignSelf: 'flex-start', transition: 'background-color 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                  >
                    See More Events ({lead.behavior.eventLog.length - visibleEvents} remaining)
                  </button>
                )}
              </div>
            ) : (
              <div style={{ color: theme.colors.adminTextMuted, fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>No interaction events tracked for this user.</div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
