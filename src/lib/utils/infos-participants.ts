import { estNumeroTelephoneValide } from '@/components/ui/PhoneNumberInput';

export const CHAMPS_PARTICIPANT = ['nom_complet', 'telephone', 'profession', 'email'] as const;
export type ChampParticipant = (typeof CHAMPS_PARTICIPANT)[number];

export interface InfosParticipantsConfig {
  actif: boolean;
  champs: ChampParticipant[];
}

export interface ParticipantBilletSaisie {
  nom_complet?: string;
  telephone?: string;
  profession?: string;
  email?: string;
}

export const LIBELLES_CHAMP_PARTICIPANT: Record<ChampParticipant, string> = {
  nom_complet: 'Nom complet',
  telephone: 'Téléphone',
  profession: 'Profession',
  email: 'Adresse email',
};

export function estChampParticipant(valeur: unknown): valeur is ChampParticipant {
  return typeof valeur === 'string' && (CHAMPS_PARTICIPANT as readonly string[]).includes(valeur);
}

export function normaliserInfosParticipants(valeur: unknown): InfosParticipantsConfig {
  if (!valeur || typeof valeur !== 'object') {
    return { actif: false, champs: [] };
  }
  const brut = valeur as { actif?: unknown; champs?: unknown };
  const champs = Array.isArray(brut.champs)
    ? (brut.champs.filter(estChampParticipant) as ChampParticipant[])
    : [];
  const unique = [...new Set(champs)];
  const actif = brut.actif === true;
  if (actif && !unique.includes('nom_complet')) {
    unique.unshift('nom_complet');
  }
  return { actif, champs: unique };
}

export function infosParticipantsDepuisProduit(produit: { variants?: unknown } | null | undefined): InfosParticipantsConfig {
  const variants = produit?.variants;
  if (!variants || typeof variants !== 'object') {
    return { actif: false, champs: [] };
  }
  const meta = (variants as { meta?: { infos_participants?: unknown } }).meta;
  return normaliserInfosParticipants(meta?.infos_participants);
}

const EMAIL_PARTICIPANT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Erreurs de saisie des fiches participants, indexées par `${cle}.${champ}`. */
export function erreursFichesParticipants(
  fiches: Array<{ cle: string; champs: ChampParticipant[] }>,
  valeurs: Record<string, ParticipantBilletSaisie>
): Record<string, string> {
  const erreurs: Record<string, string> = {};
  for (const fiche of fiches) {
    const saisie = valeurs[fiche.cle] || {};
    for (const champ of fiche.champs) {
      const valeur = (saisie[champ] || '').trim();
      // Le sélecteur de pays pré-remplit l'indicatif : un indicatif seul compte comme vide
      if (!valeur || (champ === 'telephone' && /^\+\d+$/.test(valeur) && valeur.length <= 4)) {
        erreurs[`${fiche.cle}.${champ}`] = `${LIBELLES_CHAMP_PARTICIPANT[champ]} requis`;
      } else if (champ === 'telephone' && !estNumeroTelephoneValide(valeur)) {
        erreurs[`${fiche.cle}.${champ}`] = 'Numéro de téléphone invalide';
      } else if (champ === 'email' && !EMAIL_PARTICIPANT.test(valeur)) {
        erreurs[`${fiche.cle}.${champ}`] = 'Adresse email invalide';
      }
    }
  }
  return erreurs;
}

/** Fiches participants déjà saisies sur la page produit et stockées dans le panier. */
export function participantsDepuisVariants(variants: unknown): ParticipantBilletSaisie[] {
  const participants = (variants as { participants?: unknown } | null | undefined)?.participants;
  if (!Array.isArray(participants)) return [];
  return participants.map((p) => {
    const source = p && typeof p === 'object' ? (p as Record<string, unknown>) : {};
    const fiche: ParticipantBilletSaisie = {};
    for (const champ of CHAMPS_PARTICIPANT) {
      if (typeof source[champ] === 'string') fiche[champ] = source[champ] as string;
    }
    return fiche;
  });
}
