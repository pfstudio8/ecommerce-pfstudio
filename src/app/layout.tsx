import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Toaster } from "sileo";
import AuthModal from "@/components/AuthModal";
import AuthListener from "@/components/AuthListener";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PFSTUDIO - Indumentaria Premium",
  description: "Descubre nuestra nueva colección. Prendas Oversize, Boxy Fit y Clásicas con la mejor calidad y diseño. Envíos a todo el país.",
  keywords: ["ropa", "oversize", "boxy fit", "remeras", "indumentaria", "argentina", "diseño"],
  authors: [{ name: "PFSTUDIO" }],
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://pfstudio.com.ar", // Placeholder URL
    title: "PFSTUDIO - Indumentaria Premium",
    description: "Descubre nuestra nueva colección. Prendas Oversize, Boxy Fit y Clásicas con la mejor calidad y diseño.",
    siteName: "PFSTUDIO",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PFSTUDIO Cover",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PFSTUDIO - Indumentaria Premium",
    description: "Descubre nuestra nueva colección. Prendas Oversize, Boxy Fit y Clásicas con la mejor calidad y diseño.",
    images: ["/og-image.png"],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark scroll-smooth bg-[var(--background)] text-[var(--foreground)]">
      <body className={`${montserrat.variable} antialiased min-h-screen bg-[var(--background)] text-[var(--foreground)]`}>
        <Toaster position="top-center" />
        <AuthListener />
        <AuthModal />
        {children}

        {/* Floating WhatsApp Button */}
        <FloatingWhatsApp />
        <Analytics />
      </body>
    </html>
  );
}
