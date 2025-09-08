// Types TypeScript correspondant au schéma de base de données
// Modèle Logique de Données pour Marché 241

// Énumérations
export type StatutVendeur = 'actif' | 'inactif' | 'suspendu' | 'en_attente_verification';
export type Sexe = 'M' | 'F' | 'Autre';
export type StatutBoutique = 'active' | 'inactive' | 'en_attente' | 'suspendue';
export type StatutCategorie = 'active' | 'inactive';
export type StatutProduit = 'actif' | 'inactif' | 'brouillon' | 'archive';
export type StatutCommande = 'en_attente' | 'confirmee' | 'en_preparation' | 'expedie' | 'livree' | 'annulee' | 'remboursee';
export type StatutPaiement = 'en_attente' | 'paye' | 'echec' | 'rembourse';
export type MethodePaiement = 'mobile_money' | 'airtel_money' | 'moov_money' | 'especes' | 'virement';
export type StatutAvis = 'en_attente' | 'approuve' | 'rejete';

// Interface pour les horaires d'ouverture
export interface HorairesOuverture {
  lundi?: { ouverture: string; fermeture: string; ferme?: boolean };
  mardi?: { ouverture: string; fermeture: string; ferme?: boolean };
  mercredi?: { ouverture: string; fermeture: string; ferme?: boolean };
  jeudi?: { ouverture: string; fermeture: string; ferme?: boolean };
  vendredi?: { ouverture: string; fermeture: string; ferme?: boolean };
  samedi?: { ouverture: string; fermeture: string; ferme?: boolean };
  dimanche?: { ouverture: string; fermeture: string; ferme?: boolean };
}

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
  prenom: string;
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
  adresse?: string;
  ville?: string;
  pays: string;
  date_naissance?: Date;
  sexe?: Sexe;
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
  site_web?: string;
  horaires_ouverture?: HorairesOuverture;
  statut: StatutBoutique;
  date_creation: Date;
  date_modification: Date;
  nombre_produits: number;
  note_moyenne: number;
  nombre_avis: number;
  
  // Relations
  vendeur?: Vendeur;
}

// Table catégories
export interface Categorie {
  id: number;
  nom: string;
  slug: string;
  description?: string;
  icone?: string; // Emoji ou nom d'icône
  image?: string;
  parent_id?: number;
  ordre_affichage: number;
  statut: StatutCategorie;
  date_creation: Date;
  date_modification: Date;
  
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
  sku?: string;
  boutique_id: number;
  categorie_id: number;
  images?: string[]; // URLs des images
  image_principale?: string;
  variants?: VarianteProduit[];
  en_stock: boolean;
  quantite_stock: number;
  poids?: number; // En grammes
  dimensions?: Dimensions;
  tags?: string[];
  note_moyenne: number;
  nombre_avis: number;
  nombre_vues: number;
  nombre_ventes: number;
  est_nouveau: boolean;
  est_en_promotion: boolean;
  est_featured: boolean;
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
  client_prenom: string;
  client_telephone: string;
  client_email?: string;
  client_adresse: string;
  client_ville: string;
  client_pays: string;
  
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
  
  // Informations supplémentaires
  notes_client?: string;
  notes_vendeur?: string;
  code_suivi?: string;
  
  // Relations
  boutique?: Boutique;
  articles?: CommandeArticle[];
}

// Table commande_articles
export interface CommandeArticle {
  id: number;
  commande_id: number;
  produit_id: number;
  nom_produit: string; // Sauvegarde du nom au moment de la commande
  prix_unitaire: number; // En centimes
  quantite: number;
  variants_selectionnes?: VariantesSelectionnees;
  sous_total: number; // En centimes
  
  // Relations
  commande?: Commande;
  produit?: ProduitDB;
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
  variants_selectionnes?: VariantesSelectionnees;
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

// Types pour les formulaires et API
export interface CreateVendeurData {
  telephone: string;
  nom: string;
  prenom: string;
  email?: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  date_naissance?: string;
  sexe?: Sexe;
}

// ===================================
// Interface pour les communes de livraison
// ===================================

export interface CommuneLivraison {
  id: number;
  boutique_id: number;
  nom_commune: string;
  code_postal?: string;
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
  code_postal?: string;
  tarif_livraison: number;
  delai_livraison_min?: number;
  delai_livraison_max?: number;
  est_active?: boolean;
}

export interface UpdateCommuneLivraison {
  nom_commune?: string;
  code_postal?: string;
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
  banniere?: string;
  couleur_primaire?: string;
  couleur_secondaire?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  site_web?: string;
  horaires_ouverture?: HorairesOuverture;
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
  images?: string[];
  image_principale?: string;
  variants?: VarianteProduit[];
  quantite_stock?: number;
  poids?: number;
  dimensions?: Dimensions;
  tags?: string[];
  est_nouveau?: boolean;
  est_en_promotion?: boolean;
  est_featured?: boolean;
}

export interface CreateCommandeData {
  boutique_id: number;
  client_nom: string;
  client_prenom: string;
  client_telephone: string;
  client_email?: string;
  client_adresse: string;
  client_ville: string;
  client_pays?: string;
  articles: {
    produit_id: number;
    quantite: number;
    variants_selectionnes?: VariantesSelectionnees;
  }[];
  frais_livraison?: number;
  methode_paiement?: MethodePaiement;
  notes_client?: string;
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
  en_stock?: boolean;
  est_nouveau?: boolean;
  est_en_promotion?: boolean;
  note_min?: number;
  boutique_id?: number;
  recherche?: string;
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