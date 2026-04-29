'use client';

import { useI18n } from '@/lib/i18n';
import { buildWhatsAppUrl } from '@/lib/utils';
import ContactForm from '@/components/contact/ContactForm';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const WHATSAPP_NUM = '+213555123456';

function ContactFormWrapper() {
  const searchParams = useSearchParams();
  const prefilledModel = searchParams.get('prefilledModel') || '';
  return <ContactForm prefilledModel={prefilledModel} />;
}

export default function ContactClient() {
  const { t } = useI18n();

  return (
    <div className="container animate-fade-in-up" style={{ padding: '2rem 1.5rem 4rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 className="section-title">{t('contactTitle')}</h1>
        <p className="section-subtitle" style={{ margin: '0.75rem auto 0' }}>{t('contactSubtitle')}</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '2rem',
      }} className="md:grid-cols-[2fr_1fr]">
        {/* Form Card */}
        <div className="card-white" style={{ padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '1.5rem' }}>
            Envoyez-nous un message
          </h2>
          <Suspense fallback={<div>Chargement...</div>}>
            <ContactFormWrapper />
          </Suspense>
        </div>

        {/* Contact info sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { icon: '📍', title: t('address'), info: 'Showroom AutoShip DZ\nZone Activité, Alger\nAlgérie' },
            { icon: '📞', title: 'Téléphone', info: '+213 555 123 456', sub: 'Appel & SMS' },
            { icon: '🕐', title: t('workingHours'), info: t('workingHoursVal'), sub: 'Fermé le vendredi' },
            { icon: '✉️', title: 'Email', info: 'contact@autoship.dz' },
          ].map((item, i) => (
            <div key={i} className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '1rem' }}>
                {item.icon} {item.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {item.info}
              </p>
              {item.sub && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                  {item.sub}
                </p>
              )}
            </div>
          ))}

          <a
            href={buildWhatsAppUrl(WHATSAPP_NUM, 'Bonjour, je souhaite avoir plus d\'informations.')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp"
            style={{ width: '100%', padding: '0.875rem', textAlign: 'center' }}
          >
            💬 Discuter sur WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
