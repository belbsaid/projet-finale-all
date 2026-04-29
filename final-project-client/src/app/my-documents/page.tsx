import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MyDocumentsClient from './MyDocumentsClient';

export const metadata: Metadata = {
  title: 'Mes Documents',
  description: 'Accédez à vos documents véhicule : COC, facture, garantie.',
};

export default function MyDocumentsPage() {
  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingTop: '72px' }}>
        <MyDocumentsClient />
      </main>
      <Footer />
    </>
  );
}
