'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Script from 'next/script';
import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, CheckCircle2, Clock3, LinkIcon, ShieldCheck, WifiOff } from 'lucide-react';
import { SelecteurEtoiles } from './Etoiles';
import { AvisErreur, getInvitationAvis, soumettreAvis, type ResultatSoumissionAvis } from '@/lib/services/avis';
import type { InvitationAvisPublique } from '@/lib/database-types';

type Etat =
  | { type: 'chargement' }
  | { type: 'invalide' }
  | { type: 'desactive' }
  | { type: 'erreur_reseau' }
  | { type: 'formulaire'; invitation: InvitationAvisPublique; longueurMax: number }
  | { type: 'merci'; invitation: InvitationAvisPublique; resultat: ResultatSoumissionAvis };

interface Saisie {
  note: number;
  commentaire: string;
}

const VERT = '#508e27';

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

function Message({
  icone,
  titre,
  texte,
  action,
}: {
  icone: React.ReactNode;
  titre: string;
  texte: string;
  action?: React.ReactNode;
}) {
  return (
    <Coquille>
      <div className="mt-6 rounded-2xl bg-white px-5 py-10 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:px-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f3f2ef]">{icone}</div>
        <h1 className="mt-4 text-[20px] font-semibold text-[#17181a]">{titre}</h1>
        <p className="mx-auto mt-2 max-w-sm text-[14px] leading-[1.6] text-[#5f6369]">{texte}</p>
        {action && <div className="mt-6">{action}</div>}
      </div>
    </Coquille>
  );
}

