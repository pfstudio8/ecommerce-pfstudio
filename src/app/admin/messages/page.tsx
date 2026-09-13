"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, Search, RefreshCw, Archive, Trash2, Star, Loader2, Inbox, Send } from "lucide-react";
import { sileo } from "sileo";

interface Message {
    id: string;
    user_name: string;
    user_email: string;
    content: string;
    status: 'unread' | 'read' | 'archived';
    created_at: string;
}

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching messages:", error);
                return;
            }
            
            setMessages(data || []);
            setFilteredMessages(data || []);
        } catch (error) {
            console.error("Fetch errors", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const lower = searchTerm.toLowerCase();
        let result = messages.filter(m => 
            m.user_name.toLowerCase().includes(lower) || 
            m.user_email.toLowerCase().includes(lower) ||
            m.content.toLowerCase().includes(lower)
        );

        if (filterStatus !== 'all') {
            result = result.filter(m => m.status === filterStatus);
        }

        setFilteredMessages(result);
    }, [searchTerm, filterStatus, messages]);

    const handleUpdateStatus = async (id: string, newStatus: 'read' | 'unread' | 'archived') => {
        try {
            const { error } = await supabase
                .from('messages')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            setMessages(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
        } catch (error) {
            console.error("Error updating status:", error);
            sileo.error({ title: "Error", description: "No se pudo actualizar el estado del mensaje." });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este mensaje de forma permanente?")) return;
        
        try {
            const { error } = await supabase
                .from('messages')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setMessages(prev => prev.filter(m => m.id !== id));
            sileo.success({ title: "Mensaje eliminado", description: "El mensaje ha sido borrado exitosamente." });
        } catch (error) {
             console.error("Error deleting message:", error);
             sileo.error({ title: "Error", description: "No se pudo eliminar el mensaje." });
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-main" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 font-sans">
            
            {/* Header Section */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242520] pb-6">
                <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground font-sans">Mensajes de Contacto</h2>
                    <p className="text-gray-400 mt-1 text-sm font-medium">Gestiona y responde las consultas enviadas por los clientes desde la web.</p>
                </div>
            </header>

            {/* Communication Dashboard */}
            <div className="grid grid-cols-12 gap-6">
                
                {/* Left: Navigation Chips & Filters */}
                <div className="col-span-12 lg:col-span-3 space-y-6">
                    <div className="bg-[#1c1d18]/60 backdrop-blur-md p-6 rounded-2xl border border-[#2d2e26] shadow-lg space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Carpetas</h3>
                        <div className="space-y-1">
                            <button 
                                onClick={() => setFilterStatus('all')}
                                className={`w-full flex justify-between items-center px-4 py-3 rounded-xl transition-all ${filterStatus === 'all' ? 'bg-main/10 text-main font-bold border border-main/20' : 'text-gray-400 hover:bg-[#252620]/40 hover:text-white'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Inbox className="w-4 h-4 text-main" />
                                    <span className="text-sm">Todos</span>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${filterStatus === 'all' ? 'bg-main text-black' : 'bg-[#12130f] text-gray-400 border border-[#2d2e26]'}`}>{messages.length}</span>
                            </button>
                            <button 
                                onClick={() => setFilterStatus('unread')}
                                className={`w-full flex justify-between items-center px-4 py-3 rounded-xl transition-all ${filterStatus === 'unread' ? 'bg-main/10 text-main font-bold border border-main/20' : 'text-gray-400 hover:bg-[#252620]/40 hover:text-white'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-main" />
                                    <span className="text-sm">No Leídos</span>
                                </div>
                                {messages.filter(m => m.status === 'unread').length > 0 && (
                                    <span className="bg-main text-black text-[10px] font-bold px-2 py-0.5 rounded-full">{messages.filter(m => m.status === 'unread').length}</span>
                                )}
                            </button>
                            <button 
                                onClick={() => setFilterStatus('read')}
                                className={`w-full flex justify-between items-center px-4 py-3 rounded-xl transition-all ${filterStatus === 'read' ? 'bg-main/10 text-main font-bold border border-main/20' : 'text-gray-400 hover:bg-[#252620]/40 hover:text-white'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Send className="w-4 h-4 text-main" />
                                    <span className="text-sm">Leídos</span>
                                </div>
                            </button>
                            <button 
                                onClick={() => setFilterStatus('archived')}
                                className={`w-full flex justify-between items-center px-4 py-3 rounded-xl transition-all ${filterStatus === 'archived' ? 'bg-main/10 text-main font-bold border border-main/20' : 'text-gray-400 hover:bg-[#252620]/40 hover:text-white'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Archive className="w-4 h-4 text-main" />
                                    <span className="text-sm">Archivados</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#1c1d18]/60 backdrop-blur-md p-6 rounded-2xl border border-[#2d2e26] shadow-lg space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Etiquetas</h3>
                        <div className="flex flex-wrap gap-2">
                            <span className="bg-main/10 text-main border border-main/20 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer hover:bg-main/20 transition-colors">Soporte</span>
                            <span className="bg-[#12130f] text-gray-300 border border-[#2d2e26] px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:text-white transition-colors">Consultas</span>
                            <span className="bg-[#12130f] text-gray-300 border border-[#2d2e26] px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:text-white transition-colors">Comentarios</span>
                        </div>
                    </div>
                </div>

                {/* Right: Main Inbox List */}
                <div className="col-span-12 lg:col-span-9 flex flex-col gap-6">
                    <div className="bg-[#1c1d18]/60 backdrop-blur-md rounded-2xl overflow-hidden border border-[#2d2e26] shadow-lg relative min-h-125">
                        {/* Inbox Header Actions */}
                        <div className="px-6 py-4 flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#12130f]/60 border-b border-[#2d2e26]">
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Buscar mensajes..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 text-xs bg-[#12130f] text-white border border-[#2d2e26] rounded-xl focus:border-main transition-all outline-none"
                                    />
                                </div>
                                <button className="text-gray-400 hover:text-white transition-colors p-2 bg-[#12130f] rounded-xl border border-[#2d2e26] hover:border-main/30" onClick={fetchMessages} title="Actualizar Mensajes">
                                    <RefreshCw className="w-4 h-4 text-main" />
                                </button>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-medium text-gray-400 w-full sm:w-auto justify-end">
                                <span>Mostrando <strong className="text-white">{filteredMessages.length}</strong> de {messages.length}</span>
                            </div>
                        </div>

                        {/* Message List */}
                        <div className="divide-y divide-[#2d2e26] h-150 overflow-y-auto relative">
                            {filteredMessages.length === 0 ? (
                                <div className="px-6 py-24 text-center text-gray-500 absolute inset-0 flex flex-col items-center justify-center">
                                    <Mail className="w-16 h-16 mx-auto mb-4 opacity-20 text-main" />
                                    <p className="text-lg font-bold text-foreground font-sans">Bandeja Limpia</p>
                                    <p className="mt-1 text-sm text-gray-400">No hay mensajes pendientes por revisar.</p>
                                </div>
                            ) : (
                                filteredMessages.map((msg) => (
                                    <div key={msg.id} className={`px-6 py-5 flex flex-col md:flex-row md:items-center gap-4 hover:bg-[#252620]/30 transition-colors cursor-pointer group relative ${msg.status === 'unread' ? '' : 'opacity-80'}`}>
                                        {msg.status === 'unread' && (
                                            <div className="absolute left-0 top-3 bottom-3 w-1 bg-main rounded-r-full"></div>
                                        )}
                                        <div className="flex items-center gap-4 w-full md:w-56 shrink-0">
                                            <Star className={`w-4 h-4 shrink-0 ${msg.status === 'unread' ? 'text-main' : 'text-gray-600'} group-hover:text-main transition-colors`} />
                                            <div className="min-w-0">
                                                <p className={`font-bold text-sm truncate ${msg.status === 'unread' ? 'text-white' : 'text-gray-400'}`}>{msg.user_name}</p>
                                                <p className="text-[10px] text-main font-bold uppercase tracking-tight truncate mt-0.5">{msg.user_email}</p>
                                            </div>
                                        </div>
                                        <div className="grow min-w-0 pr-4 pl-8 md:pl-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-sm tracking-tight truncate ${msg.status === 'unread' ? 'font-bold text-white' : 'font-medium text-gray-400'}`}>
                                                    Mensaje web #{msg.id.substring(0, 5).toUpperCase()}
                                                </span>
                                                {msg.status === 'unread' && <span className="bg-main/10 border border-main/20 shrink-0 text-main text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase">Nuevo</span>}
                                            </div>
                                            <p className="text-xs text-gray-400 line-clamp-1 group-hover:line-clamp-none transition-all duration-300 relative">{msg.content}</p>
                                        </div>
                                        <div className="w-full md:w-32 pl-8 md:pl-0 text-left md:text-right shrink-0 flex md:flex-col justify-between items-center md:items-end">
                                            <p className={`text-xs ${msg.status === 'unread' ? 'font-bold text-white' : 'text-gray-500'}`}>
                                                {new Date(msg.created_at).toLocaleDateString('es-AR', { month: 'short', day: 'numeric' })}
                                            </p>
                                            <div className="mt-2 text-gray-400 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-1.5 md:gap-2">
                                                {msg.status === 'unread' ? (
                                                    <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(msg.id, 'read'); }} className="p-1.5 hover:bg-main/20 hover:text-main rounded-lg transition-colors" title="Marcar como leído"><Star className="w-3.5 h-3.5" /></button>
                                                ) : (
                                                    <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(msg.id, 'unread'); }} className="p-1.5 hover:bg-main/20 hover:text-main rounded-lg transition-colors" title="Marcar como no leído"><Mail className="w-3.5 h-3.5" /></button>
                                                )}
                                                
                                                {msg.status !== 'archived' && (
                                                    <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(msg.id, 'archived'); }} className="p-1.5 hover:bg-main/20 hover:text-main rounded-lg transition-colors" title="Archivar"><Archive className="w-3.5 h-3.5" /></button>
                                                )}
                                                
                                                <button onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }} className="p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors" title="Eliminar mensaje"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

