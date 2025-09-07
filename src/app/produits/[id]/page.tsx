import MainLayout from '@/components/MainLayout';
import ProductDetail from '@/components/ProductDetail';

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  return (
    <MainLayout>
      <ProductDetail productId={id} />
    </MainLayout>
  );
}
