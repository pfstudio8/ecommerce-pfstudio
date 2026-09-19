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
            <TopNavBar />

            <main className="flex-1 w-full pt-24 pb-12">
                <div className="w-full px-margin-desktop max-w-7xl mx-auto flex flex-col gap-space-sm mb-space-lg">
                    <div>
                        <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold text-sm mb-4 hover:opacity-80 transition-opacity">
                            <ArrowLeft className="w-4 h-4" />
                            Volver a la tienda
                        </Link>
                    </div>
                    <h1 className="text-display-lg font-display-lg text-on-surface">Catálogo</h1>
                    <p className="text-body-lg font-body-lg text-on-surface-variant max-w-3xl">
                        Descubrí todas nuestras opciones de indumentaria y accesorios. 
                        Stock disponible y envíos a todo el país.
                    </p>
                </div>
                
                <CatalogGrid />
            </main>

            <Footer />
            <FloatingWhatsApp />
        </div>
    );
}
