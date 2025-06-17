// app/layout.js
import "./globals.css";
import { Montserrat } from "next/font/google";
import Providers from "@/components/Providers";
import Topbar from "@/components/Topbar";
import { getServerSession } from "next-auth"; // <-- Import
import { authOptions } from "./api/auth/[...nextauth]/route"; // <-- Import
import Link from 'next/link'; // <-- Import

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata = {
  title: "Next.js Auth & Sessions",
  description: "A demo application for Next.js, NextAuth, MongoDB, and Supabase",
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="dark">
      <body className={`${montserrat.className} bg-gray-900 text-gray-100`}>
        <Providers>
          <div className="flex min-h-screen">
            {/* --- FUNCTIONAL SIDEBAR --- */}
            {session && (
              <aside className="w-64 bg-gray-800 p-4 hidden md:block border-r border-gray-700">
                <h2 className="text-xl font-bold text-white mb-6">Navigation</h2>
                <nav className="space-y-4">
                  {session.user.role === 'hr' && (
                    <>
                      <Link href="/hr/dashboard" className="flex items-center p-2 text-gray-300 rounded-lg hover:bg-gray-700">Dashboard</Link>
                      <Link href="/hr/settings" className="flex items-center p-2 text-gray-300 rounded-lg hover:bg-gray-700">Settings</Link>
                    </>
                  )}
                  {session.user.role === 'applie' && (
                    <Link href="/dashboard" className="flex items-center p-2 text-gray-300 rounded-lg hover:bg-gray-700">My Applications</Link>
                  )}
                </nav>
              </aside>
            )}
            
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