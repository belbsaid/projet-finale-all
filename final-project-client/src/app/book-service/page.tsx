import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BookServiceClient from './BookServiceClient';

export const metadata: Metadata = {
  title: 'Réserver un Service',
  description: 'Planifiez l\'entretien de votre véhicule au centre de service agréé d\'Alger.',
};

export default function BookServicePage() {
  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingTop: '72px' }}>
        <BookServiceClient />
      </main>
      <Footer />
    </>
  );
}
