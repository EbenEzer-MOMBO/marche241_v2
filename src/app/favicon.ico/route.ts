import { NextResponse } from 'next/server';
import { getAssetsMarque } from '@/lib/services/assets-marque';

export async function GET() {
  const assets = await getAssetsMarque();
  return NextResponse.redirect(assets.favicon, 302);
}
