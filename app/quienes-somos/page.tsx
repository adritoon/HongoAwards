import React from 'react';
import { MissionVision } from '@/components/MissionVision';
import { Team } from '@/components/Team';
// 1. IMPORTA EL COMPONENTE DE ANIMACIÓN
import { FadeIn } from '@/components/FadeIn';

export default function QuienesSomosPage() {
  return (
    <div className="text-foreground">
      
      {/* 2. ENVUELVE LA SECCIÓN 1 */}
      <FadeIn>
        <section className="container mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Quiénes Somos
          </h1>
          <p className="text-lg md:text-xl text-muted max-w-3xl mx-auto">
            En GRUPO INTEGRADO BERBOZ E.I.R.L. brindamos
            soluciones integrales en limpieza y seguridad privada,
            asegurando ambientes limpios, ordenados y
            protegidos. Nuestro compromiso es con la calidad, confianza y
            bienestar de cada cliente.
          </p>
        </section>
      </FadeIn>

      {/* 3. ENVUELVE LA SECCIÓN 2 (con un leve retraso) */}
      <FadeIn delay={0.1}>
        <MissionVision />
      </FadeIn>
      
      {/* 4. ENVUELVE LA SECCIÓN 3 (con más retraso) */}
      <FadeIn delay={0.2}>
        <Team />
      </FadeIn>
      
    </div>
  );
}