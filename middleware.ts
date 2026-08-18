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

export function middleware(request: NextRequest): NextResponse {
  const maintenanceEnabled = process.env.MAINTENANCE_MODE === 'true';

  if (!maintenanceEnabled) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  const isExempt =
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml';

  if (isExempt) {
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
