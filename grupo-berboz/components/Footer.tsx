import React from 'react';
import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-16">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between">
          
          {/* Columna 1: Logo y Descripción */}
          <div className="md:w-1/3 mb-6 md:mb-0">
            <h3 className="text-2xl font-bold text-white mb-2">Grupo Berboz</h3>
            <p className="text-sm">
              Soluciones integrales en limpieza y seguridad privada.
            </p>
          </div>

          {/* Columna 2: Links Rápidos */}
          <div className="md:w-1/3 mb-6 md:mb-0">
            <h4 className="text-lg font-semibold text-white mb-3">Navegación</h4>
            
            {/* // <-- CORREGIDO: Añadido 'list-none' para quitar los puntos */}
            <ul className="space-y-2 list-none">
              <li>
                {/* // <-- CORREGIDO: Añadido 'text-gray-300' como color base */}
                <Link href="/" className="text-gray-300 hover:text-white">Inicio</Link>
              </li>
              <li>
                <Link href="/quienes-somos" className="text-gray-300 hover:text-white">Quiénes Somos</Link>
              </li>
              <li>
                <Link href="/servicios" className="text-gray-300 hover:text-white">Servicios</Link>
              </li>
              <li>
                <Link href="/contacto" className="text-gray-300 hover:text-white">Contacto</Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Contacto */}
          <div className="md:w-1/3">
            <h4 className="text-lg font-semibold text-white mb-3">Comunícate</h4>
            
            {/* // <-- CORREGIDO: Añadido 'list-none' para quitar los puntos */}
            <ul className="space-y-2 list-none">
              <li className="text-sm">Correo: grupointegradoberbozeirl@gmail.com</li>
              <li className="text-sm">Tel: (51) 934339277</li>
              <li className="text-sm">Tel: (51) 993718535</li>
              <li className="text-sm">Redes: Grupo Integrado Berboz</li>
            </ul>
          </div>

        </div>

        {/* Línea divisoria y Copyright */}
        <hr className="border-gray-700 my-6" />
        <div className="text-center text-sm">
          © {new Date().getFullYear()} Grupo Integrado Berboz E.I.R.L. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};