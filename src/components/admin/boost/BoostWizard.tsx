'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  Globe,
  ImagePlus,
  Loader2,
  MessageCircle,
  MousePointerClick,
  Save,
  Trash2,
  Users
} from 'lucide-react';
import type { Boost, CiblageBoost, ObjectifBoost, TypeCibleBoost } from '@/lib/database-types';
import type { ProduitDB } from '@/lib/database-types';
import type { BoutiqueData } from '@/lib/services/auth';
import {
  annulerSoumissionBoost,
  creerBrouillonBoost,
  DevisBoost,
  DonneesBrouillonBoost,
  enregistrerBrouillonBoost,
  erreursDeChamps,
  ErreurChamp,
  estimerAudienceBoost,
  estimerImpressionsBoost,
  EstimationImpressions,
  formaterFcfa,
  formaterNombre,
  getDevisBoost,
  getPrefillBoost,
  messageErreur,
  ParametresBoost,
  payerBoost,
  soumettreBoost,
  supprimerBrouillonBoost
} from '@/lib/services/boosts';
import { getProduitsParBoutique } from '@/lib/services/products';
import { uploadImage } from '@/lib/services/upload';
import { verifierPaiementEnBoucle } from '@/lib/services/paiements';
import { MobileMoneyOperator, msisdnPlaceholder, normalizeMsisdnInput, validateMsisdn } from '@/lib/utils/mobileMoneyMsisdn';
import PaymentCountdown from '@/components/ui/PaymentCountdown';
import AdPreview from './AdPreview';
import AudienceFields from './AudienceFields';
import TypePubSelector from './TypePubSelector';

const ETAPES = [
  { id: 1, label: 'Publication' },
  { id: 2, label: 'Objectif & audience' },
  { id: 3, label: 'Budget' },
  { id: 4, label: 'Paiement' }
] as const;

const CHAMPS_PAR_ETAPE: Record<number, string[]> = {
  1: ['titre', 'texte_principal', 'image_url', 'produit_id', 'description', 'nom'],
  2: ['whatsapp_e164', 'url_destination', 'objectif', 'ciblage'],
  3: ['total_fcfa', 'duree_jours']
};

const OBJECTIFS: Array<{ id: ObjectifBoost; titre: string; texte: string; icone: typeof Globe }> = [
  { id: 'trafic', titre: 'Visites', texte: 'Amener des acheteurs sur votre boutique ou votre produit', icone: MousePointerClick },
  { id: 'whatsapp', titre: 'Messages WhatsApp', texte: 'Recevoir des messages de clients sur WhatsApp', icone: MessageCircle },
  { id: 'notoriete', titre: 'Visibilité', texte: 'Montrer votre publicité au plus grand nombre', icone: Eye }
];

const CIBLAGE_DEFAUT: CiblageBoost = { pays: ['GA'], villes: [], age_min: 18, age_max: 65, sexes: [], langues: [], interets: [] };

interface Formulaire {
  type_cible: TypeCibleBoost;
  produit_id: number | null;
  objectif: ObjectifBoost;
  nom: string;
  titre: string;
  texte_principal: string;
  description: string;
  image_url: string;
  url_destination: string;
  whatsapp_e164: string;
  total_fcfa: number;
  duree_jours: number;
  ciblage: CiblageBoost;
}

function depuisBoost(b: Boost): Formulaire {
  return {
    type_cible: b.type_cible,
    produit_id: b.produit_id,
    objectif: b.objectif,
    nom: b.nom,
    titre: b.titre ?? '',
    texte_principal: b.texte_principal ?? '',
    description: b.description ?? '',
    image_url: b.image_url ?? '',
    url_destination: b.url_destination ?? '',
    whatsapp_e164: b.whatsapp_e164 ?? '',
    total_fcfa: b.total_fcfa,
    duree_jours: b.duree_jours,
    ciblage: { ...CIBLAGE_DEFAUT, ...(b.ciblage ?? {}) }
  };
}

