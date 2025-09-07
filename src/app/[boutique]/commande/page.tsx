import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CheckoutLayout from '@/components/CheckoutLayout';
import { OrderSummary } from '@/components/OrderSummary';
import { boutiques, type BoutiqueConfig } from '@/lib/boutiques';

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
    <CheckoutLayout boutiqueConfig={boutiqueConfig} boutiqueName={boutique}>
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2 text-black">
                Résumé de votre commande
              </h3>
              <p className="text-muted-foreground">
                Vérifiez vos articles et finalisez votre commande
              </p>
            </div>
            <OrderSummary boutiqueConfig={boutiqueConfig} />
          </div>
        </div>
      </div>
    </CheckoutLayout>
  );
}

export async function generateStaticParams() {
  return [
    { boutique: 'marche_241' },
    { boutique: 'boutique_de_joline' },
  ];
}