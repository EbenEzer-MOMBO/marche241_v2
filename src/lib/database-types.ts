// Types TypeScript correspondant au schéma de base de données
// Modèle Logique de Données pour Marché 241

// Énumérations
export type StatutVendeur = 'actif' | 'inactif' | 'suspendu' | 'en_attente_verification';
export type Sexe = 'M' | 'F' | 'Autre';
export type StatutBoutique = 'active' | 'inactive' | 'en_attente' | 'suspendue';
export type StatutCategorie = 'active' | 'inactive';
export type StatutProduit = 'actif' | 'inactif' | 'brouillon' | 'en_attente_validation' | 'archive';
export type StatutCommande = 'en_attente' | 'confirmee' | 'en_preparation' | 'expedie' | 'livree' | 'annulee' | 'remboursee';
export type StatutPaiement = 'en_attente' | 'paye' | 'echec' | 'rembourse';
export type MethodePaiement = 'mobile_money' | 'airtel_money' | 'moov_money' | 'carte_bancaire' | 'especes' | 'virement';
export type StatutAvis = 'en_attente' | 'approuve' | 'rejete';

// Interface pour les dimensions
export interface Dimensions {
  longueur: number;
  largeur: number;
  hauteur: number;
}

// Interface pour les variantes de produit
export interface VarianteProduit {
  label: string;
  options: string[];
  required: boolean;
}

// Interface pour les variantes sélectionnées
export interface VariantesSelectionnees {
  [key: string]: string;
}

// Table vendeurs
export interface Vendeur {
  id: number;
  telephone: string; // Identifiant principal unique
  nom: string;
  email?: string; // Optionnel
  
  // Système d'authentification par code WhatsApp
  code_verification?: string; // Code à 4 chiffres
  code_expiration?: Date; // Date d'expiration du code
  tentatives_code: number; // Nombre de tentatives de saisie
  derniere_tentative?: Date; // Dernière tentative de connexion
  
  date_creation: Date;
  date_modification: Date;
  statut: StatutVendeur;
  photo_profil?: string;
  ville?: string;
  /** Numéro Mobile Money (Airtel / futur Moov) pour les reversements */
  numero_paiement?: string | null;
  verification_telephone: boolean;
  verification_email: boolean;
  derniere_connexion?: Date;
}

// Table boutiques
export interface Boutique {
  id: number;
  nom: string;
  slug: string; // URL-friendly name
  description?: string;
  vendeur_id: number;
  logo?: string;
  banniere?: string;
  couleur_primaire: string;
  couleur_secondaire: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  ville?: string;
  payment_restriction_mode: 'complet_uniquement' | 'livraison_uniquement' | 'les_deux' | 'acompte_50'; // Restriction de paiement de la boutique
  statut: StatutBoutique;
  date_creation: Date;
  date_modification: Date;
  nombre_produits: number;
  nombre_vues: number;
  note_moyenne: number;
  nombre_avis: number;
  est_verifiee: boolean; // Badge de vérification (attribution manuelle par un admin)

  // Relations
  vendeur?: Vendeur;
}

// Table catégories
export interface Categorie {
  id: number;
  nom: string;
  slug: string;
  description?: string;
  parent_id?: number;
  ordre_affichage: number;
  statut: StatutCategorie;
  date_creation: Date;
  date_modification: Date;
  boutique_id?: number;
  nombre_produits?: number;
  
  // Relations
  parent?: Categorie;
  enfants?: Categorie[];
}

// Table produits
export interface ProduitDB {
  id: number;
  nom: string;
  slug: string;
  description?: string;
  description_courte?: string;
  prix: number; // En centimes
  prix_original?: number; // En centimes
  prix_promo?: number; // En centimes - pour l'API
  sku?: string;
  boutique_id: number;
  categorie_id: number;
  images?: string[]; // Array d'URLs d'images
  image_principale?: string;
  variants?: any; // JSON dans la base de données
  en_stock: boolean;
  quantite_stock: number;
  stock?: number; // Alias pour quantite_stock (API)
  poids?: number; // En grammes
  dimensions?: any; // JSON dans la base de données
  tags?: string[]; // Array de tags
  specifications?: Record<string, string>; // Spécifications du produit
  note_moyenne: number;
  nombre_avis: number;
  nombre_vues: number;
  nombre_ventes: number;
  est_nouveau: boolean;
  est_en_promotion: boolean;
  est_featured: boolean;
  actif?: boolean; // Alias pour statut === 'actif'
  statut: StatutProduit;
  date_creation: Date;
  date_modification: Date;
  date_publication?: Date;
  
