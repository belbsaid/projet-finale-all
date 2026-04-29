'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import CarCard from '@/components/cars/CarCard';

export default function ModelDetailClient({ modelId }: { modelId: string }) {
  const { t } = useI18n();

  const { data: model, isLoading } = useQuery({
    queryKey: ['model', modelId],
    queryFn: async () => {
      const res = await api.get(`/models/${modelId}`);
      return res.data.data || res.data;
    },
  });

  // Fetch cars for this model
  const { data: carsData } = useQuery({
    queryKey: ['cars-by-model', modelId],
    queryFn: async () => {
      const res = await api.get('/cars', { params: { model: modelId, limit: '20' } });
      return res.data;
    },
    enabled: !!modelId,
  });

  const cars = carsData?.data || [];

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />
      </div>
    );
  }

  const brandName = typeof model?.brand === 'object' ? model.brand?.name : '';

  return (
    <div className="container animate-fade-in-up" style={{ padding: '2rem 1.5rem 4rem' }}>
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <Link href="/">{t('home')}</Link><span>/</span>
        <Link href="/brands">{t('brands')}</Link><span>/</span>
        <span style={{ color: 'var(--text-primary)' }}>{brandName} {model?.name}</span>
      </nav>

      {/* Model header */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--brand-red-light)', textTransform: 'uppercase' }}>{brandName}</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>{model?.name}</h1>

        {model?.description && (
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.25rem', maxWidth: '700px' }}>{model.description}</p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
          {[
            { label: t('engine'), value: model?.engine },
            { label: t('transmission'), value: model?.transmission },
            { label: t('fuelType'), value: model?.fuelType },
            { label: t('fuelConsumption'), value: model?.fuelConsumption },
            { label: 'Puissance', value: model?.horsepower ? `${model.horsepower} ch` : null },
            { label: 'Places', value: model?.seats },
          ].filter(s => s.value).map((spec, i) => (
            <div key={i}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{spec.label}</div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{spec.value}</div>
            </div>
          ))}
        </div>

        {model?.features && model.features.length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9375rem' }}>{t('features')}</h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {model.features.map((f: string, i: number) => (
                <span key={i} style={{ padding: '0.25rem 0.75rem', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '20px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Available cars */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        Véhicules disponibles ({cars.length})
      </h2>

      {cars.length > 0 ? (
        <div className="car-grid stagger-children">
          {cars.map((car: { _id: string }) => (
            <CarCard key={car._id} car={car} />
          ))}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</p>
          <p>Aucun véhicule disponible pour ce modèle actuellement.</p>
          <Link href="/contact" className="btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
            {t('contact')}
          </Link>
        </div>
      )}
    </div>
  );
}
