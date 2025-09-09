-- Modèle Logique de Données (MLD) pour Marché 241
-- Base de données pour la plateforme e-commerce multi-boutiques
-- Compatible PostgreSQL

-- Création des types ENUM personnalisés pour PostgreSQL
CREATE TYPE statut_vendeur AS ENUM ('actif', 'inactif', 'suspendu', 'en_attente_verification');
CREATE TYPE sexe_type AS ENUM ('M', 'F', 'Autre');
CREATE TYPE statut_boutique AS ENUM ('active', 'inactive', 'en_attente', 'suspendue');
CREATE TYPE statut_categorie AS ENUM ('active', 'inactive');
CREATE TYPE statut_produit AS ENUM ('actif', 'inactif', 'brouillon', 'archive');
CREATE TYPE statut_commande AS ENUM ('en_attente', 'confirmee', 'en_preparation', 'expedie', 'livree', 'annulee', 'remboursee');
CREATE TYPE statut_paiement AS ENUM ('en_attente', 'paye', 'echec', 'rembourse');
CREATE TYPE methode_paiement AS ENUM ('mobile_money', 'airtel_money', 'moov_money', 'especes', 'virement');
CREATE TYPE statut_avis AS ENUM ('en_attente', 'approuve', 'rejete');

-- Table des vendeurs
CREATE TABLE public.vendeurs (
  id integer NOT NULL DEFAULT nextval('vendeurs_id_seq'::regclass),
  telephone character varying NOT NULL UNIQUE,
  nom character varying NOT NULL,
  email character varying,
  code_verification character varying,
  code_expiration timestamp without time zone,
  tentatives_code integer DEFAULT 0,
  derniere_tentative timestamp without time zone,
  date_creation timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  date_modification timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  statut USER-DEFINED DEFAULT 'en_attente_verification'::statut_vendeur,
  photo_profil character varying,
  ville character varying,
  verification_telephone boolean DEFAULT false,
  verification_email boolean DEFAULT false,
  derniere_connexion timestamp without time zone,
  CONSTRAINT vendeurs_pkey PRIMARY KEY (id)
);

-- Table des boutiques
CREATE TABLE public.boutiques (
  id integer NOT NULL DEFAULT nextval('boutiques_id_seq'::regclass),
  nom character varying NOT NULL,
  slug character varying NOT NULL UNIQUE,
  description text,
  vendeur_id integer NOT NULL,
  logo character varying,
  couleur_primaire character varying DEFAULT '#000000'::character varying,
  couleur_secondaire character varying DEFAULT '#ffffff'::character varying,
  adresse text,
  telephone character varying,
  statut USER-DEFINED DEFAULT 'en_attente'::statut_boutique,
  date_creation timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  date_modification timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  nombre_produits integer DEFAULT 0,
  note_moyenne numeric DEFAULT 0.00,
  nombre_avis integer DEFAULT 0,
  CONSTRAINT boutiques_pkey PRIMARY KEY (id),
  CONSTRAINT boutiques_vendeur_id_fkey FOREIGN KEY (vendeur_id) REFERENCES public.vendeurs(id)
);

-- Index pour la table boutiques
CREATE INDEX idx_boutique_vendeur ON boutiques(vendeur_id);
CREATE INDEX idx_boutique_slug ON boutiques(slug);
CREATE INDEX idx_boutique_statut ON boutiques(statut);

-- Table des catégories
CREATE TABLE public.categories (
  id integer NOT NULL DEFAULT nextval('categories_id_seq'::regclass),
  nom character varying NOT NULL,
  slug character varying NOT NULL UNIQUE,
  description text,
  parent_id integer,
  ordre_affichage integer DEFAULT 0,
  statut USER-DEFINED DEFAULT 'active'::statut_categorie,
  date_creation timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  date_modification timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  boutique_id integer,
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_boutique_id_fkey FOREIGN KEY (boutique_id) REFERENCES public.boutiques(id),
  CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id)
);

-- Index pour la table categories
CREATE INDEX idx_categorie_parent ON categories(parent_id);
CREATE INDEX idx_categorie_slug ON categories(slug);
CREATE INDEX idx_categorie_statut ON categories(statut);

