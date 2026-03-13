"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Settings, Save, Loader2, Info } from "lucide-react";

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [dbError, setDbError] = useState<string | null>(null);

    // Default store info Structure
    const [storeInfo, setStoreInfo] = useState({
        whatsapp: "",
        email: "",
        instagram: "",
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('settings')
                .select('value')
                .eq('key', 'store_info')
                .single();

            if (error) {
                if (error.code === '42P01' || error.message?.includes('relation "public.settings" does not exist')) {
                    setDbError("La tabla 'settings' no existe en Supabase. Debes ejecutar el script SQL en la consola de Supabase.");
                } else if (error.code !== 'PGRST116') { // PGRST116 = JSON object requested, multiple (or no) rows returned
                    setDbError(`Error al cargar configuración: ${error.message}`);
                }
            }

            if (!error && data?.value) {
                setStoreInfo({
                    whatsapp: data.value.whatsapp || "",
                    email: data.value.email || "",
                    instagram: data.value.instagram || "",
                });
            }
        } catch (err) {
            // Error captured silently to prevent dev overlay
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Verify if exists to avoid upsert constraint issues if no unique constraint is set
            const { data: existing } = await supabase
                .from('settings')
                .select('key')
                .eq('key', 'store_info')
                .maybeSingle();

            if (existing) {
                const { error } = await supabase
                    .from('settings')
                    .update({
                        value: storeInfo,
                        updated_at: new Date().toISOString()
                    })
                    .eq('key', 'store_info');
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('settings')
                    .insert({
                        key: 'store_info',
                        value: storeInfo,
                        updated_at: new Date().toISOString()
                    });
                if (error) throw error;
            }

            alert("Configuración guardada exitosamente.");
        } catch (err: any) {
            let errorMessage = err?.message || err?.error_description || err?.details || "";
            if (!errorMessage) {
                try {
                    errorMessage = JSON.stringify(err);
                    if (errorMessage === "{}" || !errorMessage) {
                        errorMessage = "Error desconocido. Revisa si la tabla 'settings' existe y si tienes permisos (RLS).";
                    }
                } catch (e) {
                    errorMessage = String(err);
                }
            }
            alert("Error al guardar: " + errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-main)]" /></div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Configuración</h1>
                    <p className="text-sm text-gray-400">Ajustes generales de la tienda y preferencias.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving || !!dbError}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm flex items-center gap-2 font-medium transition-colors disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSaving ? "Guardando..." : "Guardar Cambios"}
                </button>
            </div>

            {dbError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3">
                    <Info className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-sm">Problema con la base de datos</h3>
                        <p className="text-sm mt-1">{dbError}</p>
                    </div>
                </div>
            )}

            <div className="bg-[#0c0e15] rounded-2xl border border-[#1e212b] shadow-sm overflow-hidden p-6 md:p-8 space-y-8">

                <div className="flex items-start gap-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-200">
                        Estos datos se utilizarán en el pie de página, enlaces de contacto y en la página de confirmación de órdenes.
                    </p>
                </div>

                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Settings className="w-5 h-5 text-gray-400" />
                        Información de Contacto
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-300">WhatsApp (con código de país)</label>
                            <input
                                type="text"
                                value={storeInfo.whatsapp}
                                onChange={(e) => setStoreInfo({ ...storeInfo, whatsapp: e.target.value })}
                                className="w-full px-4 py-3 bg-[#141722] border border-[#1e212b] rounded-xl focus:outline-none focus:ring-2 focus:border-blue-500 transition-all text-white"
                                placeholder="Ej: 5491100000000"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-300">Correo Electrónico Comercial</label>
                            <input
                                type="email"
                                value={storeInfo.email}
                                onChange={(e) => setStoreInfo({ ...storeInfo, email: e.target.value })}
                                className="w-full px-4 py-3 bg-[#141722] border border-[#1e212b] rounded-xl focus:outline-none focus:ring-2 focus:border-blue-500 transition-all text-white"
                                placeholder="hola@mitienda.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-300">Usuario de Instagram</label>
                            <input
                                type="text"
                                value={storeInfo.instagram}
                                onChange={(e) => setStoreInfo({ ...storeInfo, instagram: e.target.value })}
                                className="w-full px-4 py-3 bg-[#141722] border border-[#1e212b] rounded-xl focus:outline-none focus:ring-2 focus:border-blue-500 transition-all text-white"
                                placeholder="Ej: @mitienda"
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
