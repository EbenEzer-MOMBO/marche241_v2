import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ecrireStockageLocal } from './stockage-local';

const store = new Map<string, string>();
let plein = false;
(globalThis as unknown as { localStorage: Pick<Storage, 'setItem'> }).localStorage = {
  setItem(cle: string, valeur: string) {
    if (plein) {
      const erreur = new Error('The quota has been exceeded.');
      erreur.name = 'QuotaExceededError';
      throw erreur;
    }
    store.set(cle, valeur);
  },
};

test('stockage local : écriture réussie → true', () => {
  plein = false;
  assert.equal(ecrireStockageLocal('admin_user', '{"id":1}'), true);
  assert.equal(store.get('admin_user'), '{"id":1}');
});

test('stockage local : quota dépassé → false, sans exception', () => {
  plein = true;
  assert.equal(ecrireStockageLocal('admin_boutique', '{"id":2}'), false);
  assert.equal(store.has('admin_boutique'), false);
});
