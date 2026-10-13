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
