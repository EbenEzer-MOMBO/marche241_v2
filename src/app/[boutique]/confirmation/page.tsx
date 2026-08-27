'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import { useBoutique } from '@/hooks/useBoutique';
import { usePanier } from '@/hooks/usePanier';
import SafeImage from '@/components/SafeImage';
import { verifierPaiementEnBoucle } from '@/lib/services/paiements';
import { getCommunesActives } from '@/lib/services/communes';
import { formatDureeLivraison } from '@/lib/utils/delai-livraison';

const getBoutiqueLogo = (logoUrl?: string | null): string => {
  if (logoUrl && logoUrl.trim() !== '') {
    try {
      new URL(logoUrl);
      return logoUrl;
    } catch {
      return '/default-shop.png';
    }
  }
  return '/default-shop.png';
};

type VisaVerificationState = 'idle' | 'verifying' | 'success' | 'failed';

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const boutiqueSlug = params.boutique as string;
  const numeroCommande = searchParams.get('commande');
  const typePaiement = searchParams.get('type');
  const billId = searchParams.get('bill_id');
  const { boutique, config } = useBoutique(boutiqueSlug);
  const { viderLePanier } = usePanier(boutique?.id);
  const viderLePanierRef = useRef(viderLePanier);
  viderLePanierRef.current = viderLePanier;
  const [copied, setCopied] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [visaState, setVisaState] = useState<VisaVerificationState>(billId ? 'verifying' : 'idle');
  const [visaMessage, setVisaMessage] = useState('Vérification du paiement par carte…');
  const cartClearedRef = useRef(false);
  const [delaiLivraisonDuree, setDelaiLivraisonDuree] = useState<string | null>(null);

  useEffect(() => {
    if (!boutique?.id) return;

    let cancelled = false;

    getCommunesActives(boutique.id)
      .then((communes) => {
        if (cancelled || communes.length === 0) return;

        const min = Math.min(...communes.map((c) => c.delai_livraison_min));
        const max = Math.max(...communes.map((c) => c.delai_livraison_max));
        setDelaiLivraisonDuree(formatDureeLivraison(min, max));
      })
      .catch(() => {
        // Garde le texte par défaut en cas d'échec du chargement des communes
      });

    return () => {
      cancelled = true;
    };
  }, [boutique?.id]);

  const isPartiel = typePaiement === 'partiel';
  const boutiqueName = config?.name || boutique?.nom || 'la boutique';
  const whatsappNumber = (boutique?.telephone || '').replace(/\D/g, '');
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber.startsWith('241') ? whatsappNumber : `241${whatsappNumber}`}?text=${encodeURIComponent(
        `Bonjour, je souhaite suivre ma commande ${numeroCommande || ''}`
      )}`
    : `https://wa.me/?text=${encodeURIComponent(`Commande ${numeroCommande || ''}`)}`;

  useEffect(() => {
    if (!billId) {
      return;
    }

    const cancelSignal = { cancelled: false };

    verifierPaiementEnBoucle(billId, 90000, 5000, cancelSignal)
      .then(async (result) => {
        const status = (result.status || '').toLowerCase();
        if (status === 'paye' || status === 'paid' || status === 'processed') {
          setVisaState('success');
          if (!cartClearedRef.current) {
            cartClearedRef.current = true;
            await viderLePanierRef.current();
          }
          return;
        }

        if (status === 'echec' || status === 'failed' || status === 'rembourse' || status === 'refunded') {
          setVisaState('failed');
          setVisaMessage(result.message || 'Le paiement par carte a échoué. Vous pouvez réessayer depuis le checkout.');
          return;
        }

        setVisaState('failed');
        setVisaMessage(
          result.message ||
            'Le paiement n’est pas encore confirmé. S’il a bien été débité, la commande sera validée automatiquement.'
        );
      })
      .catch((verificationError) => {
        if (cancelSignal.cancelled) {
          return;
        }
        console.error('Erreur vérification Visa:', verificationError);
        setVisaState('failed');
        setVisaMessage('Impossible de vérifier le paiement pour le moment. Réessayez ou contactez le vendeur.');
      });

    return () => {
      cancelSignal.cancelled = true;
    };
  }, [billId]);

  const timeline = useMemo(
    () => [
      {
        id: 'confirmed',
        label: 'Commande confirmée',
        detail: 'à l’instant',
        done: visaState !== 'verifying' && visaState !== 'failed',
      },
      {
        id: 'prep',
        label: 'En préparation chez le vendeur',
        detail: 'sous 24 h · vous serez notifié sur WhatsApp',
        done: false,
      },
      {
        id: 'ship',
        label: 'Livraison',
        detail: `${delaiLivraisonDuree || '24-48h'} · suivi par WhatsApp`,
        done: false,
      },
    ],
    [visaState, delaiLivraisonDuree]
  );

  const handleCopy = async () => {
    if (!numeroCommande) return;
    try {
      await navigator.clipboard.writeText(numeroCommande);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const showSuccess = visaState === 'idle' || visaState === 'success';

  return (
    <div className="min-h-screen bg-white text-[#17181a]">
      <header className="border-b border-[#ececea]">
        <div className="mx-auto flex h-[58px] max-w-2xl items-center justify-between px-4 sm:px-6">
          <Link
            href={`/${boutiqueSlug}`}
            className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#17181a]/30 rounded"
          >
            <div className="h-7 w-7 overflow-hidden rounded-lg bg-[#17181a]">
              <SafeImage
                src={getBoutiqueLogo(boutique?.logo)}
                alt=""
                width={28}
                height={28}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-sm font-semibold">{boutiqueName}</span>
          </Link>
          <span className="text-[13px] text-[#5f6369]">
            {visaState === 'verifying'
              ? 'Paiement en cours'
              : visaState === 'failed'
                ? 'Paiement non confirmé'
                : 'Commande confirmée'}
          </span>
        </div>
      </header>

      <main className="mx-auto flex max-w-[640px] flex-col gap-5 px-4 py-8 sm:px-6 sm:py-10">
        {visaState === 'verifying' && (
          <section className="flex flex-col items-start gap-3" aria-live="polite">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e0ded9] bg-[#fafaf8]">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#17181a] border-t-transparent" />
            </div>
            <div>
              <h1 className="text-[24px] font-semibold leading-tight sm:text-[26px]">
                Vérification du paiement
              </h1>
              <p className="mt-1.5 text-[14.5px] leading-[1.55] text-[#5f6369]">
                {visaMessage} Merci de patienter quelques instants.
              </p>
            </div>
            {numeroCommande && (
              <div className="w-full rounded-[10px] border border-[#e6e4df] bg-[#fafaf8] px-4 py-3">
                <div className="text-[11px] font-medium uppercase tracking-wider text-[#9a9892]">
                  N° de commande
                </div>
                <div className="mt-0.5 font-mono text-[15px] font-medium">{numeroCommande}</div>
              </div>
            )}
          </section>
        )}

        {visaState === 'failed' && (
          <section className="flex flex-col items-start gap-3" aria-live="polite">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#f5c2c7] bg-[#fdecee]">
              <span className="text-lg font-semibold text-[#dc2626]" aria-hidden>
                !
              </span>
            </div>
            <div>
              <h1 className="text-[24px] font-semibold leading-tight sm:text-[26px]">
                Paiement non confirmé
              </h1>
              <p className="mt-1.5 text-[14.5px] leading-[1.55] text-[#5f6369]">
                {visaMessage}
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <Link
                href={`/${boutiqueSlug}/commande`}
                className="inline-flex h-[50px] flex-1 items-center justify-center rounded-[10px] px-4 text-[15px] font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{
                  backgroundColor: 'var(--color-shop-primary, var(--primary-color, #2f5fd8))',
                }}
              >
                Réessayer le paiement
              </Link>
              <Link
                href={`/${boutiqueSlug}`}
                className="inline-flex h-[50px] items-center justify-center rounded-[10px] border-[1.5px] border-[#17181a] bg-white px-4 text-[15px] font-semibold text-[#17181a] sm:w-[230px]"
              >
                Retour à la boutique
              </Link>
            </div>
          </section>
        )}

        {showSuccess && (
          <>
        {/* Succès */}
        <section className="flex flex-col items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#bfe6cd] bg-[#eaf7ee]">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#16a34a"
              strokeWidth="2.5"
              aria-hidden
            >
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h1 className="text-[24px] font-semibold leading-tight sm:text-[26px]">
              Commande confirmée
            </h1>
            <p className="mt-1.5 text-[14.5px] leading-[1.55] text-[#5f6369]">
              Merci. {boutiqueName} a reçu votre commande et la prépare.
            </p>
          </div>
          {numeroCommande && (
            <div className="flex w-full items-center justify-between gap-3 rounded-[10px] border border-[#e6e4df] bg-[#fafaf8] px-4 py-3">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-[#9a9892]">
                  N° de commande
                </div>
                <div className="mt-0.5 font-mono text-[15px] font-medium">{numeroCommande}</div>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-lg border border-[#e6e4df] bg-white px-3 py-1.5 text-[12.5px] font-medium text-[#3c4045] hover:bg-[#f6f5f3] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#17181a]/30"
                aria-label="Copier le numéro de commande"
              >
                {copied ? 'Copié' : 'Copier'}
              </button>
            </div>
          )}
        </section>

        {/* Paiement */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-[12px] border border-[#e6e4df] bg-white p-4">
            <div className="font-mono text-[10.5px] font-medium uppercase tracking-wider text-[#9a9892]">
              Déjà payé
            </div>
            <div className="mt-2 font-mono text-[19px] font-semibold text-[#16a34a]">
              {isPartiel ? 'Frais de livraison' : 'Paiement complet'}
            </div>
            <div className="mt-1 text-[12.5px] text-[#8b8f95]">
              {isPartiel
                ? 'Livraison + frais de service'
                : 'Commande entièrement réglée'}
            </div>
          </div>
          {isPartiel && (
            <div className="rounded-[12px] border border-[#e6e4df] bg-white p-4">
              <div className="font-mono text-[10.5px] font-medium uppercase tracking-wider text-[#9a9892]">
                À régler à la réception
              </div>
              <div className="mt-2 font-mono text-[19px] font-semibold text-[#17181a]">
                Solde commande
              </div>
              <div className="mt-1 text-[12.5px] text-[#8b8f95]">
                En espèces au livreur, montant exact conseillé
              </div>
            </div>
          )}
        </section>

        {/* Timeline */}
        <section className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
          <h2 className="mb-4 text-[15.5px] font-semibold">Suivi</h2>
          <ol className="relative space-y-0">
            {timeline.map((step, index) => (
              <li key={step.id} className="relative flex gap-3 pb-5 last:pb-0">
                {index < timeline.length - 1 && (
                  <span className="absolute left-[11px] top-6 h-[calc(100%-12px)] w-px bg-[#e0ded9]" />
                )}
                <span
                  className={`relative z-10 mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[11px] ${
                    step.done
                      ? 'bg-[#16a34a] text-white'
                      : 'border border-[#e0ded9] bg-white text-transparent'
                  }`}
                  aria-hidden
                >
                  {step.done ? '✓' : ''}
                </span>
                <div>
                  <div className="text-[14px] font-medium text-[#3c4045]">
                    {step.label}
                  </div>
                  <div className="mt-0.5 font-mono text-[12.5px] text-[#8b8f95]">
                    {step.detail}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* CTAs */}
        <section className="text-center">
          <Link
            href={`/${boutiqueSlug}`}
            className="inline-flex h-[50px] items-center justify-center rounded-[10px] border-[1.5px] border-[#17181a] bg-white px-4 text-[15px] font-semibold text-[#17181a] hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#17181a]/30 sm:w-[230px]"
          >
            Continuer mes achats
          </Link>
        </section>

        {/* Détail replié */}
        <section className="border-t border-[#ececea] pt-4">
          <button
            type="button"
            onClick={() => setDetailOpen((v) => !v)}
            className="flex w-full items-center justify-between text-[14px] font-medium text-[#3c4045] focus:outline-none focus-visible:underline"
            aria-expanded={detailOpen}
          >
            Détail de la commande
            <span className="text-[#8b8f95]">{detailOpen ? '▴' : '▾'}</span>
          </button>
          {detailOpen && (
            <p className="mt-3 text-[13px] leading-relaxed text-[#5f6369]">
              Votre commande {numeroCommande ? (
                <span className="font-mono">{numeroCommande}</span>
              ) : null}{' '}
              est enregistrée. Le suivi se fait uniquement par WhatsApp — aucun
              email ne sera envoyé.
            </p>
          )}
          <p className="mt-3 text-center text-[12.5px] leading-[1.6] text-[#8b8f95]">
            Un souci avec cette commande ? Écrivez au vendeur sur WhatsApp —
            réponse sous 1 h.
          </p>
        </section>
          </>
        )}
      </main>
    </div>
  );
}
