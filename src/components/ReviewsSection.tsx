"use client";

import { useState, useEffect } from "react";
import { Star, MessageCircle, Send, User as UserIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";
import { sileo } from "sileo";

interface Review {
    id: string;
    product_id: string;
    user_email: string;
    rating: number;
    comment: string;
    created_at: string;
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
                .select("*")
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
            sileo.info({ title: "Inicia sesión para dejar una reseña" });
            setModalOpen(true);
            return;
        }

        if (newRating < 1 || newRating > 5) {
            sileo.error({ title: "La calificación debe ser entre 1 y 5 estrellas" });
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase.from("reviews").insert({
                product_id: productId,
                user_email: user.email,
                rating: newRating,
                comment: newComment.trim()
            });

            if (error) throw error;

            sileo.success({ title: "¡Gracias por tu opinión!" });
            setNewComment("");
            setNewRating(5);
            await fetchReviews();
        } catch (error) {
            console.error("Error submitting review:", error);
            sileo.error({ title: "Error al enviar la reseña. Intenta de nuevo." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const averageRating = reviews.length > 0 
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
        : 0;

    return (
        <div className="mt-20 pt-16 border-t border-gray-100 dark:border-zinc-800">
            <h3 className="text-2xl font-bold tracking-tight mb-8 text-[var(--foreground)] flex items-center gap-3">
                <MessageCircle className="w-6 h-6" />
                Opiniones de Clientes
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left: Summary & Form */}
                <div className="lg:col-span-1">
                    <div className="bg-gray-50 dark:bg-zinc-900/50 p-6 rounded-xl border border-gray-100 dark:border-zinc-800 mb-8 text-center sticky top-24">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">Valoración Promedio</h4>
                        <div className="text-5xl font-black text-[var(--foreground)] mb-3 flex items-center justify-center gap-2">
                            {averageRating}
                            <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                        </div>
                        <p className="text-gray-500 text-sm">{reviews.length} opiniones en total</p>
                    </div>

                    <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                        <h4 className="font-bold mb-4 text-[var(--foreground)]">Dejá tu opinión</h4>
                        {user ? (
                            <form onSubmit={handleSubmitReview} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                                                    ? "fill-yellow-400 text-yellow-400" 
                                                    : "text-gray-300 dark:text-gray-700 hover:text-yellow-200"
                                                }`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Comentario (opcional)
                                    </label>
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-[var(--color-main)] focus:border-transparent transition-all outline-none resize-none"
                                        placeholder="¿Qué te pareció el producto?"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3 bg-[var(--foreground)] text-[var(--background)] rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[var(--color-main)] hover:text-white transition-all text-sm disabled:opacity-50"
                                >
                                    {isSubmitting ? "Enviando..." : (
                                        <>
                                            Enviar Opinión <Send className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-gray-500 text-sm mb-4">Debes iniciar sesión para dejar una opinión.</p>
                                <button
                                    onClick={() => setModalOpen(true)}
                                    className="px-6 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-md font-bold hover:bg-[var(--color-main)] hover:text-white transition-all text-sm"
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
                                <div key={i} className="animate-pulse bg-gray-50 dark:bg-zinc-900 h-32 rounded-xl"></div>
                            ))}
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="bg-gray-50 dark:bg-zinc-900/50 p-12 rounded-xl border border-gray-100 dark:border-zinc-800 text-center flex flex-col items-center">
                            <Star className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-4" />
                            <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Aún no hay opiniones</h4>
                            <p className="text-gray-500">Sé el primero en compartir qué te pareció este producto.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {reviews.map((review) => (
                                <div key={review.id} className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm transition-hover hover:shadow-md">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-[var(--foreground)] font-bold">
                                                <UserIcon className="w-5 h-5 opacity-50" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-[var(--foreground)] text-sm">
                                                    {review.user_email.split('@')[0]}
                                                </p>
                                                <p className="text-xs text-gray-500">
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
                                                    ? "fill-yellow-400 text-yellow-400" 
                                                    : "text-gray-200 dark:text-gray-800"
                                                }`} />
                                            ))}
                                        </div>
                                    </div>
                                    {review.comment && (
                                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
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
