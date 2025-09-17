'use client';

import { useState } from 'react';

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  phoneLength: number;
  phonePattern: RegExp;
}

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
}

const countries: Country[] = [
  { code: 'GA', name: 'Gabon', dialCode: '+241', flag: '🇬🇦', phoneLength: 8, phonePattern: /^[0-9]{8}$/ },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', phoneLength: 9, phonePattern: /^[0-9]{9}$/ },
  { code: 'CM', name: 'Cameroun', dialCode: '+237', flag: '🇨🇲', phoneLength: 8, phonePattern: /^[0-9]{8}$/ },
  { code: 'CI', name: 'Côte d\'Ivoire', dialCode: '+225', flag: '🇨🇮', phoneLength: 8, phonePattern: /^[0-9]{8}$/ },
  { code: 'SN', name: 'Sénégal', dialCode: '+221', flag: '🇸🇳', phoneLength: 8, phonePattern: /^[0-9]{8}$/ },
  { code: 'MA', name: 'Maroc', dialCode: '+212', flag: '🇲🇦', phoneLength: 9, phonePattern: /^[0-9]{9}$/ },
];

export default function PhoneNumberInput({ 
  value, 
  onChange, 
  placeholder = "6XXXXXXX", 
  required = false,
  className = "",
  onValidationChange
}: PhoneNumberInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]); // Gabon par défaut
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isValid, setIsValid] = useState(false);
  
  // Extraire le numéro sans l'indicatif
  const phoneNumber = value.startsWith(selectedCountry.dialCode) 
    ? value.slice(selectedCountry.dialCode.length) 
    : value;

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    
    // Limiter le numéro existant au nouveau format
    const limitedNumber = phoneNumber.slice(0, country.phoneLength);
    
    // Valider avec le nouveau pays
    const valid = country.phonePattern.test(limitedNumber);
    setIsValid(valid);
    
    if (onValidationChange) {
      onValidationChange(valid);
    }
    
    // Mettre à jour la valeur avec le nouvel indicatif
    onChange(`${country.dialCode}${limitedNumber}`);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value.replace(/[^\d]/g, ''); // Garder seulement les chiffres
    
    // Limiter au nombre de chiffres autorisés pour le pays
    const limitedNumber = newNumber.slice(0, selectedCountry.phoneLength);
    
    // Valider le numéro
    const valid = selectedCountry.phonePattern.test(limitedNumber);
    setIsValid(valid);
    
    // Notifier le parent du changement de validation
    if (onValidationChange) {
      onValidationChange(valid);
    }
    
    onChange(`${selectedCountry.dialCode}${limitedNumber}`);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex">
        {/* Sélecteur de pays */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center px-3 py-2 border border-r-0 border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <span className="text-lg mr-1">{selectedCountry.flag}</span>
            <span className="text-sm font-medium text-gray-700">{selectedCountry.dialCode}</span>
            <svg 
              className={`ml-1 h-4 w-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown des pays */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
              {countries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  <span className="text-lg mr-2">{country.flag}</span>
                  <span className="flex-1 text-sm text-gray-900">{country.name}</span>
                  <span className="text-sm text-gray-500">{country.dialCode}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Champ de saisie du numéro */}
        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder={`${'X'.repeat(selectedCountry.phoneLength)}`}
          required={required}
          maxLength={selectedCountry.phoneLength}
          className={`flex-1 px-3 py-2 border rounded-r-md focus:outline-none focus:ring-2 ${
            phoneNumber.length === 0 
              ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              : isValid 
                ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
                : 'border-red-500 focus:ring-red-500 focus:border-red-500'
          }`}
        />
      </div>

      {/* Overlay pour fermer le dropdown */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}
