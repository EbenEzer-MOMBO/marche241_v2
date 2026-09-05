'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAffiliateToken,
  clearAffiliateToken,
  getProfilEtSoldeAffilie,
  updateProfilAffilie,
  getHistoriqueCommissionsAffilie,
  type ResumeAffilie,
  type CommissionAffiliee,
} from '@/lib/services/affiliation';

interface AffilieProfil {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  pays: string;
  code: string;
  statut: 'actif' | 'inactif';
  taux_commission: number;
}

const STATUT_LABELS: Record<CommissionAffiliee['statut'], string> = {
  due: 'Due',
  payee: 'Versée',
  annulee: 'Annulée',
};

function formatFcfa(montant: number): string {
  return `${montant.toLocaleString('fr-FR')} FCFA`;
}

export default function AffiliationTableauDeBordPage() {
  const router = useRouter();
  const [chargement, setChargement] = useState(true);
  const [affilie, setAffilie] = useState<AffilieProfil | null>(null);
  const [resume, setResume] = useState<ResumeAffilie | null>(null);
  const [commissions, setCommissions] = useState<CommissionAffiliee[]>([]);
  const [urlAGenerer, setUrlAGenerer] = useState('');
  const [profilForm, setProfilForm] = useState({ nom: '', email: '', telephone: '', pays: '' });
  const [profilMessage, setProfilMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getAffiliateToken()) {
      router.push('/affiliation/connexion');
      return;
    }

    const charger = async () => {
      try {
        const [profilReponse, commissionsReponse] = await Promise.all([
          getProfilEtSoldeAffilie(),
          getHistoriqueCommissionsAffilie(1, 20),
        ]);
        setAffilie(profilReponse.affilie);
        setResume(profilReponse.resume);
        setProfilForm({
          nom: profilReponse.affilie.nom,
          email: profilReponse.affilie.email,
          telephone: profilReponse.affilie.telephone,
          pays: profilReponse.affilie.pays,
        });
        setCommissions(commissionsReponse.donnees);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
        if (err instanceof Error && err.message.toLowerCase().includes('token')) {
          clearAffiliateToken();
          router.push('/affiliation/connexion');
        }
      } finally {
        setChargement(false);
      }
    };

    charger();
  }, [router]);

  const handleDeconnexion = () => {
    clearAffiliateToken();
    router.push('/affiliation/connexion');
  };

  const lienPrincipal = affilie ? `https://marche241.ga/?ref=${affilie.code}` : '';

  const genererLien = (): string => {
    if (!affilie || !urlAGenerer) return '';
    try {
      const url = new URL(urlAGenerer);
      url.searchParams.set('ref', affilie.code);
      return url.toString();
    } catch {
      return '';
    }
  };

  const handleUpdateProfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfilMessage('');
    try {
      const response = await updateProfilAffilie(profilForm);
      setAffilie(response.affilie);
      setProfilMessage('Profil mis à jour avec succès');
    } catch (err) {
      setProfilMessage(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  };

  if (chargement) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  if (!affilie || !resume) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <p className="text-red-600">{error || 'Erreur lors du chargement du tableau de bord'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord affilié</h1>
            <p className="text-sm text-gray-600">
              {affilie.nom} · Code <span className="font-mono">{affilie.code}</span>
            </p>
          </div>
          <button onClick={handleDeconnexion} className="text-sm font-medium text-gray-600 hover:underline">
            Déconnexion
          </button>
        </div>

        {affilie.statut === 'inactif' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">
              Votre compte affilié a été désactivé. Contactez l&apos;équipe Marché241 pour plus d&apos;informations.
            </p>
          </div>
        )}

        {/* Vue d'ensemble */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Solde dû</p>
            <p className="text-2xl font-bold text-gray-900">{formatFcfa(resume.soldeDue)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Total versé</p>
            <p className="text-2xl font-bold text-gray-900">{formatFcfa(resume.totalVerse)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Commandes livrées</p>
            <p className="text-2xl font-bold text-gray-900">{resume.commandesLivrees}</p>
          </div>
        </div>

        {/* Génération de liens */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Vos liens de tracking</h2>

          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Lien principal</p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-mono break-all flex-1">{lienPrincipal}</p>
              <button
                onClick={() => navigator.clipboard.writeText(lienPrincipal)}
                className="shrink-0 text-sm font-medium text-white bg-black rounded-lg px-3 py-1.5 hover:bg-gray-800"
              >
                Copier
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
              Générer un lien vers une boutique ou un produit
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={urlAGenerer}
                onChange={(e) => setUrlAGenerer(e.target.value)}
                placeholder="https://marche241.ga/ma-boutique"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            {urlAGenerer && genererLien() && (
              <div className="mt-3 flex items-center gap-2">
                <p className="text-sm font-mono break-all flex-1">{genererLien()}</p>
                <button
                  onClick={() => navigator.clipboard.writeText(genererLien())}
                  className="shrink-0 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50"
                >
                  Copier
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(genererLien())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-sm font-medium text-white bg-green-600 rounded-lg px-3 py-1.5 hover:bg-green-700"
                >
                  Partager
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Historique des commissions */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <h2 className="text-lg font-semibold text-gray-900 p-6 pb-4">Historique des commissions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Base</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Taux</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Commission</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {commissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      Aucune commission pour le moment
                    </td>
                  </tr>
                ) : (
                  commissions.map((commission) => (
                    <tr key={commission.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(commission.date_creation).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {formatFcfa(commission.montant_base)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {(commission.taux * 100).toFixed(2)} %
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {formatFcfa(commission.montant_commission)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {STATUT_LABELS[commission.statut]}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Profil */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Profil</h2>
          <form onSubmit={handleUpdateProfil} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                value={profilForm.nom}
                onChange={(e) => setProfilForm({ ...profilForm, nom: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={profilForm.email}
                onChange={(e) => setProfilForm({ ...profilForm, email: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
              <input
                type="text"
                value={profilForm.telephone}
                onChange={(e) => setProfilForm({ ...profilForm, telephone: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
              <input
                type="text"
                value={profilForm.pays}
                onChange={(e) => setProfilForm({ ...profilForm, pays: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Taux de commission</label>
              <p className="text-sm text-gray-500">
                {(affilie.taux_commission * 100).toFixed(2)} % — modifiable uniquement par l&apos;équipe Marché241
              </p>
            </div>

            {profilMessage && <p className="text-sm text-gray-600">{profilMessage}</p>}

            <button
              type="submit"
              className="text-sm font-medium text-white bg-black rounded-lg px-4 py-2 hover:bg-gray-800"
            >
              Enregistrer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
