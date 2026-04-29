import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MyCarsClient from './MyCarsClient';

export const metadata: Metadata = {
  title: 'Mes Voitures',
  description: 'Consultez vos véhicules achetés et leur statut.',
};

export default function MyCarsPage() {
  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingTop: '72px' }}>
        <MyCarsClient />
      </main>
      <Footer />
    </>
  );
}
