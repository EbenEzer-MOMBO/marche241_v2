'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import PhoneNumberInput from '@/components/ui/PhoneNumberInput';
import { useAuth } from '@/hooks/useAuth';
import { ToastContainer } from '@/components/ui/Toast';
import { checkWhatsAppNumber } from '@/lib/services/whatsapp';

export default function AdminRegisterPage() {
    const [formData, setFormData] = useState({
        nom: '',
        telephone: '',
        email: '',
        ville: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isPhoneValid, setIsPhoneValid] = useState(false);
    const [isCheckingWhatsApp, setIsCheckingWhatsApp] = useState(false);
    const [whatsAppExists, setWhatsAppExists] = useState<boolean | null>(null);
    const [whatsAppError, setWhatsAppError] = useState<string | null>(null);
    const router = useRouter();
    const { inscrire, isLoading: authLoading, toasts, removeToast } = useAuth();

    // Vérifier le numéro WhatsApp quand il est valide
    useEffect(() => {
        const verifyWhatsApp = async () => {
            if (isPhoneValid && formData.telephone) {
                setIsCheckingWhatsApp(true);
                setWhatsAppError(null);
                setWhatsAppExists(null);

                try {
                    const result = await checkWhatsAppNumber(formData.telephone);
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
    }, [formData.telephone, isPhoneValid]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation côté client
        if (!isFormValid()) {
            setError('Veuillez remplir tous les champs requis');
            return;
        }

        // Vérifier que le numéro WhatsApp existe avant de soumettre
        if (!whatsAppExists) {
            setError('Le numéro doit être enregistré sur WhatsApp pour créer un compte');
            return;
        }

        const result = await inscrire({
            email: formData.email,
            nom: formData.nom,
            telephone: formData.telephone,
            ville: formData.ville
        });

        if (result.success && result.email) {
            // Rediriger vers la page de vérification
            router.push(`/admin/verify?email=${encodeURIComponent(result.email)}`);
        }
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const isFormValid = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return (
            formData.nom.trim().length >= 2 &&
            emailRegex.test(formData.email) &&
            isPhoneValid &&
            formData.ville.trim().length >= 2
        );
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8">
                {/* Logo et titre */}
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-white rounded-0 flex items-center justify-center mb-4 overflow-hidden p-0">
                        <Image
                            src="/marche241_Web_with_text-01.svg"
                            alt="Marché 241"
                            width={52}
                            height={52}
                            className="object-contain w-full h-full"
                            title="Marché 241"
                        />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Devenir Vendeur
                    </h2>
                    <p className="text-gray-600">
                        Créez votre compte pour vendre sur Marché 241
                    </p>
                </div>

                {/* Formulaire d'inscription */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Nom complet */}
                        <div>
                            <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                                Nom complet *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input
                                    id="nom"
                                    name="nom"
                                    type="text"
                                    required
                                    value={formData.nom}
                                    onChange={handleChange}
                                    placeholder="Votre nom complet"
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Numéro de téléphone */}
                        <div>
                            <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-2">
                                Numéro de téléphone (WhatsApp) *
                            </label>
                            <PhoneNumberInput
                                value={formData.telephone}
                                onChange={(value) => setFormData({ ...formData, telephone: value })}
                                placeholder="6XXXXXXX"
                                required
                                className="w-full"
                                onValidationChange={setIsPhoneValid}
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

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    required
                                    onChange={handleChange}
                                    placeholder="votre@email.com"
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Ville */}
                        <div>
                            <label htmlFor="ville" className="block text-sm font-medium text-gray-700 mb-2">
                                Ville *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <input
                                    id="ville"
                                    name="ville"
                                    type="text"
                                    required
                                    value={formData.ville}
                                    onChange={handleChange}
                                    placeholder="Libreville, Port-Gentil, etc."
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={authLoading || !isFormValid() || !whatsAppExists || isCheckingWhatsApp}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {authLoading ? (
                                <>
                                    <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                    Création en cours...
                                </>
                            ) : (
                                <>
                                    Créer mon compte vendeur
                                    <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500">
                            En créant un compte, vous acceptez nos conditions d'utilisation
                        </p>
                    </div>
                </div>

                {/* Lien vers connexion */}
                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Vous avez déjà un compte ?{' '}
                        <a href="/admin/login" className="font-medium text-gray-900 hover:text-gray-800">
                            Se connecter
                        </a>
                    </p>
                </div>
            </div>
            
            {/* Toast Container */}
            <ToastContainer toasts={toasts} onClose={removeToast} />
        </div>
    );
}
