// about/draw.js
// Draw-Logik für About-Section — 3D-Projektion + Depth-Fog

import { DEFAULT_COLORS } from '../../shared/core.js';
import { globalTextCache, project3D, getDepthOpacity } from '../../shared/rendering.js';
import { BREATH_AMOUNT, FOV } from '../../shared/constants.js';

const MIN_VISIBLE_OPACITY = 0.05;
const FONT_SIZE_FACTOR = 0.55;

// =============================================================================
// DRAW ABOUT TOKENS (3D-Projektion + Depth-Fog)
// =============================================================================

export function drawAboutTokens(ctx, tokens = []) {
    if (!ctx || tokens.length === 0) return;

    const cssWidth = ctx.canvas.clientWidth || window.innerWidth;
    const cssHeight = ctx.canvas.clientHeight || window.innerHeight;

    tokens.forEach((token) => {
        if (token.opacity < MIN_VISIBLE_OPACITY) return;

        const z = token.z || 0;
        const projection = project3D(token.renderX, token.renderY, z, cssWidth, cssHeight);
        const x = projection.x;
        const y = projection.y;
        const scale = projection.scale * token.depthScale;

        const depthOpacity = getDepthOpacity(z, FOV);
        const finalOpacity = token.opacity * depthOpacity;
        if (finalOpacity < MIN_VISIBLE_OPACITY) return;

        const breathScale = 1 + Math.sin(token.breathPhase) * BREATH_AMOUNT;

        const fontSize = Math.floor(token.radius * FONT_SIZE_FACTOR);
        const cachedCanvas = globalTextCache.get(
            token.label,
            fontSize,
            token.baseColor || DEFAULT_COLORS.pri
        );

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(token.rotation);
        ctx.globalAlpha = finalOpacity;

        const drawScale = scale * breathScale;
        ctx.scale(drawScale, drawScale);

        ctx.drawImage(cachedCanvas, -cachedCanvas.width / 2, -cachedCanvas.height / 2);
        ctx.restore();
    });
}
