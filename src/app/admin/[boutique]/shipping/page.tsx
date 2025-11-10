'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { BoutiqueData } from '@/lib/services/auth';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import Sidebar from '@/components/admin/Sidebar';
import {
  getCommunesParBoutique,
  creerCommune,
  modifierCommune,
  supprimerCommune,
  toggleCommuneStatus,
  Commune
} from '@/lib/services/communes';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Truck,
  Menu,
  Package,
  Clock
} from 'lucide-react';
import ShippingZoneModal from '@/components/admin/ShippingZoneModal';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

// Interface locale pour l'affichage (adaptée depuis Commune)
interface ZoneLivraison {
  id: number;
  nom: string;
  description?: string;
  prix: number;
  delai_livraison?: string;
  actif: boolean;
}

export default function ShippingPage() {
  const router = useRouter();
  const params = useParams();
  const boutiqueName = params.boutique as string;

  const { user, verifierBoutique } = useAuth();
  const { toasts, removeToast, success, error: showError } = useToast();

  const [boutique, setBoutique] = useState<BoutiqueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [zones, setZones] = useState<ZoneLivraison[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState<ZoneLivraison | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState<ZoneLivraison | null>(null);

  // Fonction pour charger les communes depuis l'API
  const loadZones = async (boutiqueId: number) => {
    try {
      const communesData = await getCommunesParBoutique(boutiqueId);

      // Adapter les données de l'API vers le format d'affichage
      const zonesAffichage: ZoneLivraison[] = communesData.map(commune => {
        // Formater le délai de livraison
        let delai = '';
        if (commune.delai_livraison_min === commune.delai_livraison_max) {
          delai = `${commune.delai_livraison_min} jour${commune.delai_livraison_min > 1 ? 's' : ''}`;
        } else {
          delai = `${commune.delai_livraison_min}-${commune.delai_livraison_max} jours`;
        }

        return {
          id: commune.id,
          nom: commune.nom_commune,
          description: commune.code_postal ? `Code postal: ${commune.code_postal}` : undefined,
          prix: commune.tarif_livraison,
          delai_livraison: delai,
          actif: commune.est_active
        };
      });

      setZones(zonesAffichage);
    } catch (error) {
      console.error('Erreur lors du chargement des zones:', error);
      showError('Erreur lors du chargement des zones de livraison', 'Erreur');
      setZones([]);
    }
  };

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
          router.replace(`/admin/${boutiqueData.slug}/shipping`);
          return;
        }

        setBoutique(boutiqueData);
        await loadZones(boutiqueData.id);
      } catch (error) {
        console.error('Erreur lors du chargement de la boutique:', error);
        showError('Erreur lors du chargement de la boutique', 'Erreur');
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      loadBoutiqueData();
    }, 100);

    return () => clearTimeout(timer);
  }, [user, boutiqueName, router, verifierBoutique, showError]);

  const filteredZones = zones.filter(zone =>
    zone.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    zone.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveZone = async (data: {
    nom: string;
    description: string;
    prix: number;
    delai_livraison: string;
  }) => {
    if (!boutique) return;

    try {
      // Parser le délai de livraison
      const delaiMatch = data.delai_livraison.match(/(\d+)(?:-(\d+))?/);
      let delai_min = 1;
      let delai_max = 3;

      if (delaiMatch) {
        delai_min = parseInt(delaiMatch[1]);
        delai_max = delaiMatch[2] ? parseInt(delaiMatch[2]) : delai_min;
      }

      if (editingZone) {
        // Modification
        const communeModifiee = await modifierCommune(editingZone.id, {
          nom_commune: data.nom,
          code_postal: data.description || null,
          tarif_livraison: data.prix,
          delai_livraison_min: delai_min,
          delai_livraison_max: delai_max
        });

        // Adapter la réponse API vers le format d'affichage
        const zoneAffichage: ZoneLivraison = {
          id: communeModifiee.id,
          nom: communeModifiee.nom_commune,
          description: communeModifiee.code_postal ? `Code postal: ${communeModifiee.code_postal}` : undefined,
          prix: communeModifiee.tarif_livraison,
          delai_livraison: data.delai_livraison,
          actif: communeModifiee.est_active
        };

        setZones(prev => prev.map(zone =>
          zone.id === editingZone.id ? zoneAffichage : zone
        ));
        success('Zone de livraison modifiée avec succès', 'Succès');
      } else {
        // Création
        const nouvelleCommune = await creerCommune({
          boutique_id: boutique.id,
          nom_commune: data.nom,
          code_postal: data.description || undefined,
          tarif_livraison: data.prix,
          delai_livraison_min: delai_min,
          delai_livraison_max: delai_max
        });

        // Adapter la réponse API vers le format d'affichage
        const zoneAffichage: ZoneLivraison = {
          id: nouvelleCommune.id,
          nom: nouvelleCommune.nom_commune,
          description: nouvelleCommune.code_postal ? `Code postal: ${nouvelleCommune.code_postal}` : undefined,
          prix: nouvelleCommune.tarif_livraison,
          delai_livraison: data.delai_livraison,
          actif: nouvelleCommune.est_active
        };

        setZones(prev => [...prev, zoneAffichage]);
        success('Zone de livraison créée avec succès', 'Succès');
      }

      setShowModal(false);
      setEditingZone(null);
    } catch (error: any) {
      showError(error.message || 'Erreur lors de la sauvegarde', 'Erreur');
    }
  };

  const handleEdit = (zone: ZoneLivraison) => {
    setEditingZone(zone);
    setShowModal(true);
  };

  const handleDeleteClick = (zone: ZoneLivraison) => {
    setZoneToDelete(zone);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!zoneToDelete) return;

    try {
      await supprimerCommune(zoneToDelete.id);
      setZones(prev => prev.filter(zone => zone.id !== zoneToDelete.id));
      success('Zone de livraison supprimée avec succès', 'Succès');
    } catch (error: any) {
      showError(error.message || 'Erreur lors de la suppression', 'Erreur');
    } finally {
      setZoneToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const handleToggleStatus = async (id: number) => {
    const zone = zones.find(z => z.id === id);
    if (!zone) return;

    try {
      // Optimistic update
      setZones(prev => prev.map(z =>
        z.id === id ? { ...z, actif: !z.actif } : z
      ));

      await toggleCommuneStatus(id, !zone.actif);
      success(`Zone ${zone.actif ? 'désactivée' : 'activée'}`, 'Succès');
    } catch (error: any) {
      // Rollback en cas d'erreur
      setZones(prev => prev.map(z =>
        z.id === id ? { ...z, actif: !z.actif } : z
      ));
      showError(error.message || 'Erreur lors de la mise à jour', 'Erreur');
    }
  };

  const handleNewZone = () => {
    setEditingZone(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingZone(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des frais de livraison...</p>
        </div>
      </div>
    );
  }

  if (!boutique) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Boutique non trouvée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden max-w-[100vw]">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Sidebar */}
      <Sidebar
        boutique={boutique}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 w-full">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-4 lg:px-6 py-3 lg:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center min-w-0 flex-1">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors mr-3 flex-shrink-0"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>

              <div className="min-w-0 flex-1">
                <h1 className="text-lg lg:text-2xl font-bold text-gray-900 truncate">Frais de livraison</h1>
                <p className="text-xs lg:text-sm text-gray-500 mt-0.5 lg:mt-1 truncate">
                  Gérez les zones et tarifs de livraison de {boutique.nom}
                </p>
              </div>
            </div>

            <button
              onClick={handleNewZone}
              className="flex items-center px-3 lg:px-4 py-1.5 lg:py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm lg:text-base flex-shrink-0 ml-2"
            >
              <Plus className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">Nouvelle zone</span>
              <span className="sm:hidden">Créer</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une zone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>

          {/* Zones Grid - Desktop & Tablet */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredZones.map((zone) => (
              <div
                key={zone.id}
                className={`bg-white rounded-lg shadow-sm border-2 transition-all ${zone.actif ? 'border-emerald-500' : 'border-gray-200'
                  }`}
              >
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 truncate">{zone.nom}</h3>
                      {zone.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{zone.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleToggleStatus(zone.id)}
                      className={`ml-2 flex-shrink-0 w-10 h-5 rounded-full transition-colors relative ${zone.actif ? 'bg-emerald-500' : 'bg-gray-300'
                        }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${zone.actif ? 'translate-x-5' : 'translate-x-0'
                          }`}
                      />
                    </button>
                  </div>

                  {/* Prix & Délai */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-700">
                      <Package className="h-4 w-4 mr-2 text-emerald-600" />
                      <span className="text-lg font-bold">{zone.prix.toLocaleString()} FCFA</span>
                    </div>
                    {zone.delai_livraison && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{zone.delai_livraison}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-3 border-t">
                    <button
                      onClick={() => handleEdit(zone)}
                      className="flex-1 flex items-center justify-center px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteClick(zone)}
                      className="px-3 py-2 text-sm border border-red-300 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Zones List - Mobile */}
          <div className="sm:hidden space-y-3">
            {filteredZones.map((zone) => (
              <div
                key={zone.id}
                className={`bg-white rounded-lg shadow-sm border-2 transition-all ${zone.actif ? 'border-emerald-500' : 'border-gray-200'
                  } p-3`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{zone.nom}</h3>
                    {zone.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{zone.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleToggleStatus(zone.id)}
                    className={`ml-2 flex-shrink-0 w-9 h-5 rounded-full transition-colors relative ${zone.actif ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${zone.actif ? 'translate-x-4' : 'translate-x-0'
                        }`}
                    />
                  </button>
                </div>

                <div className="space-y-1 mb-3">
                  <div className="flex items-center text-gray-700">
                    <Package className="h-3 w-3 mr-2 text-emerald-600" />
                    <span className="text-base font-bold">{zone.prix.toLocaleString()} FCFA</span>
                  </div>
                  {zone.delai_livraison && (
                    <div className="flex items-center text-xs text-gray-600">
                      <Clock className="h-3 w-3 mr-2 text-gray-400" />
                      <span>{zone.delai_livraison}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t">
                  <button
                    onClick={() => handleEdit(zone)}
                    className="flex-1 flex items-center justify-center px-2 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteClick(zone)}
                    className="px-2 py-1.5 text-xs border border-red-300 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredZones.length === 0 && (
            <div className="text-center py-12">
              <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Aucune zone trouvée' : 'Aucune zone de livraison'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm
                  ? 'Essayez avec d\'autres mots-clés'
                  : 'Commencez par créer votre première zone de livraison'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={handleNewZone}
                  className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer ma première zone
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ShippingZoneModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSaveZone}
        zone={editingZone}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setZoneToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Supprimer la zone de livraison"
        message={`Êtes-vous sûr de vouloir supprimer la zone "${zoneToDelete?.nom}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
}

