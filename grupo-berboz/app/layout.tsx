import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar'; // Esto ya estaba
import { Footer } from '@/components/Footer'; // 1. IMPORTA EL FOOTER

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Grupo Integrado Berboz E.I.R.L.',
  description: 'Soluciones integrales en limpieza y seguridad privada.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Navbar />

        {/* 'flex-grow' hace que el contenido principal ocupe el espacio sobrante */}
        <main className="flex-grow">
          {children}
        </main>
        
        <Footer />
      </body>
    </html>
  );
}