  // Relations
  boutique?: Boutique;
  categorie?: Categorie;
}

// Table commandes
export interface Commande {
  id: number;
  numero_commande: string; // Format: CMD-2024-001234
  boutique_id: number;
  
  // Informations client
  client_nom: string;
  client_telephone: string;
  client_adresse: string;
  client_ville: string;
  client_commune: string;
  client_instructions?: string;
  
  // Montants (en centimes)
  sous_total: number;
  frais_livraison: number;
  taxes: number;
  remise: number;
  total: number;
  
  // Statuts et paiement
  statut: StatutCommande;
  statut_paiement: StatutPaiement;
  methode_paiement?: MethodePaiement;
  
  // Dates
  date_commande: Date;
  date_confirmation?: Date;
  date_expedition?: Date;
  date_livraison?: Date;
  date_modification: Date;
  
  // Relations
  boutique?: Boutique;
  articles?: CommandeArticle[];
  transactions?: Transaction[];
}

// Table commande_articles
export interface CommandeArticle {
  id: number;
  commande_id: number;
  produit_id: number;
  nom_produit: string; // Sauvegarde du nom au moment de la commande
  prix_unitaire: number; // En centimes
  quantite: number;
  variants_selectionnes?: any; // JSON dans la base de données
  sous_total: number; // En centimes
  
  // Relations
  commande?: Commande;
  produit?: ProduitDB;
}

export interface Billet {
  id: number;
  commande_id: number;
  produit_id: number;
  type_billet: string;
  numero: number;
  jeton: string;
  scanne_le?: Date | null;
  date_creation: Date;
}

// Table transactions
export interface Transaction {
  id: number;
  commande_id: number; // NULL en base pour une transaction de boost (boost_id renseigné)
  boost_id?: number | null; // Boost publicitaire payé (type_paiement = 'boost')
  reference_transaction: string; // Référence unique de la transaction
  montant: number; // Montant en centimes
  methode_paiement: MethodePaiement;
  statut: StatutPaiement;
  
  // Informations de paiement mobile
  numero_telephone?: string; // Numéro utilisé pour le paiement mobile
  reference_operateur?: string; // Référence fournie par l'opérateur (Airtel/Moov)
  
  // Dates
  date_creation: Date;
  date_confirmation?: Date; // Date de confirmation du paiement
  date_modification: Date;
  
  // Informations supplémentaires
  notes?: string; // Notes internes
  
  // Relations
  commande?: Commande;
}

// Table avis_produits
export interface AvisProduit {
  id: number;
  produit_id: number;
  commande_id?: number;
  nom_client: string;
  email_client?: string;
  telephone_client?: string;
  note: number; // 1-5
  commentaire?: string;
  statut: StatutAvis;
  date_creation: Date;
  date_moderation?: Date;
  
  // Relations
  produit?: ProduitDB;
  commande?: Commande;
}

// Table paniers
export interface Panier {
  id: number;
  session_id: string;
  boutique_id: number;
  produit_id: number;
  quantite: number;
  variants_selectionnes?: any; // JSON dans la base de données
  date_creation: Date;
  date_modification: Date;
  
  // Relations
  boutique?: Boutique;
  produit?: ProduitDB;
}

// Vues
export interface ProduitComplet extends ProduitDB {
  nom_boutique: string;
  slug_boutique: string;
  logo_boutique?: string;
  nom_categorie: string;
  slug_categorie: string;
  nom_vendeur: string;
  telephone_vendeur: string;
}

