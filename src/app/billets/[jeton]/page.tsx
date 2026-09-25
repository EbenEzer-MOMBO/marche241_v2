'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import config from '@/lib/config';

export default function BilletsPage() {
  const params = useParams();
  const jeton = String(params.jeton || '');
  const pdfUrl = `${config.apiBaseUrl}/billets/${encodeURIComponent(jeton)}`;

  return (
    <main className="min-h-screen bg-[#e8e9e7] px-4 py-10">
      <div className="mx-auto w-full max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#508e27]">
          Marché 241
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[#111827]">Vos billets</h1>
        <p className="mt-2 text-sm leading-6 text-[#4b5563]">
          Chaque billet porte un numéro unique. Présentez-les à l’entrée.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href={pdfUrl}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[#508e27] px-5 text-[15px] font-semibold text-white"
            aria-label="Ouvrir le PDF des billets"
          >
            Ouvrir le PDF
          </a>
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-[#17181a] bg-white px-5 text-[15px] font-semibold text-[#17181a]"
          >
            Retour à l’accueil
          </Link>
        </div>
        <iframe
          title="Aperçu des billets"
          src={pdfUrl}
          className="mt-8 h-[720px] w-full rounded-2xl border border-[#e5e7eb] bg-white"
        />
      </div>
    </main>
  );
}
