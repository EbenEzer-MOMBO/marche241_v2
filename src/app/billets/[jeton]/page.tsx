'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import config from '@/lib/config';
import { TicketCard, type TicketCardEvenement } from '@/components/tickets/TicketCard';

interface BilletsPayload {
  evenement: TicketCardEvenement;
  billets: Array<{ type_billet: string; numero: number }>;
  jeton: string;
}

export default function BilletsPage() {
  const params = useParams();
  const jeton = String(params.jeton || '');
  const pdfUrl = `${config.apiBaseUrl}/billets/${encodeURIComponent(jeton)}`;
  const detailsUrl = `${pdfUrl}/details`;
  const [payload, setPayload] = useState<BilletsPayload | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!jeton) return;
    let cancelled = false;
    setHasError(false);
    fetch(detailsUrl)
      .then(async (response) => {
        if (!response.ok) throw new Error('not found');
        return response.json();
      })
      .then((json) => {
        if (cancelled) return;
        if (!json?.success || !json.data) throw new Error('invalid');
        setPayload(json.data);
      })
      .catch(() => {
        if (!cancelled) setHasError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [detailsUrl, jeton]);

  const billets = payload?.billets ?? [];

  return (
    <main className="min-h-screen bg-[#e8e9e7] px-4 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <p className="text-xs font-semibold tracking-[0.16em] text-[#508e27] uppercase">
          Marché 241
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[#111827]">Vos billets</h1>
        <p className="mt-2 text-sm leading-6 text-[#4b5563]">
          Chaque billet porte un numéro unique. Présentez le QR à l’entrée.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href={pdfUrl}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[#508e27] px-5 text-[15px] font-semibold text-white"
            aria-label="Télécharger le PDF des billets"
          >
            Télécharger le PDF
          </a>
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-[#17181a] bg-white px-5 text-[15px] font-semibold text-[#17181a]"
          >
            Retour à l’accueil
          </Link>
        </div>

        {hasError ? (
          <p className="mt-8 text-sm text-[#b42318]" role="alert">
            Billets introuvables. Vérifiez le lien reçu par WhatsApp ou e-mail.
          </p>
        ) : null}

        {!hasError && !payload ? (
          <div className="mt-8 flex gap-4 overflow-hidden" aria-busy="true" aria-label="Chargement des billets">
            <div className="h-[420px] w-[280px] shrink-0 animate-pulse rounded-[24px] bg-[#d1d5db]" />
            <div className="h-[420px] w-[280px] shrink-0 animate-pulse rounded-[24px] bg-[#d1d5db]" />
          </div>
        ) : null}

        {payload && billets.length > 0 ? (
          <div
            className="mt-8 flex gap-4 overflow-x-auto pb-2"
            role="list"
            aria-label={`${billets.length} billet${billets.length > 1 ? 's' : ''}`}
          >
            {billets.map((billet) => (
              <div key={`${billet.type_billet}-${billet.numero}`} role="listitem">
                <TicketCard
                  evenement={payload.evenement}
                  typeBillet={billet.type_billet}
                  numero={billet.numero}
                  jeton={payload.jeton}
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
