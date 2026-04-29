'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/lib/i18n';

const serviceSchema = z.object({
  model: z.string().min(1, 'Indiquez votre modèle'),
  mileage: z.string().min(1, 'Indiquez le kilométrage'),
  serviceType: z.enum(['entretien', 'reparation', 'revision', 'autre']),
  preferredDate: z.string().min(1, 'Sélectionnez une date'),
  notes: z.string().optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

export default function BookServiceClient() {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: myCars } = useQuery({
    queryKey: ['my-cars'],
    queryFn: async () => {
      const res = await api.get('/cars/customer/my-cars');
      return res.data.data || [];
    },
    enabled: isAuthenticated,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { serviceType: 'entretien' },
  });

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '500px', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>{t('loginRequired')}</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{t('loginRequiredDesc')}</p>
          <Link href="/auth/login" className="btn-primary" style={{ display: 'inline-flex' }}>{t('login')}</Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '500px', textAlign: 'center' }}>
        <div className="glass-card animate-fade-in-up" style={{ padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔧</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Service réservé !</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Votre rendez-vous d'entretien a été enregistré. Nous vous confirmerons par SMS.
          </p>
          <Link href="/my-account" className="btn-primary" style={{ display: 'inline-flex' }}>{t('myAccount')}</Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: ServiceFormData) => {
    setIsSubmitting(true);
    try {
      /* Service booking uses leads endpoint with Meeting Booking source */
      await api.post('/leads', {
        name: 'Service Request',
        phone: '+213000000000',
        interestedModel: data.model,
        message: `Service: ${data.serviceType} | Kilométrage: ${data.mileage} | Date: ${data.preferredDate} | Notes: ${data.notes || ''}`,
        source: 'Website Form',
      });
      toast.success('Rendez-vous service enregistré !');
      setSubmitted(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const cars: { _id: string; brand?: { name: string }; model?: { name: string }; year?: number }[] = myCars || [];

  return (
    <div className="container animate-fade-in-up" style={{ padding: '2rem 1.5rem 4rem', maxWidth: '600px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 className="section-title">{t('bookService')}</h1>
        <p className="section-subtitle" style={{ margin: '0.75rem auto 0' }}>{t('serviceDesc')}</p>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Vehicle */}
          <div>
            <label className="form-label">Véhicule *</label>
            {cars.length > 0 ? (
              <select className="form-input" {...register('model')} style={{ cursor: 'pointer' }}>
                <option value="">-- Choisir un véhicule --</option>
                {cars.map((car) => {
                  const b = typeof car.brand === 'object' ? car.brand?.name : '';
                  const m = typeof car.model === 'object' ? car.model?.name : '';
                  return <option key={car._id} value={`${b} ${m} ${car.year || ''}`.trim()}>{b} {m} {car.year || ''}</option>;
                })}
              </select>
            ) : (
              <input
                className="form-input"
                type="text"
                placeholder="Ex: Chery Tiggo 7 Pro 2024"
                {...register('model')}
              />
            )}
            {errors.model && <p className="form-error">⚠ {errors.model.message}</p>}
          </div>

          {/* Service type */}
          <div>
            <label className="form-label">Type de service *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { value: 'entretien', label: '🔧 Entretien général' },
                { value: 'reparation', label: '🛠 Réparation' },
                { value: 'revision', label: '📋 Révision', },
                { value: 'autre', label: '❓ Autre' },
              ].map((opt) => (
                <label key={opt.value} style={{
                  padding: '0.75rem', background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  gap: '0.5rem', fontSize: '0.875rem',
                }}>
                  <input type="radio" value={opt.value} {...register('serviceType')} style={{ accentColor: 'var(--brand-red)' }} />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* Mileage */}
          <div>
            <label className="form-label">Kilométrage actuel *</label>
            <input className="form-input" type="number" placeholder="Ex: 15000" min={0} {...register('mileage')} />
            {errors.mileage && <p className="form-error">⚠ {errors.mileage.message}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="form-label">{t('preferredDate')} *</label>
            <input className="form-input" type="date" min={minDate} {...register('preferredDate')} />
            {errors.preferredDate && <p className="form-error">⚠ {errors.preferredDate.message}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="form-label">{t('notes')}</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Décrivez le problème ou la prestation souhaitée..."
              {...register('notes')}
              style={{ resize: 'vertical' }}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
            style={{ width: '100%', opacity: isSubmitting ? 0.7 : 1 }}
          >
            {isSubmitting ? t('submitting') : t('bookNow')}
          </button>
        </form>
      </div>
    </div>
  );
}
