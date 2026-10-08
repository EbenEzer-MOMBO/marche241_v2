export const VILLES_BOUTIQUE = [
  'Libreville',
  'Akanda',
  'Owendo',
  'Ntoum',
  'Port-Gentil',
  'Franceville',
  'Oyem',
  'Moanda',
  'Lambaréné',
  'Tchibanga',
  'Makokou',
  'Mouila',
  'Bitam',
  'Koulamoutou',
  'Retrait en magasin',
  'Province'
] as const;

const ACCENTS = 'àáâãäåèéêëìíîïòóôõöùúûüýÿçñ';
const SANS_ACCENTS = 'aaaaaaeeeeiiiiooooouuuuyycn';

function cleVille(valeur: string): string {
  const sansAccent = valeur
    .trim()
    .toLowerCase()
    .split('')
    .map((caractere) => {
      const index = ACCENTS.indexOf(caractere);
      return index === -1 ? caractere : SANS_ACCENTS[index];
    })
    .join('');

  return sansAccent.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
}

const CANONIQUES: Record<string, string> = {
  libreville: 'Libreville',
  'grand libreville': 'Libreville',
  'libreville centre': 'Libreville',
  'gabon libreville': 'Libreville',
  akanda: 'Akanda',
  owendo: 'Owendo',
  ntoum: 'Ntoum',
  'port gentil': 'Port-Gentil',
  portgentil: 'Port-Gentil',
  franceville: 'Franceville',
  oyem: 'Oyem',
  moanda: 'Moanda',
  lambarene: 'Lambaréné',
  tchibanga: 'Tchibanga',
  makokou: 'Makokou',
  mouila: 'Mouila',
  bitam: 'Bitam',
  koulamoutou: 'Koulamoutou',
  'retrait en magasin': 'Retrait en magasin',
  province: 'Province'
};

export function normaliserVille(ville: string): string {
  const nettoyee = ville.trim().replace(/\s+/g, ' ');
  if (!nettoyee) {
    return '';
  }
  return CANONIQUES[cleVille(nettoyee)] ?? nettoyee;
}

export function estVilleListe(ville: string): boolean {
  return (VILLES_BOUTIQUE as readonly string[]).includes(ville);
}
