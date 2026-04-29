import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ModelDetailClient from './ModelDetailClient';

export default async function ModelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingTop: '72px' }}>
        <ModelDetailClient modelId={id} />
      </main>
      <Footer />
    </>
  );
}
