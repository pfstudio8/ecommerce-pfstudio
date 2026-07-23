"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CategoryQuickLinks from "@/components/CategoryQuickLinks";
import ProductGridWrapper from "@/components/ProductGrid";
import CustomShirtModule from "@/components/CustomShirtModule";
import HomeReviewsShowcase from "@/components/HomeReviewsShowcase";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import PostPurchaseHandler from "@/components/PostPurchaseHandler";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col font-sans relative selection:bg-[var(--color-main)] selection:text-white">
      <Preloader />
      <Suspense fallback={null}>
        <PostPurchaseHandler />
      </Suspense>
      <Navbar />

      <main className="flex-1">
        <Hero />
        <CategoryQuickLinks />
        <ProductGridWrapper />
        <div id="personalizador" className="scroll-mt-24">
          <CustomShirtModule />
        </div>
        <HomeReviewsShowcase />
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}



