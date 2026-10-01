'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarX, Search, X } from 'lucide-react';
import { LandingHeader } from '@/components/landing/LandingHeader';
import Footer from '@/components/Footer';
import { ErrorState } from '@/components/LoadingStates';
import { EvenementAffiche, EvenementDateBlock } from '@/components/evenements/EvenementVisuels';
import { useEvenementsAVenir } from '@/hooks/useEvenementsAVenir';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import {
  estCeWeekEnd,
  formatPrixEvenement,
  LIBELLES_CATEGORIE_EVENEMENT,
  type CategorieEvenement,
  type EvenementPublic,
} from '@/lib/services/evenements';

type Filtre = 'tout' | 'weekend' | 'gratuit' | CategorieEvenement;
type Tri = 'date' | 'prix';

const CHIPS_CATEGORIES: Array<{ id: CategorieEvenement; label: string }> = [
  { id: 'concert', label: 'Concerts' },
  { id: 'soiree', label: 'Soirées' },
  { id: 'salon', label: 'Salons & conférences' },
  { id: 'spectacle', label: 'Spectacles' },
];

const correspondAuFiltre = (evenement: EvenementPublic, filtre: Filtre) => {
  if (filtre === 'tout') return true;
  if (filtre === 'weekend') return estCeWeekEnd(evenement.date);
  if (filtre === 'gratuit') return evenement.gratuit;
  return evenement.categorie === filtre;
};

const normaliser = (texte: string) =>
  texte.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const correspondALaRecherche = (evenement: EvenementPublic, recherche: string) => {
  if (!recherche) return true;
  const cible = normaliser(
    [
      evenement.nom,
      evenement.lieu,
      evenement.organisateur,
      evenement.categorie && LIBELLES_CATEGORIE_EVENEMENT[evenement.categorie],
    ]
      .filter(Boolean)
      .join(' ')
  );
  return normaliser(recherche)
    .split(/\s+/)
    .every((mot) => cible.includes(mot));
};

/** Événement « à la une » : mis en avant par le vendeur, sinon le plus proche avec affiche. */
const choisirALaUne = (evenements: EvenementPublic[]) =>
  evenements.find((e) => e.misEnAvant && e.image && !e.complet) ??
  evenements.find((e) => e.image && !e.complet) ??
  evenements[0];

const BoutonReserver = ({ complet, className = '' }: { complet: boolean; className?: string }) => (
  <span
    className={`flex-none whitespace-nowrap rounded-[10px] font-bold text-white ${
      complet ? 'bg-gray-300' : 'bg-gradient-to-r from-[#508e27] to-[#74adaf]'
    } ${className}`}
  >
    {complet ? 'Complet' : 'Réserver'}
  </span>
);

const PrixDes = ({ evenement }: { evenement: EvenementPublic }) =>
  evenement.gratuit ? (
    <strong className="text-gray-900">Gratuit</strong>
  ) : (
    <>
      dès <strong className="text-gray-900">{formatPrixEvenement(evenement.prixMin)}</strong>
    </>
  );

const AlerteStock = ({ evenement }: { evenement: EvenementPublic }) =>
  evenement.placesRestantes ? (
    <span className="text-xs font-semibold text-amber-700">
      Plus que {evenement.placesRestantes} place{evenement.placesRestantes > 1 ? 's' : ''}
    </span>
  ) : null;

const CarteGrille = ({ evenement }: { evenement: EvenementPublic }) => (
  <Link
    href={evenement.href}
    className="group flex flex-col overflow-hidden rounded-[14px] border border-gray-200 transition-shadow hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
  >
    <div className="relative h-[170px] overflow-hidden">
      <EvenementAffiche evenement={evenement} />
      <EvenementDateBlock evenement={evenement} size="sm" />
      {evenement.categorie && (
        <span className="absolute right-2.5 top-2.5 rounded-full bg-gray-900/80 px-2.5 py-1 text-[11px] font-semibold text-white">
          {LIBELLES_CATEGORIE_EVENEMENT[evenement.categorie]}
        </span>
      )}
    </div>
    <div className="flex flex-1 flex-col gap-1.5 p-3.5">
      <span className="line-clamp-2 text-base font-bold leading-tight text-gray-900">
        {evenement.nom}
      </span>
      <span className="text-[13px] text-gray-500">
        {evenement.quand}
        {evenement.lieu && ` · ${evenement.lieu}`}
      </span>
      <AlerteStock evenement={evenement} />
      <div className="mt-auto flex items-center justify-between gap-2.5 border-t border-gray-100 pt-2">
        <span className="whitespace-nowrap text-sm text-gray-600">
          <PrixDes evenement={evenement} />
        </span>
        <BoutonReserver complet={evenement.complet} className="px-3.5 py-[9px] text-[13px]" />
      </div>
    </div>
  </Link>
);

