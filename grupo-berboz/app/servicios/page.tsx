import React from 'react';

export default function ServiciosPage() {
  return (
    <div className="text-foreground bg-background">
      
      {/* Sección 1: Título de la Página */}
      <section className="container mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Nuestros Servicios
        </h1>
        <p className="text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto">
          Comprometidos con la calidad, la eficiencia y la
          satisfacción de nuestros clientes en cada tarea que realizamos.
        </p>
      </section>

      {/* Sección 2: Servicios de Limpieza */}
      <section id="limpieza" className="bg-foreground/5 py-16 md:py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8">
            Limpieza Integral y Especializada
          </h2>
          <ul className="list-disc list-inside space-y-2 text-lg text-foreground/70">
            <li>
              Servicios de limpieza integral: Limpieza y
              mantenimiento de oficinas, instituciones, edificios,
              condominios, locales comerciales e industriales[cite: 52].
            </li>
            <li>
              Limpieza especializada: Lavado de alfombras,
              limpieza de vidrios en altura, desinfección de
              ambientes y tratamiento de pisos[cite: 53].
            </li>
            <li>
              Suministro de productos de limpieza: Proveemos
              materiales y equipos de alta calidad para un
              mantenimiento eficiente y sostenible[cite: 56].
            </li>
          </ul>
        </div>
      </section>

      {/* Sección 3: Servicios de Seguridad */}
      <section id="seguridad" className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8">
            Seguridad y Vigilancia Privada
          </h2>
          <ul className="list-disc list-inside space-y-2 text-lg text-foreground/70">
            <li>
              Servicios de seguridad: Vigilancia privada, control
              de accesos, resguardo de instalaciones y
              protección de bienes y personas[cite: 54].
            </li>
            <li>
              Personal calificado: Contamos con personal
              capacitado, uniformado y supervisado
              constantemente para garantizar un servicio
              confiable[cite: 55].
            </li>
          </ul>
        </div>
      </section>

    </div>
  );
}