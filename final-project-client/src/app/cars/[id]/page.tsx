import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CarDetailClient from './CarDetailClient';

// SSR metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const res = await fetch(`http://localhost:4000/api/cars/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return { title: 'Véhicule Non Trouvé' };

    const json = await res.json();
    const car = json.car || json.data || json;
    const brandName = typeof car.brand === 'object' ? car.brand.name : '';
    const modelName = typeof car.model === 'object' ? car.model.name : '';
    const title = `${brandName} ${modelName} ${car.year || ''}`.trim();

    return {
      title: title || 'Détails du Véhicule',
      description: `${title} disponible en Algérie. ${car.specs?.engine || ''} ${car.specs?.transmission || ''}. Prix: ${car.finalPriceDZD?.toLocaleString()} DZD. Garantie officielle.`,
      openGraph: {
        title,
        images: car.photos?.[0] ? [car.photos[0]] : [],
      },
    };
  } catch {
    return { title: 'Véhicule' };
  }
}

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingTop: '72px' }}>
        <CarDetailClient carId={id} />
      </main>
      <Footer />
    </>
  );
}
