import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/providers/Providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'AutoShip DZ — Voitures Chinoises Neuves en Algérie',
    template: '%s | AutoShip DZ',
  },
  description:
    'Importateur agréé de voitures chinoises en Algérie. Chery, Geely, Haval, BYD, MG — Garantie officielle, pièces détachées et service après-vente à Alger.',
  keywords: ['voitures chinoises algérie', 'chery', 'geely', 'haval', 'byd', 'mg', 'importateur véhicules', 'autoship dz'],
  authors: [{ name: 'AutoShip DZ' }],
  creator: 'AutoShip DZ',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_DZ',
    siteName: 'AutoShip DZ',
    title: 'AutoShip DZ — Voitures Chinoises Neuves en Algérie',
    description: 'Importateur agréé de voitures chinoises en Algérie.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="min-h-screen flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