function versApi(f: Formulaire, etape: number): DonneesBrouillonBoost {
  return {
    type_cible: f.type_cible,
    produit_id: f.type_cible === 'produit' ? f.produit_id : null,
    objectif: f.objectif,
    nom: f.nom || f.titre || 'Brouillon',
    titre: f.titre || null,
    texte_principal: f.texte_principal || null,
    description: f.description || null,
    image_url: f.image_url || null,
    url_destination: f.url_destination || null,
    whatsapp_e164: f.whatsapp_e164 ? f.whatsapp_e164.replace(/\s/g, '') : null,
    total_fcfa: f.total_fcfa,
    duree_jours: f.duree_jours,
    ciblage: { ...f.ciblage, etape_wizard: etape }
  };
}

function Champ({ label, erreur, aide, children }: { label: string; erreur?: string; aide?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-900">{label}</span>
      <div className="mt-1">{children}</div>
      {erreur ? <p className="mt-1 text-xs text-red-600">{erreur}</p> : aide ? <p className="mt-1 text-xs text-gray-500">{aide}</p> : null}
    </label>
  );
}

const classeInput = (erreur?: string) =>
  `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
    erreur ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-black focus:ring-black'
  }`;

/**
 * Wizard de création d'un boost Meta (port de CampaignWizard de boost_meta) :
 * étape 0 type de pub, 1 publication, 2 objectif & audience, 3 budget, 4 paiement.
 * Brouillon enregistré automatiquement (~1,5 s), reprise via ?draftId=.
 */
