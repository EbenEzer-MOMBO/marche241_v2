'use client';

import { useState } from 'react';

interface ProductDetailsAccordionProps {
  description?: string;
  shippingTitle?: string;
  shippingLines: string[];
  hideDescription?: boolean;
}

const DESCRIPTION_PREVIEW_MAX = 180;

export function ProductDetailsAccordion({
  description,
  shippingTitle = 'Livraison et retours',
  shippingLines,
  hideDescription = false,
}: ProductDetailsAccordionProps) {
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);

  const trimmed = description?.trim() || '';
  const isLong = trimmed.length > DESCRIPTION_PREVIEW_MAX;
  const visibleDescription =
    isLong && !descriptionExpanded
      ? `${trimmed.slice(0, DESCRIPTION_PREVIEW_MAX).trimEnd()}…`
      : trimmed;

  const themeColor = 'var(--color-shop-primary, var(--primary-color))';

  return (
    <div className="pt-5">
      {!hideDescription && trimmed && (
        <div className="border-t border-[#f0efec] py-3.5">
          <h2 className="mb-1.5 text-sm font-semibold text-[#17181a]">
            Description
          </h2>
          <p className="max-w-[420px] text-[13.5px] leading-[1.6] text-[#5f6369]">
            {visibleDescription}
            {isLong && (
              <button
                type="button"
                onClick={() => setDescriptionExpanded((prev) => !prev)}
                className="ml-1.5 font-medium focus:outline-none focus-visible:underline"
                style={{ color: themeColor }}
                aria-expanded={descriptionExpanded}
              >
                {descriptionExpanded ? 'Réduire' : 'Lire la suite'}
              </button>
            )}
          </p>
        </div>
      )}

      <div className="border-y border-[#f0efec]">
        <button
          type="button"
          onClick={() => setShippingOpen((prev) => !prev)}
          className="flex w-full items-center justify-between py-3.5 text-left focus:outline-none focus-visible:underline"
          aria-expanded={shippingOpen}
        >
          <span className="text-sm font-semibold text-[#17181a]">
            {shippingTitle}
          </span>
          <span
            className={`font-mono text-[13px] text-[#8b8f95] transition-transform ${
              shippingOpen ? 'rotate-180' : ''
            }`}
            aria-hidden
          >
            ⌄
          </span>
        </button>
        {shippingOpen && (
          <ul className="pb-3.5 space-y-1.5">
            {shippingLines.map((line) => (
              <li
                key={line}
                className="flex gap-2 text-[13px] leading-[1.55] text-[#5f6369]"
              >
                <span className="text-[#c0beb8]" aria-hidden>
                  —
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
