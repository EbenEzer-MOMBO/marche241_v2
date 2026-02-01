'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { Store, Camera, Upload } from 'lucide-react';

interface ImageUploadSectionProps {
  logoUrl: string;
  banniereUrl: string;
  isUploadingLogo: boolean;
  isUploadingBanniere: boolean;
  onLogoChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBanniereChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  logoUrl,
  banniereUrl,
  isUploadingLogo,
  isUploadingBanniere,
  onLogoChange,
  onBanniereChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const banniereInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Logo Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo de la boutique</h3>
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100">
            {isUploadingLogo && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt="Logo de la boutique"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Store className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-center space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onLogoChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingLogo}
              className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploadingLogo ? 'Upload en cours...' : 'Choisir un fichier'}
            </button>
            <p className="text-xs text-gray-500">
              Format: JPG, PNG, SVG (max 5MB)
            </p>
          </div>
        </div>
      </div>

      {/* Bannière Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bannière de la boutique</h3>
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-full h-32 rounded-lg overflow-hidden border-4 border-gray-200 bg-gray-100">
            {isUploadingBanniere && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
            {banniereUrl ? (
              <Image
                src={banniereUrl}
                alt="Bannière de la boutique"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Camera className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-center space-y-3">
            <input
              ref={banniereInputRef}
              type="file"
              accept="image/*"
              onChange={onBanniereChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => banniereInputRef.current?.click()}
              disabled={isUploadingBanniere}
              className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploadingBanniere ? 'Upload en cours...' : 'Choisir un fichier'}
            </button>
            <p className="text-xs text-gray-500">
              Format: JPG, PNG (max 5MB) - Ratio 16:9
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