-- Table des produits
CREATE TABLE public.produits (
  id integer NOT NULL DEFAULT nextval('produits_id_seq'::regclass),
  nom character varying NOT NULL,
  slug character varying NOT NULL,
  description text,
  description_courte character varying,
  prix integer NOT NULL,
  prix_original integer,
  sku character varying UNIQUE,
  boutique_id integer NOT NULL,
  categorie_id integer NOT NULL,
  images json,
  image_principale character varying,
  variants json,
  en_stock boolean DEFAULT true,
  quantite_stock integer DEFAULT 0,
  poids integer,
  dimensions json,
  tags json,
  note_moyenne numeric DEFAULT 0.00,
  nombre_avis integer DEFAULT 0,
  nombre_vues integer DEFAULT 0,
  nombre_ventes integer DEFAULT 0,
  est_nouveau boolean DEFAULT true,
  est_en_promotion boolean DEFAULT false,
  est_featured boolean DEFAULT false,
  statut USER-DEFINED DEFAULT 'brouillon'::statut_produit,
  date_creation timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  date_modification timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  date_publication timestamp without time zone,
  CONSTRAINT produits_pkey PRIMARY KEY (id),
  CONSTRAINT produits_boutique_id_fkey FOREIGN KEY (boutique_id) REFERENCES public.boutiques(id),
  CONSTRAINT produits_categorie_id_fkey FOREIGN KEY (categorie_id) REFERENCES public.categories(id)
);

-- Index pour la table produits
CREATE INDEX idx_produit_boutique ON produits(boutique_id);
CREATE INDEX idx_produit_categorie ON produits(categorie_id);
CREATE INDEX idx_produit_slug ON produits(slug);
CREATE INDEX idx_produit_statut ON produits(statut);
CREATE INDEX idx_produit_prix ON produits(prix);
CREATE INDEX idx_produit_stock ON produits(en_stock);
CREATE INDEX idx_produit_promotion ON produits(est_en_promotion);
CREATE INDEX idx_produit_nouveau ON produits(est_nouveau);
CREATE INDEX idx_produit_featured ON produits(est_featured);

-- Table des commandes
CREATE TABLE public.commandes (
  id integer NOT NULL DEFAULT nextval('commandes_id_seq'::regclass),
  numero_commande character varying NOT NULL UNIQUE,
  boutique_id integer NOT NULL,
  client_nom character varying NOT NULL,
  client_telephone character varying NOT NULL,
  client_adresse text NOT NULL,
  client_ville character varying NOT NULL,
  client_commune character varying NOT NULL,
  client_instructions character varying,
  sous_total integer NOT NULL,
  frais_livraison integer DEFAULT 0,
  taxes integer DEFAULT 0,
  remise integer DEFAULT 0,
  total integer NOT NULL,
  statut USER-DEFINED DEFAULT 'en_attente'::statut_commande,
  statut_paiement USER-DEFINED DEFAULT 'en_attente'::statut_paiement,
  methode_paiement USER-DEFINED,
  date_commande timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  date_confirmation timestamp without time zone,
  date_expedition timestamp without time zone,
  date_livraison timestamp without time zone,
  date_modification timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT commandes_pkey PRIMARY KEY (id),
  CONSTRAINT commandes_boutique_id_fkey FOREIGN KEY (boutique_id) REFERENCES public.boutiques(id)
);

-- Index pour la table commandes
CREATE INDEX idx_commande_boutique ON commandes(boutique_id);
CREATE INDEX idx_commande_statut ON commandes(statut);
CREATE INDEX idx_commande_paiement ON commandes(statut_paiement);
CREATE INDEX idx_commande_date ON commandes(date_commande);
CREATE INDEX idx_commande_client ON commandes(client_telephone);
CREATE INDEX idx_commande_numero ON commandes(numero_commande);

-- Table des articles de commande (détails)
CREATE TABLE public.commande_articles (
  id integer NOT NULL DEFAULT nextval('commande_articles_id_seq'::regclass),
  commande_id integer NOT NULL,
  produit_id integer NOT NULL,
  nom_produit character varying NOT NULL,
  prix_unitaire integer NOT NULL,
  quantite integer NOT NULL DEFAULT 1,
  variants_selectionnes json,
  sous_total integer NOT NULL,
  CONSTRAINT commande_articles_pkey PRIMARY KEY (id),
  CONSTRAINT commande_articles_produit_id_fkey FOREIGN KEY (produit_id) REFERENCES public.produits(id),
  CONSTRAINT commande_articles_commande_id_fkey FOREIGN KEY (commande_id) REFERENCES public.commandes(id)
);

