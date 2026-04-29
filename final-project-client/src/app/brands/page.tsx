import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BrandsClient from './BrandsClient';

export const metadata: Metadata = {
  title: 'Nos Marques',
  description: 'Découvrez les marques chinoises que nous importons en Algérie : Chery, Geely, Haval, BYD, MG et plus.',
};

export default function BrandsPage() {
  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingTop: '72px' }}>
        <BrandsClient />
      </main>
      <Footer />
    </>
  );
}
