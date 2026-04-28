import type { Metadata } from "next";
import "./globals.css";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: "POS Perú Digital | Sistemas POS y ERP para negocios en Perú",
  description: "Sistemas POS y ERP para negocios en Perú. Vende, controla tu caja, inventario y facturación electrónica desde un solo sistema.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
