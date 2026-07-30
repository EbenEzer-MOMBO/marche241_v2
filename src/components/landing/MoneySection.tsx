'use client';

export const MoneySection: React.FC = () => {
  return (
    <section id="money" className="py-14 lg:py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-10">
        <div className="max-w-[1160px] mx-auto flex flex-col lg:flex-row gap-10 lg:gap-14 items-center">
          <div className="flex-1 flex flex-col gap-3.5">
            <span className="font-mono text-xs tracking-wider uppercase text-[#508e27]">
              Votre argent
            </span>
            <h2 className="text-[26px] lg:text-[30px] font-bold tracking-tight text-gray-900">
              « Quand est-ce que je reçois mon argent ? »
            </h2>
            <p className="text-base leading-relaxed text-gray-600 max-w-[520px]">
              Les paiements sont centralisés pour sécuriser l&apos;acheteur, puis reversés sur
              votre compte Airtel Money ou Moov Money. Vous suivez chaque versement depuis votre
              tableau de bord.
            </p>
            <div className="flex flex-wrap gap-2.5 mt-1">
              {['Reversement suivi', 'Aucun frais caché', 'Fausses commandes annulables'].map(
                (label) => (
                  <span
                    key={label}
                    className="px-3.5 py-2 rounded-[9px] border border-gray-200 text-[13px] font-medium text-gray-700"
                  >
                    {label}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="w-full lg:w-[420px] shrink-0 flex flex-col gap-3 p-[26px] rounded-2xl bg-gray-50 border border-gray-200">
            <span className="text-[13px] text-gray-500">Moyens de paiement acceptés</span>
            <div className="flex gap-3">
              <div className="flex-1 h-14 rounded-[10px] bg-white border border-gray-200 flex items-center justify-center px-3 text-sm font-semibold text-gray-700">
                Airtel Money
              </div>
              <div className="flex-1 h-14 rounded-[10px] bg-white border border-gray-200 flex items-center justify-center px-3 text-sm font-semibold text-gray-700">
                Moov Money
              </div>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <div className="flex flex-col">
                <span className="text-[22px] font-bold text-gray-900">80%</span>
                <span className="text-xs text-gray-500">satisfaction client</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[22px] font-bold text-gray-900">24/7</span>
                <span className="text-xs text-gray-500">support disponible</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[22px] font-bold text-gray-900">0 FCFA</span>
                <span className="text-xs text-gray-500">à l&apos;inscription</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
