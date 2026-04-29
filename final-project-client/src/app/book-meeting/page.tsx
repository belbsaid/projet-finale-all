import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BookMeetingClient from './BookMeetingClient';

export const metadata: Metadata = {
  title: 'Réserver une Visite',
  description: 'Réservez une visite au showroom AutoChine Algérie pour découvrir nos véhicules.',
};

export default function BookMeetingPage() {
  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingTop: '72px' }}>
        <BookMeetingClient />
      </main>
      <Footer />
    </>
  );
}
