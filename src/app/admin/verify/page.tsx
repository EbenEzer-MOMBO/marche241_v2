'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Shield, Loader2, RefreshCw } from 'lucide-react';

export default function AdminVerifyPage() {
  const [code, setCode] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [tentativesRestantes, setTentativesRestantes] = useState(3);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const telephone = searchParams.get('telephone') || '';
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown pour le renvoi du code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Rediriger si pas de numéro de téléphone
  useEffect(() => {
    if (!telephone) {
      router.push('/admin/login');
    }
  }, [telephone, router]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return; // Empêcher plus d'un caractère
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Passer au champ suivant si un chiffre est saisi
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Soumettre automatiquement si tous les champs sont remplis
    if (newCode.every(digit => digit !== '') && value) {
      handleSubmit(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Retour arrière : effacer et passer au champ précédent
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (codeToSubmit?: string) => {
    const finalCode = codeToSubmit || code.join('');
    
    if (finalCode.length !== 4) {
      setError('Veuillez saisir le code à 4 chiffres');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulation de la vérification du code (sans backend)
    setTimeout(() => {
      // Code correct simulé : 1234
      if (finalCode === '1234') {
        // Simuler le stockage du token
        localStorage.setItem('admin_token', 'fake-jwt-token-' + Date.now());
        localStorage.setItem('admin_user', JSON.stringify({
          telephone: telephone.replace(/\s/g, ''),
          nom: 'Vendeur Test',
          email: 'test@example.com'
        }));
        
        // Rediriger vers le dashboard admin
        router.push('/admin/dashboard');
      } else {
        const nouvellesTontatives = tentativesRestantes - 1;
        setTentativesRestantes(nouvellesTontatives);
        
        if (nouvellesTontatives > 0) {
          setError(`Code incorrect. ${nouvellesTontatives} tentative(s) restante(s)`);
        } else {
          setError('Trop de tentatives. Redirection vers la page de connexion...');
          setTimeout(() => {
            router.push('/admin/login');
          }, 3000);
        }
        
        // Effacer le code en cas d'erreur
        setCode(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }
      
      setIsLoading(false);
    }, 1000); // Simuler un délai réseau
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    setIsLoading(true);
    setError('');

    // Simulation du renvoi du code (sans backend)
    setTimeout(() => {
      console.log(`Nouveau code simulé envoyé au +241${telephone.replace(/\s/g, '')}: 1234`);
      
      setCanResend(false);
      setCountdown(60);
      setTentativesRestantes(3);
      setCode(['', '', '', '']);
      inputRefs.current[0]?.focus();
      setIsLoading(false);
    }, 1000);
  };

  const formatPhoneDisplay = (phone: string) => {
    const cleaned = phone.replace(/\s/g, '');
    return `+241 ${cleaned}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Bouton retour */}
        <button
          onClick={() => router.push('/admin/login')}
          className="flex items-center text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </button>

        {/* Logo et titre */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Vérification
          </h2>
          <p className="text-gray-600">
            Code envoyé sur WhatsApp au
          </p>
          <p className="text-lg font-semibold text-gray-600">
            {telephone}
          </p>
        </div>

        {/* Formulaire de vérification */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                Saisissez le code à 4 chiffres
              </label>
              
              <div className="flex justify-center space-x-3">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600 text-center">{error}</p>
                {tentativesRestantes > 0 && (
                  <p className="text-xs text-red-500 text-center mt-1">
                    {tentativesRestantes} tentative(s) restante(s)
                  </p>
                )}
              </div>
            )}

            {isLoading && (
              <div className="flex justify-center">
                <Loader2 className="animate-spin h-6 w-6 text-gray-600" />
              </div>
            )}

            {/* Bouton de renvoi */}
            <div className="text-center">
              {canResend ? (
                <button
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="flex items-center justify-center mx-auto text-gray-600 hover:text-gray-700 font-medium text-sm transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Renvoyer le code
                </button>
              ) : (
                <p className="text-sm text-gray-500">
                  Renvoyer le code dans {countdown}s
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Informations */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Vérifiez vos messages WhatsApp. Le code expire dans 5 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
