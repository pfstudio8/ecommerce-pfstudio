import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Toaster } from "sileo";
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

import { Suspense } from "react";
import PageTransitionBar from "@/components/PageTransitionBar";
import dynamic from "next/dynamic";

const PFChatbot = dynamic(() => import("@/components/PFChatbot"));
const AuthModal = dynamic(() => import("@/components/AuthModal"));

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark scroll-smooth bg-(--background) text-(--foreground)">
      <body className={`${montserrat.variable} antialiased min-h-screen bg-(--background) text-(--foreground)`}>
        <Toaster position="top-center" />
        <Suspense fallback={null}>
          <PageTransitionBar />
        </Suspense>
        <AuthListener />
        <AuthModal />
        {children}

        {/* Interactive Chatbot Assistant (Paula & Facundo) */}
        <PFChatbot />

        {/* Floating WhatsApp Button */}
        <FloatingWhatsApp />
        <Analytics />
      </body>
    </html>
  );
}
