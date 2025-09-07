// Configuration des boutiques
export const boutiques = {
  marche_241: {
    name: "Marché241",
    description: "Découvrez Marché241, votre boutique en ligne minimaliste pour une expérience d'achat simple et moderne",
    theme: {
      primary: "#000000",
      secondary: "#4A9782",
      accent: "#DCD0A8"
    }
  },
  boutique_de_joline: {
    name: "Boutique de Joline",
    description: "La boutique de Joline - Mode et accessoires tendance pour tous les goûts",
    theme: {
      primary: "#000000",
      secondary: "#db2777",
      accent: "#DCD0A8",
      black: "#000000",
    }
  }
};

export type BoutiqueConfig = {
  name: string;
  description: string;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
  };
};