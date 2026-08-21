'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { getPrixUnitairePanier, getSousTotalLignePanier } from '@/lib/utils/panier-pricing';
import { BoutiqueConfig } from '@/lib/boutiques';
import { usePanier } from '@/hooks/usePanier';
import { useToast } from '@/hooks/useToast';
import { creerCommande, CreerCommandeData } from '@/lib/services/commandes';
import { getCommunesActives } from '@/lib/services/communes';
import { initierPaiementMobile, verifierPaiementEnBoucle, type PaiementMobileData } from '@/lib/services/paiements';
import { creerTransaction, type CreerTransactionData } from '@/lib/services/transactions';
import { checkWhatsAppNumber } from '@/lib/services/whatsapp';
import PhoneNumberInput from '@/components/ui/PhoneNumberInput';
import PaymentProgressBar from '@/components/ui/PaymentProgressBar';
import PaymentCountdown from '@/components/ui/PaymentCountdown';
import { ToastContainer } from '@/components/ui/Toast';
import { normalizeMsisdnInput, validateMsisdn, msisdnPlaceholder, type MobileMoneyOperator } from '@/lib/utils/mobileMoneyMsisdn';
import type { PersonnalisationSelectionPanier } from '@/lib/types/personnalisations';
import { Trash, Check, Minus, Plus, CheckCircle } from '@phosphor-icons/react';

const fieldClass =
  'h-11 w-full rounded-[9px] border border-[#e0ded9] px-3 text-sm focus:outline-none focus:border-[var(--color-shop-primary)] focus:ring-1 focus:ring-[var(--color-shop-primary)]';

interface OrderSummaryProps {
  boutiqueConfig: BoutiqueConfig;
  boutiqueId: number;
  boutiqueTelephone?: string;
  boutiqueData: any; // Données complètes de la boutique
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

// Fonction utilitaire pour formater les variants en string lisible
const formatVariantsString = (variants_selectionnes: any): string | undefined => {
  if (!variants_selectionnes) return undefined;
  
  // Si on a un objet variant avec un nom, l'utiliser directement
  if (variants_selectionnes.variant?.nom) {
    return variants_selectionnes.variant.nom;
  }
  
  // Sinon, construire à partir des autres propriétés (exclure 'variant')
  const entries = Object.entries(variants_selectionnes)
    .filter(([key]) => key !== 'variant')
    .map(([key, value]) => {
      // Ne pas afficher les objets complexes
      if (typeof value === 'object' && value !== null) {
        return null;
      }
      return `${key}: ${value}`;
    })
    .filter(Boolean);
  
  return entries.length > 0 ? entries.join(', ') : undefined;
};


export function OrderSummary({ boutiqueConfig, boutiqueId, boutiqueTelephone, boutiqueData }: OrderSummaryProps) {
  const params = useParams();
  const searchParams = useSearchParams();
  const boutiqueSlug = params.boutique as string;
  const isAchatDirect = searchParams.get('direct') === '1';

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(null);
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentPhoneError, setPaymentPhoneError] = useState('');

  // États pour Cloudflare Turnstile
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  // Récupération de la restriction des modes de paiement :
  // - complet_uniquement : paiement complet obligatoire en ligne.
  // - livraison_uniquement : paiement des frais de livraison uniquement en ligne.
  // - les_deux : l'utilisateur peut choisir entre les deux.
  const paymentRestrictionMode = boutiqueData?.payment_restriction_mode || 'les_deux';
  const [payOnDelivery, setPayOnDelivery] = useState(() => {
    if (paymentRestrictionMode === 'livraison_uniquement') return true;
    return false;
  });

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
  const { panier, totalItems, totalPrix, loading, supprimerItem, viderLePanier, mettreAJourQuantite } = usePanier(boutiqueId);
  const [itemsToDelete, setItemsToDelete] = useState<Set<number>>(new Set());
  const [showDeliveryNotes, setShowDeliveryNotes] = useState(false);

