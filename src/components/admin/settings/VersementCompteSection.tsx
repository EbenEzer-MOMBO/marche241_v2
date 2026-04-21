'use client';

import Image from 'next/image';
import { normalizeMsisdnInput, validateMsisdn, msisdnPlaceholder } from '@/lib/utils/mobileMoneyMsisdn';

interface VersementCompteSectionProps {
  value: string;
  onChange: (value: string) => void;
}

export const VersementCompteSection: React.FC<VersementCompteSectionProps> = ({
  value,
  onChange
}) => {
  const error = validateMsisdn(value, 'airtel');

  const handleChange = (raw: string) => {
    onChange(normalizeMsisdnInput(raw));
  };

  return (
    <div className="space-y-4 pt-2 border-t border-gray-200">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Compte versement</h3>
        <p className="text-sm text-gray-600 mt-1">
          Numéro Airtel Money sur lequel vos reversements seront envoyés.
        </p>
      </div>

      <div className="space-y-4">
        <div
          className="border rounded-lg p-4 opacity-50 pointer-events-none cursor-not-allowed border-gray-200 bg-gray-50"
          aria-disabled="true"
        >
          <div className="flex items-center">
            <input
              type="radio"
              name="versement-operator"
              checked={false}
              readOnly
              disabled
              className="mr-3 w-4 h-4"
              tabIndex={-1}
            />
            <Image
              src="/moov_money.png"
              alt="Moov Money"
              width={40}
              height={40}
              className="mr-3 rounded"
            />
            <div>
              <div className="font-semibold text-gray-900">Moov Money</div>
              <div className="text-sm text-gray-500">Bientôt disponible</div>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4 border-2 border-gray-900 bg-gray-50">
          <div className="flex items-center">
            <input
              type="radio"
              name="versement-operator"
              checked
              readOnly
              className="mr-3 w-4 h-4"
              style={{ accentColor: '#111827' }}
              aria-label="Airtel Money (versement)"
            />
            <Image
              src="/airtel_money.png"
              alt="Airtel Money"
              width={40}
              height={40}
              className="mr-3 rounded"
            />
            <div>
              <div className="font-semibold text-gray-900">Airtel Money</div>
              <div className="text-sm text-gray-600">Versement sur ce numéro</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Numéro Airtel Money
          </label>
          <input
            type="tel"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
              error
                ? 'border-red-500 focus:ring-red-500'
                : value.length === 9 && !error
                  ? 'border-green-500 focus:ring-green-500'
                  : 'border-gray-300 focus:ring-gray-400'
            }`}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={msisdnPlaceholder('airtel')}
            maxLength={9}
            autoComplete="tel-national"
          />
          {error ? (
            <p className="text-xs text-red-600 mt-1 flex items-center">
              <svg className="w-3 h-3 mr-1 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </p>
          ) : value.length === 9 && !error ? (
            <p className="text-xs text-green-600 mt-1 flex items-center">
              <svg className="w-3 h-3 mr-1 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Numéro valide
            </p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">
              Saisissez le numéro associé à votre compte Airtel Money (format 07XXXXXXX).
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
