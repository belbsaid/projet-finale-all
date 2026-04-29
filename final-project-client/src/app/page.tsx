import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HomeClient from './HomeClient';

export default function HomePage() {
  return (
    <>
      <Header />
      <main style={{ flex: 1 }}>
        <HomeClient />
      </main>
      <Footer />
    </>
  );
}
