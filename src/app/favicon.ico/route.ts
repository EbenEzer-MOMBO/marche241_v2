import { getAssetsMarque } from '@/lib/services/assets-marque';

/**
 * Les navigateurs demandent /favicon.ico directement : redirige vers le favicon courant (repli : public/favicon-defaut.ico).
 * `Location` relative pour le repli : l'hôte vu par le serveur (proxy, server.js) peut différer de l'hôte public.
 */
export async function GET() {
  const assets = await getAssetsMarque();
  return new Response(null, { status: 302, headers: { Location: assets.favicon } });
}