const LigneMobile = ({ evenement }: { evenement: EvenementPublic }) => (
  <Link
    href={evenement.href}
    className="flex gap-3 rounded-[14px] border border-gray-200 p-2.5"
  >
    <div className="relative h-28 w-24 flex-none overflow-hidden rounded-[10px]">
      <EvenementAffiche evenement={evenement} />
    </div>
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="text-xs font-bold uppercase tracking-[0.04em] text-[#508e27]">
        {evenement.jour} {evenement.mois} · {evenement.quand.split(' · ').pop()}
      </span>
      <span className="line-clamp-2 text-[15px] font-bold leading-tight text-gray-900">
        {evenement.nom}
      </span>
      {evenement.lieu && <span className="truncate text-xs text-gray-500">{evenement.lieu}</span>}
      <AlerteStock evenement={evenement} />
      <div className="mt-auto flex items-center justify-between gap-2">
        <span className="whitespace-nowrap text-[13px] text-gray-600">
          <PrixDes evenement={evenement} />
        </span>
        <BoutonReserver complet={evenement.complet} className="px-3 py-[7px] text-xs" />
      </div>
    </div>
  </Link>
);

const ALaUne = ({ evenement }: { evenement: EvenementPublic }) => (
  <Link
    href={evenement.href}
    className="group flex overflow-hidden rounded-[18px] bg-[#0b0f0c]"
  >
    <div className="relative h-[340px] w-[46%] max-w-[560px] flex-none overflow-hidden bg-[#0b1a2a]">
      <EvenementAffiche evenement={evenement} tone="dark" />
      <span className="absolute left-4 top-4 rounded-full bg-white px-[11px] py-[5px] text-xs font-bold text-[#3f7020]">
        À la une
      </span>
    </div>
    <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-10 py-9">
      <span className="text-[13px] font-bold uppercase tracking-[0.06em] text-[#a9d3d4]">
        {evenement.dateLongue}
      </span>
      <span className="line-clamp-2 text-4xl font-extrabold leading-[1.05] tracking-[-0.02em] text-white">
        {evenement.nom}
      </span>
      <span className="text-[15px] text-gray-300">
        {[evenement.lieu, evenement.organisateur && `organisé par ${evenement.organisateur}`]
          .filter(Boolean)
          .join(' · ')}
      </span>
      {evenement.tarifs.length > 0 && (
        <div className="flex flex-wrap gap-2.5">
          {evenement.tarifs.slice(0, 4).map((tarif) => (
            <span
              key={tarif.nom}
              className="whitespace-nowrap rounded-[9px] border border-white/15 bg-white/[0.08] px-3 py-[7px] text-[13px] text-gray-200"
            >
              {tarif.nom} {formatPrixEvenement(tarif.prix)}
            </span>
          ))}
        </div>
      )}
      <div className="mt-auto flex items-center gap-[18px]">
        <span
          className={`inline-flex flex-none items-center gap-2.5 whitespace-nowrap rounded-[13px] px-7 py-4 text-[17px] font-bold text-white ${
            evenement.complet
              ? 'bg-gray-600'
              : 'bg-gradient-to-r from-[#508e27] to-[#74adaf] shadow-[0_12px_30px_rgba(80,142,39,0.4)] group-hover:opacity-95'
          }`}
        >
          {evenement.complet ? 'Complet' : 'Réserver mon billet'}
          {!evenement.complet && <ArrowRight className="h-5 w-5" />}
        </span>
        {evenement.placesRestantes && (
          <span className="text-sm font-semibold text-amber-400">
            Plus que {evenement.placesRestantes} place{evenement.placesRestantes > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  </Link>
);

const SquelettePage = () => (
  <div className="flex flex-col gap-5 animate-pulse" aria-hidden>
    <div className="hidden h-[340px] rounded-[18px] bg-gray-100 md:block" />
    <div className="grid grid-cols-1 gap-3 md:grid-cols-4 md:gap-5">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-[132px] rounded-[14px] bg-gray-100 md:h-[300px]" />
      ))}
    </div>
  </div>
);

const REASSURANCES = [
  { titre: 'Paiement Mobile Money', texte: 'Airtel Money ou Moov Money, sans carte bancaire.' },
  { titre: 'Billet sur WhatsApp', texte: 'QR code reçu en quelques secondes, aussi par email.' },
  {
    titre: 'Entrée scannée',
    texte: 'Chaque billet n’est valable qu’une fois : pas de faux billets.',
  },
];

