import React from 'react';
import { MissionVision } from '@/components/MissionVision';
// 1. Importa el nuevo componente
import { Team } from '@/components/Team'; 

export default function QuienesSomosPage() {
  return (
    <div className="text-foreground">
      
      {/* Sección 1: "Quiénes Somos" */}
      <section className="container mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Quiénes Somos
        </h1>
        <p className="text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto">
          En GRUPO INTEGRADO BERBOZ E.I.R.L. brindamos
          soluciones integrales en limpieza y seguridad privada...
        </p>
      </section>

      {/* Sección 2: Misión y Visión */}
      <MissionVision />
      
      {/* 2. Usa el nuevo componente */}
      <Team />
      
    </div>
  );
}