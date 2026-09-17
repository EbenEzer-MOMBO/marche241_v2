const NOMS_PAYS_FR: Record<string, string> = {
  GA: 'Gabon',
  CG: 'Congo',
  CD: 'RD Congo',
  CM: 'Cameroun',
  GQ: 'Guinée équatoriale',
  TD: 'Tchad',
  CF: 'Centrafrique',
  AO: 'Angola',
  SN: 'Sénégal',
  CI: "Côte d'Ivoire",
  BJ: 'Bénin',
  TG: 'Togo',
  ML: 'Mali',
  BF: 'Burkina Faso',
  NE: 'Niger',
  NG: 'Nigeria',
  GH: 'Ghana',
  MA: 'Maroc',
  DZ: 'Algérie',
  TN: 'Tunisie',
  FR: 'France',
  BE: 'Belgique',
  CH: 'Suisse',
  CA: 'Canada',
  US: 'États-Unis',
  GB: 'Royaume-Uni',
  DE: 'Allemagne',
  ES: 'Espagne',
  PT: 'Portugal',
  IT: 'Italie',
  CN: 'Chine',
  IN: 'Inde',
  AE: 'Émirats arabes unis',
  INCONNU: 'Inconnu',
};

export function libellePays(code: string | null | undefined): string {
  const brut = (code || '').trim();
  if (!brut || brut.toLowerCase() === 'inconnu') {
    return 'Inconnu';
  }

  const iso = brut.toUpperCase();
  return NOMS_PAYS_FR[iso] || (brut.length === 2 ? iso : brut);
}
