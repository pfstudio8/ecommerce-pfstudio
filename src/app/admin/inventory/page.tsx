"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { 
    Boxes, 
    Search, 
    AlertTriangle, 
    CheckCircle2, 
    XCircle, 
    History, 
    Plus, 
    ArrowUpDown, 
    RefreshCw, 
    Loader2, 
    Layers, 
    ArrowUpRight, 
    ArrowDownRight, 
    Filter,
    PackagePlus,
    Calendar,
    Tag
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getInventoryData, adjustStockVariant } from "./actions";

interface ProductStockVariant {
    id: string;
    size: string;
    stock_quantity: number;
    sku?: string;
}

interface InventoryProduct {
    id: string;
    name: string;
    category: string;
    stock: number;
    active: boolean;
    images?: string[];
    product_stock: ProductStockVariant[];
}

interface StockMovement {
    id: string;
    product_id: string;
    size: string;
    quantity_change: number;
    previous_stock: number;
    new_stock: number;
    reason: string;
    notes?: string;
    created_at: string;
    products?: { name: string } | { name: string }[] | null;
}

const REASON_LABELS: Record<string, { label: string; color: string }> = {
    sale: { label: "Venta Pedido", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    restock: { label: "Reabastecimiento", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    adjustment: { label: "Ajuste Auditoría", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
    return: { label: "Devolución", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
    manual: { label: "Ajuste Manual / Merma", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    cancel: { label: "Cancelación Pedido", color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" },
};

export default function AdminInventoryPage() {
    const [products, setProducts] = useState<InventoryProduct[]>([]);
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"stock" | "history">("stock");

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [stockFilter, setStockFilter] = useState<"all" | "critical" | "out" | "ok">("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");

    // Modal state for stock adjustment
    const [selectedVariant, setSelectedVariant] = useState<{
        product: InventoryProduct;
        size: string;
        currentStock: number;
    } | null>(null);
    const [newQuantity, setNewQuantity] = useState<number>(0);
    const [reason, setReason] = useState<"restock" | "adjustment" | "return" | "manual">("restock");
    const [notes, setNotes] = useState<string>("");
    const [isSavingAdjustment, setIsSavingAdjustment] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const res = await getInventoryData();
            if (res.success && res.products) {
                setProducts(res.products as InventoryProduct[]);
                setMovements((res.movements || []) as unknown as StockMovement[]);
            } else {
                toast.error(res.error || "No se pudo cargar el inventario");
            }
        } catch (err: any) {
            toast.error("Error al cargar datos: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate metrics
    const allVariants = products.flatMap(p => 
        (p.product_stock && p.product_stock.length > 0 
            ? p.product_stock 
            : [{ id: `fallback-${p.id}`, size: "Único", stock_quantity: p.stock || 0 }])
        .map(v => ({ ...v, productName: p.name, productId: p.id, category: p.category }))
    );

    const totalUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);
    const criticalVariantsCount = allVariants.filter(v => v.stock_quantity > 0 && v.stock_quantity < 5).length;
    const outOfStockCount = allVariants.filter(v => v.stock_quantity === 0).length;

    const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

    // Open adjustment modal
    const handleOpenAdjustment = (product: InventoryProduct, size: string, currentStock: number) => {
        setSelectedVariant({ product, size, currentStock });
        setNewQuantity(currentStock);
        setReason(currentStock === 0 ? "restock" : "adjustment");
        setNotes("");
    };

    const handleSaveAdjustment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedVariant) return;

        if (newQuantity < 0) {
            toast.error("El stock no puede ser negativo");
            return;
        }

        setIsSavingAdjustment(true);
        try {
            const res = await adjustStockVariant({
                productId: selectedVariant.product.id,
                size: selectedVariant.size,
                newQuantity,
                reason,
                notes: notes.trim() || undefined
            });

            if (res.success) {
                toast.success(`Stock actualizado para ${selectedVariant.product.name} (${selectedVariant.size}): ${selectedVariant.currentStock} → ${newQuantity}`);
                setSelectedVariant(null);
                await loadData();
            } else {
                toast.error(res.error || "Error al actualizar stock");
            }
        } catch (err: any) {
            toast.error(err.message || "Error al procesar el ajuste");
        } finally {
            setIsSavingAdjustment(false);
        }
    };

    // Filter products
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.product_stock?.some(v => v.size.toLowerCase().includes(searchTerm.toLowerCase()) || v.sku?.toLowerCase().includes(searchTerm.toLowerCase()));

        if (!matchesSearch) return false;

        if (categoryFilter !== "all" && product.category !== categoryFilter) return false;

        if (stockFilter === "critical") {
            const hasCritical = (product.product_stock && product.product_stock.length > 0)
                ? product.product_stock.some(v => v.stock_quantity > 0 && v.stock_quantity < 5)
                : (product.stock > 0 && product.stock < 5);
            if (!hasCritical) return false;
        } else if (stockFilter === "out") {
            const hasOut = (product.product_stock && product.product_stock.length > 0)
                ? product.product_stock.some(v => v.stock_quantity === 0)
                : product.stock === 0;
            if (!hasOut) return false;
        } else if (stockFilter === "ok") {
            const allOk = (product.product_stock && product.product_stock.length > 0)
                ? product.product_stock.every(v => v.stock_quantity >= 5)
                : product.stock >= 5;
            if (!allOk) return false;
        }

        return true;
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface mb-1 font-sans">
                        Control de Inventario
                    </h1>
                    <p className="text-sm text-outline font-medium">
                        Gestión física de stock por talle, registro de movimientos y auditoría de insumos.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={loadData}
                        disabled={isLoading}
                        className="p-2.5 rounded-xl border border-outline-variant hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
                        title="Recargar datos"
                    >
                        <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                    </button>
                    <div className="bg-surface-container-low border border-outline-variant px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-2">
                        <Boxes className="w-4 h-4 text-primary" />
                        Taller & Insumos
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-outline mb-1">Unidades Totales</p>
                        <p className="text-3xl font-extrabold text-on-surface">{totalUnits}</p>
                    </div>
                    <div className="p-3 bg-primary-container text-on-primary-container rounded-xl">
                        <Layers className="w-6 h-6 text-primary" />
                    </div>
                </div>

                <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-outline mb-1">Stock Crítico (&lt; 5)</p>
                        <p className="text-3xl font-extrabold text-amber-400">{criticalVariantsCount}</p>
                    </div>
                    <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-outline mb-1">Agotados (0)</p>
                        <p className="text-3xl font-extrabold text-red-400">{outOfStockCount}</p>
                    </div>
                    <div className="p-3 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
                        <XCircle className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-outline mb-1">Movimientos Auditados</p>
                        <p className="text-3xl font-extrabold text-secondary">{movements.length}</p>
                    </div>
                    <div className="p-3 bg-surface-container text-secondary rounded-xl">
                        <History className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-outline-variant gap-4">
                <button
                    onClick={() => setActiveTab("stock")}
                    className={cn(
                        "pb-3 text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors",
                        activeTab === "stock"
                            ? "border-primary text-primary"
                            : "border-transparent text-outline hover:text-on-surface"
                    )}
                >
                    <Boxes className="w-4 h-4" />
                    Variantes por Talle ({products.length} productos)
                </button>
                <button
                    onClick={() => setActiveTab("history")}
                    className={cn(
                        "pb-3 text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors",
                        activeTab === "history"
                            ? "border-primary text-primary"
                            : "border-transparent text-outline hover:text-on-surface"
                    )}
                >
                    <History className="w-4 h-4" />
                    Historial de Movimientos ({movements.length})
                </button>
            </div>

            {/* TAB 1: Stock por Variante */}
            {activeTab === "stock" && (
                <div className="space-y-6">
                    {/* Controls & Search */}
                    <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full sm:w-96">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
                            <input
                                type="text"
                                placeholder="Buscar por producto, talle o SKU..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                            {/* Stock status filter */}
                            <select
                                value={stockFilter}
                                onChange={(e: any) => setStockFilter(e.target.value)}
                                className="px-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs font-semibold text-on-surface outline-none cursor-pointer"
                            >
                                <option value="all">Todos los niveles</option>
                                <option value="critical">Crítico (&lt; 5 unidades)</option>
                                <option value="out">Sin Stock (0 unidades)</option>
                                <option value="ok">Stock Saludable (≥ 5)</option>
                            </select>

                            {/* Category filter */}
                            {categories.length > 0 && (
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="px-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs font-semibold text-on-surface outline-none cursor-pointer"
                                >
                                    <option value="all">Todas las categorías</option>
                                    {categories.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    {/* Products & Variants List */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-16 space-y-3">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm text-outline">Cargando inventario de taller...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-12 text-center space-y-3">
                            <Boxes className="w-12 h-12 mx-auto text-outline opacity-40" />
                            <p className="text-base font-bold text-on-surface">No se encontraron insumos con esos filtros.</p>
                            <p className="text-xs text-outline">Intenta borrar los términos de búsqueda o cambiar el filtro de stock.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredProducts.map((product) => {
                                const variants = (product.product_stock && product.product_stock.length > 0)
                                    ? product.product_stock
                                    : [{ id: `fallback-${product.id}`, size: "Único", stock_quantity: product.stock || 0, sku: undefined }];

                                const productTotal = variants.reduce((sum, v) => sum + v.stock_quantity, 0);

                                return (
                                    <div
                                        key={product.id}
                                        className="bg-surface-container-low border border-outline-variant rounded-2xl p-5 hover:border-primary/40 transition-colors space-y-4"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 relative rounded-xl bg-surface-container overflow-hidden shrink-0 border border-outline-variant">
                                                    {product.images && product.images[0] ? (
                                                        <Image
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-outline">
                                                            <Boxes className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-bold text-on-surface">{product.name}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-medium">
                                                            {product.category || "General"}
                                                        </span>
                                                        <span className="text-xs text-outline font-medium">
                                                            Total consolidado: <strong className="text-on-surface">{productTotal}</strong> u.
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {productTotal === 0 ? (
                                                    <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                                                        Agotado
                                                    </span>
                                                ) : productTotal < 5 ? (
                                                    <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                        Stock Crítico
                                                    </span>
                                                ) : (
                                                    <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        Saludable
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Variants grid */}
                                        <div className="pt-2 border-t border-outline-variant/60">
                                            <p className="text-xs font-bold uppercase tracking-wider text-outline mb-3">
                                                Variantes por Talle / Medida
                                            </p>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                                {variants.map((variant) => {
                                                    const isLow = variant.stock_quantity > 0 && variant.stock_quantity < 5;
                                                    const isOut = variant.stock_quantity === 0;

                                                    return (
                                                        <div
                                                            key={variant.id || variant.size}
                                                            className={cn(
                                                                "p-3 rounded-xl border flex flex-col justify-between bg-surface transition-all",
                                                                isOut && "border-red-500/40 bg-red-500/5",
                                                                isLow && "border-amber-500/40 bg-amber-500/5",
                                                                !isOut && !isLow && "border-outline-variant"
                                                            )}
                                                        >
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-surface-container text-on-surface">
                                                                    {variant.size}
                                                                </span>
                                                                <span className={cn(
                                                                    "text-sm font-extrabold",
                                                                    isOut && "text-red-400",
                                                                    isLow && "text-amber-400",
                                                                    !isOut && !isLow && "text-on-surface"
                                                                )}>
                                                                    {variant.stock_quantity} u.
                                                                </span>
                                                            </div>
                                                            {variant.sku && (
                                                                <p className="text-[10px] text-outline font-mono truncate mb-2" title={variant.sku}>
                                                                    {variant.sku}
                                                                </p>
                                                            )}
                                                            <button
                                                                onClick={() => handleOpenAdjustment(product, variant.size, variant.stock_quantity)}
                                                                className="w-full mt-1 text-[11px] font-bold py-1.5 px-2 rounded-lg bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface-variant transition-colors flex items-center justify-center gap-1"
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                                Ajustar
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: Historial de Movimientos */}
            {activeTab === "history" && (
                <div className="bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-outline-variant bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                                <History className="w-5 h-5 text-primary" />
                                Auditoría de Movimientos de Stock (stock_movements)
                            </h2>
                            <p className="text-xs text-outline mt-1">
                                Cada venta, compra, reabastecimiento o corrección manual queda registrada cronológicamente.
                            </p>
                        </div>
                    </div>

                    {movements.length === 0 ? (
                        <div className="p-12 text-center space-y-3">
                            <History className="w-12 h-12 mx-auto text-outline opacity-40" />
                            <p className="text-base font-bold text-on-surface">No hay movimientos registrados todavía.</p>
                            <p className="text-xs text-outline">Los movimientos se crearán automáticamente con ventas o ajustes manuales.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-surface-container text-xs font-bold uppercase tracking-wider text-outline border-b border-outline-variant">
                                    <tr>
                                        <th className="px-6 py-4">Fecha y Hora</th>
                                        <th className="px-6 py-4">Producto & Talle</th>
                                        <th className="px-6 py-4">Motivo</th>
                                        <th className="px-6 py-4 text-center">Variación</th>
                                        <th className="px-6 py-4 text-center">Stock Resultante</th>
                                        <th className="px-6 py-4">Notas / Detalle</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant font-medium">
                                    {movements.map((mov) => {
                                        const reasonMeta = REASON_LABELS[mov.reason] || { label: mov.reason, color: "bg-surface-container text-on-surface-variant border-outline-variant" };
                                        const isPositive = mov.quantity_change > 0;
                                        const dateFormatted = new Date(mov.created_at).toLocaleString('es-AR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        });

                                        const productName = Array.isArray(mov.products) ? mov.products[0]?.name : mov.products?.name;

                                        return (
                                            <tr key={mov.id} className="hover:bg-surface-container/50 transition-colors">
                                                <td className="px-6 py-4 text-xs font-mono text-outline whitespace-nowrap">
                                                    {dateFormatted}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-on-surface">
                                                        {productName || "Producto sin nombre"}
                                                    </div>
                                                    <span className="text-xs font-bold text-primary">
                                                        Talle: {mov.size}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={cn(
                                                        "text-xs px-2.5 py-1 rounded-full font-bold border whitespace-nowrap",
                                                        reasonMeta.color
                                                    )}>
                                                        {reasonMeta.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center whitespace-nowrap font-mono font-bold">
                                                    <span className={cn(
                                                        "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg",
                                                        isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                                                    )}>
                                                        {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                                        {isPositive ? `+${mov.quantity_change}` : mov.quantity_change}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center font-mono text-xs text-on-surface whitespace-nowrap">
                                                    <span className="text-outline">{mov.previous_stock}</span>
                                                    <span className="mx-1 text-outline">→</span>
                                                    <strong className="text-on-surface font-extrabold">{mov.new_stock}</strong>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-outline max-w-xs truncate" title={mov.notes}>
                                                    {mov.notes || "-"}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Modal: Ajustar Stock */}
            {selectedVariant && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-surface-container-low border border-outline-variant rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-5 border-b border-outline-variant bg-surface flex items-center justify-between">
                            <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
                                <PackagePlus className="w-5 h-5 text-primary" />
                                Ajustar Stock de Insumo
                            </h3>
                            <button
                                onClick={() => setSelectedVariant(null)}
                                className="p-1 rounded-lg hover:bg-surface-container text-outline hover:text-on-surface"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveAdjustment} className="p-6 space-y-5">
                            <div className="p-3 bg-surface rounded-xl border border-outline-variant">
                                <p className="text-sm font-bold text-on-surface">{selectedVariant.product.name}</p>
                                <div className="flex items-center gap-3 text-xs text-outline mt-1 font-medium">
                                    <span>Talle: <strong className="text-primary font-bold">{selectedVariant.size}</strong></span>
                                    <span>•</span>
                                    <span>Stock actual: <strong className="text-on-surface font-bold">{selectedVariant.currentStock} u.</strong></span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-outline">
                                    Nueva Cantidad Total
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    value={newQuantity}
                                    onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
                                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-lg font-bold font-mono text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                    required
                                />
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-outline">Variación calculada:</span>
                                    <span className={cn(
                                        "font-bold font-mono",
                                        newQuantity - selectedVariant.currentStock > 0 ? "text-emerald-400" :
                                        newQuantity - selectedVariant.currentStock < 0 ? "text-red-400" : "text-outline"
                                    )}>
                                        {newQuantity - selectedVariant.currentStock > 0 ? `+${newQuantity - selectedVariant.currentStock}` : newQuantity - selectedVariant.currentStock} u.
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-outline">
                                    Motivo del Ajuste (stock_movements)
                                </label>
                                <select
                                    value={reason}
                                    onChange={(e: any) => setReason(e.target.value)}
                                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-sm font-semibold text-on-surface outline-none cursor-pointer"
                                >
                                    <option value="restock">Reabastecimiento / Compra de insumos</option>
                                    <option value="adjustment">Ajuste de inventario (Conteo físico)</option>
                                    <option value="return">Devolución de cliente</option>
                                    <option value="manual">Corrección manual / Merma de producción</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-outline">
                                    Nota o Comentario (Opcional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: Ingreso lote #24 taller / Prenda fallada"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
                                <button
                                    type="button"
                                    onClick={() => setSelectedVariant(null)}
                                    className="px-4 py-2.5 rounded-xl border border-outline-variant text-xs font-bold uppercase tracking-wider text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingAdjustment}
                                    className="bg-primary hover:bg-primary-dark text-on-primary px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
                                >
                                    {isSavingAdjustment ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    {isSavingAdjustment ? "Guardando..." : "Guardar Ajuste"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
