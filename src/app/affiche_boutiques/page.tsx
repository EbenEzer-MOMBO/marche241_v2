'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, Store, ArrowRight, X } from 'lucide-react';
import { getAllBoutiquesActives } from '@/lib/services/boutiques';
import { Boutique } from '@/lib/database-types';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { BoutiqueCard } from '@/components/landing/BoutiqueCard';
import { AfficheBoutiquesSkeleton } from '@/components/landing/AfficheBoutiquesSkeleton';
import { InstallAppButton } from '@/components/InstallAppButton';
import Footer from '@/components/Footer';

const ITEMS_PER_PAGE = 12;

export default function MarchePage() {
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVille, setSelectedVille] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    const loadBoutiques = async () => {
      try {
        setLoading(true);
        const data = await getAllBoutiquesActives();

        const boutiquesAvecProduitsEtImage = data.filter(
          (boutique) =>
            boutique.nombre_produits &&
            boutique.nombre_produits > 0 &&
            (Boolean(boutique.banniere?.trim()) || Boolean(boutique.logo?.trim()))
        );

        const boutiquesTries = boutiquesAvecProduitsEtImage.sort(
          (a, b) => (b.nombre_vues || 0) - (a.nombre_vues || 0)
        );

        setBoutiques(boutiquesTries);
      } catch (err) {
        console.error('Erreur lors du chargement des boutiques:', err);
        setError('Impossible de charger les boutiques');
      } finally {
        setLoading(false);
      }
    };

    loadBoutiques();
  }, []);

  const villeFilters = useMemo(() => {
    const groups = new Map<string, { label: string; count: number; labelCounts: Map<string, number> }>();

    boutiques.forEach((boutique) => {
      const ville = boutique.ville?.trim();
      if (!ville) {
        return;
      }

      const key = ville.toLowerCase();
      const existing = groups.get(key);

      if (!existing) {
        groups.set(key, {
          label: ville,
          count: 1,
          labelCounts: new Map([[ville, 1]]),
        });
        return;
      }

      existing.count += 1;
      existing.labelCounts.set(ville, (existing.labelCounts.get(ville) || 0) + 1);

      let bestLabel = existing.label;
      let bestCount = existing.labelCounts.get(existing.label) || 0;
      existing.labelCounts.forEach((labelCount, label) => {
        if (labelCount > bestCount) {
          bestLabel = label;
          bestCount = labelCount;
        }
      });
      existing.label = bestLabel;
    });

    return Array.from(groups.values())
      .map(({ label, count }) => ({ label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'fr'));
  }, [boutiques]);

  const filteredBoutiques = useMemo(() => {
    let result = boutiques;

    if (selectedVille) {
      result = result.filter(
        (boutique) => boutique.ville?.trim().toLowerCase() === selectedVille.toLowerCase()
      );
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (boutique) =>
          boutique.nom.toLowerCase().includes(term) ||
          boutique.description?.toLowerCase().includes(term) ||
          boutique.adresse?.toLowerCase().includes(term) ||
          boutique.ville?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [boutiques, searchTerm, selectedVille]);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchTerm, selectedVille]);

  const visibleBoutiques = filteredBoutiques.slice(0, visibleCount);
  const remaining = filteredBoutiques.length - visibleCount;
  const productTotal = boutiques.reduce((sum, b) => sum + (b.nombre_produits || 0), 0);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  const insertVendorCardAt = Math.min(3, visibleBoutiques.length);

  return (
    <div className="min-h-screen bg-white">
      <LandingHeader activePage="boutiques" />

      <main className="pt-[68px]">
        <section className="bg-gray-50 border-b border-gray-200 px-4 lg:px-10 py-6 lg:py-[26px]">
          <div className="max-w-[1360px] mx-auto flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-[26px] lg:text-[30px] font-bold tracking-tight text-gray-900">
                {boutiques.length > 0 ? boutiques.length : '…'} boutiques, livrées près de chez vous
              </h1>
              <p className="text-[15px] text-gray-600">
                {productTotal > 0 ? `${productTotal}+ produits` : 'Catalogue local'} · Les meilleures affaires
              </p>
            </div>

            <div className="flex gap-2.5 w-full lg:w-[560px] shrink-0">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cosmétique, chaussures, épicerie, nom de boutique…"
                  className="w-full h-[50px] pl-11 pr-10 rounded-xl border border-gray-300 bg-white text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#74adaf] focus:border-[#74adaf]"
                  aria-label="Rechercher une boutique"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Effacer la recherche"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                type="button"
                className="hidden sm:flex items-center justify-center w-[120px] h-[50px] rounded-xl bg-gradient-to-r from-[#508e27] to-[#74adaf] text-white text-[15px] font-semibold shadow-[0_6px_16px_rgba(80,142,39,0.28)]"
                aria-label="Lancer la recherche"
              >
                Rechercher
              </button>
            </div>
          </div>
        </section>

        {!loading && !error && villeFilters.length > 0 && (
          <div className="border-b border-gray-200 bg-white px-4 lg:px-10 py-3.5">
            <div className="max-w-[1360px] mx-auto flex gap-2 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setSelectedVille(null)}
                className={`shrink-0 px-3.5 py-2 rounded-full text-[13px] transition-colors ${
                  selectedVille === null
                    ? 'bg-gray-900 text-white font-semibold'
                    : 'border border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                Toutes ({boutiques.length})
              </button>
              {villeFilters.map((filter) => {
                const isActive = selectedVille === filter.label;
                return (
                  <button
                    key={filter.label}
                    onClick={() => setSelectedVille(filter.label)}
                    className={`shrink-0 px-3.5 py-2 rounded-full text-[13px] transition-colors ${
                      isActive
                        ? 'bg-gray-900 text-white font-semibold'
                        : 'border border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {loading ? (
          <AfficheBoutiquesSkeleton count={8} />
        ) : (
          <div className="px-4 lg:px-10 py-7 lg:py-9">
            <div className="max-w-[1360px] mx-auto">
              {error ? (
                <div className="text-center py-20">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                    <Store className="h-10 w-10 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h3>
                  <p className="text-gray-600 text-lg">{error}</p>
                </div>
              ) : filteredBoutiques.length === 0 ? (
                <div className="text-center py-20">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                    <Store className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {searchTerm || selectedVille
                      ? 'Aucune boutique trouvée'
                      : 'Aucune boutique disponible'}
                  </h3>
                  <p className="text-gray-600 text-lg mb-6">
                    {searchTerm || selectedVille
                      ? 'Essayez avec d’autres filtres'
                      : 'Revenez plus tard'}
                  </p>
                  {(searchTerm || selectedVille) && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedVille(null);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-[#508e27] to-[#74adaf] text-white rounded-lg hover:opacity-90 transition-all font-medium"
                    >
                      Réinitialiser
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                    {visibleBoutiques.map((boutique, index) => (
                      <div key={boutique.id} className="contents">
                        {index === insertVendorCardAt && (
                          <Link
                            href="/admin/register"
                            className="flex flex-col justify-center gap-3 p-[22px] rounded-[14px] bg-gradient-to-br from-[#508e27] to-[#74adaf] min-h-[280px]"
                          >
                            <span className="text-[19px] font-bold leading-snug text-white">
                              Vous vendez aussi&nbsp;? Votre boutique ici en 5 min
                            </span>
                            <span className="text-[13px] leading-relaxed text-white/90">
                              Gratuit, sans engagement. Vous apparaissez dans cet annuaire dès
                              votre 1er produit.
                            </span>
                            <span className="mt-auto flex items-center justify-center h-11 rounded-[10px] bg-white text-sm font-bold text-[#3f7020]">
                              Créer ma boutique
                            </span>
                          </Link>
                        )}
                        <BoutiqueCard boutique={boutique} featured={index === 0} />
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col items-center gap-2.5 pt-8">
                    {remaining > 0 && (
                      <button
                        onClick={handleLoadMore}
                        className="flex items-center justify-center w-full max-w-[280px] h-[50px] rounded-xl border border-gray-900 text-[15px] font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                      >
                        Charger {Math.min(remaining, ITEMS_PER_PAGE)} boutique
                        {Math.min(remaining, ITEMS_PER_PAGE) > 1 ? 's' : ''} de plus
                      </button>
                    )}
                    <p className="text-[13px] text-gray-500">
                      {Math.min(visibleCount, filteredBoutiques.length)} sur{' '}
                      {filteredBoutiques.length} boutiques affichées
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {!loading && !error && (
          <section className="bg-gradient-to-br from-[#508e27] to-[#74adaf] px-4 lg:px-10 py-10">
            <div className="max-w-[1360px] mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex flex-col gap-2">
                <h2 className="text-[26px] lg:text-[30px] font-extrabold tracking-tight text-white">
                  Votre boutique dans cet annuaire dès ce soir
                </h2>
                <p className="text-base text-white/90">
                  {boutiques.length > 0 ? boutiques.length : 'Des'} commerçants reçoivent déjà
                  leurs commandes ici. Inscription gratuite.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <Link
                  href="/admin/register"
                  className="inline-flex items-center justify-center gap-2 px-7 py-[17px] rounded-xl bg-white text-[#3f7020] font-bold text-[17px] shadow-[0_12px_30px_rgba(0,0,0,0.2)] hover:bg-gray-50 transition-colors"
                >
                  Créer ma boutique
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/#how-it-works"
                  className="inline-flex items-center justify-center px-[22px] py-4 rounded-xl border border-white/55 text-white text-[15px] font-medium hover:bg-white/10 transition-colors"
                >
                  Comment ça marche
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
      <InstallAppButton />
    </div>
  );
}
