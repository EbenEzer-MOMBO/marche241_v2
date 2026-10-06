'use client';

import type { CiblageBoost, SexeCiblage } from '@/lib/database-types';
import type { ParametresBoost } from '@/lib/services/boosts';

function Puce({ actif, onClick, children }: { actif: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={actif}
      className={`rounded-full border px-3 py-1.5 text-sm transition ${
        actif ? 'border-black bg-black text-white' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
      }`}
    >
      {children}
    </button>
  );
}

function basculer<T>(liste: T[], valeur: T): T[] {
  return liste.includes(valeur) ? liste.filter((v) => v !== valeur) : [...liste, valeur];
}

/** Champs de ciblage (port de AudienceFields de boost_meta). */
export default function AudienceFields({
  ciblage,
  parametres,
  onChange
}: {
  ciblage: CiblageBoost;
  parametres: ParametresBoost;
  onChange: (maj: Partial<CiblageBoost>) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-medium text-gray-900">Villes au Gabon</p>
        <div className="flex flex-wrap gap-2">
          {parametres.villes.map((v) => (
            <Puce key={v.cle} actif={ciblage.villes.includes(v.cle)} onClick={() => onChange({ villes: basculer(ciblage.villes, v.cle) })}>
              {v.nom}
            </Puce>
          ))}
        </div>
        <p className="mt-1 text-xs text-gray-500">Aucune ville sélectionnée = tout le(s) pays ci-dessous.</p>
      </div>

      {ciblage.villes.length === 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-gray-900">Pays</p>
          <div className="flex flex-wrap gap-2">
            {parametres.pays.map((p) => (
              <Puce
                key={p.code}
                actif={ciblage.pays.includes(p.code)}
                onClick={() => {
                  const pays = basculer(ciblage.pays, p.code);
                  onChange({ pays: pays.length ? pays : ['GA'] });
                }}
              >
                {p.nom}
              </Puce>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-medium text-gray-900">Sexe</p>
        <div className="flex flex-wrap gap-2">
          {(['femme', 'homme'] as SexeCiblage[]).map((s) => (
            <Puce key={s} actif={ciblage.sexes.includes(s)} onClick={() => onChange({ sexes: basculer(ciblage.sexes, s) })}>
              {s === 'femme' ? 'Femmes' : 'Hommes'}
            </Puce>
          ))}
        </div>
        <p className="mt-1 text-xs text-gray-500">Aucun = tout le monde.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-xs">
        <label className="block">
          <span className="text-sm font-medium text-gray-900">Âge min</span>
          <input
            type="number"
            min={18}
            max={65}
            value={ciblage.age_min}
            onChange={(e) => onChange({ age_min: Math.min(65, Math.max(18, Number(e.target.value) || 18)) })}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-900">Âge max</span>
          <input
            type="number"
            min={18}
            max={65}
            value={ciblage.age_max}
            onChange={(e) => onChange({ age_max: Math.min(65, Math.max(18, Number(e.target.value) || 65)) })}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
        </label>
      </div>
      {ciblage.age_min > ciblage.age_max && <p className="text-xs text-red-600">L’âge minimum doit être inférieur à l’âge maximum.</p>}

      <div>
        <p className="mb-2 text-sm font-medium text-gray-900">Langue</p>
        <div className="flex flex-wrap gap-2">
          {parametres.langues.map((l) => (
            <Puce key={l.locale} actif={ciblage.langues.includes(l.locale)} onClick={() => onChange({ langues: basculer(ciblage.langues, l.locale) })}>
              {l.nom}
            </Puce>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-gray-900">Centres d’intérêt</p>
        <div className="flex flex-wrap gap-2">
          {parametres.interets.map((i) => (
            <Puce
              key={i.code}
              actif={ciblage.interets.includes(i.code)}
              onClick={() => {
                if (!ciblage.interets.includes(i.code) && ciblage.interets.length >= 10) return;
                onChange({ interets: basculer(ciblage.interets, i.code) });
              }}
            >
              {i.nom}
            </Puce>
          ))}
        </div>
        <p className="mt-1 text-xs text-gray-500">10 maximum. Aucun = audience large.</p>
      </div>
    </div>
  );
}
