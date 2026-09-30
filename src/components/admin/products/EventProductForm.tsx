'use client';

import { useEffect, useMemo, useState } from 'react';
import { X, ArrowLeft, ArrowRight, Check, Upload, Plus, Trash2, Lock, Ticket } from 'lucide-react';
import Image from 'next/image';
import { ProductCategory } from '@/lib/constants/product-categories';
import { FRAIS_SERVICE_POURCENTAGE, prixAvecFraisService } from '@/lib/constants/frais-service';

const formatFcfa = (montant: number) =>
  `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(montant)} FCFA`;

interface EventProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  category: ProductCategory | null;
  onBack: () => void;
  onSave: (productData: any) => void;
  categories?: Array<{ id: number; nom: string; slug: string }>;
  boutiqueId?: number;
  boutiqueSlug?: string;
  productToEdit?: any;
  /** 'inline' : formulaire complet sans modale ni étapes (page détail événement). */
  variant?: 'modal' | 'inline';
  isSaving?: boolean;
  /**
   * Billets déjà vendus par type (clé = nom du billet). Dès la première vente,
   * les infos clés et les billets vendus sont figés et leurs places ne peuvent qu'augmenter.
   */
  ventesParType?: Record<string, number>;
}

interface TicketVariant {
  id: string;
  nom: string;
  prix: number;
  prix_promo?: number;
  stock: number;
}

interface EventFormData {
  nom: string;
  description: string;
  categorie_id: number;
  statut: 'actif' | 'inactif' | 'brouillon';
  images: string[];
  date_debut: string;
  date_fin: string;
  lieu: string;
  adresse: string;
  ouverture_portes: string;
  non_remboursable: boolean;
  tickets: TicketVariant[];
}

const SECTIONS = [
  { id: 1, label: 'Infos' },
  { id: 2, label: 'Images' },
  { id: 3, label: 'Détails' },
  { id: 4, label: 'Billets' },
];

