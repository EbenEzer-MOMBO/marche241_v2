export const colors = {
  primary: '#004030',     // Couleur primaire - vert foncé
  secondary: '#4A9782',   // Couleur secondaire - vert plus clair
  accent: '#DCD0A8',      // Couleur d'accent - beige
  background: '#FFF9E5',  // Couleur de fond - crème très clair
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    light: '#F5F5F5',
    medium: '#9CA3AF',
    dark: '#374151',
  }
} as const;

export type ColorKeys = keyof typeof colors;
