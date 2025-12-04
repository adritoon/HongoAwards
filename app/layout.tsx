import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

// Cargamos la fuente Inter (se ve muy bien para UI moderna)
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Streamer Awards 2024',
  description: 'La gala de premios más épica del año. Vota por tus favoritos.',
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