import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-8 py-8">
        <div className="border-t border-white/20 mt-4 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <p className="text-white/60 text-sm">
                © {new Date().getFullYear()} Marché241. Tous droits réservés.
              </p>
              <Link
                href="/politique-de-confidentialite"
                className="text-sm text-white/60 hover:text-white transition-colors underline-offset-2 hover:underline"
              >
                Politique de confidentialité
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                <Image
                  className="w-10 h-10 rounded-md"
                  src="/airtel_money.png"
                  alt="Airtel Money"
                  width={50}
                  height={50}
                />
                <Image
                  className="w-10 h-10 rounded-md"
                  src="/moov_money.png"
                  alt="Moov Money"
                  width={50}
                  height={50}
                />
                <Image
                  className="w-10 h-10 rounded-md"
                  src="/visa.png"
                  alt="Visa"
                  width={50}
                  height={50}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
