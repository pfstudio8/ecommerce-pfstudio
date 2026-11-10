import AnnouncementBar from "@/features/shared/components/AnnouncementBar";
import TopNavBar from "@/features/shared/components/TopNavBar";
import Footer from "@/features/shared/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import CatalogGrid from "@/features/catalog/components/CatalogGrid";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Catálogo | PFSTUDIO",
  description: "Explora nuestro catálogo completo de indumentaria y sublimación premium.",
};

export default function CatalogoPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col font-sans relative selection:bg-primary selection:text-on-primary">
            <AnnouncementBar />
            <TopNavBar />

            <main className="flex-1 w-full pt-10 pb-16">
                <div className="w-full px-margin md:px-gutter-desktop max-w-7xl mx-auto flex flex-col gap-2 mb-8">
                    <div>
                        <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold text-sm mb-3 hover:opacity-80 transition-opacity">
                            <ArrowLeft className="w-4 h-4" />
                            Volver a la tienda
                        </Link>
                    </div>
                    <span className="eyebrow">Catálogo Completo</span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight">Todas las prendas e insumos</h1>
                    <p className="text-sm text-on-surface-variant max-w-2xl">
                        Descubrí todas nuestras opciones de indumentaria y accesorios. Stock disponible y envíos a todo el país.
                    </p>
                </div>
                
                <CatalogGrid />
            </main>

            <Footer />
            <FloatingWhatsApp />
        </div>
    );
}