-- Index pour la table commande_articles
CREATE INDEX idx_article_commande ON commande_articles(commande_id);
CREATE INDEX idx_article_produit ON commande_articles(produit_id);

-- Table des avis produits
CREATE TABLE public.avis_produits (
  id integer NOT NULL DEFAULT nextval('avis_produits_id_seq'::regclass),
  produit_id integer NOT NULL,
  commande_id integer,
  nom_client character varying NOT NULL,
  email_client character varying,
  telephone_client character varying,
  note integer NOT NULL CHECK (note >= 1 AND note <= 5),
  commentaire text,
  statut USER-DEFINED DEFAULT 'en_attente'::statut_avis,
  date_creation timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  date_moderation timestamp without time zone,
  CONSTRAINT avis_produits_pkey PRIMARY KEY (id),
  CONSTRAINT avis_produits_produit_id_fkey FOREIGN KEY (produit_id) REFERENCES public.produits(id),
  CONSTRAINT avis_produits_commande_id_fkey FOREIGN KEY (commande_id) REFERENCES public.commandes(id)
);

-- Index pour la table avis_produits
CREATE INDEX idx_avis_produit ON avis_produits(produit_id);
CREATE INDEX idx_avis_statut ON avis_produits(statut);
CREATE INDEX idx_avis_note ON avis_produits(note);

-- Table des sessions de panier (pour les paniers non connectés)
CREATE TABLE public.paniers (
  id integer NOT NULL DEFAULT nextval('paniers_id_seq'::regclass),
  session_id character varying NOT NULL UNIQUE,
  boutique_id integer NOT NULL,
  produit_id integer NOT NULL,
  quantite integer NOT NULL DEFAULT 1,
  variants_selectionnes json,
  date_creation timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  date_modification timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT paniers_pkey PRIMARY KEY (id),
  CONSTRAINT paniers_produit_id_fkey FOREIGN KEY (produit_id) REFERENCES public.produits(id),
  CONSTRAINT paniers_boutique_id_fkey FOREIGN KEY (boutique_id) REFERENCES public.boutiques(id)
);

-- Index pour la table paniers
CREATE INDEX idx_panier_session ON paniers(session_id);
CREATE INDEX idx_panier_boutique ON paniers(boutique_id);
CREATE UNIQUE INDEX unique_panier_item ON paniers(session_id, produit_id, LEFT(variants_selectionnes, 255));

-- Table des communes de livraison
CREATE TABLE public.communes_livraison (
  id integer NOT NULL DEFAULT nextval('communes_livraison_id_seq'::regclass),
  boutique_id integer NOT NULL,
  nom_commune character varying NOT NULL,
  code_postal character varying,
  tarif_livraison numeric NOT NULL DEFAULT 0.00,
  delai_livraison_min integer DEFAULT 1,
  delai_livraison_max integer DEFAULT 3,
  est_active boolean DEFAULT true,
  date_creation timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  date_modification timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT communes_livraison_pkey PRIMARY KEY (id),
  CONSTRAINT communes_livraison_boutique_id_fkey FOREIGN KEY (boutique_id) REFERENCES public.boutiques(id)
);

-- Index pour la table communes_livraison
CREATE INDEX idx_commune_boutique ON communes_livraison(boutique_id);
CREATE INDEX idx_commune_nom ON communes_livraison(nom_commune);
CREATE INDEX idx_commune_active ON communes_livraison(est_active);
CREATE INDEX idx_commune_tarif ON communes_livraison(tarif_livraison);

-- ===================================
-- Vues utiles
-- ===================================

-- Vue des produits avec informations de boutique
CREATE VIEW vue_produits_complets AS
SELECT 
    p.*,
    b.nom as nom_boutique,
    b.slug as slug_boutique,
    b.logo as logo_boutique,
    c.nom as nom_categorie,
    c.slug as slug_categorie,
    v.nom as nom_vendeur,
    v.telephone as telephone_vendeur
