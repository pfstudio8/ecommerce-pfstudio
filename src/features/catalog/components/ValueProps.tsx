"use client";

import { Truck, Droplets, Scissors } from "lucide-react";
import { motion } from "framer-motion";

export default function ValueProps() {
    return (
        <section className="py-10 bg-surface overflow-hidden">
            <div className="w-full px-margin md:px-gutter-desktop max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 sm:divide-x sm:divide-outline-variant/50">
                    <motion.div 
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="flex items-center gap-4 sm:px-6 sm:first:pl-0 sm:last:pr-0"
                    >
                        <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Truck className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-on-surface">Producción rápida 24-48 hs</h4>
                            <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                                Confeccionamos y despachamos con agilidad.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="flex items-center gap-4 sm:px-6 sm:first:pl-0 sm:last:pr-0"
                    >
                        <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Droplets className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-on-surface">Sublimación HD inalterable</h4>
                            <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                                Tintas de alta fijación que no se decoloran.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="flex items-center gap-4 sm:px-6 sm:first:pl-0 sm:last:pr-0"
                    >
                        <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Scissors className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-on-surface">Calces Boxy Fit & Oversize</h4>
                            <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                                Moldería urbana en algodón 24/1 peinado.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
