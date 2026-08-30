import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, Filter, Eye, Trash2, Smartphone, Monitor, Loader2, ChevronDown, MessageCircle } from 'lucide-react';
import { theme } from '../../../../theme';
import { useNavigate } from 'react-router-dom';
import { leadService } from './lead.service';
import { useToast } from '../../components/Toast';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

const getStatusColor = (status: string) => {
  switch(status) {
    case 'New': return { bg: '#DBEAFE', text: '#1D4ED8' };
    case 'Contacted': return { bg: '#FEF3C7', text: '#B45309' };
    case 'Closed': return { bg: '#D1FAE5', text: '#047857' };
    case 'Abandoned': return { bg: '#FEE2E2', text: '#B91C1C' };
    default: return { bg: '#F3F4F6', text: '#374151' };
  }
};

export const LeadsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [contactFilter, setContactFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isContactFilterOpen, setIsContactFilterOpen] = useState(false);
  
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const filterRef = useRef<HTMLDivElement>(null);
  const contactFilterRef = useRef<HTMLDivElement>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchLeadsPage = async ({ pageParam = 1 }) => {
    const res = await leadService.getAll({ 
      page: pageParam, 
      limit: 20, 
      status: statusFilter, 
      contactInfo: contactFilter === 'No Contact Info' ? 'no_contact' : (contactFilter === 'Has Contact Info' ? 'has_contact' : 'All'),
      search: debouncedSearch 
    });
    return {
      data: res.data || [],
      nextPage: pageParam < (res.pagination?.pages || 1) ? pageParam + 1 : undefined
    };
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ['leads', statusFilter, contactFilter, debouncedSearch],
    queryFn: fetchLeadsPage,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage
  });

  const leads = useMemo(() => {
    return data ? data.pages.flatMap(page => page.data) : [];
  }, [data]);

  // Close filter dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
      if (contactFilterRef.current && !contactFilterRef.current.contains(event.target as Node)) {
        setIsContactFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this lead forever?')) return;
    try {
      await leadService.delete(id);
      showToast('success', 'Lead deleted');
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    } catch (err) {
      showToast('error', 'Failed to delete lead');
    }
  };

  const handleLoadMore = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  // Infinite Scroll Observer
  const observerTarget = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );
    
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    
    return () => observer.disconnect();
  }, [handleLoadMore]);

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: theme.colors.adminText, margin: 0 }}>CRM & Leads</h1>
          <p style={{ color: theme.colors.adminTextMuted, margin: '4px 0 0 0', fontSize: '14px' }}>Manage your customer database and track inquiry statuses.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '10px' }} />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                border: `1px solid ${theme.colors.adminBorder}`,
                backgroundColor: theme.colors.adminSurface,
                fontSize: '14px',
                width: '240px',
                outline: 'none',
                color: theme.colors.adminText
              }}
            />
          </div>
          
          <div style={{ position: 'relative' }} ref={filterRef}>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', 
                padding: '8px 16px', borderRadius: '8px', border: `1px solid ${theme.colors.adminBorder}`, 
                backgroundColor: theme.colors.adminSurface, color: '#4B5563', cursor: 'pointer',
                fontSize: '14px', fontWeight: 500
              }}>
              <Filter size={16} /> 
              {statusFilter === 'All' ? 'Filter' : statusFilter}
              <ChevronDown size={14} style={{ opacity: 0.6 }} />
            </button>
            
            {isFilterOpen && (
              <div style={{ 
                position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                backgroundColor: theme.colors.adminSurface, border: `1px solid ${theme.colors.adminBorder}`,
                borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                width: '180px', zIndex: 10
              }}>
                <div style={{ padding: '8px 12px', fontSize: '12px', fontWeight: 600, color: theme.colors.adminTextMuted, textTransform: 'uppercase', borderBottom: `1px solid ${theme.colors.adminBorder}` }}>
                  Filter by Status
                </div>
                {['All', 'New', 'Contacted', 'Closed', 'Abandoned'].map(status => (
                  <div 
                    key={status}
                    onClick={() => { setStatusFilter(status); setIsFilterOpen(false); }}
                    style={{ 
                      padding: '10px 16px', fontSize: '14px', color: theme.colors.adminText,
                      cursor: 'pointer', backgroundColor: statusFilter === status ? '#F3F4F6' : 'transparent',
                      fontWeight: statusFilter === status ? 600 : 400
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = statusFilter === status ? '#F3F4F6' : 'transparent'}
                  >
                    {status}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div style={{ position: 'relative' }} ref={contactFilterRef}>
            <button 
              onClick={() => setIsContactFilterOpen(!isContactFilterOpen)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', 
                padding: '8px 16px', borderRadius: '8px', border: `1px solid ${theme.colors.adminBorder}`, 
                backgroundColor: theme.colors.adminSurface, color: '#4B5563', cursor: 'pointer',
                fontSize: '14px', fontWeight: 500
              }}>
              <Filter size={16} /> 
              {contactFilter === 'All' ? 'Contact Info' : contactFilter}
              <ChevronDown size={14} style={{ opacity: 0.6 }} />
            </button>
            
            {isContactFilterOpen && (
              <div style={{ 
                position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                backgroundColor: theme.colors.adminSurface, border: `1px solid ${theme.colors.adminBorder}`,
                borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                width: '180px', zIndex: 10
              }}>
                <div style={{ padding: '8px 12px', fontSize: '12px', fontWeight: 600, color: theme.colors.adminTextMuted, textTransform: 'uppercase', borderBottom: `1px solid ${theme.colors.adminBorder}` }}>
                  Filter by Contact
                </div>
                {['All', 'Has Contact Info', 'No Contact Info'].map(status => (
                  <div 
                    key={status}
                    onClick={() => { setContactFilter(status); setIsContactFilterOpen(false); }}
                    style={{ 
                      padding: '10px 16px', fontSize: '14px', color: theme.colors.adminText,
                      cursor: 'pointer', backgroundColor: contactFilter === status ? '#F3F4F6' : 'transparent',
                      fontWeight: contactFilter === status ? 600 : 400
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = contactFilter === status ? '#F3F4F6' : 'transparent'}
                  >
                    {status}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: theme.colors.adminSurface, borderRadius: '12px', border: `1px solid ${theme.colors.adminBorder}`, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: theme.colors.adminBg, borderBottom: `1px solid ${theme.colors.adminBorder}` }}>
              <tr>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: theme.colors.adminTextMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lead Name</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: theme.colors.adminTextMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Info</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: theme.colors.adminTextMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location / Source</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: theme.colors.adminTextMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: theme.colors.adminTextMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: theme.colors.adminTextMuted, textTransform: 'uppercase', letterSpacing: '0.05em', width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {status === 'pending' ? (
                <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: theme.colors.adminTextMuted }}><Loader2 size={24} className="animate-spin" style={{ margin: '0 auto' }} /></td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: theme.colors.adminTextMuted }}>No leads found matching your criteria.</td></tr>
              ) : (
                leads.map((lead: any) => {
                  const statusColors = getStatusColor(lead.status);
                  const isReturning = lead.behavior?.isReturningVisitor;
                  const locString = lead.city ? lead.city : '-';
                  return (
                    <tr 
                      key={lead._id} 
                      onClick={() => navigate(`/admin/leads/${lead._id}`)}
                      style={{ 
                        borderBottom: `1px solid ${theme.colors.adminBorder}`, 
                        transition: 'background-color 0.2s', 
                        cursor: 'pointer',
                        backgroundColor: lead.status === 'New' ? '#F0F9FF' : 'transparent'
                      }} 
                      onMouseOver={e => e.currentTarget.style.backgroundColor = lead.status === 'New' ? '#E0F2FE' : theme.colors.adminBg} 
                      onMouseOut={e => e.currentTarget.style.backgroundColor = lead.status === 'New' ? '#F0F9FF' : 'transparent'}
                    >
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontWeight: 600, color: theme.colors.adminText, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {lead.name || 'Unknown'} 
                          {lead.device?.isMobile === true ? <Smartphone size={14} color="#6B7280" /> : <Monitor size={14} color="#6B7280" />}
                          {isReturning && <span style={{ fontSize: '10px', backgroundColor: '#F3F4F6', padding: '2px 6px', borderRadius: '4px', color: '#4B5563' }}>Returning</span>}
                          {(!lead.phone || lead.phone === 'Not Provided') && !lead.email && <span style={{ fontSize: '10px', backgroundColor: '#FEE2E2', padding: '2px 6px', borderRadius: '4px', color: '#991B1B', fontWeight: 700 }}>No Contact Info</span>}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        {lead.phone && lead.phone !== 'Not Provided' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {lead.phone.split(',').map((phoneStr: any, idx: any) => {
                              const trimmedPhone = phoneStr.trim();
                              return (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <div style={{ color: '#4B5563', fontSize: '14px' }}>{trimmedPhone}</div>
                                  <a 
                                    href={`https://wa.me/${trimmedPhone.replace(/[^0-9]/g, '')}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
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
                          <div style={{ color: '#4B5563', fontSize: '14px' }}>-</div>
                        )}
                        {lead.email && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                            {lead.email.split(',').map((eStr:any, idx:any) => (
                              <div key={idx} style={{ color: '#9CA3AF', fontSize: '12px' }}>{eStr.trim()}</div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ color: '#4B5563', fontSize: '14px' }}>{locString}</div>
                        <div style={{ color: '#9CA3AF', fontSize: '12px', marginTop: '2px' }}>
                          {lead.utm?.source ? `${lead.utm.source} / ${lead.utm.medium || ''}` : 'Direct'}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ 
                          backgroundColor: statusColors.bg, 
                          color: statusColors.text, 
                          padding: '4px 12px', 
                          borderRadius: '9999px',
                          fontSize: '12px',
                          fontWeight: 600,
                          display: 'inline-block'
                        }}>
                          {lead.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', color: '#4B5563', fontSize: '14px' }}>
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right', display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/admin/leads/${lead._id}`); }}
                          style={{ background: 'none', border: `1px solid ${theme.colors.adminBorder}`, borderRadius: '6px', cursor: 'pointer', padding: '6px', color: '#4B5563' }}
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={(e) => handleDelete(lead._id, e)}
                          style={{ background: 'none', border: `1px solid ${theme.colors.adminBorder}`, borderRadius: '6px', cursor: 'pointer', padding: '6px', color: '#EF4444' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Infinite Scroll / Load More Section */}
        {hasNextPage && (
          <div ref={observerTarget} style={{ padding: '24px', display: 'flex', justifyContent: 'center', borderTop: `1px solid ${theme.colors.adminBorder}` }}>
            <button
              onClick={handleLoadMore}
              disabled={isFetchingNextPage}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 24px', borderRadius: '9999px',
                border: `1px solid ${theme.colors.adminBorder}`,
                backgroundColor: theme.colors.adminBg,
                color: theme.colors.adminText,
                fontSize: '13px', fontWeight: 600,
                cursor: isFetchingNextPage ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {isFetchingNextPage ? <Loader2 size={16} className="animate-spin" /> : null}
              {isFetchingNextPage ? 'Loading More...' : 'Load More Leads'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
