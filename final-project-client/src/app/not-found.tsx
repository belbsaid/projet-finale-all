import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page non trouvée',
};

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', color: 'var(--text-primary)',
      textAlign: 'center', padding: '2rem',
    }}>
      <div style={{ fontSize: '6rem', fontWeight: 900, lineHeight: 1, background: 'linear-gradient(135deg, var(--brand-red-light), var(--brand-gold))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        404
      </div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '1rem 0 0.5rem' }}>
        Page non trouvée
      </h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', lineHeight: 1.7, marginBottom: '2rem' }}>
        La page que vous cherchez n'existe pas ou a été déplacée.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" className="btn-primary">
          Retour à l'accueil
        </Link>
        <Link href="/cars" className="btn-secondary">
          Voir les voitures
        </Link>
      </div>
    </div>
  );
}
