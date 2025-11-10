import React from 'react';

export const MissionVision = () => {
  return (
    <section className="bg-foreground/5 py-16 md:py-24">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          
          {/* Columna 1: Misión */}
          <div className="text-foreground">
            <h2 className="text-3xl font-bold mb-4">
              Nuestra Misión
            </h2>
            <p className="text-lg text-foreground/70">
              Brindar servicios integrales de limpieza y vigilancia
              privada que garanticen la seguridad, higiene y
              confianza de nuestros clientes, mediante personal
              altamente capacitado, responsable y comprometido
              con la excelencia en cada tarea.
            </p>
          </div>

          {/* Columna 2: Visión */}
          <div className="text-foreground">
            <h2 className="text-3xl font-bold mb-4">
              Nuestra Visión
            </h2>
            <p className="text-lg text-foreground/70">
              Ser reconocidos a nivel nacional como una empresa
              líder en limpieza y seguridad, destacando por la
              calidad, confiabilidad e innovación de nuestros
              servicios, contribuyendo al bienestar y tranquilidad
              de la comunidad.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};