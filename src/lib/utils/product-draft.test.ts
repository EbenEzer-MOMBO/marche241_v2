import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sauvegarderBrouillonProduit } from './product-draft';

const store = new Map<string, string>();
const QUOTA = 1000;
(globalThis as unknown as { localStorage: Pick<Storage, 'setItem' | 'removeItem'> }).localStorage = {
  setItem(cle: string, valeur: string) {
    if (valeur.length > QUOTA) {
      const erreur = new Error('The quota has been exceeded.');
      erreur.name = 'QuotaExceededError';
      throw erreur;
    }
    store.set(cle, valeur);
  },
  removeItem(cle: string) {
    store.delete(cle);
  },
};

const base64 = 'data:image/jpeg;base64,' + 'A'.repeat(5000);

test('brouillon : les images base64 ne sont pas stockées, les URLs hébergées oui', () => {
  sauvegarderBrouillonProduit('brouillon', {
    nom: 'Robe',
    images: [base64, 'https://cdn.exemple/robe.jpg'],
    variants: [{ couleur: 'rouge', image: base64 }],
  });
  assert.deepEqual(JSON.parse(store.get('brouillon')!), {
    nom: 'Robe',
    images: ['https://cdn.exemple/robe.jpg'],
    variants: [{ couleur: 'rouge' }],
  });
});

test('brouillon : quota dépassé → pas d’exception, dernier brouillon conservé', () => {
  store.set('brouillon', '{"nom":"Robe"}');
  assert.doesNotThrow(() => sauvegarderBrouillonProduit('brouillon', { nom: 'x'.repeat(QUOTA), images: [] }));
  assert.equal(store.get('brouillon'), '{"nom":"Robe"}');
});
