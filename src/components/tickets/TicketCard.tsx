'use client';

import { getProduitImageUrl } from '@/lib/services/produits';
import { formatTicketNumero, ticketQrPayload } from '@/lib/qr-payload';
import { TicketQr } from './TicketQr';

export interface TicketCardEvenement {
  nom: string;
  date?: string;
  lieu?: string;
  adresse?: string;
  image?: string;
}

interface TicketCardProps {
  evenement: TicketCardEvenement;
  typeBillet: string;
  numero: number;
  jeton: string;
}

export const TicketCard = ({ evenement, typeBillet, numero, jeton }: TicketCardProps) => {
  const lieu = [evenement.adresse, evenement.lieu].filter(Boolean).join(', ');
  const poster = evenement.image ? getProduitImageUrl(evenement.image) : '';
  const displayNumero = formatTicketNumero(numero);

  return (
    <article
      className="relative flex h-[420px] w-[280px] shrink-0 flex-col overflow-hidden rounded-[24px] bg-[#07111c] text-white"
      aria-label={`Billet ${displayNumero} — ${evenement.nom}`}
    >
      {poster ? (
        <img
          src={poster}
          alt=""
          className="absolute top-0 left-0 h-[210px] w-full object-cover object-[50%_30%]"
        />
      ) : (
        <div className="absolute top-0 left-0 h-[210px] w-full bg-[#111827]" />
      )}
      <div className="absolute top-0 left-0 h-[210px] w-full bg-[linear-gradient(180deg,rgba(7,17,28,.35)_0%,rgba(7,17,28,0)_30%,rgba(7,17,28,.6)_70%,#07111c_100%)]" />

      <div className="relative flex items-center justify-between px-3 pt-3">
        <div className="flex items-center rounded-full bg-white px-2 py-1">
          <img
            src="/Logo_vector_text-02.svg"
            alt="Marché241"
            className="h-[16px] w-auto"
          />
        </div>
        <span className="rounded-full border border-white/40 bg-black/25 px-2.5 py-1 text-[11px] font-semibold">
          {typeBillet}
        </span>
      </div>

      <div className="relative mt-auto flex flex-col gap-1 px-3.5 pb-2.5">
        <h2 className="text-[20px] leading-[1.05] font-extrabold tracking-[-0.025em]">
          {evenement.nom}
        </h2>
        {evenement.date ? (
          <p className="text-[13px] font-semibold">{evenement.date}</p>
        ) : null}
        {lieu ? <p className="text-[12px] text-[#c7d2dc]">{lieu}</p> : null}
      </div>

      <div className="relative mx-2 mb-2 flex items-center gap-3 rounded-2xl bg-white p-2.5 text-[#0a0e14]">
        <TicketQr payload={ticketQrPayload(jeton, numero)} size={112} />
        <div className="min-w-0">
          <p className="text-[9px] tracking-[0.14em] text-[#6b7280] uppercase">Billet n°</p>
          <p className="bg-[linear-gradient(90deg,#508e27,#74adaf)] bg-clip-text font-mono text-[28px] leading-none font-semibold text-transparent">
            {displayNumero}
          </p>
          <p className="mt-1 text-[10px] leading-snug text-[#6b7280]">
            Scannez à l’entrée.
          </p>
        </div>
      </div>
    </article>
  );
};
