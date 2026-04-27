'use client';

import { useState, useEffect } from 'react';
import { X, ArrowLeft, ArrowRight, Check, Upload, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { ProductCategory, getCategoryInfo } from '@/lib/constants/product-categories';

interface GenericProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  category: ProductCategory | null;
  onBack: () => void;
  onSave: (productData: any) => void;
  categories?: any[];
  boutiqueId?: number;
  boutiqueSlug?: string;
  productToEdit?: any;
}

interface VariantAttribute {
  type: 'couleur' | 'taille' | 'contenance' | 'stockage' | 'ram' | 'modele-iphone' | 'modele-samsung' | 'materiau' | 'marque-ordinateur' | 'etat' | 'poids' | 'saveur' | 'personnalise';
  value: string;
  customType?: string;
}

interface GenericVariant {
  id: string;
  image?: string;
  attributes: VariantAttribute[];
  stock: number;
  prix: number;
  prix_promo?: number;
}

interface Customization {
  id: string;
  libelle: string;
  type: 'text' | 'number';
  prix_supplementaire?: number;
  obligatoire: boolean;
}

interface FormData {
  nom: string;
  description: string;
  categorie_id: number;
  statut: 'actif' | 'inactif' | 'brouillon';
  images: string[];
  variants: GenericVariant[];
  personnalisations: Customization[];
}

const SECTIONS = [
  { id: 1, label: 'Infos de base' },
  { id: 2, label: 'Images' },
  { id: 3, label: 'Variants' },
  { id: 4, label: 'Personnalisations' }
];

const ATTRIBUTE_TYPES = [
  { value: 'couleur', label: 'Couleur' },
  { value: 'taille', label: 'Taille' },
  { value: 'contenance', label: 'Contenance' },
  { value: 'stockage', label: 'Stockage' },
  { value: 'ram', label: 'Mémoire RAM' },
  { value: 'modele-iphone', label: 'Modèle iPhone' },
  { value: 'modele-samsung', label: 'Modèle Samsung' },
  { value: 'materiau', label: 'Matériau' },
  { value: 'marque-ordinateur', label: 'Marque Ordinateur' },
  { value: 'etat', label: 'État' },
  { value: 'poids', label: 'Poids (kg)' },
  { value: 'saveur', label: 'Saveur' },
  { value: 'personnalise', label: 'Attribut personnalisé' }
];

const COULEURS_PRESETS = [
  'Noir',
  'Blanc',
  'Gris',
  'Gris sidéral',
  'Gris anthracite',
  'Bleu',
  'Bleu ciel',
  'Bleu marine',
  'Bleu nuit',
  'Rouge',
  'Rouge carmin',
  'Vert',
  'Vert olive',
  'Jaune',
  'Rose',
  'Rose gold',
  'Marron',
  'Beige',
  'Violet',
  'Orange',
  'Argent',
  'Or',
  'Bronze',
  'Noir/Blanc',
  'Blanc/Noir',
  'Noir/Rouge',
  'Bleu/Blanc',
  'Vert/Blanc',
  'Gris/Noir'
];

const TAILLES_PRESETS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'];

const CONTENANCE_PRESETS = ['5ml', '10ml', '20ml', '50ml', '100ml', '200ml', '250ml', '500ml', '1L', '2L', '5L'];

const STOCKAGE_PRESETS = [
  '2GB',
  '4GB',
  '8GB',
  '16GB',
  '32GB',
  '64GB',
  '128GB',
  '256GB',
  '512GB',
  '1TB',
  '2TB'
];

const RAM_PRESETS = [
  '2GB',
  '3GB',
  '4GB',
  '6GB',
  '8GB',
  '12GB',
  '16GB',
  '18GB',
  '24GB',
  '32GB'
];

