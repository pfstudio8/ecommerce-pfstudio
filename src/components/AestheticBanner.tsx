"use client";

export default function AestheticBanner() {
    return (
        <section className="relative h-96 overflow-hidden group mt-10">
            {/* You can replace this image later with your own cinematic photo */}
            <img 
                className="w-full h-full object-cover" 
                alt="Fondo Cinemático PFSTUDIO" 
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/40 to-transparent flex flex-col justify-end p-4 md:p-12">
                <div className="bg-black/60 backdrop-blur-md p-8 rounded-xl max-w-2xl border border-white/5 shadow-2xl">
                    <h2 className="font-black text-3xl tracking-tight text-[var(--foreground)] mb-2 uppercase">PFSTUDIO Pulse</h2>
                    <p className="text-gray-300 font-medium leading-relaxed">
                        Únete a nuestra lista de acceso prioritario para lanzamientos exclusivos y drops de edición limitada antes que nadie.
                    </p>
                    <div className="mt-6 flex flex-col sm:flex-row gap-4">
                        <input 
                            className="flex-grow bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-main)] text-white px-4 py-3 text-sm placeholder:text-gray-500" 
                            placeholder="tu@email.com" 
                            type="email"
                        />
                        <button className="bg-[var(--color-main)] text-white tracking-wider font-bold px-8 py-3 rounded-lg hover:opacity-90 transition-all uppercase text-sm shadow-lg shadow-[var(--color-main)]/20">
                            Unirse
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
