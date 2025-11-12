'use client';

import { useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Mail, MessageSquare, Package, ArrowLeft } from 'lucide-react';

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const boutiqueSlug = params.boutique as string;
  const numeroCommande = searchParams.get('commande');
  const typePaiement = searchParams.get('type'); // 'partiel' ou 'complet'

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Card principale */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header avec animation de succès */}
          <div className="bg-black p-8 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-4 animate-bounce">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Commande confirmée !
            </h1>
            <p className="text-green-100 text-lg">
              Votre paiement a été reçu avec succès
            </p>
          </div>

          {/* Corps du message */}
          <div className="p-8">
            {/* Numéro de commande */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6 border-2 border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Package className="w-6 h-6 text-gray-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Numéro de commande</p>
                    <p className="text-xl font-bold text-gray-900">{numeroCommande}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Type de paiement */}
            {typePaiement === 'partiel' ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Paiement partiel - Frais de livraison payés
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Vous avez payé les frais de livraison. Le reste du montant sera à régler à la réception de votre commande.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Paiement complet effectué
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        Votre commande est entièrement payée. Elle sera préparée et expédiée dans les plus brefs délais.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions de vérification */}
            <div className="space-y-4 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Prochaines étapes
              </h2>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">1</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-gray-700">
                    <strong>Vérifiez vos notifications</strong> - Un email de confirmation vous a été envoyé avec tous les détails de votre commande.
                  </p>
                </div>
                <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-sm">2</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-gray-700">
                    <strong>WhatsApp</strong> - Vous recevrez également un message WhatsApp avec le suivi de votre commande.
                  </p>
                </div>
                <MessageSquare className="w-5 h-5 text-green-500 flex-shrink-0" />
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold text-sm">3</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-gray-700">
                    <strong>Préparation</strong> - Votre commande sera préparée et vous serez notifié de l'expédition.
                  </p>
                </div>
                <Package className="w-5 h-5 text-purple-500 flex-shrink-0" />
              </div>
            </div>

            {/* Note importante */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Note :</strong> Si vous ne recevez pas d'email dans les prochaines minutes, vérifiez votre dossier spam ou contactez le support.
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/${boutiqueSlug}`}
                className="flex-1 flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à la boutique
              </Link>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-gray-600 text-sm">
          <p>Besoin d'aide ? Contactez notre support client</p>
        </div>
      </div>
    </div>
  );
}

