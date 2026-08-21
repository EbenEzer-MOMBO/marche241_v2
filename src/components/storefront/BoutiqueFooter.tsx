import Link from 'next/link';

export const BoutiqueFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#ececea] bg-[#fafaf8]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-4 font-mono text-[11.5px] text-[#8b8f95] sm:flex-row sm:px-8 sm:text-[12.5px]">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <span>© {year} Marché241</span>
          <Link
            href="/politique-de-confidentialite"
            className="hover:text-[#3c4045] focus:outline-none focus-visible:underline"
          >
            Confidentialité
          </Link>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1">
          <span>Moov Money</span>
          <span>Airtel Money</span>
          <span>Visa</span>
          <span className="text-[#c9c7c2]">|</span>
          <a
            href="https://wa.me/24100000000"
            className="hover:text-[#3c4045] focus:outline-none focus-visible:underline"
            aria-label="Contacter le support"
          >
            Support
          </a>
        </div>
      </div>
    </footer>
  );
};
