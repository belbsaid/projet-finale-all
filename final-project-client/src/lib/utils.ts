// ─── Algerian phone regex (matches +213 XXX XX XX XX with optional spaces/dashes)
export const ALGERIAN_PHONE_REGEX = /^\+213[\s-]?\d{2,3}[\s-]?\d{2}[\s-]?\d{2}[\s-]?\d{2}$/;

// ─── Format DZD price
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fr-DZ', {
    maximumFractionDigits: 0,
  }).format(amount) + ' DZD';
}

// ─── Status display config
export const STATUS_CONFIG: Record<string, { label: string; labelAr: string; className: string; dot: string }> = {
  'In Transit': {
    label: 'En Transit',
    labelAr: 'في العبور',
    className: 'badge badge-transit',
    dot: 'bg-amber-500',
  },
  'In Stock': {
    label: 'En Stock',
    labelAr: 'في المخزون',
    className: 'badge badge-stock',
    dot: 'bg-emerald-500',
  },
  Reserved: {
    label: 'Réservé',
    labelAr: 'محجوز',
    className: 'badge badge-reserved',
    dot: 'bg-blue-500',
  },
  Sold: {
    label: 'Vendu',
    labelAr: 'مباع',
    className: 'badge badge-sold',
    dot: 'bg-gray-500',
  },
  Maintenance: {
    label: 'Maintenance',
    labelAr: 'الصيانة',
    className: 'badge badge-sold',
    dot: 'bg-gray-500',
  },
  Damaged: {
    label: 'Endommagé',
    labelAr: 'تالف',
    className: 'badge badge-sold',
    dot: 'bg-gray-500',
  },
};

// ─── VIN formatter (uppercase, strip spaces/dashes, 17 chars)
export function formatVin(raw: string): string {
  return raw.replace(/[\s\-]/g, '').toUpperCase().slice(0, 17);
}

// ─── Algerian phone formatter
export function formatAlgerianPhone(raw: string): string {
  let cleaned = raw.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('0')) cleaned = '+213' + cleaned.slice(1);
  if (!cleaned.startsWith('+213')) cleaned = '+213' + cleaned;
  return cleaned;
}

// ─── WhatsApp URL builder
export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleaned = phone.replace(/[\s\-+]/g, '');
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}

// ─── Build image URL for backend-hosted images
export function buildImageUrl(path: string | undefined): string {
  if (!path) return '/placeholder-car.jpg';
  if (path.startsWith('http')) return path;
  return `http://localhost:4000${path.startsWith('/') ? '' : '/'}${path}`;
}

// ─── Format relative date
export function formatDate(dateStr: string | Date | null | undefined, lang: string = 'fr'): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ─── Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}
