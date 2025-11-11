import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar'; // Esto ya estaba
import { Footer } from '@/components/Footer'; // 1. IMPORTA EL FOOTER
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

const siteUrl = 'https://grupoberboz.vercel.app/';

export const metadata: Metadata = {
  title: {
    default: 'Grupo Integrado Berboz E.I.R.L. | Limpieza y Seguridad',
    template: '%s | Grupo Berboz',
  },
  description: 'Soluciones integrales en limpieza y seguridad privada. Aseguramos ambientes limpios, ordenados y protegidos con calidad y confianza.',

  openGraph: {
    title: 'Grupo Integrado Berboz E.I.R.L.',
    description: 'Soluciones integrales en limpieza y seguridad privada.',
    url: siteUrl,
    siteName: 'Grupo Berboz',
    images: [
      {
        url: `${siteUrl}/og-image.png`, // La imagen que creaste
        width: 1200,
        height: 630,
        alt: 'Logo de Grupo Integrado Berboz',
      },
    ],
    locale: 'es_PE',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: { // Para que se vea bien en Twitter
    card: 'summary_large_image',
    title: 'Grupo Integrado Berboz E.I.R.L.',
    description: 'Soluciones integrales en limpieza y seguridad privada.',
    images: [`${siteUrl}/og-image.png`],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // --- DATOS DEL NEGOCIO PARA GOOGLE ---
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Grupo Integrado Berboz E.I.R.L.',
    description: 'Soluciones integrales en limpieza y seguridad privada.',
    telephone: '+51934339277',
    email: 'grupointegradoberbozeirl@gmail.com',
    image: `${siteUrl}/og-image.png`,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'PE',
      // (Añade más datos si tu primo te los da)
      // addressLocality: 'Lima',
      // postalCode: 'LIMA 39',
      // streetAddress: 'Av. Las Palmeras 123'
    },
    url: siteUrl,
  };

  return (
    <html lang="es">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navbar />

        <main className="flex-grow">{children}</main>

        {/* 'flex-grow' hace que el contenido principal ocupe el espacio sobrante */}

        
        <Footer />
        <Link
          href="https://wa.me/51991319975" // <-- USA EL NÚMERO DE TU PRIMO
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 hover:scale-110 transition-all duration-300 z-50"
          aria-label="Contactar por WhatsApp"
        >
          <MessageCircle size={28} />
        </Link>
      </body>
    </html>
  );
}