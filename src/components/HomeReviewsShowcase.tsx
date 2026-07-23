"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Upload, CheckCircle2, Camera, X, Send, Sparkles, Image as ImageIcon, MessageSquare } from "lucide-react";

interface CustomerReview {
    id: string;
    name: string;
    tag: string;
    rating: number;
    comment: string;
    product: string;
    date: string;
    photoUrl?: string;
}

export default function HomeReviewsShowcase() {
    const [reviews, setReviews] = useState<CustomerReview[]>([]);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [name, setName] = useState("");
    const [product, setProduct] = useState("");
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [submittedSuccess, setSubmittedSuccess] = useState(false);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !comment.trim()) return;

        const newReview: CustomerReview = {
            id: Date.now().toString(),
            name: name.trim(),
            tag: "Comprador Verificado",
            rating,
            comment: comment.trim(),
            product: product.trim() || "Remera PFSTUDIO",
            date: "Hoy",
            photoUrl: photoPreview || undefined
        };

        setReviews([newReview, ...reviews]);
        setSubmittedSuccess(true);

        setTimeout(() => {
            setName("");
            setProduct("");
            setRating(5);
            setComment("");
            setPhotoPreview(null);
            setSubmittedSuccess(false);
            setIsFormOpen(false);
        }, 1800);
    };

    return (
        <section id="reseñas" className="py-16 bg-gradient-to-b from-transparent via-black/40 to-transparent relative z-10 border-t border-white/5">
            <div className="container mx-auto px-6 md:px-8 max-w-[1400px]">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
                            <Camera className="w-3.5 h-3.5" /> Comunidad PFSTUDIO
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
                            Fotos & Reseñas de <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">Clientes</span>
                        </h2>
                        <p className="text-gray-400 text-sm mt-1 max-w-xl">
                            Compartí tu foto usando tus prendas de PFSTUDIO y dejá tu opinión.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsFormOpen(!isFormOpen)}
                        className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-950/40 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                    >
                        <Camera className="w-4 h-4" />
                        Subí tu Foto & Reseña
                    </button>
                </div>

                {/* Review Submission Form Modal / Drawer */}
                <AnimatePresence>
                    {isFormOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden mb-10"
                        >
                            <div className="p-6 md:p-8 rounded-2xl bg-zinc-900/90 border border-amber-500/30 backdrop-blur-xl relative">
                                <button
                                    onClick={() => setIsFormOpen(false)}
                                    className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                {submittedSuccess ? (
                                    <div className="text-center py-8">
                                        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 animate-bounce" />
                                        <h3 className="text-xl font-bold text-white uppercase mb-1">¡Gracias por tu reseña!</h3>
                                        <p className="text-sm text-gray-400">Tu foto y comentario ya aparecen en nuestra comunidad.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-amber-400" />
                                            <h3 className="text-lg font-extrabold uppercase text-white tracking-wide">
                                                Compartí cómo te quedó tu prenda
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                                                    Tu Nombre / Apodo *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="Ej: Mateo G."
                                                    className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-400 text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                                                    Prenda / Producto
                                                </label>
                                                <input
                                                    type="text"
                                                    value={product}
                                                    onChange={(e) => setProduct(e.target.value)}
                                                    placeholder="Ej: Remera Oversize / Custom Studio"
                                                    className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-400 text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                                                Calificación
                                            </label>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setRating(star)}
                                                        className="p-1 hover:scale-125 transition-transform cursor-pointer"
                                                    >
                                                        <Star
                                                            className={`w-7 h-7 ${
                                                                star <= rating
                                                                    ? "fill-amber-400 text-amber-400"
                                                                    : "text-gray-600"
                                                            }`}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                                                Tu Comentario / Opinión *
                                            </label>
                                            <textarea
                                                required
                                                rows={3}
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                placeholder="¿Qué tal te pareció el calce, la tela y la estampa?"
                                                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-400 text-sm resize-none"
                                            />
                                        </div>

                                        {/* Photo Upload Input */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                                                Subir foto de cómo te quedó (Opcional)
                                            </label>
                                            <div className="flex items-center gap-4">
                                                <label className="cursor-pointer px-4 py-3 rounded-xl bg-black/60 border border-dashed border-white/20 hover:border-amber-400 text-gray-300 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors">
                                                    <Upload className="w-4 h-4 text-amber-400" />
                                                    Elegir Imagen
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handlePhotoUpload}
                                                        className="hidden"
                                                    />
                                                </label>

                                                {photoPreview && (
                                                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-amber-400 shadow-md">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={photoPreview}
                                                            alt="Preview foto reseña"
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setPhotoPreview(null)}
                                                            className="absolute top-1 right-1 bg-black/80 text-white p-0.5 rounded-full"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full py-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold uppercase text-xs tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
                                        >
                                            <Send className="w-4 h-4" />
                                            Publicar Reseña en la Comunidad
                                        </button>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Empty State or Reviews Grid */}
                {reviews.length === 0 ? (
                    <div className="p-10 rounded-2xl bg-zinc-950/60 border border-white/10 text-center flex flex-col items-center justify-center">
                        <MessageSquare className="w-12 h-12 text-gray-600 mb-3" />
                        <h3 className="text-lg font-bold text-white uppercase mb-1">Aún no hay reseñas cargadas</h3>
                        <p className="text-sm text-gray-400 max-w-md mb-6">
                            Sé el primero en compartir tu foto usando tu prenda de PFSTUDIO y contanos qué te pareció.
                        </p>
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider transition-all"
                        >
                            Dejar la primera reseña
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {reviews.map((rev) => (
                            <motion.div
                                key={rev.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-2xl bg-zinc-950/80 border border-white/10 overflow-hidden flex flex-col justify-between hover:border-amber-500/40 transition-all duration-300 group"
                            >
                                {rev.photoUrl && (
                                    <div className="relative h-64 w-full overflow-hidden bg-black/50">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={rev.photoUrl}
                                            alt={`Foto de ${rev.name}`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase text-white flex items-center gap-1">
                                            <ImageIcon className="w-3 h-3 text-amber-400" /> Foto Real
                                        </div>
                                    </div>
                                )}

                                <div className="p-6 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex text-amber-400 gap-0.5">
                                                {[...Array(rev.rating)].map((_, i) => (
                                                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                                                ))}
                                            </div>
                                            <span className="text-[10px] text-gray-400 font-mono">{rev.date}</span>
                                        </div>

                                        <p className="text-gray-200 text-sm leading-relaxed mb-4">
                                            &ldquo;{rev.comment}&rdquo;
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                                                {rev.name}
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                            </h4>
                                            <p className="text-xs text-gray-400">{rev.product}</p>
                                        </div>
                                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            Verificado
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

