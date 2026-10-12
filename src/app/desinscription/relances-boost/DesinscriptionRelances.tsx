'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, LinkIcon, Loader2, WifiOff } from 'lucide-react';
import { ApiError } from '@/lib/api';
import { getDesinscriptionRelances, majDesinscriptionRelances } from '@/lib/services/boosts';

const VERT = '#508e27';

type Etat =
  | { type: 'chargement' }
  | { type: 'invalide' }
  | { type: 'erreur' }
  | { type: 'pret'; desinscrit: boolean; boutique?: string };

function Coquille({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f6f5f2] px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: VERT }}>
          Marché 241
        </p>
        {children}
      </div>
    </main>
  );
}

export function DesinscriptionRelances() {
  const params = useSearchParams();
  const jeton = params.get('jeton') ?? '';
  const [etat, setEtat] = useState<Etat>({ type: 'chargement' });
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    if (!jeton) {
      setEtat({ type: 'invalide' });
      return;
    }
    let ignore = false;
    setEtat({ type: 'chargement' });
    getDesinscriptionRelances(jeton)
      .then((reponse) => {
        if (!ignore) setEtat({ type: 'pret', desinscrit: reponse.desinscrit, boutique: reponse.boutique });
      })
      .catch((err: unknown) => {
        if (ignore) return;
        if (err instanceof ApiError && err.status === 400) {
          setEtat({ type: 'invalide' });
          return;
        }
        setEtat({ type: 'erreur' });
      });
    return () => {
      ignore = true;
    };
  }, [jeton]);

  const handleChanger = async (desinscrit: boolean) => {
    if (!jeton || etat.type !== 'pret') return;
    setEnvoi(true);
    try {
      const resultat = await majDesinscriptionRelances(jeton, desinscrit);
      setEtat({ type: 'pret', desinscrit: resultat, boutique: etat.boutique });
    } catch {
      setEtat({ type: 'erreur' });
    } finally {
      setEnvoi(false);
    }
  };

  if (etat.type === 'chargement') {
    return (
      <Coquille>
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white px-5 py-10 text-[#5f6369] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          <p>Vérification du lien…</p>
        </div>
      </Coquille>
    );
  }

  if (etat.type === 'invalide') {
    return (
      <Coquille>
        <div className="mt-6 rounded-2xl bg-white px-5 py-10 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:px-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f3f2ef]">
            <LinkIcon className="h-5 w-5 text-[#5f6369]" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-[20px] font-semibold text-[#17181a]">Lien invalide</h1>
          <p className="mx-auto mt-2 max-w-sm text-[14px] leading-[1.6] text-[#5f6369]">
            Ce lien de désinscription n’est plus utilisable. Ouvrez le dernier message reçu, ou gérez les rappels depuis les paramètres de votre espace vendeur.
          </p>
        </div>
      </Coquille>
    );
  }

  if (etat.type === 'erreur') {
    return (
      <Coquille>
        <div className="mt-6 rounded-2xl bg-white px-5 py-10 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:px-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f3f2ef]">
            <WifiOff className="h-5 w-5 text-[#5f6369]" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-[20px] font-semibold text-[#17181a]">Impossible de continuer</h1>
          <p className="mx-auto mt-2 max-w-sm text-[14px] leading-[1.6] text-[#5f6369]">
            La connexion a échoué. Réessayez dans un instant.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg bg-[#17181a] px-4 py-2 text-sm font-medium text-white"
          >
            Réessayer
          </button>
        </div>
      </Coquille>
    );
  }

  const boutique = etat.boutique ? ` pour ${etat.boutique}` : '';

  return (
    <Coquille>
      <div className="mt-6 rounded-2xl bg-white px-5 py-10 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:px-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef6e8]">
          <CheckCircle2 className="h-5 w-5" style={{ color: VERT }} aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-[20px] font-semibold text-[#17181a]">
          {etat.desinscrit ? 'Rappels coupés' : 'Rappels de boosts'}
        </h1>
        <p
          className="mx-auto mt-2 max-w-sm text-[14px] leading-[1.6] text-[#5f6369]"
          aria-live="polite"
        >
          {etat.desinscrit
            ? `Vous ne recevrez plus de rappels WhatsApp ni d’e-mails${boutique} pour les boosts non finalisés.`
            : `Vous recevez encore des rappels WhatsApp et e-mail${boutique} lorsque des boosts restent à finaliser.`}
        </p>
        <div className="mt-6">
          {etat.desinscrit ? (
            <button
              type="button"
              disabled={envoi}
              onClick={() => handleChanger(false)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              style={{ backgroundColor: VERT }}
            >
              {envoi ? 'Enregistrement…' : 'Me réinscrire'}
            </button>
          ) : (
            <button
              type="button"
              disabled={envoi}
              onClick={() => handleChanger(true)}
              className="rounded-lg border border-[#d9d7d2] bg-white px-4 py-2 text-sm font-medium text-[#17181a] disabled:opacity-60"
            >
              {envoi ? 'Enregistrement…' : 'Ne plus recevoir ces rappels'}
            </button>
          )}
        </div>
      </div>
    </Coquille>
  );
}
