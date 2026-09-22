import TopNavBar from "@/features/shared/components/TopNavBar";
import Footer from "@/features/shared/components/Footer";

export default function ProductLoading() {
    return (
        <div className="min-h-screen flex flex-col bg-background font-sans">
            <TopNavBar />
            
            <main className="flex-1 w-full pt-16 md:pt-24 pb-12">
                <div className="w-full px-margin-desktop max-w-7xl mx-auto">
                    {/* Back link skeleton */}
                    <div className="h-4 bg-surface-container-high rounded w-32 mb-8 animate-pulse"></div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                        {/* Images Skeleton */}
                        <div className="space-y-4">
                            <div className="aspect-4/5 w-full bg-surface-container-high rounded-3xl animate-pulse"></div>
                            <div className="flex gap-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="w-20 h-20 bg-surface-container-high rounded-xl animate-pulse shrink-0"></div>
                                ))}
                            </div>
                        </div>

                        {/* Product Info Skeleton */}
                        <div className="flex flex-col gap-6 pt-4 lg:pt-0">
                            <div className="space-y-4">
                                <div className="h-4 bg-surface-container-high rounded w-24 animate-pulse"></div>
                                <div className="h-10 bg-surface-container-high rounded w-3/4 animate-pulse"></div>
                                <div className="h-8 bg-surface-container-high rounded w-1/3 animate-pulse mt-4"></div>
                            </div>
                            
                            <div className="h-px w-full bg-outline-variant/30 my-2"></div>
                            
                            <div className="space-y-4">
                                <div className="h-4 bg-surface-container-high rounded w-20 animate-pulse"></div>
                                <div className="flex gap-3">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className="w-12 h-12 bg-surface-container-high rounded-xl animate-pulse"></div>
                                    ))}
                                </div>
                            </div>

                            <div className="h-14 bg-surface-container-high rounded-xl w-full animate-pulse mt-8"></div>
                            <div className="h-32 bg-surface-container-high rounded-xl w-full animate-pulse mt-4"></div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