export default function EvenementsClient() {
  const { evenements, isLoading, error } = useEvenementsAVenir();
  const [filtre, setFiltre] = useState<Filtre>('tout');
  const [tri, setTri] = useState<Tri>('date');
  const [recherche, setRecherche] = useState('');
  const rechercheDebounced = useDebouncedValue(recherche.trim(), 250);

  const chips = useMemo(() => {
    const compter = (f: Filtre) => evenements.filter((e) => correspondAuFiltre(e, f)).length;
    const weekend = compter('weekend');
    const gratuit = compter('gratuit');
    return [
      { id: 'tout' as Filtre, label: 'Tout', count: evenements.length },
      ...(weekend > 0 ? [{ id: 'weekend' as Filtre, label: 'Ce week-end', count: weekend }] : []),
      ...CHIPS_CATEGORIES.map((c) => ({ id: c.id as Filtre, label: c.label, count: compter(c.id) })).filter(
        (c) => c.count > 0
      ),
      ...(gratuit > 0 ? [{ id: 'gratuit' as Filtre, label: 'Gratuit', count: gratuit }] : []),
    ];
  }, [evenements]);

  const resultats = useMemo(() => {
    const filtres = evenements.filter(
      (e) => correspondAuFiltre(e, filtre) && correspondALaRecherche(e, rechercheDebounced)
    );
    if (tri === 'prix') {
      return [...filtres].sort((a, b) => a.prixMin - b.prixMin || a.date.getTime() - b.date.getTime());
    }
    return filtres;
  }, [evenements, filtre, tri, rechercheDebounced]);

  const aLaUne = resultats.length > 1 ? choisirALaUne(resultats) : undefined;
  const grille = aLaUne ? resultats.filter((e) => e.id !== aLaUne.id) : resultats;
  const filtreActif = filtre !== 'tout' || Boolean(rechercheDebounced);

  const reinitialiser = () => {
    setFiltre('tout');
    setRecherche('');
  };

  return (
    <div className="min-h-screen bg-white pb-[88px] md:pb-0">
      <LandingHeader activePage="evenements" />

      <main className="pt-[68px]">
        <section className="border-b border-gray-200 bg-gray-50">
          <div className="container mx-auto px-4 pb-3 pt-[18px] lg:px-10 lg:pb-5 lg:pt-[26px]">
            <div className="mx-auto flex max-w-[1360px] flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
              <div className="flex flex-col gap-1.5">
                <h1 className="text-[23px] font-bold tracking-[-0.02em] text-gray-900 lg:text-[30px]">
                  <span className="lg:hidden">Événements à venir</span>
                  <span className="hidden lg:inline">Événements à venir au Gabon</span>
                </h1>
                <span className="hidden text-[15px] text-gray-600 lg:block">
                  Paiement Airtel / Moov Money · billet QR code par email et WhatsApp
                </span>
              </div>
              <form
                role="search"
                className="flex gap-2.5 lg:w-[560px] lg:flex-none"
                onSubmit={(event) => event.preventDefault()}
              >
                <label className="flex h-[46px] flex-1 items-center gap-2.5 rounded-xl border border-gray-300 bg-white px-3.5 focus-within:border-[#508e27] focus-within:ring-2 focus-within:ring-[#508e27]/20 lg:h-[50px] lg:px-4">
                  <Search className="h-4 w-4 flex-none text-gray-400" aria-hidden />
                  <span className="sr-only">Rechercher un événement</span>
                  <input
                    type="search"
                    value={recherche}
                    onChange={(event) => setRecherche(event.target.value)}
                    placeholder="Artiste, lieu, type de soirée…"
                    className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 lg:text-[15px]"
                  />
                  {recherche && (
                    <button
                      type="button"
                      onClick={() => setRecherche('')}
                      className="text-gray-400 hover:text-gray-700"
                      aria-label="Effacer la recherche"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </label>
                <button
                  type="submit"
                  className="hidden h-[50px] w-[120px] items-center justify-center rounded-xl bg-gradient-to-r from-[#508e27] to-[#74adaf] text-[15px] font-semibold text-white lg:flex"
                >
                  Rechercher
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="border-b border-gray-200">
          <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3 lg:px-10 lg:py-3.5">
            <div className="mx-auto flex w-full max-w-[1360px] items-center justify-between gap-4">
              <div className="-mr-4 flex gap-2 overflow-x-auto pr-4 [scrollbar-width:none] lg:mr-0 lg:pr-0">
                {chips.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setFiltre(chip.id)}
                    aria-pressed={filtre === chip.id}
                    className={`flex-none whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] transition-colors ${
                      filtre === chip.id
                        ? 'bg-gray-900 font-semibold text-white'
                        : 'border border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {chip.label}
                    {!isLoading && (chip.id === 'tout' || chip.id === 'weekend') && ` (${chip.count})`}
                  </button>
                ))}
              </div>
              <label className="hidden flex-none items-center gap-2.5 rounded-[10px] border border-gray-300 px-3.5 py-2 text-[13px] lg:flex">
                <span className="text-gray-500">Trier :</span>
                <select
                  value={tri}
                  onChange={(event) => setTri(event.target.value as Tri)}
                  className="cursor-pointer bg-transparent font-semibold text-gray-900 outline-none"
                >
                  <option value="date">Date la plus proche</option>
                  <option value="prix">Prix le plus bas</option>
                </select>
              </label>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 pb-8 pt-3.5 lg:px-10 lg:pb-10 lg:pt-7">
          <div className="mx-auto flex max-w-[1360px] flex-col gap-8">
            {isLoading ? (
              <SquelettePage />
            ) : error ? (
              <ErrorState message={error} onRetry={() => window.location.reload()} />
            ) : resultats.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-[14px] border border-dashed border-gray-300 px-6 py-14 text-center">
                <CalendarX className="h-8 w-8 text-gray-400" aria-hidden />
                <p className="text-base font-semibold text-gray-900">
                  {filtreActif ? 'Aucun événement ne correspond' : 'Aucun événement à venir pour le moment'}
                </p>
                <p className="max-w-md text-sm text-gray-500">
                  {filtreActif
                    ? 'Essayez un autre mot-clé ou un autre filtre.'
                    : 'Revenez bientôt : les organisateurs publient régulièrement de nouvelles dates.'}
                </p>
                {filtreActif && (
                  <button
                    type="button"
                    onClick={reinitialiser}
                    className="mt-1 text-sm font-semibold text-[#508e27] hover:text-[#3f7020]"
                  >
                    Voir tous les événements
                  </button>
                )}
              </div>
            ) : (
              <>
                {aLaUne && (
                  <div className="hidden md:block">
                    <ALaUne evenement={aLaUne} />
                  </div>
                )}

                <div className="hidden flex-col gap-[18px] md:flex">
                  {grille.length > 0 && (
                    <>
                      <h2 className="text-lg font-bold text-gray-900">Prochainement</h2>
                      <div className="grid grid-cols-2 gap-5 lg:grid-cols-3 xl:grid-cols-4">
                        {grille.map((evenement) => (
                          <CarteGrille key={evenement.id} evenement={evenement} />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex flex-col gap-3 md:hidden">
                  {resultats.map((evenement) => (
                    <LigneMobile key={evenement.id} evenement={evenement} />
                  ))}
                </div>
              </>
            )}

            <div className="grid grid-cols-1 gap-4 rounded-[14px] border border-gray-200 bg-gray-50 p-5 md:grid-cols-3 md:gap-5 md:p-6">
              {REASSURANCES.map((item) => (
                <div key={item.titre} className="flex flex-col gap-1">
                  <span className="text-[15px] font-bold text-gray-900">{item.titre}</span>
                  <span className="text-sm leading-normal text-gray-600">{item.texte}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="hidden bg-gradient-to-r from-[#508e27] to-[#74adaf] md:block">
          <div className="container mx-auto flex items-center justify-between gap-10 px-4 py-10 lg:px-10">
            <div className="flex flex-col gap-2">
              <h2 className="text-[30px] font-extrabold tracking-[-0.02em] text-white">
                Vous organisez un événement ?
              </h2>
              <p className="text-base text-white">
                Mettez vos billets en vente aujourd&apos;hui, encaissez en Mobile Money, scannez les
                entrées depuis votre téléphone.
              </p>
            </div>
            <Link
              href="/admin/register"
              className="inline-flex flex-none items-center gap-2.5 rounded-[13px] bg-white px-7 py-[17px] text-[17px] font-bold text-[#3f7020] shadow-[0_12px_28px_rgba(0,0,0,0.16)] transition-opacity hover:opacity-95"
            >
              Créer mon événement
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />

      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2.5 border-t border-gray-200 bg-white px-4 pb-[18px] pt-3 shadow-[0_-8px_20px_rgba(0,0,0,0.06)] md:hidden">
        <div className="flex flex-1 flex-col">
          <span className="text-[13px] font-semibold text-gray-900">Vous organisez ?</span>
          <span className="text-xs text-gray-500">Billetterie + scan des entrées</span>
        </div>
        <Link
          href="/admin/register"
          className="rounded-[11px] border border-[#508e27] px-4 py-3 text-sm font-bold text-[#508e27]"
        >
          Créer mon événement
        </Link>
      </div>
    </div>
  );
}
