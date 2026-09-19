import React from 'react';

export default function PrivacidadPage() {
    return (
        <div className="min-h-screen pt-32 pb-24 bg-surface font-sans text-on-surface">
            <div className="container mx-auto px-6 max-w-4xl">
                <h1 className="text-display-md font-display-md mb-8">Política de Privacidad</h1>
                <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant shadow-sm prose max-w-none">
                    <p className="text-body-md text-on-surface-variant mb-4">En PFSTUDIO valoramos tu privacidad. Esta política describe cómo recopilamos y usamos tu información personal.</p>
                    
                    <h2 className="text-title-lg font-bold mt-6 mb-2">Recopilación de Datos</h2>
                    <p className="text-body-md text-on-surface-variant mb-4">Recopilamos información básica necesaria para procesar tus pedidos: nombre, dirección de envío, correo electrónico y teléfono.</p>
                    
                    <h2 className="text-title-lg font-bold mt-6 mb-2">Uso de la Información</h2>
                    <p className="text-body-md text-on-surface-variant mb-4">Tus datos son utilizados exclusivamente para la gestión de envíos, notificaciones del estado del pedido y comunicación directa en caso de eventualidades con tus diseños.</p>
                    
                    <h2 className="text-title-lg font-bold mt-6 mb-2">Protección y Seguridad</h2>
                    <p className="text-body-md text-on-surface-variant mb-4">No vendemos, alquilamos ni compartimos tu información personal con terceros. Los procesamientos de pagos son gestionados a través de plataformas seguras y externas (como MercadoPago).</p>
                </div>
            </div>
        </div>
    );
}
