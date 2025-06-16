// app/layout.js
import "./globals.css";
import { Montserrat } from "next/font/google";
import Providers from "@/components/Providers";
import Topbar from "@/components/Topbar";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata = {
  title: "Next.js Auth & Sessions",
  description: "A demo application for Next.js, NextAuth, MongoDB, and Supabase",
};

export default function RootLayout({ children }) {
  return (
    // Enforce dark mode with className="dark"
    <html lang="en" className="dark">
      <body className={`${montserrat.className} bg-gray-900 text-gray-100`}>
        <Providers>
          <div className="flex min-h-screen">
            {/* You can replace Topbar with a Sidebar if you prefer */}
            <aside className="w-64 bg-gray-800 p-4 hidden md:block">
               <h2 className="text-xl font-bold text-white">Sidebar</h2>
               {/* Sidebar content here */}
            </aside>
            <main className="flex-1 flex flex-col">
              <Topbar />
              <div className="p-8">{children}</div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}