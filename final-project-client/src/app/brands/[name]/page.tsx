import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BrandDetailClient from "./BrandDetailClient";

export default async function BrandDetailPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;

  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingTop: "72px" }}>
        <BrandDetailClient brandName={decodeURIComponent(name)} />
      </main>
      <Footer />
    </>
  );
}
