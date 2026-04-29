import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AccountClient from './AccountClient';

export const metadata: Metadata = {
  title: 'Mon Compte',
  description: 'Gérez votre espace client AutoChine Algérie.',
};

export default function MyAccountPage() {
  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingTop: '72px' }}>
        <AccountClient />
      </main>
      <Footer />
    </>
  );
}
