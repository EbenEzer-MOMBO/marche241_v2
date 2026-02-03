import { Metadata } from 'next';
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
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des métadonnées:', error);
    return {
      title: 'Boutique non trouvée',
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
            <OrderSummary 
              boutiqueConfig={boutiqueConfig} 
              boutiqueId={boutiqueData.id} 
              boutiqueTelephone={boutiqueData.telephone} 
              boutiqueData={boutiqueData}
            />
          </div>
        </div>
      </div>
    </CheckoutLayout>
  );
}
