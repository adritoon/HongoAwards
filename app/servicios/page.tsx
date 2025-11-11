import React from 'react';
// 1. IMPORTA EL COMPONENTE DE ANIMACIÓN
import { FadeIn } from '@/components/FadeIn';

export default function ServiciosPage() {
  return (
    <div className="text-foreground bg-background">
      
      {/* 2. ENVUELVE LA SECCIÓN 1 */}
      <FadeIn>
        <section className="container mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Nuestros Servicios
          </h1>
          <p className="text-lg md:text-xl text-muted max-w-3xl mx-auto">
            Comprometidos con la calidad, la eficiencia y la
            satisfacción de nuestros clientes en cada tarea que realizamos.
          </p>
        </section>
      </FadeIn>

      {/* 3. ENVUELVE LA SECCIÓN 2 */}
      <FadeIn delay={0.1}>
        <section id="limpieza" className="bg-foreground/5 py-16 md:py-24">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold mb-8">
              Limpieza Integral y Especializada
            </h2>
            <ul className="list-disc list-inside space-y-2 text-lg text-muted">
              <li>
                Servicios de limpieza integral: Limpieza y
                mantenimiento de oficinas, instituciones, edificios,
                condominios, locales comerciales e industriales.
              </li>
              <li>
                Limpieza especializada: Lavado de alfombras,
                limpieza de vidrios en altura, desinfección de
                ambientes y tratamiento de pisos.
              </li>
              <li>
                Suministro de productos de limpieza: Proveemos
                materiales y equipos de alta calidad para un
                mantenimiento eficiente y sostenible.
              </li>
            </ul>
          </div>
        </section>
      </FadeIn>

      {/* 4. ENVUELVE LA SECCIÓN 3 */}
      <FadeIn delay={0.2}>
        <section id="seguridad" className="py-16 md:py-24">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold mb-8">
              Seguridad y Vigilancia Privada
            </h2>
            <ul className="list-disc list-inside space-y-2 text-lg text-muted">
              <li>
                Servicios de seguridad: Vigilancia privada, control
                de accesos, resguardo de instalaciones y
                protección de bienes y personas.
              </li>
              <li>
                Personal calificado: Contamos con personal
                capacitado, uniformado y supervisado
                constantemente para garantizar un servicio
                confiable.
              </li>
            </ul>
          </div>
        </section>
      </FadeIn>

    </div>
  );
}