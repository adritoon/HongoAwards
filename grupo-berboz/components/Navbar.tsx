import React from 'react';
import Link from 'next/link';
// import Image from 'next/image'; // Lo usaremos pronto para el logo

export const Navbar = () => {
  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <div>
          <Link href="/" className="text-xl font-bold text-gray-800">
            {/* Aquí irá el logo de Berboz */}
            Grupo Berboz
          </Link>
        </div>

        {/* Links de Navegación (Ocultos en móvil, visibles en 'md' o más) */}
        <div className="hidden md:flex space-x-6">
          <Link href="/" className="text-gray-600 hover:text-blue-700">
            Inicio
          </Link>
          <Link href="/quienes-somos" className="text-gray-600 hover:text-blue-700">
            Quiénes Somos
          </Link>
          <Link href="/servicios" className="text-gray-600 hover:text-blue-700">
            Servicios
          </Link>
          <Link href="/contacto" className="text-gray-600 hover:text-blue-700">
            Contacto
          </Link>
        </div>

        {/* Botón CTA (Call to Action) */}
        <div>
          <Link
            href="/contacto"
            className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition duration-300"
          >
            Solicitar Cotización
          </Link>
        </div>
      </nav>
    </header>
  );
};