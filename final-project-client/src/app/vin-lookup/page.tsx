import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import VinLookupClient from './VinLookupClient';

export const metadata: Metadata = {
  title: 'Suivi de Commande',
  description: 'Suivez le statut de votre véhicule en temps réel grâce au numéro VIN.',
};

export default function VinLookupPage() {
  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingTop: '72px' }}>
        <VinLookupClient />
      </main>
      <Footer />
    </>
  );
}
