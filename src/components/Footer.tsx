import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-8 py-8">

        {/* Ligne de séparation */}
        <div className="border-t border-white/20 mt-4 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 text-sm">
              © 2025 Marché241. Tous droits réservés.
            </p>
            
            {/* Moyens de paiement */}
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-white/60 text-sm">Paiements acceptés:</span>
              <div className="flex space-x-2">
                <span className="text-lg">
                  <Image className="w-10 h-10 rounded-md" src="/airtel_money.png" alt="Airtel Money" width={50} height={50} />
                </span>
                <span className="text-lg">
                  <Image className="w-10 h-10 rounded-md" src="/moov_money.png" alt="Moov Money" width={50} height={50} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
