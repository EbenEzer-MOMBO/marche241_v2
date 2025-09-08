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
CREATE TABLE vendeurs (
    id SERIAL PRIMARY KEY,
    telephone VARCHAR(20) UNIQUE NOT NULL, -- Identifiant principal
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) NULL, -- Optionnel
    
    -- Système d'authentification par code WhatsApp
    code_verification VARCHAR(4) NULL, -- Code à 4 chiffres
    code_expiration TIMESTAMP NULL, -- Date d'expiration du code
    tentatives_code INTEGER DEFAULT 0, -- Nombre de tentatives de saisie
    derniere_tentative TIMESTAMP NULL, -- Dernière tentative de connexion
    
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut statut_vendeur DEFAULT 'en_attente_verification',
    photo_profil VARCHAR(500) NULL,
    ville VARCHAR(100) NULL,
    verification_telephone BOOLEAN DEFAULT FALSE,
    verification_email BOOLEAN DEFAULT FALSE,
    derniere_connexion TIMESTAMP NULL
);

-- Table des boutiques
CREATE TABLE boutiques (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL, -- Pour les URLs (ex: boutique-de-joline)
    description TEXT NULL,
    vendeur_id INTEGER NOT NULL,
    logo VARCHAR(500) NULL,
    couleur_primaire VARCHAR(7) DEFAULT '#000000', -- Code couleur hex
    couleur_secondaire VARCHAR(7) DEFAULT '#ffffff',
    adresse TEXT NULL,
    telephone VARCHAR(20) NULL,
    statut statut_boutique DEFAULT 'en_attente',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    nombre_produits INTEGER DEFAULT 0,
    note_moyenne DECIMAL(3,2) DEFAULT 0.00,
    nombre_avis INTEGER DEFAULT 0,
    
    FOREIGN KEY (vendeur_id) REFERENCES vendeurs(id) ON DELETE CASCADE
);

-- Index pour la table boutiques
CREATE INDEX idx_boutique_vendeur ON boutiques(vendeur_id);
CREATE INDEX idx_boutique_slug ON boutiques(slug);
CREATE INDEX idx_boutique_statut ON boutiques(statut);

-- Table des catégories
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NULL,
    parent_id INTEGER NULL, -- Pour les sous-catégories
    ordre_affichage INTEGER DEFAULT 0,
    statut statut_categorie DEFAULT 'active',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Index pour la table categories
CREATE INDEX idx_categorie_parent ON categories(parent_id);
CREATE INDEX idx_categorie_slug ON categories(slug);
CREATE INDEX idx_categorie_statut ON categories(statut);

