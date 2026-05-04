/**
 * Contact Section — Draw
 * Tokens werden gerendert wie in Home (Font + Glow), aber ohne sichtbare
 * Bahnen (Linien sind unsichtbar).
 */

import {
    DEFAULT_COLORS,
    BREAKPOINTS,
} from '../../shared/core.js';
import { globalTextCache } from '../../shared/rendering.js';
import { BREATH_AMOUNT } from '../../shared/constants.js';

const FONT_SIZE_FACTOR = 0.55;
const MIN_VISIBLE_OPACITY = 0.04;
const GLOW_BLUR_FACTOR = 0.35;

export function drawContactNodes(ctx, tokens = []) {
    if (!ctx || !Array.isArray(tokens) || tokens.length === 0) return;

    const w = ctx.canvas.clientWidth || window.innerWidth;
    const h = ctx.canvas.clientHeight || window.innerHeight;
    const isMobile = w < BREAKPOINTS.DESKTOP;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.imageSmoothingEnabled = true;

    tokens.forEach((token) => {
        if (token.opacity < MIN_VISIBLE_OPACITY) return;

        const breathScale = 1 + Math.sin(token.breathPhase) * BREATH_AMOUNT;
        const drawScale = (token.depthScale || 1) * breathScale;

        const fontSize = Math.floor(token.radius * FONT_SIZE_FACTOR);
        const cached = globalTextCache.get(token.label, fontSize, token.baseColor || DEFAULT_COLORS.pri);

        ctx.save();
        ctx.translate(token.renderX * w, token.renderY * h);
        ctx.rotate(token.rotation);
        ctx.globalAlpha = token.opacity;
        ctx.scale(drawScale, drawScale);

        if (!isMobile) {
            ctx.shadowColor = token.glowColor || DEFAULT_COLORS.acc;
            ctx.shadowBlur = token.radius * GLOW_BLUR_FACTOR;
        }

        ctx.drawImage(cached, -cached.width / 2, -cached.height / 2);
        if (!isMobile) ctx.shadowBlur = 0;
        ctx.restore();
    });

    ctx.restore();
    ctx.globalAlpha = 1;
}
