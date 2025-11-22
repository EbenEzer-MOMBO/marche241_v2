'use client';

import { useState, useRef } from 'react';
import PromotionalPoster from '@/components/PromotionalPoster';
import PromotionalPosterDark from '@/components/PromotionalPosterDark';

export default function PromoPosterPage() {
  const [scale, setScale] = useState(0.5);
  const [isExporting, setIsExporting] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const posterRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!posterRef.current) return;

    setIsExporting(true);
    try {
      // Dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      // Capturer l'affiche à l'échelle 1:1
      const canvas = await html2canvas(posterRef.current, {
        scale: 2, // Haute qualité
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: theme === 'light' ? '#ffffff' : '#111827',
        windowWidth: 1080,
        windowHeight: 1920,
        onclone: (clonedDoc) => {
          // Forcer les styles inline pour éviter les problèmes de parsing de couleurs
          const clonedElement = clonedDoc.querySelector('[data-poster]');
          if (clonedElement) {
            // Appliquer des styles compatibles
            clonedElement.setAttribute('style', 'width: 1080px; height: 1920px;');
          }
        }
      });

      // Convertir en blob et télécharger
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `marche241-affiche-${theme}-${Date.now()}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        }
        setIsExporting(false);
      }, 'image/png');
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors du téléchargement. Essayez la capture d\'écran manuelle (Win + Shift + S) en réglant le zoom à 100%.');
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Contrôles */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Affiche Promotionnelle Marché241
              </h1>
              <p className="text-gray-600">
                Format: 16:9 Portrait (1080x1920px) - Idéal pour stories Instagram/Facebook
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2">
                <button
                  onClick={() => setTheme('light')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    theme === 'light'
                      ? 'bg-white text-emerald-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  ☀️ Claire
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-900 text-emerald-400 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🌙 Sombre
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Zoom:</label>
                <input
                  type="range"
                  min="0.3"
                  max="1"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-32"
                />
                <span className="text-sm text-gray-600 w-12">{Math.round(scale * 100)}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownload}
                  disabled={isExporting}
                  className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? '⏳ Export en cours...' : '💾 Télécharger PNG'}
                </button>
                <button
                  onClick={() => {
                    alert('Méthode alternative:\n\n1. Réglez le zoom à 100%\n2. Appuyez sur Win + Shift + S\n3. Sélectionnez la zone de l\'affiche\n4. Enregistrez l\'image\n\nOu faites un clic droit > "Enregistrer l\'image sous..."');
                  }}
                  className="px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                  title="Méthode alternative"
                >
                  ℹ️
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Affiche */}
        <div className="flex justify-center">
          <div 
            ref={posterRef}
            data-poster
            className="shadow-2xl rounded-lg overflow-hidden"
            style={{ 
              transform: `scale(${scale})`,
              transformOrigin: 'top center'
            }}
          >
            {theme === 'light' ? <PromotionalPoster /> : <PromotionalPosterDark />}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-blue-900 mb-4">
            📝 Instructions pour télécharger l'affiche:
          </h2>
          <div className="space-y-2 text-blue-800">
            <p><strong>Méthode 1 (Capture d'écran):</strong></p>
            <ol className="list-decimal list-inside ml-4 space-y-1">
              <li>Ajustez le zoom à 100%</li>
              <li>Utilisez l'outil de capture d'écran de Windows (Win + Shift + S)</li>
              <li>Sélectionnez la zone de l'affiche</li>
              <li>Enregistrez l'image</li>
            </ol>
            
            <p className="mt-4"><strong>Méthode 2 (Clic droit):</strong></p>
            <ol className="list-decimal list-inside ml-4 space-y-1">
              <li>Faites un clic droit sur l'affiche</li>
              <li>Sélectionnez "Enregistrer l'image sous..."</li>
              <li>Choisissez l'emplacement et enregistrez</li>
            </ol>

            <p className="mt-4"><strong>Méthode 3 (Inspecteur):</strong></p>
            <ol className="list-decimal list-inside ml-4 space-y-1">
              <li>Ouvrez les outils de développement (F12)</li>
              <li>Utilisez l'outil de capture d'écran du navigateur</li>
              <li>Capturez l'élément complet</li>
            </ol>
          </div>
        </div>

        {/* Variantes suggérées */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            💡 Suggestions d'utilisation:
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-3xl mb-2">📱</div>
              <h3 className="font-bold text-gray-900 mb-2">Stories Instagram/Facebook</h3>
              <p className="text-sm text-gray-600">
                Format parfait pour vos stories sur les réseaux sociaux
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-3xl mb-2">🖨️</div>
              <h3 className="font-bold text-gray-900 mb-2">Impression A4</h3>
              <p className="text-sm text-gray-600">
                Imprimez et affichez dans votre commerce physique
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-3xl mb-2">💬</div>
              <h3 className="font-bold text-gray-900 mb-2">WhatsApp Business</h3>
              <p className="text-sm text-gray-600">
                Partagez avec vos contacts et groupes WhatsApp
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

