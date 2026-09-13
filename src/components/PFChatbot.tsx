"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, ExternalLink, Bot } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useChatStore } from "@/store/chat";
import dynamic from "next/dynamic";
import { BotPose } from "./PFBotAvatar3D";

const PFBotAvatar3D = dynamic(() => import("./PFBotAvatar3D"), { ssr: false });

interface Message {
    id: string;
    sender: 'bot' | 'user';
    text: string;
    options?: { label: string; action: string }[];
    link?: { url: string; label: string };
}

export default function PFChatbot() {
    const pathname = usePathname();
    const { isOpen, setIsOpen } = useChatStore();
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [unreadBadge, setUnreadBadge] = useState(true);
    const [whatsappNumber, setWhatsappNumber] = useState("5493704724837");
    const [botPose, setBotPose] = useState<BotPose>('idle');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Formateador de sintaxis Markdown (reemplaza **texto** por texto en negrita resaltado)
    const renderFormattedText = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <strong key={index} className="font-extrabold text-emerald-300">
                        {part.slice(2, -2)}
                    </strong>
                );
            }
            return part;
        });
    };

    // Draggable state tracking to avoid click on drag
    const isDraggingRef = useRef(false);
    const dragStartPosRef = useRef({ x: 0, y: 0 });

    const initialMessages: Message[] = [
        {
            id: '1',
            sender: 'bot',
            text: "¡Hola! 👋 Soy **Coco**, tu **Asistente AI** 3D oficial de **PFSTUDIO** 🎨✨.\n\nEstoy entrenado para responder todas tus dudas al instante. ¿Sobre qué te gustaría consultar?",
            options: [
                { label: "👕 Talles y Calces (Oversize/Boxy)", action: "talles" },
                { label: "🎨 Diseñador 2D/3D & Custom", action: "sublimacion" },
                { label: "🚚 Envíos & Retiro en Taller", action: "envios" },
                { label: "📦 Estado de mi Pedido", action: "seguimiento" },
                { label: "💳 Pagos, Alias & Comprobantes", action: "pagos" },
                { label: "🧼 Cuidado & Lavado de Prendas", action: "lavado" },
                { label: "🔄 Cambios & Garantía", action: "cambios" },
                { label: "📦 Ventas Mayoristas", action: "mayorista" },
                { label: "📲 Contactar por WhatsApp", action: "humano" }
            ]
        }
    ];

    const [messages, setMessages] = useState<Message[]>(initialMessages);

    // Fetch store info
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await supabase
                    .from('settings')
                    .select('value')
                    .eq('key', 'store_info')
                    .single();
                if (data?.value?.whatsapp) {
                    setWhatsappNumber(data.value.whatsapp);
                }
            } catch (err) {
                // Silently fallback
            }
        };
        fetchSettings();
    }, []);

    // Auto scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            setUnreadBadge(false);
            setBotPose('waving');
            const timer = setTimeout(() => setBotPose('idle'), 2500);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages]);

    const handleDragStart = (event: any, info: any) => {
        isDraggingRef.current = false;
        dragStartPosRef.current = { x: info.point.x, y: info.point.y };
    };

    const handleDrag = (event: any, info: any) => {
        const distance = Math.hypot(
            info.point.x - dragStartPosRef.current.x,
            info.point.y - dragStartPosRef.current.y
        );
        if (distance > 6) {
            isDraggingRef.current = true;
        }
    };

    const handleDragEnd = () => {
        setTimeout(() => {
            isDraggingRef.current = false;
        }, 150);
    };

    const handleToggleOpen = () => {
        if (isDraggingRef.current) return;
        setIsOpen((prev) => !prev);
    };

    // Handle predefined quick actions with 3D pose updates
    const handleQuickAction = (actionKey: string, label: string) => {
        const userMsg: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: label
        };

        setMessages((prev) => [...prev, userMsg]);
        setIsTyping(true);
        setBotPose('thinking');

        setTimeout(() => {
            let botReply: Message;
            let targetPose: BotPose = 'idle';

            switch (actionKey) {
                case 'talles':
                    targetPose = 'talles';
                    botReply = {
                        id: (Date.now() + 1).toString(),
                        sender: 'bot',
                        text: "📏 **Guía Completa de Talles y Calce PFSTUDIO**:\n\n• **Remeras Oversize**: Calce holgado, hombros caídos y mangas amplias. Si querés el look oversize clásico, pedí tu talle habitual. Si preferís un calce más al cuerpo, elegí 1 talle menos.\n• **Boxy Fit**: Corte cuadrado, hombros marcados, silueta recta y tronco ligeramente más corto con cuello estructurado.\n• **Clásica**: Ajuste regular estándar al cuerpo.\n\n💡 *Tip*: Podés ver la tabla detallada de medidas en centímetros (ancho y largo) ingresando a la ficha de cualquier prenda.",
                        options: [
                            { label: "Ver Catálogo", action: "catalogo" },
                            { label: "Consultar por WhatsApp", action: "humano" }
                        ]
                    };
                    break;
                case 'sublimacion':
                    targetPose = 'sublimacion';
                    botReply = {
                        id: (Date.now() + 1).toString(),
                        sender: 'bot',
                        text: "🎨 **Custom Studio 2D/3D & Estampados Personalizados**:\n\nCreá tu propio producto en tiempo real:\n• **Remeras & Buzos**: Vinilo textil sublimable premium de alta definición y durabilidad extrema.\n• **Accesorios Polímero**: Llaveros (forma camiseta, corazón, círculo, rectángulo), tazas y gorras.\n\n✨ Podés subir tu foto, logo o imagen preferida (recomendado fondo transparente PNG o alta resolución JPG).",
                        link: { url: "#personalizador", label: "Ir al Diseñador 2D/3D" }
                    };
                    break;
                case 'envios':
                    targetPose = 'envios';
                    botReply = {
                        id: (Date.now() + 1).toString(),
                        sender: 'bot',
                        text: "📍 **Retiro en Taller y Entregas Coordinadas**:\n\n• **Retiro gratis en Taller**: Podés comprar online y retirar gratis por nuestro taller de producción local.\n• **Entregas**: Coordinamos la entrega directamente a través de nuestro WhatsApp oficial.\n• **Tiempos de confección**: Prendas de catálogo en 24-48hs. Diseños personalizados a medida en 2 a 4 días hábiles.",
                        options: [
                            { label: "📦 Estado de mi Pedido", action: "seguimiento" },
                            { label: "📍 Dirección del Taller", action: "ubicacion" }
                        ]
                    };
                    break;
                case 'seguimiento':
                    targetPose = 'envios';
                    botReply = {
                        id: (Date.now() + 1).toString(),
                        sender: 'bot',
                        text: "🔍 **Estado de tu Pedido**:\n\nPodés consultar el estado exacto de fabricación y pago de tu compra ingresando a **Mi Perfil > Mis Pedidos**.",
                        link: { url: "/mis-pedidos", label: "Ir a Mis Pedidos" },
                        options: [
                            { label: "Contactar a un Asesor", action: "humano" }
                        ]
                    };
                    break;
                case 'pagos':
                    targetPose = 'pagos';
                    botReply = {
                        id: (Date.now() + 1).toString(),
                        sender: 'bot',
                        text: "💳 **Formas de Pago & Alias Oficial**:\n\n1. **Mercado Pago**: Tarjetas de crédito (hasta cuotas), débito y dinero disponible.\n2. **Transferencia Bancaria (Naranja X)**:\n   • **Alias**: `PFSTUDIO.VENTAS`\n\n📌 *Importante*: Si pagás por transferencia, una vez realizada enviá el comprobante por WhatsApp junto a tu número de orden de compra.",
                        options: [
                            { label: "📲 Enviar Comprobante", action: "humano" }
                        ]
                    };
                    break;
                case 'lavado':
                    targetPose = 'idle';
                    botReply = {
                        id: (Date.now() + 1).toString(),
                        sender: 'bot',
                        text: "🧼 **Cuidado y Lavado para Máxima Durabilidad**:\n\n• Lavar siempre la prenda **del revés** con agua fría (máximo 30°C).\n• No usar blanqueadores agresivos ni lavandina.\n• Secar colgado a la sombra (evitar secadora de calor extremo).\n• ⚠️ **Planchado**: NUNCA pasar la plancha directo sobre la estampa o vinilo. Planchar del revés o con una tela protectora encima.",
                        options: [
                            { label: "Ver Guía de Talles", action: "talles" },
                            { label: "Ver Productos", action: "catalogo" }
                        ]
                    };
                    break;
                case 'cambios':
                    targetPose = 'idle';
                    botReply = {
                        id: (Date.now() + 1).toString(),
                        sender: 'bot',
                        text: "🔄 **Políticas de Cambios y Garantía de Calidad**:\n\n• **Garantía Total por Falla**: Si tu prenda presenta algún defecto de fabricación o estampado, te la reemplazamos sin costo adicional.\n• **Cambio de Talle**: Tenés hasta 10 días desde la recepción para solicitar cambio en prendas estándar del catálogo.\n• **Productos Personalizados**: Al confeccionarse exclusivamente a tu gusto, solo aplican cambios por fallas de confección.",
                        options: [
                            { label: "Hablar con Soporte", action: "humano" }
                        ]
                    };
                    break;
                case 'mayorista':
                    targetPose = 'waving';
                    botReply = {
                        id: (Date.now() + 1).toString(),
                        sender: 'bot',
                        text: "📦 **Ventas Mayoristas & Revendedores**:\n\n¡Ofrecemos precios preferenciales por cantidad para marcas, emprendimientos y revendedores!\n• Remeras Oversize / Boxy por curva o volumen.\n• Estampados personalizados a gran escala.\n\nEscribinos directamente a WhatsApp indicando la cantidad que buscas para enviarte la lista de precios mayorista.",
                        link: {
                            url: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hola! Quisiera recibir información sobre ventas mayoristas de PFSTUDIO.")}`,
                            label: "Solicitar Precios Mayoristas"
                        }
                    };
                    break;
                case 'ubicacion':
                    targetPose = 'idle';
                    botReply = {
                        id: (Date.now() + 1).toString(),
                        sender: 'bot',
                        text: "📍 **Taller de Producción & Horarios**:\n\n• **Atención Virtual**: 24/7 a través de nuestro bot Coco y sitio web.\n• **Horario Taller & WhatsApp**: Lunes a Sábado de 09:00 a 20:00 hs.\n• **Retiro de Pedidos**: Coordinamos las entregas en taller una vez que tu pedido figure como listo en tu cuenta.",
                        options: [
                            { label: "Coordinar Retiro en WhatsApp", action: "humano" }
                        ]
                    };
                    break;
                case 'humano':
                    targetPose = 'waving';
                    botReply = {
                        id: (Date.now() + 1).toString(),
                        sender: 'bot',
                        text: "📲 **Atención Personalizada en WhatsApp**:\n\nNuestro equipo está disponible para ayudarte de forma directa con tu pedido, dudas específicas o personalizaciones avanzadas.",
                        link: {
                            url: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hola! Vengo de la web de PFSTUDIO y quisiera hacer una consulta.")}`,
                            label: "Abrir WhatsApp de PFSTUDIO"
                        }
                    };
                    break;
                case 'catalogo':
                    targetPose = 'idle';
                    botReply = {
                        id: (Date.now() + 1).toString(),
                        sender: 'bot',
                        text: "🔥 Podés explorar toda nuestra colección de remeras Oversize, Boxy Fit y accesorios en el catálogo principal.",
                        link: { url: "/#productos", label: "Explorar Productos" }
                    };
                    break;
                default:
                    targetPose = 'idle';
                    botReply = {
                        id: (Date.now() + 1).toString(),
                        sender: 'bot',
                        text: "¿Te gustaría hablar directamente con el equipo por WhatsApp para resolver tu consulta?",
                        options: [{ label: "Hablar por WhatsApp", action: "humano" }]
                    };
            }

            setMessages((prev) => [...prev, botReply]);
            setIsTyping(false);
            setBotPose(targetPose);
        }, 600);
    };

    // Handle free text input with comprehensive smart intent engine & 3D poses
    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const text = input.trim();
        const userMsg: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: text
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);
        setBotPose('thinking');

        setTimeout(() => {
            const lower = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            let responseText = "";
            let actionOptions: { label: string; action: string }[] | undefined;
            let externalLink: { url: string; label: string } | undefined;
            let targetPose: BotPose = 'idle';

            // INTENT MATCHING ENGINE MATRIX
            const isTalles = /talle|medida|medidas|oversize|boxy|fit|calce|tabla|largo|ancho|guia|corte|chico|grande|talla/.test(lower);
            const isCustom = /sublima|llavero|custom|diseno|estampa|foto|logo|imprimir|personaliz|taza|gorra|propio|creador|diseñador|vecto|imagen/.test(lower);
            const isSeguimiento = /donde esta|seguimiento|tracking|rastreo|codigo|guia|mi pedido|estado|donde viene|donde anda|llegado/.test(lower);
            const isEnvios = /envio|enviar|despacho|taller|retiro|retirar|correo|cuanto tarda|demora|llega|domicilio|costo|flete|sucursal/.test(lower);
            const isPagos = /pago|pagar|transfer|cbu|alias|tarjeta|mercadopago|comprobante|cuotas|descuento|promocion|cupon|efectivo|naranja/.test(lower);
            const isLavado = /lava|lavado|lavar|achica|desten|plancha|planchado|cuidado|secadora|agua fria|mantenimiento/.test(lower);
            const isCambios = /cambio|cambiar|devolucion|devuelv|garantia|fallado|defecto|roto|mal estado|reclamo/.test(lower);
            const isMayorista = /mayor|mayorista|revender|revendedor|cantidad|por mayor|volumen|descuento por cantidad/.test(lower);
            const isUbicacion = /donde estan|donde quedan|direccion|ubicacion|horario|abierto|local|mapa|telefono|donde son/.test(lower);
            const isContacto = /hola|buenas|saludos|contacto|humano|whatsapp|asesor|hablar|atencion|persona|ayuda/.test(lower);

            if (isSeguimiento) {
                targetPose = 'envios';
                responseText = "📦 **Estado de tu Pedido**:\nPodés verificar el estado de producción, empaque y pago de tu compra ingresando a **Mis Pedidos**.";
                externalLink = { url: "/mis-pedidos", label: "Ir a Mis Pedidos" };
                actionOptions = [{ label: "Consulta por WhatsApp", action: "humano" }];
            } else if (isTalles) {
                targetPose = 'talles';
                responseText = "📏 **Guía de Talles y Ajustes**:\nNuestras remeras **Oversize** tienen caída holgada y hombros caídos (te aconsejamos tu talle habitual). Las **Boxy Fit** ofrecen corte cuadrado más estructurado. Podés consultar la tabla exacta de dimensiones en cada producto.";
                actionOptions = [
                    { label: "Ver Guía Detallada", action: "talles" },
                    { label: "Ver Productos", action: "catalogo" }
                ];
            } else if (isCustom) {
                targetPose = 'sublimacion';
                responseText = "🎨 **Diseñador Interactivo Custom 2D/3D**:\n¡Creá tu diseño propio! Podés subir cualquier foto, logo o imagen en PNG o JPG a nuestra herramienta interactiva para personalizar remeras, llaveros polímero, tazas y gorras.";
                externalLink = { url: "#personalizador", label: "Ir al Personalizador 2D/3D" };
            } else if (isEnvios) {
                targetPose = 'envios';
                responseText = "📍 **Retiro en Taller y Entregas Coordinadas**:\nPodés retirar tu pedido **sin costo** por nuestro taller de producción local o coordinar la entrega directa por nuestro WhatsApp oficial.";
                actionOptions = [
                    { label: "📍 Ver Ubicación del Taller", action: "ubicacion" },
                    { label: "📲 Contactar por WhatsApp", action: "humano" }
                ];
            } else if (isPagos) {
                targetPose = 'pagos';
                responseText = "💳 **Medios de Pago y Datos Bancarios**:\nAceptamos **Mercado Pago** (tarjetas/cuotas) y **Transferencia Bancaria** (Alias: `PFSTUDIO.VENTAS`). ¡Recordá enviar el comprobante con tu N° de orden por WhatsApp!";
                actionOptions = [{ label: "Enviar Comprobante por WhatsApp", action: "humano" }];
            } else if (isLavado) {
                targetPose = 'idle';
                responseText = "🧼 **Instrucciones de Lavado**:\nLavar siempre del revés con agua fría (máx 30°C) y secar a la sombra. ⚠️ **Nunca planchar directamente sobre la estampa o vinilo**.";
                actionOptions = [{ label: "Ver Guía de Cuidado", action: "lavado" }];
            } else if (isCambios) {
                targetPose = 'idle';
                responseText = "🔄 **Cambios y Garantía**:\nContás con garantía total ante defectos de fábrica. Para cambio de talle en prendas estándar disponés de 10 días desde la entrega.";
                actionOptions = [{ label: "Ver Políticas de Cambio", action: "cambios" }];
            } else if (isMayorista) {
                targetPose = 'waving';
                responseText = "📦 **Ventas al Por Mayor**:\nContamos con precios preferenciales para revendedores en remeras Oversize/Boxy y sublimaciones en volumen. ¡Contactanos por WhatsApp para recibir el catálogo mayorista!";
                actionOptions = [{ label: "Solicitar Precios Mayoristas", action: "mayorista" }];
            } else if (isUbicacion) {
                targetPose = 'idle';
                responseText = "📍 **Horarios y Taller PFSTUDIO**:\nAtendemos en taller y WhatsApp de Lunes a Sábados de 09:00 a 20:00 hs para entregas y consultas.";
                actionOptions = [{ label: "Hablar por WhatsApp", action: "humano" }];
            } else if (isContacto) {
                targetPose = 'waving';
                responseText = "✨ ¡Hola! Soy Coco 🤖. Estoy listo para ayudarte con talles, envíos, pagos o diseños personalizados. ¿En qué te puedo asesorar?";
                actionOptions = [
                    { label: "👕 Guía de Talles", action: "talles" },
                    { label: "🎨 Personalizar Producto", action: "sublimacion" },
                    { label: "📲 Hablar con un Asesor", action: "humano" }
                ];
            } else {
                targetPose = 'idle';
                responseText = `Gracias por tu mensaje. Para darte la mejor asistencia sobre "${text}", podés tocar una de las opciones rápidas o escribirnos directamente a nuestro WhatsApp de atención oficial:`;
                externalLink = {
                    url: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hola! Quisiera consultar sobre: ${text}`)}`,
                    label: "Escribir a WhatsApp oficial"
                };
                actionOptions = [
                    { label: "👕 Talles", action: "talles" },
                    { label: "🚚 Envíos", action: "envios" },
                    { label: "💳 Pagos", action: "pagos" }
                ];
            }

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                text: responseText,
                options: actionOptions,
                link: externalLink
            };

            setMessages((prev) => [...prev, botMsg]);
            setIsTyping(false);
            setBotPose(targetPose);
        }, 650);
    };

    // Ocultar asistente en el panel de administración sin romper hooks
    if (pathname?.startsWith("/admin")) {
        return null;
    }

    return (
        <>
            {/* FLOATING STATIC ROBOT BUTTON (Positioned above WhatsApp; hidden when drawer is open) */}
            {!isOpen && (
                <div className="fixed bottom-24 right-6 z-50 flex items-center justify-end select-none">
                    <button
                        type="button"
                        onClick={() => setIsOpen(true)}
                        className="relative w-14 h-14 bg-zinc-900 border border-emerald-500/50 hover:border-emerald-400 shadow-xl shadow-emerald-500/20 backdrop-blur-xl rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center overflow-visible group"
                        title="ASISTENTE COCO"
                    >
                        <div className="relative flex items-center justify-center w-full h-full">
                            <PFBotAvatar3D pose="idle" size="xs" />
                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-zinc-950 animate-ping" />
                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-zinc-950" />
                        </div>
                    </button>

                    {/* Floating Notification Badge */}
                    {unreadBadge && (
                        <motion.div
                            initial={{ opacity: 0, x: 10, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            className="hidden md:flex items-center gap-2 bg-zinc-900 border border-emerald-500/40 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xl backdrop-blur-md cursor-pointer absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap hover:bg-zinc-850 transition-colors"
                            onClick={() => setIsOpen(true)}
                        >
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>ASISTENTE COCO</span>
                        </motion.div>
                    )}
                </div>
            )}

            {/* CHATBOT DRAWER OVERLAY (Slide-Over Panel like CartSidebar) */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Dim Backdrop Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
                        />

                        {/* Slide-over Right Drawer Window */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 220 }}
                            className="fixed top-0 right-0 bottom-0 w-full sm:w-96 md:w-105 bg-zinc-950 border-l border-zinc-800 shadow-2xl z-50 flex flex-col overflow-hidden text-white"
                        >
                            {/* ULTRA HIGH CONTRAST & LUXURY HEADER */}
                            <div className="p-5 bg-zinc-900/95 border-b border-emerald-500/30 flex items-center justify-between relative overflow-hidden shadow-lg">
                                {/* Ambient Emerald Glow */}
                                <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/15 blur-2xl pointer-events-none" />

                                <div className="flex items-center gap-3.5 relative z-10">
                                    {/* Futuristic 3D Mascot Avatar Frame */}
                                    <div className="relative w-13 h-13 rounded-2xl bg-zinc-950 border border-emerald-500/50 shadow-md shadow-emerald-500/20 flex items-center justify-center p-1 overflow-hidden shrink-0">
                                        <PFBotAvatar3D pose={botPose} size="sm" />
                                    </div>

                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-black text-white text-sm sm:text-base tracking-wide">
                                                ASISTENTE COCO
                                            </h3>
                                            <span className="text-[10px] font-mono font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full shadow-sm shadow-emerald-500/20">
                                                IA
                                            </span>
                                        </div>
                                        <p className="text-xs text-emerald-400/90 font-medium flex items-center gap-1.5 mt-0.5">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
                                            <span>En línea • Virtual PFSTUDIO</span>
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/10 active:scale-95 z-10"
                                    title="Cerrar Asistente"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* MESSAGES CONTAINER */}
                            <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 custom-scrollbar bg-zinc-950/80">
                                {messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                                    >
                                        <div
                                            className={`max-w-[88%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                                                msg.sender === 'user'
                                                    ? 'bg-linear-to-r from-emerald-600 to-emerald-500 text-white rounded-br-none shadow-md font-semibold'
                                                    : 'bg-zinc-900/95 border border-zinc-800 text-zinc-100 rounded-bl-none shadow-xl'
                                            }`}
                                        >
                                            <div className="whitespace-pre-line">
                                                {renderFormattedText(msg.text)}
                                            </div>

                                            {/* External Link Button if present */}
                                            {msg.link && (
                                                <a
                                                    href={msg.link.url}
                                                    target={msg.link.url.startsWith("http") ? "_blank" : "_self"}
                                                    rel="noopener noreferrer"
                                                    onClick={() => {
                                                        if (!msg.link?.url.startsWith("http")) setIsOpen(false);
                                                    }}
                                                    className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-black text-xs hover:bg-emerald-400 transition-all shadow-md w-full justify-center active:scale-95"
                                                >
                                                    <span>{msg.link.label}</span>
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>

                                        {/* Action Chips for quick options */}
                                        {msg.options && (
                                            <div className="flex flex-wrap gap-2 mt-3 max-w-[95%]">
                                                {msg.options.map((opt) => (
                                                    <button
                                                        key={opt.action}
                                                        type="button"
                                                        onClick={() => handleQuickAction(opt.action, opt.label)}
                                                        className="px-3.5 py-2 bg-zinc-900 hover:bg-emerald-500/20 text-zinc-300 hover:text-white border border-zinc-700/80 hover:border-emerald-500/60 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm text-left flex items-center gap-2 transform hover:scale-[1.02] active:scale-95"
                                                    >
                                                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                                        <span>{opt.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                ))}

                                {/* Typing Indicator */}
                                {isTyping && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex items-center gap-2 p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 w-fit"
                                    >
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </motion.div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* INPUT FOOTER */}
                            <form onSubmit={handleSend} className="p-4 bg-zinc-900 border-t border-zinc-800 flex items-center gap-2.5">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Escribí tu duda (talles, envíos, pagos...)"
                                    className="flex-1 px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 text-xs sm:text-sm font-medium"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="p-3 bg-emerald-500 text-zinc-950 font-black rounded-xl hover:bg-emerald-400 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md active:scale-95"
                                    title="Enviar mensaje"
                                >
                                    <Send className="w-4.5 h-4.5" />
                                </button>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

