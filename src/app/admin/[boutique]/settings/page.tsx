'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { BoutiqueData, modifierBoutique, modifierVendeur } from '@/lib/services/auth';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import Sidebar from '@/components/admin/Sidebar';
import { uploadImage } from '@/lib/services/upload';
import { ProfilSection } from '@/components/admin/settings/ProfilSection';
import { ImageUploadSection } from '@/components/admin/settings/ImageUploadSection';
import { BoutiqueInfoSection } from '@/components/admin/settings/BoutiqueInfoSection';
import { ApparenceSection } from '@/components/admin/settings/ApparenceSection';
import { User, Store, Menu, Save } from 'lucide-react';

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
    banniere: '',
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
  const [isUploadingBanniere, setIsUploadingBanniere] = useState(false);

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
          banniere: boutiqueData.banniere || '',
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

  const handleBanniereFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    setIsUploadingBanniere(true);
    try {
      const uploadedImage = await uploadImage(file, boutique.slug, 'bannieres');
      setBoutiqueData({ ...boutiqueData, banniere: uploadedImage.url });
      success('Bannière uploadée avec succès');
    } catch (err: any) {
      console.error('Erreur lors de l\'upload de la bannière:', err);
      showError(err.message || 'Erreur lors de l\'upload de la bannière');
    } finally {
      setIsUploadingBanniere(false);
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
        banniere: boutiqueData.banniere,
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
                    <ProfilSection
                      profilData={profilData}
                      setProfilData={setProfilData}
                      onSave={handleSaveProfil}
                      isSaving={isSaving}
                    />
                  )}

                  {/* Section Boutique */}
                  {activeTab === 'boutique' && (
                    <div className="space-y-8">
                      <ImageUploadSection
                        logoUrl={boutiqueData.logo}
                        banniereUrl={boutiqueData.banniere}
                        isUploadingLogo={isUploadingLogo}
                        isUploadingBanniere={isUploadingBanniere}
                        onLogoChange={handleLogoFileChange}
                        onBanniereChange={handleBanniereFileChange}
                      />

                      <BoutiqueInfoSection
                        boutiqueData={boutiqueData}
                        setBoutiqueData={setBoutiqueData}
                      />

                      <ApparenceSection
                        couleurPrimaire={boutiqueData.couleur_primaire}
                        couleurSecondaire={boutiqueData.couleur_secondaire}
                        onChangePrimaire={(value) => setBoutiqueData({ ...boutiqueData, couleur_primaire: value })}
                        onChangeSecondaire={(value) => setBoutiqueData({ ...boutiqueData, couleur_secondaire: value })}
                      />

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

