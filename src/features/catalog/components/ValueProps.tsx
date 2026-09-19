"use client";

export default function ValueProps() {
    return (
        <section className="border-b border-outline-variant bg-surface-container-lowest py-space-lg">
            <div className="w-full px-margin-desktop max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
                    <div className="flex items-start gap-space-sm p-space-md rounded-lg bg-surface-container-low border border-outline-variant/60">
                        <div className="p-2 bg-surface-container-lowest text-primary rounded-lg border border-outline-variant shadow-sm">
                            <span className="material-symbols-outlined text-headline-md">local_shipping</span>
                        </div>
                        <div>
                            <h4 className="text-headline-sm font-headline-sm text-on-surface">Producción Express 24-48hs</h4>
                            <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">Despachamos pedidos minoristas y muestras con máxima celeridad.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-space-sm p-space-md rounded-lg bg-surface-container-low border border-outline-variant/60">
                        <div className="p-2 bg-surface-container-lowest text-primary rounded-lg border border-outline-variant shadow-sm">
                            <span className="material-symbols-outlined text-headline-md">water_drop</span>
                        </div>
                        <div>
                            <h4 className="text-headline-sm font-headline-sm text-on-surface">Sublimación HD Inalterable</h4>
                            <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">Tintas pigmentadas térmicas que no se agrietan ni decoloran con lavados.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-space-sm p-space-md rounded-lg bg-surface-container-low border border-outline-variant/60">
                        <div className="p-2 bg-surface-container-lowest text-primary rounded-lg border border-outline-variant shadow-sm">
                            <span className="material-symbols-outlined text-headline-md">apparel</span>
                        </div>
                        <div>
                            <h4 className="text-headline-sm font-headline-sm text-on-surface">Boxy Fit & Oversize</h4>
                            <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">Patronajes urbanos modernos pensados para marcas y colecciones.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