FROM produits p
JOIN boutiques b ON p.boutique_id = b.id
JOIN categories c ON p.categorie_id = c.id
JOIN vendeurs v ON b.vendeur_id = v.id
WHERE p.statut = 'actif' AND b.statut = 'active';

-- Vue des commandes avec totaux
CREATE VIEW vue_commandes_resume AS
SELECT 
    c.*,
    b.nom as nom_boutique,
    v.nom as nom_vendeur,
    v.telephone as telephone_vendeur,
    COUNT(ca.id) as nombre_articles,
    SUM(ca.quantite) as quantite_totale
FROM commandes c
JOIN boutiques b ON c.boutique_id = b.id
JOIN vendeurs v ON b.vendeur_id = v.id
LEFT JOIN commande_articles ca ON c.id = ca.commande_id
GROUP BY c.id, b.nom, v.nom, v.telephone;

-- Fonctions et triggers pour maintenir les compteurs (syntaxe PostgreSQL)

-- Fonction pour mettre à jour le nombre de produits dans boutiques
CREATE OR REPLACE FUNCTION update_boutique_produits_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE boutiques 
    SET nombre_produits = (
        SELECT COUNT(*) 
        FROM produits 
        WHERE boutique_id = NEW.boutique_id AND statut = 'actif'
    )
    WHERE id = NEW.boutique_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le nombre de produits
CREATE TRIGGER trigger_update_boutique_produits_count
    AFTER INSERT OR UPDATE OR DELETE ON produits
    FOR EACH ROW
    EXECUTE FUNCTION update_boutique_produits_count();

-- Fonction pour mettre à jour les notes moyennes des produits
CREATE OR REPLACE FUNCTION update_produit_note_moyenne()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE produits 
    SET 
        note_moyenne = COALESCE((
            SELECT AVG(note) 
            FROM avis_produits 
            WHERE produit_id = NEW.produit_id AND statut = 'approuve'
        ), 0),
        nombre_avis = (
            SELECT COUNT(*) 
            FROM avis_produits 
            WHERE produit_id = NEW.produit_id AND statut = 'approuve'
        )
    WHERE id = NEW.produit_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour les notes moyennes
CREATE TRIGGER trigger_update_produit_note_moyenne
    AFTER INSERT OR UPDATE OR DELETE ON avis_produits
    FOR EACH ROW
    EXECUTE FUNCTION update_produit_note_moyenne();

-- Table des transactions de paiement
CREATE TABLE public.transactions (
  id integer NOT NULL DEFAULT nextval('transactions_id_seq'::regclass),
  commande_id integer NOT NULL,
  reference_transaction character varying NOT NULL UNIQUE,
  montant integer NOT NULL,
  methode_paiement USER-DEFINED NOT NULL,
  statut USER-DEFINED NOT NULL DEFAULT 'en_attente'::statut_paiement,
  numero_telephone character varying,
  reference_operateur character varying,
  date_creation timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  date_confirmation timestamp without time zone,
  date_modification timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  notes text,
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_commande_id_fkey FOREIGN KEY (commande_id) REFERENCES public.commandes(id)
);

-- Index pour la table transactions
CREATE INDEX idx_transaction_commande ON transactions(commande_id);
CREATE INDEX idx_transaction_statut ON transactions(statut);
CREATE INDEX idx_transaction_methode ON transactions(methode_paiement);
CREATE INDEX idx_transaction_reference ON transactions(reference_transaction);

-- Index pour optimiser les performances
CREATE INDEX idx_produits_recherche ON produits(nom, description_courte, LEFT(tags, 255));
CREATE INDEX idx_commandes_periode ON commandes(date_commande, boutique_id);
CREATE INDEX idx_produits_tendance ON produits(nombre_vues, nombre_ventes, note_moyenne);

-- Contraintes supplémentaires
ALTER TABLE produits ADD CONSTRAINT chk_prix_positif CHECK (prix > 0);
ALTER TABLE commandes ADD CONSTRAINT chk_total_positif CHECK (total >= 0);
ALTER TABLE commande_articles ADD CONSTRAINT chk_quantite_positive CHECK (quantite > 0);