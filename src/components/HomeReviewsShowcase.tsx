"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Upload, CheckCircle2, Camera, X, Send, Sparkles, Image as ImageIcon, MessageSquare } from "lucide-react";
import Image from "next/image";

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
        <section id="reseñas" className="py-16 bg-linear-to-b from-transparent via-black/40 to-transparent relative z-10 border-t border-yellow-400/10">
            <div className="container mx-auto px-6 md:px-8 max-w-350">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-bold uppercase tracking-wider mb-3 shadow-[0_0_12px_rgba(250,204,21,0.15)]">
                            <Camera className="w-3.5 h-3.5 text-yellow-400" /> Comunidad PFSTUDIO
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#FFFACA]">
                            Fotos & Reseñas de <span className="bg-linear-to-r from-yellow-300 via-yellow-400 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(250,204,21,0.4)]">Clientes</span>
                        </h2>
                        <p className="text-yellow-100/80 text-sm mt-1 max-w-xl font-medium">
                            Compartí tu foto usando tus prendas de PFSTUDIO y dejá tu opinión.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsFormOpen(!isFormOpen)}
                        className="px-6 py-3.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-yellow-400/30 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer border border-yellow-300"
                    >
                        <Camera className="w-4 h-4 text-black" />
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
                            <div className="p-6 md:p-8 rounded-2xl bg-zinc-900/95 border border-yellow-400/30 backdrop-blur-xl relative shadow-[0_0_30px_rgba(250,204,21,0.1)]">
                                <button
                                    onClick={() => setIsFormOpen(false)}
                                    className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-yellow-200 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                {submittedSuccess ? (
                                    <div className="text-center py-8">
                                        <CheckCircle2 className="w-12 h-12 text-yellow-400 mx-auto mb-3 animate-bounce drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                                        <h3 className="text-xl font-bold text-yellow-300 uppercase mb-1">¡Gracias por tu reseña!</h3>
                                        <p className="text-sm text-yellow-100/70">Tu foto y comentario ya aparecen en nuestra comunidad.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-yellow-400" />
                                            <h3 className="text-lg font-extrabold uppercase text-yellow-300 tracking-wide">
                                                Compartí cómo te quedó tu prenda
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-yellow-300 uppercase tracking-wider mb-2">
                                                    Tu Nombre / Apodo *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="Ej: Mateo G."
                                                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-yellow-400/20 text-yellow-100 placeholder:text-yellow-100/40 focus:outline-none focus:border-yellow-400 text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-yellow-300 uppercase tracking-wider mb-2">
                                                    Prenda / Producto
                                                </label>
                                                <input
                                                    type="text"
                                                    value={product}
                                                    onChange={(e) => setProduct(e.target.value)}
                                                    placeholder="Ej: Remera Oversize / Custom Studio"
                                                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-yellow-400/20 text-yellow-100 placeholder:text-yellow-100/40 focus:outline-none focus:border-yellow-400 text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-yellow-300 uppercase tracking-wider mb-2">
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
                                                                    ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]"
                                                                    : "text-zinc-600"
                                                            }`}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-yellow-300 uppercase tracking-wider mb-2">
                                                Tu Comentario / Opinión *
                                            </label>
                                            <textarea
                                                required
                                                rows={3}
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                placeholder="¿Qué tal te pareció el calce, la tela y la estampa?"
                                                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-yellow-400/20 text-yellow-100 placeholder:text-yellow-100/40 focus:outline-none focus:border-yellow-400 text-sm resize-none"
                                            />
                                        </div>

                                        {/* Photo Upload Input */}
                                        <div>
                                            <label className="block text-xs font-bold text-yellow-300 uppercase tracking-wider mb-2">
                                                Subir foto de cómo te quedó (Opcional)
                                            </label>
                                            <div className="flex items-center gap-4">
                                                <label className="cursor-pointer px-4 py-3 rounded-xl bg-black/60 border border-dashed border-yellow-400/30 hover:border-yellow-400 text-yellow-200 hover:text-yellow-100 flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors">
                                                    <Upload className="w-4 h-4 text-yellow-400" />
                                                    Elegir Imagen
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handlePhotoUpload}
                                                        className="hidden"
                                                    />
                                                </label>

                                                {photoPreview && (
                                                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-yellow-400 shadow-md">
                                                        <Image
                                                            src={photoPreview}
                                                            alt="Preview foto reseña"
                                                            fill
                                                            className="object-cover"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setPhotoPreview(null)}
                                                            className="absolute top-1 right-1 bg-black/80 text-yellow-400 p-0.5 rounded-full"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full py-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold uppercase text-xs tracking-wider shadow-lg shadow-yellow-400/20 flex items-center justify-center gap-2 cursor-pointer transition-all border border-yellow-300"
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
                    <div className="p-10 rounded-2xl bg-zinc-950/80 border border-yellow-400/20 text-center flex flex-col items-center justify-center shadow-lg">
                        <MessageSquare className="w-12 h-12 text-yellow-400/70 mb-3 animate-pulse" />
                        <h3 className="text-lg font-bold text-yellow-300 uppercase mb-1">Aún no hay reseñas cargadas</h3>
                        <p className="text-sm text-yellow-100/70 max-w-md mb-6 font-medium">
                            Sé el primero en compartir tu foto usando tu prenda de PFSTUDIO y contanos qué te pareció.
                        </p>
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="px-6 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs uppercase tracking-wider transition-all border border-yellow-300 shadow-md shadow-yellow-400/20"
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
                                className="rounded-2xl bg-zinc-950/90 border border-yellow-400/20 overflow-hidden flex flex-col justify-between hover:border-yellow-400/60 transition-all duration-300 group shadow-lg hover:shadow-[0_0_25px_rgba(250,204,21,0.15)]"
                            >
                                {rev.photoUrl && (
                                    <div className="relative h-64 w-full overflow-hidden bg-black/50">
                                        <Image
                                            src={rev.photoUrl}
                                            alt={`Foto de ${rev.name}`}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-yellow-400/40 text-[10px] font-bold uppercase text-yellow-300 flex items-center gap-1 shadow-md">
                                            <ImageIcon className="w-3 h-3 text-yellow-400" /> Foto Real
                                        </div>
                                    </div>
                                )}

                                <div className="p-6 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex text-yellow-400 gap-0.5">
                                                {[...Array(rev.rating)].map((_, i) => (
                                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]" />
                                                ))}
                                            </div>
                                            <span className="text-[10px] text-yellow-200/60 font-mono">{rev.date}</span>
                                        </div>

                                        <p className="text-yellow-50 text-sm leading-relaxed mb-4 font-medium">
                                            &ldquo;{rev.comment}&rdquo;
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-yellow-400/10 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-extrabold text-yellow-300 text-sm flex items-center gap-1.5">
                                                {rev.name}
                                                <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400" />
                                            </h4>
                                            <p className="text-xs text-yellow-200/70">{rev.product}</p>
                                        </div>
                                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 shadow-xs">
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

