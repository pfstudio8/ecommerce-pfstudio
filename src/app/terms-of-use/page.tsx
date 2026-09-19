import React from 'react';

export default function TerminosDeUsoPage() {
    return (
        <div className="min-h-screen pt-32 pb-24 bg-surface font-sans text-on-surface">
            <div className="container mx-auto px-6 max-w-4xl">
                <h1 className="text-display-md font-display-md mb-8">Términos de Uso</h1>
                <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant shadow-sm prose max-w-none">
                    <p className="text-body-md text-on-surface-variant mb-4">Bienvenido a PFSTUDIO. Al utilizar nuestro sitio web y servicios, usted acepta los siguientes términos y condiciones.</p>
                    
                    <h2 className="text-title-lg font-bold mt-6 mb-2">1. Uso de los Servicios</h2>
                    <p className="text-body-md text-on-surface-variant mb-4">La plataforma de diseño (Custom Studio) está pensada para la pre-visualización de los productos. Los colores mostrados en pantalla pueden diferir ligeramente del producto físico debido a variaciones en monitores y tintas.</p>
                    
                    <h2 className="text-title-lg font-bold mt-6 mb-2">2. Propiedad Intelectual</h2>
                    <p className="text-body-md text-on-surface-variant mb-4">Al subir un diseño o imagen a nuestra plataforma, usted declara tener los derechos necesarios sobre la misma. PFSTUDIO no se responsabiliza por infracciones de copyright cometidas por los usuarios.</p>
                    
                    <h2 className="text-title-lg font-bold mt-6 mb-2">3. Pedidos y Pagos</h2>
                    <p className="text-body-md text-on-surface-variant mb-4">Una vez confirmado y pagado un pedido personalizado, no se admiten cancelaciones si el mismo ya ha entrado en la etapa de producción.</p>
                </div>
            </div>
        </div>
    );
}