-- Table des produits
CREATE TABLE produits (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    description TEXT NULL,
    description_courte VARCHAR(500) NULL,
    prix INTEGER NOT NULL, -- Prix en centimes (ex: 25000 = 250.00 FCFA)
    prix_original INTEGER NULL, -- Prix avant réduction
    sku VARCHAR(100) UNIQUE NULL, -- Code produit
    boutique_id INTEGER NOT NULL,
    categorie_id INTEGER NOT NULL,
    images JSON NULL, -- Tableau des URLs d'images
    image_principale VARCHAR(500) NULL,
    variants JSON NULL, -- Variantes (couleur, taille, etc.)
    en_stock BOOLEAN DEFAULT TRUE,
    quantite_stock INTEGER DEFAULT 0,
    poids INTEGER NULL, -- Poids en grammes
    dimensions JSON NULL, -- {"longueur": 10, "largeur": 5, "hauteur": 2}
    tags JSON NULL, -- Mots-clés pour la recherche
    note_moyenne DECIMAL(3,2) DEFAULT 0.00,
    nombre_avis INTEGER DEFAULT 0,
    nombre_vues INTEGER DEFAULT 0,
    nombre_ventes INTEGER DEFAULT 0,
    est_nouveau BOOLEAN DEFAULT TRUE,
    est_en_promotion BOOLEAN DEFAULT FALSE,
    est_featured BOOLEAN DEFAULT FALSE,
    statut statut_produit DEFAULT 'brouillon',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_publication TIMESTAMP NULL,
    
    FOREIGN KEY (boutique_id) REFERENCES boutiques(id) ON DELETE CASCADE,
    FOREIGN KEY (categorie_id) REFERENCES categories(id) ON DELETE SET NULL,
    UNIQUE (slug, boutique_id)
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
CREATE TABLE commandes (
    id SERIAL PRIMARY KEY,
    numero_commande VARCHAR(50) UNIQUE NOT NULL, -- Format: CMD-2024-001234
    boutique_id INTEGER NOT NULL,
    client_nom VARCHAR(100) NOT NULL,
    client_telephone VARCHAR(20) NOT NULL,
    client_adresse TEXT NOT NULL,
    client_ville VARCHAR(100) NOT NULL,
    client_commune VARCHAR(100) NOT NULL,
    client_instructions VARCHAR(250) NULL,
    
    -- Montants
    sous_total INTEGER NOT NULL, -- Somme des produits
    frais_livraison INTEGER DEFAULT 0,
    taxes INTEGER DEFAULT 0,
    remise INTEGER DEFAULT 0,
    total INTEGER NOT NULL, -- Montant final
    
    -- Statuts et dates
    statut statut_commande DEFAULT 'en_attente',
    statut_paiement statut_paiement DEFAULT 'en_attente',
    methode_paiement methode_paiement NULL,
    
    date_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_confirmation TIMESTAMP NULL,
    date_expedition TIMESTAMP NULL,
    date_livraison TIMESTAMP NULL,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (boutique_id) REFERENCES boutiques(id) ON DELETE CASCADE
);

-- Index pour la table commandes
CREATE INDEX idx_commande_boutique ON commandes(boutique_id);
CREATE INDEX idx_commande_statut ON commandes(statut);
CREATE INDEX idx_commande_paiement ON commandes(statut_paiement);
CREATE INDEX idx_commande_date ON commandes(date_commande);
CREATE INDEX idx_commande_client ON commandes(client_telephone);
CREATE INDEX idx_commande_numero ON commandes(numero_commande);

-- Table des articles de commande (détails)
CREATE TABLE commande_articles (
    id SERIAL PRIMARY KEY,
    commande_id INTEGER NOT NULL,
    produit_id INTEGER NOT NULL,
    nom_produit VARCHAR(200) NOT NULL, -- Sauvegarde du nom au moment de la commande
    prix_unitaire INTEGER NOT NULL, -- Prix au moment de la commande
    quantite INTEGER NOT NULL DEFAULT 1,
    variants_selectionnes JSON NULL, -- Variantes choisies (couleur, taille, etc.)
    sous_total INTEGER NOT NULL, -- prix_unitaire * quantite
    
    FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE,
    FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE
);

-- Index pour la table commande_articles
CREATE INDEX idx_article_commande ON commande_articles(commande_id);
CREATE INDEX idx_article_produit ON commande_articles(produit_id);

-- Table des avis produits
CREATE TABLE avis_produits (
    id SERIAL PRIMARY KEY,
    produit_id INTEGER NOT NULL,
    commande_id INTEGER NULL, -- Lien vers la commande (pour vérifier l'achat)
    nom_client VARCHAR(100) NOT NULL,
    email_client VARCHAR(255) NULL,
    telephone_client VARCHAR(20) NULL,
    note INTEGER NOT NULL CHECK (note >= 1 AND note <= 5),
    commentaire TEXT NULL,
    statut statut_avis DEFAULT 'en_attente',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_moderation TIMESTAMP NULL,
    
    FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE,
    FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE SET NULL
);

-- Index pour la table avis_produits
CREATE INDEX idx_avis_produit ON avis_produits(produit_id);
CREATE INDEX idx_avis_statut ON avis_produits(statut);
CREATE INDEX idx_avis_note ON avis_produits(note);

-- Table des sessions de panier (pour les paniers non connectés)
CREATE TABLE paniers (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    boutique_id INTEGER NOT NULL,
    produit_id INTEGER NOT NULL,
    quantite INTEGER NOT NULL DEFAULT 1,
    variants_selectionnes JSON NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (boutique_id) REFERENCES boutiques(id) ON DELETE CASCADE,
    FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE
);

-- Index pour la table paniers
CREATE INDEX idx_panier_session ON paniers(session_id);
CREATE INDEX idx_panier_boutique ON paniers(boutique_id);
CREATE UNIQUE INDEX unique_panier_item ON paniers(session_id, produit_id, LEFT(variants_selectionnes, 255));

-- Table des communes de livraison
CREATE TABLE communes_livraison (
    id SERIAL PRIMARY KEY,
    boutique_id INTEGER NOT NULL,
    nom_commune VARCHAR(100) NOT NULL,
    code_postal VARCHAR(10) NULL,
    tarif_livraison DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    delai_livraison_min INTEGER DEFAULT 1, -- en jours
    delai_livraison_max INTEGER DEFAULT 3, -- en jours
    est_active BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (boutique_id) REFERENCES boutiques(id) ON DELETE CASCADE,
    UNIQUE (boutique_id, nom_commune)
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
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    commande_id INTEGER NOT NULL,
    reference_transaction VARCHAR(100) UNIQUE NOT NULL, -- Référence unique de la transaction
    montant INTEGER NOT NULL, -- Montant en centimes
    methode_paiement methode_paiement NOT NULL,
    statut statut_paiement NOT NULL DEFAULT 'en_attente',
    
    -- Informations de paiement mobile
    numero_telephone VARCHAR(20) NULL, -- Numéro utilisé pour le paiement mobile
    reference_operateur VARCHAR(100) NULL, -- Référence fournie par l'opérateur (Airtel/Moov)
    
    -- Dates
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_confirmation TIMESTAMP NULL, -- Date de confirmation du paiement
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Informations supplémentaires
    details JSONB NULL, -- Stockage flexible pour les détails spécifiques à chaque méthode de paiement
    notes TEXT NULL, -- Notes internes
    
    FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE
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