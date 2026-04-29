'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import { AlertTriangle, SearchX, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import CarCard from '@/components/cars/CarCard';
import FilterBar from '@/components/cars/FilterBar';

function CarsContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();

  const page = searchParams.get('page') || '1';
  const brand = searchParams.get('brand') || '';
  const category = searchParams.get('category') || '';
  const status = searchParams.get('status') || '';
  const sortBy = searchParams.get('sortBy') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minYear = searchParams.get('minYear') || '';
  const maxYear = searchParams.get('maxYear') || '';
  const fuelType = searchParams.get('fuelType') || '';
  const transmission = searchParams.get('transmission') || '';
  const color = searchParams.get('color') || '';
  const search = searchParams.get('search') || '';

  const { data, isLoading, error } = useQuery({
    queryKey: ['cars', { page, brand, category, status, sortBy, minPrice, maxPrice, minYear, maxYear, fuelType, transmission, color, search }],
    queryFn: async () => {
      const params: Record<string, string> = { page, limit: '12' };
      if (brand) params.brand = brand;
      if (category) params.category = category;
      params.status = status || 'In Stock';
      if (sortBy) params.sortBy = sortBy;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (minYear) params.minYear = minYear;
      if (maxYear) params.maxYear = maxYear;
      if (color) params.color = color;
      if (search) params.search = search;
      const res = await api.get('/cars', { params });
      return res.data;
    },
  });

  const cars = data?.cars || data?.data || [];
  const pagination = data?.pagination;

  // Build pagination URL helper
  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    params.set('page', String(p));
    if (brand) params.set('brand', brand);
    if (category) params.set('category', category);
    if (status) params.set('status', status);
    if (sortBy) params.set('sortBy', sortBy);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (minYear) params.set('minYear', minYear);
    if (maxYear) params.set('maxYear', maxYear);
    if (color) params.set('color', color);
    if (search) params.set('search', search);
    return `/cars?${params.toString()}`;
  };

  const currentPage = Number(page);

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
      {/* Page header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section-title">{t('cars')}</h1>
        <p className="section-subtitle" style={{ marginTop: '0.5rem' }}>
          {pagination?.total
            ? `${pagination.total} v\u00e9hicule${pagination.total > 1 ? 's' : ''} disponible${pagination.total > 1 ? 's' : ''}`
            : 'D\u00e9couvrez notre inventaire'}
        </p>
      </div>

      {/* Sidebar + Grid layout */}
      <div className="cars-page-layout">
        {/* Sidebar */}
        <FilterBar initialFilters={{ brand, category, status, sortBy, minPrice, maxPrice, minYear, maxYear, fuelType, transmission, color, search }} />

        {/* Main content */}
        <div>
          {isLoading ? (
            <div className="car-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '380px', borderRadius: 'var(--radius-xl)' }} />
              ))}
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <AlertTriangle size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
              <p>{t('error')}</p>
            </div>
          ) : cars.length > 0 ? (
            <>
              <div className="car-grid stagger-children">
                {cars.map((car: { _id?: string; id?: string }) => (
                  <CarCard key={car._id || car.id} car={car} />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div style={{
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  gap: '0.375rem', marginTop: '3rem', flexWrap: 'wrap',
                }}>
                  {/* Prev */}
                  {currentPage > 1 && (
                    <a
                      href={buildPageUrl(currentPage - 1)}
                      style={{
                        width: 40, height: 40, borderRadius: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                        color: 'var(--text-secondary)', transition: 'all 0.2s',
                      }}
                    >
                      <ChevronLeft size={16} />
                    </a>
                  )}

                  {/* Page numbers */}
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      // Show first, last, and pages near current
                      if (p === 1 || p === pagination.totalPages) return true;
                      if (Math.abs(p - currentPage) <= 2) return true;
                      return false;
                    })
                    .map((p, idx, arr) => (
                      <span key={p} style={{ display: 'contents' }}>
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '0 0.25rem' }}>...</span>
                        )}
                        <a
                          href={buildPageUrl(p)}
                          style={{
                            width: 40, height: 40, borderRadius: '10px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.875rem', fontWeight: 600,
                            background: String(p) === page ? 'var(--accent-blue)' : 'var(--bg-elevated)',
                            color: String(p) === page ? '#fff' : 'var(--text-secondary)',
                            border: String(p) === page ? 'none' : '1px solid var(--border)',
                            transition: 'all 0.2s',
                          }}
                        >
                          {p}
                        </a>
                      </span>
                    ))}

                  {/* Next */}
                  {currentPage < pagination.totalPages && (
                    <a
                      href={buildPageUrl(currentPage + 1)}
                      style={{
                        width: 40, height: 40, borderRadius: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                        color: 'var(--text-secondary)', transition: 'all 0.2s',
                      }}
                    >
                      <ChevronRight size={16} />
                    </a>
                  )}
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
              <SearchX size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
              <p style={{ fontSize: '1.125rem' }}>Aucun v&eacute;hicule ne correspond &agrave; vos crit&egrave;res.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CarsClient() {
  return (
    <Suspense fallback={
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <div className="car-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '380px', borderRadius: 'var(--radius-xl)' }} />
          ))}
        </div>
      </div>
    }>
      <CarsContent />
    </Suspense>
  );
}
