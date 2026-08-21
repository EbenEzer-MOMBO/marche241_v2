import { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import CheckoutLayout from '@/components/CheckoutLayout';
import { OrderSummary } from '@/components/OrderSummary';
import { getBoutiqueConfig, getBoutiqueBySlug, type BoutiqueConfig } from '@/lib/boutiques';

interface OrderPageProps {
  params: Promise<{ boutique: string }>;
}

export async function generateMetadata({ params }: OrderPageProps): Promise<Metadata> {
  const { boutique } = await params;
  
  try {
    const boutiqueConfig = await getBoutiqueConfig(boutique);
    return {
      title: `Résumé de commande - ${boutiqueConfig.name}`,
      description: `Finalisez votre commande sur ${boutiqueConfig.name}`,
      robots: {
        index: false,
        follow: false,
      },
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des métadonnées:', error);
    return {
      title: 'Boutique non trouvée',
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { boutique } = await params;
  
  let boutiqueConfig: BoutiqueConfig;
  let boutiqueData;
  try {
    boutiqueConfig = await getBoutiqueConfig(boutique);
    boutiqueData = await getBoutiqueBySlug(boutique);
  } catch (error) {
    console.error('Erreur lors de la récupération de la boutique:', error);
    notFound();
  }

  return (
    <CheckoutLayout boutiqueConfig={boutiqueConfig} boutiqueName={boutique}>
      <div className="min-h-[calc(100vh-58px)] bg-[#fbfaf8] py-6 sm:py-8">
        <div className="container mx-auto px-4">
          <Suspense
            fallback={
              <div className="flex min-h-[40vh] items-center justify-center text-sm text-[#8b8f95]">
                Chargement du récapitulatif…
              </div>
            }
          >
            <OrderSummary
              boutiqueConfig={boutiqueConfig}
              boutiqueId={boutiqueData.id}
              boutiqueTelephone={boutiqueData.telephone}
              boutiqueData={boutiqueData}
            />
          </Suspense>
        </div>
      </div>
    </CheckoutLayout>
  );
}
