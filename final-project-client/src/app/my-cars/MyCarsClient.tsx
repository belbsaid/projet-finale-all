'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Lock, Car, MessageCircle, Calendar, Tag, Search } from 'lucide-react';
import { useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/lib/i18n';
import { formatPrice, formatDate, buildImageUrl } from '@/lib/utils';
import StatusBadge from '@/components/cars/StatusBadge';
import Image from 'next/image';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function MyCarsClient() {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<'bought' | 'demandes'>('bought');
  const [searchQuery, setSearchQuery] = useState('');

  // Cars sold to this customer (customerId match)
  const { data: myCarsData, isLoading: loadingCars } = useQuery({
    queryKey: ['my-cars'],
    queryFn: async () => {
      const res = await api.get('/cars/customer/my-cars');
      return res.data.cars || res.data.data || res.data;
    },
    enabled: isAuthenticated,
  });

  // Leads (inquiries) submitted by this user
  const { data: myLeadsData, isLoading: loadingLeads } = useQuery({
    queryKey: ['my-leads'],
    queryFn: async () => {
      const res = await api.get('/leads/my-leads');
      return res.data.leads || res.data.data || [];
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '500px', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--text-muted)' }}>
            <Lock size={48} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>{t('loginRequired')}</h1>
          <Link href="/auth/login" className="btn-primary" style={{ display: 'inline-flex' }}>{t('login')}</Link>
        </div>
      </div>
    );
  }

  const myCarsRaw: any[] = Array.isArray(myCarsData)
    ? myCarsData
    : Array.isArray(myCarsData?.cars)
    ? myCarsData.cars
    : Array.isArray(myCarsData?.data)
    ? myCarsData.data
    : [];
  const allLeads: any[] = Array.isArray(myLeadsData) ? myLeadsData : [];

  // Leads marked "Sold" with a linked car → treat as purchased
  const soldLeadCars = allLeads
    .filter((l: any) => l.status === 'Sold' && l.carId && typeof l.carId === 'object')
    .map((l: any) => l.carId);

  // Merge: cars from /customer/my-cars + cars from sold leads, deduplicated
  const seenIds = new Set<string>();
  const allBoughtCars: any[] = [];
  for (const car of [...myCarsRaw, ...soldLeadCars]) {
    const id = car._id || car.id;
    if (id && !seenIds.has(id)) {
      seenIds.add(id);
      allBoughtCars.push(car);
    }
  }

  // Inquiries: only leads that are NOT Sold (or Sold without a linked car)
  const allInquiries = allLeads.filter((l: any) => l.status !== 'Sold');

  // Apply search filter
  const q = searchQuery.toLowerCase();

  const myCars = allBoughtCars.filter((car: any) => {
    if (!q) return true;
    const brandName = typeof car.brand === 'object' ? car.brand?.name : '';
    const modelName = typeof car.model === 'object' ? car.model?.name : '';
    const searchString = `${brandName} ${modelName} ${car.year || ''} ${car.stockNumber || ''} ${car.color || ''}`.toLowerCase();
    return searchString.includes(q);
  });

  const myLeads = allInquiries.filter((lead: any) => {
    if (!q) return true;
    const car = lead.carId;
    const brandName = car && typeof car.brand === 'object' ? car.brand?.name : '';
    const modelName = car && typeof car.model === 'object' ? car.model?.name : '';
    const searchString = `${brandName} ${modelName} ${car?.year || ''} ${lead.interestedModel || ''} ${lead.message || ''}`.toLowerCase();
    return searchString.includes(q);
  });

  return (
    <div className="container animate-fade-in-up" style={{ padding: '2rem 1.5rem 4rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1 className="section-title">{t('myCars')}</h1>
        
        {/* Search Bar */}
        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input"
            type="text"
            placeholder="Rechercher (marque, modèle, stock...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem', width: '100%', borderRadius: '100px' }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={() => setActiveTab('bought')}
          style={{
            padding: '0.75rem 0.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'bought' ? '2px solid var(--accent-blue-light)' : '2px solid transparent',
            color: activeTab === 'bought' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'bought' ? 700 : 500,
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s',
          }}
        >
          <Car size={18} />
          Mes v&eacute;hicules achet&eacute;s
          <span style={{
            fontSize: '0.6875rem', fontWeight: 600,
            background: activeTab === 'bought' ? 'var(--accent-blue)' : 'var(--bg-elevated)',
            color: activeTab === 'bought' ? '#fff' : 'var(--text-muted)',
            width: 22, height: 22, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {allBoughtCars.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('demandes')}
          style={{
            padding: '0.75rem 0.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'demandes' ? '2px solid var(--accent-blue-light)' : '2px solid transparent',
            color: activeTab === 'demandes' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'demandes' ? 700 : 500,
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s',
          }}
        >
          <MessageCircle size={18} />
          Mes demandes
          <span style={{
            fontSize: '0.6875rem', fontWeight: 600,
            background: activeTab === 'demandes' ? 'var(--accent-blue)' : 'var(--bg-elevated)',
            color: activeTab === 'demandes' ? '#fff' : 'var(--text-muted)',
            width: 22, height: 22, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {allInquiries.length}
          </span>
        </button>
      </div>

      {/* ═══════════════════════════════════
          TAB 1: Purchased Cars
          ═══════════════════════════════════ */}
      {activeTab === 'bought' && (
        <div className="animate-fade-in-up">
          {loadingCars ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 140, borderRadius: 'var(--radius-lg)' }} />
              ))}
            </div>
          ) : myCars.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="stagger-children">
              {myCars.map((car: any) => {
                const brandName = typeof car.brand === 'object' ? car.brand?.name : '';
                const modelName = typeof car.model === 'object' ? car.model?.name : '';
                const photo = car.photos?.[0];

                return (
                  <Link key={car._id} href={`/cars/${car._id}`} className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1.25rem', alignItems: 'center', transition: 'border-color 0.2s' }}>
                    {/* Thumbnail */}
                    <div style={{
                      width: 100, height: 70, borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden', flexShrink: 0, position: 'relative', background: '#111',
                    }}>
                      {photo ? (
                        <Image src={buildImageUrl(photo)} alt={`${brandName} ${modelName}`} fill sizes="100px" style={{ objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
                          <Car size={28} />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--accent-blue-light)', textTransform: 'uppercase' }}>{brandName}</span>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.125rem' }}>
                        {modelName} {car.year || ''}
                      </h3>
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {car.color && <span>{car.color}</span>}
                        {car.stockNumber && <span>#{car.stockNumber}</span>}
                      </div>
                    </div>

                    {/* Price + Status */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <StatusBadge status={car.status || 'Sold'} size="md" />
                      <div className="price" style={{ marginTop: '0.5rem', fontSize: '0.9375rem' }}>
                        {formatPrice(car.finalPriceDZD || car.sellingPriceDZD || 0)}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : !loadingCars ? (
            <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
                <Tag size={36} />
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
                {searchQuery ? 'Aucun véhicule ne correspond à votre recherche.' : 'Aucun véhicule acheté pour le moment.'}
              </p>
              {!searchQuery && (
                <Link href="/cars" className="btn-primary" style={{ display: 'inline-flex', marginTop: '1rem' }}>
                  {t('discoverCars')}
                </Link>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* ═══════════════════════════════════
          TAB 2: My Inquiries (Leads)
          ═══════════════════════════════════ */}
      {activeTab === 'demandes' && (
        <div className="animate-fade-in-up">
          {loadingLeads ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-lg)' }} />
              ))}
            </div>
          ) : myLeads.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }} className="stagger-children">
              {myLeads.map((lead: any) => {
                const car = lead.carId;
                const brandName = car && typeof car.brand === 'object' ? car.brand?.name : '';
                const modelName = car && typeof car.model === 'object' ? car.model?.name : '';
                const photo = car?.photos?.[0];
                const carId = car?._id || car?.id;

                const sourceLabel: Record<string, string> = {
                  'Website Form': 'Formulaire',
                  'WhatsApp': 'WhatsApp',
                  'Meeting Booking': 'Rendez-vous',
                };

                const statusColors: Record<string, { bg: string; text: string }> = {
                  New: { bg: 'rgba(59,130,246,0.1)', text: 'var(--accent-blue-light)' },
                  Contacted: { bg: 'rgba(245,158,11,0.1)', text: 'var(--status-transit)' },
                  'Visited Store': { bg: 'rgba(16,185,129,0.1)', text: 'var(--status-stock)' },
                  Sold: { bg: 'rgba(16,185,129,0.15)', text: '#10b981' },
                  Lost: { bg: 'rgba(107,114,128,0.1)', text: 'var(--text-muted)' },
                };
                const sc = statusColors[lead.status] || statusColors.New;

                return (
                  <div key={lead._id} className="glass-card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      {/* Thumbnail */}
                      {car && (
                        <Link href={carId ? `/cars/${carId}` : '#'} style={{
                          width: 80, height: 56, borderRadius: 'var(--radius-sm)',
                          overflow: 'hidden', flexShrink: 0, position: 'relative', background: '#111',
                          display: 'block',
                        }}>
                          {photo ? (
                            <Image src={buildImageUrl(photo)} alt={`${brandName} ${modelName}`} fill sizes="80px" style={{ objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
                              <Car size={22} />
                            </div>
                          )}
                        </Link>
                      )}

                      {/* Lead info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.9375rem', fontWeight: 700 }}>
                            {car ? `${brandName} ${modelName} ${car.year || ''}` : lead.interestedModel}
                          </span>
                          {/* Lead status badge */}
                          <span style={{
                            fontSize: '0.625rem', fontWeight: 600,
                            padding: '0.125rem 0.5rem', borderRadius: '100px',
                            background: sc.bg, color: sc.text,
                            textTransform: 'uppercase', letterSpacing: '0.03em',
                          }}>
                            {lead.status}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                          <span>{sourceLabel[lead.source] || lead.source}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={11} /> {formatDate(lead.createdAt)}
                          </span>
                          {car?.status && (
                            <span>Voiture: {car.status}</span>
                          )}
                        </div>
                        {lead.message && (
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.375rem', lineHeight: 1.5 }}>
                            {lead.message.length > 80 ? lead.message.slice(0, 80) + '...' : lead.message}
                          </p>
                        )}
                      </div>

                      {/* Price if car linked */}
                      {car && (car.finalPriceDZD || car.sellingPriceDZD) && (
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div className="price" style={{ fontSize: '0.875rem' }}>
                            {formatPrice(car.finalPriceDZD || car.sellingPriceDZD || 0)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : !loadingLeads ? (
            <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
                <MessageCircle size={36} />
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '1rem' }}>
                {searchQuery ? 'Aucune demande ne correspond à votre recherche.' : 'Vous n\'avez pas encore fait de demande.'}
              </p>
              {!searchQuery && (
                <Link href="/cars" className="btn-primary" style={{ display: 'inline-flex' }}>
                  {t('discoverCars')}
                </Link>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
