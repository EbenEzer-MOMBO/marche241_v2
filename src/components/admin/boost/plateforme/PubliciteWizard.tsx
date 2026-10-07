'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, ImagePlus, Loader2, Minus, Plus, Trash2 } from 'lucide-react';
import type { CibleTypePublicite, DisponibiliteSemaine, FormulePublicite, ProduitDB, Publicite } from '@/lib/database-types';
import type { BoutiqueData } from '@/lib/services/auth';
import { ApiError } from '@/lib/api';
import { erreursDeChamps, ErreurChamp, formaterFcfa, messageErreur } from '@/lib/services/boosts';
import {
  annulerSoumissionPublicite,
  creerBrouillonPublicite,
  DESCRIPTIONS_FORMULE,
  DevisPublicite,
  DonneesBrouillonPublicite,
  enregistrerBrouillonPublicite,
  formaterJour,
  dimancheDe,
  getDevisPublicite,
  getDisponibilitesPublicite,
  libellePeriodePublicite,
  ParametresPubliciteVendeur,
  payerPublicite,
  soumettrePublicite,
  supprimerBrouillonPublicite
} from '@/lib/services/publicites';
import { getCategoriesMarketplace } from '@/lib/services/categories';
import { getProduitsParBoutique } from '@/lib/services/products';
import { uploadImage } from '@/lib/services/upload';
import { verifierPaiementEnBoucle } from '@/lib/services/paiements';
import { MobileMoneyOperator, msisdnPlaceholder, normalizeMsisdnInput, validateMsisdn } from '@/lib/utils/mobileMoneyMsisdn';
import PaymentCountdown from '@/components/ui/PaymentCountdown';
import ApercuBanniere from './ApercuBanniere';

const ETAPES = [
  { id: 1, label: 'Formule & semaines' },
  { id: 2, label: 'Visuel & lien' },
  { id: 3, label: 'Paiement' }
] as const;

const CHAMPS_ETAPE_1 = ['formule', 'categorie_id', 'semaine_debut', 'nb_semaines'];

interface Formulaire {
  formule: FormulePublicite;
  categorie_id: number | null;
  semaine_debut: string | null;
  nb_semaines: number;
  image_url: string;
  image_mobile_url: string;
  texte_alternatif: string;
  cible_type: CibleTypePublicite;
  produit_id: number | null;
}

function depuisPublicite(p: Publicite): Formulaire {
  return {
    formule: p.formule,
    categorie_id: p.categorie_id,
    semaine_debut: p.semaine_debut,
    nb_semaines: p.nb_semaines || 1,
    image_url: p.image_url ?? '',
    image_mobile_url: p.image_mobile_url ?? '',
    texte_alternatif: p.texte_alternatif ?? '',
    cible_type: p.cible_type ?? 'boutique',
    produit_id: p.produit_id
  };
}

const FORMULAIRE_DEFAUT: Formulaire = {
  formule: 'accueil',
  categorie_id: null,
  semaine_debut: null,
  nb_semaines: 1,
  image_url: '',
  image_mobile_url: '',
  texte_alternatif: '',
  cible_type: 'boutique',
  produit_id: null
};

function versDonnees(f: Formulaire): DonneesBrouillonPublicite {
  return {
    formule: f.formule,
    categorie_id: f.formule === 'categorie' ? f.categorie_id : null,
    semaine_debut: f.semaine_debut,
    nb_semaines: f.nb_semaines,
    image_url: f.image_url || null,
    image_mobile_url: f.image_mobile_url || null,
    texte_alternatif: f.texte_alternatif || null,
    cible_type: f.cible_type,
    produit_id: f.cible_type === 'produit' ? f.produit_id : null
  };
}

