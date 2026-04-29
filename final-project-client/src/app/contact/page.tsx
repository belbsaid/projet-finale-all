import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contactez-Nous',
  description: 'Contactez AutoChine Algérie. Demande d\'informations, réservation de visite, questions sur nos véhicules chinois.',
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingTop: '72px' }}>
        <ContactClient />
      </main>
      <Footer />
    </>
  );
}
