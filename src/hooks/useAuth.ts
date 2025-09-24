import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { demanderCodeVerification, verifierCode, DemanderCodeData, VerifierCodeData } from '@/lib/services/auth';
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
        setUser(parsedUser);
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
      
      if (response.success && response.data) {
        // Stocker le token et les données utilisateur
        localStorage.setItem('admin_token', response.data.token);
        localStorage.setItem('admin_user', JSON.stringify(response.data.vendeur));
        
        setUser(response.data.vendeur);
        success('Connexion réussie', `Bienvenue ${response.data.vendeur.nom}`);
        
        // Rediriger vers le dashboard
        router.push('/admin/dashboard');
        return true;
      } else {
        setError(response.message);
        showError(response.message, 'Code incorrect');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la vérification';
      setError(errorMessage);
      showError(errorMessage, 'Erreur de vérification');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

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
    logout,
    toasts,
    removeToast
  };
}
