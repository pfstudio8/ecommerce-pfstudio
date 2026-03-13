"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { MessageSquare, Mail, Loader2, Check, Trash2, MailOpen } from "lucide-react";
import { useAuthStore } from "@/store/auth";

interface ContactMessage {
    id: string;
    user_name: string;
    user_email: string;
    content: string;
    status: 'unread' | 'read' | 'archived';
    created_at: string;
}

export default function MessagesPage() {
    const isInitialized = useAuthStore((state) => state.isInitialized);
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isInitialized) return;

        const fetchMessages = async () => {
            try {
                const { data, error } = await supabase
                    .from('messages')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    setMessages(data);
                }
            } catch (err) {
                console.error("Error fetching messages", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessages();
    }, [isInitialized]);

    const handleMarkAsRead = async (id: string, currentStatus: string) => {
        if (currentStatus === 'read') return;

        try {
            const { error } = await supabase
                .from('messages')
                .update({ status: 'read' })
                .eq('id', id);

            if (!error) {
                setMessages(messages.map(m => m.id === id ? { ...m, status: 'read' } : m));
            }
        } catch (err) {
            console.error("Error updating message", err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este mensaje?")) return;

        try {
            const { error } = await supabase
                .from('messages')
                .delete()
                .eq('id', id);

            if (!error) {
                setMessages(messages.filter(m => m.id !== id));
            }
        } catch (err) {
            console.error("Error deleting message", err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-main)]" />
            </div>
        );
    }

    const unreadCount = messages.filter(m => m.status === 'unread').length;

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Mensajes</h1>
                    <p className="text-sm text-gray-400">Centro de comunicación con clientes.</p>
                </div>
                <div className="bg-[#1e212b] border border-[#2a2e3b] px-4 py-2 rounded-lg text-sm text-gray-300 flex items-center gap-2 w-fit">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {unreadCount} Mensaje{unreadCount !== 1 && 's'} Nuevo{unreadCount !== 1 && 's'}
                </div>
            </div>

            <div className="bg-[#0c0e15] rounded-2xl border border-[#1e212b] shadow-sm overflow-hidden flex flex-col">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="w-8 h-8 text-blue-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Bandeja Vacía</h2>
                        <p className="text-gray-400 text-sm max-w-sm">
                            Todavía no tienes mensajes. Cuando los clientes completen el formulario de contacto aparecerán aquí.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-[#1e212b]">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`p-6 transition-colors flex flex-col md:flex-row gap-6 ${message.status === 'unread' ? 'bg-[#141722]' : 'bg-[#0c0e15] hover:bg-[#141722]/50'}`}
                            >
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className={`font-bold ${message.status === 'unread' ? 'text-white' : 'text-gray-300'}`}>
                                                {message.user_name}
                                            </h3>
                                            <a href={`mailto:${message.user_email}`} className="text-sm text-blue-400 hover:underline">
                                                {message.user_email}
                                            </a>
                                        </div>
                                        <span className="text-xs text-gray-500 ml-4 shrink-0">
                                            {new Date(message.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className={`text-sm leading-relaxed ${message.status === 'unread' ? 'text-gray-300 font-medium' : 'text-gray-400'}`}>
                                        {message.content}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 md:self-start shrink-0">
                                    {message.status === 'unread' ? (
                                        <button
                                            onClick={() => handleMarkAsRead(message.id, message.status)}
                                            className="p-2 text-gray-400 hover:text-emerald-500 bg-[#1e212b] rounded-lg transition-colors cursor-pointer"
                                            title="Marcar como leído"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <div className="p-2 text-gray-600 bg-[#1e212b]/50 rounded-lg cursor-default" title="Leído">
                                            <MailOpen className="w-4 h-4" />
                                        </div>
                                    )}
                                    <button
                                        onClick={() => handleDelete(message.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 bg-[#1e212b] rounded-lg transition-colors cursor-pointer"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
