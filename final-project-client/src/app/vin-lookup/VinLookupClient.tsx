'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lock, AlertTriangle, Palette, Calendar, CheckCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { formatVin, formatPrice, formatDate, STATUS_CONFIG } from '@/lib/utils';
import api from '@/lib/api';
import StatusBadge from '@/components/cars/StatusBadge';

interface VinResult {
  vin: string;
  status: string;
  brand?: { name: string };
  model?: { name: string };
  year?: number;
  color?: string;
  sellingPriceDZD?: number;
  finalPriceDZD?: number;
  expectedDeliveryDate?: string;
  arrivalDate?: string;
  statusHistory?: { status: string; date: string; note?: string }[];
}

const STATUS_ORDER = ['In Transit', 'In Stock', 'Reserved', 'Sold'];

export default function VinLookupClient() {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const [vin, setVin] = useState('');
  const [result, setResult] = useState<VinResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auth gate
  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '500px', textAlign: 'center' }}>
        <div className="card-white" style={{ padding: '3rem' }}>
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center', color: 'var(--text-muted)' }}><Lock size={48} /></div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.75rem' }}>{t('loginRequired')}</h1>
          <p style={{ color: 'var(--text-dark-secondary)', marginBottom: '2rem' }}>{t('loginRequiredDesc')}</p>
          <Link href="/auth/login" className="btn-primary" style={{ display: 'inline-flex' }}>{t('login')}</Link>
        </div>
      </div>
    );
  }

  const handleSearch = async () => {
    const formatted = formatVin(vin);
    if (formatted.length !== 17) {
      setError('Le VIN doit contenir exactement 17 caractères');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.get(`/cars/vin/${formatted}`);
      setResult(res.data.data || res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('vinNotFound'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in-up" style={{ padding: '2rem 1.5rem 4rem', maxWidth: '700px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 className="section-title">{t('vinTitle')}</h1>
        <p className="section-subtitle" style={{ margin: '0.75rem auto 0' }}>{t('vinDesc')}</p>
      </div>

      {/* Search bar */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <label className="form-label">{t('vinInput')}</label>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            className="form-input"
            type="text"
            value={vin}
            onChange={(e) => setVin(formatVin(e.target.value))}
            placeholder="LVVDB11B3ND123456"
            maxLength={17}
            style={{ flex: 1, fontFamily: 'monospace', fontSize: '1.125rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            className="btn-primary"
            onClick={handleSearch}
            disabled={loading || vin.length < 17}
            style={{ whiteSpace: 'nowrap', opacity: loading || vin.length < 17 ? 0.6 : 1 }}
          >
            {loading ? t('vinSearching') : t('vinSearch')}
          </button>
        </div>
        <div style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          {vin.length}/17 caractères
        </div>
        {error && (
          <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(252,129,129,0.1)', border: '1px solid rgba(252,129,129,0.2)', borderRadius: 'var(--radius-sm)', color: '#fc8181', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={16} /> {error}
          </div>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="animate-fade-in-up">
          {/* Vehicle info */}
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent-blue)', textTransform: 'uppercase' }}>
                  {typeof result.brand === 'object' ? result.brand?.name : ''}
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.25rem 0 0.5rem' }}>
                  {typeof result.model === 'object' ? result.model?.name : ''} {result.year || ''}
                </h2>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                   {result.color && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Palette size={14} /> {result.color}</span>}
                   <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>VIN: {result.vin}</span>
                 </div>
              </div>
              <StatusBadge status={result.status} size="md" />
            </div>
            {(result.finalPriceDZD || result.sellingPriceDZD) && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{t('finalPrice')}: </span>
                <span className="price">{formatPrice(result.finalPriceDZD || result.sellingPriceDZD || 0)}</span>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Progression de votre commande</h3>

            {/* Visual status bar */}
            <div style={{ display: 'flex', marginBottom: '2rem', gap: '4px' }}>
              {STATUS_ORDER.map((s, i) => {
                const currentIdx = STATUS_ORDER.indexOf(result.status);
                const isCompleted = i <= currentIdx;
                const isCurrent = i === currentIdx;
                return (
                  <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      height: 6, width: '100%', borderRadius: 3,
                      background: isCompleted ? (isCurrent ? 'var(--accent-blue)' : 'var(--status-stock)') : 'var(--bg-hover)',
                      transition: 'all 0.5s',
                    }} />
                    <span style={{
                      fontSize: '0.6875rem', fontWeight: isCurrent ? 700 : 400,
                      color: isCompleted ? 'var(--text-primary)' : 'var(--text-muted)',
                    }}>
                      {STATUS_CONFIG[s]?.label || s}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Dates */}
            {result.expectedDeliveryDate && result.status === 'In Transit' && (
              <div style={{ padding: '1rem', background: 'var(--status-transit-bg)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} style={{ color: 'var(--status-transit)', flexShrink: 0 }} />
                <span style={{ fontWeight: 600, color: 'var(--status-transit)' }}>{t('expectedDelivery')}: {formatDate(result.expectedDeliveryDate)}</span>
              </div>
            )}
            {result.arrivalDate && (
              <div style={{ padding: '1rem', background: 'var(--status-stock-bg)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={16} style={{ color: 'var(--status-stock)', flexShrink: 0 }} />
                <span style={{ fontWeight: 600, color: 'var(--status-stock)' }}>{t('arrivalDate')}: {formatDate(result.arrivalDate)}</span>
              </div>
            )}

            {/* Status history */}
            {result.statusHistory && result.statusHistory.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-secondary)' }}>{t('statusHistory')}</h4>
                {result.statusHistory
                  .slice()
                  .reverse()
                  .map((entry, i) => (
                    <div key={i} className="timeline-step" style={{ paddingBottom: i < result.statusHistory!.length - 1 ? '1.25rem' : 0 }}>
                      <div className="timeline-dot" style={{
                        background: i === 0 ? 'var(--accent-blue)' : 'var(--bg-elevated)',
                        border: '2px solid var(--border-strong)',
                        color: i === 0 ? '#fff' : 'var(--text-muted)',
                        fontSize: '0.625rem',
                      }}>
                        {i === 0 ? '●' : '○'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{entry.status}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{formatDate(entry.date)}</div>
                        {entry.note && <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{entry.note}</div>}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