export interface CommandeResume extends Commande {
  nom_boutique: string;
  nom_vendeur: string;
  telephone_vendeur: string;
  nombre_articles: number;
  quantite_totale: number;
}

// Types pour les réponses API
export interface ApiBoutiqueResponse {
  success: boolean;
  boutique: Boutique;
}

export interface ApiProduitResponse {
  success: boolean;
  produit: ProduitDB;
}

export interface ApiProduitsResponse {
  success: boolean;
  produits: ProduitDB[];
  total?: number;
  page?: number;
  limite?: number;
}

// Types pour les catégories avec produits
export interface CategorieAvecProduits {
  categorie: Categorie;
  produits: ProduitDB[];
}

export interface ApiCategoriesProduitsResponse {
  success: boolean;
  categories: {
    [slug: string]: CategorieAvecProduits;
  };
}

// Types pour la liste des catégories
export interface ApiCategoriesResponse {
  success: boolean;
  categories: Categorie[];
}

// Types pour l'affichage simplifié des produits
export interface ProduitAffichage {
  id: number;
  nom: string;
  slug: string;
  prix: number;
  prix_original?: number;
  image_principale?: string;
  est_nouveau: boolean;
  est_en_promotion: boolean;
  est_featured: boolean;
  en_stock: boolean;
  note_moyenne: number;
  nombre_avis: number;
  boutique: {
    id: number;
    nom: string;
    logo?: string;
    slug: string;
  };
  categorie: {
    id: number;
    nom: string;
    slug: string;
  };
}

// Type pour l'affichage détaillé d'un produit (page produit)
export interface ProduitDetail {
  id: number;
  nom: string;
  slug: string;
  description?: string;
  description_courte?: string;
  prix: number;
  prix_original?: number;
  sku?: string;
  images?: string[]; // Tableau d'URLs d'images
  image_principale?: string;
  variants?: { [key: string]: any }; // Variantes (couleur, taille, etc.)
  en_stock: boolean;
  quantite_stock: number;
  poids?: number;
  dimensions?: { [key: string]: any };
  tags?: string[];
  note_moyenne: number;
  nombre_avis: number;
  nombre_vues: number;
  nombre_ventes: number;
  est_nouveau: boolean;
  est_en_promotion: boolean;
  est_featured: boolean;
  statut: StatutProduit;
  date_creation: string;
  date_modification: string;
  date_publication?: string;
  boutique: {
    id: number;
    nom: string;
    logo?: string;
    slug: string;
    statut: string;
    adresse?: string;
    telephone?: string;
    vendeur_id: number;
    description?: string;
    nombre_avis: number;
    note_moyenne: number;
    date_creation: string;
    nombre_produits: number;
    couleur_primaire?: string;
    couleur_secondaire?: string;
    date_modification: string;
  };
  categorie: {
    id: number;
    nom: string;
    slug: string;
    statut: string;
    parent_id?: number;
    boutique_id: number;
    description?: string;
    date_creation: string;
    ordre_affichage: number;
    date_modification: string;
  };
}

// Types pour les formulaires et API
export interface CreateVendeurData {
  telephone: string;
  nom: string;
  email?: string;
  ville?: string;
}

// ===================================
// Interface pour les communes de livraison
// ===================================

export interface CommuneLivraison {
  id: number;
  boutique_id: number;
  nom_commune: string;
  delimitation?: string;
  tarif_livraison: number;
  delai_livraison_min: number;
  delai_livraison_max: number;
  est_active: boolean;
  date_creation: Date;
  date_modification: Date;
}

export interface CreateCommuneLivraison {
  boutique_id: number;
  nom_commune: string;
  delimitation?: string;
  tarif_livraison: number;
  delai_livraison_min?: number;
  delai_livraison_max?: number;
  est_active?: boolean;
}

export interface UpdateCommuneLivraison {
  nom_commune?: string;
  delimitation?: string;
  tarif_livraison?: number;
  delai_livraison_min?: number;
  delai_livraison_max?: number;
  est_active?: boolean;
}

// ===================================
// Interfaces pour l'authentification
// ===================================

