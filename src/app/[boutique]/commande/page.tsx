import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { OrderSummary } from '@/components/OrderSummary';
import { boutiques, type BoutiqueConfig } from '../layout';

interface OrderPageProps {
  params: Promise<{ boutique: string }>;
}

export async function generateMetadata({ params }: OrderPageProps): Promise<Metadata> {
  const { boutique } = await params;
  const boutiqueConfig = boutiques[boutique as keyof typeof boutiques];
  
  if (!boutiqueConfig) {
    return {
      title: 'Boutique non trouvée',
    };
  }

  return {
    title: `Résumé de commande - ${boutiqueConfig.name}`,
    description: `Finalisez votre commande sur ${boutiqueConfig.name}`,
  };
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { boutique } = await params;
  const boutiqueConfig = boutiques[boutique as keyof typeof boutiques];
  
  if (!boutiqueConfig) {
    notFound();
  }

  return (
    <MainLayout boutiqueConfig={boutiqueConfig}>
      <div className="container mx-auto px-4 py-8">
        <div className="row">
          <div className="col-12">
            <h1 className="h2 mb-4" style={{ color: boutiqueConfig.theme.primary }}>
              Résumé de votre commande
            </h1>
            <OrderSummary boutiqueConfig={boutiqueConfig} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export async function generateStaticParams() {
  return [
    { boutique: 'marche_241' },
    { boutique: 'boutique_de_joline' },
  ];
}