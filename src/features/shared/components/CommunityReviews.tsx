"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function CommunityReviews() {
    const [rating, setRating] = useState(5);
    const [name, setName] = useState("");
    const [review, setReview] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
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
            
            toast.success("¡Gracias por tu reseña! Ha sido enviada y está pendiente de revisión por nuestro equipo.");
            setName("");
            setReview("");
            setRating(5);
        } catch (error) {
            console.error("Error submitting review to messages:", error);
            toast.error("Ocurrió un error al enviar tu reseña. Por favor intenta de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <section id="comunidad" className="py-space-xl bg-surface border-b border-outline-variant">
            <div className="w-full px-margin-desktop max-w-7xl mx-auto flex flex-col items-center">
                <span className="text-label-sm font-label-sm font-bold uppercase tracking-wider text-secondary mb-2">PFSTUDIO COMUNIDAD</span>
                <h2 className="text-headline-lg font-headline-lg text-on-surface text-center mb-space-lg">Qué dicen nuestros clientes</h2>
                
                <div className="w-full max-w-2xl bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 shadow-sm">
                    <h3 className="text-title-md font-title-md text-on-surface mb-2">¿Ya recibiste tu pedido?</h3>
                    <p className="text-body-md font-body-md text-on-surface-variant mb-6">Sube una foto de tus prendas o insumos y cuéntanos qué te pareció. ¡Tu opinión nos ayuda a mejorar!</p>
                    
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-label-sm font-label-sm font-bold uppercase tracking-wider text-on-surface-variant">Tu Nombre</label>
                            <input required value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Ej: Facundo E." className="px-4 py-3 bg-surface border border-outline-variant rounded-xl focus:border-primary outline-none transition-colors text-on-surface" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-label-sm font-label-sm font-bold uppercase tracking-wider text-on-surface-variant">Reseña</label>
                            <textarea required value={review} onChange={e => setReview(e.target.value)} rows={3} placeholder="¿Qué te pareció la calidad?" className="px-4 py-3 bg-surface border border-outline-variant rounded-xl focus:border-primary outline-none transition-colors text-on-surface resize-none"></textarea>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-label-sm font-label-sm font-bold uppercase tracking-wider text-on-surface-variant">Foto de tu pedido</label>
                            <input type="file" accept="image/*" className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-label-sm file:font-bold file:bg-primary-container file:text-primary hover:file:bg-primary-container/80 cursor-pointer text-sm text-on-surface-variant" />
                        </div>
                        <div className="mt-4 flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span 
                                        key={star} 
                                        onClick={() => setRating(star)}
                                        className={`material-symbols-outlined text-[24px] material-symbols-fill cursor-pointer hover:scale-110 transition-transform ${star <= rating ? 'text-[#eab308]' : 'text-outline-variant'}`}
                                    >
                                        star
                                    </span>
                                ))}
                            </div>
                            <button disabled={isSubmitting} type="submit" className="ml-auto px-6 py-3 bg-primary text-on-primary font-bold rounded-xl shadow-sm hover:bg-primary-dark transition-colors disabled:opacity-50">
                                {isSubmitting ? "Enviando..." : "Enviar Reseña"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}
