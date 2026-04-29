'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Email invalide').trim().toLowerCase(),
  password: z
    .string()
    .min(8, 'Minimum 8 caractères')
    .regex(/[A-Z]/, 'Au moins une majuscule')
    .regex(/[a-z]/, 'Au moins une minuscule')
    .regex(/[0-9]/, 'Au moins un chiffre'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const { t } = useI18n();
  const { login, isLoading } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      onSuccess?.();
    } catch {
      // Error toast already shown by useAuth
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <label className="form-label-dark">{t('email')}</label>
        <input
          className="form-input-light"
          type="email"
          placeholder="votre@email.com"
          autoComplete="email"
          {...register('email')}
        />
        {errors.email && <p className="form-error">⚠ {errors.email.message}</p>}
      </div>

      <div>
        <label className="form-label-dark">{t('password')}</label>
        <input
          className="form-input-light"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          {...register('password')}
        />
        {errors.password && <p className="form-error">⚠ {errors.password.message}</p>}
      </div>

      <button
        type="submit"
        className="btn-primary"
        disabled={isLoading}
        style={{
          width: '100%',
          marginTop: '0.5rem',
          padding: '0.875rem',
          opacity: isLoading ? 0.7 : 1,
        }}
      >
        {isLoading ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="60" strokeLinecap="round" />
            </svg>
            {t('submitting')}
          </span>
        ) : (
          'Continue'
        )}
      </button>

      <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
        {t('noAccount')}{' '}
        <Link href="/auth/register" style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>
          {t('registerBtn')}
        </Link>
      </p>
    </form>
  );
}
