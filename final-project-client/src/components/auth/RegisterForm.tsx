'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Minimum 2 caractères').max(50),
  email: z.string().email('Email invalide').trim().toLowerCase(),
  phone: z
    .string()
    .trim()
    .regex(
      /^\+213[\s-]?\d{2,3}[\s-]?\d{2}[\s-]?\d{2}[\s-]?\d{2}$/,
      'Format: +213 XXX XX XX XX'
    ),
  password: z
    .string()
    .min(8, 'Minimum 8 caractères')
    .regex(/[A-Z]/, 'Au moins une majuscule')
    .regex(/[a-z]/, 'Au moins une minuscule')
    .regex(/[0-9]/, 'Au moins un chiffre'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { t } = useI18n();
  const { register: doRegister, isLoading } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { phone: '+213 ' },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await doRegister(data);
      onSuccess?.();
    } catch {
      // Error toast already shown
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <label className="form-label-dark">{t('name')}</label>
        <input className="form-input-light" type="text" placeholder="Mohamed Ali" autoComplete="name" {...register('name')} />
        {errors.name && <p className="form-error">⚠ {errors.name.message}</p>}
      </div>

      <div>
        <label className="form-label-dark">{t('email')}</label>
        <input className="form-input-light" type="email" placeholder="votre@email.com" autoComplete="email" {...register('email')} />
        {errors.email && <p className="form-error">⚠ {errors.email.message}</p>}
      </div>

      <div>
        <label className="form-label-dark">{t('phone')}</label>
        <input className="form-input-light" type="tel" placeholder="+213 555 12 34 56" autoComplete="tel" {...register('phone')} />
        {errors.phone && <p className="form-error">⚠ {errors.phone.message}</p>}
      </div>

      <div>
        <label className="form-label-dark">{t('password')}</label>
        <input className="form-input-light" type="password" placeholder="Min. 8 caractères (A-z, 0-9)" autoComplete="new-password" {...register('password')} />
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
        {t('hasAccount')}{' '}
        <Link href="/auth/login" style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>
          {t('loginBtn')}
        </Link>
      </p>
    </form>
  );
}
