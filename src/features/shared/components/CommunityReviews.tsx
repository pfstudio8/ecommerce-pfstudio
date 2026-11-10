"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Star, MessageSquarePlus, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";

const FEATURED_REVIEWS = [
    {
        id: "1",
        author: "Facundo M.",
        role: "Cliente verificado",
        product: "Remera Boxy Fit Negro",
        rating: 5,
        comment: "La calidad del algodón 24/1 es tremenda. El corte queda estructurado tal como se ve en las fotos y la estampa no se siente plástica ni pesada."
    },
    {
        id: "2",
        author: "Lucas R.",
        role: "Pedido personalizado mayorista",
        product: "Remeras Oversize con logo",
        rating: 5,
        comment: "Pedimos 25 remeras para el staff de nuestra marca. Coordinamos todo por WhatsApp en 10 minutos y en 48 hs ya las teníamos en mano. Diez puntos."
    },
    {
        id: "3",
        author: "Camila S.",
        role: "Cliente verificada",
        product: "Taza Mágica + Llavero",
        rating: 5,
        comment: "Compré para regalo de cumpleaños y le encantó el efecto de la taza cuando le ponés agua caliente. Súper bien embalado y entrega rápida."
    }
];

export default function CommunityReviews() {
    const [rating, setRating] = useState(5);
    const [name, setName] = useState("");
    const [review, setReview] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { error } = await supabase.from('messages').insert({
                user_name: name,
                user_email: "Comunidad/Reseña",
                content: `[RESEÑA DE COMUNIDAD - ${rating} ESTRELLAS]\n\n${review}`,
                status: 'unread'
            });

            if (error) throw error;

            toast.success("¡Gracias por tu opinión! Tu reseña ha sido enviada con éxito.");
            setName("");
            setReview("");
            setRating(5);
            setIsFormOpen(false);
        } catch (error) {
            console.error("Error submitting review to messages:", error);
            toast.error("Ocurrió un error al enviar tu reseña. Por favor intenta de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="comunidad" className="py-16 md:py-24 bg-surface scroll-mt-20 overflow-hidden">
            <div className="w-full px-margin md:px-gutter-desktop max-w-7xl mx-auto flex flex-col gap-10">
                {/* Encabezado */}
                <motion.div 
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
                >
                    <div className="flex flex-col gap-1.5">
                        <span className="eyebrow">Opiniones Reales</span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">Comunidad PFSTUDIO</h2>
                        <p className="text-sm text-on-surface-variant">
                            Lo que dicen quienes ya visten y usan nuestras producciones.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsFormOpen(!isFormOpen)}
                        className="inline-flex items-center gap-2 self-start sm:self-auto px-5 py-2.5 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high text-sm font-bold transition-colors"
                    >
                        <MessageSquarePlus className="w-4 h-4 text-primary" />
                        <span>{isFormOpen ? "Cerrar formulario" : "Dejar mi opinión"}</span>
                        {isFormOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                </motion.div>

                {/* Formulario colapsable */}
                {isFormOpen && (
                    <div className="bg-surface-container-low rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto w-full">
                        <h3 className="text-base font-bold text-on-surface mb-1">Compartí tu experiencia</h3>
                        <p className="text-xs text-on-surface-variant mb-5">Contanos qué te pareció el calce, la tela o la estampa de tu pedido.</p>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-bold text-on-surface-variant block mb-1.5">Tu Nombre</label>
                                <input 
                                    required 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                    type="text" 
                                    placeholder="Ej: Martín G." 
                                    className="w-full px-4 py-2.5 bg-surface-container-lowest rounded-xl text-sm focus:ring-2 focus:ring-primary/30 outline-none transition-shadow text-on-surface" 
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-on-surface-variant block mb-1.5">Puntuación</label>
                                <div className="flex items-center gap-1 py-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            type="button"
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className="p-1 hover:scale-110 transition-transform"
                                        >
                                            <Star 
                                                className={`w-5 h-5 ${star <= rating ? 'text-[#eab308] fill-[#eab308]' : 'text-outline-variant'}`} 
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-on-surface-variant block mb-1.5">Reseña</label>
                                <textarea 
                                    required 
                                    value={review} 
                                    onChange={e => setReview(e.target.value)} 
                                    rows={3} 
                                    placeholder="¿Qué te pareció la calidad y el servicio?" 
                                    className="w-full px-4 py-2.5 bg-surface-container-lowest rounded-xl text-sm focus:ring-2 focus:ring-primary/30 outline-none transition-shadow text-on-surface resize-none"
                                />
                            </div>

                            <button 
                                disabled={isSubmitting} 
                                type="submit" 
                                className="mt-1 py-3 px-6 bg-primary text-on-primary font-bold text-sm rounded-full hover:bg-primary-container transition-colors disabled:opacity-50 self-end"
                            >
                                {isSubmitting ? "Enviando..." : "Publicar Reseña"}
                            </button>
                        </form>
                    </div>
                )}

                {/* Tarjetas de testimonios */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {FEATURED_REVIEWS.map((rev, idx) => {
                        const initialX = idx === 0 ? -40 : idx === 2 ? 40 : 0;
                        const initialY = idx === 1 ? 30 : 15;
                        return (
                            <motion.div 
                                key={rev.id} 
                                initial={{ opacity: 0, x: initialX, y: initialY }}
                                whileInView={{ opacity: 1, x: 0, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.65, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
                                className="bg-surface-container-lowest rounded-2xl p-6 flex flex-col justify-between shadow-soft border border-outline-variant/30"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center gap-1 text-[#eab308]">
                                        {[...Array(rev.rating)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-current" />
                                        ))}
                                    </div>
                                    <p className="text-sm text-on-surface leading-relaxed">
                                        &ldquo;{rev.comment}&rdquo;
                                    </p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-outline-variant/40 flex items-center justify-between">
                                    <div>
                                        <h4 className="text-xs font-bold text-on-surface">{rev.author}</h4>
                                        <p className="text-[11px] text-outline">{rev.product}</p>
                                    </div>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Verificado
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
