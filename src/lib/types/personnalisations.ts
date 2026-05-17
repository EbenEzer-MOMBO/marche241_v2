/**
 * Définitions et sélection panier pour les options de personnalisation client.
 * Aligné sur l’admin (Customization dans GenericProductForm).
 */

export type PersonnalisationProduitDef = {
  id: string;
  libelle: string;
  type: 'text' | 'number';
  prix_supplementaire?: number;
  obligatoire: boolean;
};

export type PersonnalisationSelectionPanier = {
  id: string;
  libelle: string;
  type: 'text' | 'number';
  valeur: string;
  prix_supplementaire: number;
};

export type PersonnalisationEtatFormulaire = {
  active: boolean;
  value: string;
};

export const createInitialPersonnalisationsEtat = (
  definitions: PersonnalisationProduitDef[]
): Record<string, PersonnalisationEtatFormulaire> => {
  const out: Record<string, PersonnalisationEtatFormulaire> = {};
  for (const definition of definitions) {
    out[definition.id] = {
      active: Boolean(definition.obligatoire),
      value: '',
    };
  }
  return out;
};

/** Supplément par unité côté fiche produit (actif + valeur saisie) */
export const getSupplementDepuisEtatEtDefinitions = (
  definitions: PersonnalisationProduitDef[],
  etat: Record<string, PersonnalisationEtatFormulaire>
): number => {
  let sum = 0;
  for (const definition of definitions) {
    const row = etat[definition.id];
    if (!row?.active) {
      continue;
    }
    if (!row.value.trim()) {
      continue;
    }
    sum += Number(definition.prix_supplementaire) || 0;
  }
  return sum;
};

export const composePersonnalisationSelectionsPourPanier = (
  definitions: PersonnalisationProduitDef[],
  etat: Record<string, PersonnalisationEtatFormulaire>
): PersonnalisationSelectionPanier[] => {
  const out: PersonnalisationSelectionPanier[] = [];
  for (const definition of definitions) {
    const row = etat[definition.id];
    if (!row?.active) {
      continue;
    }
    const trimmed = row.value.trim();
    if (!trimmed) {
      continue;
    }
    out.push({
      id: definition.id,
      libelle: definition.libelle,
      type: definition.type,
      valeur: trimmed,
      prix_supplementaire: Number(definition.prix_supplementaire) || 0,
    });
  }
  return out;
};

/**
 * Validation avant ajout panier ; retourne un map id → message ou undefined si aucune erreur.
 */
export const collectPersonnalisationsValidationErrors = (
  definitions: PersonnalisationProduitDef[],
  etat: Record<string, PersonnalisationEtatFormulaire>
): Record<string, string> | undefined => {
  const errors: Record<string, string> = {};
  for (const definition of definitions) {
    const row = etat[definition.id] ?? { active: false, value: '' };
    if (definition.obligatoire) {
      const trimmed = row.value.trim();
      if (!trimmed) {
        errors[definition.id] = `« ${definition.libelle} » est obligatoire.`;
        continue;
      }
      if (definition.type === 'number') {
        const n = Number(trimmed.replace(',', '.'));
        if (!Number.isFinite(n)) {
          errors[definition.id] = `« ${definition.libelle} » doit être un nombre valide.`;
        }
      }
      continue;
    }
    if (!row.active) {
      continue;
    }
    const trimmedOpt = row.value.trim();
    if (!trimmedOpt) {
      errors[definition.id] = `Complétez « ${definition.libelle} » ou décochez l’option.`;
      continue;
    }
    if (definition.type === 'number') {
      const n = Number(trimmedOpt.replace(',', '.'));
      if (!Number.isFinite(n)) {
        errors[definition.id] = `« ${definition.libelle} » doit être un nombre valide.`;
      }
    }
  }
  return Object.keys(errors).length > 0 ? errors : undefined;
};