/** Vérifie les proportions d'un visuel avant envoi (desktop 4:1, mobile 2:1, tolérance 15 %). */
function verifierDimensions(fichier: File, ratioAttendu: number, largeurMin: number): Promise<string | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(fichier);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      const ratio = image.naturalWidth / image.naturalHeight;
      if (image.naturalWidth < largeurMin) resolve(`Image trop petite (${image.naturalWidth} px de large, minimum ${largeurMin} px)`);
      else if (Math.abs(ratio - ratioAttendu) / ratioAttendu > 0.15) {
        resolve(`Proportions incorrectes (${image.naturalWidth} × ${image.naturalHeight}) : le visuel doit être ${ratioAttendu} fois plus large que haut`);
      } else resolve(null);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve('Image illisible');
    };
    image.src = url;
  });
}

function Champ({ label, erreur, aide, children }: { label: string; erreur?: string; aide?: string; children: React.ReactNode }) {
  return (
    <div className="block">
      <span className="text-sm font-medium text-gray-900">{label}</span>
      <div className="mt-1">{children}</div>
      {erreur ? <p className="mt-1 text-xs text-red-600">{erreur}</p> : aide ? <p className="mt-1 text-xs text-gray-500">{aide}</p> : null}
    </div>
  );
}

const classeInput = (erreur?: string) =>
  `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
    erreur ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-black focus:ring-black'
  }`;

/**
 * Parcours vendeur « Mise en avant sur Marché 241 » : formule et semaines, visuel et lien, paiement.
 * Le brouillon est enregistré à chaque étape ; les semaines sont réservées au passage au paiement.
 */
