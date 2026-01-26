'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;

    setStatus('loading');

    // Simuler l'envoi
    setTimeout(() => {
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 3000);
    }, 1000);
  };

  return (
    <section className="py-16 bg-gradient-to-r from-green-600 to-green-700">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Texte */}
          <div className="flex-1 text-center lg:text-left">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Restez informé des nouveautés
            </h3>
            <p className="text-green-100 text-lg">
              Recevez nos conseils et astuces pour développer votre boutique
            </p>
          </div>

          {/* Formulaire */}
          <div className="flex-1 w-full max-w-md">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Entrez votre email"
                className="flex-1 px-6 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                required
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
              >
                {status === 'loading' ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : status === 'success' ? (
                  'Inscrit !'
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    <span className="hidden sm:inline">S'inscrire</span>
                  </>
                )}
              </button>
            </form>
            {status === 'success' && (
              <p className="mt-2 text-sm text-green-100">
                Merci ! Vous êtes maintenant inscrit à notre newsletter.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
