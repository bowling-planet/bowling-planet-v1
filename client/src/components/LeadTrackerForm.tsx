import React, { useState } from 'react';
import { useLeadTracker } from '../context/LeadTrackerContext';
import { apiClient } from '../services/apiClient';
import { theme } from '../theme';

interface LeadTrackerFormProps {
  sourceId?: string;
  title?: string;
  subtitle?: string;
}

export function LeadTrackerForm({ sourceId, title = "Get in touch", subtitle = "Leave your details and our team will get back to you shortly." }: LeadTrackerFormProps) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [focused, setFocused] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { state, logCTAEvent } = useLeadTracker();

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      alert("Please provide your Name, Email, and a Message.");
      return;
    }

    setIsSubmitting(true);
    const submitEvent = { label: `Lead Form Submitted (${sourceId || 'unknown'})`, timestamp: new Date().toISOString(), path: window.location.pathname };
    logCTAEvent(`Form Submitted: ${sourceId}`);

    try {
      await apiClient('/leads', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          businessDetails: form.message,
          utm: state.utm,
          device: state.deviceInfo,
          sessionId: state.sessionId,
          behavior: {
            isReturningVisitor: state.isReturningVisitor,
            eventLog: [...state.eventLog, submitEvent],
          },
          enquiryItems: state.enquiryCart,
        }),
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit form', err);
      alert('Something went wrong, please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelStyle = {
    display: 'block', fontSize: 12, fontWeight: 600, color: theme.colors.prussianBlue, 
    marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.05em'
  };

  const inputStyle = (isFocused: boolean) => ({
    width: '100%', background: '#F8FAFC',
    border: `1px solid ${isFocused ? theme.colors.teal : '#E2E8F0'}`, borderRadius: 8,
    padding: '12px 16px', color: theme.colors.prussianBlue, fontSize: 15, outline: 'none',
    transition: 'all 0.2s ease', boxShadow: isFocused ? `0 0 0 2px ${theme.colors.teal}33` : 'none',
  });

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h3 style={{ fontSize: 24, fontWeight: 700, color: theme.colors.prussianBlue, marginBottom: 8 }}>Message Sent!</h3>
        <p style={{ color: theme.colors.text2 }}>Thank you. A specialist will be in touch shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ fontSize: 24, fontWeight: 800, color: theme.colors.prussianBlue, marginBottom: 8 }}>{title}</h3>
      <p style={{ color: theme.colors.text2, marginBottom: 24, fontSize: 14 }}>{subtitle}</p>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="lead-name" style={labelStyle}>Full Name *</label>
        <input id="lead-name" autoComplete="name" type="text" placeholder="Your name" value={form.name} onChange={update('name')} onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} style={inputStyle(focused === 'name')} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label htmlFor="lead-email" style={labelStyle}>Email *</label>
          <input id="lead-email" autoComplete="email" type="email" placeholder="you@example.com" value={form.email} onChange={update('email')} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} style={inputStyle(focused === 'email')} />
        </div>
        <div>
          <label htmlFor="lead-phone" style={labelStyle}>Phone</label>
          <input id="lead-phone" autoComplete="tel" type="tel" placeholder="+91..." value={form.phone} onChange={update('phone')} onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)} style={inputStyle(focused === 'phone')} />
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label htmlFor="lead-message" style={labelStyle}>Message *</label>
        <textarea id="lead-message" placeholder="Tell us about your requirements..." value={form.message} onChange={update('message')} onFocus={() => setFocused('message')} onBlur={() => setFocused(null)} style={{ ...inputStyle(focused === 'message'), minHeight: 100, resize: 'vertical' }} />
      </div>

      <button type="submit" disabled={isSubmitting} style={{ width: '100%', padding: '16px', background: theme.colors.teal, color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
        {isSubmitting ? 'Sending...' : 'Submit Inquiry'}
      </button>
    </form>
  );
}
