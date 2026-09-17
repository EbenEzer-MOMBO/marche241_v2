import { NextRequest, NextResponse } from 'next/server';

const MAINTENANCE_HTML = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Maintenance en cours | Marché241</title>
<style>
  html, body { height: 100%; margin: 0; }
  body {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0b0b0f;
    color: #f5f5f5;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    text-align: center;
    padding: 24px;
  }
  .card { max-width: 480px; }
  h1 { font-size: 1.75rem; margin-bottom: 12px; }
  p { color: #a3a3a3; line-height: 1.6; }
</style>
</head>
<body>
  <div class="card">
    <h1>Marché241 est en maintenance</h1>
    <p>Nous effectuons actuellement des travaux pour améliorer votre expérience. Le site sera de retour très prochainement. Merci de votre patience.</p>
  </div>
</body>
</html>`;

const PREVIEW_COOKIE = 'boutique_preview';
const PREVIEW_COOKIE_MAX_AGE_SECONDS = 30 * 60; // 30 min : le temps d'une session de prévisualisation vendeur

function withPreviewHeaderIfNeeded(request: NextRequest): NextResponse {
  // Prévisualisation vendeur ("Voir la boutique" depuis le dashboard, ?preview=1) :
  // relayée via un header pour rester accessible aux Server Components qui n'ont
  // pas accès à searchParams (layout.tsx notamment). Un cookie de session la fait
  // aussi survivre à la navigation interne à la boutique (les liens internes ne
  // portent pas ?preview=1), pour que tout le parcours du vendeur reste exclu du
  // tracking, pas seulement la première page atteinte.
  const hasPreviewParam = request.nextUrl.searchParams.get('preview') === '1';
  const hasPreviewCookie = request.cookies.get(PREVIEW_COOKIE)?.value === '1';

  if (!hasPreviewParam && !hasPreviewCookie) {
    return NextResponse.next();
  }

  const headers = new Headers(request.headers);
  headers.set('x-boutique-preview', '1');
  const response = NextResponse.next({ request: { headers } });

  if (hasPreviewParam) {
    response.cookies.set(PREVIEW_COOKIE, '1', {
      maxAge: PREVIEW_COOKIE_MAX_AGE_SECONDS,
      path: '/',
      sameSite: 'lax',
      httpOnly: false,
    });
  }

  return response;
}

export function middleware(request: NextRequest): NextResponse {
  const maintenanceEnabled = process.env.MAINTENANCE_MODE === 'true';

  if (!maintenanceEnabled) {
    return withPreviewHeaderIfNeeded(request);
  }

  const { pathname } = request.nextUrl;

  const isExempt =
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml';

  // Les requêtes internes de Next.js (Server Actions, navigations RSC,
  // prefetch du routeur) attendent une réponse au format RSC, jamais du
  // HTML. Les intercepter ici casse le contrat client/serveur de Next.js
  // et déclenche "Expected RSC response, got text/plain" côté client.
  const isNextInternalRequest =
    request.headers.has('next-action') ||
    request.headers.get('RSC') === '1' ||
    request.headers.get('Next-Router-Prefetch') === '1';

  if (isExempt || isNextInternalRequest) {
    return NextResponse.next();
  }

  return new NextResponse(MAINTENANCE_HTML, {
    status: 503,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Retry-After': '3600',
    },
  });
}

export const config = {
  matcher: '/((?!_next/static|_next/image).*)',
};
