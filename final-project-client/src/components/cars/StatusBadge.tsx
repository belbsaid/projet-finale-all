'use client';

import { STATUS_CONFIG } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const { lang } = useI18n();
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['In Stock'];

  return (
    <span
      className={config.className}
      style={size === 'md' ? { fontSize: '0.8125rem', padding: '0.375rem 1rem' } : undefined}
    >
      <span style={{
        width: size === 'md' ? 8 : 6,
        height: size === 'md' ? 8 : 6,
        borderRadius: '50%',
        background: 'currentColor',
        display: 'inline-block',
      }} />
      {lang === 'ar' ? config.labelAr : config.label}
    </span>
  );
}
