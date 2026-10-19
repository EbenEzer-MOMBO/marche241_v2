import { timingSafeEqual } from 'crypto';
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

function secretValide(recu: string | null, attendu: string): boolean {
  if (!recu) {
    return false;
  }
  const a = Buffer.from(recu);
  const b = Buffer.from(attendu);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Appelé par l'API après l'affectation d'un asset de marque (en-tête x-revalidate-secret). */
export async function POST(request: Request) {
  const secret = process.env.FRONT_REVALIDATE_SECRET;
  if (!secret || !secretValide(request.headers.get('x-revalidate-secret'), secret)) {
    return NextResponse.json({ success: false }, { status: 401 });
  }
  revalidateTag('assets-marque', 'max');
  return NextResponse.json({ success: true });
}
