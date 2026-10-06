'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Megaphone, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';
import Sidebar from '@/components/admin/Sidebar';
import { BoutiqueData } from '@/lib/services/auth';

export interface BoostPageContexte {
  boutique: BoutiqueData;
  succes: (message: string, titre?: string) => void;
  erreur: (message: string, titre?: string) => void;
}

/**
 * Coque commune des pages « Publicité » de l'espace vendeur : contrôle de session, chargement de la
 * boutique (redirection si le slug ne correspond pas), sidebar, en-tête et toasts.
 */
export default function BoostPageShell({
  titre,
  sousTitre,
  sousChemin,
  actions,
  children
}: {
  titre: string;
  sousTitre?: string;
  /** Chemin après /admin/[boutique] pour la redirection de slug (ex. « /boost/new »). */
  sousChemin: string;
  actions?: (ctx: BoostPageContexte) => ReactNode;
  children: (ctx: BoostPageContexte) => ReactNode;
}) {
  const router = useRouter();
  const params = useParams();
  const slugUrl = params.boutique as string;
  const { user, verifierBoutique } = useAuth();
  const { toasts, removeToast, success, error } = useToast();
  const [boutique, setBoutique] = useState<BoutiqueData | null>(null);
  const [chargement, setChargement] = useState(true);
  const [menuMobile, setMenuMobile] = useState(false);

  useEffect(() => {
    const charger = async () => {
      if (!user) {
        router.push('/admin/login');
        return;
      }
      try {
        const donnees = await verifierBoutique();
        if (!donnees) {
          router.push('/admin/boutique/create');
          return;
        }
        if (slugUrl !== donnees.slug) {
          const query = typeof window !== 'undefined' ? window.location.search : '';
          router.replace(`/admin/${donnees.slug}${sousChemin}${query}`);
          return;
        }
        setBoutique(donnees);
      } catch (err) {
        console.error('Erreur lors du chargement de la boutique:', err);
        error('Erreur lors du chargement de la boutique', 'Erreur');
      } finally {
        setChargement(false);
      }
    };
    const timer = setTimeout(charger, 100);
    return () => clearTimeout(timer);
  }, [user, slugUrl, sousChemin, router, verifierBoutique, error]);

  if (chargement) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
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

  const ctx: BoostPageContexte = {
    boutique,
    succes: (message, t) => success(message, t ?? 'Succès'),
    erreur: (message, t) => error(message, t ?? 'Erreur', 8000)
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden max-w-[100vw]">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <Sidebar boutique={boutique} isMobileMenuOpen={menuMobile} onToggleMobileMenu={() => setMenuMobile(!menuMobile)} />

      <div className="flex-1 flex flex-col min-h-0 w-full">
        <div className="bg-white shadow-sm border-b px-4 lg:px-6 py-3 lg:py-4">
          <div className="flex justify-between items-center gap-3">
            <div className="flex items-center min-w-0 flex-1">
              <button
                onClick={() => setMenuMobile(!menuMobile)}
                aria-label="Ouvrir le menu"
                className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors mr-3 flex-shrink-0"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg lg:text-2xl font-bold text-gray-900 truncate">{titre}</h1>
                {sousTitre && <p className="text-xs lg:text-sm text-gray-500 mt-0.5 lg:mt-1 truncate">{sousTitre}</p>}
              </div>
            </div>
            {actions?.(ctx)}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">{children(ctx)}</div>
      </div>
    </div>
  );
}