const IPHONE_MODELS_PRESETS = [
  'iPhone 7',
  'iPhone 7 Plus',
  'iPhone 8',
  'iPhone 8 Plus',
  'iPhone X',
  'iPhone XR',
  'iPhone XS',
  'iPhone XS Max',
  'iPhone 11',
  'iPhone 11 Pro',
  'iPhone 11 Pro Max',
  'iPhone 12',
  'iPhone 12 Mini',
  'iPhone 12 Pro',
  'iPhone 12 Pro Max',
  'iPhone 13',
  'iPhone 13 Mini',
  'iPhone 13 Pro',
  'iPhone 13 Pro Max',
  'iPhone 14',
  'iPhone 14 Plus',
  'iPhone 14 Pro',
  'iPhone 14 Pro Max',
  'iPhone 15',
  'iPhone 15 Plus',
  'iPhone 15 Pro',
  'iPhone 15 Pro Max',
  'iPhone 16',
  'iPhone 16 Plus',
  'iPhone 16 Pro',
  'iPhone 16 Pro Max'
];

const SAMSUNG_MODELS_PRESETS = [
  'Galaxy S20',
  'Galaxy S20+',
  'Galaxy S20 Ultra',
  'Galaxy S21',
  'Galaxy S21+',
  'Galaxy S21 Ultra',
  'Galaxy S22',
  'Galaxy S22+',
  'Galaxy S22 Ultra',
  'Galaxy S23',
  'Galaxy S23+',
  'Galaxy S23 Ultra',
  'Galaxy S24',
  'Galaxy S24+',
  'Galaxy S24 Ultra',
  'Galaxy A14',
  'Galaxy A24',
  'Galaxy A34',
  'Galaxy A54',
  'Galaxy Z Fold 4',
  'Galaxy Z Fold 5',
  'Galaxy Z Flip 4',
  'Galaxy Z Flip 5'
];

const MATERIAU_PRESETS = [
  'Coton',
  'Polyester',
  'Lin',
  'Laine',
  'Soie',
  'Cuir',
  'Cuir synthétique',
  'Daim',
  'Nylon',
  'Caoutchouc',
  'Plastique',
  'Métal',
  'Aluminium',
  'Acier inoxydable',
  'Titane',
  'Verre',
  'Bois',
  'Bambou',
  'Silicone',
  'Céramique',
  'Coton/Polyester',
  'Cuir/Tissu'
];

const MARQUE_ORDINATEUR_PRESETS = [
  'Apple',
  'Dell',
  'HP',
  'Lenovo',
  'Asus',
  'Acer',
  'MSI',
  'Razer',
  'Microsoft',
  'Samsung',
  'Huawei',
  'LG',
  'Toshiba',
  'Sony',
  'Alienware',
  'Gigabyte',
  'Framework',
  'System76'
];

const ETAT_PRESETS = [
  'Neuf',
  'Neuf avec emballage',
  'Neuf sans emballage',
  'Occasion - Comme neuf',
  'Occasion - Très bon état',
  'Occasion - Bon état',
  'Occasion - État correct',
  'Reconditionné',
  'Reconditionné - Grade A',
  'Reconditionné - Grade B',
  'Reconditionné - Grade C'
];

const POIDS_PRESETS = [
  '0.1kg',
  '0.2kg',
  '0.3kg',
  '0.5kg',
  '0.75kg',
  '1kg',
  '1.5kg',
  '2kg',
  '3kg',
  '5kg',
  '10kg',
  '15kg',
  '20kg',
  '25kg',
  '30kg',
  '50kg'
];

