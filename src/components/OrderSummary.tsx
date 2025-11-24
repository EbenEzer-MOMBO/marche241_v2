'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { BoutiqueConfig } from '@/lib/boutiques';
import { usePanier } from '@/hooks/usePanier';
import { useToast } from '@/hooks/useToast';
import { creerCommande, CreerCommandeData } from '@/lib/services/commandes';
import { useEffect } from 'react';
import { getCommunesActives } from '@/lib/services/communes';
import { initierPaiementMobile, verifierPaiementEnBoucle, type PaiementMobileData, type WebhookPaiementData } from '@/lib/services/paiements';
import { creerTransaction, type CreerTransactionData } from '@/lib/services/transactions';
import { checkWhatsAppNumber } from '@/lib/services/whatsapp';
import PhoneNumberInput from '@/components/ui/PhoneNumberInput';
import PaymentProgressBar from '@/components/ui/PaymentProgressBar';
import PaymentCountdown from '@/components/ui/PaymentCountdown';
import { ToastContainer } from '@/components/ui/Toast';

interface OrderSummaryProps {
  boutiqueConfig: BoutiqueConfig;
  boutiqueId: number;
  boutiqueTelephone?: string;
}

type PaymentMethod = 'moov' | 'airtel' | null;

interface DeliveryAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  additionalInfo: string;
}

interface Commune {
  id: number;
  boutique_id: number;
  nom_commune: string;
  code_postal?: string | null;
  tarif_livraison: number;
  delai_livraison_min: number;
  delai_livraison_max: number;
  est_active: boolean;
  date_creation: string;
  date_modification: string;
}

