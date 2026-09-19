
import { Suspense } from "react";
import PostPurchaseHandler from "@/components/PostPurchaseHandler";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

// New Vertical Slicing Components (Artisan Production Studio Theme)
import TopNavBar from "@/features/shared/components/TopNavBar";
import LandingHero from "@/features/catalog/components/LandingHero";
import ValueProps from "@/features/catalog/components/ValueProps";
import CategoryExplore from "@/features/catalog/components/CategoryExplore";
import FeaturedProducts from "@/features/catalog/components/FeaturedProducts";
import CustomStudio from "@/features/workshop/components/CustomStudio";
import CommunityReviews from "@/features/shared/components/CommunityReviews";
import Footer from "@/features/shared/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans relative selection:bg-primary selection:text-on-primary">
      <Suspense fallback={null}>
        <PostPurchaseHandler />
      </Suspense>
      
      <TopNavBar />

      <main className="flex-1 w-full">
        <LandingHero />
        <ValueProps />
        <CategoryExplore />
        <FeaturedProducts />
        <div id="personalizador" className="scroll-mt-24">
          <CustomStudio />
        </div>
        <CommunityReviews />
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
