'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { listerMesBoosts, type Boost } from '@/lib/services/boosts';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import Sidebar from '@/components/admin/Sidebar';
import { BoutiqueData } from '@/lib/services/auth';
import { Megaphone, Menu, Plus } from 'lucide-react';

const STATUT_LABELS: Record<string, string> = {
  en_attente_paiement: 'En attente de paiement',
  en_attente_revue: 'En attente de revue',
  actif: 'Actif',
  rejete: 'Rejeté',
  en_pause: 'En pause',
  termine: 'Terminé',
  erreur: 'Erreur',
};

const STATUT_COLORS: Record<string, string> = {
  en_attente_paiement: 'bg-gray-100 text-gray-700',
  en_attente_revue: 'bg-yellow-100 text-yellow-800',
  actif: 'bg-green-100 text-green-800',
  rejete: 'bg-red-100 text-red-800',
  en_pause: 'bg-orange-100 text-orange-800',
  termine: 'bg-blue-100 text-blue-800',
  erreur: 'bg-red-100 text-red-800',
};

export default function BoostPage() {
  const router = useRouter();
  const params = useParams();
  const boutiqueName = params.boutique as string;

  const { user, verifierBoutique } = useAuth();
  const { toasts, removeToast, error: showError } = useToast();

  const [boutique, setBoutique] = useState<BoutiqueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [boosts, setBoosts] = useState<Boost[]>([]);

  useEffect(() => {
    const loadBoutiqueData = async () => {
      if (!user) {
        router.push('/admin/login');
        return;
      }

      try {
        const boutiqueData = await verifierBoutique();

        if (!boutiqueData) {
          router.push('/admin/boutique/create');
          return;
        }

        if (boutiqueName !== boutiqueData.slug) {
          router.replace(`/admin/${boutiqueData.slug}/boost`);
          return;
        }

        setBoutique(boutiqueData);

        const resultat = await listerMesBoosts(boutiqueData.id, 1, 50);
        setBoosts(resultat.donnees || []);
      } catch (err) {
        console.error('Erreur lors du chargement des boosts:', err);
        showError('Erreur lors du chargement des boosts');
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      loadBoutiqueData();
    }, 100);

    return () => clearTimeout(timer);
  }, [user, boutiqueName, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des boosts...</p>
        </div>
      </div>
    );
  }

  if (!boutique) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Megaphone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Boutique non trouvée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden max-w-[100vw]">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <Sidebar
        boutique={boutique}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <div className="flex-1 flex flex-col min-h-0 w-full">
        <div className="bg-white shadow-sm border-b px-4 lg:px-6 py-3 lg:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center min-w-0 flex-1">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors mr-3 flex-shrink-0"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>

              <div className="min-w-0 flex-1">
                <h1 className="text-lg lg:text-2xl font-bold text-gray-900 truncate">Boost publicitaire</h1>
                <p className="text-xs lg:text-sm text-gray-500 mt-0.5 lg:mt-1 truncate">
                  Faites la promotion de {boutique.nom} sur Facebook et Instagram
                </p>
              </div>
            </div>

            <Link
              href={`/admin/${boutique.slug}/boost/new`}
              className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              <Plus className="h-4 w-4" />
              Nouveau boost
            </Link>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
          {boosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
              <Megaphone className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-600 font-medium">Aucun boost pour le moment</p>
              <p className="text-sm text-gray-400 mt-1">Boostez votre boutique pour toucher plus de clients sur Facebook et Instagram.</p>
              <Link
                href={`/admin/${boutique.slug}/boost/new`}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                <Plus className="h-4 w-4" />
                Créer mon premier boost
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-6 py-4">Forfait</th>
                      <th className="px-6 py-4">Prix</th>
                      <th className="px-6 py-4">Durée</th>
                      <th className="px-6 py-4">Ciblage</th>
                      <th className="px-6 py-4">Statut</th>
                      <th className="px-6 py-4">Créé le</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {boosts.map((boost) => (
                      <tr key={boost.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 capitalize font-medium text-gray-900">{boost.forfait_code}</td>
                        <td className="px-6 py-4">{boost.prix_vendeur_fcfa.toLocaleString('fr-FR')} FCFA</td>
                        <td className="px-6 py-4">{boost.duree_jours} j</td>
                        <td className="px-6 py-4">{boost.zones?.join(', ') || '—'}</td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUT_COLORS[boost.statut] ?? 'bg-gray-100 text-gray-700'}`}>
                            {STATUT_LABELS[boost.statut] ?? boost.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{new Date(boost.date_creation).toLocaleDateString('fr-FR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
