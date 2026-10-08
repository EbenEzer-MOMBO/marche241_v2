'use client';

import { useEffect } from 'react';
import { enregistrerVue } from '@/lib/services/vues';

export function SuiviVue({
  typeEntite,
  entiteId
}: {
  typeEntite: 'boutique' | 'produit';
  entiteId: number;
}) {
  useEffect(() => {
    if (!entiteId) {
      return;
    }
    void enregistrerVue({ type_entite: typeEntite, entite_id: entiteId });
  }, [typeEntite, entiteId]);

  return null;
}
