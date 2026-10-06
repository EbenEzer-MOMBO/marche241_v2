'use client';

import { ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { DEGRADE_META } from '@/components/admin/boost/styles';

export interface EtapeVisite {
  /** Valeur de l'attribut data-guide de l'élément à mettre en lumière ; sans cible, carte centrée. */
  cible?: string;
  titre: string;
  texte: ReactNode;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const MARGE = 6;
const LARGEUR_BULLE = 340;
const ECART = 12;

const elementCible = (cible?: string): HTMLElement | null =>
  cible ? document.querySelector<HTMLElement>(`[data-guide="${cible}"]`) : null;

/**
 * Visite guidée maison : assombrit la page, met en lumière l'élément de chaque étape et affiche une
 * bulle d'explication. Passable à tout moment (bouton « Passer » ou Échap) ; flèches ← → pour naviguer.
 * Les étapes dont la cible est absente de la page sont sautées.
 */
export default function VisiteGuidee({
  ouverte,
  etapes,
  libelleFin = 'Terminer',
  onPasser,
  onTerminer
}: {
  ouverte: boolean;
  etapes: EtapeVisite[];
  libelleFin?: string;
  onPasser: () => void;
  onTerminer: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [hauteurBulle, setHauteurBulle] = useState(220);
  const [vue, setVue] = useState({ largeur: 1024, hauteur: 768 });
  const bulle = useRef<HTMLDivElement>(null);
  const focusAvant = useRef<HTMLElement | null>(null);

  // Étapes réellement affichables (cible présente dans la page au moment de l'ouverture)
  const visibles = useMemo(
    () => (ouverte && typeof document !== 'undefined' ? etapes.filter((e) => !e.cible || elementCible(e.cible)) : []),
    [ouverte, etapes]
  );
  const etape = visibles[index];
  const derniere = index === visibles.length - 1;

  useEffect(() => {
    if (ouverte) {
      setIndex(0);
      focusAvant.current = document.activeElement as HTMLElement | null;
    } else {
      focusAvant.current?.focus?.();
    }
  }, [ouverte]);

  const mesurer = useCallback(() => {
    setVue({ largeur: window.innerWidth, hauteur: window.innerHeight });
    const el = elementCible(etape?.cible);
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top - MARGE, left: r.left - MARGE, width: r.width + MARGE * 2, height: r.height + MARGE * 2 });
  }, [etape?.cible]);

  // Amène la cible à l'écran puis suit les défilements (y compris des conteneurs internes) et redimensionnements
  useEffect(() => {
    if (!ouverte || !etape) return;
    elementCible(etape.cible)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    mesurer();
    const timers = [120, 300, 600].map((d) => window.setTimeout(mesurer, d));
    window.addEventListener('resize', mesurer);
    window.addEventListener('scroll', mesurer, true);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', mesurer);
      window.removeEventListener('scroll', mesurer, true);
    };
  }, [ouverte, etape, mesurer]);

  useLayoutEffect(() => {
    if (bulle.current) setHauteurBulle(bulle.current.offsetHeight);
    bulle.current?.focus();
  }, [index, ouverte, rect === null]);

  const suivant = useCallback(() => (derniere ? onTerminer() : setIndex((i) => i + 1)), [derniere, onTerminer]);
  const precedent = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  useEffect(() => {
    if (!ouverte) return;
    const clavier = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onPasser();
      else if (e.key === 'ArrowRight') suivant();
      else if (e.key === 'ArrowLeft') precedent();
    };
    window.addEventListener('keydown', clavier);
    return () => window.removeEventListener('keydown', clavier);
  }, [ouverte, onPasser, suivant, precedent]);

  if (!ouverte || !etape || typeof document === 'undefined') return null;

  const mobile = vue.largeur < 640;
  const largeur = Math.min(LARGEUR_BULLE, vue.largeur - 32);
  let position: React.CSSProperties;
  if (mobile) {
    position = { left: 12, right: 12, bottom: 12 };
  } else if (rect) {
    const enDessous = rect.top + rect.height + ECART + hauteurBulle <= vue.hauteur - 16;
    const top = enDessous ? rect.top + rect.height + ECART : Math.max(16, rect.top - ECART - hauteurBulle);
    const left = Math.min(Math.max(16, rect.left + rect.width / 2 - largeur / 2), vue.largeur - largeur - 16);
    position = { top, left, width: largeur };
  } else {
    position = { top: Math.max(16, (vue.hauteur - hauteurBulle) / 2), left: (vue.largeur - largeur) / 2, width: largeur };
  }

  return createPortal(
    <div className="fixed inset-0 z-[70]" aria-live="polite">
      {/* Voile : tout le fond si carte centrée, sinon une découpe autour de la cible */}
      {rect ? (
        <div
          className="pointer-events-none fixed rounded-xl transition-all duration-200"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            boxShadow: '0 0 0 9999px rgba(17, 24, 39, 0.6)'
          }}
        >
          <div
            className="absolute -inset-[3px] rounded-[14px]"
            style={{
              background: DEGRADE_META,
              WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              padding: 3
            }}
          />
        </div>
      ) : (
        <div className="fixed inset-0 bg-gray-900/60" />
      )}

      <div
        ref={bulle}
        role="dialog"
        aria-modal="true"
        aria-labelledby="visite-titre"
        tabIndex={-1}
        className="fixed rounded-2xl bg-white p-4 shadow-2xl outline-none sm:p-5"
        style={position}
      >
        <div className="mb-3 h-1 w-full rounded-full" style={{ background: DEGRADE_META }} />
        <div className="flex items-start justify-between gap-3">
          <h2 id="visite-titre" className="text-base font-semibold text-gray-900">
            {etape.titre}
          </h2>
          <button
            type="button"
            onClick={onPasser}
            aria-label="Fermer la présentation"
            className="-mr-1 -mt-1 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-1.5 text-sm leading-relaxed text-gray-600">{etape.texte}</div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <button type="button" onClick={onPasser} className="text-sm text-gray-500 hover:text-gray-900">
              Passer
            </button>
            <span className="text-xs text-gray-400">
              {index + 1}/{visibles.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {index > 0 && (
              <button
                type="button"
                onClick={precedent}
                aria-label="Étape précédente"
                className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={suivant}
              className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
              style={{ background: DEGRADE_META }}
            >
              {derniere ? libelleFin : 'Suivant'}
              {!derniere && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
