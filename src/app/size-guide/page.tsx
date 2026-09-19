import React from 'react';

export default function GuiaTallesPage() {
    return (
        <div className="min-h-screen pt-32 pb-24 bg-surface font-sans text-on-surface">
            <div className="container mx-auto px-6 max-w-4xl">
                <h1 className="text-display-md font-display-md mb-8">Guía de Talles</h1>
                <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant shadow-sm">
                    <p className="mb-4 text-body-lg text-on-surface-variant">Encontrá el talle ideal para vos. Nuestras prendas tienen un corte Boxy Fit y Oversize, diseñadas para ofrecer comodidad y estilo.</p>
                    
                    <h2 className="text-headline-sm font-headline-sm mt-8 mb-4">Remeras Boxy Fit</h2>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-outline-variant">
                                <th className="py-3 px-4">Talle</th>
                                <th className="py-3 px-4">Ancho (Pecho)</th>
                                <th className="py-3 px-4">Largo</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-outline-variant/60">
                                <td className="py-3 px-4 font-bold">S</td>
                                <td className="py-3 px-4">52 cm</td>
                                <td className="py-3 px-4">70 cm</td>
                            </tr>
                            <tr className="border-b border-outline-variant/60">
                                <td className="py-3 px-4 font-bold">M</td>
                                <td className="py-3 px-4">54 cm</td>
                                <td className="py-3 px-4">72 cm</td>
                            </tr>
                            <tr className="border-b border-outline-variant/60">
                                <td className="py-3 px-4 font-bold">L</td>
                                <td className="py-3 px-4">56 cm</td>
                                <td className="py-3 px-4">74 cm</td>
                            </tr>
                            <tr className="border-b border-outline-variant/60">
                                <td className="py-3 px-4 font-bold">XL</td>
                                <td className="py-3 px-4">58 cm</td>
                                <td className="py-3 px-4">76 cm</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <p className="mt-6 text-body-sm text-outline">* Las medidas pueden tener una variación de +/- 1cm. Recomendamos medir una prenda tuya sobre una superficie plana para comparar.</p>
                </div>
            </div>
        </div>
    );
}
