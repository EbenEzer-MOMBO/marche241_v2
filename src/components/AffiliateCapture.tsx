'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { memoriserCodeAffilie } from '@/lib/services/affiliation';

/**
 * Capture le paramètre ?ref=CODE sur n'importe quelle page du site et le
 * mémorise ~1 mois, pour qu'un affilié n'ait besoin que de son code pour
 * rendre traçable n'importe quel lien Marché241 qu'il partage.
 */
function AffiliateCaptureInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('ref');
    if (code) {
      memoriserCodeAffilie(code);
    }
  }, [searchParams]);

  return null;
}

export default function AffiliateCapture() {
  return (
    <Suspense fallback={null}>
      <AffiliateCaptureInner />
    </Suspense>
  );
}
