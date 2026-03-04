"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import CustomShirtModule from "@/components/CustomShirtModule";
import PostPurchaseHandler from "@/components/PostPurchaseHandler";
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
        <ProductGrid />
        <CustomShirtModule />
      </main>

      <Footer />
    </div>
  );
}
