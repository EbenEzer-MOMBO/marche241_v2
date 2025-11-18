'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { BoutiqueData, modifierBoutique, modifierVendeur } from '@/lib/services/auth';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import Sidebar from '@/components/admin/Sidebar';
import PhoneNumberInput from '@/components/ui/PhoneNumberInput';
import Image from 'next/image';
import { uploadImage } from '@/lib/services/upload';
import {
  User,
  Store,
  Shield,
  Menu,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  Save,
  Camera,
  Globe,
  Palette,
  Upload
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const params = useParams();
  const boutiqueName = params.boutique as string;

  const { user, verifierBoutique, updateUser } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();

  const [boutique, setBoutique] = useState<BoutiqueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profil' | 'boutique' | 'securite'>('profil');
  const [isSaving, setIsSaving] = useState(false);

  // États pour le profil vendeur
  const [profilData, setProfilData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    ville: ''
  });

  // États pour la boutique
  const [boutiqueData, setBoutiqueData] = useState({
    nom: '',
    slug: '',
    description: '',
    adresse: '',
    telephone: '',
    logo: '',
    couleur_primaire: '#000000',
    couleur_secondaire: '#ffffff'
  });

  // États pour la sécurité
  const [securiteData, setSecuriteData] = useState({
    ancien_mot_de_passe: '',
    nouveau_mot_de_passe: '',
    confirmer_mot_de_passe: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    ancien: false,
    nouveau: false,
    confirmer: false
  });

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadBoutiqueData = async () => {
      if (!user) {
        router.push('/admin/login');
        return;
      }

      try {
        const boutiqueData = await verifierBoutique();
        
        if (!boutiqueData) {
          router.push('/admin/boutique/create');
          return;
        }

        if (boutiqueName !== boutiqueData.slug) {
          router.replace(`/admin/${boutiqueData.slug}/settings`);
          return;
        }

        setBoutique(boutiqueData);

        // Initialiser les données du profil
        setProfilData({
          nom: user.nom || '',
          prenom: '',
          email: user.email || '',
          telephone: user.telephone || '',
          ville: user.ville || ''
        });

        // Initialiser les données de la boutique
        setBoutiqueData({
          nom: boutiqueData.nom || '',
          slug: boutiqueData.slug || '',
          description: boutiqueData.description || '',
          adresse: boutiqueData.adresse || '',
          telephone: boutiqueData.telephone || '',
          logo: boutiqueData.logo || '',
          couleur_primaire: boutiqueData.couleur_primaire || '#000000',
          couleur_secondaire: boutiqueData.couleur_secondaire || '#ffffff'
        });
      } catch (err) {
        console.error('Erreur lors du chargement de la boutique:', err);
        showError('Impossible de charger les données de la boutique');
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      loadBoutiqueData();
    }, 100);

    return () => clearTimeout(timer);
  }, [user, boutiqueName, router, verifierBoutique, showError]);

  const handleSaveProfil = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const response = await modifierVendeur(parseInt(user.id), {
        nom: profilData.nom,
        email: profilData.email,
        telephone: profilData.telephone,
        ville: profilData.ville
      });

      if (response.success && response.vendeur) {
        // Mettre à jour le localStorage avec les nouvelles données
        const currentUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
        const updatedUserData = {
          ...currentUser,
          nom: response.vendeur.nom,
          email: response.vendeur.email,
          telephone: response.vendeur.telephone,
          ville: response.vendeur.ville
        };
        localStorage.setItem('admin_user', JSON.stringify(updatedUserData));
        
        // Mettre à jour l'état global de l'utilisateur
        updateUser({
          nom: response.vendeur.nom,
          email: response.vendeur.email,
          telephone: response.vendeur.telephone,
          ville: response.vendeur.ville
        });
        
        success('Profil mis à jour avec succès');
      }
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du profil:', err);
      showError(err.message || 'Impossible de mettre à jour le profil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !boutique) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      showError('Veuillez sélectionner un fichier image');
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('La taille du fichier ne doit pas dépasser 5MB');
      return;
    }

    setIsUploadingLogo(true);
    try {
      const uploadedImage = await uploadImage(file, boutique.slug, 'logos');
      setBoutiqueData({ ...boutiqueData, logo: uploadedImage.url });
      success('Logo uploadé avec succès');
    } catch (err: any) {
      console.error('Erreur lors de l\'upload du logo:', err);
      showError(err.message || 'Erreur lors de l\'upload du logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSaveBoutique = async () => {
    if (!boutique) return;

    setIsSaving(true);
    try {
      const response = await modifierBoutique(boutique.id, {
        nom: boutiqueData.nom,
        slug: boutiqueData.slug,
        description: boutiqueData.description,
        logo: boutiqueData.logo,
        couleur_primaire: boutiqueData.couleur_primaire,
        couleur_secondaire: boutiqueData.couleur_secondaire,
        adresse: boutiqueData.adresse,
        telephone: boutiqueData.telephone
      });

      if (response.success && response.boutique) {
        setBoutique(response.boutique);
        success('Informations de la boutique mises à jour avec succès');
        
        // Si le slug a changé, rediriger vers la nouvelle URL
        if (response.boutique.slug !== boutiqueName) {
          router.replace(`/admin/${response.boutique.slug}/settings`);
        }
      }
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour de la boutique:', err);
      showError(err.message || 'Impossible de mettre à jour les informations de la boutique');
    } finally {
      setIsSaving(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black-600"></div>
      </div>
    );
  }

  if (!boutique) {
    return null;
  }

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      <div className="flex h-screen bg-gray-50">
        <Sidebar 
          boutique={boutique} 
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={() => setIsMobileMenuOpen(false)}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header mobile */}
          <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Paramètres</h1>
            <div className="w-10"></div>
          </div>

          <div className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              {/* En-tête */}
              <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Paramètres</h1>
                <p className="mt-2 text-sm sm:text-base text-gray-600">
                  Gérez vos informations personnelles et les paramètres de votre boutique
                </p>
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                  <nav className="flex -mb-px overflow-x-auto">
                    <button
                      onClick={() => setActiveTab('profil')}
                      className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === 'profil'
                          ? 'border-black-500 text-black-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <User className="h-5 w-5 mr-2" />
                      Profil vendeur
                    </button>
                    <button
                      onClick={() => setActiveTab('boutique')}
                      className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === 'boutique'
                          ? 'border-black-500 text-black-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Store className="h-5 w-5 mr-2" />
                      Boutique
                    </button>
                  </nav>
                </div>

                <div className="p-6">
                  {/* Section Profil Vendeur */}
                  {activeTab === 'profil' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
                        <p className="text-sm text-gray-600 mb-6">
                          Mettez à jour vos informations personnelles pour votre compte vendeur
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nom
                          </label>
                          <input
                            type="text"
                            value={profilData.nom}
                            onChange={(e) => setProfilData({ ...profilData, nom: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black-500 focus:border-transparent"
                            placeholder="Votre nom"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Mail className="h-4 w-4 inline mr-2" />
                            Email
                          </label>
                          <input
                            type="email"
                            value={profilData.email}
                            onChange={(e) => setProfilData({ ...profilData, email: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black-500 focus:border-transparent"
                            placeholder="votre@email.com"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Phone className="h-4 w-4 inline mr-2" />
                            Téléphone
                          </label>
                          <PhoneNumberInput
                            value={profilData.telephone || ''}
                            onChange={(value) => setProfilData({ ...profilData, telephone: value })}
                            placeholder="6XXXXXXX"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ville
                          </label>
                          <input
                            type="text"
                            value={profilData.ville}
                            onChange={(e) => setProfilData({ ...profilData, ville: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black-500 focus:border-transparent"
                            placeholder="Votre ville"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-gray-200">
                        <button
                          onClick={handleSaveProfil}
                          disabled={isSaving}
                          className="flex items-center px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-black-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {isSaving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Enregistrement...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Enregistrer les modifications
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Section Boutique */}
                  {activeTab === 'boutique' && (
                    <div className="space-y-8">
                      {/* Logo Section */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo de la boutique</h3>
                        <div className="flex flex-col items-center space-y-4">
                          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100">
                            {isUploadingLogo && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                              </div>
                            )}
                            {boutiqueData.logo ? (
                              <Image
                                src={boutiqueData.logo}
                                alt="Logo de la boutique"
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Store className="h-16 w-16 text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-center space-y-3">
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleLogoFileChange}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploadingLogo}
                              className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {isUploadingLogo ? 'Upload en cours...' : 'Choisir un fichier'}
                            </button>
                            <p className="text-xs text-gray-500">
                              Format: JPG, PNG, SVG (max 5MB)
                            </p>
                          </div>

                        </div>
                      </div>

                      {/* Informations générales */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nom de la boutique
                            </label>
                            <input
                              type="text"
                              value={boutiqueData.nom}
                              onChange={(e) => setBoutiqueData({ ...boutiqueData, nom: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black-500 focus:border-transparent"
                              placeholder="Nom de votre boutique"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Slug (URL)
                            </label>
                            <div className="flex">
                              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                marche241.com/
                              </span>
                              <input
                                type="text"
                                value={boutiqueData.slug}
                                onChange={(e) => setBoutiqueData({ ...boutiqueData, slug: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-black-500 focus:border-transparent"
                                placeholder="ma-boutique"
                                readOnly
                              />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              L&apos;URL unique de votre boutique (lettres minuscules, chiffres et tirets uniquement)
                            </p>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Description
                            </label>
                            <textarea
                              value={boutiqueData.description}
                              onChange={(e) => setBoutiqueData({ ...boutiqueData, description: e.target.value })}
                              rows={4}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black-500 focus:border-transparent"
                              placeholder="Décrivez votre boutique..."
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <MapPin className="h-4 w-4 inline mr-2" />
                              Adresse
                            </label>
                            <input
                              type="text"
                              value={boutiqueData.adresse}
                              onChange={(e) => setBoutiqueData({ ...boutiqueData, adresse: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black-500 focus:border-transparent"
                              placeholder="Adresse de la boutique"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <Phone className="h-4 w-4 inline mr-2" />
                              Téléphone
                            </label>
                            <PhoneNumberInput
                              value={boutiqueData.telephone || ''}
                              onChange={(value) => setBoutiqueData({ ...boutiqueData, telephone: value })}
                              placeholder="6XXXXXXX"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Apparence Section */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          <Palette className="h-5 w-5 inline mr-2" />
                          Apparence de la boutique
                        </h3>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Couleur primaire
                              </label>
                              <div className="flex items-center space-x-3">
                                <input
                                  type="color"
                                  value={boutiqueData.couleur_primaire}
                                  onChange={(e) => setBoutiqueData({ ...boutiqueData, couleur_primaire: e.target.value })}
                                  className="h-10 w-20 rounded-lg border border-gray-300 cursor-not-allowed opacity-50"
                                  disabled
                                />
                                <input
                                  type="text"
                                  value={boutiqueData.couleur_primaire}
                                  onChange={(e) => setBoutiqueData({ ...boutiqueData, couleur_primaire: e.target.value })}
                                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black-500 focus:border-transparent font-mono text-sm bg-gray-100 cursor-not-allowed"
                                  placeholder="#000000"
                                  disabled
                                />
                              </div>
                              <p className="mt-1 text-xs text-gray-500">
                                Couleur principale de votre boutique
                              </p>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Couleur secondaire
                              </label>
                              <div className="flex items-center space-x-3">
                                <input
                                  type="color"
                                  value={boutiqueData.couleur_secondaire}
                                  onChange={(e) => setBoutiqueData({ ...boutiqueData, couleur_secondaire: e.target.value })}
                                  className="h-10 w-20 rounded-lg border border-gray-300 cursor-not-allowed opacity-50"
                                  disabled
                                />
                                <input
                                  type="text"
                                  value={boutiqueData.couleur_secondaire}
                                  onChange={(e) => setBoutiqueData({ ...boutiqueData, couleur_secondaire: e.target.value })}
                                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black-500 focus:border-transparent font-mono text-sm bg-gray-100 cursor-not-allowed"
                                  placeholder="#ffffff"
                                  disabled
                                />
                              </div>
                              <p className="mt-1 text-xs text-gray-500">
                                Couleur secondaire de votre boutique
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-sm text-yellow-800">
                              <span className="font-medium">Fonctionnalité à venir :</span> La personnalisation des couleurs sera bientôt disponible.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-gray-200">
                        <button
                          onClick={handleSaveBoutique}
                          disabled={isSaving}
                          className="flex items-center px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {isSaving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Enregistrement...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Enregistrer les modifications
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