  const handleDeleteClick = (itemId: number) => {
    if (itemsToDelete.has(itemId)) {
      supprimerItem(itemId);
      setItemsToDelete(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    } else {
      setItemsToDelete(prev => new Set(prev).add(itemId));
      setTimeout(() => {
        setItemsToDelete(prev => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }, 3000);
    }
  };
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

  // Initialiser le widget Cloudflare Turnstile de façon robuste
  useEffect(() => {
    const interval = setInterval(() => {
      if (
        typeof window !== 'undefined' &&
        (window as any).turnstile &&
        turnstileContainerRef.current &&
        !widgetIdRef.current
      ) {
        clearInterval(interval);
        try {
          const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
          if (siteKey) {
            widgetIdRef.current = (window as any).turnstile.render(turnstileContainerRef.current, {
              sitekey: siteKey,
              callback: (token: string) => {
                console.log('[Turnstile] Jeton généré avec succès');
                setTurnstileToken(token);
              },
              'expired-callback': () => {
                console.log('[Turnstile] Jeton expiré');
                setTurnstileToken(null);
              },
              'error-callback': () => {
                console.error('[Turnstile] Erreur de validation');
                setTurnstileToken(null);
              }
            });
          }
        } catch (e) {
          console.error('Erreur lors du rendu de Turnstile:', e);
        }
      }
    }, 500);

    return () => {
      clearInterval(interval);
      if (widgetIdRef.current && typeof window !== 'undefined' && (window as any).turnstile) {
        try {
          (window as any).turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch (e) {}
      }
    };
  }, []);

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

  // Synchronisation de payOnDelivery en fonction des restrictions et des frais de livraison
  useEffect(() => {
    if (paymentRestrictionMode === 'livraison_uniquement') {
      if (deliveryFee > 0) {
        setPayOnDelivery(true);
      } else {
        // Si livraison gratuite, on ne peut pas payer uniquement les frais de livraison (qui sont de 0) en ligne
        setPayOnDelivery(false);
      }
    } else if (paymentRestrictionMode === 'complet_uniquement') {
      setPayOnDelivery(false);
    } else if (deliveryFee === 0) {
      setPayOnDelivery(false);
    }
  }, [paymentRestrictionMode, deliveryFee]);

  // Calcul des frais de transaction (10%)
  const getTransactionFee = () => {
    const transactionRate = 0.10; // 10%

    if (payOnDelivery) {
      // Pour paiement à la livraison : 10% seulement sur les frais de livraison
      return Math.round(deliveryFee * transactionRate);
    } else {
      // Pour paiement normal : 10% sur le total (sous-total + livraison)
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

    // Si Turnstile est configuré, valider que le jeton a bien été généré
    const isTurnstileValid = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
      ? turnstileToken !== null
      : true;

    return isAddressComplete && isWhatsAppValid && isPaymentSelected && isPaymentPhoneValid && isCommuneSelected && isTurnstileValid;
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
    if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !turnstileToken) {
      return 'Validation de sécurité requise';
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
      if (selectedCommune) {
        if (selectedCommune.tarif_livraison === 0) {
          // Désactiver le paiement à la livraison si la livraison est gratuite
          setPayOnDelivery(false);
        } else if (paymentRestrictionMode === 'livraison_uniquement') {
          // Si mode livraison uniquement, forcer le paiement à la livraison
          setPayOnDelivery(true);
        } else if (paymentRestrictionMode === 'complet_uniquement') {
          // Si mode complet uniquement, désactiver le paiement à la livraison
          setPayOnDelivery(false);
        }
      }
    }
  };

  const handlePaymentChange = (payment: PaymentMethod) => {
    setSelectedPayment(payment);
    // Réinitialiser le numéro de téléphone et l'erreur quand on change de mode de paiement
    setPaymentPhone('');
    setPaymentPhoneError('');
  };

  const getPhonePlaceholder = () => {
    if (selectedPayment === 'moov' || selectedPayment === 'airtel') {
      return msisdnPlaceholder(selectedPayment as MobileMoneyOperator);
    }
    return '';
  };

  const handlePaymentPhoneChange = (value: string) => {
    const cleanValue = normalizeMsisdnInput(value);
    setPaymentPhone(cleanValue);

    if (selectedPayment === 'moov' || selectedPayment === 'airtel') {
      setPaymentPhoneError(validateMsisdn(cleanValue, selectedPayment));
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
          prix_unitaire: getPrixUnitairePanier(item),
          nom_produit: item.produit.nom,
          description: item.produit.description_courte || item.produit.nom,
          variants_selectionnes: item.variants_selectionnes
        }))
      };



      const commande = await creerCommande(commandeData, turnstileToken || undefined);
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

        setShowProgressBar(true);

        const paiement = await initierPaiementMobile(paiementData);

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

                  await handleSuccessfulPayment('partiel', commande.commande.numero_commande);
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

        setShowProgressBar(true);

        const paiement = await initierPaiementMobile(paiementData);

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

                  await handleSuccessfulPayment('complet', commande.commande.numero_commande);
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

  const handleSuccessfulPayment = async (typePaiement: 'partiel' | 'complet', numeroCommande: string) => {
    const panierVide = await viderLePanier();

    if (!panierVide) {
      console.warn('Le paiement est validé mais le panier n\'a pas pu être vidé.');
    }

    setTimeout(() => {
      window.location.href = `/${boutiqueSlug}/confirmation?commande=${numeroCommande}&type=${typePaiement}`;
    }, 2000);
  };

  // --- Valeurs dérivées purement pour l'affichage (aucun impact sur la logique de paiement) ---
  const selectedCommune = communes.find((commune) => commune.nom_commune === deliveryAddress.city);
  const transactionRate = 0.10;
  const fullTransactionFee = Math.round((subtotal + deliveryFee) * transactionRate);
  const fullTotal = subtotal + deliveryFee + fullTransactionFee;
  const deliveryOnlyFee = Math.round(deliveryFee * transactionRate);
  const deliveryOnlyTotal = deliveryFee + deliveryOnlyFee;

  return (
    <div className="w-full">
      {/* Script de Cloudflare Turnstile */}
      {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      )}

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

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 pb-28 lg:grid-cols-[1fr_380px] lg:pb-8">
        {/* Colonne gauche */}
        <div className="space-y-5">
          {/* Carte 1 — Votre commande */}
          <div className="rounded-[12px] border border-[#ececea] bg-white p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-[#17181a]">
                  Votre commande
                  {totalItems > 0 && (
                    <span className="ml-1 font-normal text-[#8b8f95]">
                      ({totalItems} article{totalItems > 1 ? 's' : ''})
                    </span>
                  )}
                </h2>
                {isAchatDirect && (
                  <span
                    className="rounded-full px-2 py-0.5 font-mono text-[11px] uppercase tracking-[.05em]"
                    style={{ background: 'var(--shop-primary-tint)', color: 'var(--shop-primary-dark)' }}
                  >
                    Achat direct
                  </span>
                )}
              </div>
              <Link
                href={`/${boutiqueSlug}`}
                className="text-[13px] font-medium hover:underline"
                style={{ color: 'var(--color-shop-primary)' }}
              >
                + Ajouter d&apos;autres articles
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#17181a]"></div>
                <span className="ml-2 text-sm text-[#6b6f76]">Chargement du panier...</span>
              </div>
            ) : panier.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-[#8b8f95]">Votre panier est vide</p>
              </div>
            ) : (
              <div className="divide-y divide-[#ececea]">
                {panier.map((item) => {
                  // Utiliser l'image du variant si disponible, sinon l'image du produit
                  const imageUrl = item.variants_selectionnes?.variant?.image
                    || item.produit.image_principale
                    || '/article1.webp';

                  return (
                    <div key={item.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[9px] bg-[#f6f5f3]">
                        <Image
                          src={imageUrl}
                          alt={item.produit.nom}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="min-w-0 truncate text-sm font-medium text-[#17181a]">{item.produit.nom}</h4>
                          <button
                            onClick={() => handleDeleteClick(item.id)}
                            className={`shrink-0 transition-all duration-300 ${itemsToDelete.has(item.id) ? 'text-green-500 hover:text-green-600' : 'text-[#9a9892] hover:text-red-500'}`}
                            aria-label={itemsToDelete.has(item.id) ? "Confirmer la suppression" : "Supprimer l'article"}
                          >
                            {itemsToDelete.has(item.id) ? <Check size={18} className="animate-pulse" /> : <Trash size={18} />}
                          </button>
                        </div>

                        {/* Variant + options + lien modifier */}
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[12.5px] text-[#6b6f76]">
                          {item.variants_selectionnes?.variant && (
                            <span>{item.variants_selectionnes.variant.nom}</span>
                          )}
                          {item.variants_selectionnes?.options && Object.keys(item.variants_selectionnes.options).length > 0 && (
                            <span>
                              {Object.entries(item.variants_selectionnes.options).map(([key, value]) => `${key}: ${value}`).join(', ')}
                            </span>
                          )}
                          <Link
                            href={`/${boutiqueSlug}/produit/${item.produit_id}`}
                            className="font-medium hover:underline"
                            style={{ color: 'var(--color-shop-primary)' }}
                          >
                            Modifier
                          </Link>
                        </div>

                        {/* Personnalisations */}
                        {Array.isArray(item.variants_selectionnes?.personnalisations) &&
                          item.variants_selectionnes.personnalisations.length > 0 && (
                            <div className="mt-1 space-y-0.5 text-[12.5px] text-[#6b6f76]">
                              {item.variants_selectionnes.personnalisations.map((ligne: PersonnalisationSelectionPanier) => (
                                <div key={ligne.id}>
                                  <span className="font-medium">{ligne.libelle}:</span> {ligne.valeur}
                                  {ligne.prix_supplementaire > 0 ? (
                                    <span className="text-[#9a9892]">
                                      {' '}
                                      (+{formatPrice(ligne.prix_supplementaire)})
                                    </span>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          )}

                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => mettreAJourQuantite(item.id, item.quantite - 1)}
                              disabled={item.quantite <= 1}
                              className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e0ded9] text-[#3c4045] transition-colors hover:bg-[#f6f5f3] disabled:cursor-not-allowed disabled:opacity-30"
                              aria-label="Diminuer la quantité"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-5 text-center text-sm font-medium text-[#17181a]">{item.quantite}</span>
                            <button
                              type="button"
                              onClick={() => mettreAJourQuantite(item.id, item.quantite + 1)}
                              disabled={item.quantite >= item.produit.quantite_stock}
                              className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e0ded9] text-[#3c4045] transition-colors hover:bg-[#f6f5f3] disabled:cursor-not-allowed disabled:opacity-30"
                              aria-label="Augmenter la quantité"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <span className="font-mono text-sm font-semibold text-[#17181a]">
                            {formatPrice(getSousTotalLignePanier(item))}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Carte 2 — Livraison */}
          <div className="rounded-[12px] border border-[#ececea] bg-white p-5">
            <h2 className="mb-4 text-base font-semibold text-[#17181a]">Livraison</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[#3c4045]">Nom complet *</label>
                <input
                  type="text"
                  className={fieldClass}
                  value={deliveryAddress.fullName}
                  onChange={(e) => handleAddressChange('fullName', e.target.value)}
                  placeholder="Votre nom complet"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[#3c4045]">WhatsApp *</label>
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
                      <div className="flex items-center text-[12.5px] text-[#6b6f76]">
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-[#c7c5bf] border-t-transparent"></div>
                        Vérification du numéro WhatsApp...
                      </div>
                    )}

                    {!isCheckingWhatsApp && whatsAppExists === true && (
                      <div className="flex items-center text-[12.5px] text-green-600">
                        <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Numéro WhatsApp vérifié
                      </div>
                    )}

                    {!isCheckingWhatsApp && whatsAppExists === false && (
                      <div className="flex items-center text-[12.5px] text-red-600">
                        <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {whatsAppError || 'Numéro non enregistré sur WhatsApp'}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-[13px] font-medium text-[#3c4045]">Adresse complète *</label>
                <input
                  type="text"
                  className={fieldClass}
                  value={deliveryAddress.address}
                  onChange={(e) => handleAddressChange('address', e.target.value)}
                  placeholder="Numéro, rue, quartier"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-[13px] font-medium text-[#3c4045]">Commune *</label>
                <select
                  className={fieldClass}
                  style={deliveryAddress.city ? { borderColor: 'var(--color-shop-primary)' } : undefined}
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
                {selectedCommune && (
                  <p className="mt-1.5 text-[12.5px] font-medium text-green-600">
                    {selectedCommune.tarif_livraison === 0 ? 'Livraison gratuite' : `Livraison ${formatPrice(selectedCommune.tarif_livraison)}`}
                    {' · '}
                    {selectedCommune.delai_livraison_min}–{selectedCommune.delai_livraison_max} h
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                {!showDeliveryNotes ? (
                  <button
                    type="button"
                    onClick={() => setShowDeliveryNotes(true)}
                    className="text-[13px] font-medium hover:underline"
                    style={{ color: 'var(--color-shop-primary)' }}
                  >
                    + Ajouter des instructions de livraison
                  </button>
                ) : (
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-[#3c4045]">Informations supplémentaires</label>
                    <textarea
                      className={`${fieldClass} h-auto py-2`}
                      rows={3}
                      value={deliveryAddress.additionalInfo}
                      onChange={(e) => handleAddressChange('additionalInfo', e.target.value)}
                      placeholder="Instructions de livraison, points de repère..."
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Carte 3 — Moyen de paiement */}
          <div className="rounded-[12px] border border-[#ececea] bg-white p-5">
            <h2 className="mb-4 text-base font-semibold text-[#17181a]">Moyen de paiement</h2>
            <div className="grid grid-cols-2 gap-3">
              {(['moov', 'airtel'] as const).map((method) => {
                const isSelected = selectedPayment === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => handlePaymentChange(method)}
                    className="relative flex flex-col items-center gap-2 rounded-[9px] border-[1.5px] p-4 text-center transition-colors"
                    style={{
                      borderColor: isSelected ? 'var(--color-shop-primary)' : '#e0ded9',
                      backgroundColor: isSelected ? 'var(--shop-primary-tint)' : '#fff',
                    }}
                  >
                    {isSelected && (
                      <CheckCircle
                        size={18}
                        weight="fill"
                        className="absolute right-2 top-2"
                        style={{ color: 'var(--color-shop-primary)' }}
                      />
                    )}
                    <Image
                      src={method === 'moov' ? '/moov_money.png' : '/airtel_money.png'}
                      alt={method === 'moov' ? 'Moov Money' : 'Airtel Money'}
                      width={40}
                      height={40}
                      className="rounded"
                    />
                    <span className="text-sm font-semibold text-[#17181a]">
                      {method === 'moov' ? 'Moov Money' : 'Airtel Money'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Champ numéro de téléphone qui apparaît après sélection */}
            {selectedPayment && (
              <div className="mt-4">
                <label className="mb-1.5 block text-[13px] font-medium text-[#3c4045]">
                  Numéro {selectedPayment === 'moov' ? 'Moov Money' : 'Airtel Money'} *
                </label>
                <input
                  type="tel"
                  className={`${fieldClass} ${paymentPhoneError
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : paymentPhone.length === 9 && !paymentPhoneError
                      ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                      : ''
                    }`}
                  value={paymentPhone}
                  onChange={(e) => handlePaymentPhoneChange(e.target.value)}
                  placeholder={getPhonePlaceholder()}
                  maxLength={9}
                  required
                />
                {paymentPhoneError ? (
                  <p className="mt-1.5 text-[12.5px] text-red-600">{paymentPhoneError}</p>
                ) : paymentPhone.length === 9 && !paymentPhoneError ? (
                  <p className="mt-1.5 text-[12.5px] text-green-600">Numéro valide</p>
                ) : (
                  <p className="mt-1.5 text-[12.5px] text-[#8b8f95]">
                    Vous recevrez une demande de confirmation sur ce numéro. Aucun code à saisir ici.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Carte 4 — Montant à régler maintenant */}
          {paymentRestrictionMode === 'les_deux' && deliveryFee > 0 && (
            <div className="rounded-[12px] border border-[#ececea] bg-white p-5">
              <h2 className="mb-4 text-base font-semibold text-[#17181a]">Montant à régler maintenant</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPayOnDelivery(false)}
                  className="rounded-[9px] border-[1.5px] p-4 text-left transition-colors"
                  style={{
                    borderColor: !payOnDelivery ? 'var(--color-shop-primary)' : '#e0ded9',
                    backgroundColor: !payOnDelivery ? 'var(--shop-primary-tint)' : '#fff',
                  }}
                >
                  <span className="block text-sm font-semibold text-[#17181a]">Tout payer maintenant</span>
                  <span className="mt-1 block font-mono text-base font-bold" style={{ color: 'var(--color-shop-primary)' }}>
                    {formatPrice(fullTotal)}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setPayOnDelivery(true)}
                  className="rounded-[9px] border-[1.5px] p-4 text-left transition-colors"
                  style={{
                    borderColor: payOnDelivery ? 'var(--color-shop-primary)' : '#e0ded9',
                    backgroundColor: payOnDelivery ? 'var(--shop-primary-tint)' : '#fff',
                  }}
                >
                  <span className="block text-sm font-semibold text-[#17181a]">Payer la livraison seulement</span>
                  <span className="mt-1 block text-[12.5px] text-[#6b6f76]">
                    <span className="font-mono font-semibold text-[#17181a]">{formatPrice(deliveryOnlyTotal)}</span> maintenant · {formatPrice(subtotal)} à la réception
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Colonne droite — Récapitulatif */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[12px] border border-[#ececea] bg-white p-5">
            <h2 className="mb-4 text-base font-semibold text-[#17181a]">Récapitulatif</h2>

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#6b6f76]">Sous-total ({totalItems} article{totalItems > 1 ? 's' : ''})</span>
                <span className="font-mono font-medium text-[#17181a]">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6b6f76]">Livraison</span>
                <span className="font-mono font-medium text-[#17181a]">
                  {deliveryAddress.city ? formatPrice(deliveryFee) : (communesLoading ? '—' : 'Sélectionnez une commune')}
                </span>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6b6f76]">Frais de service</span>
                  <span className="font-mono font-medium text-[#17181a]">
                    {getTransactionFee() > 0 ? formatPrice(getTransactionFee()) : '—'}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-[#9a9892]">
                  Protection de la commande et frais de transaction Marché241, non remboursables.
                </p>
              </div>
            </div>

            {payOnDelivery && remainingAmount > 0 && (
              <div
                className="mt-3 rounded-[9px] p-3 text-[12.5px]"
                style={{ backgroundColor: 'var(--shop-primary-tint)', color: 'var(--shop-primary-dark)' }}
              >
                Vous payez la livraison + frais maintenant. {formatPrice(remainingAmount)} restant à régler à la réception.
              </div>
            )}

            <div className="mt-4 flex items-baseline justify-between border-t border-[#ececea] pt-4">
              <span className="text-sm font-semibold text-[#17181a]">
                {payOnDelivery ? 'À payer maintenant' : 'Total à payer'}
              </span>
              <span className="font-mono text-xl font-bold" style={{ color: 'var(--color-shop-primary)' }}>
                {formatPrice(totalToPay)}
              </span>
            </div>

            {/* Widget Cloudflare Turnstile */}
            {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
              <div className="mt-3 flex origin-top scale-90 justify-center">
                <div ref={turnstileContainerRef} />
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmitOrder}
              disabled={!isFormValid() || isSubmitting}
              className="mt-4 hidden h-12 w-full items-center justify-center rounded-[9px] text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 lg:flex"
              style={{ backgroundColor: 'var(--color-shop-primary)', color: 'var(--shop-cta-fg, #fff)' }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="mr-2 h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {payOnDelivery ? 'Création en cours...' : 'Traitement en cours...'}
                </span>
              ) : (
                getButtonMessage()
              )}
            </button>

            <p className="mt-3 text-center text-[11px] text-[#9a9892]">
              Paiement sécurisé · vérification anti-robot automatique
            </p>

            <div className="mt-4 space-y-1.5 text-[12.5px] text-[#6b6f76]">
              {selectedCommune && (
                <p>Livraison à {selectedCommune.nom_commune} en {selectedCommune.delai_livraison_min}–{selectedCommune.delai_livraison_max} h</p>
              )}
              <p>Suivi de votre commande par WhatsApp</p>
              <p>Réponse du vendeur sous peu</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barre sticky mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#ececea] bg-white p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div>
            <p className="text-[11px] text-[#8b8f95]">{payOnDelivery ? 'À payer maintenant' : 'Total'}</p>
            <p className="font-mono text-base font-bold" style={{ color: 'var(--color-shop-primary)' }}>
              {formatPrice(totalToPay)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSubmitOrder}
            disabled={!isFormValid() || isSubmitting}
            className="h-12 max-w-[200px] flex-1 rounded-[9px] text-sm font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            style={{ backgroundColor: 'var(--color-shop-primary)', color: 'var(--shop-cta-fg, #fff)' }}
          >
            {isSubmitting ? 'Traitement...' : 'Payer maintenant'}
          </button>
        </div>
      </div>
    </div>
  );
}