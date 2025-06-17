// app/layout.js
import "./globals.css";
import Providers from "@/components/Providers";
import Topbar from "@/components/Topbar";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import Link from "next/link";
import { MdDashboard, MdSettings, MdArticle } from "react-icons/md"; // Example icons

export const metadata = {
  title: "AI Recruitment Platform",
  description: "Modern hiring using Next.js, TailwindCSS, and Gemini AI",
};

// Main layout component
export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <head>
        {/* Fonts: Base font and Material Symbols for icons */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />

        {/* Material You Web Components and Typography Styles (as you provided) */}
        <script
          type="importmap"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              imports: {
                "@material/web/": "https://esm.run/@material/web/",
              },
            }),
          }}
        />
        <script
          type="module"
          dangerouslySetInnerHTML={{
            __html: `
              import '@material/web/all.js';
              import { styles as typescaleStyles } from '@material/web/typography/md-typescale-styles.js';
              document.adoptedStyleSheets.push(typescaleStyles.styleSheet);
            `,
          }}
        />

        {/* Global styles to apply Material You theme tokens */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              body {
                background-color: var(--md-sys-color-background);
                color: var(--md-sys-color-on-background);
                font-family: 'Montserrat', sans-serif;
              }
            `,
          }}
        />
      </head>

      <body>
        <Providers>
          {/* 
            md-theme enables Material Theming. 
            - 'dark-theme' attribute applies the dark theme.
            - 'source-color' generates a full color palette from a single color. 
              Let's use a professional blue like #3B82F6.
          */}
          <md-theme dark-theme source-color="#3B82F6">
            <div className="flex min-h-screen">
              {/* 
                Sidebar: Replaced with md-navigation-drawer.
                - 'opened' makes it visible on desktop.
                - Styled with M3 color tokens for the border.
              */}
              {session?.user && (
                <md-navigation-drawer opened className="w-72 border-r border-solid border-[var(--md-sys-color-outline-variant)]">
                  <div className="p-4">
                     <h2 className="md-typescale-title-large mb-4">AI Recruiter</h2>
                  </div>
                  
                  {/* Navigation List: Replaced with md-list and md-list-item */}
                  <md-list>
                    {session.user.role === "hr" && (
                      <>
                        <Link href="/hr/dashboard" passHref>
                          <md-list-item headline="HR Dashboard">
                            <span slot="start" className="material-symbols-outlined">dashboard</span>
                          </md-list-item>
                        </Link>
                        <Link href="/hr/settings" passHref>
                          <md-list-item headline="Settings">
                            <span slot="start" className="material-symbols-outlined">settings</span>
                          </md-list-item>
                        </Link>
                      </>
                    )}
                    {session.user.role === "applie" && (
                       <Link href="/dashboard" passHref>
                          <md-list-item headline="My Applications">
                            <span slot="start" className="material-symbols-outlined">article</span>
                          </md-list-item>
                        </Link>
                    )}
                  </md-list>
                </md-navigation-drawer>
              )}

              {/* Main Content Area */}
              <main 
                className="flex-1 flex flex-col" 
                style={{ backgroundColor: 'var(--md-sys-color-surface)' }}
              >
                {/* Topbar remains, it will inherit M3 colors */}
                <Topbar />

                {/* Page content with M3-style padding */}
                <div className="flex-grow p-6 md:p-8">
                  {children}
                </div>
              </main>
            </div>
          </md-theme>
        </Providers>
      </body>
    </html>
  );
}