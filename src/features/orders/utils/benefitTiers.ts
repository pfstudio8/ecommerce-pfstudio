export interface BenefitTier {
    minItems: number;
    title: string;
    shortLabel: string;
    description: string;
    badge: string;
}

export const BENEFIT_TIERS: BenefitTier[] = [
    {
        minItems: 1,
        title: "Muestra Digital Bonificada",
        shortLabel: "Muestra",
        description: "Boceto y fotomontaje previo sin cargo antes de estampar.",
        badge: "Nivel 1"
    },
    {
        minItems: 3,
        title: "Sticker Pack PFStudio",
        shortLabel: "Stickers",
        description: "Set de stickers vinílicos troquelados de regalo con tu compra.",
        badge: "Nivel 2"
    },
    {
        minItems: 6,
        title: "Packaging Especial Bonificado",
        shortLabel: "Packaging",
        description: "Bolsa de lienzo / packaging premium para tus prendas.",
        badge: "Nivel 3"
    },
    {
        minItems: 10,
        title: "10% OFF Mayorista / Pack",
        shortLabel: "10% OFF",
        description: "Descuento automático del 10% en el total de tu pedido.",
        badge: "Mayorista"
    }
];

export function getUnlockedBenefitSummary(itemCount: number): string[] {
    return BENEFIT_TIERS
        .filter(tier => itemCount >= tier.minItems)
        .map(tier => tier.title);
}

