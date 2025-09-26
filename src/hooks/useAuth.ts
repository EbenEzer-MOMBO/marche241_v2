import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { demanderCodeVerification, verifierCode, inscrireVendeur, getBoutiquesVendeur, DemanderCodeData, VerifierCodeData, InscriptionData, BoutiqueData } from '@/lib/services/auth';
import { useToast } from './useToast';

interface AuthUser {
  id: string;
  email: string;
  nom: string;
  telephone?: string;
}

interface UseAuthReturn {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  demanderCode: (data: DemanderCodeData) => Promise<boolean>;
  verifier: (data: VerifierCodeData) => Promise<boolean>;
  inscrire: (data: InscriptionData) => Promise<{ success: boolean; email?: string }>;
  verifierBoutique: () => Promise<BoutiqueData | null>;
  logout: () => void;
  toasts: any[];
  removeToast: (id: string) => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { success, error: showError, toasts, removeToast } = useToast();

  // Vérifier si l'utilisateur est connecté au chargement
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const userData = localStorage.getItem('admin_user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser({
          id: parsedUser.id.toString(),
          email: parsedUser.email,
          nom: parsedUser.nom,
          telephone: parsedUser.telephone
        });
      } catch (error) {
        console.error('Erreur lors du parsing des données utilisateur:', error);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }
    }
  }, []);

  const demanderCode = async (data: DemanderCodeData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await demanderCodeVerification(data);
      
      if (response.success) {
        success('Code envoyé avec succès', 'Vérifiez votre boîte email');
        // En mode développement, afficher le code dans la console
        if (response.code) {
          console.log(`Code de vérification: ${response.code}`);
        }
        return true;
      } else {
        setError(response.message);
        showError(response.message, 'Erreur d\'envoi');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'envoi du code';
      setError(errorMessage);
      
      // Messages d'erreur spécifiques selon le type
      if (errorMessage.includes('email n\'est pas valide')) {
        showError(errorMessage, 'Email invalide');
      } else if (errorMessage.includes('Aucun compte vendeur')) {
        showError(errorMessage, 'Compte introuvable');
      } else if (errorMessage.includes('Erreur serveur')) {
        showError(errorMessage, 'Erreur serveur');
      } else {
        showError(errorMessage, 'Erreur d\'envoi');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifier = async (data: VerifierCodeData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await verifierCode(data);
      
      if (response.success && response.vendeur && response.token) {
        // Stocker le token et les données utilisateur
        localStorage.setItem('admin_token', response.token);
        localStorage.setItem('admin_user', JSON.stringify(response.vendeur));
        
        setUser({
          id: response.vendeur.id.toString(),
          email: response.vendeur.email,
          nom: response.vendeur.nom,
          telephone: undefined
        });
        success('Connexion réussie', `Bienvenue ${response.vendeur.nom}`);
        
        // Vérifier si le vendeur a une boutique avant de rediriger
        try {
          const boutique = await verifierBoutique();
          
          if (boutique) {
            // Le vendeur a une boutique, utiliser le slug de l'API
            router.push(`/admin/${boutique.slug}`);
          } else {
            // Pas de boutique, rediriger vers la création
            router.push('/admin/boutique/create');
          }
        } catch (error) {
          // En cas d'erreur, rediriger vers la création de boutique
          router.push('/admin/boutique/create');
        }
        
        return true;
      } else {
        setError(response.message);
        showError(response.message, 'Code incorrect');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la vérification';
      setError(errorMessage);
      
      // Messages d'erreur spécifiques selon le type
      if (errorMessage.includes('invalide ou expiré')) {
        showError(errorMessage, 'Code invalide');
      } else if (errorMessage.includes('Vendeur non trouvé')) {
        showError(errorMessage, 'Vendeur introuvable');
      } else if (errorMessage.includes('Erreur serveur')) {
        showError(errorMessage, 'Erreur serveur');
      } else {
        showError(errorMessage, 'Erreur de vérification');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const inscrire = async (data: InscriptionData): Promise<{ success: boolean; email?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await inscrireVendeur(data);
      
      if (response.success) {
        success('Compte créé avec succès', 'Un code de vérification a été envoyé par email');
        // En mode développement, afficher le code dans la console
        if (response.code) {
          console.log(`Code de vérification: ${response.code}`);
        }
        return { success: true, email: data.email };
      } else {
        setError(response.message);
        showError(response.message, 'Erreur d\'inscription');
        return { success: false };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'inscription';
      setError(errorMessage);
      
      // Messages d'erreur spécifiques selon le type
      if (errorMessage.includes('Données invalides')) {
        showError(errorMessage, 'Données invalides');
      } else if (errorMessage.includes('email existe déjà')) {
        showError(errorMessage, 'Email déjà utilisé');
      } else if (errorMessage.includes('téléphone existe déjà')) {
        showError(errorMessage, 'Téléphone déjà utilisé');
      } else if (errorMessage.includes('Erreur serveur')) {
        showError(errorMessage, 'Erreur serveur');
      } else {
        showError(errorMessage, 'Erreur d\'inscription');
      }
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const verifierBoutique = useCallback(async (): Promise<BoutiqueData | null> => {
    if (!user?.id) {
      throw new Error('Utilisateur non authentifié');
    }

    try {
      const response = await getBoutiquesVendeur(parseInt(user.id));
      
      if (response.boutiques && response.boutiques.length > 0) {
        // Retourner la première boutique (pour l'instant on assume qu'un vendeur n'a qu'une boutique)
        return response.boutiques[0];
      }
      
      // Pas de boutique trouvée - retourner null
      return null;
    } catch (error: any) {
      console.error('Erreur lors de la vérification de la boutique:', error);
      // Ne pas afficher d'erreur toast ici car cela peut causer des redirections
      return null;
    }
  }, [user?.id]);

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setUser(null);
    success('Déconnexion réussie', 'À bientôt !');
    router.push('/admin/login');
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    demanderCode,
    verifier,
    inscrire,
    verifierBoutique,
    logout,
    toasts,
    removeToast
  };
}