// Types pour l'authentification par code WhatsApp
export interface DemandeCodeVerification {
  telephone: string;
}

export interface VerificationCode {
  telephone: string;
  code: string;
}

export interface ConnexionVendeur {
  telephone: string;
  code: string;
}

export interface ReponseAuthentification {
  success: boolean;
  vendeur?: Vendeur;
  token?: string;
  message?: string;
  tentatives_restantes?: number;
}

export interface CreateBoutiqueData {
  nom: string;
  slug: string;
  description?: string;
  vendeur_id: number;
  logo?: string;
  couleur_primaire?: string;
  couleur_secondaire?: string;
  adresse?: string;
  telephone?: string;
}

export interface CreateProduitData {
  nom: string;
  slug: string;
  description?: string;
  description_courte?: string;
  prix: number;
  prix_original?: number;
  sku?: string;
  boutique_id: number;
  categorie_id: number;
  images?: any; // JSON dans la base de données
  image_principale?: string;
  variants?: any; // JSON dans la base de données
  quantite_stock?: number;
  poids?: number;
  dimensions?: any; // JSON dans la base de données
  tags?: any; // JSON dans la base de données
  est_nouveau?: boolean;
  est_en_promotion?: boolean;
  est_featured?: boolean;
}

export interface CreateCommandeData {
  boutique_id: number;
  client_nom: string;
  client_telephone: string;
  client_adresse: string;
  client_ville: string;
  client_commune: string;
  client_instructions?: string;
  articles: {
    produit_id: number;
    quantite: number;
    variants_selectionnes?: any; // JSON dans la base de données
  }[];
  frais_livraison?: number;
  methode_paiement?: MethodePaiement;
}

// Types pour les statistiques
export interface StatistiquesBoutique {
  nombre_produits: number;
  nombre_commandes: number;
  chiffre_affaires: number; // En centimes
  note_moyenne: number;
  nombre_avis: number;
  produits_populaires: ProduitDB[];
  commandes_recentes: Commande[];
}

export interface StatistiquesVendeur {
  nombre_boutiques: number;
  chiffre_affaires_total: number; // En centimes
  nombre_commandes_total: number;
  boutiques: (Boutique & { statistiques: StatistiquesBoutique })[];
}

// Types pour les filtres et recherche
export interface FiltresProduits {
  categorie_id?: number;
  prix_min?: number;
  prix_max?: number;
  commune_id?: number;
  en_stock?: boolean;
  est_nouveau?: boolean;
  est_en_promotion?: boolean;
  note_min?: number;
  boutique_id?: number;
  recherche?: string;
  q?: string;
  tags?: string[];
}

export interface FiltresCommandes {
  statut?: StatutCommande;
  statut_paiement?: StatutPaiement;
  date_debut?: Date;
  date_fin?: Date;
  boutique_id?: number;
  client_telephone?: string;
  numero_commande?: string;
}

// Types pour la pagination
export interface OptionsPagination {
  page: number;
  limite: number;
  tri_par?: string;
  ordre?: 'ASC' | 'DESC';
}

export interface ResultatPagine<T> {
  donnees: T[];
  total: number;
  page: number;
  limite: number;
  total_pages: number;
}
// ============================================
// Boost publicitaire Meta Ads (migrations 026/027)
// ============================================

export type StatutBoost =
  | 'brouillon'
  | 'en_attente_paiement'
  | 'en_attente_validation'
  | 'refuse'
  | 'actif'
  | 'en_pause'
  | 'termine'
  | 'rejete_meta'
  | 'erreur';
export type ObjectifBoost = 'trafic' | 'whatsapp' | 'notoriete';
export type TypeCibleBoost = 'boutique' | 'produit';
export type StatutRemboursementBoost = 'aucun' | 'a_rembourser' | 'rembourse';
export type SexeCiblage = 'homme' | 'femme';

export interface CiblageBoost {
  pays: string[]; // codes ISO 2 lettres
  villes: string[]; // clés géo Meta
  age_min: number;
  age_max: number;
  sexes: SexeCiblage[];
  langues: string[]; // locales Meta
  interets: string[]; // IDs d'intérêts Meta
  etape_wizard?: number;
}

