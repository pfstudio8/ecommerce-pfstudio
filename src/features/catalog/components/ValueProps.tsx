"use client";

import { Truck, Droplets, Scissors } from "lucide-react";

export default function ValueProps() {
    return (
        <section className="border-b border-outline-variant bg-surface py-10">
            <div className="w-full px-margin-desktop max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-start gap-4 p-5 rounded-2xl bg-surface-container-low border border-outline-variant/60">
                        <div className="p-2.5 bg-surface-container-highest text-primary rounded-xl shrink-0">
                            <Truck className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-on-surface">Producción Rápida 24-48 hs</h4>
                            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                                Confeccionamos y despachamos pedidos minoristas con la mayor agilidad del mercado.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-5 rounded-2xl bg-surface-container-low border border-outline-variant/60">
                        <div className="p-2.5 bg-surface-container-highest text-primary rounded-xl shrink-0">
                            <Droplets className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-on-surface">Sublimación HD Inalterable</h4>
                            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                                Tintas térmicas de alta fijación que no se resquebrajan ni decoloran con los lavados.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-5 rounded-2xl bg-surface-container-low border border-outline-variant/60">
                        <div className="p-2.5 bg-surface-container-highest text-primary rounded-xl shrink-0">
                            <Scissors className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-on-surface">Calces Boxy Fit & Oversize</h4>
                            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                                Moldería urbana moderna y algodón 24/1 pensado para colecciones streetwear reales.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
