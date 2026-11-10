import { Suspense } from "react";
import PostPurchaseHandler from "@/components/PostPurchaseHandler";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

import TopNavBar from "@/features/shared/components/TopNavBar";
import LandingHero from "@/features/catalog/components/LandingHero";
import CollectionNavigator from "@/features/catalog/components/CollectionNavigator";
import FeaturedProducts from "@/features/catalog/components/FeaturedProducts";
import BeforeAfterSlider from "@/features/catalog/components/BeforeAfterSlider";
import ShoppableReels from "@/features/catalog/components/ShoppableReels";
import LookbookHotspots from "@/features/catalog/components/LookbookHotspots";
import ValueProps from "@/features/catalog/components/ValueProps";
import CustomWhatsAppCTA from "@/features/workshop/components/CustomWhatsAppCTA";
import CommunityReviews from "@/features/shared/components/CommunityReviews";
import Footer from "@/features/shared/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans relative selection:bg-primary selection:text-on-primary">
      <Suspense fallback={null}>
        <PostPurchaseHandler />
      </Suspense>
      
      <TopNavBar />

      <main className="flex-1 w-full -mt-16 sm:-mt-20">
        {/* 1. Hero Editorial Split */}
        <LandingHero />

        {/* 2. Collection Navigator (Píldoras redondeadas con fotos) */}
        <CollectionNavigator />

        {/* 3. Grilla de Productos Destacados (con Slide-Out Drawer) */}
        <FeaturedProducts />

        {/* 4. Slider Antes / Después (Boceto digital vs. Prenda real estampada) */}
        <BeforeAfterSlider />

        {/* 5. Shoppable Video Reels (Videos verticales 9:16) */}
        <ShoppableReels />

        {/* 6. Lookbook con Hotspots Interactivos ("Shop The Look" Wonder Theme) */}
        <LookbookHotspots />

        {/* 7. Value Props de Producción & Calidad de Hilado */}
        <ValueProps />

        {/* 8. Cotizador y Personalizador de Taller a Medida */}
        <div id="personalizados" className="scroll-mt-24">
          <CustomWhatsAppCTA />
        </div>

        {/* 9. Reviews y Prueba Social de Clientes Reales */}
        <CommunityReviews />
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
