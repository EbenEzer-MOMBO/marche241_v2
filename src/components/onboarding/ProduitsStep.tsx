'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getCategoriesParBoutique } from '@/lib/services/categories';
import { creerProduit, genererSlugProduit } from '@/lib/services/products';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import { markProduitsSkipped } from '@/lib/onboarding/storage';
import type { BoutiqueData } from '@/lib/services/auth';
import type { Categorie } from '@/lib/database-types';

const getStoredBoutique = (): BoutiqueData | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('admin_boutique');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BoutiqueData;
  } catch {
    return null;
  }
};

export const ProduitsStep = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [boutique, setBoutique] = useState<BoutiqueData | null>(null);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [nom, setNom] = useState('');
  const [prix, setPrix] = useState('');
  const [description, setDescription] = useState('');
  const [categorieId, setCategorieId] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const stored = getStoredBoutique();
    setBoutique(stored);
    if (!stored?.id) return;

    const loadCategories = async () => {
      try {
        const list = await getCategoriesParBoutique(stored.id);
        setCategories(list);
        if (list[0]) setCategorieId(list[0].id);
      } catch {
        setCategories([]);
      }
    };

    loadCategories();
  }, []);

  const handleSkip = () => {
    if (user?.id) markProduitsSkipped(user.id);
    router.push('/admin/onboarding/done');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boutique?.id) {
      showError('Boutique introuvable. Reprenez l’étape boutique.', 'Erreur');
      return;
    }

    const parsedPrix = Number(prix);
    if (!nom.trim() || Number.isNaN(parsedPrix) || parsedPrix < 0) {
      showError('Indiquez un nom et un prix valides.', 'Formulaire incomplet');
      return;
    }

    if (!categorieId) {
      showError('Choisissez une catégorie ou passez cette étape.', 'Catégorie manquante');
      return;
    }

    setIsLoading(true);
    try {
      await creerProduit({
        nom: nom.trim(),
        slug: genererSlugProduit(nom.trim()),
        description: description.trim() || undefined,
        prix: parsedPrix,
        en_stock: 1,
        boutique_id: boutique.id,
        categorie_id: Number(categorieId),
        statut: 'actif',
      });
      success('Produit ajouté', 'Vous pourrez en ajouter d’autres depuis votre espace.');
      router.push('/admin/onboarding/done');
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Impossible de créer le produit', 'Erreur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ajoutez vos premiers produits</h1>
        <p className="mt-1 text-gray-600">
          Un premier article suffit pour ouvrir la vitrine. Vous pourrez enrichir le catalogue plus tard.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="produit-nom" className="mb-2 block text-sm font-medium text-gray-700">
            Nom du produit *
          </label>
          <input
            id="produit-nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
            placeholder="Ex: Sac en raphia"
            className="block w-full rounded-lg border border-gray-300 px-3 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label htmlFor="produit-prix" className="mb-2 block text-sm font-medium text-gray-700">
            Prix (FCFA) *
          </label>
          <input
            id="produit-prix"
            type="number"
            min={0}
            value={prix}
            onChange={(e) => setPrix(e.target.value)}
            required
            placeholder="15000"
            className="block w-full rounded-lg border border-gray-300 px-3 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {categories.length > 0 && (
          <div>
            <label htmlFor="produit-categorie" className="mb-2 block text-sm font-medium text-gray-700">
              Catégorie
            </label>
            <select
              id="produit-categorie"
              value={categorieId}
              onChange={(e) => setCategorieId(Number(e.target.value))}
              className="block w-full rounded-lg border border-gray-300 px-3 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
            >
              {categories.map((categorie) => (
                <option key={categorie.id} value={categorie.id}>
                  {categorie.nom}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="produit-description" className="mb-2 block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="produit-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Quelques mots sur le produit..."
            className="block w-full resize-none rounded-lg border border-gray-300 px-3 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center rounded-lg bg-black px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {isLoading ? 'Ajout en cours...' : 'Ajouter et terminer'}
        </button>

        <button
          type="button"
          onClick={handleSkip}
          className="w-full rounded-lg px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        >
          Passer cette étape
        </button>
      </form>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};
