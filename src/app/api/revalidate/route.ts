import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const secret = process.env.FRONT_REVALIDATE_SECRET;
  if (!secret || request.headers.get('x-revalidate-secret') !== secret) {
    return NextResponse.json({ success: false }, { status: 401 });
  }
  revalidateTag('assets-marque', 'max');
  return NextResponse.json({ success: true });
}
