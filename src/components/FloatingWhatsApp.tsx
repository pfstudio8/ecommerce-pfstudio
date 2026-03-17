"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function FloatingWhatsApp() {
    const [whatsapp, setWhatsapp] = useState("5491100000000");

    useEffect(() => {
        const fetchNumber = async () => {
            try {
                const { data } = await supabase
                    .from('settings')
                    .select('value')
                    .eq('key', 'store_info')
                    .single();
                
                if (data?.value?.whatsapp) {
                    setWhatsapp(data.value.whatsapp);
                }
            } catch (err) {
                // Silently ignore errors for public UI
            }
        };
        fetchNumber();
    }, []);

    return (
        <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        >
            <svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
        </a>
    );
}
