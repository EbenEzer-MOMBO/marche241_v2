'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ToastContainer } from '@/components/ui/Toast';
import { getPendingOnboardingEmail } from '@/lib/onboarding/storage';

export const VerifStep = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || getPendingOnboardingEmail() || '';
  const phone = searchParams.get('phone') || '';

  const codeLength = phone ? 4 : 6;
  const [code, setCode] = useState<string[]>(Array(codeLength).fill(''));
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [tentativesRestantes, setTentativesRestantes] = useState(3);
  const { verifier, demanderCode, isLoading, error, toasts, removeToast } = useAuth();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    setCanResend(true);
  }, [countdown]);

  useEffect(() => {
    if (!email && !phone) {
      router.replace('/admin/onboarding/compte');
    }
  }, [email, phone, router]);

  const handleSubmit = async (codeToSubmit?: string) => {
    const finalCode = codeToSubmit || code.join('');
    if (finalCode.length !== codeLength) return;

    const verificationData = email
      ? { email, code: finalCode }
      : { phone, code: finalCode };

    const success = await verifier(verificationData);
    if (!success) {
      const nouvellesTentatives = tentativesRestantes - 1;
      setTentativesRestantes(nouvellesTentatives);
      if (nouvellesTentatives <= 0) {
        setTimeout(() => router.push('/admin/login'), 3000);
      }
      setCode(Array(codeLength).fill(''));
      inputRefs.current[0]?.focus();
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue.length > 1) return;

    const newCode = [...code];
    newCode[index] = numericValue;
    setCode(newCode);

    if (numericValue && index < codeLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every((digit) => digit !== '') && numericValue) {
      handleSubmit(newCode.join(''));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/[^0-9]/g, '');
    if (pastedData.length === codeLength) {
      setCode(pastedData.split(''));
      inputRefs.current[codeLength - 1]?.focus();
      handleSubmit(pastedData);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    const success = await demanderCode(email ? { email } : { phone });
    if (success) {
      setCanResend(false);
      setCountdown(60);
      setTentativesRestantes(3);
      setCode(Array(codeLength).fill(''));
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vérification</h1>
        <p className="mt-1 text-gray-600">
          {email ? 'Code envoyé par email à' : 'Code envoyé par WhatsApp au'}{' '}
          <span className="font-semibold text-gray-900">{email || phone}</span>
        </p>
        <p className="mt-2 text-sm text-gray-500">
          L’email de confirmation est déjà envoyé à cette étape. Un message WhatsApp de bienvenue suivra à la fin.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <label className="mb-4 block text-center text-sm font-medium text-gray-700">
          Saisissez le code à {codeLength} chiffres
        </label>
        <div className="flex justify-center space-x-3">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              aria-label={`Chiffre ${index + 1} du code`}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="h-12 w-12 rounded-lg border-2 border-gray-300 text-center text-xl font-bold focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
              disabled={isLoading}
            />
          ))}
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-center text-sm text-red-600">{error}</p>
            {tentativesRestantes > 0 && (
              <p className="mt-1 text-center text-xs text-red-500">
                {tentativesRestantes} tentative(s) restante(s)
              </p>
            )}
          </div>
        )}

        <div className="mt-6 text-center">
          {canResend ? (
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isLoading}
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-black disabled:opacity-50"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Renvoyer le code
            </button>
          ) : (
            <p className="text-sm text-gray-500">Renvoyer le code dans {countdown}s</p>
          )}
        </div>
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};
