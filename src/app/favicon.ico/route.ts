import { NextResponse } from 'next/server';
import { getAssetsMarque } from '@/lib/services/assets-marque';

/** Les navigateurs demandent /favicon.ico directement : redirige vers le favicon courant (repli : public/favicon-defaut.ico). */
export async function GET(request: Request) {
  const assets = await getAssetsMarque();
  return NextResponse.redirect(new URL(assets.favicon, request.url), 302);
}
