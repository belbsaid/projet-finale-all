'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useState } from 'react';
import { useEffect } from 'react';
import api from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';

const leadSchema = z.object({
  name: z.string().trim().min(1, 'Le nom est requis'),
  phone: z
    .string()
    .trim()
    .regex(/^\+213[\s-]?\d{2,3}[\s-]?\d{2}[\s-]?\d{2}[\s-]?\d{2}$/, 'Format: +213 XXX XX XX XX'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  interestedModel: z.string().trim().min(1, 'Choisissez un modèle'),
  message: z.string().trim().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface ContactFormProps {
  prefilledModel?: string;
  carId?: string;
}

export default function ContactForm({ prefilledModel, carId }: ContactFormProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      phone: '+213 ',
      interestedModel: prefilledModel || '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        phone: user.phone || '+213 ',
        email: user.email || '',
        interestedModel: prefilledModel || '',
      });
    }
  }, [user, prefilledModel, reset]);

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    try {
      await api.post('/leads', {
        ...data,
        email: data.email || undefined,
        carId: carId || undefined,
        source: 'Website Form',
      });
      toast.success('Votre demande a été envoyée avec succès !');
      setSubmitted(true);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'envoi");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
          Merci pour votre intérêt !
        </h3>
        <p style={{ color: 'var(--text-dark-secondary)', marginBottom: '1.5rem' }}>
          Notre équipe vous contactera sous 24h.
        </p>
        <button className="btn-blue-outline" onClick={() => setSubmitted(false)}>
          Envoyer une autre demande
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <div>
          <label className="form-label-dark">{t('name')} *</label>
          <input className="form-input-light" type="text" placeholder="Votre nom complet" {...register('name')} />
          {errors.name && <p className="form-error">⚠ {errors.name.message}</p>}
        </div>

        <div>
          <label className="form-label-dark">{t('phone')} *</label>
          <input className="form-input-light" type="tel" placeholder="+213 555 12 34 56" {...register('phone')} />
          {errors.phone && <p className="form-error">⚠ {errors.phone.message}</p>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <div>
          <label className="form-label-dark">{t('email')}</label>
          <input className="form-input-light" type="email" placeholder="votre@email.com" {...register('email')} />
          {errors.email && <p className="form-error">⚠ {errors.email.message}</p>}
        </div>

        <div>
          <label className="form-label-dark">{t('interestedModel')} *</label>
          <input className="form-input-light" type="text" placeholder="Ex: Chery Tiggo 7 Pro" {...register('interestedModel')} />
          {errors.interestedModel && <p className="form-error">⚠ {errors.interestedModel.message}</p>}
        </div>
      </div>

      <div>
        <label className="form-label-dark">{t('message')}</label>
        <textarea
          className="form-input-light"
          rows={4}
          placeholder="Votre message (optionnel)..."
          {...register('message')}
          style={{ resize: 'vertical' }}
        />
      </div>

      <button
        type="submit"
        className="btn-primary"
        disabled={isSubmitting}
        style={{ width: '100%', padding: '0.875rem', opacity: isSubmitting ? 0.7 : 1 }}
      >
        {isSubmitting ? t('submitting') : t('submit')}
      </button>
    </form>
  );
}
