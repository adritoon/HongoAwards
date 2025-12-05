import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

// Cargamos la fuente Inter (se ve muy bien para UI moderna)
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  // --- 1. URL BASE (CRÍTICO PARA REDES SOCIALES) ---
  // Reemplaza 'https://tu-proyecto.vercel.app' con tu dominio real de Vercel.
  // Si no lo pones, la imagen OpenGraph no cargará en Discord/Twitter.
  metadataBase: new URL('https://hongo-awards.vercel.app'), 

  // --- 2. INFORMACIÓN BÁSICA ---
  title: 'Hongo Awards 2025',
  description: 'La gala de premios más fúngica del año. Vota por tus favoritos.',

  // --- 3. OPEN GRAPH (CÓMO SE VE AL COMPARTIR) ---
  // Esto asegura que Twitter y WhatsApp usen la imagen generada
  openGraph: {
    title: 'Hongo Awards 2025',
    description: 'Entra y vota por los mejores clips, fails y momentos del año.',
    siteName: 'Hongo Awards',
    locale: 'es_ES',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // Forzamos la clase 'dark' y el fondo oscuro base para evitar flashbangs blancos al cargar
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-200 antialiased min-h-screen`}>
        {/* Aquí se renderizará tu nueva App (page.tsx) sin estorbos antiguos */}
        {children}
      </body>
    </html>
  )
}