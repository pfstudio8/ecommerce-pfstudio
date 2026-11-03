import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml, generateWelcomeEmail, generateOrderEmail, generateAbandonedCartEmail } from '../src/lib/emailTemplates.ts';

describe('Security: HTML Escaping in Email Templates', () => {
    test('escapeHtml neutralizes all dangerous characters', () => {
        const input = `<script>alert("XSS & injection")</script> 'test'`;
        const escaped = escapeHtml(input);

        assert.equal(escaped.includes('<script>'), false);
        assert.equal(escaped.includes('&lt;script&gt;'), true);
        assert.equal(escaped.includes('&amp;'), true);
        assert.equal(escaped.includes('&quot;'), true);
        assert.equal(escaped.includes('&#39;'), true);
    });

    test('escapeHtml handles null, undefined and numbers safely', () => {
        assert.equal(escapeHtml(null), '');
        assert.equal(escapeHtml(undefined), '');
        assert.equal(escapeHtml(12345), '12345');
    });

    test('generateWelcomeEmail escapes customer display name', () => {
        const maliciousName = `<img src=x onerror=alert(1)>`;
        const emailHtml = generateWelcomeEmail('user@test.com', maliciousName);

        assert.equal(emailHtml.includes('<img src=x onerror=alert(1)>'), false);
        assert.equal(emailHtml.includes('&lt;img src=x onerror=alert(1)&gt;'), true);
    });

    test('generateOrderEmail escapes items, sizes, orderId and billing details', () => {
        const orderId = 'ORD-12345-TEST<script>';
        const email = 'victim@example.com"><script>evil()</script>';
        const items = [
            {
                name: 'Remera <b onmouseover=alert(1)>Oversize</b>',
                size: 'XL"><img src=x onerror=alert(2)>',
                quantity: 2,
                price: 15000
            }
        ];
        const billing = {
            name: 'Juan Perez <svg/onload=alert(3)>',
            phone: '3704-123456',
            address: 'Av. Corrientes 1234 <iframe src=javascript:alert(4)>',
            notes: '<script>steal()</script>'
        };

        const html = generateOrderEmail(orderId, email, 30000, items, billing);

        // Verify none of the malicious tags exist raw
        assert.equal(html.includes('<script>evil()</script>'), false);
        assert.equal(html.includes('<b onmouseover=alert(1)>'), false);
        assert.equal(html.includes('<img src=x onerror=alert(2)>'), false);
        assert.equal(html.includes('<svg/onload=alert(3)>'), false);
        assert.equal(html.includes('<iframe src=javascript:alert(4)>'), false);
        assert.equal(html.includes('<script>steal()</script>'), false);

        // Verify escaped versions exist
        assert.equal(html.includes('&lt;script&gt;steal()&lt;/script&gt;'), true);
        assert.equal(html.includes('&lt;img src=x onerror=alert(2)&gt;'), true);
    });

    test('generateAbandonedCartEmail escapes user email name', () => {
        const email = 'attacker<script>@test.com';
        const html = generateAbandonedCartEmail(email);

        assert.equal(html.includes('<script>'), false);
        assert.equal(html.includes('attacker&lt;script&gt;'), true);
    });
});
