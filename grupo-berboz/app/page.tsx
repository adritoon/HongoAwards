import { Hero } from '@/components/Hero';
import { SocialProof } from '@/components/SocialProof';
// 1. Importa el nuevo componente
import { ServicesSummary } from '@/components/ServicesSummary';

export default function Home() {
  return (
    <>
      <Hero />
      <SocialProof />
      
      {/* 2. Usa el nuevo componente */}
      <ServicesSummary />
      
      {/* La página de inicio está completa */}
    </>
  );
}