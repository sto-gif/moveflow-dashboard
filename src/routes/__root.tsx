import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Siden blev ikke fundet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Siden du leder efter findes ikke eller er blevet flyttet.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Tilbage til dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Testing SSS" },
      {
        name: "description",
        content:
          "Alt-i-én SaaS til flyttefirmaer: jobs, tilbud, crew, fakturaer, lager og kundekommunikation.",
      },
      { name: "author", content: "Flyt" },
      { property: "og:title", content: "Testing SSS" },
      {
        property: "og:description",
        content: "Driv hele dit flyttefirma fra én moderne platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Testing SSS" },
      { name: "description", content: "MoveFlow Dashboard is a comprehensive SaaS platform for moving companies, managing operations from lead to invoice." },
      { property: "og:description", content: "MoveFlow Dashboard is a comprehensive SaaS platform for moving companies, managing operations from lead to invoice." },
      { name: "twitter:description", content: "MoveFlow Dashboard is a comprehensive SaaS platform for moving companies, managing operations from lead to invoice." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/bd87703d-0e54-46bc-a02f-02c89b1da04c/id-preview-ea2c0c1d--cc9ef946-3789-4582-a577-e6378c7c50f5.lovable.app-1776439148607.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/bd87703d-0e54-46bc-a02f-02c89b1da04c/id-preview-ea2c0c1d--cc9ef946-3789-4582-a577-e6378c7c50f5.lovable.app-1776439148607.png" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
