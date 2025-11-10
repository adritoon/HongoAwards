import React from 'react';
import Link from 'next/link';

export const ServicesSummary = () => {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-6 text-foreground">
        
        {/* Título de la Sección */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Nuestros Servicios</h2>
          <p className="text-lg text-foreground/70 mt-2">
            Calidad, eficiencia y satisfacción en cada tarea.
          </p>
        </div>

        {/* Contenedor de Tarjetas (Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Tarjeta 1: Limpieza */}
          <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-8">
            {/* Aquí iría un ícono (ej: un plumero) */}
            <h3 className="text-2xl font-semibold mb-4">
              Limpieza Integral y Especializada
            </h3>
            <p className="text-foreground/70 mb-6">
              Mantenimiento de oficinas, condominios, locales comerciales,
              limpieza de vidrios en altura, desinfección y más.
            </p>
            <Link 
              href="/servicios#limpieza" 
              className="font-semibold text-blue-600 hover:text-blue-500"
            >
              Ver más →
            </Link>
          </div>

          {/* Tarjeta 2: Seguridad */}
          <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-8">
            {/* Aquí iría un ícono (ej: un escudo) */}
            <h3 className="text-2xl font-semibold mb-4">
              Seguridad y Vigilancia Privada
            </h3>
            <p className="text-foreground/70 mb-6">
              Vigilancia privada, control de accesos, resguardo de
              instalaciones y protección de bienes y personas.
            </p>
            <Link 
              href="/servicios#seguridad" 
              className="font-semibold text-blue-600 hover:text-blue-500"
            >
              Ver más →
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};