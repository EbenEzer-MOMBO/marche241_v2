import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ecrireStockageLocal, lireJsonStockageLocal } from './stockage-local';

const store = new Map<string, string>();
let plein = false;
(globalThis as unknown as { localStorage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> }).localStorage = {
  getItem(cle: string) {
    return store.get(cle) ?? null;
  },
  setItem(cle: string, valeur: string) {
    if (plein) {
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

test('stockage local : échec → ancienne valeur retirée, sauf conserverAncienne', () => {
  plein = false;
  ecrireStockageLocal('admin_boutique', '{"slug":"ancienne"}');
  ecrireStockageLocal('brouillon', '{"nom":"Robe"}');
  plein = true;
  ecrireStockageLocal('admin_boutique', '{"slug":"nouvelle"}');
  ecrireStockageLocal('brouillon', '{"nom":"Robe 2"}', { conserverAncienne: true });
  assert.equal(store.has('admin_boutique'), false);
  assert.equal(store.get('brouillon'), '{"nom":"Robe"}');
});

test('lecture JSON : valeur valide, absente ou corrompue', () => {
  store.set('admin_user', '{"id":1,"nom":"Awa"}');
  assert.deepEqual(lireJsonStockageLocal('admin_user'), { id: 1, nom: 'Awa' });
  assert.equal(lireJsonStockageLocal('cle_absente'), null);
  store.set('admin_user', '{"id":1,');
  assert.equal(lireJsonStockageLocal('admin_user'), null);
  assert.equal(store.has('admin_user'), false);
  for (const nonObjet of ['"abc"', '42', '[1,2]', 'null']) {
    store.set('admin_user', nonObjet);
    assert.equal(lireJsonStockageLocal('admin_user'), null, nonObjet);
    assert.equal(store.has('admin_user'), false);
  }
});