export default function PubliciteWizard({
  boutique,
  parametres,
  brouillon,
  succes,
  erreur
}: {
  boutique: BoutiqueData;
  parametres: ParametresPubliciteVendeur;
  brouillon: Publicite | null;
  succes: (message: string, titre?: string) => void;
  erreur: (message: string, titre?: string) => void;
}) {
  const router = useRouter();
  const [etape, setEtape] = useState<number>(brouillon?.statut === 'en_attente_paiement' ? 3 : 1);
  const [form, setForm] = useState<Formulaire>(brouillon ? depuisPublicite(brouillon) : FORMULAIRE_DEFAUT);
  const [publicite, setPublicite] = useState<Publicite | null>(brouillon);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [disponibilites, setDisponibilites] = useState<DisponibiliteSemaine[] | null>(null);
  const [devis, setDevis] = useState<DevisPublicite | null>(null);
  const [categories, setCategories] = useState<Array<{ id: number; nom: string }>>([]);
  const [produits, setProduits] = useState<ProduitDB[]>([]);
  const [upload, setUpload] = useState<'desktop' | 'mobile' | null>(null);
  const [traitement, setTraitement] = useState(false);
  const [modePaiement, setModePaiement] = useState<'mobile' | 'carte'>('mobile');
  const [operateur, setOperateur] = useState<MobileMoneyOperator>('airtel');
  const [msisdn, setMsisdn] = useState('');
  const [paiementEnCours, setPaiementEnCours] = useState(false);
  const [compteARebours, setCompteARebours] = useState(false);
  const annulation = useRef({ cancelled: false });
  const haut = useRef<HTMLDivElement>(null);

  const majForm = (patch: Partial<Formulaire>) => {
    setForm((f) => ({ ...f, ...patch }));
    setErreurs((e) => {
      const copie = { ...e };
      for (const cle of Object.keys(patch)) delete copie[cle];
      return copie;
    });
  };

  useEffect(() => {
    haut.current?.scrollIntoView({ block: 'start' });
  }, [etape]);

  useEffect(() => {
    getCategoriesMarketplace()
      .then((cats) => setCategories(cats.map((c) => ({ id: c.id, nom: c.nom }))))
      .catch(() => setCategories([]));
    getProduitsParBoutique(boutique.id, { limite: 100, tri_par: 'date_creation', ordre: 'DESC' })
      .then((r) => setProduits((r.donnees ?? []).filter((p: ProduitDB) => p.statut === 'actif')))
      .catch(() => setProduits([]));
  }, [boutique.id]);

  const chargerDisponibilites = useCallback(async () => {
    if (form.formule === 'categorie' && !form.categorie_id) {
      setDisponibilites([]);
      return;
    }
    setDisponibilites(null);
    try {
      const exclure = publicite && publicite.statut !== 'brouillon' ? publicite.id : null;
      setDisponibilites(await getDisponibilitesPublicite(form.formule, form.formule === 'categorie' ? form.categorie_id : null, exclure));
    } catch (err) {
      setDisponibilites([]);
      erreur(messageErreur(err, 'Disponibilités indisponibles'));
    }
  }, [form.formule, form.categorie_id, publicite, erreur]);

  useEffect(() => {
    if (etape === 1) void chargerDisponibilites();
  }, [etape, chargerDisponibilites]);

  useEffect(() => {
    let annule = false;
    getDevisPublicite(form.formule, form.nb_semaines)
      .then((d) => !annule && setDevis(d))
      .catch(() => !annule && setDevis(null));
    return () => {
      annule = true;
    };
  }, [form.formule, form.nb_semaines]);

  // Nombre de semaines libres consécutives à partir de la semaine choisie
  const maxConsecutives = useMemo(() => {
    if (!disponibilites || !form.semaine_debut) return 0;
    const debut = disponibilites.findIndex((d) => d.semaine === form.semaine_debut);
    if (debut < 0) return 0;
    let n = 0;
    for (let i = debut; i < disponibilites.length && disponibilites[i].libre; i++) n++;
    return Math.min(n, parametres.semaines_max);
  }, [disponibilites, form.semaine_debut, parametres.semaines_max]);

  // Semaine choisie devenue indisponible (ou absente de l'horizon) : on la retire
  useEffect(() => {
    if (!disponibilites || !form.semaine_debut) return;
    const choisie = disponibilites.find((d) => d.semaine === form.semaine_debut);
    if (!choisie || !choisie.libre) setForm((f) => ({ ...f, semaine_debut: null, nb_semaines: 1 }));
    else if (form.nb_semaines > maxConsecutives && maxConsecutives > 0) setForm((f) => ({ ...f, nb_semaines: maxConsecutives }));
  }, [disponibilites, form.semaine_debut, form.nb_semaines, maxConsecutives]);

  const semainesChoisies = useMemo(() => {
    if (!disponibilites || !form.semaine_debut) return new Set<string>();
    const debut = disponibilites.findIndex((d) => d.semaine === form.semaine_debut);
    return new Set(disponibilites.slice(debut, debut + form.nb_semaines).map((d) => d.semaine));
  }, [disponibilites, form.semaine_debut, form.nb_semaines]);

  const categorieNom = categories.find((c) => c.id === form.categorie_id)?.nom ?? publicite?.categorie?.nom ?? null;

  // ---------------------------------------------------------------- enregistrement

  const enregistrer = async (): Promise<Publicite | null> => {
    const donnees = versDonnees(form);
    if (publicite && publicite.statut !== 'brouillon') return publicite;
    const resultat = publicite ? await enregistrerBrouillonPublicite(publicite.id, donnees) : await creerBrouillonPublicite(boutique.id, donnees);
    setPublicite(resultat);
    if (!publicite && typeof window !== 'undefined') {
      window.history.replaceState(null, '', `${window.location.pathname}?draftId=${resultat.id}`);
    }
    return resultat;
  };

  const appliquerErreursServeur = (champs: ErreurChamp[]) => {
    setErreurs(Object.fromEntries(champs.map((c) => [c.field, c.message])));
    if (champs.some((c) => CHAMPS_ETAPE_1.includes(c.field))) setEtape(1);
    else setEtape(2);
  };

  const validerEtape = (n: number): boolean => {
    const e: Record<string, string> = {};
    if (n === 1) {
      if (form.formule === 'categorie' && !form.categorie_id) e.categorie_id = 'Choisissez la catégorie';
      if (!form.semaine_debut) e.semaine_debut = 'Choisissez la première semaine de diffusion';
    }
    if (n === 2) {
      if (!form.image_url) e.image_url = 'Le visuel ordinateur est obligatoire';
      if (form.cible_type === 'produit' && !form.produit_id) e.produit_id = 'Choisissez le produit à mettre en avant';
    }
    setErreurs(e);
    return Object.keys(e).length === 0;
  };

  const suivant = async () => {
    if (!validerEtape(etape)) return;
    setTraitement(true);
    try {
      const enregistree = await enregistrer();
      if (!enregistree) return;
      if (etape === 1) {
        setEtape(2);
        return;
      }
      // Étape 2 → 3 : réservation des semaines et prix figé côté serveur
      const soumise = enregistree.statut === 'en_attente_paiement' ? enregistree : await soumettrePublicite(enregistree.id);
      setPublicite(soumise);
      setEtape(3);
    } catch (err) {
      const champs = erreursDeChamps(err);
      if (champs.length) appliquerErreursServeur(champs);
      else if (err instanceof ApiError && err.response?.code === 'SEMAINE_INDISPONIBLE') {
        setErreurs({ semaine_debut: err.message });
        setEtape(1);
        void chargerDisponibilites();
      } else erreur(messageErreur(err, 'Enregistrement impossible'));
    } finally {
      setTraitement(false);
    }
  };

  const modifier = async () => {
    if (!publicite) return;
    try {
      const p = await annulerSoumissionPublicite(publicite.id);
      setPublicite(p);
      setForm(depuisPublicite(p));
      setEtape(2);
    } catch (err) {
      erreur(messageErreur(err, 'Modification impossible'));
    }
  };

  const supprimer = async () => {
    if (!publicite || publicite.statut !== 'brouillon') return;
    if (!window.confirm('Supprimer ce brouillon ?')) return;
    try {
      await supprimerBrouillonPublicite(publicite.id);
      succes('Brouillon supprimé');
      router.push(`/admin/${boutique.slug}/boost`);
    } catch (err) {
      erreur(messageErreur(err, 'Suppression impossible'));
    }
  };

  // ---------------------------------------------------------------- visuels

  const choisirVisuel = async (fichier: File | undefined, cible: 'desktop' | 'mobile') => {
    if (!fichier) return;
    const champ = cible === 'desktop' ? 'image_url' : 'image_mobile_url';
    if (!parametres.formats_visuel.formats.includes(fichier.type)) {
      setErreurs((e) => ({ ...e, [champ]: 'Format accepté : JPG, PNG ou WebP' }));
      return;
    }
    if (fichier.size > parametres.formats_visuel.poids_max_mo * 1024 * 1024) {
      setErreurs((e) => ({ ...e, [champ]: `Image trop lourde (${parametres.formats_visuel.poids_max_mo} Mo maximum)` }));
      return;
    }
    const format = parametres.formats_visuel[cible];
    const probleme = await verifierDimensions(fichier, format.largeur / format.hauteur, Math.round(format.largeur * 0.66));
    if (probleme) {
      setErreurs((e) => ({ ...e, [champ]: `${probleme}. Format conseillé : ${format.largeur} × ${format.hauteur} px.` }));
      return;
    }
    setUpload(cible);
    try {
      const r = await uploadImage(fichier, boutique.slug, 'publicites');
      majForm(cible === 'desktop' ? { image_url: r.url } : { image_mobile_url: r.url });
    } catch (err) {
      setErreurs((e) => ({ ...e, [champ]: messageErreur(err, "Échec de l'envoi de l'image") }));
    } finally {
      setUpload(null);
    }
  };

  // ---------------------------------------------------------------- paiement

  const erreurMsisdn = modePaiement === 'mobile' ? validateMsisdn(msisdn, operateur) : '';
  const peutPayer = modePaiement === 'carte' || (msisdn.length === 9 && !erreurMsisdn);

  const payer = async () => {
    if (!publicite || !peutPayer) return;
    setPaiementEnCours(true);
    annulation.current = { cancelled: false };
    try {
      if (modePaiement === 'carte') {
        const r = await payerPublicite(publicite.id, {
          mode: 'carte',
          return_url: `${window.location.origin}/admin/${boutique.slug}/boost/plateforme/${publicite.id}?paiement=carte`
        });
        if (r.url) window.location.href = r.url;
        return;
      }
      const r = await payerPublicite(publicite.id, { mode: 'mobile', operateur: operateur === 'moov' ? 'moovmoney' : 'airtelmoney', msisdn });
      setCompteARebours(true);
      const verif = await verifierPaiementEnBoucle(r.bill_id, 120000, 5000, annulation.current);
      setCompteARebours(false);
      if (verif.status === 'paye' || verif.status === 'paid' || verif.status === 'processed') {
        succes('Paiement reçu : votre bannière est en cours de validation par l’équipe Marché 241', 'Paiement confirmé');
        router.push(`/admin/${boutique.slug}/boost/plateforme/${publicite.id}`);
      } else {
        erreur(verif.message || 'Paiement non confirmé. Vous pouvez réessayer.', 'Paiement');
      }
    } catch (err) {
      setCompteARebours(false);
      if (!annulation.current.cancelled) erreur(messageErreur(err, 'Paiement impossible'));
    } finally {
      setPaiementEnCours(false);
    }
  };

  const annulerPaiement = () => {
    annulation.current.cancelled = true;
    setCompteARebours(false);
    setPaiementEnCours(false);
  };

  // ---------------------------------------------------------------- rendu

  const retour = (
    <button
      type="button"
      onClick={() => (etape === 1 || etape === 3 ? router.push(`/admin/${boutique.slug}/boost`) : setEtape(etape - 1))}
      className="mb-4 -ml-2 inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    >
      <ArrowLeft className="h-4 w-4" /> {etape === 1 || etape === 3 ? 'Mes publicités' : 'Retour'}
    </button>
  );

  return (
    <div ref={haut} className="scroll-mt-6">
      {compteARebours && (
        <PaymentCountdown
          duration={120}
          onComplete={() => setCompteARebours(false)}
          onCancel={annulerPaiement}
          paymentMethod={operateur === 'moov' ? 'Moov Money' : 'Airtel Money'}
          phoneNumber={msisdn}
        />
      )}

      {retour}

      <ol className="mb-6 grid grid-cols-3 gap-2">
        {ETAPES.map((e) => (
          <li key={e.id} className="flex flex-col gap-1.5">
            <span className={`h-1 rounded-full ${etape >= e.id ? 'bg-black' : 'bg-gray-200'}`} />
            <span className={`text-xs ${etape === e.id ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
              <span className="sm:hidden">{e.id}. </span>
              <span className={etape === e.id ? '' : 'hidden sm:inline'}>{e.label}</span>
            </span>
          </li>
        ))}
      </ol>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
          {etape === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Choisissez votre formule</h2>
                <p className="mt-1 text-sm text-gray-500">Prix à la semaine, du lundi au dimanche. Un seul annonceur par emplacement et par semaine.</p>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {parametres.formules.map((f) => {
                    const actif = form.formule === f.code;
                    return (
                      <button
                        key={f.code}
                        type="button"
                        onClick={() => majForm({ formule: f.code, ...(f.code !== 'categorie' ? { categorie_id: null } : {}) })}
                        aria-pressed={actif}
                        className={`relative flex flex-col items-start rounded-xl border p-4 text-left transition ${
                          actif ? 'border-2 border-black bg-white shadow-sm' : 'border-gray-200 bg-white hover:border-gray-400'
                        }`}
                      >
                        {actif && (
                          <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-black">
                            <Check className="h-3.5 w-3.5 text-white" />
                          </span>
                        )}
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{f.nom}</span>
                        <span className="mt-1 text-lg font-bold text-gray-900">{formaterFcfa(f.prix_semaine_fcfa)}</span>
                        <span className="text-xs text-gray-500">par semaine</span>
                        <ul className="mt-2 space-y-1 text-xs text-gray-600">
                          {DESCRIPTIONS_FORMULE[f.code].map((ligne) => (
                            <li key={ligne}>• {ligne}</li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                </div>
              </div>

              {form.formule === 'categorie' && (
                <Champ label="Catégorie" erreur={erreurs.categorie_id}>
                  <select
                    value={form.categorie_id ?? ''}
                    onChange={(e) => majForm({ categorie_id: e.target.value ? Number(e.target.value) : null, semaine_debut: null })}
                    className={classeInput(erreurs.categorie_id)}
                  >
                    <option value="">Choisir une catégorie…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nom}
                      </option>
                    ))}
                  </select>
                </Champ>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-900">Première semaine</h3>
                <p className="mt-0.5 text-xs text-gray-500">Les semaines déjà réservées par un autre annonceur sont grisées.</p>
                {disponibilites === null ? (
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" /> Chargement des disponibilités…
                  </div>
                ) : disponibilites.length === 0 ? (
                  <p className="mt-3 text-sm text-gray-500">
                    {form.formule === 'categorie' ? 'Choisissez d’abord une catégorie.' : 'Aucune semaine disponible pour le moment.'}
                  </p>
                ) : (
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {disponibilites.map((d) => {
                      const choisie = semainesChoisies.has(d.semaine);
                      return (
                        <button
                          key={d.semaine}
                          type="button"
                          disabled={!d.libre}
                          onClick={() => majForm({ semaine_debut: d.semaine, nb_semaines: 1 })}
                          aria-pressed={choisie}
                          className={`rounded-lg border px-2.5 py-2 text-left text-xs transition ${
                            !d.libre
                              ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400'
                              : choisie
                                ? 'border-black bg-black text-white'
                                : 'border-gray-200 bg-white text-gray-800 hover:border-gray-400'
                          }`}
                        >
                          <span className="block font-medium">
                            {formaterJour(d.semaine)} – {formaterJour(dimancheDe(d.semaine))}
                          </span>
                          <span className={`block ${choisie ? 'text-gray-300' : 'text-gray-500'}`}>{d.libre ? (choisie ? 'Choisie' : 'Libre') : 'Réservée'}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {erreurs.semaine_debut && <p className="mt-2 text-xs text-red-600">{erreurs.semaine_debut}</p>}
              </div>

              {form.semaine_debut && (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">Nombre de semaines</span>
                  <div className="inline-flex items-center rounded-lg border border-gray-300">
                    <button
                      type="button"
                      onClick={() => majForm({ nb_semaines: Math.max(1, form.nb_semaines - 1) })}
                      disabled={form.nb_semaines <= 1}
                      className="p-2 text-gray-700 disabled:opacity-30"
                      aria-label="Une semaine de moins"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold" aria-live="polite">
                      {form.nb_semaines}
                    </span>
                    <button
                      type="button"
                      onClick={() => majForm({ nb_semaines: Math.min(maxConsecutives, form.nb_semaines + 1) })}
                      disabled={form.nb_semaines >= maxConsecutives}
                      className="p-2 text-gray-700 disabled:opacity-30"
                      aria-label="Une semaine de plus"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">{libellePeriodePublicite(form.semaine_debut, form.nb_semaines)}</span>
                  {parametres.remise_4_pour_3 && form.nb_semaines < 4 && maxConsecutives >= 4 && (
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">4 semaines = prix de 3</span>
                  )}
                </div>
              )}
            </div>
          )}

          {etape === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Votre visuel</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Ordinateur : {parametres.formats_visuel.desktop.largeur} × {parametres.formats_visuel.desktop.hauteur} px (obligatoire). Téléphone :{' '}
                  {parametres.formats_visuel.mobile.largeur} × {parametres.formats_visuel.mobile.hauteur} px (conseillé). JPG, PNG ou WebP.
                </p>
              </div>

              {(['desktop', 'mobile'] as const).map((cible) => {
                const champ = cible === 'desktop' ? 'image_url' : 'image_mobile_url';
                const valeur = cible === 'desktop' ? form.image_url : form.image_mobile_url;
                return (
                  <Champ key={cible} label={cible === 'desktop' ? 'Visuel ordinateur' : 'Visuel téléphone (facultatif)'} erreur={erreurs[champ]}>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        {upload === cible ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                        {valeur ? 'Remplacer' : 'Choisir une image'}
                        <input
                          type="file"
                          accept={parametres.formats_visuel.formats.join(',')}
                          className="sr-only"
                          disabled={upload !== null}
                          onChange={(e) => {
                            void choisirVisuel(e.target.files?.[0], cible);
                            e.target.value = '';
                          }}
                        />
                      </label>
                      {valeur && (
                        <button type="button" onClick={() => majForm(cible === 'desktop' ? { image_url: '' } : { image_mobile_url: '' })} className="text-xs text-gray-500 underline">
                          Retirer
                        </button>
                      )}
                    </div>
                  </Champ>
                );
              })}

              <Champ label="Texte alternatif" aide="Décrit la bannière pour les lecteurs d’écran (ex. « Topboy : nouvelle collection »)." erreur={erreurs.texte_alternatif}>
                <input value={form.texte_alternatif} maxLength={140} onChange={(e) => majForm({ texte_alternatif: e.target.value })} className={classeInput(erreurs.texte_alternatif)} />
              </Champ>

              <Champ label="Où mène la bannière ?" erreur={erreurs.produit_id || erreurs.url_destination}>
                <div className="grid grid-cols-2 gap-2">
                  {(['boutique', 'produit'] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => majForm({ cible_type: c, ...(c === 'boutique' ? { produit_id: null } : {}) })}
                      aria-pressed={form.cible_type === c}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium ${form.cible_type === c ? 'border-black bg-black text-white' : 'border-gray-300 bg-white text-gray-700'}`}
                    >
                      {c === 'boutique' ? 'Ma boutique' : 'Un produit'}
                    </button>
                  ))}
                </div>
                {form.cible_type === 'produit' && (
                  <select
                    value={form.produit_id ?? ''}
                    onChange={(e) => majForm({ produit_id: e.target.value ? Number(e.target.value) : null })}
                    className={`mt-2 ${classeInput(erreurs.produit_id)}`}
                  >
                    <option value="">Choisir un produit…</option>
                    {produits.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nom}
                      </option>
                    ))}
                  </select>
                )}
              </Champ>
            </div>
          )}

          {etape === 3 && publicite && (
            <div className="space-y-6">
              <div className="rounded-xl bg-gray-50 p-4 text-sm">
                <dl className="space-y-1.5">
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-600">Formule</dt>
                    <dd className="text-right font-medium">
                      {parametres.formules.find((f) => f.code === publicite.formule)?.nom}
                      {publicite.categorie ? ` — ${publicite.categorie.nom}` : ''}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-600">Période</dt>
                    <dd className="text-right font-medium">{publicite.semaine_debut ? libellePeriodePublicite(publicite.semaine_debut, publicite.nb_semaines) : '—'}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-600">
                      {publicite.nb_semaines} semaine{publicite.nb_semaines > 1 ? 's' : ''} × {formaterFcfa(publicite.prix_semaine_fcfa)}
                    </dt>
                    <dd className="font-medium">{formaterFcfa(publicite.prix_semaine_fcfa * publicite.nb_semaines)}</dd>
                  </div>
                  {publicite.remise_fcfa > 0 && (
                    <div className="flex justify-between gap-3 text-green-700">
                      <dt>Remise 4 semaines = prix de 3</dt>
                      <dd className="font-medium">− {formaterFcfa(publicite.remise_fcfa)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-200 pt-1.5 text-base">
                    <dt className="font-semibold">À payer</dt>
                    <dd className="font-bold">{formaterFcfa(publicite.total_fcfa)}</dd>
                  </div>
                </dl>
                <p className="mt-2 text-xs text-gray-500">
                  Vos semaines sont bloquées pendant le paiement. La bannière est diffusée après validation par l’équipe Marché 241 ; en cas de refus, vous êtes
                  remboursé{publicite.frais_encaissement_fcfa > 0 ? <>, hors frais d’encaissement de {formaterFcfa(publicite.frais_encaissement_fcfa)}</> : null}.
                </p>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-900">Moyen de paiement</p>
                <div className="grid grid-cols-3 gap-2">
                  {([['mobile', 'airtel', 'Airtel Money'], ['mobile', 'moov', 'Moov Money'], ['carte', null, 'Carte bancaire']] as const).map(([mode, op, libelle]) => {
                    const actif = modePaiement === mode && (mode === 'carte' || operateur === op);
                    return (
                      <button
                        key={libelle}
                        type="button"
                        onClick={() => {
                          setModePaiement(mode);
                          if (op) setOperateur(op);
                        }}
                        className={`rounded-lg border px-2 py-2.5 text-xs font-medium sm:text-sm ${actif ? 'border-black bg-black text-white' : 'border-gray-300 bg-white text-gray-700'}`}
                      >
                        {libelle}
                      </button>
                    );
                  })}
                </div>
              </div>

              {modePaiement === 'mobile' && (
                <Champ label={`Numéro ${operateur === 'moov' ? 'Moov' : 'Airtel'} Money`} erreur={erreurMsisdn || undefined}>
                  <input
                    value={msisdn}
                    onChange={(e) => setMsisdn(normalizeMsisdnInput(e.target.value))}
                    placeholder={msisdnPlaceholder(operateur)}
                    inputMode="numeric"
                    className={classeInput(erreurMsisdn || undefined)}
                  />
                </Champ>
              )}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                <button type="button" onClick={() => void modifier()} disabled={paiementEnCours} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                  Modifier la bannière
                </button>
                <button
                  type="button"
                  onClick={() => void payer()}
                  disabled={!peutPayer || paiementEnCours || parametres.kill_switch}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40"
                >
                  {paiementEnCours && <Loader2 className="h-4 w-4 animate-spin" />}
                  Payer {formaterFcfa(publicite.total_fcfa)}
                </button>
              </div>
            </div>
          )}

          {etape < 3 && (
            <div className="mt-6 flex items-center justify-between gap-2 border-t border-gray-100 pt-4">
              <div>
                {publicite?.statut === 'brouillon' && (
                  <button type="button" onClick={() => void supprimer()} className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600" aria-label="Supprimer le brouillon">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => void suivant()}
                disabled={traitement || upload !== null}
                className="inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {traitement && <Loader2 className="h-4 w-4 animate-spin" />}
                {etape === 2 ? 'Réserver et payer' : 'Continuer'} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-0 lg:self-start">
          {devis && etape < 3 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Prix</p>
              <dl className="mt-2 space-y-1">
                <div className="flex justify-between">
                  <dt className="text-gray-600">
                    {devis.nb_semaines} × {formaterFcfa(devis.prix_semaine_fcfa)}
                  </dt>
                  <dd>{formaterFcfa(devis.sous_total_fcfa)}</dd>
                </div>
                {devis.remise_fcfa > 0 && (
                  <div className="flex justify-between text-green-700">
                    <dt>Remise 4 pour 3</dt>
                    <dd>− {formaterFcfa(devis.remise_fcfa)}</dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-100 pt-1 font-semibold">
                  <dt>Total</dt>
                  <dd>{formaterFcfa(devis.total_fcfa)}</dd>
                </div>
              </dl>
            </div>
          )}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Aperçu</p>
            <ApercuBanniere imageUrl={form.image_url || null} imageMobileUrl={form.image_mobile_url || null} formule={form.formule} categorieNom={categorieNom} />
          </div>
        </aside>
      </div>
    </div>
  );
}
