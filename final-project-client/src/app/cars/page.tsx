import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CarsClient from './CarsClient';

export const metadata: Metadata = {
  title: 'Nos Voitures',
  description: 'Découvrez notre sélection de voitures chinoises neuves disponibles en Algérie. Chery, Geely, Haval, BYD, MG.',
};

export default function CarsPage() {
  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingTop: '72px' }}>
        <CarsClient />
      </main>
      <Footer />
    </>
  );
}
