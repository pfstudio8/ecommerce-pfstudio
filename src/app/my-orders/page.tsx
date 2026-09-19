"use client";
import { PackageSearch, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function MisPedidosPage() {
    return (
        <div className="min-h-screen bg-(--background) pt-32 pb-24 px-4 flex items-center justify-center">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="w-20 h-20 bg-surface-container rounded-3xl mx-auto flex items-center justify-center border border-outline-variant">
                    <PackageSearch className="w-10 h-10 text-tertiary" />
                </div>
                
                <div>
                    <h1 className="text-2xl font-black text-on-surface mb-2">Historial de Pedidos</h1>
                    <p className="text-outline">
                        El historial completo de pedidos estará disponible próximamente. Por ahora, puedes rastrear el estado de cualquier pedido individual desde la página principal.
                    </p>
                </div>

                <div className="pt-4">
                    <Link
                        href="/?track=true"
                        className="inline-flex items-center justify-center w-full py-4 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary/90 transition-colors gap-2"
                    >
                        Rastrear mi pedido <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
