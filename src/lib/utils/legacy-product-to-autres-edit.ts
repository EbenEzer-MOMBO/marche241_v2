/**
 * Convertit un produit admin (formats legacy) vers le payload attendu par GenericProductForm (catégorie "autres").
 */

export interface LegacyProductInput {
  id: number;
  nom: string;
  description?: string;
  prix: number;
  prix_original?: number;
  image_principale?: string;
  images?: string[];
  variants?: unknown;
  actif: boolean;
  categorie?: { id: number };
}

const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Variante déjà au format GenericProductForm */
const looksLikeGenericVariant = (v: unknown): boolean => {
  if (!isRecord(v)) return false;
  return Array.isArray(v.attributes);
};

/** Ancienne variante ProduitModal : { nom, quantite, prix?, ... } */
const looksLikeLegacyVariant = (v: unknown): boolean => {
  if (!isRecord(v)) return false;
  return typeof v.nom === 'string' && !Array.isArray(v.attributes);
};

const mapLegacyVariant = (
  raw: unknown,
  index: number,
  fallbackPrix: number
): Record<string, unknown> => {
  if (!isRecord(raw)) {
    return {
      id: newId(),
      attributes: [{ type: 'personnalise', value: `Variante ${index + 1}` }],
      stock: 0,
      prix: fallbackPrix
    };
  }

  const nom = typeof raw.nom === 'string' && raw.nom.trim() ? raw.nom : `Variante ${index + 1}`;
  const quantite = typeof raw.quantite === 'number' ? raw.quantite : 0;
  const prix =
    typeof raw.prix === 'number' && raw.prix > 0 ? raw.prix : fallbackPrix;
  const prix_promo = typeof raw.prix_promo === 'number' ? raw.prix_promo : undefined;
  const image = typeof raw.image === 'string' ? raw.image : undefined;

  return {
    id: typeof raw.id === 'string' ? raw.id : newId(),
    ...(image ? { image } : {}),
    attributes: [{ type: 'personnalise', value: nom }],
    stock: quantite,
    prix,
    ...(prix_promo !== undefined ? { prix_promo } : {})
  };
};

const mapLegacyOption = (raw: unknown, index: number): Record<string, unknown> => {
  if (!isRecord(raw)) {
    return {
      id: newId(),
      libelle: `Option ${index + 1}`,
      type: 'text',
      obligatoire: false
    };
  }
  const nom = typeof raw.nom === 'string' ? raw.nom : `Option ${index + 1}`;
  const typeRaw = raw.type;
  const type =
    typeRaw === 'numero' ? 'number' : 'text';
  return {
    id: newId(),
    libelle: nom,
    type,
    obligatoire: Boolean(raw.required)
  };
};

/**
 * Produit legacy → données pour GenericProductForm (autres).
 */
export const legacyProductToAutresEditPayload = (product: LegacyProductInput) => {
  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.image_principale
        ? [product.image_principale]
        : [];

  const basePrix = product.prix_original ?? product.prix;

  let variantsRaw: unknown[] = [];
  let optionsRaw: unknown[] = [];
  let personnalisationsRaw: unknown[] = [];

  const v = product.variants;

  if (Array.isArray(v)) {
    variantsRaw = v;
  } else if (isRecord(v)) {
    if (Array.isArray(v.variants)) {
      variantsRaw = v.variants as unknown[];
    }
    if (Array.isArray(v.options)) {
      optionsRaw = v.options as unknown[];
    }
    if (Array.isArray(v.personnalisations)) {
      personnalisationsRaw = v.personnalisations as unknown[];
    }
  }

  let variantsOut: Record<string, unknown>[] = [];

  if (variantsRaw.length > 0) {
    const allGeneric = variantsRaw.every(looksLikeGenericVariant);
    if (allGeneric) {
      variantsOut = variantsRaw.map((item, i) => {
        if (!isRecord(item)) {
          return mapLegacyVariant(item, i, basePrix);
        }
        const id =
          typeof item.id === 'string' && item.id
            ? item.id
            : newId();
        return { ...item, id };
      }) as Record<string, unknown>[];
    }

    const allLegacy = variantsRaw.every(looksLikeLegacyVariant);
    if (allLegacy) {
      variantsOut = variantsRaw.map((item, i) =>
        mapLegacyVariant(item, i, basePrix)
      ) as Record<string, unknown>[];
    } else {
      variantsOut = variantsRaw.map((item, i) => {
        if (looksLikeGenericVariant(item) && isRecord(item)) {
          const id =
            typeof item.id === 'string' && item.id
              ? item.id
              : newId();
          return { ...item, id };
        }
        return mapLegacyVariant(item, i, basePrix);
      }) as Record<string, unknown>[];
    }
  }

  const fromOptions = optionsRaw.map((o, i) => mapLegacyOption(o, i));

  const fromPersonnalisations = personnalisationsRaw.map((p, i) => {
    if (!isRecord(p)) {
      return mapLegacyOption({}, i);
    }
    if (typeof p.libelle === 'string' && (p.type === 'text' || p.type === 'number')) {
      return {
        id: typeof p.id === 'string' ? p.id : newId(),
        libelle: p.libelle,
        type: p.type,
        obligatoire: Boolean(p.obligatoire),
        ...(typeof p.prix_supplementaire === 'number'
          ? { prix_supplementaire: p.prix_supplementaire }
          : {})
      };
    }
    return mapLegacyOption(p, i);
  });

  const personnalisations = [...fromOptions, ...fromPersonnalisations];

  return {
    id: product.id,
    nom: product.nom,
    description: product.description,
    categorie_id: product.categorie?.id || 0,
    statut: product.actif ? 'actif' : 'inactif',
    images,
    variants: variantsOut,
    personnalisations
  };
};
