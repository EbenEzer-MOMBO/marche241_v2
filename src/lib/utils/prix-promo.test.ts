import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aPromotion, calculerPrixPourApi, prixBarreVariante, prixEffectif, promoValide } from './prix-promo';

test('promo valide : strictement entre 0 et le prix normal', () => {
  assert.equal(promoValide(30000, 15000), true);
  assert.equal(promoValide(30000, 30000), false);
  assert.equal(promoValide(30000, 40000), false);
  assert.equal(promoValide(30000, 0), false);
  assert.equal(promoValide(30000, undefined), false);
});

test('affichage : prix barré seulement si supérieur au prix payé', () => {
  assert.equal(aPromotion(15000, 30000), true);
  assert.equal(aPromotion(15000, 15000), false);
  assert.equal(aPromotion(15000, null), false);
  assert.equal(aPromotion(15000, 0), false);
});

test('variante : prix effectif et prix barré ignorent une promo invalide', () => {
  assert.equal(prixEffectif({ prix: 30000, prix_promo: 15000 }), 15000);
  assert.equal(prixBarreVariante({ prix: 30000, prix_promo: 15000 }), 30000);
  assert.equal(prixEffectif({ prix: 30000, prix_promo: 30000 }), 30000);
  assert.equal(prixBarreVariante({ prix: 30000, prix_promo: 40000 }), null);
  assert.equal(prixBarreVariante({ prix: 30000 }), null);
});

test('prix API : contrat unique prix normal + prix_promo', () => {
  assert.deepEqual(
    calculerPrixPourApi({ category: 'autres', variants: [{ prix: 30000, prix_promo: 15000 }] }),
    { prix: 30000, prix_promo: 15000 }
  );
  assert.deepEqual(
    calculerPrixPourApi({ category: 'autres', variants: [{ prix: 30000 }] }),
    { prix: 30000, prix_promo: null }
  );
});

test('prix API : la variante de référence est la moins chère en prix effectif (promo comprise)', () => {
  const r = calculerPrixPourApi({
    category: 'vetements',
    variants: [{ prix: 10000 }, { prix: 12000, prix_promo: 5000 }]
  });
  assert.deepEqual(r, { prix: 12000, prix_promo: 5000 });
});

test('prix API : billets d\'événement et service sur devis', () => {
  assert.deepEqual(
    calculerPrixPourApi({ category: 'evenement', variants: [{ prix: 5000 }, { prix: 8000, prix_promo: 3000 }] }),
    { prix: 8000, prix_promo: 3000 }
  );
  assert.deepEqual(calculerPrixPourApi({ category: 'service', prix: 20000, prix_promo: 15000 }), { prix: 20000, prix_promo: 15000 });
  assert.deepEqual(calculerPrixPourApi({ category: 'service', prix: 20000, sur_devis: true }), { prix: 0, prix_promo: null });
  assert.deepEqual(calculerPrixPourApi({ category: 'autres', variants: [] }), { prix: 0, prix_promo: null });
});
