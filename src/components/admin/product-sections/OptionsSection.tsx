'use client';

import { useState } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { ProductOption, OptionsSectionProps } from '@/types/ProductTypes';

export default function OptionsSection({
    options,
    onOptionsChange
}: OptionsSectionProps) {
    const [currentOptionName, setCurrentOptionName] = useState('');
    const [currentOptionType, setCurrentOptionType] = useState<'texte' | 'numero'>('texte');
    const [currentOptionRequired, setCurrentOptionRequired] = useState(false);
    const [error, setError] = useState<string>('');

    // Ajouter une option
    const addOption = () => {
        if (!currentOptionName.trim()) {
            setError('Veuillez saisir le nom de l\'option');
            return;
        }

        const newOption: ProductOption = {
            nom: currentOptionName.trim(),
            type: currentOptionType,
            required: currentOptionRequired
        };

        onOptionsChange([...options, newOption]);
        setCurrentOptionName('');
        setCurrentOptionType('texte');
        setCurrentOptionRequired(false);
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
                <h3 className="text-lg font-medium text-gray-900">
                    Options de personnalisation
                </h3>
            </div>

            <p className="text-sm text-gray-600">
                Les options permettent aux clients de personnaliser leur commande (ex: message personnalisé, numéro de maillot, etc.)
            </p>

            {/* Message d'erreur */}
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Formulaire d'ajout d'option */}
            <div className="p-4 border border-gray-300 rounded-lg space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nom de l'option
                        </label>
                        <input
                            type="text"
                            placeholder="ex: Message personnalisé, Numéro"
                            value={currentOptionName}
                            onChange={(e) => setCurrentOptionName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type
                        </label>
                        <select
                            value={currentOptionType}
                            onChange={(e) => setCurrentOptionType(e.target.value as 'texte' | 'numero')}
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
                        id="option-required"
                        checked={currentOptionRequired}
                        onChange={(e) => setCurrentOptionRequired(e.target.checked)}
                        className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                    />
                    <label htmlFor="option-required" className="ml-2 text-sm text-gray-700">
                        Option obligatoire
                    </label>
                </div>

                <button
                    type="button"
                    onClick={addOption}
                    className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter l'option
                </button>
            </div>

            {/* Liste des options */}
            {options.length > 0 ? (
                <div className="space-y-2">
                    {options.map((option, index) => (
                        <div
                            key={index}
                            className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between"
                        >
                            <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                    <span className="font-medium text-gray-900">{option.nom}</span>
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                                        {option.type === 'texte' ? 'Texte' : 'Numéro'}
                                    </span>
                                    {option.required && (
                                        <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded">
                                            Obligatoire
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeOption(index)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Supprimer l'option"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500 italic">
                    Aucune option de personnalisation ajoutée.
                </p>
            )}
        </div>
    );
}
