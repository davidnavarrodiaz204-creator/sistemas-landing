import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: "FACTUSYS | Sistemas POS y ERP inteligentes para negocios en Perú",
  description: "FACTUSYS — Sistemas POS modernos para ferreterías, restaurantes y negocios peruanos. Controla ventas, inventario y facturación electrónica desde un solo lugar.",
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className="theme-day h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <Script
          id="factusys-theme"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: "try{var p=new URLSearchParams(location.search);var t=p.get('theme');var saved=localStorage.getItem('factusys-theme');if(t==='night'){localStorage.setItem('factusys-theme','night');document.documentElement.classList.remove('theme-day')}else if(t==='day'){localStorage.setItem('factusys-theme','day');document.documentElement.classList.add('theme-day')}else if(saved==='night'){document.documentElement.classList.remove('theme-day')}else{document.documentElement.classList.add('theme-day')}}catch(e){}",
          }}
        />
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