const SAVEUR_PRESETS = [
  // Fruits
  'Pomme',
  'Banane',
  'Fraise',
  'Framboise',
  'Myrtille',
  'Cerise',
  'Orange',
  'Citron',
  'Citron vert',
  'Pamplemousse',
  'Mangue',
  'Ananas',
  'Pastèque',
  'Melon',
  'Pêche',
  'Abricot',
  'Poire',
  'Raisin',
  'Kiwi',
  'Fruit de la passion',
  'Litchi',
  'Noix de coco',
  'Papaye',
  'Grenade',
  'Cassis',
  'Fruits rouges',
  'Fruits des bois',
  'Fruits tropicaux',
  // Chocolat & Café
  'Chocolat',
  'Chocolat noir',
  'Chocolat au lait',
  'Chocolat blanc',
  'Café',
  'Moka',
  'Cappuccino',
  'Caramel',
  'Caramel beurre salé',
  'Noisette',
  'Praliné',
  'Amande',
  'Pistache',
  // Vanille & Crème
  'Vanille',
  'Vanille de Madagascar',
  'Crème',
  'Crème brûlée',
  'Yaourt',
  'Lait',
  'Beurre',
  // Menthe & Herbes
  'Menthe',
  'Menthe poivrée',
  'Menthe chocolat',
  'Basilic',
  'Lavande',
  'Thym',
  // Épices & Gourmandises
  'Cannelle',
  'Gingembre',
  'Cardamome',
  'Anis',
  'Réglisse',
  'Spéculoos',
  'Cookie',
  'Biscuit',
  'Tarte aux pommes',
  'Cheesecake',
  'Tiramisu',
  // Thé & Infusions
  'Thé vert',
  'Thé noir',
  'Earl Grey',
  'Jasmin',
  'Matcha',
  'Chai',
  'Rooibos',
  // Nature & Neutre
  'Nature',
  'Sans saveur',
  'Original',
  // Salé
  'Salé',
  'Fromage',
  'Bacon',
  'BBQ',
  'Poulet',
  'Tomate',
  'Oignon',
  'Ail',
  // Sucré & Bonbons
  'Bubble gum',
  'Barbe à papa',
  'Marshmallow',
  'Bonbon acidulé',
  'Cola',
  'Soda',
  // Combinaisons
  'Fraise-Banane',
  'Citron-Menthe',
  'Orange-Mangue',
  'Chocolat-Noisette',
  'Vanille-Caramel',
  'Fruits exotiques',
  'Multifruits'
];

