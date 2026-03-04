import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Toaster } from "sileo";
import AuthModal from "@/components/AuthModal";
import AuthListener from "@/components/AuthListener";
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
        url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
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
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${montserrat.variable} antialiased min-h-screen bg-[var(--background)] text-[var(--foreground)]`}>
        <Toaster position="top-center" />
        <AuthListener />
        <AuthModal />
        {children}

        {/* Floating WhatsApp Button */}
        <a
          href="https://wa.me/5493704245651"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        >
          <svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
        </a>
        <Analytics />
      </body>
    </html>
  );
}
