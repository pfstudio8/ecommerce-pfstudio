import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import AuthListener from "@/components/AuthListener";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PFSTUDIO - Indumentaria & Sublimación Premium",
  description: "Taller de estampado y sublimación integral. Remeras Boxy Fit, gorras, tazas y personalizados.",
  keywords: ["sublimacion", "boxy fit", "remeras", "indumentaria", "argentina", "diseño", "taller"],
  authors: [{ name: "PFSTUDIO" }],
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://pfstudio.com.ar",
    title: "PFSTUDIO - Indumentaria & Sublimación",
    description: "Taller de estampado y sublimación integral.",
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
    title: "PFSTUDIO - Indumentaria & Sublimación",
    description: "Taller de estampado y sublimación integral.",
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
    <html lang="es" className="light scroll-smooth bg-background text-on-surface">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} ${plusJakartaSans.variable} antialiased min-h-screen bg-background text-on-surface flex flex-col`}>
        <Toaster position="top-center" richColors />
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
