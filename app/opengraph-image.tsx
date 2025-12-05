import { ImageResponse } from 'next/og';

// Configuración de la imagen (Estándar de Twitter/Discord)
export const runtime = 'edge';
export const alt = 'Hongo Awards 2025 - Vota por tus favoritos';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#020617', // Slate-950
          backgroundImage: 'radial-gradient(circle at 50% 50%, #3b0764 0%, #020617 100%)', // Toque morado oscuro sutil
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Grid Pattern de fondo (Simulado con CSS) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(rgba(236, 72, 153, 0.2) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            opacity: 0.3,
          }}
        />

        {/* Badge de Edición */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 24px',
            borderRadius: '50px',
            border: '1px solid rgba(236, 72, 153, 0.5)',
            backgroundColor: 'rgba(236, 72, 153, 0.1)',
            color: '#fbcfe8', // Pink-200
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: '0.2em',
            marginBottom: 40,
            textTransform: 'uppercase',
          }}
        >
          ✨ Edición 2025 ✨
        </div>

        {/* Título con Efecto Glitch (Simulado con capas) */}
        <div style={{ position: 'relative', display: 'flex' }}>
          {/* Capa Sombra Rosa (Desplazada) */}
          <div
            style={{
              fontSize: 130,
              fontWeight: 900,
              fontStyle: 'italic',
              color: '#db2777', // Pink-600
              position: 'absolute',
              top: 0,
              left: -4,
              opacity: 0.8,
              letterSpacing: '-0.05em',
            }}
          >
            HONGO AWARDS
          </div>
          
          {/* Capa Sombra Azul (Desplazada) */}
          <div
            style={{
              fontSize: 130,
              fontWeight: 900,
              fontStyle: 'italic',
              color: '#0284c7', // Sky-600
              position: 'absolute',
              top: 0,
              left: 4,
              opacity: 0.8,
              letterSpacing: '-0.05em',
            }}
          >
            HONGO AWARDS
          </div>

          {/* Capa Principal Blanca */}
          <div
            style={{
              fontSize: 130,
              fontWeight: 900,
              fontStyle: 'italic',
              color: 'white',
              letterSpacing: '-0.05em',
              zIndex: 10,
            }}
          >
            HONGO AWARDS
          </div>
        </div>

        {/* Subtítulo */}
        <div
          style={{
            fontSize: 32,
            color: '#cbd5e1', // Slate-300
            marginTop: 20,
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.4,
          }}
        >
          Celebramos lo mejor, lo peor y lo más cringe del año.
        </div>

        {/* Botón Simulado */}
        <div
          style={{
            marginTop: 50,
            backgroundColor: '#ec4899', // Pink-500
            color: 'white',
            padding: '16px 48px',
            borderRadius: '20px',
            fontSize: 28,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 0 40px rgba(236, 72, 153, 0.6)',
          }}
        >
          VOTA AHORA ➜
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}