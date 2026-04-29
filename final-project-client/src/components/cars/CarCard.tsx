'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Car } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { formatPrice, buildImageUrl, STATUS_CONFIG } from '@/lib/utils';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function CarCard({ car }: { car: any }) {
  const { t } = useI18n();

  const brandName =
    typeof car.brand === 'object' ? car.brand?.name : car.brand || '';
  const modelName =
    typeof car.model === 'object' ? car.model?.name : car.model || '';
  const photo = car.photos?.[0];
  const status = car.status || 'In Stock';
  const statusConf = STATUS_CONFIG[status] || STATUS_CONFIG['In Stock'];
  const price = car.finalPriceDZD || car.sellingPriceDZD || 0;
  const carId = car._id || car.id;

  return (
    <Link
      href={`/cars/${carId}`}
      className="card-white"
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      {/* Image container */}
      <div
        className="img-zoom"
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/10',
          background: '#f0f0f0',
        }}
      >
        {photo ? (
          <Image
            src={buildImageUrl(photo)}
            alt={`${brandName} ${modelName}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ccc',
            }}
          >
            <Car size={48} />
          </div>
        )}

        {/* Status badge */}
        <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', zIndex: 2 }}>
          <span className={statusConf.className}>
            {statusConf.label}
          </span>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '1.25rem 1.5rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          fontSize: '1.0625rem',
          fontWeight: 700,
          color: 'var(--text-dark)',
          marginBottom: '0.25rem',
          lineHeight: 1.3,
        }}>
          {brandName} {modelName}
        </h3>

        <p style={{
          fontSize: '0.8125rem',
          color: 'var(--text-dark-secondary)',
          marginBottom: '1rem',
        }}>
          {car.year} • {car.color}
        </p>

        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontSize: '1.125rem',
            fontWeight: 800,
            color: 'var(--accent-blue)',
            letterSpacing: '-0.02em',
          }}>
            {price > 0 ? formatPrice(price) : '—'}
          </span>
          <span
            className="btn-dark"
            style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
          >
            {t('viewDetails')}
          </span>
        </div>
      </div>
    </Link>
  );
}
