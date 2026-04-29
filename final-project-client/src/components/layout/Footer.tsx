'use client';

import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, Globe, Share2, MessageCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
      <div className="container" style={{ padding: '4rem 1.5rem 2rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '3rem',
          marginBottom: '3rem',
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '8px',
                background: 'var(--accent-blue)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: '0.6875rem', color: '#fff',
              }}>
                AS
              </div>
              <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>
                Auto<span style={{ color: 'var(--accent-blue-light)' }}>Ship</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginLeft: '3px', fontWeight: 500 }}>DZ</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.7, maxWidth: '280px' }}>
              Importateur agréé de voitures chinoises en Algérie. Garantie officielle, pièces détachées et service après-vente.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Navigation
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { href: '/', label: t('home') },
                { href: '/cars', label: t('cars') },
                { href: '/brands', label: t('brands') },
                { href: '/contact', label: t('contact') },
                { href: '/book-meeting', label: t('bookMeeting') },
              ].map((link) => (
                <Link key={link.href} href={link.href} style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', transition: 'color 0.2s' }}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 style={{ fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Services
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { href: '/vin-lookup', label: t('vinLookup') },
                { href: '/book-service', label: t('bookService') },
                { href: '/my-cars', label: t('myCars') },
                { href: '/my-documents', label: t('myDocuments') },
              ].map((link) => (
                <Link key={link.href} href={link.href} style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', transition: 'color 0.2s' }}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              {t('contact')}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={15} /> Alger, Algérie</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={15} /> +213 555 123 456</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={15} /> contact@autoship.dz</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={15} /> {t('workingHoursVal')}</span>
            </div>

            {/* Social */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              {[
                { Icon: Globe, label: 'Facebook' },
                { Icon: Share2, label: 'Instagram' },
                { Icon: MessageCircle, label: 'WhatsApp' },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  style={{
                    width: 36, height: 36, borderRadius: '8px',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-muted)', transition: 'all 0.2s',
                  }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            &copy; {year} AutoShip DZ. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', transition: 'color 0.2s' }}>Privacy</a>
            <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', transition: 'color 0.2s' }}>Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
