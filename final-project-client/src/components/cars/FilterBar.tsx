'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useI18n } from '@/lib/i18n';
import api from '@/lib/api';
import {
  Search, SlidersHorizontal, X, RotateCcw,
} from 'lucide-react';

interface FilterBarProps {
  initialFilters?: {
    brand?: string;
    category?: string;
    status?: string;
    minPrice?: string;
    maxPrice?: string;
    minYear?: string;
    maxYear?: string;
    fuelType?: string;
    transmission?: string;
    color?: string;
    sortBy?: string;
    search?: string;
  };
}

export default function FilterBar({ initialFilters }: FilterBarProps) {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [brand, setBrand] = useState(initialFilters?.brand || '');
  const [category, setCategory] = useState(initialFilters?.category || '');
  const [status, setStatus] = useState(initialFilters?.status || '');
  const [minPrice, setMinPrice] = useState(initialFilters?.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(initialFilters?.maxPrice || '');
  const [minYear, setMinYear] = useState(initialFilters?.minYear || '');
  const [maxYear, setMaxYear] = useState(initialFilters?.maxYear || '');
  const [fuelType, setFuelType] = useState(initialFilters?.fuelType || '');
  const [transmission, setTransmission] = useState(initialFilters?.transmission || '');
  const [color, setColor] = useState(initialFilters?.color || '');
  const [sortBy, setSortBy] = useState(initialFilters?.sortBy || '');
  const [search, setSearch] = useState(initialFilters?.search || '');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fetch brands
  const { data: brandsRaw } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const res = await api.get('/brands', { params: { limit: 100 } });
      const p = res.data;
      return p?.brands || p?.data || (Array.isArray(p) ? p : []);
    },
  });
  const brands: { _id: string; name: string }[] = Array.isArray(brandsRaw) ? brandsRaw : [];

  // Fetch categories
  const { data: categoriesRaw } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories', { params: { limit: 100 } });
      const p = res.data;
      return p?.categories || p?.data || (Array.isArray(p) ? p : []);
    },
  });
  const categories: { _id: string; name: string }[] = Array.isArray(categoriesRaw) ? categoriesRaw : [];

  useEffect(() => {
    setBrand(searchParams.get('brand') || '');
    setCategory(searchParams.get('category') || '');
    setStatus(searchParams.get('status') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setMinYear(searchParams.get('minYear') || '');
    setMaxYear(searchParams.get('maxYear') || '');
    setFuelType(searchParams.get('fuelType') || '');
    setTransmission(searchParams.get('transmission') || '');
    setColor(searchParams.get('color') || '');
    setSortBy(searchParams.get('sortBy') || '');
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (brand) params.set('brand', brand);
    if (category) params.set('category', category);
    if (status) params.set('status', status);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (minYear) params.set('minYear', minYear);
    if (maxYear) params.set('maxYear', maxYear);
    if (fuelType) params.set('fuelType', fuelType);
    if (transmission) params.set('transmission', transmission);
    if (color) params.set('color', color);
    if (sortBy) params.set('sortBy', sortBy);
    if (search) params.set('search', search);
    params.set('page', '1');
    router.push(`/cars?${params.toString()}`);
    setMobileOpen(false);
  };

  const clearFilters = () => {
    setBrand(''); setCategory(''); setStatus('');
    setMinPrice(''); setMaxPrice('');
    setMinYear(''); setMaxYear('');
    setFuelType(''); setTransmission('');
    setColor(''); setSortBy(''); setSearch('');
    router.push('/cars');
    setMobileOpen(false);
  };

  const activeCount = [brand, category, status, minPrice, maxPrice, minYear, maxYear, fuelType, transmission, color, search].filter(Boolean).length;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2014 }, (_, i) => currentYear - i);

  const selectStyle: React.CSSProperties = {
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2364748b' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: '2.5rem',
  };

  const FilterContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Search */}
      <div>
        <label className="form-label">Recherche</label>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input"
            type="text"
            placeholder="Rechercher VIN, stock..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      {/* Brand */}
      <div>
        <label className="form-label">{t('brands')}</label>
        <select className="form-input" value={brand} onChange={(e) => setBrand(e.target.value)} style={selectStyle}>
          <option value="">Toutes les marques</option>
          {brands.map((b) => (
            <option key={b._id} value={b._id}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div>
        <label className="form-label">Cat&eacute;gorie</label>
        <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)} style={selectStyle}>
          <option value="">Toutes</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div>
        <label className="form-label">Statut</label>
        <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)} style={selectStyle}>
          <option value="">Tous</option>
          <option value="In Stock">{t('inStock')}</option>
          <option value="In Transit">{t('inTransit')}</option>
          <option value="Reserved">{t('reserved')}</option>
        </select>
      </div>

      {/* Price range */}
      <div>
        <label className="form-label">Prix (DZD)</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            className="form-input"
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            style={{ flex: 1 }}
          />
          <input
            className="form-input"
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
      </div>

      {/* Year range */}
      <div>
        <label className="form-label">Ann&eacute;e</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select className="form-input" value={minYear} onChange={(e) => setMinYear(e.target.value)} style={{ ...selectStyle, flex: 1 }}>
            <option value="">Min</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select className="form-input" value={maxYear} onChange={(e) => setMaxYear(e.target.value)} style={{ ...selectStyle, flex: 1 }}>
            <option value="">Max</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Fuel type */}
      <div>
        <label className="form-label">Carburant</label>
        <select className="form-input" value={fuelType} onChange={(e) => setFuelType(e.target.value)} style={selectStyle}>
          <option value="">Tous</option>
          <option value="Essence">Essence</option>
          <option value="Diesel">Diesel</option>
          <option value="Hybride">Hybride</option>
          <option value="Electrique">&Eacute;lectrique</option>
        </select>
      </div>

      {/* Transmission */}
      <div>
        <label className="form-label">Transmission</label>
        <select className="form-input" value={transmission} onChange={(e) => setTransmission(e.target.value)} style={selectStyle}>
          <option value="">Toutes</option>
          <option value="Automatique">Automatique</option>
          <option value="Manuelle">Manuelle</option>
          <option value="CVT">CVT</option>
          <option value="Dual-Clutch">Dual-Clutch</option>
        </select>
      </div>

      {/* Color */}
      <div>
        <label className="form-label">Couleur</label>
        <input
          className="form-input"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          placeholder="ex: Noir, Blanc..."
        />
      </div>

      {/* Sort */}
      <div>
        <label className="form-label">Trier par</label>
        <select className="form-input" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={selectStyle}>
          <option value="">Par d&eacute;faut</option>
          <option value="price-low">Prix croissant</option>
          <option value="price-high">Prix d&eacute;croissant</option>
          <option value="newest">Plus r&eacute;cent</option>
        </select>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
        <button className="btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '0.875rem' }} onClick={applyFilters}>
          Appliquer les filtres
        </button>
        <button
          className="btn-secondary"
          style={{ width: '100%', padding: '0.625rem', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}
          onClick={clearFilters}
        >
          <RotateCcw size={14} /> R&eacute;initialiser
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile toggle button ── */}
      <button
        className="filter-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          display: 'none',
          width: '100%',
          padding: '0.75rem',
          marginBottom: '1rem',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-primary)',
          fontWeight: 600,
          fontSize: '0.875rem',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          cursor: 'pointer',
        }}
      >
        <SlidersHorizontal size={16} />
        Filtres {activeCount > 0 && `(${activeCount})`}
      </button>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 90,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`filter-sidebar ${mobileOpen ? 'filter-sidebar-open' : ''}`}
        style={{
          padding: '1.5rem',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem' }}>
            <SlidersHorizontal size={18} />
            Filtres
            {activeCount > 0 && (
              <span style={{
                fontSize: '0.6875rem', fontWeight: 600,
                background: 'var(--accent-blue)', color: '#fff',
                width: 20, height: 20, borderRadius: '50%',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {activeCount}
              </span>
            )}
          </div>
          <button
            className="filter-mobile-close"
            onClick={() => setMobileOpen(false)}
            style={{
              display: 'none',
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              color: 'var(--text-muted)', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <FilterContent />
      </aside>
    </>
  );
}
