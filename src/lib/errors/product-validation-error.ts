/**
 * Erreur de validation renvoyée par l'API produits (ex. POST /produits).
 * Voir schéma : success false, code VALIDATION_ERROR, message, errors[].
 */

export interface ProductValidationErrorItem {
  field: string;
  code: string;
  message: string;
  meta?: Record<string, unknown>;
}

export class ProductValidationError extends Error {
  readonly code: string;
  readonly errors?: ProductValidationErrorItem[];

  constructor(
    message: string,
    options?: { code?: string; errors?: ProductValidationErrorItem[] }
  ) {
    super(message);
    this.name = 'ProductValidationError';
    this.code = options?.code ?? 'VALIDATION_ERROR';
    this.errors = options?.errors;
  }
}

export const isProductValidationError = (e: unknown): e is ProductValidationError =>
  e instanceof ProductValidationError;
