'use client';

import { useEffect, useState } from 'react';
import { X, ArrowLeft, ArrowRight, Check, Upload, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { ProductCategory } from '@/lib/constants/product-categories';

interface ServiceProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  category: ProductCategory | null;
  onBack: () => void;
  onSave: (productData: any) => void;
  categories?: Array<{ id: number; nom: string; slug: string }>;
  boutiqueId?: number;
  boutiqueSlug?: string;
  productToEdit?: any;
}

interface ServiceFormData {
  nom: string;
  description: string;
  categorie_id: number;
  statut: 'actif' | 'inactif' | 'brouillon';
  images: string[];
  prix: number;
  prix_promo?: number;
  duree: string;
  lieu: string;
  inclus: string;
  politique_annulation: string;
  sur_devis: boolean;
  unit_label: string;
  dispo_label: string;
}

const SECTIONS = [
  { id: 1, label: 'Infos' },
  { id: 2, label: 'Images' },
  { id: 3, label: 'Prestation' },
];

export function ServiceProductForm({
  isOpen,
  onClose,
  category,
  onBack,
  onSave,
  categories = [],
  boutiqueSlug,
  productToEdit,
}: ServiceProductFormProps) {
  const [currentSection, setCurrentSection] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState<ServiceFormData>({
    nom: '',
    description: '',
    categorie_id: 0,
    statut: 'actif',
    images: [],
    prix: 0,
    duree: '',
    lieu: '',
    inclus: '',
    politique_annulation: '',
    sur_devis: false,
    unit_label: 'séance',
    dispo_label: 'Sur rendez-vous',
  });

  useEffect(() => {
    if (!isOpen) return;

    if (productToEdit) {
      const meta = productToEdit.meta || productToEdit.variants?.meta || {};
      setFormData({
        nom: productToEdit.nom || '',
        description: productToEdit.description || '',
        categorie_id: productToEdit.categorie_id || 0,
        statut: productToEdit.statut || 'actif',
        images: productToEdit.images || [],
        prix: Number(productToEdit.prix) || 0,
        prix_promo: productToEdit.prix_promo ? Number(productToEdit.prix_promo) : undefined,
        duree: meta.duree || '',
        lieu: meta.lieu || '',
        inclus: Array.isArray(meta.inclus) ? meta.inclus.join('\n') : meta.inclus || '',
        politique_annulation: meta.politique_annulation || '',
        sur_devis: Boolean(meta.sur_devis),
        unit_label: meta.unit_label || 'séance',
        dispo_label: meta.dispo_label || 'Sur rendez-vous',
      });
      setUploadedImageUrls(productToEdit.images || []);
      setCurrentSection(1);
      return;
    }

    setCurrentSection(1);
    setErrors({});
    setUploadedImageUrls([]);
    const serviceCat = categories.find(
      (c) => c.slug === 'services' || c.nom.toLowerCase().includes('service')
    );
    setFormData({
      nom: '',
      description: '',
      categorie_id: serviceCat?.id || 0,
      statut: 'actif',
      images: [],
      prix: 0,
      duree: '',
      lieu: '',
      inclus: '',
      politique_annulation: '',
      sur_devis: false,
      unit_label: 'séance',
      dispo_label: 'Sur rendez-vous',
    });
  }, [isOpen, categories, productToEdit]);

  if (!isOpen || !category) return null;

  const validateSection = (section: number): boolean => {
    const next: Record<string, string> = {};
    if (section === 1) {
      if (!formData.nom.trim()) next.nom = 'Le nom est requis';
      if (!formData.categorie_id) next.categorie_id = 'La catégorie est requise';
      if (!formData.sur_devis && formData.prix <= 0) next.prix = 'Prix > 0 requis (ou cochez sur devis)';
    }
    if (section === 2 && formData.images.length === 0) {
      next.images = 'Au moins une image est requise';
    }
    if (section === 3) {
      if (!formData.duree.trim()) next.duree = 'La durée est requise';
      if (!formData.lieu.trim()) next.lieu = 'Le lieu est requis';
    }
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
          const file = new File([blob], `service-${index}.jpg`, { type: blob.type });
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
    setCurrentSection((s) => Math.min(3, s + 1));
  };

  const handleSave = async () => {
    if (!validateSection(3)) return;
    let images = uploadedImageUrls.length ? uploadedImageUrls : formData.images;
    if (images.some((i) => i.startsWith('data:'))) {
      try {
        images = await uploadImages();
      } catch {
        setErrors({ images: "Échec de l'upload des images" });
        return;
      }
    }
    const inclus = formData.inclus
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    onSave({
      id: productToEdit?.id,
      category: 'service',
      nom: formData.nom.trim(),
      description: formData.description.trim(),
      categorie_id: formData.categorie_id,
      statut: formData.statut,
      images,
      image_principale: images[0],
      prix: formData.sur_devis ? 0 : formData.prix,
      prix_promo: formData.sur_devis ? undefined : formData.prix_promo,
      meta: {
        duree: formData.duree.trim(),
        lieu: formData.lieu.trim(),
        inclus,
        politique_annulation: formData.politique_annulation.trim() || undefined,
        sur_devis: formData.sur_devis,
        unit_label: formData.unit_label.trim() || 'séance',
        dispo_label: formData.dispo_label.trim() || 'Sur rendez-vous',
      },
      variants: [],
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
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black';

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
                {productToEdit ? 'Modifier le service' : 'Nouveau service'}
              </h2>
              <p className="text-xs text-gray-500">Étape {currentSection} / 3 — {SECTIONS[currentSection - 1].label}</p>
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
          {currentSection === 1 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Nom du service *</label>
                <input
                  className={inputClass}
                  value={formData.nom}
                  onChange={(e) => setFormData((p) => ({ ...p, nom: e.target.value }))}
                  placeholder="Coupe + Barbe Signature"
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
                <label className="mb-1 block text-sm font-medium">Catégorie *</label>
                <select
                  className={inputClass}
                  value={formData.categorie_id || ''}
                  onChange={(e) => setFormData((p) => ({ ...p, categorie_id: Number(e.target.value) }))}
                >
                  <option value="">Sélectionner</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  ))}
                </select>
                {errors.categorie_id && <p className="mt-1 text-xs text-red-600">{errors.categorie_id}</p>}
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.sur_devis}
                  onChange={(e) => setFormData((p) => ({ ...p, sur_devis: e.target.checked }))}
                />
                Sur devis (pas de prix fixe — contact WhatsApp)
              </label>
              {!formData.sur_devis && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Prix *</label>
                    <input
                      type="number"
                      className={inputClass}
                      value={formData.prix || ''}
                      onChange={(e) => setFormData((p) => ({ ...p, prix: Number(e.target.value) || 0 }))}
                    />
                    {errors.prix && <p className="mt-1 text-xs text-red-600">{errors.prix}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Prix promo</label>
                    <input
                      type="number"
                      className={inputClass}
                      value={formData.prix_promo ?? ''}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          prix_promo: e.target.value ? Number(e.target.value) : undefined,
                        }))
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {currentSection === 2 && (
            <div className="space-y-4">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-8 hover:border-gray-500">
                <Upload className="mb-2 h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-600">Ajouter des images</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
              </label>
              {errors.images && <p className="text-xs text-red-600">{errors.images}</p>}
              <div className="grid grid-cols-3 gap-3">
                {formData.images.map((img, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
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
          )}

          {currentSection === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Durée *</label>
                  <input
                    className={inputClass}
                    value={formData.duree}
                    onChange={(e) => setFormData((p) => ({ ...p, duree: e.target.value }))}
                    placeholder="1 h 30"
                  />
                  {errors.duree && <p className="mt-1 text-xs text-red-600">{errors.duree}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Lieu *</label>
                  <input
                    className={inputClass}
                    value={formData.lieu}
                    onChange={(e) => setFormData((p) => ({ ...p, lieu: e.target.value }))}
                    placeholder="En boutique · PK8"
                  />
                  {errors.lieu && <p className="mt-1 text-xs text-red-600">{errors.lieu}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Libellé unité</label>
                  <input
                    className={inputClass}
                    value={formData.unit_label}
                    onChange={(e) => setFormData((p) => ({ ...p, unit_label: e.target.value }))}
                    placeholder="séance"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Disponibilité</label>
                  <input
                    className={inputClass}
                    value={formData.dispo_label}
                    onChange={(e) => setFormData((p) => ({ ...p, dispo_label: e.target.value }))}
                    placeholder="Sur rendez-vous"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Inclus (une ligne = un point)</label>
                <textarea
                  className={inputClass}
                  rows={4}
                  value={formData.inclus}
                  onChange={(e) => setFormData((p) => ({ ...p, inclus: e.target.value }))}
                  placeholder={'Consultation\nCoupe\nFinition'}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Politique d’annulation</label>
                <textarea
                  className={inputClass}
                  rows={2}
                  value={formData.politique_annulation}
                  onChange={(e) => setFormData((p) => ({ ...p, politique_annulation: e.target.value }))}
                  placeholder="Annulation gratuite jusqu’à 2 h avant"
                />
              </div>
            </div>
          )}
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
          {currentSection < 3 ? (
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
