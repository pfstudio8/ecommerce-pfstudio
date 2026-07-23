"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { MoveRight, Loader2, Mail, MessageSquare, User } from "lucide-react";
import { sileo } from "sileo";

export default function ContactoPage() {
    const [formData, setFormData] = useState({
        user_name: "",
        user_email: "",
        content: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.user_name || !formData.user_email || !formData.content) {
            sileo.error({ title: "Atención", description: "Todos los campos son obligatorios." });
            return;
        }

        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('messages')
                .insert([{
                    user_name: formData.user_name,
                    user_email: formData.user_email,
                    content: formData.content
                }]);

            if (error) throw error;

            sileo.success({ title: "Mensaje Enviado", description: "Nos podremos en contacto contigo a la brevedad." });
            setFormData({ user_name: "", user_email: "", content: "" });
        } catch (error) {
            console.error("Error sending message:", error);
            sileo.error({ title: "Error", description: "Hubo un problema al enviar el mensaje. Intenta nuevamente." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col justify-center py-20 bg-[var(--background)] animate-in fade-in duration-500">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 uppercase">Contacto</h1>
                    <p className="text-gray-400 text-lg max-w-lg mx-auto">
                        ¿Tienes dudas sobre un pedido, una prenda o venta mayorista? Dejanos tu mensaje y te responderemos pronto.
                    </p>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                    {/* Decorative Blob */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-main)] opacity-10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                    <User className="w-4 h-4 text-[var(--color-main)]" /> Nombre
                                </label>
                                <input
                                    type="text"
                                    name="user_name"
                                    value={formData.user_name}
                                    onChange={handleChange}
                                    placeholder="Tu nombre"
                                    required
                                    className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-[var(--color-main)] focus:border-transparent transition-all outline-none text-white"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-[var(--color-main)]" /> Correo Electrónico
                                </label>
                                <input
                                    type="email"
                                    name="user_email"
                                    value={formData.user_email}
                                    onChange={handleChange}
                                    placeholder="tu@email.com"
                                    required
                                    className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-[var(--color-main)] focus:border-transparent transition-all outline-none text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-[var(--color-main)]" /> Mensaje
                            </label>
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                placeholder="Escribe tu consulta aquí..."
                                rows={5}
                                required
                                className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-[var(--color-main)] focus:border-transparent transition-all outline-none text-white resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[var(--color-main)] hover:bg-[var(--color-main)]/90 text-white py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 transition-all shadow-[0_0_20px_rgba(var(--color-main-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--color-main-rgb),0.5)] disabled:opacity-70"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>Enviar Mensaje <MoveRight className="w-5 h-5" /></>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
