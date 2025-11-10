import React from 'react';

export const SocialProof = () => {
  return (
    <section className="bg-background py-12 md:py-20">
      <div className="container mx-auto px-6 text-center">
        <h3 className="text-lg font-semibold text-foreground/70 mb-8">
          Empresas que confían en nosotros
        </h3>
        
        {/* Contenedor de Logos */}
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
          {/* NOTA: 
            Estos son 'placeholders'. 
            Necesitaremos los archivos .svg o .png reales de los logos.
            Los pondremos en la carpeta 'public/logos/'
          */}

          {/* Logo Placeholder 1 */}
          <div className="text-2xl font-bold text-foreground/50">
            {/* Reemplazar con: <Image src="/logos/westin.svg" ... /> */}
            WESTIN
          </div>

          {/* Logo Placeholder 2 */}
          <div className="text-2xl font-bold text-foreground/50">
            {/* Reemplazar con: <Image src="/logos/interbank.svg" ... /> */}
            [Logo Banco]
          </div>

          {/* Agrega más logos aquí si es necesario */}

        </div>
      </div>
    </section>
  );
};