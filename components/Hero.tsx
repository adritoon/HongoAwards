import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const Hero = () => {
  return (
    <section className="relative w-full h-[60vh] min-h-[400px] flex items-center justify-center text-center text-white">
      {/* Fondo con Imagen */}
      <Image
        src="/images/hero-background.jpeg"
        alt="Oficina limpia y segura"
        layout="fill"
        objectFit="cover"
        quality={80}
        className="z-0"
      />

      {/* Filtro oscuro (para que el texto se lea) */}
      <div className="absolute inset-0 bg-black opacity-60 z-10"></div>
      {/* Contenido */}
      <div className="relative z-20 p-6">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Soluciones Integrales en Limpieza y Seguridad
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          Garantizamos ambientes limpios, ordenados y protegidos con la calidad y confianza que su empresa merece.
        </p>
        
        {/* Botones CTA (Call to Action) */}
        <div className="space-x-4">
          <Link
            href="/contacto"
            className="bg-brand text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-brand-hover transition duration-300"
          >
            Solicitar Cotización
          </Link>
          <Link
            href="/servicios"
            className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-white hover:text-gray-900 transition duration-300"
          >
            Ver Servicios
          </Link>
        </div>
      </div>
    </section>
  );
};