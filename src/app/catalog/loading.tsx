import TopNavBar from "@/features/shared/components/TopNavBar";
import Footer from "@/features/shared/components/Footer";
import { ArrowLeft } from "lucide-react";

export default function CatalogLoading() {
    return (
        <div className="min-h-screen bg-background flex flex-col font-sans relative">
            <TopNavBar />

            <main className="flex-1 w-full pt-24 pb-12">
                <div className="w-full px-margin-desktop max-w-7xl mx-auto flex flex-col gap-space-sm mb-space-lg">
                    <div>
                        <div className="inline-flex items-center gap-2 text-primary/50 font-bold text-sm mb-4">
                            <ArrowLeft className="w-4 h-4" />
                            Volver a la tienda
                        </div>
                    </div>
                    <div className="h-10 bg-surface-container-high rounded w-48 animate-pulse"></div>
                    <div className="h-6 bg-surface-container-high rounded w-full max-w-3xl mt-2 animate-pulse"></div>
                </div>
                
                {/* Skeleton Grid */}
                <div className="w-full px-margin-desktop max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
                    {/* Filters Skeleton */}
                    <div className="w-full md:w-64 shrink-0 space-y-4">
                        <div className="h-8 bg-surface-container-high rounded w-full animate-pulse"></div>
                        <div className="h-40 bg-surface-container-high rounded w-full animate-pulse mt-4"></div>
                    </div>
                    {/* Products Skeleton */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col animate-pulse h-[350px]">
                                <div className="aspect-square bg-surface-container-high w-full"></div>
                                <div className="p-4 flex flex-col gap-3 flex-1">
                                    <div className="h-4 bg-surface-container-high rounded w-1/3"></div>
                                    <div className="h-5 bg-surface-container-high rounded w-3/4"></div>
                                    <div className="mt-auto h-8 bg-surface-container-high rounded w-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
