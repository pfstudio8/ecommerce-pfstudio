"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, Loader2, Search, Trash2, CheckCircle2, ChevronDown, Clock, Archive } from "lucide-react";
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
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-main)]" />
            </div>
        );
    }

    const unreadCount = messages.filter(m => m.status === 'unread').length;

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-1 flex items-center gap-3">
                        Bandeja de Entrada
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                                {unreadCount} nuevos
                            </span>
                        )}
                    </h1>
                    <p className="text-sm text-gray-400">Lee y responde los mensajes enviados desde el formulario de contacto.</p>
                </div>
            </div>

            <div className="bg-[#0c0e15] rounded-2xl border border-[#1e212b] shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-[#1e212b] flex flex-col sm:flex-row gap-4 justify-between bg-[#0c0e15]">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar nombre, correo o mensaje..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-[#1e212b] text-white border-[#2a2e3b] rounded-xl focus:ring-2 focus:ring-[var(--color-main)] focus:border-transparent transition-all outline-none border"
                        />
                    </div>
                    
                    <div className="flex gap-2 relative">
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="appearance-none pl-4 pr-10 py-2 text-sm bg-[#1e212b] text-white border border-[#2a2e3b] rounded-xl focus:ring-2 focus:ring-[var(--color-main)] focus:border-transparent transition-all outline-none font-medium cursor-pointer"
                        >
                            <option value="all">Todas las bandejas</option>
                            <option value="unread">No leídos</option>
                            <option value="read">Leídos</option>
                            <option value="archived">Archivados</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
                
                <div className="divide-y divide-[#1e212b]">
                    {filteredMessages.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <Mail className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No se encontraron mensajes condichos filtros.</p>
                        </div>
                    ) : (
                        filteredMessages.map((msg) => (
                            <div key={msg.id} className={`p-6 flex flex-col sm:flex-row gap-6 hover:bg-[#141722] transition-colors ${msg.status === 'unread' ? 'bg-[#1e212b]/30' : ''}`}>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className={`font-bold text-base ${msg.status === 'unread' ? 'text-white' : 'text-gray-300'}`}>
                                            {msg.user_name}
                                        </h3>
                                        <span className="text-xs text-gray-500 bg-[#1e212b] px-2 py-0.5 rounded-full border border-[#2a2e3b]">
                                            {msg.user_email}
                                        </span>
                                        {msg.status === 'unread' && (
                                            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
                                        )}
                                    </div>
                                    <p className={`text-sm ${msg.status === 'unread' ? 'text-gray-300' : 'text-gray-500'}`}>
                                        {msg.content}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
                                        <Clock className="w-3 h-3" />
                                        {new Date(msg.created_at).toLocaleString('es-AR', {
                                            day: '2-digit', month: 'short', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                                
                                <div className="flex sm:flex-col gap-2 shrink-0 justify-end sm:justify-start">
                                    {msg.status !== 'read' && (
                                        <button 
                                            onClick={() => handleUpdateStatus(msg.id, 'read')}
                                            className="p-2 bg-[#1e212b] hover:bg-gray-800 border border-[#2a2e3b] text-white rounded-lg transition-colors flex items-center justify-center group" 
                                            title="Marcar como Leído"
                                        >
                                            <CheckCircle2 className="w-4 h-4 text-gray-400 group-hover:text-green-400" />
                                        </button>
                                    )}
                                    {msg.status !== 'archived' && (
                                        <button 
                                            onClick={() => handleUpdateStatus(msg.id, 'archived')}
                                            className="p-2 bg-[#1e212b] hover:bg-gray-800 border border-[#2a2e3b] text-white rounded-lg transition-colors flex items-center justify-center group" 
                                            title="Archivar"
                                        >
                                            <Archive className="w-4 h-4 text-gray-400 group-hover:text-[var(--color-main)]" />
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => handleDelete(msg.id)}
                                        className="p-2 bg-[#1e212b] hover:bg-red-950/40 border border-[#2a2e3b] hover:border-red-900/50 text-white rounded-lg transition-colors flex items-center justify-center group" 
                                        title="Eliminar permanentemente"
                                    >
                                        <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
