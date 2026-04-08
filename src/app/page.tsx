"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductGridWrapper from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import CustomShirtModule from "@/components/CustomShirtModule";
import PostPurchaseHandler from "@/components/PostPurchaseHandler";
import AestheticBanner from "@/components/AestheticBanner";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col font-sans">
      <Preloader />
      <Suspense fallback={null}>
        <PostPurchaseHandler />
      </Suspense>
      <Navbar />

      <main className="flex-1">
        <Hero />
        <ProductGridWrapper />
        <CustomShirtModule />
        <AestheticBanner />
      </main>

      <Footer />
    </div>
  );
}
