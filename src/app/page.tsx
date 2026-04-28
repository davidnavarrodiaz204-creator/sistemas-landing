import Hero from '@/components/Hero';
import Beneficios from '@/components/Beneficios';
import Productos from '@/components/Productos';
import Planes from '@/components/Planes';
import Contacto from '@/components/Contacto';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Beneficios />
      <Productos />
      <Planes />
      <Contacto />
    </div>
  );
}