export default function BoostWizard({
  boutique,
  parametres,
  brouillon,
  produitInitialId,
  succes,
  erreur
}: {
  boutique: BoutiqueData;
  parametres: ParametresBoost;
  brouillon: Boost | null;
  produitInitialId: number | null;
  succes: (m: string, t?: string) => void;
  erreur: (m: string, t?: string) => void;
}) {
  const router = useRouter();
  const premierPack = parametres.packs[0];
  const [etape, setEtape] = useState<number>(() => {
    if (!brouillon) return 0;
    if (brouillon.statut === 'en_attente_paiement') return 4;
    return Math.min(Math.max(brouillon.ciblage?.etape_wizard ?? 1, 1), 3);
  });
  const [boost, setBoost] = useState<Boost | null>(brouillon);
  const [form, setForm] = useState<Formulaire>(() =>
    brouillon
      ? depuisBoost(brouillon)
      : {
          type_cible: 'boutique',
          produit_id: null,
          objectif: 'trafic',
          nom: '',
          titre: '',
          texte_principal: '',
          description: '',
          image_url: '',
          url_destination: '',
          whatsapp_e164: '',
          total_fcfa: premierPack?.total_fcfa ?? parametres.total_min_fcfa,
          duree_jours: premierPack?.duree_jours ?? 7,
          ciblage: CIBLAGE_DEFAUT
        }
  );
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [produits, setProduits] = useState<ProduitDB[]>([]);
  const [enregistrement, setEnregistrement] = useState<'idle' | 'en_cours' | 'ok' | 'erreur'>('idle');
  const [upload, setUpload] = useState(false);
  const [devis, setDevis] = useState<DevisBoost | null>(null);
  const [audience, setAudience] = useState<{ min: number | null; max: number | null; disponible: boolean } | null>(null);
  const [impressions, setImpressions] = useState<EstimationImpressions[] | null>(null);
  const [soumission, setSoumission] = useState(false);
  const [modePaiement, setModePaiement] = useState<'mobile' | 'carte'>('mobile');
  const [operateur, setOperateur] = useState<MobileMoneyOperator>('airtel');
  const [msisdn, setMsisdn] = useState('');
  const [paiementEnCours, setPaiementEnCours] = useState(false);
  const [compteARebours, setCompteARebours] = useState(false);
  const annulation = useRef({ cancelled: false });
  const boostRef = useRef<Boost | null>(brouillon);
  const creationEnCours = useRef<Promise<Boost> | null>(null);
  const modifie = useRef(false);
  const verrouille = boost?.statut === 'en_attente_paiement';

  // ---------------------------------------------------------------- données initiales
  useEffect(() => {
    getProduitsParBoutique(boutique.id, { limite: 100, tri_par: 'date_creation', ordre: 'DESC' })
      .then((r) => setProduits((r.donnees ?? []).filter((p: ProduitDB) => p.statut === 'actif')))
      .catch(() => setProduits([]));
  }, [boutique.id]);

  const appliquerPrefill = useCallback(
    async (produitId: number | null) => {
      try {
        const p = await getPrefillBoost(boutique.id, produitId);
        setForm((f) => ({
          ...f,
          type_cible: p.type_cible,
          produit_id: p.produit_id ?? null,
          nom: p.nom ?? f.nom,
          titre: p.titre ?? f.titre,
          texte_principal: p.texte_principal ?? f.texte_principal,
          image_url: p.image_url ?? f.image_url,
          url_destination: p.url_destination ?? f.url_destination,
          whatsapp_e164: f.whatsapp_e164 || p.whatsapp_e164 || ''
        }));
        modifie.current = true;
      } catch (err) {
        erreur(messageErreur(err, 'Pré-remplissage impossible'));
      }
    },
    [boutique.id, erreur]
  );

  // ---------------------------------------------------------------- brouillon automatique
  const enregistrer = useCallback(
    async (etapeCourante: number): Promise<Boost | null> => {
      if (boostRef.current && boostRef.current.statut !== 'brouillon') return boostRef.current;
      setEnregistrement('en_cours');
      try {
        const donnees = versApi(form, etapeCourante);
        let resultat: Boost;
        if (boostRef.current) {
          resultat = await enregistrerBrouillonBoost(boostRef.current.id, donnees);
        } else {
          creationEnCours.current ??= creerBrouillonBoost(boutique.id, donnees);
          resultat = await creationEnCours.current;
          creationEnCours.current = null;
          window.history.replaceState(null, '', `/admin/${boutique.slug}/boost/new?draftId=${resultat.id}`);
        }
        boostRef.current = resultat;
        setBoost(resultat);
        modifie.current = false;
        setEnregistrement('ok');
        return resultat;
      } catch (err) {
        creationEnCours.current = null;
        setEnregistrement('erreur');
        const champs = erreursDeChamps(err);
        if (champs.length) setErreurs(Object.fromEntries(champs.map((c) => [c.field, c.message])));
        return null;
      }
    },
    [form, boutique.id, boutique.slug]
  );

  const aDuContenu = Boolean(form.titre || form.texte_principal || form.image_url);
  useEffect(() => {
    if (etape === 0 || verrouille || !modifie.current || (!boostRef.current && !aDuContenu)) return;
    const timer = setTimeout(() => void enregistrer(etape), 1500);
    return () => clearTimeout(timer);
  }, [form, etape, verrouille, aDuContenu, enregistrer]);

  const majForm = (maj: Partial<Formulaire>) => {
    modifie.current = true;
    setForm((f) => ({ ...f, ...maj }));
    setErreurs((e) => {
      const copie = { ...e };
      for (const k of Object.keys(maj)) delete copie[k];
      return copie;
    });
  };

  const majCiblage = (maj: Partial<CiblageBoost>) => majForm({ ciblage: { ...form.ciblage, ...maj } });

  // ---------------------------------------------------------------- estimations
  useEffect(() => {
    if (etape !== 3) return;
    let annule = false;
    const timer = setTimeout(async () => {
      try {
        const d = await getDevisBoost(form.total_fcfa, form.duree_jours);
        if (!annule) {
          setDevis(d);
          setErreurs((e) => {
            const { total_fcfa: _t, ...reste } = e;
            void _t;
            return reste;
          });
        }
      } catch (err) {
        if (!annule) {
          setDevis(null);
          setErreurs((e) => ({ ...e, total_fcfa: messageErreur(err, 'Montant invalide') }));
        }
      }
      try {
        const montants = Array.from(new Set([...parametres.packs.map((p) => p.total_fcfa), form.total_fcfa]));
        const est = await estimerImpressionsBoost(montants, form.duree_jours);
        if (!annule) setImpressions(est);
      } catch {
        if (!annule) setImpressions(null);
      }
    }, 400);
    return () => {
      annule = true;
      clearTimeout(timer);
    };
  }, [etape, form.total_fcfa, form.duree_jours, parametres.packs]);

  useEffect(() => {
    if (etape !== 2) return;
    let annule = false;
    const timer = setTimeout(async () => {
      try {
        const a = await estimerAudienceBoost(form.ciblage);
        if (!annule) setAudience(a);
      } catch {
        if (!annule) setAudience({ min: null, max: null, disponible: false });
      }
    }, 600);
    return () => {
      annule = true;
      clearTimeout(timer);
    };
  }, [etape, form.ciblage]);

  useEffect(() => {
    if (!brouillon && produitInitialId) void appliquerPrefill(produitInitialId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------- navigation
  const validerEtape = (n: number): boolean => {
    const e: Record<string, string> = {};
    if (n === 1) {
      if (form.type_cible === 'produit' && !form.produit_id) e.produit_id = 'Choisissez le produit à promouvoir';
      if (form.titre.trim().length < 3) e.titre = 'Le titre doit contenir au moins 3 caractères';
      if (form.texte_principal.trim().length < 5) e.texte_principal = 'Le texte doit contenir au moins 5 caractères';
      if (!form.image_url) e.image_url = 'Ajoutez un visuel';
    }
    if (n === 2) {
      if (form.objectif === 'whatsapp' && !/^\+[1-9]\d{7,14}$/.test(form.whatsapp_e164.replace(/\s/g, ''))) {
        e.whatsapp_e164 = 'Numéro WhatsApp au format international (ex. +24177000000)';
      }
      if (form.objectif !== 'whatsapp' && !form.url_destination) e.url_destination = 'Lien de destination requis';
      if (form.ciblage.age_min > form.ciblage.age_max) e['ciblage.age_min'] = 'Âges incohérents';
    }
    if (n === 3) {
      if (!Number.isInteger(form.total_fcfa) || form.total_fcfa < parametres.total_min_fcfa || form.total_fcfa > parametres.total_max_fcfa) {
        e.total_fcfa = `Montant entre ${formaterFcfa(parametres.total_min_fcfa)} et ${formaterFcfa(parametres.total_max_fcfa)}`;
      }
      if (devis && devis.budget_jour_fcfa < parametres.budget_jour_min_fcfa) {
        e.duree_jours = `Budget publicitaire trop faible (${formaterFcfa(devis.budget_jour_fcfa)}/jour, minimum ${formaterFcfa(parametres.budget_jour_min_fcfa)}) : augmentez le montant ou réduisez la durée`;
      }
    }
    setErreurs(e);
    return Object.keys(e).length === 0;
  };

  const appliquerErreursServeur = (champs: ErreurChamp[]) => {
    setErreurs(Object.fromEntries(champs.map((c) => [c.field, c.message])));
    const etapeFautive = [1, 2, 3].find((n) => champs.some((c) => CHAMPS_PAR_ETAPE[n].some((p) => c.field === p || c.field.startsWith(`${p}.`))));
    if (etapeFautive) setEtape(etapeFautive);
  };

  const suivant = async () => {
    if (!validerEtape(etape)) return;
    if (etape < 3) {
      const prochaine = etape + 1;
      setEtape(prochaine);
      if (modifie.current || !boostRef.current) void enregistrer(prochaine);
      return;
    }
    // Étape 3 → 4 : enregistrement puis soumission (devis figé côté serveur)
    setSoumission(true);
    try {
      const enregistre = await enregistrer(4);
      if (!enregistre) {
        erreur("Impossible d'enregistrer le brouillon");
        return;
      }
      const soumis = enregistre.statut === 'en_attente_paiement' ? enregistre : await soumettreBoost(enregistre.id);
      boostRef.current = soumis;
      setBoost(soumis);
      setEtape(4);
    } catch (err) {
      const champs = erreursDeChamps(err);
      if (champs.length) appliquerErreursServeur(champs);
      else erreur(messageErreur(err, 'Soumission impossible'));
    } finally {
      setSoumission(false);
    }
  };

  const modifier = async () => {
    if (!boost) return;
    try {
      const b = await annulerSoumissionBoost(boost.id);
      boostRef.current = b;
      setBoost(b);
      setEtape(3);
    } catch (err) {
      erreur(messageErreur(err, 'Modification impossible'));
    }
  };

  const supprimer = async () => {
    if (!boost || boost.statut !== 'brouillon') return;
    if (!window.confirm('Supprimer ce brouillon ?')) return;
    try {
      await supprimerBrouillonBoost(boost.id);
      succes('Brouillon supprimé');
      router.push(`/admin/${boutique.slug}/boost`);
    } catch (err) {
      erreur(messageErreur(err, 'Suppression impossible'));
    }
  };

  // ---------------------------------------------------------------- visuel
  const choisirVisuel = async (fichier: File | undefined) => {
    if (!fichier) return;
    if (!fichier.type.startsWith('image/')) {
      setErreurs((e) => ({ ...e, image_url: 'Le fichier doit être une image' }));
      return;
    }
    setUpload(true);
    try {
      const r = await uploadImage(fichier, boutique.slug, 'boosts');
      majForm({ image_url: r.url });
    } catch (err) {
      setErreurs((e) => ({ ...e, image_url: messageErreur(err, "Échec de l'envoi de l'image") }));
    } finally {
      setUpload(false);
    }
  };

  // ---------------------------------------------------------------- paiement
  const erreurMsisdn = modePaiement === 'mobile' ? validateMsisdn(msisdn, operateur) : '';
  const peutPayer = modePaiement === 'carte' || (msisdn.length === 9 && !erreurMsisdn);

  const payer = async () => {
    if (!boost || !peutPayer) return;
    setPaiementEnCours(true);
    annulation.current = { cancelled: false };
    try {
      if (modePaiement === 'carte') {
        const r = await payerBoost(boost.id, {
          mode: 'carte',
          return_url: `${window.location.origin}/admin/${boutique.slug}/boost/${boost.id}?paiement=carte`
        });
        if (r.url) window.location.href = r.url;
        return;
      }
      const r = await payerBoost(boost.id, { mode: 'mobile', operateur: operateur === 'moov' ? 'moovmoney' : 'airtelmoney', msisdn });
      setCompteARebours(true);
      const verif = await verifierPaiementEnBoucle(r.bill_id, 120000, 5000, annulation.current);
      setCompteARebours(false);
      if (verif.status === 'paye' || verif.status === 'paid' || verif.status === 'processed') {
        succes('Paiement reçu : votre publicité est en cours de validation par l’équipe Marché 241', 'Paiement confirmé');
        router.push(`/admin/${boutique.slug}/boost/${boost.id}`);
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
  // Chaque étape repart du haut : sinon on arrive au milieu de l'étape suivante (scroll conservé)
  const haut = useRef<HTMLDivElement>(null);
  useEffect(() => {
    haut.current?.scrollIntoView({ block: 'start' });
  }, [etape]);

  const estimationCourante = useMemo(
    () => impressions?.find((i) => i.total_fcfa === form.total_fcfa) ?? null,
    [impressions, form.total_fcfa]
  );

  // À l'étape 0 et au paiement (devis figé), le retour ramène à la liste des publicités
  const retourEnHaut = (
    <button
      type="button"
      onClick={() => (etape === 0 || etape === 4 ? router.push(`/admin/${boutique.slug}/boost`) : setEtape(etape - 1))}
      className="mb-4 inline-flex items-center gap-1 rounded-lg px-2 py-1.5 -ml-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    >
      <ArrowLeft className="h-4 w-4" /> {etape === 0 || etape === 4 ? 'Mes publicités' : 'Retour'}
    </button>
  );

  if (etape === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        {retourEnHaut}
        <TypePubSelector plateformeDisponible={parametres.types.plateforme} onChoisirMeta={() => { setEtape(1); if (!brouillon && !produitInitialId) void appliquerPrefill(null); }} />
      </div>
    );
  }

  const durees = parametres.durees.filter((d) => d >= parametres.duree_min_jours && d <= parametres.duree_max_jours);

  return (
    <div ref={haut} className="mx-auto max-w-6xl scroll-mt-6">
      {compteARebours && (
        <PaymentCountdown
          duration={120}
          onComplete={() => setCompteARebours(false)}
          onCancel={annulerPaiement}
          paymentMethod={operateur === 'moov' ? 'Moov Money' : 'Airtel Money'}
          phoneNumber={msisdn}
        />
      )}

      {retourEnHaut}

      {/* Stepper */}
      <ol className="mb-6 grid grid-cols-4 gap-2">
        {ETAPES.map((e) => {
          const fait = etape > e.id;
          const actif = etape === e.id;
          const cliquable = !verrouille && e.id < etape;
          return (
            <li key={e.id}>
              <button
                type="button"
                disabled={!cliquable}
                onClick={() => cliquable && setEtape(e.id)}
                className={`w-full border-t-4 pt-2 text-left text-xs sm:text-sm ${
                  actif ? 'border-black font-semibold text-gray-900' : fait ? 'border-gray-800 text-gray-700' : 'border-gray-200 text-gray-400'
                } ${cliquable ? 'cursor-pointer hover:text-black' : 'cursor-default'}`}
              >
                <span className="flex items-center gap-1">
                  {fait ? <Check className="h-3.5 w-3.5" /> : <span className="text-gray-400">0{e.id}</span>}
                  <span className="hidden sm:inline">{e.label}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
          {etape === 1 && (
            <div className="space-y-5">
              <div>
                <p className="mb-2 text-sm font-medium text-gray-900">Que voulez-vous promouvoir ?</p>
                <div className="grid grid-cols-2 gap-2 max-w-md">
                  {(['boutique', 'produit'] as TypeCibleBoost[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        if (t === 'boutique') {
                          majForm({ type_cible: 'boutique', produit_id: null });
                          void appliquerPrefill(null);
                        } else majForm({ type_cible: 'produit' });
                      }}
                      className={`rounded-lg border px-3 py-2 text-sm ${form.type_cible === t ? 'border-black bg-black text-white' : 'border-gray-300 bg-white text-gray-700'}`}
                    >
                      {t === 'boutique' ? 'Ma boutique' : 'Un produit'}
                    </button>
                  ))}
                </div>
              </div>

              {form.type_cible === 'produit' && (
                <Champ label="Produit" erreur={erreurs.produit_id}>
                  <select
                    value={form.produit_id ?? ''}
                    onChange={(e) => {
                      const id = e.target.value ? Number(e.target.value) : null;
                      majForm({ produit_id: id });
                      if (id) void appliquerPrefill(id);
                    }}
                    className={classeInput(erreurs.produit_id)}
                  >
                    <option value="">Choisir un produit…</option>
                    {produits.map((p) => (
                      <option key={p.id} value={p.id}>{p.nom}</option>
                    ))}
                  </select>
                </Champ>
              )}

              <Champ label="Visuel" erreur={erreurs.image_url} aide="Image nette, peu de texte. Format paysage recommandé (1200 × 628).">
                <div className="flex items-center gap-3">
                  {form.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.image_url} alt="" className="h-16 w-28 rounded-lg border border-gray-200 object-cover" />
                  )}
                  <span className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    {upload ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                    {form.image_url ? 'Changer le visuel' : 'Ajouter un visuel'}
                    <input type="file" accept="image/*" className="hidden" disabled={upload} onChange={(e) => void choisirVisuel(e.target.files?.[0])} />
                  </span>
                </div>
              </Champ>

              <Champ label="Titre" erreur={erreurs.titre} aide={`${form.titre.length}/80`}>
                <input value={form.titre} maxLength={80} onChange={(e) => majForm({ titre: e.target.value })} className={classeInput(erreurs.titre)} />
              </Champ>
              <Champ label="Texte de la publicité" erreur={erreurs.texte_principal} aide={`${form.texte_principal.length}/500`}>
                <textarea
                  value={form.texte_principal}
                  maxLength={500}
                  rows={4}
                  onChange={(e) => majForm({ texte_principal: e.target.value })}
                  className={classeInput(erreurs.texte_principal)}
                />
              </Champ>
              <Champ label="Description (facultatif)" erreur={erreurs.description}>
                <input value={form.description} maxLength={200} onChange={(e) => majForm({ description: e.target.value })} className={classeInput(erreurs.description)} />
              </Champ>
            </div>
          )}

          {etape === 2 && (
            <div className="space-y-6">
              <div>
                <p className="mb-2 text-sm font-medium text-gray-900">Objectif</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {OBJECTIFS.map(({ id, titre, texte, icone: Icone }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => majForm({ objectif: id })}
                      className={`rounded-xl border p-3 text-left transition ${form.objectif === id ? 'border-black ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <Icone className="h-5 w-5 text-gray-700" />
                      <p className="mt-2 text-sm font-semibold text-gray-900">{titre}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{texte}</p>
                    </button>
                  ))}
                </div>
              </div>

              {form.objectif === 'whatsapp' ? (
                <Champ label="Numéro WhatsApp qui recevra les messages" erreur={erreurs.whatsapp_e164} aide="Format international, ex. +24177000000">
                  <input value={form.whatsapp_e164} onChange={(e) => majForm({ whatsapp_e164: e.target.value })} className={classeInput(erreurs.whatsapp_e164)} placeholder="+241…" inputMode="tel" />
                </Champ>
              ) : (
                <Champ label="Lien de destination" erreur={erreurs.url_destination} aide="Page Marché 241 ouverte au clic (suivi des visites ajouté automatiquement).">
                  <input value={form.url_destination} onChange={(e) => majForm({ url_destination: e.target.value })} className={classeInput(erreurs.url_destination)} inputMode="url" />
                </Champ>
              )}

              <div className="border-t border-gray-100 pt-5">
                <p className="mb-3 text-sm font-semibold text-gray-900">Audience</p>
                <AudienceFields ciblage={form.ciblage} parametres={parametres} onChange={majCiblage} />
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 text-sm">
                <Users className="mt-0.5 h-4 w-4 text-gray-500" />
                <p className="text-gray-700">
                  {audience === null
                    ? 'Estimation de l’audience…'
                    : audience.disponible && audience.min
                      ? <>Audience estimée : <strong>{formaterNombre(audience.min)} – {formaterNombre(audience.max ?? audience.min)}</strong> personnes</>
                      : 'Estimation de l’audience indisponible pour le moment.'}
                </p>
              </div>
            </div>
          )}

          {etape === 3 && (
            <div className="space-y-6">
              <div>
                <p className="mb-2 text-sm font-medium text-gray-900">Formule</p>
                <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                  {parametres.packs.map((p) => {
                    const est = impressions?.find((i) => i.total_fcfa === p.total_fcfa);
                    const actif = form.total_fcfa === p.total_fcfa;
                    return (
                      <button
                        key={p.code}
                        type="button"
                        onClick={() => majForm({ total_fcfa: p.total_fcfa, duree_jours: p.duree_jours })}
                        className={`rounded-xl border p-3 text-left transition ${actif ? 'border-black ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <p className="text-xs font-medium uppercase text-gray-500">{p.nom}</p>
                        <p className="mt-1 text-base font-bold text-gray-900">{formaterFcfa(p.total_fcfa)}</p>
                        <p className="text-xs text-gray-500">{p.duree_jours} jours conseillés</p>
                        {/* Le volume total ne dépend que du budget (CPM), pas de la durée choisie */}
                        {est?.min ? <p className="mt-1 text-xs text-gray-600">~{formaterNombre(est.min * form.duree_jours)}+ vues au total</p> : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Champ label="Montant (FCFA)" erreur={erreurs.total_fcfa} aide={`Entre ${formaterFcfa(parametres.total_min_fcfa)} et ${formaterFcfa(parametres.total_max_fcfa)}`}>
                  <input
                    type="number"
                    min={parametres.total_min_fcfa}
                    max={parametres.total_max_fcfa}
                    step={500}
                    value={form.total_fcfa || ''}
                    onChange={(e) => majForm({ total_fcfa: Math.round(Number(e.target.value) || 0) })}
                    className={classeInput(erreurs.total_fcfa)}
                  />
                </Champ>
                <Champ label="Durée" erreur={erreurs.duree_jours}>
                  <div className="flex flex-wrap gap-2">
                    {durees.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => majForm({ duree_jours: d })}
                        className={`rounded-lg border px-3 py-2 text-sm ${form.duree_jours === d ? 'border-black bg-black text-white' : 'border-gray-300 bg-white text-gray-700'}`}
                      >
                        {d} j
                      </button>
                    ))}
                  </div>
                </Champ>
              </div>

              <div className="rounded-xl bg-gray-50 p-4 text-sm">
                {devis ? (
                  <dl className="space-y-1.5">
                    <div className="flex justify-between"><dt className="text-gray-600">Budget publicitaire (Meta)</dt><dd className="font-medium">{formaterFcfa(devis.budget_media_fcfa)}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-600">Frais de gestion Marché 241</dt><dd className="font-medium">{formaterFcfa(devis.commission_fcfa)}</dd></div>
                    {devis.tva_fcfa > 0 && <div className="flex justify-between"><dt className="text-gray-600">TVA</dt><dd className="font-medium">{formaterFcfa(devis.tva_fcfa)}</dd></div>}
                    <div className="flex justify-between border-t border-gray-200 pt-1.5 text-base"><dt className="font-semibold">Total</dt><dd className="font-bold">{formaterFcfa(devis.total_fcfa)}</dd></div>
                    <p className="pt-1 text-xs text-gray-500">
                      Soit {formaterFcfa(devis.budget_jour_fcfa)} par jour pendant {form.duree_jours} jours
                      {estimationCourante?.min ? <> · environ {formaterNombre(estimationCourante.min)} à {formaterNombre(estimationCourante.max ?? estimationCourante.min)} vues par jour</> : null}.
                    </p>
                    {devis.frais_encaissement_fcfa > 0 && (
                      <p className="text-xs text-gray-500">
                        En cas de remboursement, {formaterFcfa(devis.frais_encaissement_fcfa)} de frais d’encaissement (paiement mobile money ou carte) restent retenus.
                      </p>
                    )}
                  </dl>
                ) : (
                  <p className="text-gray-500">Calcul du devis…</p>
                )}
              </div>
            </div>
          )}

          {etape === 4 && boost && (
            <div className="space-y-6">
              <div className="rounded-xl bg-gray-50 p-4 text-sm">
                <dl className="space-y-1.5">
                  <div className="flex justify-between"><dt className="text-gray-600">Budget publicitaire (Meta)</dt><dd className="font-medium">{formaterFcfa(boost.budget_media_fcfa)}</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-600">Frais de gestion Marché 241</dt><dd className="font-medium">{formaterFcfa(boost.commission_fcfa)}</dd></div>
                  {boost.tva_fcfa > 0 && <div className="flex justify-between"><dt className="text-gray-600">TVA</dt><dd className="font-medium">{formaterFcfa(boost.tva_fcfa)}</dd></div>}
                  <div className="flex justify-between border-t border-gray-200 pt-1.5 text-base"><dt className="font-semibold">À payer</dt><dd className="font-bold">{formaterFcfa(boost.total_fcfa)}</dd></div>
                </dl>
                <p className="mt-2 text-xs text-gray-500">
                  Diffusion de {boost.duree_jours} jours après validation par l’équipe Marché 241. En cas de refus, ou si le budget n’est pas entièrement dépensé, la différence vous est remboursée
                  {boost.frais_encaissement_fcfa > 0 ? <>, hors frais d’encaissement de {formaterFcfa(boost.frais_encaissement_fcfa)} (non remboursables)</> : null}.
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
                        className={`rounded-lg border px-2 py-2.5 text-xs sm:text-sm font-medium ${actif ? 'border-black bg-black text-white' : 'border-gray-300 bg-white text-gray-700'}`}
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
                  Modifier la publicité
                </button>
                <button
                  type="button"
                  onClick={() => void payer()}
                  disabled={!peutPayer || paiementEnCours || parametres.kill_switch}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40"
                >
                  {paiementEnCours && <Loader2 className="h-4 w-4 animate-spin" />}
                  Payer {formaterFcfa(boost.total_fcfa)}
                </button>
              </div>
              {parametres.kill_switch && <p className="text-xs text-amber-700">Les nouvelles publicités sont momentanément suspendues.</p>}
            </div>
          )}

          {etape < 4 && (
            <div className="mt-6 flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setEtape(etape - 1)} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <ArrowLeft className="h-4 w-4" /> Retour
                </button>
                <span className="text-xs text-gray-500" aria-live="polite">
                  {enregistrement === 'en_cours' ? 'Enregistrement…' : enregistrement === 'ok' ? 'Brouillon enregistré' : enregistrement === 'erreur' ? 'Échec de l’enregistrement' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {boost?.statut === 'brouillon' && (
                  <button type="button" onClick={() => void supprimer()} className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600" aria-label="Supprimer le brouillon">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button type="button" onClick={() => void enregistrer(etape).then((b) => b && succes('Brouillon enregistré'))} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <Save className="h-4 w-4" /> <span className="hidden sm:inline">Enregistrer le brouillon</span>
                </button>
                <button
                  type="button"
                  onClick={() => void suivant()}
                  disabled={soumission || upload}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {soumission && <Loader2 className="h-4 w-4 animate-spin" />}
                  {etape === 3 ? 'Passer au paiement' : 'Continuer'} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-0 lg:self-start">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Aperçu Facebook</p>
          <AdPreview titre={form.titre} texte={form.texte_principal} description={form.description} imageUrl={form.image_url || null} objectif={form.objectif} />
        </aside>
      </div>
    </div>
  );
}
