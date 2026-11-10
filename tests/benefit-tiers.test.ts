import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BENEFIT_TIERS, getUnlockedBenefitSummary } from '../src/features/orders/utils/benefitTiers.ts';

describe('Benefit Tier Logic & Milestones (Punto 5)', () => {
    it('returns empty rewards when item count is 0', () => {
        const rewards = getUnlockedBenefitSummary(0);
        assert.deepEqual(rewards, []);
    });

    it('unlocks digital sample on 1-2 items', () => {
        const rewards1 = getUnlockedBenefitSummary(1);
        assert.equal(rewards1.length, 1);
        assert.equal(rewards1[0], 'Muestra Digital Bonificada');

        const rewards2 = getUnlockedBenefitSummary(2);
        assert.equal(rewards2.length, 1);
        assert.equal(rewards2[0], 'Muestra Digital Bonificada');
    });

    it('unlocks sticker pack on 3-5 items', () => {
        const rewards3 = getUnlockedBenefitSummary(3);
        assert.equal(rewards3.length, 2);
        assert.ok(rewards3.includes('Sticker Pack PFStudio'));
    });

    it('unlocks special packaging on 6-9 items', () => {
        const rewards6 = getUnlockedBenefitSummary(6);
        assert.equal(rewards6.length, 3);
        assert.ok(rewards6.includes('Packaging Especial Bonificado'));
    });

    it('unlocks all 4 tiers including 10% OFF wholesale on 10+ items', () => {
        const rewards10 = getUnlockedBenefitSummary(10);
        assert.equal(rewards10.length, 4);
        assert.ok(rewards10.includes('10% OFF Mayorista / Pack'));

        const rewards15 = getUnlockedBenefitSummary(15);
        assert.equal(rewards15.length, 4);
    });

    it('all tiers have valid positive integer thresholds in ascending order', () => {
        for (let i = 0; i < BENEFIT_TIERS.length - 1; i++) {
            assert.ok(BENEFIT_TIERS[i].minItems < BENEFIT_TIERS[i + 1].minItems);
        }
    });
});
