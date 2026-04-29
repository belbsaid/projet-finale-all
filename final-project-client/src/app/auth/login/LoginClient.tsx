'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/lib/i18n';
import LoginForm from '@/components/auth/LoginForm';
import { useEffect } from 'react';

export default function LoginClient() {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.push('/my-account');
  }, [isAuthenticated, router]);

  if (isAuthenticated) return null;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
        padding: '2rem 1rem',
      }}
    >
      <div className="animate-scale-in" style={{ width: '100%', maxWidth: '420px' }}>
        <div
          className="card-white"
          style={{ padding: '2.5rem 2rem' }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '12px',
              background: 'var(--accent-blue)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: '0.875rem', color: '#fff',
              margin: '0 auto 1.25rem',
            }}>
              AS
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)' }}>
              {t('login')}
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.9375rem', marginTop: '0.375rem' }}>
              to get started
            </p>
          </div>

          <LoginForm onSuccess={() => router.push('/my-account')} />
        </div>
      </div>
    </div>
  );
}
