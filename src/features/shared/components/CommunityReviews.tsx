"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Star, MessageSquarePlus, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

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
        <section id="comunidad" className="py-16 md:py-20 bg-surface border-b border-outline-variant">
            <div className="w-full px-margin-desktop max-w-7xl mx-auto flex flex-col gap-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-secondary">Opiniones Reales</span>
                        <h2 className="text-2xl sm:text-3xl font-black text-on-surface mt-1">Comunidad PFSTUDIO</h2>
                        <p className="text-sm text-on-surface-variant mt-1">
                            Lo que dicen quienes ya visten y usan nuestras producciones.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsFormOpen(!isFormOpen)}
                        className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container hover:bg-surface-container-high text-xs font-bold uppercase tracking-wider text-on-surface transition-all"
                    >
                        <MessageSquarePlus className="w-4 h-4 text-primary" />
                        <span>{isFormOpen ? "Cerrar formulario" : "Dejar mi opinión"}</span>
                        {isFormOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                </div>

                {/* Collapsible Review Form */}
                {isFormOpen && (
                    <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto w-full transition-all">
                        <h3 className="text-base font-bold text-on-surface mb-1">Compartí tu experiencia</h3>
                        <p className="text-xs text-on-surface-variant mb-5">Contanos qué te pareció el calce, la tela o la estampa de tu pedido.</p>
                        
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Tu Nombre</label>
                                <input 
                                    required 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                    type="text" 
                                    placeholder="Ej: Martín G." 
                                    className="w-full px-3.5 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm focus:border-primary outline-none transition-colors text-on-surface" 
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Puntuación</label>
                                <div className="flex items-center gap-1.5 py-1">
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
                                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">Reseña</label>
                                <textarea 
                                    required 
                                    value={review} 
                                    onChange={e => setReview(e.target.value)} 
                                    rows={3} 
                                    placeholder="¿Qué te pareció la calidad y el servicio?" 
                                    className="w-full px-3.5 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm focus:border-primary outline-none transition-colors text-on-surface resize-none"
                                />
                            </div>

                            <button 
                                disabled={isSubmitting} 
                                type="submit" 
                                className="mt-2 py-3 px-6 bg-primary text-on-primary font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50 self-end"
                            >
                                {isSubmitting ? "Enviando..." : "Publicar Reseña"}
                            </button>
                        </form>
                    </div>
                )}

                {/* Testimonial Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {FEATURED_REVIEWS.map((rev) => (
                        <div 
                            key={rev.id} 
                            className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 flex flex-col justify-between shadow-sm"
                        >
                            <div className="space-y-3">
                                <div className="flex items-center gap-1 text-[#eab308]">
                                    {[...Array(rev.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-current" />
                                    ))}
                                </div>
                                <p className="text-xs text-on-surface leading-relaxed italic">
                                    &ldquo;{rev.comment}&rdquo;
                                </p>
                            </div>

                            <div className="mt-5 pt-3 border-t border-outline-variant/60 flex items-center justify-between">
                                <div>
                                    <h4 className="text-xs font-bold text-on-surface">{rev.author}</h4>
                                    <p className="text-[11px] text-outline">{rev.product}</p>
                                </div>
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Verificado
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
