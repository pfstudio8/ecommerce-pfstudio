"use client";

import { useState, useEffect } from "react";
import { Star, MessageCircle, Send, User as UserIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/features/auth/store/auth";
import { toast } from "sonner";

interface Review {
    id: string;
    product_id: string;
    user_id: string;
    user_email?: string;
    rating: number;
    comment: string;
    created_at: string;
    profiles?: {
        full_name: string;
        email: string;
    };
}

export default function ReviewsSection({ productId }: { productId: string }) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const user = useAuthStore(state => state.user);
    const setModalOpen = useAuthStore(state => state.setModalOpen);

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from("reviews")
                .select("*, profiles(full_name, email)")
                .eq("product_id", productId)
                .order("created_at", { ascending: false });
            
            if (error) throw error;
            if (data) setReviews(data);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user?.email) {
            toast.info("Inicia sesión para dejar una reseña");
            setModalOpen(true);
            return;
        }

        if (newRating < 1 || newRating > 5) {
            toast.error("La calificación debe ser entre 1 y 5 estrellas");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    rating: newRating,
                    comment: newComment
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Error al enviar la reseña');
            }

            toast.success("¡Gracias por tu opinión!");
            setNewComment("");
            setNewRating(5);
            await fetchReviews();
        } catch (error: any) {
            console.error("Error submitting review:", error);
            toast.error(error.message || "Error al enviar la reseña. Intenta de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const averageRating = reviews.length > 0 
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
        : 0;

    return (
        <div className="mt-20 pt-16 border-t border-yellow-400/20">
            <h3 className="text-2xl font-black tracking-tight mb-8 text-[#FFFACA] flex items-center gap-3">
                <MessageCircle className="w-6 h-6 text-yellow-400" />
                Opiniones de Clientes
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left: Summary & Form */}
                <div className="lg:col-span-1">
                    <div className="bg-zinc-900/80 p-6 rounded-xl border border-yellow-400/30 mb-8 text-center sticky top-24 shadow-lg">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-yellow-300 mb-2">Valoración Promedio</h4>
                        <div className="text-5xl font-black text-yellow-400 mb-3 flex items-center justify-center gap-2 drop-shadow-[0_0_12px_rgba(250,204,21,0.4)]">
                            {averageRating}
                            <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                        </div>
                        <p className="text-yellow-100/70 text-sm font-medium">{reviews.length} opiniones en total</p>
                    </div>

                    <div className="bg-zinc-950 p-6 rounded-xl border border-yellow-400/20 shadow-md">
                        <h4 className="font-extrabold mb-4 text-yellow-300">Dejá tu opinión</h4>
                        {user ? (
                            <form onSubmit={handleSubmitReview} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-yellow-200 mb-2">
                                        Calificación
                                    </label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setNewRating(star)}
                                                className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                            >
                                                <Star className={`w-8 h-8 transition-colors ${
                                                    star <= newRating 
                                                    ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" 
                                                    : "text-zinc-700 hover:text-yellow-200"
                                                }`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-yellow-200 mb-2">
                                        Comentario (opcional)
                                    </label>
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        rows={4}
                                        maxLength={500}
                                        className="w-full px-4 py-3 rounded-lg border border-yellow-400/20 bg-zinc-900 text-yellow-100 placeholder:text-yellow-100/40 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all outline-none resize-none"
                                        placeholder="¿Qué te pareció el producto?"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-black rounded-lg font-extrabold flex items-center justify-center gap-2 transition-all text-sm disabled:opacity-50 border border-yellow-300 shadow-md shadow-yellow-400/20 cursor-pointer"
                                >
                                    {isSubmitting ? "Enviando..." : (
                                        <>
                                            Enviar Opinión <Send className="w-4 h-4 text-black" />
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-yellow-100/70 text-sm mb-4 font-medium">Debes iniciar sesión para dejar una opinión.</p>
                                <button
                                    onClick={() => setModalOpen(true)}
                                    className="px-6 py-2 bg-yellow-400 text-black rounded-md font-extrabold hover:bg-yellow-300 transition-all text-sm border border-yellow-300 shadow-md shadow-yellow-400/20 cursor-pointer"
                                >
                                    Iniciar Sesión
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Reviews List */}
                <div className="lg:col-span-2">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="animate-pulse bg-zinc-900 h-32 rounded-xl border border-yellow-400/10"></div>
                            ))}
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="bg-zinc-950/80 p-12 rounded-xl border border-yellow-400/20 text-center flex flex-col items-center shadow-md">
                            <Star className="w-12 h-12 text-yellow-400/50 mb-4 animate-pulse" />
                            <h4 className="text-lg font-bold text-yellow-300 mb-2">Aún no hay opiniones</h4>
                            <p className="text-yellow-100/70 text-sm">Sé el primero en compartir qué te pareció este producto.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {reviews.map((review) => (
                                <div key={review.id} className="bg-zinc-950 p-6 rounded-xl border border-yellow-400/20 shadow-sm transition-all hover:border-yellow-400/50 hover:shadow-[0_0_20px_rgba(250,204,21,0.1)]">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-yellow-400/15 border border-yellow-400/30 flex items-center justify-center text-yellow-400 font-bold">
                                                <UserIcon className="w-5 h-5 text-yellow-400" />
                                            </div>
                                            <div>
                                                <p className="font-extrabold text-yellow-300 text-sm">
                                                    {review.profiles?.full_name || review.profiles?.email?.split('@')[0] || review.user_email?.split('@')[0] || 'Usuario'}
                                                </p>
                                                <p className="text-xs text-yellow-200/60 font-mono">
                                                    {new Date(review.created_at).toLocaleDateString('es-AR', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star key={star} className={`w-4 h-4 ${
                                                    star <= review.rating 
                                                    ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]" 
                                                    : "text-zinc-800"
                                                }`} />
                                            ))}
                                        </div>
                                    </div>
                                    {review.comment && (
                                        <p className="text-yellow-50 text-sm leading-relaxed font-medium">
                                            &quot;{review.comment}&quot;
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
