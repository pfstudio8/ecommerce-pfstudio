"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { BENEFIT_TIERS, BenefitTier, getUnlockedBenefitSummary } from "../utils/benefitTiers";

export { BENEFIT_TIERS, getUnlockedBenefitSummary };
export type { BenefitTier };

interface BenefitTierBarProps {
    itemCount: number;
    className?: string;
    compact?: boolean;
}

export default function BenefitTierBar({ itemCount, className = "" }: BenefitTierBarProps) {
    // Determine unlocked tiers
    const unlockedTiers = BENEFIT_TIERS.filter(tier => itemCount >= tier.minItems);
    const highestUnlocked = unlockedTiers.length > 0 ? unlockedTiers[unlockedTiers.length - 1] : null;

    // Next tier to achieve
    const nextTier = BENEFIT_TIERS.find(tier => itemCount < tier.minItems);
    const itemsNeeded = nextTier ? nextTier.minItems - itemCount : 0;

    // Calculate percentage for 0 to 10 scale (clamped to 100%)
    let progressPercent = 0;
    if (itemCount <= 0) {
        progressPercent = 0;
    } else if (itemCount < 3) {
        progressPercent = 15 + ((itemCount - 1) / 2) * 20;
    } else if (itemCount < 6) {
        progressPercent = 40 + ((itemCount - 3) / 3) * 25;
    } else if (itemCount < 10) {
        progressPercent = 70 + ((itemCount - 6) / 4) * 22;
    } else {
        progressPercent = 100;
    }

    return (
        <div className={`p-3 sm:p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-200/70 space-y-2.5 ${className}`}>
            {/* 4 Milestone Indicators in a row */}
            <div className="grid grid-cols-4 gap-1 text-center">
                {BENEFIT_TIERS.map((tier) => {
                    const isReached = itemCount >= tier.minItems;
                    return (
                        <div key={tier.minItems} className="flex flex-col items-center">
                            <div className={`flex items-center gap-0.5 text-xs ${
                                isReached ? "text-emerald-700 font-black" : "text-neutral-400 font-bold"
                            }`}>
                                {isReached && <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />}
                                <span>{tier.minItems}u</span>
                            </div>
                            <span className={`text-[10px] leading-tight ${
                                isReached ? "text-emerald-800 font-bold" : "text-neutral-400 font-medium"
                            }`}>
                                {tier.shortLabel}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Progress Bar Container */}
            <div className="relative">
                <div className="w-full h-1.5 rounded-full bg-neutral-200/80 overflow-hidden relative">
                    <motion.div
                        className="h-full bg-emerald-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                </div>
            </div>

            {/* Bottom Info: Active perk & DESBLOQUEADO badge */}
            <div className="flex items-center justify-between text-xs pt-0.5">
                <div className="flex items-center gap-1.5 text-neutral-700 truncate font-medium text-[11px] sm:text-xs">
                    <span className="text-sm leading-none shrink-0">🎁</span>
                    <span className="truncate">
                        {highestUnlocked ? (
                            <>
                                <strong className="font-bold text-neutral-900">Activo:</strong> {highestUnlocked.title}
                            </>
                        ) : (
                            <>
                                <strong className="font-bold text-neutral-900">Próximo:</strong> ¡Sumá {itemsNeeded} {itemsNeeded === 1 ? 'prenda' : 'prendas'} para {nextTier?.title}!
                            </>
                        )}
                    </span>
                </div>

                {highestUnlocked ? (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">
                        DESBLOQUEADO
                    </span>
                ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-200/70 text-neutral-600 shrink-0">
                        ¡Falta {itemsNeeded}u!
                    </span>
                )}
            </div>
        </div>
    );
}
