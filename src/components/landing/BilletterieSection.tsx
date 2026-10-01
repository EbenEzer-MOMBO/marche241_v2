'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { EvenementAffiche, EvenementDateBlock } from '@/components/evenements/EvenementVisuels';
import { useEvenementsAVenir } from '@/hooks/useEvenementsAVenir';
import {
  formatPrixEvenement,
  LIBELLES_CATEGORIE_EVENEMENT,
  type EvenementPublic,
} from '@/lib/services/evenements';

const NB_EVENEMENTS_ACCUEIL = 3;

const CarteEvenementSombre = ({ evenement }: { evenement: EvenementPublic }) => (
  <Link
    href={evenement.href}
    className="group flex w-[250px] flex-none snap-start flex-col overflow-hidden rounded-[14px] border border-white/10 bg-[#141a16] transition-colors hover:border-white/25 md:w-auto md:rounded-2xl"
  >
    <div className="relative h-[140px] overflow-hidden md:h-[170px]">
      <EvenementAffiche evenement={evenement} tone="dark" />
      <EvenementDateBlock evenement={evenement} />
      {evenement.categorie && (
        <span className="absolute right-3 top-3 hidden rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white md:inline">
          {LIBELLES_CATEGORIE_EVENEMENT[evenement.categorie]}
        </span>
      )}
    </div>
    <div className="flex flex-col gap-1.5 p-3.5 md:px-[18px] md:pb-[18px] md:pt-4">
      <span className="line-clamp-2 text-base font-bold leading-tight text-white md:text-[17px]">
        {evenement.nom}
      </span>
      <span className="text-xs text-gray-400 md:text-[13px]">
        <span className="hidden md:inline">{evenement.quand} · </span>
        {evenement.lieu ?? evenement.organisateur}
        <span className="md:hidden">
          {' · '}
          {evenement.gratuit ? 'Gratuit' : `dès ${formatPrixEvenement(evenement.prixMin)}`}
        </span>
      </span>
      <div className="mt-1 hidden items-center justify-between border-t border-white/10 pt-2.5 md:flex">
        <span className="text-sm text-gray-300">
          {evenement.gratuit ? (
            <strong className="text-white">Gratuit</strong>
          ) : (
            <>
              dès <strong className="text-white">{formatPrixEvenement(evenement.prixMin)}</strong>
            </>
          )}
        </span>
        <span className="text-[13px] font-semibold text-[#a9d3d4] group-hover:text-white">
          {evenement.complet ? 'Complet' : 'Réserver →'}
        </span>
      </div>
    </div>
  </Link>
);

const CarteChargement = () => (
  <div
    aria-hidden
    className="flex w-[250px] flex-none animate-pulse flex-col overflow-hidden rounded-[14px] border border-white/10 bg-[#141a16] md:w-auto md:rounded-2xl"
  >
    <div className="h-[140px] bg-white/5 md:h-[170px]" />
    <div className="flex flex-col gap-2 p-3.5 md:p-[18px]">
      <div className="h-4 w-3/4 rounded bg-white/10" />
      <div className="h-3 w-1/2 rounded bg-white/10" />
    </div>
  </div>
);

/** Aucun événement à venir : la section reste visible pour faire connaître la billetterie. */
const AucunEvenement = () => (
  <div className="rounded-2xl border border-white/15 bg-black/35 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center md:py-16">
      <CalendarDays className="h-8 w-8 text-[#a9d3d4]" aria-hidden />
      <p className="text-lg font-bold text-white md:text-2xl">
        Les prochains événements arrivent bientôt
      </p>
      <p className="max-w-md text-sm leading-relaxed text-gray-200 md:text-[15px]">
        Concerts, soirées et salons seront annoncés ici dès leur ouverture à la réservation.
        Organisateur ? Publiez le vôtre en premier.
      </p>
    </div>
  </div>
);

/**
 * Section billetterie de l'accueil, toujours visible : les 3 prochains événements,
 * ou un état d'attente s'il n'y en a aucun.
 */
