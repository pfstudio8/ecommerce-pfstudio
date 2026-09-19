import React from 'react';

export default function PreguntasFrecuentesPage() {
    return (
        <div className="min-h-screen pt-32 pb-24 bg-surface font-sans text-on-surface">
            <div className="container mx-auto px-6 max-w-4xl">
                <h1 className="text-display-md font-display-md mb-8">Preguntas Frecuentes</h1>
                <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant shadow-sm space-y-6">
                    <div>
                        <h3 className="text-title-lg font-bold mb-2">¿Cuál es el tiempo de producción?</h3>
                        <p className="text-body-md text-on-surface-variant">Nuestro tiempo de producción express es de 24 a 48 horas hábiles para productos minoristas y muestras. Los pedidos mayoristas pueden demorar entre 7 y 15 días dependiendo del volumen.</p>
                    </div>
                    <div>
                        <h3 className="text-title-lg font-bold mb-2">¿Hacen envíos a todo el país?</h3>
                        <p className="text-body-md text-on-surface-variant">Sí, realizamos envíos a toda Argentina mediante Correo Argentino y otros servicios logísticos de confianza.</p>
                    </div>
                    <div>
                        <h3 className="text-title-lg font-bold mb-2">¿Qué métodos de pago aceptan?</h3>
                        <p className="text-body-md text-on-surface-variant">Aceptamos MercadoPago, tarjetas de crédito, débito y transferencias bancarias (con descuento especial).</p>
                    </div>
                    <div>
                        <h3 className="text-title-lg font-bold mb-2">¿Qué tipo de tela utilizan para las remeras?</h3>
                        <p className="text-body-md text-on-surface-variant">Utilizamos algodón peinado 24/1 de primera calidad y tela Spun Premium para sublimación HD, garantizando que no encojan ni pierdan color con los lavados.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
