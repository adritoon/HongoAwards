import React from 'react';
import Image from 'next/image'; // Importante para las imágenes

export const Team = () => {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-6 text-foreground">

        {/* Título de la Sección */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Conoce a Nuestro Equipo
          </h2>
          <p className="text-lg text-foreground/70 mt-2">
            Los profesionales detrás de nuestro compromiso.
          </p>
        </div>

        {/* Contenedor de Tarjetas (Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

          {/* Tarjeta 1: Frank Boza */}
          <div className="text-center">
            <Image
              src="/team/frank-boza.jpg" // Ruta desde la carpeta 'public'
              alt="Foto de Frank Boza"
              width={200}
              height={200}
              className="w-48 h-48 rounded-full mx-auto mb-4 object-cover bg-foreground/10"
            />
            <h3 className="text-xl font-semibold">Frank Boza</h3>
            <p className="text-foreground/70">Administrador</p>
          </div>

          {/* Tarjeta 2: Marycelia Berna */}
          <div className="text-center">
            <Image
              src="/team/marycelia-berna.jpg" // Ruta desde la carpeta 'public'
              alt="Foto de Marycelia Berna"
              width={200}
              height={200}
              className="w-48 h-48 rounded-full mx-auto mb-4 object-cover bg-foreground/10"
            />
            <h3 className="text-xl font-semibold">Marycelia Berna</h3>
            <p className="text-foreground/70">Gerente Comercial</p>
          </div>

          {/* Tarjeta 3: Luis Quispe */}
          <div className="text-center">
            <Image
              src="/team/luis-quispe.jpg" // Ruta desde la carpeta 'public'
              alt="Foto de Luis Quispe"
              width={200}
              height={200}
              className="w-48 h-48 rounded-full mx-auto mb-4 object-cover bg-foreground/10"
            />
            <h3 className="text-xl font-semibold">Luis Quispe</h3>
            <p className="text-foreground/70">Contador</p>
          </div>

          {/* Tarjeta 4: Dante Wong */}
          <div className="text-center">
            <Image
              src="/team/dante-wong.jpg" // Ruta desde la carpeta 'public'
              alt="Foto de Dante Wong"
              width={200}
              height={200}
              className="w-48 h-48 rounded-full mx-auto mb-4 object-cover bg-foreground/10"
            />
            <h3 className="text-xl font-semibold">Dante Wong</h3>
            <p className="text-foreground/70">Asesor Legal</p>
          </div>

        </div>
      </div>
    </section>
  );
};