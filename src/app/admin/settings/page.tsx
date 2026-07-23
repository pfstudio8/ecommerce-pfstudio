"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Settings, Save, Loader2, Phone, Mail, Instagram, Store } from "lucide-react";
import { sileo } from "sileo";

interface StoreSettings {
    whatsapp: string;
    email: string;
    instagram: string;
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<StoreSettings>({
        whatsapp: "",
        email: "",
        instagram: ""
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('settings')
                .select('value')
                .eq('key', 'store_info')
                .single();

            if (error) {
                console.error("Error fetching settings:", error);
                // Si falla (por políticas o tabla inexistente), usamos placeholders seguros
            } else if (data && data.value) {
                setSettings({
                    whatsapp: data.value.whatsapp || "",
                    email: data.value.email || "",
                    instagram: data.value.instagram || ""
                });
            }
        } catch (error) {
            console.error("Unexpected error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('settings')
                .upsert(
                    { key: 'store_info', value: settings },
                    { onConflict: 'key' }
                );

            if (error) throw error;
            
            sileo.success({ title: "Configuración guardada", description: "Tus cambios ya se reflejan en la tienda." });
        } catch (error) {
            console.error("Error saving settings:", error);
            sileo.error({ title: "Error al guardar", description: "Verifica los permisos RLS en la tabla settings." });
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-main)]" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242520] pb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-1 font-sans">Configuración de la Tienda</h1>
                    <p className="text-sm text-gray-400 font-medium">Administra la información general y de contacto de tu tienda.</p>
                </div>
                <div className="bg-[#1c1d18] border border-[#2d2e26] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2 w-fit">
                    <Store className="w-4 h-4 text-main" />
                    General
                </div>
            </div>

            <form onSubmit={handleSave} className="bg-[#1c1d18]/60 backdrop-blur-md rounded-2xl border border-[#2d2e26] shadow-lg overflow-hidden flex flex-col">
                <div className="p-6 border-b border-[#2d2e26] bg-[#12130f]">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Settings className="w-5 h-5 text-main" />
                        Información de Contacto
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">Estos datos aparecerán en el pie de página de tu tienda y en los botones de contacto directo.</p>
                </div>
                
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-main" /> WhatsApp
                            </label>
                            <input
                                type="text"
                                name="whatsapp"
                                value={settings.whatsapp}
                                onChange={handleChange}
                                placeholder="Ej: 5491122334455"
                                className="w-full px-4 py-3 bg-[#12130f] border border-[#2d2e26] rounded-xl focus:ring-1 focus:ring-main focus:border-main transition-all outline-none text-white text-sm"
                            />
                            <p className="text-xs text-gray-500">Incluye el código de país sin el signo +, ej: 549 para Argentina.</p>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                                <Instagram className="w-4 h-4 text-main" /> Usuario de Instagram
                            </label>
                            <input
                                type="text"
                                name="instagram"
                                value={settings.instagram}
                                onChange={handleChange}
                                placeholder="Ej: @pfstudio"
                                className="w-full px-4 py-3 bg-[#12130f] border border-[#2d2e26] rounded-xl focus:ring-1 focus:ring-main focus:border-main transition-all outline-none text-white text-sm"
                            />
                            <p className="text-xs text-gray-500">Nombre de usuario con el que te encuentran en Instagram.</p>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-main" /> Email de Soporte / Contacto
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={settings.email}
                                onChange={handleChange}
                                placeholder="Ej: contacto@pfstudio.com"
                                className="w-full px-4 py-3 bg-[#12130f] border border-[#2d2e26] rounded-xl focus:ring-1 focus:ring-main focus:border-main transition-all outline-none text-white text-sm"
                            />
                            <p className="text-xs text-gray-500">El correo al cual los clientes enviarán sus dudas o reclamos.</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-[#2d2e26] bg-[#12130f]/60 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-main hover:bg-emerald-400 text-black px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,168,122,0.2)] active:scale-95 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? "Guardando..." : "Guardar Cambios"}
                    </button>
                </div>
            </form>
        </div>
    );
}
