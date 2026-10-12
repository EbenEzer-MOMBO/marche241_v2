'use client';

import { useEffect, useState } from 'react';
import { BadgeCheck, MessageSquareText } from 'lucide-react';
import { Etoiles } from './Etoiles';
import { AVIS_PAR_PAGE, getAvisProduit, type Pagination } from '@/lib/services/avis';
import type { AvisPublic, ResumeAvisProduit } from '@/lib/database-types';

/** Première page des avis chargée côté serveur (évite une seconde requête dans le navigateur). */
export interface AvisInitiaux {
  avis: AvisPublic[];
  resume: ResumeAvisProduit;
  pagination: Pagination;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

const formatNote = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

interface AvisProduitSectionProps {
  produitId: number;
  boutiqueNom: string;
  initial?: AvisInitiaux | null;
}

/**
 * Section « Avis clients » de la fiche produit : avis vérifiés par achat et approuvés par l'équipe.
 * La moyenne n'est affichée qu'à partir du seuil fixé par l'équipe (3 avis par défaut).
 */
export function AvisProduitSection({ produitId, boutiqueNom, initial = null }: AvisProduitSectionProps) {
  const [avis, setAvis] = useState<AvisPublic[]>(initial?.avis ?? []);
  const [resume, setResume] = useState<ResumeAvisProduit | null>(initial?.resume ?? null);
  const [pagination, setPagination] = useState<Pagination | null>(initial?.pagination ?? null);
  const [chargement, setChargement] = useState(!initial);
  const [chargementSuite, setChargementSuite] = useState(false);
  const [erreur, setErreur] = useState(false);
  const [erreurSuite, setErreurSuite] = useState(false);

  useEffect(() => {
    if (initial) return;
    let annule = false;
    setChargement(true);
    setErreur(false);
    getAvisProduit(produitId, 1, AVIS_PAR_PAGE)
      .then((r) => {
        if (annule) return;
        setAvis(r.avis);
        setResume(r.resume);
        setPagination(r.pagination);
      })
      .catch(() => {
        if (!annule) setErreur(true);
      })
      .finally(() => {
        if (!annule) setChargement(false);
      });
    return () => {
      annule = true;
    };
  }, [produitId, initial]);

  const voirPlus = async () => {
    if (!pagination) return;
    setChargementSuite(true);
    setErreurSuite(false);
    try {
      const r = await getAvisProduit(produitId, pagination.page + 1, AVIS_PAR_PAGE);
      setAvis((prev) => [...prev, ...r.avis]);
      setPagination(r.pagination);
    } catch {
      setErreurSuite(true);
    } finally {
      setChargementSuite(false);
    }
  };

  const total = pagination?.total ?? resume?.nombre_avis ?? 0;

  return (
    <section id="avis" aria-labelledby="titre-avis" className="scroll-mt-24 border-t border-[#f0efec] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="titre-avis" className="text-[18px] font-semibold tracking-[-0.01em] text-[#17181a] sm:text-[20px]">
            Avis clients{total > 0 ? <span className="ml-1.5 font-mono text-[14px] font-medium text-[#8b8f95]">({total})</span> : null}
          </h2>
          <p className="inline-flex items-center gap-1.5 text-[12.5px] text-[#5f6369]">
            <BadgeCheck className="h-4 w-4 text-[#508e27]" aria-hidden="true" />
            Uniquement des acheteurs vérifiés
          </p>
        </div>

        {chargement ? (
          <div className="mt-5 space-y-4" aria-busy="true" aria-label="Chargement des avis">
            {[0, 1].map((i) => (
              <div key={i} className="animate-pulse rounded-xl border border-[#f0efec] p-4">
                <div className="h-3.5 w-24 rounded bg-[#efeeea]" />
                <div className="mt-3 h-3 w-full rounded bg-[#f3f2ef]" />
                <div className="mt-2 h-3 w-2/3 rounded bg-[#f3f2ef]" />
              </div>
            ))}
          </div>
        ) : erreur ? (
          <p className="mt-5 rounded-xl bg-[#faf9f7] px-4 py-5 text-center text-[13.5px] text-[#5f6369]">
            Les avis ne peuvent pas être affichés pour le moment.
          </p>
        ) : avis.length === 0 ? (
          <div className="mt-5 flex flex-col items-center rounded-xl bg-[#faf9f7] px-4 py-8 text-center">
            <MessageSquareText className="h-7 w-7 text-[#b5b3ad]" aria-hidden="true" />
            <p className="mt-2 text-[14px] font-medium text-[#17181a]">Aucun avis pour le moment</p>
            <p className="mt-1 max-w-sm text-[13px] leading-[1.5] text-[#8b8f95]">
              Après votre livraison, vous recevrez un lien sur WhatsApp pour donner votre avis.
            </p>
          </div>
        ) : (
          <>
            {resume?.afficher_note && (
              <div className="mt-5 flex flex-col gap-5 rounded-xl bg-[#faf9f7] p-4 sm:flex-row sm:items-center sm:gap-8 sm:p-5">
                <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-1">
                  <span className="text-[36px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-[#17181a]">
                    {formatNote(resume.note_moyenne)}
                  </span>
                  <div>
                    <Etoiles note={resume.note_moyenne} taille={17} />
                    <p className="mt-0.5 text-[12.5px] text-[#8b8f95]">
                      {resume.nombre_avis} avis
                    </p>
                  </div>
                </div>
                <ul className="flex-1 space-y-1.5" aria-label="Répartition des notes">
                  {[5, 4, 3, 2, 1].map((n) => {
                    const nb = resume.repartition[n as 1 | 2 | 3 | 4 | 5] ?? 0;
                    const pct = resume.nombre_avis ? Math.round((nb / resume.nombre_avis) * 100) : 0;
                    return (
                      <li key={n} className="flex items-center gap-2 text-[12.5px] text-[#5f6369]">
                        <span className="w-3 font-mono">{n}</span>
                        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e9e7e2]">
                          <span className="block h-full rounded-full bg-[#f5a524]" style={{ width: `${pct}%` }} />
                        </span>
                        <span className="w-6 text-right font-mono">{nb}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <ul className="mt-5 divide-y divide-[#f0efec]">
              {avis.map((a) => (
                <li key={a.id} className="py-4 first:pt-0">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <Etoiles note={a.note} taille={14} />
                    <span className="text-[13.5px] font-medium text-[#17181a]">{a.auteur}</span>
                    {a.achat_verifie && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#eef6e8] px-2 py-0.5 text-[11.5px] font-medium text-[#3f7420]">
                        <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        Achat vérifié
                      </span>
                    )}
                    <span className="text-[12px] text-[#9a9892]">{formatDate(a.date_creation)}</span>
                  </div>
                  {a.commentaire && (
                    <p className="mt-2 whitespace-pre-line break-words text-[14px] leading-[1.6] text-[#33363b]">{a.commentaire}</p>
                  )}
                  {a.reponse_vendeur && (
                    <div className="mt-3 rounded-lg border-l-2 border-[#d9d7d1] bg-[#faf9f7] px-3.5 py-2.5">
                      <p className="text-[12px] font-semibold text-[#17181a]">Réponse de {boutiqueNom}</p>
                      <p className="mt-1 whitespace-pre-line break-words text-[13.5px] leading-[1.55] text-[#5f6369]">
                        {a.reponse_vendeur}
                      </p>
                    </div>
                  )}
                </li>
              ))}
            </ul>

            {pagination && pagination.page < pagination.pages && (
              <button
                type="button"
                onClick={voirPlus}
                disabled={chargementSuite}
                className="mt-2 h-11 w-full rounded-xl border border-[#e4e2dd] text-[14px] font-medium text-[#17181a] transition-colors hover:bg-[#faf9f7] disabled:opacity-60"
              >
                {chargementSuite ? 'Chargement…' : `Voir plus d'avis (${pagination.total - avis.length})`}
              </button>
            )}
            {erreurSuite && (
              <p role="alert" className="mt-2 text-center text-[13px] text-[#b3261e]">
                Les avis suivants n&apos;ont pas pu être chargés. Réessayez.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}

/** Note compacte sous le titre du produit (lien vers la section). Rien sous le seuil d'affichage. */
export function NoteProduitCompacte({ resume }: { resume: ResumeAvisProduit | null | undefined }) {
  if (!resume?.afficher_note) return null;
  return (
    <a
      href="#avis"
      className="mt-1.5 inline-flex items-center gap-1.5 text-[13px] text-[#5f6369] hover:underline focus:outline-none focus-visible:underline"
    >
      <Etoiles note={resume.note_moyenne} taille={14} />
      <span className="font-mono font-medium text-[#17181a]">{formatNote(resume.note_moyenne)}</span>
      <span>({resume.nombre_avis} avis)</span>
    </a>
  );
}
