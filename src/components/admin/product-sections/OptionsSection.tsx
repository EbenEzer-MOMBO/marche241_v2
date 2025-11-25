'use client';

import { useState } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { ProductOption, OptionsSectionProps } from '@/types/ProductTypes';

export default function OptionsSection({
    options,
    onOptionsChange
}: OptionsSectionProps) {
    const [error, setError] = useState<string>('');

    // Ajouter une option vide
    const addOption = () => {
        const newOption: ProductOption = {
            nom: '',
            type: 'texte',
            required: false
        };

        const updatedOptions = [...options, newOption];
        console.log('[OptionsSection] Ajout d\'une option vide');
        console.log('[OptionsSection] Options après ajout:', updatedOptions);
        onOptionsChange(updatedOptions);
        setError('');
    };

    // Supprimer une option
    const removeOption = (index: number) => {
        onOptionsChange(options.filter((_, i) => i !== index));
    };

    // Mettre à jour une option
    const updateOption = (index: number, field: keyof ProductOption, value: any) => {
        const newOptions = [...options];
        newOptions[index] = { ...newOptions[index], [field]: value };
        onOptionsChange(newOptions);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">
                        Options de personnalisation
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Les options permettent aux clients de personnaliser leur commande (ex: message personnalisé, numéro de maillot, etc.)
                    </p>
                </div>
            </div>

            {/* Message d'erreur */}
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Liste des options */}
            {options.length > 0 ? (
                <div className="space-y-3">
                    {options.map((option, index) => (
                        <div
                            key={index}
                            className="p-4 bg-white rounded-lg border-2 border-gray-200 space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-gray-700">Option {index + 1}</h4>
                                <button
                                    type="button"
                                    onClick={() => removeOption(index)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Supprimer l'option"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nom de l'option *
                                    </label>
                                    <input
                                        type="text"
                                        value={option.nom}
                                        onChange={(e) => updateOption(index, 'nom', e.target.value)}
                                        placeholder="ex: Message personnalisé"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Type
                                    </label>
                                    <select
                                        value={option.type}
                                        onChange={(e) => updateOption(index, 'type', e.target.value as 'texte' | 'numero')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                    >
                                        <option value="texte">Texte</option>
                                        <option value="numero">Numéro</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`option-required-${index}`}
                                    checked={option.required || false}
                                    onChange={(e) => updateOption(index, 'required', e.target.checked)}
                                    className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                                />
                                <label htmlFor={`option-required-${index}`} className="ml-2 text-sm text-gray-700">
                                    Option obligatoire
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500 italic">
                    Aucune option de personnalisation ajoutée. Cliquez sur "Ajouter une option" pour en créer une.
                </p>
            )}
            <button
                type="button"
                onClick={addOption}
                className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
            >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une option
            </button>
        </div>
    );
}
