// app/layout.js
import "./globals.css";
import { Montserrat } from "next/font/google"; // Using Next.js Font for Montserrat
import Providers from "@/components/Providers";
import Topbar from "@/components/Topbar";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import Link from 'next/link';
import ThemeToggle from "@/components/ThemeToggle"; // Import the ThemeToggle component

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata = {
  title: "AI Recruitment Platform", // Updated title for consistency
  description: "Modern hiring using Next.js, TailwindCSS, and Gemini AI", // Updated description
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);

  return (
    // Corrected whitespace for hydration, applied Material You system class, and initial theme
    <html lang="en" className="md-sys dark">
      <head>
        {/* Material You Web Components and Typography Styles */}
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
      </head>
      {/* Apply Material You typography and surface colors to the body */}
      <body className={`${montserrat.className} md-typescale-body-large bg-surface text-on-surface`}>
        <Providers>
          <div className="flex min-h-screen">
            {/* Sidebar: Only visible when user is logged in */}
            {session?.user && ( // Use optional chaining for safer access to session.user
              <aside className="w-64 bg-surface-container-low p-4 hidden md:block border-r border-outline-variant shadow-md">
                <h2 className="md-typescale-title-large text-on-surface-container font-semibold mb-6">Navigation</h2>
                <nav className="space-y-3"> {/* Adjusted spacing for Material You feel */}
                  {session.user.role === 'hr' && (
                    <>
                      <Link
                        href="/hr/dashboard"
                        className="block px-4 py-2 text-on-surface-variant rounded-full hover:bg-surface-container-high transition-colors duration-200"
                      >
                        HR Dashboard
                      </Link>
                      <Link
                        href="/hr/settings"
                        className="block px-4 py-2 text-on-surface-variant rounded-full hover:bg-surface-container-high transition-colors duration-200"
                      >
                        Settings
                      </Link>
                    </>
                  )}
                  {session.user.role === 'applie' && (
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-on-surface-variant rounded-full hover:bg-surface-container-high transition-colors duration-200"
                    >
                      My Applications
                    </Link>
                  )}
                </nav>
              </aside>
            )}

            <main className="flex-1 flex flex-col bg-surface">
              <Topbar /> {/* Assuming Topbar handles its own styling and responsiveness */}
              <div className="p-4 sm:p-6 md:p-8 flex-grow"> {/* Responsive padding for main content */}
                {children}
              </div>
              <div className="p-4 sm:p-6 md:p-8 flex justify-end">
                <ThemeToggle /> {/* Theme toggle button */}
              </div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}