export const BilletterieSection: React.FC = () => {
  const { evenements, isLoading } = useEvenementsAVenir();

  const total = evenements.length;
  const aLaUne = evenements.slice(0, NB_EVENEMENTS_ACCUEIL);

  return (
    <section
      id="billetterie"
      className="relative overflow-hidden bg-[#0b0f0c] py-8 lg:py-[72px]"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/billetterie/concert-fond.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 z-0 bg-gradient-to-r from-black/85 via-black/65 to-black/45"
      />
      <div className="container relative z-10 mx-auto px-5 lg:px-10">
        <div className="mx-auto flex max-w-[1160px] flex-col gap-[18px] lg:gap-9">
          <div className="flex flex-col gap-[18px] lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <div className="flex max-w-[620px] flex-col gap-[18px] lg:gap-4">
              <span className="inline-flex items-center gap-2 self-start whitespace-nowrap rounded-full border border-[#74adaf]/40 bg-[#74adaf]/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#a9d3d4] lg:text-xs">
                <span className="h-[7px] w-[7px] rounded-full bg-[#74adaf]" />
                Nouveau · Billetterie
              </span>
              <h2 className="text-[28px] font-extrabold leading-[1.1] tracking-[-0.02em] text-white [text-wrap:balance] lg:text-[40px] lg:leading-[1.08] lg:tracking-[-0.025em]">
                <span className="lg:hidden">Réservez vos billets sur Marché241</span>
                <span className="hidden lg:inline">
                  Concerts, soirées, salons : réservez votre billet sur Marché241
                </span>
              </h2>
              <p className="text-[15px] leading-relaxed text-gray-300 lg:text-[17px]">
                <span className="lg:hidden">
                  Mobile Money, billet QR code reçu sur WhatsApp, scanné à l&apos;entrée.
                </span>
                <span className="hidden lg:inline">
                  Payez en Airtel ou Moov Money, recevez votre billet avec QR code par email et
                  WhatsApp. Il se scanne directement à l&apos;entrée.
                </span>
              </p>
            </div>
            <div className="hidden flex-none flex-col items-end gap-2.5 lg:flex">
              <Link
                href="/evenements"
                className="inline-flex items-center gap-2.5 rounded-[13px] bg-gradient-to-r from-[#508e27] to-[#74adaf] px-[30px] py-[18px] text-lg font-bold text-white shadow-[0_14px_34px_rgba(80,142,39,0.42)] transition-opacity hover:opacity-95"
              >
                Événements à venir
                <ArrowRight className="h-5 w-5" />
              </Link>
              {total > 0 && (
                <span className="text-[13px] text-gray-400">
                  {total} événement{total > 1 ? 's' : ''} à venir
                </span>
              )}
            </div>
          </div>

          {!isLoading && total === 0 ? (
            <AucunEvenement />
          ) : (
            <div className="-mr-5 flex snap-x gap-3 overflow-x-auto pb-1 pr-5 [scrollbar-width:none] md:mr-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:pr-0">
              {isLoading
                ? Array.from({ length: NB_EVENEMENTS_ACCUEIL }).map((_, index) => (
                    <CarteChargement key={index} />
                  ))
                : aLaUne.map((evenement) => (
                    <CarteEvenementSombre key={evenement.id} evenement={evenement} />
                  ))}
            </div>
          )}

          <Link
            href="/evenements"
            className="flex h-14 items-center justify-center gap-2.5 rounded-[13px] bg-gradient-to-r from-[#508e27] to-[#74adaf] text-[17px] font-bold text-white shadow-[0_12px_28px_rgba(80,142,39,0.4)] lg:hidden"
          >
            Événements à venir
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/admin/register"
            className="text-center text-sm font-semibold text-[#a9d3d4] lg:hidden"
          >
            Organiser un événement
          </Link>

          <div className="hidden items-center justify-between gap-6 rounded-[14px] border border-white/10 bg-white/5 px-[22px] py-[18px] lg:flex">
            <span className="text-[15px] text-gray-300">
              Vous organisez un événement ? Créez votre billetterie en ligne, encaissez en Mobile
              Money, scannez les entrées.
            </span>
            <Link
              href="/admin/register"
              className="flex-none rounded-[11px] border border-white/40 px-[18px] py-[11px] text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Organiser un événement
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
