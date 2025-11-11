import { Hero } from '@/components/Hero';
import { SocialProof } from '@/components/SocialProof';
import { ServicesSummary } from '@/components/ServicesSummary';
import { FadeIn } from '@/components/FadeIn';

export default function Home() {
  return (
    <>
      <Hero />
      
      {/* 2. ENVUELVE LA SECCIÓN DE PRUEBA SOCIAL */}
      <FadeIn>
        <SocialProof />
      </FadeIn>
      
      {/* 3. ENVUELVE LA SECCIÓN DE SERVICIOS */}
      <FadeIn delay={0.2}>
        <ServicesSummary />
      </FadeIn>
    </>
  );
}