'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getForfaits, creerBoost, type ForfaitBoost } from '@/lib/services/boosts';
import { creerTransaction, type CreerTransactionData } from '@/lib/services/transactions';
import { initierPaiementMobile, verifierPaiementEnBoucle, type PaiementMobileData } from '@/lib/services/paiements';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import Sidebar from '@/components/admin/Sidebar';
import { BoutiqueData } from '@/lib/services/auth';
import PhoneNumberInput from '@/components/ui/PhoneNumberInput';
import PaymentProgressBar from '@/components/ui/PaymentProgressBar';
import PaymentCountdown from '@/components/ui/PaymentCountdown';
import { Megaphone, Menu, Check, Globe } from 'lucide-react';

const ZONES_DISPONIBLES = [
  { code: 'monde_entier', label: 'Monde entier' },
  { code: 'GA', label: 'Gabon' },
  { code: 'FR', label: 'France' },
  { code: 'CM', label: 'Cameroun' },
  { code: 'CI', label: "Côte d'Ivoire" },
  { code: 'SN', label: 'Sénégal' },
  { code: 'MA', label: 'Maroc' },
];

type Etape = 'forfait' | 'ciblage' | 'paiement';

export default function NewBoostPage() {
  const router = useRouter();
  const params = useParams();
  const boutiqueName = params.boutique as string;

  const { user, verifierBoutique } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();

  const [boutique, setBoutique] = useState<BoutiqueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [etape, setEtape] = useState<Etape>('forfait');
  const [forfaits, setForfaits] = useState<ForfaitBoost[]>([]);
  const [forfaitChoisi, setForfaitChoisi] = useState<ForfaitBoost | null>(null);
  const [zonesChoisies, setZonesChoisies] = useState<string[]>([]);

  const [selectedPayment, setSelectedPayment] = useState<'moov' | 'airtel' | null>(null);
  const [paymentPhone, setPaymentPhone] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) {
        router.push('/admin/login');
        return;
      }

      try {
        const boutiqueData = await verifierBoutique();
        if (!boutiqueData) {
          router.push('/admin/boutique/create');
          return;
        }
        if (boutiqueName !== boutiqueData.slug) {
          router.replace(`/admin/${boutiqueData.slug}/boost/new`);
          return;
        }

        setBoutique(boutiqueData);
        const listeForfaits = await getForfaits();
        setForfaits(listeForfaits);
      } catch (err) {
        console.error('Erreur lors du chargement:', err);
        showError('Erreur lors du chargement des forfaits');
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(load, 100);
    return () => clearTimeout(timer);
  }, [user, boutiqueName, router]);

  const toggleZone = (code: string) => {
    if (code === 'monde_entier') {
      setZonesChoisies(['monde_entier']);
      return;
    }
    setZonesChoisies((prev) => {
      const sansMonde = prev.filter((z) => z !== 'monde_entier');
      return sansMonde.includes(code) ? sansMonde.filter((z) => z !== code) : [...sansMonde, code];
    });
  };

  const handlePayerBoost = async () => {
    if (!boutique || !forfaitChoisi || !selectedPayment || !isPhoneValid) {
      showError('Veuillez compléter toutes les informations de paiement');
      return;
    }

    setIsSubmitting(true);

    try {
      const boost = await creerBoost({
        boutique_id: boutique.id,
        forfait_code: forfaitChoisi.code,
        zones: zonesChoisies,
      });

      const reference = `BOOST-${boost.id}-${Date.now()}`;
      const paymentSystem = selectedPayment === 'moov' ? 'moovmoney' : 'airtelmoney';
      const nom = user?.nom || 'Vendeur';

      const paiementData: PaiementMobileData = {
        email: user?.email || 'contact@marche241.ga',
        msisdn: paymentPhone,
        amount: forfaitChoisi.prix_vendeur_fcfa,
        reference,
        payment_system: paymentSystem,
        description: `Boost publicitaire ${forfaitChoisi.nom} - Boutique ${boutique.nom}`,
        lastname: nom,
        firstname: nom,
      };

      setShowProgressBar(true);
      const paiement = await initierPaiementMobile(paiementData);
      setShowProgressBar(false);

      if (!paiement.success || !paiement.bill_id) {
        showError(paiement.message || "Erreur lors de l'initiation du paiement");
        setIsSubmitting(false);
        return;
      }

      const transactionData: CreerTransactionData = {
        reference_transaction: reference,
        boost_id: boost.id,
        montant: forfaitChoisi.prix_vendeur_fcfa,
        methode_paiement: selectedPayment === 'moov' ? 'moov_money' : 'airtel_money',
        type_paiement: 'boost',
        numero_telephone: paymentPhone,
        reference_operateur: paiement.bill_id,
        note: `Paiement boost ${forfaitChoisi.nom} - Boutique ${boutique.nom}`,
      };

      try {
        await creerTransaction(transactionData);
      } catch (err) {
        console.error('Erreur transaction boost:', err);
      }

      const cancelSignal = { cancelled: false };
      setShowCountdown(true);

      verifierPaiementEnBoucle(paiement.bill_id, 60000, 5000, cancelSignal)
        .then((resultat) => {
          setShowCountdown(false);
          setIsSubmitting(false);

          if (resultat.status === 'paye' || resultat.status === 'paid' || resultat.status === 'processed') {
            success('Paiement confirmé ! Votre boost est en cours de publication.', 'Boost créé', 3000);
            router.push(`/admin/${boutique.slug}/boost`);
          } else if (resultat.status === 'echec' || resultat.status === 'failed') {
            showError(resultat.message || 'Le paiement a échoué. Veuillez réessayer.');
          } else {
            showError('Le paiement est toujours en attente. Vérifiez votre téléphone ou contactez le support.');
          }
        })
        .catch((err) => {
          console.error('Erreur vérification paiement boost:', err);
          setShowCountdown(false);
          setIsSubmitting(false);
          if (!cancelSignal.cancelled) {
            showError('Erreur lors de la vérification du paiement.');
          }
        });
    } catch (err) {
      console.error('Erreur lors de la création du boost:', err);
      showError(err instanceof Error ? err.message : 'Erreur lors de la création du boost');
      setIsSubmitting(false);
      setShowProgressBar(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!boutique) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Megaphone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Boutique non trouvée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden max-w-[100vw]">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {showProgressBar && (
        <PaymentProgressBar
          duration={5}
          onComplete={() => {}}
          title="Initialisation du paiement"
          description="Veuillez patienter..."
        />
      )}

      {showCountdown && (
        <PaymentCountdown
          duration={60}
          onComplete={() => setShowCountdown(false)}
          onCancel={() => setShowCountdown(false)}
          paymentMethod={selectedPayment === 'moov' ? 'Moov Money' : 'Airtel Money'}
          phoneNumber={paymentPhone}
        />
      )}

      <Sidebar
        boutique={boutique}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <div className="flex-1 flex flex-col min-h-0 w-full">
        <div className="bg-white shadow-sm border-b px-4 lg:px-6 py-3 lg:py-4">
          <div className="flex items-center min-w-0 flex-1">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors mr-3 flex-shrink-0"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg lg:text-2xl font-bold text-gray-900 truncate">Nouveau boost publicitaire</h1>
              <p className="text-xs lg:text-sm text-gray-500 mt-0.5 lg:mt-1 truncate">Boostez {boutique.nom} sur Facebook et Instagram</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
          <div className="mx-auto max-w-3xl space-y-6">
            {etape === 'forfait' && (
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-4">1. Choisissez un forfait</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {forfaits.map((forfait) => (
                    <button
                      key={forfait.code}
                      onClick={() => setForfaitChoisi(forfait)}
                      className={`rounded-xl border-2 p-5 text-left transition-colors ${
                        forfaitChoisi?.code === forfait.code ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900">{forfait.nom}</span>
                        {forfaitChoisi?.code === forfait.code && <Check className="h-5 w-5 text-black" />}
                      </div>
                      <p className="mt-2 text-2xl font-bold text-gray-900">{forfait.prix_vendeur_fcfa.toLocaleString('fr-FR')} FCFA</p>
                      <p className="text-sm text-gray-500">{forfait.duree_jours} jours de diffusion</p>
                      {forfait.reciblage && <p className="mt-1 text-xs text-gray-400">Inclut le reciblage des visiteurs du site</p>}
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    disabled={!forfaitChoisi}
                    onClick={() => setEtape('ciblage')}
                    className="rounded-lg bg-black px-6 py-2 text-sm font-medium text-white disabled:opacity-40"
                  >
                    Continuer
                  </button>
                </div>
              </div>
            )}

            {etape === 'ciblage' && (
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-1">2. Choisissez votre ciblage géographique</h2>
                <p className="text-sm text-gray-500 mb-4">
                  <Globe className="inline h-4 w-4 mr-1" />
                  Vous pouvez cibler n'importe où dans le monde, sans impact sur le prix du forfait.
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {ZONES_DISPONIBLES.map((zone) => (
                    <button
                      key={zone.code}
                      onClick={() => toggleZone(zone.code)}
                      className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
                        zonesChoisies.includes(zone.code) ? 'border-black bg-gray-50 text-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {zone.label}
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex justify-between">
                  <button onClick={() => setEtape('forfait')} className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700">
                    Retour
                  </button>
                  <button
                    disabled={zonesChoisies.length === 0}
                    onClick={() => setEtape('paiement')}
                    className="rounded-lg bg-black px-6 py-2 text-sm font-medium text-white disabled:opacity-40"
                  >
                    Continuer
                  </button>
                </div>
              </div>
            )}

            {etape === 'paiement' && forfaitChoisi && (
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-4">3. Confirmez et payez</h2>

                <div className="rounded-xl border border-gray-200 bg-white p-5 mb-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Forfait</span>
                    <span className="font-medium text-gray-900">{forfaitChoisi.nom}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>Durée</span>
                    <span className="font-medium text-gray-900">{forfaitChoisi.duree_jours} jours</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>Ciblage</span>
                    <span className="font-medium text-gray-900 text-right">
                      {zonesChoisies.map((z) => ZONES_DISPONIBLES.find((zone) => zone.code === z)?.label || z).join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-semibold text-gray-900 mt-4 pt-4 border-t border-gray-100">
                    <span>Total à payer</span>
                    <span>{forfaitChoisi.prix_vendeur_fcfa.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Mode de paiement</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setSelectedPayment('moov')}
                        className={`rounded-lg border-2 px-4 py-2 text-sm font-medium ${
                          selectedPayment === 'moov' ? 'border-black bg-gray-50' : 'border-gray-200'
                        }`}
                      >
                        Moov Money
                      </button>
                      <button
                        onClick={() => setSelectedPayment('airtel')}
                        className={`rounded-lg border-2 px-4 py-2 text-sm font-medium ${
                          selectedPayment === 'airtel' ? 'border-black bg-gray-50' : 'border-gray-200'
                        }`}
                      >
                        Airtel Money
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Numéro de paiement</label>
                    <PhoneNumberInput value={paymentPhone} onChange={setPaymentPhone} onValidationChange={setIsPhoneValid} required />
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <button onClick={() => setEtape('ciblage')} className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700">
                    Retour
                  </button>
                  <button
                    disabled={!selectedPayment || !isPhoneValid || isSubmitting}
                    onClick={handlePayerBoost}
                    className="rounded-lg bg-black px-6 py-2 text-sm font-medium text-white disabled:opacity-40"
                  >
                    {isSubmitting ? 'Traitement...' : `Payer ${forfaitChoisi.prix_vendeur_fcfa.toLocaleString('fr-FR')} FCFA`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
