import Hero from '@/components/Hero';
import Beneficios from '@/components/Beneficios';
import Productos from '@/components/Productos';
import SistemaShowcase from '@/components/SistemaShowcase';
import CasosRubros from '@/components/CasosRubros';
import ComoFunciona from '@/components/ComoFunciona';
import PruebaSocial from '@/components/PruebaSocial';
import SistemaAccion from '@/components/SistemaAccion';
import Planes from '@/components/Planes';
import FAQ from '@/components/FAQ';
import Contacto from '@/components/Contacto';
import WhatsAppFloat from '@/components/WhatsAppFloat';

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <Hero />
      <Beneficios />
      <Productos />
      <SistemaShowcase />
      <CasosRubros />
      <ComoFunciona />
      <PruebaSocial />
      <SistemaAccion />
      <Planes />
      <FAQ />
      <Contacto />
      <WhatsAppFloat />
    </div>
  );
}