export function OrderSummary({ boutiqueConfig, boutiqueId, boutiqueTelephone }: OrderSummaryProps) {
  const params = useParams();
  const boutiqueSlug = params.boutique as string;
  
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(null);
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentPhoneError, setPaymentPhoneError] = useState('');
  const [payOnDelivery, setPayOnDelivery] = useState(false);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [communesLoading, setCommunesLoading] = useState(true);
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    additionalInfo: ''
  });
  
  // États pour la vérification WhatsApp
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isCheckingWhatsApp, setIsCheckingWhatsApp] = useState(false);
  const [whatsAppError, setWhatsAppError] = useState<string | null>(null);
  const [whatsAppExists, setWhatsAppExists] = useState<boolean | null>(null);

  // Utilisation du hook panier pour récupérer les vraies données avec isolation par boutique
  const { panier, totalItems, totalPrix, loading } = usePanier(boutiqueId);
  const { success, error, toasts, removeToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [currentBillId, setCurrentBillId] = useState<string>('');
  const [cancelSignal] = useState<{ cancelled: boolean }>({ cancelled: false });

  // Charger les communes au montage du composant
  useEffect(() => {
    const loadCommunes = async () => {
      try {
        setCommunesLoading(true);
        const communesData = await getCommunesActives(boutiqueId);
        setCommunes(communesData);
      } catch (error) {
        console.error('Erreur lors du chargement des communes:', error);
      } finally {
        setCommunesLoading(false);
      }
    };

    loadCommunes();
  }, [boutiqueId]);

  // Vérifier le numéro WhatsApp quand il est valide
  useEffect(() => {
    const verifyWhatsApp = async () => {
      if (isPhoneValid && deliveryAddress.phone) {
        setIsCheckingWhatsApp(true);
        setWhatsAppError(null);
        setWhatsAppExists(null);

        try {
          const result = await checkWhatsAppNumber(deliveryAddress.phone);
          setWhatsAppExists(result.existsWhatsapp);
          
          if (!result.existsWhatsapp) {
            setWhatsAppError('Ce numéro n\'est pas enregistré sur WhatsApp');
          }
        } catch (error) {
          setWhatsAppError('Impossible de vérifier le numéro');
          setWhatsAppExists(false);
        } finally {
          setIsCheckingWhatsApp(false);
        }
      } else {
        setWhatsAppExists(null);
        setWhatsAppError(null);
      }
    };

    // Debounce pour éviter trop de requêtes
    const timer = setTimeout(() => {
      verifyWhatsApp();
    }, 500);

    return () => clearTimeout(timer);
  }, [deliveryAddress.phone, isPhoneValid]);

  const subtotal = totalPrix;

  // Calcul des frais de livraison basé sur la commune sélectionnée
  const getDeliveryFee = () => {
    if (!deliveryAddress.city) return 0;

    // Trouver la commune sélectionnée dans la liste
    const selectedCommune = communes.find(commune => commune.nom_commune === deliveryAddress.city);
    return selectedCommune ? selectedCommune.tarif_livraison : 0;
  };

  const deliveryFee = getDeliveryFee();

  // Calcul des frais de transaction (4.5%)
  const getTransactionFee = () => {
    const transactionRate = 0.045; // 4.5%

    if (payOnDelivery) {
      // Pour paiement à la livraison : 4.5% seulement sur les frais de livraison
      return Math.round(deliveryFee * transactionRate);
    } else {
      // Pour paiement normal : 4.5% sur le total (sous-total + livraison)
      const baseAmount = subtotal + deliveryFee;
      return Math.round(baseAmount * transactionRate);
    }
  };

  // Les frais de transaction sont calculés dynamiquement

  // Calcul du total selon le mode de paiement
  const getTotalToPay = () => {
    if (payOnDelivery) {
      return deliveryFee + getTransactionFee(); // Frais de livraison + frais de transaction
    }
    return subtotal + deliveryFee + getTransactionFee(); // Total complet
  };

  const totalToPay = getTotalToPay();
  const remainingAmount = payOnDelivery ? subtotal : 0;

  // Vérification si toutes les conditions sont remplies pour activer le bouton
  const isFormValid = () => {
    // Vérifier que tous les champs obligatoires de l'adresse sont remplis
    const isAddressComplete = deliveryAddress.fullName.trim() !== '' &&
      deliveryAddress.phone.trim() !== '' &&
      deliveryAddress.address.trim() !== '' &&
      deliveryAddress.city.trim() !== '';

    // Vérifier que le numéro WhatsApp est valide et vérifié
    const isWhatsAppValid = whatsAppExists === true && !isCheckingWhatsApp;

    // Vérifier qu'un mode de paiement est sélectionné
    const isPaymentSelected = selectedPayment !== null;

    // Vérifier que le numéro de paiement est valide
    const isPaymentPhoneValid = paymentPhone.length === 9 &&
      paymentPhoneError === '' &&
      selectedPayment !== null;

    // Vérifier qu'une commune est sélectionnée (même si les frais sont à 0)
    const isCommuneSelected = deliveryAddress.city.trim() !== '';

    return isAddressComplete && isWhatsAppValid && isPaymentSelected && isPaymentPhoneValid && isCommuneSelected;
  };

  // Génère le message approprié pour le bouton selon l'état de validation
  const getButtonMessage = () => {
    if (!deliveryAddress.fullName || !deliveryAddress.phone || !deliveryAddress.address) {
      return 'Complétez votre adresse de livraison';
    }
    if (isCheckingWhatsApp) {
      return 'Vérification du numéro WhatsApp...';
    }
    if (whatsAppExists !== true) {
      return 'Numéro WhatsApp requis';
    }
    if (!deliveryAddress.city) {
      return 'Sélectionnez une commune pour continuer';
    }
    if (!selectedPayment) {
      return 'Sélectionnez un mode de paiement';
    }
    if (!paymentPhone || paymentPhoneError) {
      return 'Saisissez un numéro de paiement valide';
    }

    if (payOnDelivery) {
      return `Payer les frais (${formatPrice(totalToPay)})`;
    }
    return `Confirmer et payer ${formatPrice(totalToPay)}`;
  };

  const handleAddressChange = (field: keyof DeliveryAddress, value: string) => {
    setDeliveryAddress(prev => ({ ...prev, [field]: value }));
    
    // Si on change de commune, vérifier si les frais sont gratuits
    if (field === 'city') {
      const selectedCommune = communes.find(commune => commune.nom_commune === value);
      if (selectedCommune && selectedCommune.tarif_livraison === 0) {
        // Désactiver le paiement à la livraison si la livraison est gratuite
        setPayOnDelivery(false);
      }
    }
  };

  const handlePaymentChange = (payment: PaymentMethod) => {
    setSelectedPayment(payment);
    // Réinitialiser le numéro de téléphone et l'erreur quand on change de mode de paiement
    setPaymentPhone('');
    setPaymentPhoneError('');
  };

  /**
   * Formate un numéro de téléphone pour WhatsApp
   * Enlève le + et tous les caractères non numériques
   * Ex: "+241 06 26 48 538" => "24162648538"
   */
  const formatWhatsAppNumber = (phone: string): string => {
    return phone.replace(/[^\d]/g, '');
  };

  const getPhonePlaceholder = () => {
    if (selectedPayment === 'moov') return '06XXXXXXX';
    if (selectedPayment === 'airtel') return '07XXXXXXX';
    return '';
  };

  const validatePaymentPhone = (phone: string, paymentType: PaymentMethod): string => {
    if (!phone) return '';

    // Supprimer tous les espaces et caractères non numériques sauf le +
    const cleanPhone = phone.replace(/[^\d+]/g, '');

    if (paymentType === 'moov') {
      // Format Moov: doit commencer par 06 et avoir 9 chiffres au total
      if (!/^06\d{7}$/.test(cleanPhone)) {
        return 'Le numéro Moov Money doit respecter le format 06XXXXXXX (9 chiffres)';
      }
    } else if (paymentType === 'airtel') {
      // Format Airtel: doit commencer par 07 et avoir 9 chiffres au total
      if (!/^07\d{7}$/.test(cleanPhone)) {
        return 'Le numéro Airtel Money doit respecter le format 07XXXXXXX (9 chiffres)';
      }
    }

    return '';
  };

  const handlePaymentPhoneChange = (value: string) => {
    // Limiter à 9 caractères et permettre seulement les chiffres
    const cleanValue = value.replace(/[^\d]/g, '').slice(0, 9);
    setPaymentPhone(cleanValue);

    // Validation en temps réel
    if (selectedPayment) {
      const error = validatePaymentPhone(cleanValue, selectedPayment);
      setPaymentPhoneError(error);
    }
  };

  const handleSubmitOrder = async () => {
    // Double vérification de sécurité (normalement le bouton est déjà désactivé)
    if (!isFormValid()) {
      error('Veuillez compléter toutes les informations requises');
      return;
    }

    if (panier.length === 0) {
      error('Votre panier est vide');
      return;
    }

    // Vérifier qu'un mode de paiement est sélectionné
    if (!selectedPayment) {
      error('Veuillez sélectionner un mode de paiement');
      return;
    }

    setIsSubmitting(true);
    
    // Réinitialiser le signal d'annulation
    cancelSignal.cancelled = false;

    try {
      // Étape 1: Créer la commande
      const commandeData: CreerCommandeData = {
        boutique_id: panier[0].boutique_id,
        client_nom: deliveryAddress.fullName,
        client_telephone: deliveryAddress.phone,
        client_adresse: deliveryAddress.address,
        client_ville: deliveryAddress.city,
        client_commune: deliveryAddress.city,
        client_instructions: deliveryAddress.additionalInfo,
        frais_livraison: deliveryFee,
        taxes: getTransactionFee(),
        remise: 0,
        articles: panier.map(item => ({
          produit_id: item.produit_id,
          quantite: item.quantite,
          prix_unitaire: item.produit.prix,
          nom_produit: item.produit.nom,
          description: item.produit.description_courte || item.produit.nom,
          variants_selectionnes: item.variants_selectionnes
        }))
      };



      const commande = await creerCommande(commandeData);
      success('Commande créée avec succès !', 'Succès', 3000);

      console.log('Données de la commande:', commandeData);

      console.log('Réponse complète de la commande:', commande);

      // Étape 2: Gestion du paiement selon le mode choisi
      if (payOnDelivery) {
        // ============================================
        // MODE: Paiement à la livraison (Frais uniquement)
        // ============================================
        
        // Payer uniquement les frais de livraison + frais de transaction
        const nameParts = deliveryAddress.fullName;
        const paymentSystem = selectedPayment === 'moov' ? 'moovmoney' : 'airtelmoney';

        const paiementData: PaiementMobileData = {
          email: 'ebenezermombo@gmail.com',
          msisdn: paymentPhone,
          amount: totalToPay, // Frais de livraison + frais de transaction
          reference: commande.commande.numero_commande,
          payment_system: paymentSystem,
          description: `Paiement frais de livraison - Commande ${commande.commande.numero_commande}`,
          lastname: nameParts,
          firstname: nameParts
        };

        // Préparer les données pour le webhook
        const webhookData: WebhookPaiementData = {
          billId: '', // Sera rempli après l'initiation du paiement
          boutique: {
            id: boutiqueId,
            nom: boutiqueConfig.name,
            slug: boutiqueSlug as string,
            telephone: boutiqueTelephone
          },
          commande: {
            id: commande.commande.id,
            numero_commande: commande.commande.numero_commande,
            total: commande.commande.total,
            sous_total: commande.commande.sous_total,
            frais_livraison: commande.commande.frais_livraison,
            taxes: commande.commande.taxes
          },
          produits: panier.reduce((acc, item, index) => {
            const variantsString = item.variants_selectionnes 
              ? Object.entries(item.variants_selectionnes)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(', ')
              : undefined;
            
            acc[index + 1] = {
              id: item.produit_id,
              nom: item.produit.nom,
              prix_unitaire: item.produit.prix,
              quantite: item.quantite,
              sous_total: item.produit.prix * item.quantite,
              variants: item.variants_selectionnes || undefined,
              variants_string: variantsString,
              image_url: item.produit.image_principale || undefined
            };
            
            return acc;
          }, {} as Record<number, {
            id: number;
            nom: string;
            prix_unitaire: number;
            quantite: number;
            sous_total: number;
            variants?: Record<string, string>;
            variants_string?: string;
            image_url?: string;
          }>),
          client: {
            nom: deliveryAddress.fullName,
            telephone: deliveryAddress.phone,
            whatsapp: formatWhatsAppNumber(deliveryAddress.phone),
            email: 'ebenezermombo@gmail.com',
            adresse: deliveryAddress.address,
            ville: deliveryAddress.city,
            commune: deliveryAddress.district
          },
          paiement: {
            montant: totalToPay,
            type_paiement: 'frais_livraison',
            methode_paiement: selectedPayment === 'moov' ? 'moov_money' : 'airtel_money',
            reference: commande.commande.numero_commande
          }
        };

        setShowProgressBar(true);

        const paiement = await initierPaiementMobile(paiementData, webhookData);

        if (paiement.success) {
          console.log('Paiement frais de livraison initié:', paiement);

          setShowProgressBar(false);
          if (paiement.bill_id) {
            setCurrentBillId(paiement.bill_id);
            setShowCountdown(true);

            // Créer immédiatement la transaction en attente
            const transactionFraisData: CreerTransactionData = {
              reference_transaction: commande.commande.numero_commande,
              commande_id: commande.commande.id,
              montant: totalToPay,
              methode_paiement: selectedPayment === 'moov' ? 'moov_money' : 'airtel_money',
              type_paiement: 'frais_livraison',
              numero_telephone: paymentPhone,
              reference_operateur: paiement.bill_id || '',
              note: 'Paiement des frais de livraison - Commande ' + commande.commande.numero_commande
            };

            try {
              const transactionFrais = await creerTransaction(transactionFraisData);
              console.log('Transaction frais créée:', transactionFrais);
            } catch (err) {
              console.error('Erreur transaction frais:', err);
              error('Erreur lors de la création de la transaction.');
            }

            // Vérifier le paiement des frais
            verifierPaiementEnBoucle(paiement.bill_id, 60000, 5000, cancelSignal)
              .then(async (verificationResult) => {
                console.log('📊 Résultat final de la vérification (frais):', verificationResult);
                
                if (verificationResult.status === 'paye' || verificationResult.status === 'paid' || verificationResult.status === 'processed') {
                  // Fermer immédiatement le countdown
                  setShowCountdown(false);
                  setIsSubmitting(false);
                  
                  // Afficher un message de succès
                  success(
                    'Paiement confirmé ! Redirection vers la page de confirmation...',
                    'Paiement réussi',
                    2000
                  );
                  
                  // Rediriger vers la page de confirmation après 2 secondes
                  setTimeout(() => {
                    window.location.href = `/${boutiqueSlug}/confirmation?commande=${commande.commande.numero_commande}&type=partiel`;
                  }, 2000);
                } else if (verificationResult.status === 'echec' || verificationResult.status === 'failed') {
                  error(verificationResult.message || 'Le paiement des frais de livraison a échoué. Veuillez réessayer.');
                  setShowCountdown(false);
                  setIsSubmitting(false);
                } else if (verificationResult.status === 'rembourse' || verificationResult.status === 'refunded') {
                  error('Le paiement a été annulé.');
                  setShowCountdown(false);
                  setIsSubmitting(false);
                } else {
                  // Statut en attente ou timeout
                  error('Le paiement est toujours en attente. Vérifiez votre téléphone ou contactez le support.');
                  setShowCountdown(false);
                  setIsSubmitting(false);
                }
              })
              .catch(verificationError => {
                console.error('Erreur vérification paiement frais:', verificationError);
                // Ne pas afficher d'erreur si l'utilisateur a annulé
                if (!cancelSignal.cancelled) {
                  error('Erreur lors de la vérification du paiement.');
                }
                setShowCountdown(false);
                setIsSubmitting(false);
              });
          }
        } else {
          setShowProgressBar(false);
          error(paiement.message || 'Erreur lors de l\'initiation du paiement des frais');
        }

      } else if (selectedPayment) {
        // ============================================
        // MODE: Paiement complet immédiat
        // ============================================
        
        const nameParts = deliveryAddress.fullName;
        const paymentSystem = selectedPayment === 'moov' ? 'moovmoney' : 'airtelmoney';

        const paiementData: PaiementMobileData = {
          email: 'ebenezermombo@gmail.com',
          msisdn: paymentPhone,
          amount: totalToPay,
          reference: commande.commande.numero_commande,
          payment_system: paymentSystem,
          description: `Paiement complet - Commande ${commande.commande.numero_commande}`,
          lastname: nameParts,
          firstname: nameParts
        };

        // Préparer les données pour le webhook
        const webhookData: WebhookPaiementData = {
          billId: '', // Sera rempli après l'initiation du paiement
          boutique: {
            id: boutiqueId,
            nom: boutiqueConfig.name,
            slug: boutiqueSlug as string,
            telephone: boutiqueTelephone
          },
          commande: {
            id: commande.commande.id,
            numero_commande: commande.commande.numero_commande,
            total: commande.commande.total,
            sous_total: commande.commande.sous_total,
            frais_livraison: commande.commande.frais_livraison,
            taxes: commande.commande.taxes
          },
          produits: panier.reduce((acc, item, index) => {
            const variantsString = item.variants_selectionnes 
              ? Object.entries(item.variants_selectionnes)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(', ')
              : undefined;
            
            acc[index + 1] = {
              id: item.produit_id,
              nom: item.produit.nom,
              prix_unitaire: item.produit.prix,
              quantite: item.quantite,
              sous_total: item.produit.prix * item.quantite,
              variants: item.variants_selectionnes || undefined,
              variants_string: variantsString,
              image_url: item.produit.image_principale || undefined
            };
            
            return acc;
          }, {} as Record<number, {
            id: number;
            nom: string;
            prix_unitaire: number;
            quantite: number;
            sous_total: number;
            variants?: Record<string, string>;
            variants_string?: string;
            image_url?: string;
          }>),
          client: {
            nom: deliveryAddress.fullName,
            telephone: deliveryAddress.phone,
            whatsapp: formatWhatsAppNumber(deliveryAddress.phone),
            email: 'ebenezermombo@gmail.com',
            adresse: deliveryAddress.address,
            ville: deliveryAddress.city,
            commune: deliveryAddress.district
          },
          paiement: {
            montant: totalToPay,
            type_paiement: 'paiement_complet',
            methode_paiement: selectedPayment === 'moov' ? 'moov_money' : 'airtel_money',
            reference: commande.commande.numero_commande
          }
        };

        setShowProgressBar(true);

        const paiement = await initierPaiementMobile(paiementData, webhookData);

        if (paiement.success) {
          console.log('Paiement complet initié:', paiement);

          setShowProgressBar(false);
          if (paiement.bill_id) {
            setCurrentBillId(paiement.bill_id);
            setShowCountdown(true);

            // Créer immédiatement la transaction en attente
            const transactionCompletData: CreerTransactionData = {
              reference_transaction: commande.commande.numero_commande,
              commande_id: commande.commande.id,
              montant: totalToPay,
              methode_paiement: selectedPayment === 'moov' ? 'moov_money' : 'airtel_money',
              type_paiement: 'paiement_complet',
              numero_telephone: paymentPhone,
              reference_operateur: paiement.bill_id || '',
              note: 'Paiement complet de la commande - Commande ' + commande.commande.numero_commande
            };

            try {
              const transactionComplete = await creerTransaction(transactionCompletData);
              console.log('Transaction complète créée:', transactionComplete);
            } catch (err) {
              console.error('Erreur transaction complète:', err);
              error('Erreur lors de la création de la transaction.');
            }

            // Vérifier le paiement complet
            verifierPaiementEnBoucle(paiement.bill_id, 60000, 5000, cancelSignal)
              .then(async (verificationResult) => {
                console.log('📊 Résultat final de la vérification (complet):', verificationResult);
                
                if (verificationResult.status === 'paye' || verificationResult.status === 'paid' || verificationResult.status === 'processed') {
                  // Fermer immédiatement le countdown
                  setShowCountdown(false);
                  setIsSubmitting(false);
                  
                  // Afficher un message de succès
                  success(
                    'Paiement confirmé ! Redirection vers la page de confirmation...',
                    'Paiement réussi',
                    2000
                  );
                  
                  // Rediriger vers la page de confirmation après 2 secondes
                  setTimeout(() => {
                    window.location.href = `/${boutiqueSlug}/confirmation?commande=${commande.commande.numero_commande}&type=complet`;
                  }, 2000);
                } else if (verificationResult.status === 'echec' || verificationResult.status === 'failed') {
                  error(verificationResult.message || 'Le paiement a échoué. Veuillez réessayer.');
                  setShowCountdown(false);
                  setIsSubmitting(false);
                } else if (verificationResult.status === 'rembourse' || verificationResult.status === 'refunded') {
                  error('Le paiement a été annulé.');
                  setShowCountdown(false);
                  setIsSubmitting(false);
                } else {
                  // Statut en attente ou timeout
                  error('Le paiement est toujours en attente. Vérifiez votre téléphone ou contactez le support.');
                  setShowCountdown(false);
                  setIsSubmitting(false);
                }
              })
              .catch(verificationError => {
                console.error('Erreur vérification paiement complet:', verificationError);
                // Ne pas afficher d'erreur si l'utilisateur a annulé
                if (!cancelSignal.cancelled) {
                  error('Erreur lors de la vérification du paiement.');
                }
                setShowCountdown(false);
                setIsSubmitting(false);
              });
          }
        } else {
          setShowProgressBar(false);
          error(paiement.message || 'Erreur lors de l\'initiation du paiement');
        }
      }

      console.log('Commande créée:', commande);

    } catch (err) {
      console.error('Erreur lors de la création de la commande:', err);
      error('Erreur lors du processus de commande. Veuillez réessayer.');
      // Ajouter un délai de 3 secondes avant de réinitialiser les états
      setTimeout(() => {
        setIsSubmitting(false);
        setShowProgressBar(false);
        setShowCountdown(false);
      }, 3000);
    }
  };

  // Fonctions de gestion des composants visuels
  const handleProgressComplete = () => {
    // La barre de progression se termine, le paiement devrait être initié
    console.log('Barre de progression terminée');
  };

  const handleCountdownComplete = () => {
    // Le décompte est terminé mais la vérification continue en arrière-plan
    console.log('Décompte terminé - la vérification continue...');
    // Ne pas fermer le décompte ici car la vérification se fait en parallèle
  };

  const handleCancelPayment = () => {
    console.log('🛑 Annulation du paiement demandée');
    // Activer le signal d'annulation pour arrêter la vérification en boucle
    cancelSignal.cancelled = true;
    
    // Fermer les composants visuels
    setShowCountdown(false);
    setShowProgressBar(false);
    setIsSubmitting(false);
    
    // Afficher un message d'annulation
    error('Paiement annulé par l\'utilisateur.');
  };

  return (
    <div className="w-full">
      {/* Container des toasts */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Barre de progression pour l'initialisation */}
      {showProgressBar && (
        <PaymentProgressBar
          duration={20}
          onComplete={handleProgressComplete}
          title="Initialisation du paiement"
          description="Connexion avec votre opérateur mobile en cours..."
        />
      )}

      {/* Décompte pour la vérification */}
      {showCountdown && (
        <PaymentCountdown
          duration={60}
          onComplete={handleCountdownComplete}
          onCancel={handleCancelPayment}
          paymentMethod={selectedPayment || 'mobile'}
          phoneNumber={paymentPhone}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Résumé du panier et adresse */}
        <div className="lg:col-span-2">
          {/* Articles du panier */}
          <div className="bg-white rounded-lg shadow-md mb-6 border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-black">
                Votre commande ({totalItems} articles)
              </h3>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <span className="ml-2 text-gray-600">Chargement du panier...</span>
                </div>
              ) : panier.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Votre panier est vide</p>
                </div>
              ) : (
                panier.map((item, index) => {
                  // Construire l'affichage des variants
                  let variantDisplay = null;
                  
                  if (item.variants_selectionnes && Object.keys(item.variants_selectionnes).length > 0) {
                    const entries = Object.entries(item.variants_selectionnes);
                    variantDisplay = (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {entries.map(([key, value], idx) => (
                          <span 
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
                          >
                            {key}: <span className="ml-1 font-semibold">{value}</span>
                          </span>
                        ))}
                      </div>
                    );
                  }

                  // Utiliser l'image principale du produit ou une image par défaut
                  const imageUrl = item.produit.image_principale || '/article1.webp';

                  return (
                    <div key={item.id} className={`flex items-start py-4 ${index < panier.length - 1 ? 'border-b border-gray-200' : ''}`}>
                      <div className="w-20 h-20 relative flex-shrink-0">
                        <Image
                          src={imageUrl}
                          alt={item.produit.nom}
                          fill
                          className="rounded-lg object-cover"
                        />
                      </div>
                      <div className="flex-1 ml-4">
                        <h4 className="font-medium text-gray-900 mb-1">{item.produit.nom}</h4>
                        {variantDisplay}
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Quantité: {item.quantite}</span>
                          <span className="font-semibold text-lg text-black">
                            {formatPrice(item.produit.prix * item.quantite)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Adresse de livraison */}
          <div className="bg-white rounded-lg shadow-md border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-black">
                Adresse de livraison
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Nom complet *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"

                    value={deliveryAddress.fullName}
                    onChange={(e) => handleAddressChange('fullName', e.target.value)}
                    placeholder="Votre nom complet"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">WhatsApp (pour recevoir les mises à jour)*</label>
                  <PhoneNumberInput
                    value={deliveryAddress.phone}
                    onChange={(value) => handleAddressChange('phone', value)}
                    onValidationChange={setIsPhoneValid}
                    placeholder="6XXXXXXX"
                    required
                    className="w-full"
                  />
                  
                  {/* Statut de vérification WhatsApp */}
                  {isPhoneValid && (
                    <div className="mt-2">
                      {isCheckingWhatsApp && (
                        <div className="flex items-center text-sm text-gray-600">
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                          Vérification du numéro WhatsApp...
                        </div>
                      )}
                      
                      {!isCheckingWhatsApp && whatsAppExists === true && (
                        <div className="flex items-center text-sm text-green-600">
                          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Numéro WhatsApp vérifié ✓
                        </div>
                      )}
                      
                      {!isCheckingWhatsApp && whatsAppExists === false && (
                        <div className="flex items-center text-sm text-red-600">
                          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {whatsAppError || 'Numéro non enregistré sur WhatsApp'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Adresse complète *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"

                    value={deliveryAddress.address}
                    onChange={(e) => handleAddressChange('address', e.target.value)}
                    placeholder="Numéro, rue, quartier"
                    required
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Commune *</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    value={deliveryAddress.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    required
                    disabled={communesLoading}
                  >
                    <option value="">
                      {communesLoading ? 'Chargement des communes...' : 'Sélectionner une commune'}
                    </option>
                    {communes.map((commune) => (
                      <option key={commune.id} value={commune.nom_commune}>
                        {commune.nom_commune} ({formatPrice(commune.tarif_livraison)})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Informations supplémentaires</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"

                    rows={3}
                    value={deliveryAddress.additionalInfo}
                    onChange={(e) => handleAddressChange('additionalInfo', e.target.value)}
                    placeholder="Instructions de livraison, points de repère..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne droite - Modes de paiement et total */}
        <div className="space-y-6">
          {/* Modes de paiement */}
          <div className="bg-white rounded-lg shadow-md border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-black">
                Mode de paiement
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${selectedPayment === 'moov'
                      ? 'border-2 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                    }`}
                  style={{
                    borderColor: selectedPayment === 'moov' ? boutiqueConfig.theme.primary : undefined,
                    backgroundColor: selectedPayment === 'moov' ? `${boutiqueConfig.theme.primary}10` : undefined
                  }}
                  onClick={() => handlePaymentChange('moov')}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="payment"
                      checked={selectedPayment === 'moov'}
                      onChange={() => handlePaymentChange('moov')}
                      className="mr-3 w-4 h-4"
                      style={{ accentColor: boutiqueConfig.theme.primary }}
                    />
                    <Image
                      src="/moov_money.png"
                      alt="Moov Money"
                      width={40}
                      height={40}
                      className="mr-3 rounded"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">Moov Money</div>
                      <div className="text-sm text-gray-600">Paiement mobile sécurisé</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${selectedPayment === 'airtel'
                      ? 'border-2 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                    }`}
                  style={{
                    borderColor: selectedPayment === 'airtel' ? boutiqueConfig.theme.primary : undefined,
                    backgroundColor: selectedPayment === 'airtel' ? `${boutiqueConfig.theme.primary}10` : undefined
                  }}
                  onClick={() => handlePaymentChange('airtel')}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="payment"
                      checked={selectedPayment === 'airtel'}
                      onChange={() => handlePaymentChange('airtel')}
                      className="mr-3 w-4 h-4"
                      style={{ accentColor: boutiqueConfig.theme.primary }}
                    />
                    <Image
                      src="/airtel_money.png"
                      alt="Airtel Money"
                      width={40}
                      height={40}
                      className="mr-3 rounded"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">Airtel Money</div>
                      <div className="text-sm text-gray-600">Paiement mobile sécurisé</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Champ numéro de téléphone qui apparaît après sélection */}
              {selectedPayment && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro {selectedPayment === 'moov' ? 'Moov Money' : 'Airtel Money'} *
                  </label>
                  <input
                    type="tel"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 ${paymentPhoneError
                        ? 'border-red-500 focus:ring-red-500'
                        : paymentPhone.length === 9 && !paymentPhoneError
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}

                    value={paymentPhone}
                    onChange={(e) => handlePaymentPhoneChange(e.target.value)}
                    placeholder={getPhonePlaceholder()}
                    maxLength={9}
                    required
                  />
                  {paymentPhoneError ? (
                    <p className="text-xs text-red-600 mt-1 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {paymentPhoneError}
                    </p>
                  ) : paymentPhone.length === 9 && !paymentPhoneError ? (
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Numéro valide
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">
                      Saisissez le numéro de téléphone associé à votre compte {selectedPayment === 'moov' ? 'Moov Money' : 'Airtel Money'}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Récapitulatif des prix */}
          <div className="bg-white rounded-lg shadow-md sticky top-24 border border-gray-100">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-6 text-black">
                Récapitulatif de la commande
              </h3>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Sous-total ({totalItems} articles)</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">
                    Frais de livraison
                    {deliveryAddress.city && (
                      <span className="text-xs text-gray-500 block">({deliveryAddress.city})</span>
                    )}
                  </span>
                  <span className="font-medium">
                    {deliveryAddress.city ? formatPrice(deliveryFee) : 'Sélectionnez une commune'}
                  </span>
                </div>
                {getTransactionFee() > 0 && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">
                      Frais de commodité
                      <span className="text-xs text-gray-500 block">
                        {payOnDelivery
                          ? '(4.5% sur frais de livraison)'
                          : '(4.5% sur total commande)'
                        }
                      </span>
                    </span>
                    <span className="font-medium">{formatPrice(getTransactionFee())}</span>
                  </div>
                )}
              </div>

              {/* Option paiement à la livraison */}
              <div className="border-t border-b py-4 border-gray-200">
                <label className={`flex items-center ${deliveryFee > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                  <input
                    type="checkbox"
                    checked={payOnDelivery}
                    onChange={(e) => setPayOnDelivery(e.target.checked)}
                    disabled={deliveryFee === 0}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    Je paie à la livraison
                  </span>
                </label>
                {deliveryFee === 0 && deliveryAddress.city && (
                  <p className="text-xs text-gray-500 mt-2 ml-7">
                    Non disponible pour les livraisons gratuites
                  </p>
                )}
                {payOnDelivery && deliveryFee > 0 && (
                  <p className="text-xs text-gray-500 mt-2 ml-7">
                    Vous payez les frais de livraison + frais de transaction maintenant. Le reste sera payé à la réception.
                  </p>
                )}
              </div>

              <div className="pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">
                    {payOnDelivery ? 'À payer maintenant' : 'Total à payer'}
                  </span>
                  <span className="text-2xl font-bold" style={{ color: boutiqueConfig.theme.primary }}>
                    {formatPrice(totalToPay)}
                  </span>
                </div>
                {payOnDelivery && remainingAmount > 0 && (
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                    <span className="text-sm text-gray-600">Reste à payer à la livraison</span>
                    <span className="text-lg font-semibold text-gray-700">
                      {formatPrice(remainingAmount)}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={handleSubmitOrder}
                disabled={!isFormValid() || isSubmitting}
                className={`w-full py-4 px-6 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${!isFormValid() || isSubmitting
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'text-white hover:opacity-90'
                  }`}
                style={{
                  backgroundColor: (!isFormValid() || isSubmitting) ? undefined : boutiqueConfig.theme.primary
                }}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {payOnDelivery ? 'Création en cours...' : 'Traitement en cours...'}
                  </div>
                ) : (
                  getButtonMessage()
                )}
              </button>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-500">
                  🔒 Paiement sécurisé • En confirmant, vous acceptez nos conditions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}