// Table boosts
export interface Boost {
  id: number;
  boutique_id: number;
  vendeur_id: number;
  type_cible: TypeCibleBoost;
  produit_id: number | null;
  objectif: ObjectifBoost;
  statut: StatutBoost;
  nom: string;

  budget_media_fcfa: number;
  commission_bps: number;
  commission_fcfa: number;
  tva_fcfa: number;
  frais_encaissement_fcfa: number; // frais eBilling non remboursables, figés à la soumission (inclus dans total_fcfa)
  total_fcfa: number; // montant payé par le vendeur
  depense_fcfa: number;

  duree_jours: number;
  date_debut: Date | null;
  date_fin: Date | null;

  ciblage: CiblageBoost;
  url_destination: string | null;
  whatsapp_e164: string | null;

  titre: string | null;
  texte_principal: string | null;
  description: string | null;
  image_url: string | null;
  cta: string;

  note_revue: string | null;
  conformite: string[] | null;
  valide_par: string | null;
  date_validation: Date | null;

  meta_campaign_id: string | null;
  meta_adset_id: string | null;
  meta_ad_id: string | null;
  meta_statut_effectif: string | null;
  meta_derniere_erreur: string | null;
  dry_run: boolean;
  date_derniere_synchro: Date | null;

  statut_remboursement: StatutRemboursementBoost;
  montant_a_rembourser_fcfa: number;
  date_remboursement: Date | null;
  note_remboursement: string | null;

  date_soumission: Date | null;
  date_paiement: Date | null;
  date_cloture: Date | null;
  date_creation: Date;
  date_modification: Date;

  // Relations
  boutique?: Pick<Boutique, 'id' | 'nom' | 'slug' | 'logo'>;
}

// Table boost_insights_jour
export interface BoostInsightJour {
  id: number;
  boost_id: number;
  date: string; // AAAA-MM-JJ
  depense_fcfa: number;
  depense_devise: number;
  impressions: number;
  portee: number;
  clics: number;
  messages: number;
  brut?: unknown;
  date_maj: Date;
}

// Table boost_evenements
export interface BoostEvenement {
  id: number;
  boost_id: number;
  type_evenement: string;
  acteur: 'vendeur' | 'admin' | 'systeme' | 'meta';
  donnees: Record<string, unknown> | null;
  date_creation: Date;
}

export interface PackBoost {
  code: string;
  nom: string;
  total_fcfa: number; // montant payé par le vendeur
  duree_jours: number;
}

// Table boost_parametres (clé/valeur), une fois typée
export interface BoostParametres {
  commission_bps: number;
  commission_min_fcfa: number;
  tva_bps: number;
  frais_encaissement_bps: number; // frais eBilling retenus sur les remboursements (250 = 2,5 %)
  total_min_fcfa: number;
  total_max_fcfa: number;
  duree_min_jours: number;
  duree_max_jours: number;
  packs: PackBoost[];
  fx_xaf_par_usd: number;
  cpm_min_fcfa: number;
  cpm_max_fcfa: number;
  budget_jour_min_fcfa: number;
  kill_switch: boolean;
}

// Table meta_connexion (ligne unique, migration 028) : connexion Meta Ads découverte et choisie dans
// le back-office. Aucun secret (jeton et secret d'app restent dans l'environnement de l'API).
export interface MetaConnexion {
  id: 1;
  ad_account_id: string | null; // sans préfixe act_
  ad_account_nom: string | null;
  devise: string | null;
  fuseau: string | null;
  statut_compte: number | null; // account_status Meta : 1 = actif
  page_id: string | null;
  page_nom: string | null;
  instagram_id: string | null;
  instagram_nom: string | null;
  jeton_valide: boolean | null;
  jeton_permissions: string[];
  jeton_expire_le: Date | null;
  verifie_le: Date | null;
  message_erreur: string | null;
  modifie_par: string | null;
  date_modification: Date;
}
