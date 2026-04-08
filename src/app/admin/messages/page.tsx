"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, Search, RefreshCw, Archive, Trash2, Star, Bolt, Smile, Loader2, Inbox, Send } from "lucide-react";
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
                <Loader2 className="w-8 h-8 animate-spin text-[#85adff]" />
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            {/* Editorial Header Section */}
            <div className="mb-10 pt-4 flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-[#f9f5f8] mb-2 font-['Manrope']">Message Inbox</h1>
                    <p className="text-[#adaaad] max-w-2xl text-sm">Manage your customer inquiries, supplier communications, and internal team threads from a single command center.</p>
                </div>
            </div>

            {/* Bento Grid Communication Dashboard */}
            <div className="grid grid-cols-12 gap-6">
                
                {/* Left: Navigation Chips & Filters */}
                <div className="col-span-12 lg:col-span-3 space-y-6">
                    <div className="bg-[#19191c] p-6 rounded-xl border border-[#48474a]/10 space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#adaaad]">Folders</h3>
                        <div className="space-y-1">
                            <button 
                                onClick={() => setFilterStatus('all')}
                                className={`w-full flex justify-between items-center px-4 py-3 rounded-lg transition-colors ${filterStatus === 'all' ? 'bg-[#85adff]/10 text-[#85adff] font-semibold' : 'text-[#adaaad] hover:bg-[#1f1f22]'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Inbox className="w-4 h-4" />
                                    <span className="text-sm">All Messages</span>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${filterStatus === 'all' ? 'bg-[#85adff] text-[#000000] font-bold' : 'bg-[#262528] text-[#f9f5f8]'}`}>{messages.length}</span>
                            </button>
                            <button 
                                onClick={() => setFilterStatus('unread')}
                                className={`w-full flex justify-between items-center px-4 py-3 rounded-lg transition-colors ${filterStatus === 'unread' ? 'bg-[#85adff]/10 text-[#85adff] font-semibold' : 'text-[#adaaad] hover:bg-[#1f1f22]'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4" />
                                    <span className="text-sm">Unread</span>
                                </div>
                                {messages.filter(m => m.status === 'unread').length > 0 && (
                                    <span className="bg-[#ff716c] text-[#000000] text-[10px] font-bold px-2 py-0.5 rounded-full">{messages.filter(m => m.status === 'unread').length}</span>
                                )}
                            </button>
                            <button 
                                onClick={() => setFilterStatus('read')}
                                className={`w-full flex justify-between items-center px-4 py-3 rounded-lg transition-colors ${filterStatus === 'read' ? 'bg-[#85adff]/10 text-[#85adff] font-semibold' : 'text-[#adaaad] hover:bg-[#1f1f22]'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Send className="w-4 h-4" />
                                    <span className="text-sm">Read</span>
                                </div>
                            </button>
                            <button 
                                onClick={() => setFilterStatus('archived')}
                                className={`w-full flex justify-between items-center px-4 py-3 rounded-lg transition-colors ${filterStatus === 'archived' ? 'bg-[#85adff]/10 text-[#85adff] font-semibold' : 'text-[#adaaad] hover:bg-[#1f1f22]'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Archive className="w-4 h-4" />
                                    <span className="text-sm">Archived</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#19191c] p-6 rounded-xl border border-[#48474a]/10 space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#adaaad]">Labels</h3>
                        <div className="flex flex-wrap gap-2">
                            <span className="bg-[#69f6b8]/10 text-[#69f6b8] border border-[#69f6b8]/20 px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:bg-[#69f6b8]/20 transition-colors">Support</span>
                            <span className="bg-[#ac8aff]/10 text-[#ac8aff] border border-[#ac8aff]/20 px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:bg-[#ac8aff]/20 transition-colors">Inquiries</span>
                            <span className="bg-[#262528] text-[#adaaad] border border-[#48474a]/10 px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:bg-[#2c2c2f] transition-colors">Feedback</span>
                        </div>
                    </div>
                </div>

                {/* Right: Main Inbox List */}
                <div className="col-span-12 lg:col-span-9 flex flex-col gap-6">
                    <div className="bg-[#19191c] rounded-xl overflow-hidden shadow-xl border border-[#48474a]/10 relative min-h-[500px]">
                        {/* Inbox Header Actions */}
                        <div className="px-6 py-4 flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#1f1f22]/50 border-b border-[#48474a]/10">
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#adaaad]" />
                                    <input
                                        type="text"
                                        placeholder="Search messages..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 text-sm bg-[#131315] text-[#f9f5f8] border border-[#48474a]/10 rounded-lg focus:ring-1 focus:ring-[#85adff] focus:border-transparent transition-all outline-none"
                                    />
                                </div>
                                <button className="text-[#adaaad] hover:text-[#f9f5f8] transition-colors p-2 bg-[#131315] rounded-lg border border-[#48474a]/10 hover:border-[#48474a]/30" onClick={fetchMessages} title="Refresh Inbox">
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-medium text-[#adaaad] w-full sm:w-auto justify-end">
                                <span>Showing {filteredMessages.length} of {messages.length}</span>
                            </div>
                        </div>

                        {/* Message List */}
                        <div className="divide-y divide-[#48474a]/10 h-[600px] overflow-y-auto custom-scrollbar relative">
                            {filteredMessages.length === 0 ? (
                                <div className="px-6 py-24 text-center text-[#adaaad] absolute inset-0 flex flex-col items-center justify-center">
                                    <Mail className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                    <p className="text-lg font-bold text-[#f9f5f8]">Inbox Zero</p>
                                    <p className="mt-1">You are all caught up!</p>
                                </div>
                            ) : (
                                filteredMessages.map((msg) => (
                                    <div key={msg.id} className={`px-6 py-6 flex flex-col md:flex-row md:items-center gap-4 hover:bg-[#1f1f22] transition-colors cursor-pointer group relative ${msg.status === 'unread' ? '' : 'opacity-80'}`}>
                                        {msg.status === 'unread' && (
                                            <div className="absolute left-0 top-3 bottom-3 w-1 bg-[#85adff] rounded-r-full"></div>
                                        )}
                                        <div className="flex items-center gap-4 w-full md:w-56 flex-shrink-0">
                                            <Star className={`w-4 h-4 flex-shrink-0 ${msg.status === 'unread' ? 'text-[#85adff]' : 'text-[#adaaad]/50'} group-hover:text-[#85adff] transition-colors`} />
                                            <div className="min-w-0">
                                                <p className={`font-bold text-sm truncate ${msg.status === 'unread' ? 'text-[#f9f5f8]' : 'text-[#adaaad]'}`}>{msg.user_name}</p>
                                                <p className="text-[10px] text-[#85adff] font-bold uppercase tracking-tight truncate mt-0.5">{msg.user_email}</p>
                                            </div>
                                        </div>
                                        <div className="flex-grow min-w-0 pr-4 pl-8 md:pl-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-sm tracking-tight truncate ${msg.status === 'unread' ? 'font-bold text-[#f9f5f8]' : 'font-medium text-[#adaaad]'}`}>
                                                    Mensaje web #{msg.id.substring(0, 5).toUpperCase()}
                                                </span>
                                                {msg.status === 'unread' && <span className="bg-[#ff716c]/20 flex-shrink-0 text-[#ff716c] text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase uppercase">Nuevo</span>}
                                            </div>
                                            <p className="text-sm text-[#adaaad] line-clamp-1 group-hover:line-clamp-none transition-all duration-300 relative">{msg.content}</p>
                                        </div>
                                        <div className="w-full md:w-32 pl-8 md:pl-0 text-left md:text-right flex-shrink-0 flex md:flex-col justify-between items-center md:items-end">
                                            <p className={`text-xs ${msg.status === 'unread' ? 'font-bold text-[#f9f5f8]' : 'text-[#adaaad]'}`}>
                                                {new Date(msg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </p>
                                            <div className="mt-2 text-[#adaaad] opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-1.5 md:gap-2">
                                                {msg.status === 'unread' ? (
                                                    <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(msg.id, 'read'); }} className="hover:bg-[#69f6b8]/10 hover:text-[#69f6b8] transition-colors p-1.5 rounded-md" title="Marcar como leído"><Star className="w-3.5 h-3.5" /></button>
                                                ) : (
                                                    <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(msg.id, 'unread'); }} className="hover:bg-[#85adff]/10 hover:text-[#85adff] transition-colors p-1.5 rounded-md" title="Marcar como no leído"><Mail className="w-3.5 h-3.5" /></button>
                                                )}
                                                
                                                {msg.status !== 'archived' && (
                                                    <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(msg.id, 'archived'); }} className="hover:bg-[#ac8aff]/10 hover:text-[#ac8aff] transition-colors p-1.5 rounded-md" title="Archivar"><Archive className="w-3.5 h-3.5" /></button>
                                                )}
                                                
                                                <button onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }} className="hover:bg-[#ff716c]/10 hover:text-[#ff716c] transition-colors p-1.5 rounded-md" title="Eliminar mensaje"><Trash2 className="w-3.5 h-3.5" /></button>
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
