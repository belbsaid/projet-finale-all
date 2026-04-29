'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Lock, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/lib/i18n';

const bookingSchema = z.object({
  carId: z.string().min(1, 'Sélectionnez un véhicule'),
  preferredDate: z.string().min(1, 'Sélectionnez une date'),
  preferredTimeSlot: z.enum(['morning', 'afternoon', 'evening']),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function BookMeetingClient() {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: carsData } = useQuery({
    queryKey: ['cars-for-booking'],
    queryFn: async () => {
      const res = await api.get('/cars', { params: { status: 'In Stock', limit: '50' } });
      return res.data;
    },
    enabled: isAuthenticated,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { preferredTimeSlot: 'morning' },
  });

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '500px', textAlign: 'center' }}>
        <div className="card-white animate-scale-in" style={{ padding: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--text-muted)' }}><Lock size={48} /></div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.75rem' }}>{t('loginRequired')}</h1>
          <p style={{ color: 'var(--text-dark-secondary)', marginBottom: '2rem' }}>{t('loginRequiredDesc')}</p>
          <Link href="/auth/login" className="btn-primary" style={{ display: 'inline-flex' }}>{t('login')}</Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '500px', textAlign: 'center' }}>
        <div className="card-white animate-fade-in-up" style={{ padding: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--status-stock)' }}><CheckCircle size={48} /></div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.75rem' }}>Visite confirmée !</h2>
          <p style={{ color: 'var(--text-dark-secondary)', marginBottom: '2rem' }}>Nous vous contacterons pour confirmer votre créneau.</p>
          <Link href="/my-account" className="btn-primary" style={{ display: 'inline-flex' }}>{t('myAccount')}</Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    try {
      const isoDate = new Date(data.preferredDate).toISOString();
      await api.post('/leads/meeting', {
        ...data,
        preferredDate: isoDate,
      });
      toast.success('Réservation envoyée avec succès !');
      setSubmitted(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la réservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cars = carsData?.cars || carsData?.data || [];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="container animate-fade-in-up" style={{ padding: '2rem 1.5rem 4rem', maxWidth: '600px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 className="section-title">{t('bookMeeting')}</h1>
        <p className="section-subtitle" style={{ margin: '0.75rem auto 0' }}>{t('bookMeetingDesc')}</p>
      </div>

      <div className="card-white" style={{ padding: '2.5rem' }}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Car selection */}
          <div>
            <label className="form-label-dark">Véhicule qui vous intéresse *</label>
            <select className="form-input-light" {...register('carId')} style={{ cursor: 'pointer' }}>
              <option value="">-- Choisir un véhicule --</option>
              {cars.map((car: { _id: string; brand?: { name: string }; model?: { name: string }; year?: number }) => {
                const b = typeof car.brand === 'object' ? car.brand?.name : '';
                const m = typeof car.model === 'object' ? car.model?.name : '';
                return (
                  <option key={car._id} value={car._id}>{b} {m} {car.year || ''}</option>
                );
              })}
            </select>
            {errors.carId && <p className="form-error" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><AlertTriangle size={12} /> {errors.carId.message}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="form-label-dark">{t('preferredDate')} *</label>
            <input className="form-input-light" type="date" min={minDate} {...register('preferredDate')} />
            {errors.preferredDate && <p className="form-error" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><AlertTriangle size={12} /> {errors.preferredDate.message}</p>}
          </div>

          {/* Time slot */}
          <div>
            <label className="form-label-dark">{t('timeSlot')} *</label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {[
                { value: 'morning', label: t('morning') },
                { value: 'afternoon', label: t('afternoon') },
                { value: 'evening', label: t('evening') },
              ].map((slot) => (
                <label key={slot.value} style={{
                  flex: 1, minWidth: '140px', padding: '0.75rem 1rem',
                  background: '#f8f9fa', border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  fontSize: '0.875rem', color: 'var(--text-dark)', transition: 'border-color 0.2s',
                }}>
                  <input type="radio" value={slot.value} {...register('preferredTimeSlot')} style={{ accentColor: 'var(--accent-blue)' }} />
                  {slot.label}
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="form-label-dark">{t('notes')}</label>
            <textarea
              className="form-input-light"
              rows={3}
              placeholder="Ex: Je souhaite essayer le véhicule..."
              {...register('notes')}
              style={{ resize: 'vertical' }}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.875rem', opacity: isSubmitting ? 0.7 : 1 }}
          >
            {isSubmitting ? t('submitting') : t('bookNow')}
          </button>
        </form>
      </div>
    </div>
  );
}