export function GenericProductForm({
  isOpen,
  onClose,
  category,
  onBack,
  onSave,
  categories = [],
  boutiqueId,
  boutiqueSlug,
  productToEdit
}: GenericProductFormProps) {
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    nom: '',
    description: '',
    categorie_id: 0,
    statut: 'actif',
    images: [],
    variants: [],
    personnalisations: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && productToEdit) {
      console.log('📝 Chargement des données pour édition:', productToEdit);
      
      setFormData({
        nom: productToEdit.nom || '',
        description: productToEdit.description || '',
        categorie_id: productToEdit.categorie_id || 0,
        statut: productToEdit.statut || 'actif',
        images: productToEdit.images || [],
        variants: productToEdit.variants || [],
        personnalisations: productToEdit.personnalisations || []
      });

      if (productToEdit.images && productToEdit.images.length > 0) {
        setUploadedImageUrls(productToEdit.images);
      }
      
      setIsDirty(false);
    }
  }, [isOpen, productToEdit]);

  const isFormFilled = () => {
    return formData.nom.trim() !== '' || 
           formData.description.trim() !== '' ||
           formData.images.length > 0 ||
           formData.variants.length > 0 ||
           formData.personnalisations.length > 0;
  };

  useEffect(() => {
    if (isOpen && isDirty && isFormFilled() && !productToEdit) {
      localStorage.setItem('generic_product_draft', JSON.stringify(formData));
    }
  }, [formData, isOpen, isDirty, productToEdit]);

  useEffect(() => {
    if (isOpen && !productToEdit) {
      const draft = localStorage.getItem('generic_product_draft');
      if (draft && !isDirty) {
        const shouldLoad = confirm('Un brouillon a été trouvé. Voulez-vous le charger ?');
        if (shouldLoad) {
          try {
            const draftData = JSON.parse(draft);
            setFormData(draftData);
            setIsDirty(true);
          } catch (error) {
            console.error('Erreur lors du chargement du brouillon:', error);
          }
        } else {
          localStorage.removeItem('generic_product_draft');
        }
      }
    }
  }, [isOpen, productToEdit]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentSection(1);
      setFormData({
        nom: '',
        description: '',
        categorie_id: 0,
        statut: 'actif',
        images: [],
        variants: [],
        personnalisations: []
      });
      setErrors({});
      setIsDirty(false);
      setUploadedImageUrls([]);
    } else if (isOpen && !productToEdit) {
      setCurrentSection(1);
      setFormData({
        nom: '',
        description: '',
        categorie_id: 0,
        statut: 'actif',
        images: [],
        variants: [],
        personnalisations: []
      });
      setErrors({});
      setUploadedImageUrls([]);
      
      if (categories.length > 0 && formData.categorie_id === 0) {
        setFormData(prev => ({ ...prev, categorie_id: categories[0].id }));
      }
    }
  }, [isOpen, categories, productToEdit]);

  if (!isOpen || !category) return null;

  const categoryInfo = getCategoryInfo(category);

  const validateSection = (section: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (section) {
      case 1:
        if (!formData.nom.trim()) {
          newErrors.nom = 'Le nom du produit est requis';
        }
        if (!formData.categorie_id) {
          newErrors.categorie_id = 'La catégorie est requise';
        }
        break;
      
      case 2:
        if (formData.images.length === 0) {
          newErrors.images = 'Au moins une image est requise';
        }
        break;
      
      case 3:
        if (formData.variants.length === 0) {
          newErrors.variants = 'Au moins un variant est requis';
        } else {
          formData.variants.forEach((variant, index) => {
            if (variant.attributes.length === 0) {
              newErrors[`variant_${index}_attributes`] = 'Au moins un attribut est requis';
            }
            if (variant.stock < 0) {
              newErrors[`variant_${index}_stock`] = 'Le stock ne peut pas être négatif';
            }
            if (!variant.prix || variant.prix <= 0) {
              newErrors[`variant_${index}_prix`] = 'Le prix est requis';
            }
            if (variant.prix_promo && variant.prix_promo >= variant.prix) {
              newErrors[`variant_${index}_prix_promo`] = 'Le prix promo doit être inférieur au prix normal';
            }
          });
        }
        break;
      
      case 4:
        formData.personnalisations.forEach((custom, index) => {
          if (!custom.libelle.trim()) {
            newErrors[`custom_${index}_libelle`] = 'Le libellé est requis';
          }
        });
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (validateSection(currentSection)) {
      if (currentSection === 2) {
        try {
          await uploadImages();
        } catch (error) {
          return;
        }
      }
      
      if (currentSection < SECTIONS.length) {
        setCurrentSection(currentSection + 1);
      }
    }
  };

  const uploadImages = async () => {
    if (formData.images.length === 0 || uploadedImageUrls.length > 0) {
      return;
    }

    const allImagesAreUrls = formData.images.every(img => 
      img.startsWith('http://') || img.startsWith('https://')
    );
    
    if (allImagesAreUrls) {
      console.log('✅ Images déjà uploadées (URLs)');
      setUploadedImageUrls(formData.images);
      return;
    }

    if (!boutiqueSlug) {
      showError('Informations de la boutique manquantes');
      throw new Error('Slug de la boutique manquant');
    }

    setIsUploadingImages(true);
    try {
      const { uploadImage } = await import('@/lib/services/upload');

      const uploadPromises = formData.images.map(async (base64Image) => {
        const blob = await fetch(base64Image).then(r => r.blob());
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        const file = new File([blob], `product-${timestamp}-${random}.jpg`, { type: 'image/jpeg' });
        
        const result = await uploadImage(file, boutiqueSlug, 'produits');
        return result.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setUploadedImageUrls(uploadedUrls);
      
      setFormData(prev => ({
        ...prev,
        images: uploadedUrls
      }));
      
      console.log('✅ Images uploadées avec succès:', uploadedUrls);
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload des images:', error);
      showError('Erreur lors de l\'upload des images');
      throw error;
    } finally {
      setIsUploadingImages(false);
    }
  };

  const showError = (message: string) => {
    alert(message);
  };

  const handlePrevious = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSubmit = () => {
    let allValid = true;
    for (let i = 1; i <= 4; i++) {
      if (!validateSection(i)) {
        allValid = false;
        setCurrentSection(i);
        break;
      }
    }

    if (allValid) {
      const productData = {
        ...formData,
        category: category,
        image_principale: formData.images[0] || undefined,
        ...(productToEdit?.id && { id: productToEdit.id })
      };
      localStorage.removeItem('generic_product_draft');
      onSave(productData);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, reader.result as string]
        }));
        setIsDirty(true);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setUploadedImageUrls(prev => prev.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...formData.images];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < newImages.length) {
      [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
      setFormData(prev => ({ ...prev, images: newImages }));
      
      if (uploadedImageUrls.length > 0) {
        const newUploadedUrls = [...uploadedImageUrls];
        [newUploadedUrls[index], newUploadedUrls[newIndex]] = [newUploadedUrls[newIndex], newUploadedUrls[index]];
        setUploadedImageUrls(newUploadedUrls);
      }
      setIsDirty(true);
    }
  };

  const addVariant = () => {
    const newVariant: GenericVariant = {
      id: `variant-${Date.now()}`,
      attributes: [],
      stock: 0,
      prix: 0,
      prix_promo: undefined
    };
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, newVariant]
    }));
    setIsDirty(true);
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
    setIsDirty(true);
  };

  const updateVariant = (index: number, field: keyof GenericVariant, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) => 
        i === index ? { ...v, [field]: value } : v
      )
    }));
    setIsDirty(true);
  };

  const addAttribute = (variantIndex: number) => {
    const variant = formData.variants[variantIndex];
    const newAttribute: VariantAttribute = {
      type: 'couleur',
      value: '',
      customType: ''
    };
    updateVariant(variantIndex, 'attributes', [...variant.attributes, newAttribute]);
  };

  const removeAttribute = (variantIndex: number, attributeIndex: number) => {
    const variant = formData.variants[variantIndex];
    updateVariant(variantIndex, 'attributes', 
      variant.attributes.filter((_, i) => i !== attributeIndex)
    );
  };

  const updateAttribute = (variantIndex: number, attributeIndex: number, field: keyof VariantAttribute | 'customType', value: string) => {
    const variant = formData.variants[variantIndex];
    const newAttributes = variant.attributes.map((attr, i) => 
      i === attributeIndex ? { ...attr, [field]: value } : attr
    );
    updateVariant(variantIndex, 'attributes', newAttributes);
  };

  const getPresetsForType = (type: string) => {
    switch (type) {
      case 'couleur': return COULEURS_PRESETS;
      case 'taille': return TAILLES_PRESETS;
      case 'contenance': return CONTENANCE_PRESETS;
      case 'stockage': return STOCKAGE_PRESETS;
      case 'ram': return RAM_PRESETS;
      case 'modele-iphone': return IPHONE_MODELS_PRESETS;
      case 'modele-samsung': return SAMSUNG_MODELS_PRESETS;
      case 'materiau': return MATERIAU_PRESETS;
      case 'marque-ordinateur': return MARQUE_ORDINATEUR_PRESETS;
      case 'etat': return ETAT_PRESETS;
      case 'poids': return POIDS_PRESETS;
      case 'saveur': return SAVEUR_PRESETS;
      default: return [];
    }
  };

  const addCustomization = () => {
    const newCustom: Customization = {
      id: `custom-${Date.now()}`,
      libelle: '',
      type: 'text',
      prix_supplementaire: 0,
      obligatoire: false
    };
    setFormData(prev => ({
      ...prev,
      personnalisations: [...prev.personnalisations, newCustom]
    }));
    setIsDirty(true);
  };

  const removeCustomization = (index: number) => {
    setFormData(prev => ({
      ...prev,
      personnalisations: prev.personnalisations.filter((_, i) => i !== index)
    }));
    setIsDirty(true);
  };

  const updateCustomization = (index: number, field: keyof Customization, value: any) => {
    setFormData(prev => ({
      ...prev,
      personnalisations: prev.personnalisations.map((c, i) => 
        i === index ? { ...c, [field]: value } : c
      )
    }));
    setIsDirty(true);
  };

  const renderSection1 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className={`${categoryInfo.bgColor} ${categoryInfo.color} p-2 rounded-lg`}>
            {categoryInfo.icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Informations de base</h3>
            <p className="text-sm text-gray-600 mt-1">
              Renseignez les informations principales de votre produit
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nom du produit *
        </label>
        <input
          type="text"
          value={formData.nom}
          onChange={(e) => handleInputChange('nom', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ex: iPhone 15 Pro"
        />
        {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Décrivez les caractéristiques et avantages de votre produit..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Catégorie *
        </label>
        <select
          value={formData.categorie_id}
          onChange={(e) => handleInputChange('categorie_id', parseInt(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value={0}>Sélectionner une catégorie</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.nom}</option>
          ))}
        </select>
        {errors.categorie_id && <p className="mt-1 text-sm text-red-600">{errors.categorie_id}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Statut
        </label>
        <select
          value={formData.statut}
          onChange={(e) => handleInputChange('statut', e.target.value as 'actif' | 'inactif' | 'brouillon')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="actif">Actif</option>
          <option value="inactif">Inactif</option>
        </select>
      </div>
    </div>
  );

  const renderSection2 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <ImageIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900">Images du produit</h3>
            <p className="text-sm text-gray-600 mt-1">
              Ajoutez des photos de votre produit (la première sera l&apos;image principale)
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Images * {isUploadingImages && <span className="text-blue-600">(Upload en cours...)</span>}
        </label>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          {formData.images.map((image, index) => (
            <div key={index} className="relative group aspect-square">
              <Image
                src={image}
                alt={`Image ${index + 1}`}
                fill
                className="object-cover rounded-lg"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity rounded-lg">
                <div className="absolute bottom-2 right-2 flex gap-1">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, 'up')}
                      className="p-1.5 bg-white/90 hover:bg-white rounded shadow-lg transition-colors"
                    >
                      <ArrowLeft className="h-3 w-3 text-gray-700" />
                    </button>
                  )}
                  {index < formData.images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, 'down')}
                      className="p-1.5 bg-white/90 hover:bg-white rounded shadow-lg transition-colors"
                    >
                      <ArrowRight className="h-3 w-3 text-gray-700" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="p-1.5 bg-red-500/90 hover:bg-red-600 rounded shadow-lg transition-colors"
                  >
                    <Trash2 className="h-3 w-3 text-white" />
                  </button>
                </div>
              </div>
              
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  Principale
                </div>
              )}
            </div>
          ))}
        </div>

        <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
          <div className="flex flex-col items-center">
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">Cliquer pour ajouter des images</span>
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
        {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}
      </div>
    </div>
  );

  const renderSection3 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Plus className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900">Variants du produit</h3>
            <p className="text-sm text-gray-600 mt-1">
              Définissez les différentes variantes avec leurs attributs personnalisés (couleur, taille, contenance, etc.)
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {formData.variants.map((variant, variantIndex) => {
          const usedImages = formData.variants
            .filter((_, i) => i !== variantIndex)
            .map(v => v.image)
            .filter(Boolean);

          return (
            <div key={variant.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-900">Variant {variantIndex + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeVariant(variantIndex)}
                  className="text-red-600 hover:text-red-700 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Sélection d'image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image du variant
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {uploadedImageUrls.map((url, imgIndex) => {
                    const isSelected = variant.image === url;
                    const isUsed = usedImages.includes(url);
                    
                    return (
                      <button
                        key={imgIndex}
                        type="button"
                        onClick={() => !isUsed && updateVariant(variantIndex, 'image', url)}
                        disabled={isUsed}
                        className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
                          isSelected 
                            ? 'ring-4 ring-blue-600 ring-offset-2' 
                            : isUsed 
                            ? 'opacity-40 cursor-not-allowed' 
                            : 'hover:ring-2 hover:ring-blue-300'
                        }`}
                      >
                        <Image
                          src={url}
                          alt={`Image ${imgIndex + 1}`}
                          fill
                          className="object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                            <Check className="h-6 w-6 text-white drop-shadow-lg" strokeWidth={3} />
                          </div>
                        )}
                        {isUsed && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <X className="h-6 w-6 text-white" strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Attributs personnalisables */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Attributs *
                  </label>
                  <button
                    type="button"
                    onClick={() => addAttribute(variantIndex)}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter un attribut
                  </button>
                </div>

                {variant.attributes.length === 0 && (
                  <p className="text-sm text-gray-500 italic">Aucun attribut. Cliquez sur &quot;Ajouter un attribut&quot; pour commencer.</p>
                )}

                <div className="space-y-3">
                  {variant.attributes.map((attr, attrIndex) => {
                    const presets = getPresetsForType(attr.type);
                    const allowsCustomInput = attr.type === 'poids';
                    const isPersonnalise = attr.type === 'personnalise';
                    
                    return (
                      <div key={attrIndex} className="space-y-2">
                        <div className="flex gap-2 items-start">
                          <select
                            value={attr.type}
                            onChange={(e) => updateAttribute(variantIndex, attrIndex, 'type', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-40"
                          >
                            {ATTRIBUTE_TYPES.map(type => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </select>

                          {isPersonnalise ? (
                            <div className="flex-1 flex gap-2">
                              <input
                                type="text"
                                value={attr.customType || ''}
                                onChange={(e) => updateAttribute(variantIndex, attrIndex, 'customType', e.target.value)}
                                placeholder="Nom de l'attribut (ex: Capacité, Format...)"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                              <input
                                type="text"
                                value={attr.value}
                                onChange={(e) => updateAttribute(variantIndex, attrIndex, 'value', e.target.value)}
                                placeholder="Valeur"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          ) : presets.length > 0 && !allowsCustomInput ? (
                            <select
                              value={attr.value}
                              onChange={(e) => updateAttribute(variantIndex, attrIndex, 'value', e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Sélectionner...</option>
                              {presets.map(preset => (
                                <option key={preset} value={preset}>{preset}</option>
                              ))}
                            </select>
                          ) : presets.length > 0 && allowsCustomInput ? (
                            <div className="flex-1 flex gap-2">
                              <select
                                value={attr.value}
                                onChange={(e) => {
                                  if (e.target.value !== 'custom') {
                                    updateAttribute(variantIndex, attrIndex, 'value', e.target.value);
                                  }
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Sélectionner...</option>
                                {presets.map(preset => (
                                  <option key={preset} value={preset}>{preset}</option>
                                ))}
                                <option value="custom">Poids personnalisé...</option>
                              </select>
                              <input
                                type="text"
                                value={attr.value && !presets.includes(attr.value) ? attr.value : ''}
                                onChange={(e) => updateAttribute(variantIndex, attrIndex, 'value', e.target.value)}
                                placeholder="Ex: 2.5kg"
                                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={attr.value}
                              onChange={(e) => updateAttribute(variantIndex, attrIndex, 'value', e.target.value)}
                              placeholder={`${attr.type}...`}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          )}

                          <button
                            type="button"
                            onClick={() => removeAttribute(variantIndex, attrIndex)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        {isPersonnalise && (
                          <p className="text-xs text-gray-500 ml-44">
                            Exemple: Nom = "Capacité", Valeur = "500ml" ou Nom = "Format", Valeur = "A4"
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
                {errors[`variant_${variantIndex}_attributes`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`variant_${variantIndex}_attributes`]}</p>
                )}
              </div>

              {/* Stock et prix */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={variant.stock}
                    onChange={(e) => updateVariant(variantIndex, 'stock', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="10"
                  />
                  {errors[`variant_${variantIndex}_stock`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`variant_${variantIndex}_stock`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix (FCFA) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={variant.prix || ''}
                    onChange={(e) => updateVariant(variantIndex, 'prix', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="5000"
                  />
                  {errors[`variant_${variantIndex}_prix`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`variant_${variantIndex}_prix`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix promo (FCFA)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={variant.prix_promo || ''}
                    onChange={(e) => updateVariant(variantIndex, 'prix_promo', parseFloat(e.target.value) || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="4000"
                  />
                  {errors[`variant_${variantIndex}_prix_promo`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`variant_${variantIndex}_prix_promo`]}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bouton Ajouter variant en fin de liste */}
      <button
        type="button"
        onClick={addVariant}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium"
      >
        <Plus className="h-5 w-5" />
        Ajouter un autre variant
      </button>
      {errors.variants && <p className="text-sm text-red-600">{errors.variants}</p>}
    </div>
  );

  const renderSection4 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Plus className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900">Personnalisations (optionnel)</h3>
            <p className="text-sm text-gray-600 mt-1">
              Proposez des options de personnalisation à vos clients
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {formData.personnalisations.map((custom, index) => (
          <div key={custom.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-900">Personnalisation {index + 1}</h4>
              <button
                type="button"
                onClick={() => removeCustomization(index)}
                className="text-red-600 hover:text-red-700 p-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Libellé *
                </label>
                <input
                  type="text"
                  value={custom.libelle}
                  onChange={(e) => updateCustomization(index, 'libelle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Gravure du nom"
                />
                {errors[`custom_${index}_libelle`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`custom_${index}_libelle`]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={custom.type}
                  onChange={(e) => updateCustomization(index, 'type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="text">Texte</option>
                  <option value="number">Nombre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix supplémentaire (FCFA)
                </label>
                <input
                  type="number"
                  min="0"
                  value={custom.prix_supplementaire || ''}
                  onChange={(e) => updateCustomization(index, 'prix_supplementaire', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={custom.obligatoire}
                  onChange={(e) => updateCustomization(index, 'obligatoire', e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Personnalisation obligatoire
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addCustomization}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="h-5 w-5" />
        <span className="hidden sm:inline">Ajouter une personnalisation</span>
        <span className="sm:hidden">Ajouter</span>
      </button>
    </div>
  );

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 1: return renderSection1();
      case 2: return renderSection2();
      case 3: return renderSection3();
      case 4: return renderSection4();
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className={`${categoryInfo.bgColor} ${categoryInfo.color} px-6 py-4 flex justify-between items-center rounded-t-xl`}>
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {productToEdit ? 'Modifier' : 'Ajouter'} un produit
              </h2>
              <p className="text-sm opacity-90 mt-1">
                Étape {currentSection} sur {SECTIONS.length}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {SECTIONS.map((section, index) => (
              <div key={section.id} className="flex items-center">
                <div className={`flex items-center ${index > 0 ? 'ml-2' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    currentSection === section.id
                      ? `${categoryInfo.bgColor} ${categoryInfo.color}`
                      : currentSection > section.id
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {section.id}
                  </div>
                  <span className={`ml-2 text-sm font-medium hidden sm:inline ${
                    currentSection === section.id ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {section.label}
                  </span>
                </div>
                {index < SECTIONS.length - 1 && (
                  <div className="w-8 sm:w-16 h-0.5 bg-gray-200 mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {renderCurrentSection()}
        </div>

        <div className={`px-6 py-4 border-t border-gray-200 flex justify-between items-center ${categoryInfo.bgColor} bg-opacity-10`}>
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentSection === 1}
            className={`px-4 sm:px-6 py-2.5 border-2 rounded-lg font-medium flex items-center gap-2 ${
              currentSection === 1
                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                : `border-current ${categoryInfo.color} hover:bg-white/50 transition-colors`
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Précédent</span>
            <span className="sm:hidden">Préc.</span>
          </button>

          {currentSection < SECTIONS.length ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={isUploadingImages}
              className={`px-4 sm:px-6 py-2.5 ${categoryInfo.bgColor} ${categoryInfo.color} border-2 border-current rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center gap-2 ${
                isUploadingImages ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span className="hidden sm:inline">Suivant</span>
              <span className="sm:hidden">Suiv.</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className={`px-4 sm:px-6 py-2.5 ${categoryInfo.bgColor} ${categoryInfo.color} border-2 border-current rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center gap-2`}
            >
              <Check className="h-4 w-4" />
              <span className="hidden sm:inline">{productToEdit ? 'Enregistrer les modifications' : 'Enregistrer le produit'}</span>
              <span className="sm:hidden">Enregistrer</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
