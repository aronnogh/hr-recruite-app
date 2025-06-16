import { Montserrat } from "next/font/google";
import "./globals.css";

import AuthProvider from './context/AuthProvider';
import Navbar from './components/layout/Navbar';

const geistSans = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});


export const metadata = {
  title: 'AI Agent Platform',
  description: 'Full-stack AI application with 8 agents',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.className}bg-gray-900 text-gray-200`}>
        <AuthProvider>
          <Navbar />
          <main className="p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