const newTicket = (): TicketVariant => ({
  id: `ticket-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  nom: 'Billet standard',
  prix: 0,
  stock: 10,
});

export function EventProductForm({
  isOpen,
  onClose,
  category,
  onBack,
  onSave,
  categories = [],
  boutiqueSlug,
  productToEdit,
  variant = 'modal',
  isSaving = false,
  ventesParType = {},
}: EventProductFormProps) {
  const isInline = variant === 'inline';
  const estVerrouille = Object.values(ventesParType).some((n) => n > 0);

  // Places restantes enregistrées par billet : plancher après la première vente.
  const stocksInitiaux = useMemo(() => {
    const tickets = productToEdit?.tickets || productToEdit?.variants?.variants || [];
    return Object.fromEntries(
      (Array.isArray(tickets) ? tickets : [])
        .filter((t: any) => t?.id)
        .map((t: any) => [String(t.id), Number(t.stock) || 0])
    ) as Record<string, number>;
  }, [productToEdit]);

  const vendusDuBillet = (ticket: TicketVariant) =>
    ticket.id in stocksInitiaux ? ventesParType[ticket.nom] || 0 : 0;
  const [currentSection, setCurrentSection] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState<EventFormData>({
    nom: '',
    description: '',
    categorie_id: 0,
    statut: 'brouillon',
    images: [],
    date_debut: '',
    date_fin: '',
    lieu: '',
    adresse: '',
    ouverture_portes: '',
    non_remboursable: true,
    tickets: [newTicket()],
  });

  useEffect(() => {
    if (!isOpen) return;

    if (productToEdit) {
      const meta = productToEdit.meta || productToEdit.variants?.meta || {};
      const tickets =
        productToEdit.tickets ||
        productToEdit.variants?.variants ||
        productToEdit.variants ||
        [];
      setFormData({
        nom: productToEdit.nom || '',
        description: productToEdit.description || '',
        categorie_id: productToEdit.categorie_id || 0,
        statut: productToEdit.statut || 'brouillon',
        images: productToEdit.images || [],
        date_debut: meta.date_debut ? String(meta.date_debut).slice(0, 16) : '',
        date_fin: meta.date_fin ? String(meta.date_fin).slice(0, 16) : '',
        lieu: meta.lieu || '',
        adresse: meta.adresse || '',
        ouverture_portes: meta.ouverture_portes || '',
        non_remboursable: meta.non_remboursable !== false,
        tickets: Array.isArray(tickets) && tickets.length > 0
          ? tickets.map((t: any) => ({
              id: t.id || newTicket().id,
              nom: t.nom || 'Billet',
              prix: Number(t.prix) || 0,
              prix_promo: t.prix_promo ? Number(t.prix_promo) : undefined,
              stock: Number(t.stock) || 0,
            }))
          : [newTicket()],
      });
      setUploadedImageUrls(productToEdit.images || []);
      setCurrentSection(1);
      return;
    }

    setCurrentSection(1);
    setErrors({});
    setUploadedImageUrls([]);
    const eventCat = categories.find(
      (c) =>
        c.slug === 'evenements' ||
        c.nom.toLowerCase().includes('événement') ||
        c.nom.toLowerCase().includes('evenement')
    );
    setFormData({
      nom: '',
      description: '',
      categorie_id: eventCat?.id || 0,
      statut: 'brouillon',
      images: [],
      date_debut: '',
      date_fin: '',
      lieu: '',
      adresse: '',
      ouverture_portes: '',
      non_remboursable: true,
      tickets: [newTicket()],
    });
  }, [isOpen, categories, productToEdit]);

  if (!isOpen || !category) return null;

  const collectSectionErrors = (section: number): Record<string, string> => {
    const next: Record<string, string> = {};
    if (section === 1) {
      if (!formData.nom.trim()) next.nom = 'Le nom est requis';
      if (!formData.categorie_id) {
        next.categorie_id = 'Catégorie « Événements » introuvable : contactez le support Marché 241';
      }
    }
    if (section === 2 && formData.images.length === 0) {
      next.images = 'Au moins une image est requise';
    }
    if (section === 3) {
      if (!formData.date_debut) next.date_debut = 'La date de début est requise';
      if (!formData.lieu.trim()) next.lieu = 'Le lieu est requis';
    }
    if (section === 4) {
      if (formData.tickets.length === 0) next.tickets = 'Ajoutez au moins un billet';
      formData.tickets.forEach((t, i) => {
        if (!t.nom.trim()) next[`ticket_${i}_nom`] = 'Nom requis';
        if (t.prix <= 0) next[`ticket_${i}_prix`] = 'Prix > 0 requis';
        if (t.stock < 0) next[`ticket_${i}_stock`] = 'Places invalides';
        const plancher = stocksInitiaux[t.id];
        if (vendusDuBillet(t) > 0 && plancher !== undefined && t.stock < plancher) {
          next[`ticket_${i}_stock`] = `Les places ne peuvent qu'augmenter (minimum ${plancher})`;
        }
      });
    }
    return next;
  };

  const validateSection = (section: number): boolean => {
    const next = collectSectionErrors(section);
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateAllSections = (): boolean => {
    const next = SECTIONS.reduce<Record<string, string>>(
      (acc, section) => ({ ...acc, ...collectSectionErrors(section.id) }),
      {}
    );
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const uploadImages = async () => {
    const needsUpload = formData.images.some((img) => img.startsWith('data:'));
    if (!needsUpload) {
      setUploadedImageUrls(formData.images);
      return formData.images;
    }
    if (!boutiqueSlug) throw new Error('Slug boutique manquant');
    setIsUploading(true);
    try {
      const { uploadImage } = await import('@/lib/services/upload');
      const urls = await Promise.all(
        formData.images.map(async (img, index) => {
          if (!img.startsWith('data:')) return img;
          const res = await fetch(img);
          const blob = await res.blob();
          const file = new File([blob], `event-${index}.jpg`, { type: blob.type });
          const result = await uploadImage(file, boutiqueSlug, 'produits');
          return result.url;
        })
      );
      setUploadedImageUrls(urls);
      setFormData((prev) => ({ ...prev, images: urls }));
      return urls;
    } finally {
      setIsUploading(false);
    }
  };

  const handleNext = async () => {
    if (!validateSection(currentSection)) return;
    if (currentSection === 2) {
      try {
        await uploadImages();
      } catch {
        setErrors({ images: "Échec de l'upload des images" });
        return;
      }
    }
    setCurrentSection((s) => Math.min(4, s + 1));
  };

  const handleSave = async () => {
    const isValid = isInline ? validateAllSections() : validateSection(4);
    if (!isValid) return;
    let images = uploadedImageUrls.length ? uploadedImageUrls : formData.images;
    if (images.some((i) => i.startsWith('data:'))) {
      try {
        images = await uploadImages();
      } catch {
        setErrors({ images: "Échec de l'upload des images" });
        return;
      }
    }
    onSave({
      id: productToEdit?.id,
      category: 'evenement',
      nom: formData.nom.trim(),
      description: formData.description.trim(),
      categorie_id: formData.categorie_id,
      statut: formData.statut,
      images,
      image_principale: images[0],
      meta: {
        date_debut: formData.date_debut,
        date_fin: formData.date_fin || undefined,
        lieu: formData.lieu.trim(),
        adresse: formData.adresse.trim() || undefined,
        ouverture_portes: formData.ouverture_portes.trim() || undefined,
        non_remboursable: formData.non_remboursable,
      },
      variants: formData.tickets,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, reader.result as string].slice(0, 8),
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500';

  const renderLabel = (texte: string, verrouille = false) => (
    <label className="mb-1 flex items-center gap-1 text-sm font-medium">
      {texte}
      {verrouille && <Lock className="h-3.5 w-3.5 text-gray-400" aria-label="Non modifiable" />}
    </label>
  );

  const renderInfosSection = () => (
    <div className="space-y-4">
      <div>
        {renderLabel('Nom de l’événement *', estVerrouille)}
        <input
          className={inputClass}
          disabled={estVerrouille}
          value={formData.nom}
          onChange={(e) => setFormData((p) => ({ ...p, nom: e.target.value }))}
          placeholder="Topboy Live Session #3"
        />
        {errors.nom && <p className="mt-1 text-xs text-red-600">{errors.nom}</p>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea
          className={inputClass}
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Catégorie</label>
        <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
          <Ticket className="h-4 w-4 text-gray-500" />
          {categories.find((c) => c.id === formData.categorie_id)?.nom || 'Événements'}
        </div>
        {errors.categorie_id && <p className="mt-1 text-xs text-red-600">{errors.categorie_id}</p>}
      </div>
    </div>
  );

  const renderImagesSection = () => (
    <div className="space-y-4">
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-8 hover:border-gray-500">
        <Upload className="mb-2 h-8 w-8 text-gray-400" />
        <span className="text-sm text-gray-600">Ajouter des images (affiche 3:2 recommandée)</span>
        <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
      </label>
      {errors.images && <p className="text-xs text-red-600">{errors.images}</p>}
      <div className="grid grid-cols-3 gap-3">
        {formData.images.map((img, i) => (
          <div key={i} className="relative aspect-[3/2] overflow-hidden rounded-lg bg-gray-100">
            <Image src={img} alt="" fill className="object-cover" />
            <button
              type="button"
              className="absolute right-1 top-1 rounded bg-black/70 p-1 text-white"
              onClick={() => setFormData((p) => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))}
              aria-label="Supprimer l’image"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDetailsSection = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          {renderLabel('Date de début *', estVerrouille)}
          <input
            type="datetime-local"
            className={inputClass}
            disabled={estVerrouille}
            value={formData.date_debut}
            onChange={(e) => setFormData((p) => ({ ...p, date_debut: e.target.value }))}
          />
          {errors.date_debut && <p className="mt-1 text-xs text-red-600">{errors.date_debut}</p>}
        </div>
        <div>
          {renderLabel('Date de fin', estVerrouille)}
          <input
            type="datetime-local"
            className={inputClass}
            disabled={estVerrouille}
            value={formData.date_fin}
            onChange={(e) => setFormData((p) => ({ ...p, date_fin: e.target.value }))}
          />
        </div>
      </div>
      <div>
        {renderLabel('Lieu *', estVerrouille)}
        <input
          className={inputClass}
          disabled={estVerrouille}
          value={formData.lieu}
          onChange={(e) => setFormData((p) => ({ ...p, lieu: e.target.value }))}
          placeholder="Institut Français, Libreville"
        />
        {errors.lieu && <p className="mt-1 text-xs text-red-600">{errors.lieu}</p>}
      </div>
      <div>
        {renderLabel('Adresse', estVerrouille)}
        <input
          className={inputClass}
          disabled={estVerrouille}
          value={formData.adresse}
          onChange={(e) => setFormData((p) => ({ ...p, adresse: e.target.value }))}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Ouverture des portes</label>
        <input
          className={inputClass}
          value={formData.ouverture_portes}
          onChange={(e) => setFormData((p) => ({ ...p, ouverture_portes: e.target.value }))}
          placeholder="19 h 30"
        />
      </div>
      <label className={`flex items-center gap-2 text-sm ${estVerrouille ? 'text-gray-500' : ''}`}>
        <input
          type="checkbox"
          disabled={estVerrouille}
          checked={formData.non_remboursable}
          onChange={(e) => setFormData((p) => ({ ...p, non_remboursable: e.target.checked }))}
        />
        Billet non remboursable
        {estVerrouille && <Lock className="h-3.5 w-3.5 text-gray-400" aria-label="Non modifiable" />}
      </label>
    </div>
  );

  const majBillet = (id: string, changement: Partial<TicketVariant>) =>
    setFormData((p) => ({
      ...p,
      tickets: p.tickets.map((t) => (t.id === id ? { ...t, ...changement } : t)),
    }));

  const renderTicketsSection = () => (
    <div className="space-y-4">
      {errors.tickets && <p className="text-xs text-red-600">{errors.tickets}</p>}
      {formData.tickets.map((ticket, index) => {
        const vendus = vendusDuBillet(ticket);
        const billetVerrouille = vendus > 0;
        const prixEffectif = (ticket.prix_promo ?? 0) > 0 ? ticket.prix_promo! : ticket.prix;
        const plancher = billetVerrouille ? stocksInitiaux[ticket.id] : undefined;

        return (
          <div key={ticket.id} className="rounded-xl border border-gray-200 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm font-medium">
                Billet {index + 1}
                {billetVerrouille && (
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                    {vendus} vendu{vendus > 1 ? 's' : ''}
                  </span>
                )}
              </span>
              {formData.tickets.length > 1 && !billetVerrouille && (
                <button
                  type="button"
                  className="text-red-500 hover:text-red-700"
                  onClick={() =>
                    setFormData((p) => ({
                      ...p,
                      tickets: p.tickets.filter((t) => t.id !== ticket.id),
                    }))
                  }
                  aria-label="Supprimer le billet"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-3">
                <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-600">
                  Nom du billet *{billetVerrouille && <Lock className="h-3 w-3 text-gray-400" />}
                </label>
                <input
                  className={inputClass}
                  disabled={billetVerrouille}
                  value={ticket.nom}
                  onChange={(e) => majBillet(ticket.id, { nom: e.target.value })}
                  placeholder="Nom du billet"
                />
                {errors[`ticket_${index}_nom`] && (
                  <p className="mt-1 text-xs text-red-600">{errors[`ticket_${index}_nom`]}</p>
                )}
              </div>
              <div>
                <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-600">
                  Prix (FCFA) *{billetVerrouille && <Lock className="h-3 w-3 text-gray-400" />}
                </label>
                <input
                  type="number"
                  className={inputClass}
                  disabled={billetVerrouille}
                  value={ticket.prix || ''}
                  onChange={(e) => majBillet(ticket.id, { prix: Number(e.target.value) || 0 })}
                  placeholder="Prix FCFA"
                />
                {errors[`ticket_${index}_prix`] && (
                  <p className="mt-1 text-xs text-red-600">{errors[`ticket_${index}_prix`]}</p>
                )}
              </div>
              <div>
                <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-600">
                  Prix promo (FCFA){billetVerrouille && <Lock className="h-3 w-3 text-gray-400" />}
                </label>
                <input
                  type="number"
                  className={inputClass}
                  disabled={billetVerrouille}
                  value={ticket.prix_promo ?? ''}
                  onChange={(e) =>
                    majBillet(ticket.id, { prix_promo: e.target.value ? Number(e.target.value) : undefined })
                  }
                  placeholder="Optionnel"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  {billetVerrouille ? 'Places restantes' : 'Places disponibles'}
                </label>
                <input
                  type="number"
                  min={plancher ?? 0}
                  className={inputClass}
                  value={ticket.stock}
                  onChange={(e) => majBillet(ticket.id, { stock: Number(e.target.value) || 0 })}
                  placeholder="Places"
                />
                {errors[`ticket_${index}_stock`] ? (
                  <p className="mt-1 text-xs text-red-600">{errors[`ticket_${index}_stock`]}</p>
                ) : (
                  plancher !== undefined && (
                    <p className="mt-1 text-xs text-gray-500">Vous pouvez seulement en ajouter</p>
                  )
                )}
              </div>
            </div>
            {prixEffectif > 0 && (
              <p className="mt-3 text-xs text-gray-500">
                Prix affiché : <span className="font-medium text-gray-700">{formatFcfa(prixAvecFraisService(prixEffectif))}</span>{' '}
                (frais de service {Math.round(FRAIS_SERVICE_POURCENTAGE * 100)} % inclus)
              </p>
            )}
          </div>
        );
      })}
      <button
        type="button"
        onClick={() => setFormData((p) => ({ ...p, tickets: [...p.tickets, newTicket()] }))}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50"
      >
        <Plus className="h-4 w-4" /> Ajouter un billet
      </button>
    </div>
  );

  if (isInline) {
    return (
      <div className="space-y-8">
        {estVerrouille && (
          <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
            <Lock className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>
              Des billets ont déjà été vendus : le nom, la date, le lieu et le prix des billets vendus ne sont plus
              modifiables. Vous pouvez toujours changer la description, les images, ajouter un type de billet ou
              ajouter des places.
            </p>
          </div>
        )}
        <section>
          <h3 className="mb-4 text-base font-semibold text-gray-900">Informations</h3>
          {renderInfosSection()}
        </section>
        <section className="border-t border-gray-100 pt-6">
          <h3 className="mb-4 text-base font-semibold text-gray-900">Images de l’événement</h3>
          {renderImagesSection()}
        </section>
        <section className="border-t border-gray-100 pt-6">
          <h3 className="mb-4 text-base font-semibold text-gray-900">Date et lieu</h3>
          {renderDetailsSection()}
        </section>
        <section className="border-t border-gray-100 pt-6">
          <h3 className="mb-4 text-base font-semibold text-gray-900">Billets</h3>
          {renderTicketsSection()}
        </section>
        <div className="flex justify-end border-t border-gray-100 pt-6">
          <button
            type="button"
            onClick={handleSave}
            disabled={isUploading || isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            {isUploading ? 'Upload des images…' : isSaving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <button type="button" onClick={onBack} className="rounded-lg p-2 hover:bg-gray-100" aria-label="Retour">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {productToEdit ? 'Modifier l’événement' : 'Nouvel événement'}
              </h2>
              <p className="text-xs text-gray-500">Étape {currentSection} / 4 — {SECTIONS[currentSection - 1].label}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-2 border-b border-gray-100 px-5 py-3">
          {SECTIONS.map((s) => (
            <div
              key={s.id}
              className={`h-1.5 flex-1 rounded-full ${s.id <= currentSection ? 'bg-black' : 'bg-gray-200'}`}
            />
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {currentSection === 1 && renderInfosSection()}
          {currentSection === 2 && renderImagesSection()}
          {currentSection === 3 && renderDetailsSection()}
          {currentSection === 4 && renderTicketsSection()}
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4">
          <button
            type="button"
            onClick={() => setCurrentSection((s) => Math.max(1, s - 1))}
            disabled={currentSection === 1}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 disabled:opacity-40"
          >
            Précédent
          </button>
          {currentSection < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={isUploading}
              className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {isUploading ? 'Upload…' : 'Suivant'} <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={isUploading}
              className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              <Check className="h-4 w-4" /> Enregistrer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
