import Hero from '@/components/Hero';
import Beneficios from '@/components/Beneficios';
import Productos from '@/components/Productos';
import ComoFunciona from '@/components/ComoFunciona';
import PruebaSocial from '@/components/PruebaSocial';
import Planes from '@/components/Planes';
import Contacto from '@/components/Contacto';

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <Hero />
      <Beneficios />
      <Productos />
      <ComoFunciona />
      <PruebaSocial />
      <Planes />
      <Contacto />
    </div>
  );
}
