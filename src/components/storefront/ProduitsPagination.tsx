'use client';

import type { ChangeEvent } from 'react';

type ProduitsPaginationProps = {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

export const ProduitsPagination = ({
  currentPage,
  totalPages,
  totalProducts,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: ProduitsPaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  const startIndex = totalProducts === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalProducts);

  const handlePageSizeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onPageSizeChange(Number(e.target.value));
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 pt-6 mt-6 gap-4">
      <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <p className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">{startIndex}</span> –{' '}
          <span className="font-medium text-gray-900">{endIndex}</span> sur{' '}
          <span className="font-medium text-gray-900">{totalProducts}</span> produit
          {totalProducts > 1 ? 's' : ''}
        </p>

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <span className="sr-only">Nombre de produits par page</span>
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            aria-label="Nombre de produits par page"
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value={12}>12 / page</option>
            <option value={24}>24 / page</option>
            <option value={48}>48 / page</option>
          </select>
        </label>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            aria-label="Page précédente"
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Précédent
          </button>

          <div className="hidden sm:flex items-center gap-1">
            {currentPage > 2 && (
              <>
                <button
                  type="button"
                  onClick={() => onPageChange(1)}
                  aria-label="Aller à la page 1"
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  1
                </button>
                {currentPage > 3 && <span className="px-2 text-gray-400">…</span>}
              </>
            )}

            {currentPage > 1 && (
              <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                aria-label={`Aller à la page ${currentPage - 1}`}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {currentPage - 1}
              </button>
            )}

            <span
              className="px-3 py-2 text-sm font-medium text-white bg-primary border border-primary rounded-lg"
              aria-current="page"
              aria-label={`Page actuelle, page ${currentPage}`}
            >
              {currentPage}
            </span>

            {currentPage < totalPages && (
              <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                aria-label={`Aller à la page ${currentPage + 1}`}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {currentPage + 1}
              </button>
            )}

            {currentPage < totalPages - 1 && (
              <>
                {currentPage < totalPages - 2 && (
                  <span className="px-2 text-gray-400">…</span>
                )}
                <button
                  type="button"
                  onClick={() => onPageChange(totalPages)}
                  aria-label={`Aller à la page ${totalPages}`}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            aria-label="Page suivante"
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};
