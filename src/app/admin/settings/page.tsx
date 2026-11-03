"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
    Settings, 
    Save, 
    Loader2, 
    Phone, 
    Mail, 
    Instagram, 
    Store, 
    Landmark, 
    CreditCard, 
    User, 
    Hash,
    Sparkles,
    Type,
    FileText,
    Megaphone
} from "lucide-react";
import { toast } from "sonner";

interface StoreSettings {
    whatsapp: string;
    email: string;
    instagram: string;
}

interface BankSettings {
    bank: string;
    holder: string;
    cbu: string;
    alias: string;
    cuit: string;
}

interface LandingSettings {
    badge: string;
    title: string;
    subtitle: string;
    promo: string;
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<StoreSettings>({
        whatsapp: "",
        email: "",
        instagram: ""
    });

    const [bankSettings, setBankSettings] = useState<BankSettings>({
        bank: "",
        holder: "",
        cbu: "",
        alias: "",
        cuit: ""
    });

    const [landingSettings, setLandingSettings] = useState<LandingSettings>({
        badge: "Taller de Estampado & Sublimación Integral",
        title: "PFSTUDIO — Sublimación Integral, Remeras & Diseños a Medida",
        subtitle: "Sublimación integral en todo tipo de insumos: Remeras Boxy Fit, Gorras, Chopps, Tazas, Llaveros, Vasos y más. Personalizá tus productos en tiempo real con la mejor calidad y diseños únicos.",
        promo: "🔥 10% OFF pagando por transferencia bancaria directa"
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
                .select('key, value')
                .in('key', ['store_info', 'bank_info', 'landing_texts']);

            if (error) {
                console.error("Error fetching settings:", error);
            } else if (data) {
                const storeData = data.find(item => item.key === 'store_info')?.value;
                const bankData = data.find(item => item.key === 'bank_info')?.value;
                const landingData = data.find(item => item.key === 'landing_texts')?.value;

                if (storeData) {
                    setSettings({
                        whatsapp: storeData.whatsapp || "",
                        email: storeData.email || "",
                        instagram: storeData.instagram || ""
                    });
                }

                if (bankData) {
                    setBankSettings({
                        bank: bankData.bank || bankData.bankName || "",
                        holder: bankData.holder || bankData.accountHolder || "",
                        cbu: bankData.cbu || "",
                        alias: bankData.alias || "",
                        cuit: bankData.cuit || ""
                    });
                }

                if (landingData) {
                    setLandingSettings({
                        badge: landingData.badge || "Taller de Estampado & Sublimación Integral",
                        title: landingData.title || "PFSTUDIO — Sublimación Integral, Remeras & Diseños a Medida",
                        subtitle: landingData.subtitle || "Sublimación integral en todo tipo de insumos...",
                        promo: landingData.promo || "🔥 10% OFF pagando por transferencia bancaria directa"
                    });
                }
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
            // 1. Guardar store_info
            const { error: storeError } = await supabase
                .from('settings')
                .upsert(
                    { key: 'store_info', value: settings, updated_at: new Date().toISOString() },
                    { onConflict: 'key' }
                );
            if (storeError) throw storeError;

            // 2. Guardar bank_info
            const { error: bankError } = await supabase
                .from('settings')
                .upsert(
                    { key: 'bank_info', value: bankSettings, updated_at: new Date().toISOString() },
                    { onConflict: 'key' }
                );
            if (bankError) throw bankError;

            // 3. Guardar landing_texts
            const { error: landingError } = await supabase
                .from('settings')
                .upsert(
                    { key: 'landing_texts', value: landingSettings, updated_at: new Date().toISOString() },
                    { onConflict: 'key' }
                );
            if (landingError) throw landingError;
            
            toast.success("Configuraciones, datos bancarios y textos de la tienda actualizados.");
        } catch (error: any) {
            console.error("Error saving settings:", error);
            toast.error(error.message || "Error al guardar configuraciones.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setBankSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleLandingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLandingSettings(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface mb-1 font-sans">Configuración de la Tienda</h1>
                    <p className="text-sm text-outline font-medium">Administra los datos de contacto, la información bancaria para transferencias y los textos de la landing.</p>
                </div>
                <div className="bg-surface-container-low border border-outline-variant px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-2 w-fit">
                    <Store className="w-4 h-4 text-primary" />
                    Panel General
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                {/* 1. Información de Contacto y Redes */}
                <div className="bg-surface-container-low backdrop-blur-md rounded-2xl border border-outline-variant shadow-lg overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-outline-variant bg-surface">
                        <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                            <Settings className="w-5 h-5 text-primary" />
                            Información de Contacto y Redes (store_info)
                        </h2>
                        <p className="text-xs text-outline mt-1">Estos datos aparecerán en el pie de página de tu tienda y en los botones de contacto directo.</p>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-on-surface-variant flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-primary" /> WhatsApp de Atención
                                </label>
                                <input
                                    type="text"
                                    name="whatsapp"
                                    value={settings.whatsapp}
                                    onChange={handleChange}
                                    placeholder="Ej: 5493704245651"
                                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none text-on-surface text-sm font-mono"
                                />
                                <p className="text-xs text-outline">Incluye el código de país sin el signo +, ej: 549 para Argentina.</p>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-on-surface-variant flex items-center gap-2">
                                    <Instagram className="w-4 h-4 text-primary" /> Usuario de Instagram
                                </label>
                                <input
                                    type="text"
                                    name="instagram"
                                    value={settings.instagram}
                                    onChange={handleChange}
                                    placeholder="Ej: @pfstudio"
                                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none text-on-surface text-sm"
                                />
                                <p className="text-xs text-outline">Nombre de usuario con el que te encuentran en Instagram.</p>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-semibold text-on-surface-variant flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-primary" /> Email de Soporte / Notificaciones
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={settings.email}
                                    onChange={handleChange}
                                    placeholder="Ej: contacto@pfstudio.com"
                                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none text-on-surface text-sm"
                                />
                                <p className="text-xs text-outline">El correo al cual los clientes enviarán sus dudas o comprobantes.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Datos Bancarios / Transferencia */}
                <div className="bg-surface-container-low backdrop-blur-md rounded-2xl border border-outline-variant shadow-lg overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-outline-variant bg-surface">
                        <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                            <Landmark className="w-5 h-5 text-primary" />
                            Datos de Transferencia Bancaria (bank_info)
                        </h2>
                        <p className="text-xs text-outline mt-1">Estos datos se mostrarán en la tarjeta de pago al finalizar compras con transferencia.</p>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-on-surface-variant flex items-center gap-2">
                                    <Store className="w-4 h-4 text-primary" /> Banco o Billetera Virtual (App)
                                </label>
                                <input
                                    type="text"
                                    name="bank"
                                    value={bankSettings.bank}
                                    onChange={handleBankChange}
                                    placeholder="Ej: Naranja X / Banco Santander / Mercado Pago"
                                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none text-on-surface text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-on-surface-variant flex items-center gap-2">
                                    <User className="w-4 h-4 text-primary" /> Titular de la Cuenta
                                </label>
                                <input
                                    type="text"
                                    name="holder"
                                    value={bankSettings.holder}
                                    onChange={handleBankChange}
                                    placeholder="Ej: Paula Alvarenga"
                                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none text-on-surface text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-on-surface-variant flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-primary" /> CBU / CVU
                                </label>
                                <input
                                    type="text"
                                    name="cbu"
                                    value={bankSettings.cbu}
                                    onChange={handleBankChange}
                                    placeholder="Ej: 4530000800010655590139"
                                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none text-on-surface text-sm font-mono"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-on-surface-variant flex items-center gap-2">
                                    <Hash className="w-4 h-4 text-primary" /> Alias
                                </label>
                                <input
                                    type="text"
                                    name="alias"
                                    value={bankSettings.alias}
                                    onChange={handleBankChange}
                                    placeholder="Ej: PFSTUDIO.VENTAS"
                                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none text-on-surface text-sm uppercase font-mono font-bold"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-semibold text-on-surface-variant flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-primary" /> CUIT / CUIL
                                </label>
                                <input
                                    type="text"
                                    name="cuit"
                                    value={bankSettings.cuit}
                                    onChange={handleBankChange}
                                    placeholder="Ej: 27-44685115-8"
                                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none text-on-surface text-sm font-mono"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Textos de la Landing Page */}
                <div className="bg-surface-container-low backdrop-blur-md rounded-2xl border border-outline-variant shadow-lg overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-outline-variant bg-surface">
                        <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary" />
                            Textos de la Landing y Portada (landing_texts)
                        </h2>
                        <p className="text-xs text-outline mt-1">Personaliza el mensaje de bienvenida, títulos principales y avisos promocionales que verán los clientes.</p>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-on-surface-variant flex items-center gap-2">
                                    <Megaphone className="w-4 h-4 text-primary" /> Badge de Cabecera (Pill Superior)
                                </label>
                                <input
                                    type="text"
                                    name="badge"
                                    value={landingSettings.badge}
                                    onChange={handleLandingChange}
                                    placeholder="Ej: Taller de Estampado & Sublimación Integral"
                                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none text-on-surface text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-on-surface-variant flex items-center gap-2">
                                    <Type className="w-4 h-4 text-primary" /> Título Principal Hero
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={landingSettings.title}
                                    onChange={handleLandingChange}
                                    placeholder="Ej: PFSTUDIO — Sublimación Integral, Remeras & Diseños a Medida"
                                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none text-on-surface text-sm font-bold"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-on-surface-variant flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-primary" /> Subtítulo Descriptivo Hero
                                </label>
                                <textarea
                                    name="subtitle"
                                    rows={3}
                                    value={landingSettings.subtitle}
                                    onChange={handleLandingChange}
                                    placeholder="Descripción general de insumos y personalización..."
                                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none text-on-surface text-sm resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-on-surface-variant flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-primary" /> Aviso Promocional / Banner
                                </label>
                                <input
                                    type="text"
                                    name="promo"
                                    value={landingSettings.promo}
                                    onChange={handleLandingChange}
                                    placeholder="Ej: 🔥 10% OFF pagando por transferencia bancaria directa"
                                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none text-on-surface text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-primary hover:bg-primary-dark text-on-primary px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md active:scale-[1.02] disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? "Guardando..." : "Guardar Toda la Configuración"}
                    </button>
                </div>
            </form>
        </div>
    );
}