export function AvisInvitationClient({ jeton }: { jeton: string }) {
  const [etat, setEtat] = useState<Etat>({ type: 'chargement' });
  const [saisies, setSaisies] = useState<Record<number, Saisie>>({});
  const [siteWeb, setSiteWeb] = useState(''); // pot de miel
  const [envoi, setEnvoi] = useState(false);
  const [erreurEnvoi, setErreurEnvoi] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const debutRef = useRef<number>(Date.now());
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const charger = () => {
    setEtat({ type: 'chargement' });
    getInvitationAvis(jeton)
      .then(({ invitation, longueurMax }) => {
        debutRef.current = Date.now();
        setEtat({ type: 'formulaire', invitation, longueurMax });
      })
      .catch((err: unknown) => {
        if (err instanceof AvisErreur && err.code === 'AVIS_DESACTIVES') setEtat({ type: 'desactive' });
        else if (err instanceof AvisErreur && (err.status === 404 || err.status === 400)) setEtat({ type: 'invalide' });
        else setEtat({ type: 'erreur_reseau' });
      });
  };

  useEffect(charger, [jeton]); // eslint-disable-line react-hooks/exhaustive-deps

  // Widget Turnstile (même intégration que le checkout)
  const formulaireVisible = etat.type === 'formulaire';
  useEffect(() => {
    if (!formulaireVisible || !siteKey) return;
    const intervalle = setInterval(() => {
      const ts = (window as unknown as { turnstile?: { render: (el: HTMLElement, o: object) => string } }).turnstile;
      if (ts && turnstileRef.current && !widgetIdRef.current) {
        clearInterval(intervalle);
        try {
          widgetIdRef.current = ts.render(turnstileRef.current, {
            sitekey: siteKey,
            callback: (t: string) => setTurnstileToken(t),
            'expired-callback': () => setTurnstileToken(null),
            'error-callback': () => setTurnstileToken(null),
          });
        } catch {
          /* le bouton reste désactivé sans jeton */
        }
      }
    }, 400);
    return () => {
      clearInterval(intervalle);
      const ts = (window as unknown as { turnstile?: { remove: (id: string) => void } }).turnstile;
      if (widgetIdRef.current && ts) {
        try {
          ts.remove(widgetIdRef.current);
        } catch {
          /* déjà retiré */
        }
        widgetIdRef.current = null;
      }
    };
  }, [formulaireVisible, siteKey]);

  const aNoter = useMemo(
    () => (etat.type === 'formulaire' ? etat.invitation.produits.filter((p) => !p.deja_note) : []),
    [etat]
  );
  const notes = aNoter.filter((p) => (saisies[p.produit_id]?.note ?? 0) > 0);
  const captchaPret = !siteKey || Boolean(turnstileToken);

  const majSaisie = (produitId: number, patch: Partial<Saisie>) =>
    setSaisies((prev) => ({ ...prev, [produitId]: { ...(prev[produitId] ?? { note: 0, commentaire: '' }), ...patch } }));

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (etat.type !== 'formulaire' || notes.length === 0 || envoi) return;
    setEnvoi(true);
    setErreurEnvoi(null);
    try {
      const resultat = await soumettreAvis(jeton, {
        avis: notes.map((p) => ({
          produit_id: p.produit_id,
          note: saisies[p.produit_id].note,
          commentaire: saisies[p.produit_id].commentaire.trim() || undefined,
        })),
        site_web: siteWeb,
        rempli_en_ms: Date.now() - debutRef.current,
        turnstileToken,
      });
      setEtat({ type: 'merci', invitation: etat.invitation, resultat });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      if (err instanceof AvisErreur && err.code === 'INVITATION_INVALIDE') {
        setEtat({ type: 'invalide' });
      } else {
        setErreurEnvoi(err instanceof AvisErreur ? err.message : "Votre avis n'a pas pu être envoyé. Vérifiez votre connexion et réessayez.");
        // Un jeton Turnstile ne sert qu'une fois : on en redemande un
        const ts = (window as unknown as { turnstile?: { reset: (id: string) => void } }).turnstile;
        if (widgetIdRef.current && ts) {
          try {
            ts.reset(widgetIdRef.current);
          } catch {
            /* ignoré */
          }
          setTurnstileToken(null);
        }
      }
    } finally {
      setEnvoi(false);
    }
  };

  if (etat.type === 'chargement') {
    return (
      <Coquille>
        <div className="mt-6 animate-pulse space-y-4" aria-busy="true" aria-label="Chargement">
          <div className="h-7 w-2/3 rounded bg-[#e9e7e2]" />
          <div className="h-4 w-1/2 rounded bg-[#efeeea]" />
          <div className="h-40 rounded-2xl bg-white" />
        </div>
      </Coquille>
    );
  }

  if (etat.type === 'invalide') {
    return (
      <Message
        icone={<LinkIcon className="h-6 w-6 text-[#8b8f95]" aria-hidden="true" />}
        titre="Ce lien n'est plus valide"
        texte="Il a peut-être expiré, ou vous avez déjà noté tous les articles de cette commande. Merci pour votre confiance !"
        action={
          <Link href="/" className="inline-flex h-11 items-center rounded-xl px-5 text-[14px] font-semibold text-white" style={{ background: VERT }}>
            Découvrir Marché 241
          </Link>
        }
      />
    );
  }

  if (etat.type === 'desactive') {
    return (
      <Message
        icone={<Clock3 className="h-6 w-6 text-[#8b8f95]" aria-hidden="true" />}
        titre="Les avis sont momentanément indisponibles"
        texte="Votre lien reste valable : revenez un peu plus tard pour donner votre avis."
      />
    );
  }

  if (etat.type === 'erreur_reseau') {
    return (
      <Message
        icone={<WifiOff className="h-6 w-6 text-[#8b8f95]" aria-hidden="true" />}
        titre="Connexion impossible"
        texte="Nous n'arrivons pas à charger votre commande. Vérifiez votre connexion internet puis réessayez."
        action={
          <button type="button" onClick={charger} className="inline-flex h-11 items-center rounded-xl px-5 text-[14px] font-semibold text-white" style={{ background: VERT }}>
            Réessayer
          </button>
        }
      />
    );
  }

  if (etat.type === 'merci') {
    const { invitation, resultat } = etat;
    return (
      <Message
        icone={<CheckCircle2 className="h-6 w-6" style={{ color: VERT }} aria-hidden="true" />}
        titre={`Merci ${invitation.prenom_client} !`}
        texte={
          resultat.en_moderation > 0
            ? 'Votre avis a bien été reçu. Il sera publié après une vérification rapide par notre équipe.'
            : 'Votre avis a bien été reçu et publié.'
        }
        action={
          <Link
            href={`/${invitation.boutique.slug}`}
            className="inline-flex h-11 items-center rounded-xl px-5 text-[14px] font-semibold text-white"
            style={{ background: VERT }}
          >
            Retourner chez {invitation.boutique.nom}
          </Link>
        }
      />
    );
  }

  const { invitation, longueurMax } = etat;

  if (aNoter.length === 0) {
    return (
      <Message
        icone={<CheckCircle2 className="h-6 w-6" style={{ color: VERT }} aria-hidden="true" />}
        titre="Vous avez déjà tout noté"
        texte={`Merci ${invitation.prenom_client} ! Vos avis sur la commande ${invitation.numero_commande} ont bien été reçus.`}
      />
    );
  }

  return (
    <Coquille>
      {siteKey && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />}

      <div className="mt-3 flex items-center gap-3">
        {invitation.boutique.logo ? (
          <Image
            src={invitation.boutique.logo}
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 rounded-full border border-[#e9e7e2] bg-white object-cover"
          />
        ) : null}
        <div className="min-w-0">
          <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.01em] text-[#17181a] sm:text-[26px]">
            Bonjour {invitation.prenom_client}, votre avis compte
          </h1>
          <p className="mt-1 text-[13.5px] text-[#5f6369]">
            Commande <span className="font-mono">{invitation.numero_commande}</span> · {invitation.boutique.nom}
          </p>
        </div>
      </div>

      <form onSubmit={envoyer} className="mt-6 space-y-4" noValidate>
        {aNoter.map((p) => {
          const saisie = saisies[p.produit_id] ?? { note: 0, commentaire: '' };
          const idCommentaire = `commentaire-${p.produit_id}`;
          return (
            <fieldset key={p.produit_id} className="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-5">
              <legend className="sr-only">{p.nom_produit}</legend>
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-[#f3f2ef]">
                  {p.image ? (
                    <Image src={p.image} alt="" width={56} height={56} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <p className="line-clamp-2 text-[15px] font-medium leading-snug text-[#17181a]">{p.nom_produit}</p>
              </div>

              <div className="mt-3">
                <SelecteurEtoiles
                  valeur={saisie.note}
                  onChange={(note) => majSaisie(p.produit_id, { note })}
                  nom={p.nom_produit}
                  desactive={envoi}
                />
              </div>

              {saisie.note > 0 && (
                <div className="mt-2">
                  <label htmlFor={idCommentaire} className="text-[13px] font-medium text-[#33363b]">
                    Un commentaire ? <span className="font-normal text-[#8b8f95]">(facultatif)</span>
                  </label>
                  <textarea
                    id={idCommentaire}
                    value={saisie.commentaire}
                    onChange={(e) => majSaisie(p.produit_id, { commentaire: e.target.value.slice(0, longueurMax) })}
                    rows={3}
                    maxLength={longueurMax}
                    disabled={envoi}
                    placeholder="Qualité, taille, livraison… Ce qui aidera les prochains acheteurs."
                    className="mt-1.5 w-full resize-y rounded-xl border border-[#e4e2dd] bg-white px-3.5 py-2.5 text-[15px] leading-[1.5] text-[#17181a] placeholder:text-[#a9a7a1] focus:border-[#508e27] focus:outline-none focus:ring-2 focus:ring-[#508e27]/20"
                  />
                  <p className="mt-1 text-right font-mono text-[11.5px] text-[#9a9892]">
                    {saisie.commentaire.length} / {longueurMax}
                  </p>
                </div>
              )}
            </fieldset>
          );
        })}

        {/* Pot de miel : invisible pour les humains, rempli par les robots */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="site_web">Site web</label>
          <input id="site_web" name="site_web" type="text" tabIndex={-1} autoComplete="off" value={siteWeb} onChange={(e) => setSiteWeb(e.target.value)} />
        </div>

        {siteKey && <div ref={turnstileRef} className="flex justify-center" />}

        {erreurEnvoi && (
          <p role="alert" className="rounded-xl bg-[#fdecea] px-4 py-3 text-[13.5px] text-[#b3261e]">
            {erreurEnvoi}
          </p>
        )}

        <button
          type="submit"
          disabled={notes.length === 0 || envoi || !captchaPret}
          className="h-12 w-full rounded-xl text-[15px] font-semibold text-white transition-opacity disabled:opacity-50"
          style={{ background: VERT }}
        >
          {envoi
            ? 'Envoi en cours…'
            : notes.length === 0
              ? 'Choisissez une note pour continuer'
              : `Envoyer ${notes.length > 1 ? `mes ${notes.length} avis` : 'mon avis'}`}
        </button>

        <ul className="space-y-1.5 px-1 pb-4 text-[12.5px] leading-[1.5] text-[#8b8f95]">
          <li className="flex gap-2">
            <BadgeCheck className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            Votre avis sera affiché avec votre prénom et l&apos;initiale de votre nom, et le badge « Achat vérifié ».
          </li>
          <li className="flex gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            Votre numéro n&apos;est jamais publié. Les avis sont vérifiés par l&apos;équipe Marché 241 avant publication.
          </li>
        </ul>
      </form>
    </Coquille>
  );
}
