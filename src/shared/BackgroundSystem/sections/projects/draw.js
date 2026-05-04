/**
 * Projects Animation — Draw
 */

import { getThemeColors, TAU } from '../../shared/core.js';
import { contentMaskFactor } from '../../engine/contentMask.js';

// =============================================================================
// DRAW GRID + CONNECTIONS
// =============================================================================

export function drawProjectsForms(ctx, state) {
    if (!ctx || !state) return;

    const width = ctx.canvas.clientWidth || window.innerWidth;
    const height = ctx.canvas.clientHeight || window.innerHeight;
    const colors = getThemeColors();
    const scrollShiftY = state.scrollShiftY || 0;

    // Grid Points — als weiche Kreise, mit kontinuierlich interpolierter Größe.
    state.points.forEach(p => {
        const x = p.x * width;
        const y = (p.y - scrollShiftY) * height;
        const mask = contentMaskFactor(p.x, p.y - scrollShiftY);
        const alpha = (0.18 + p.hover * 0.55) * mask;

        // Größe interpoliert kontinuierlich zwischen 1.4 (Ruhe) und 4 (voller Hover).
        const size = 1.4 + p.hover * 2.6;
        // Farb-Lerp dezent: Border-Color → Accent während Hover.
        ctx.fillStyle = p.hover > 0.05 ? colors.accent : colors.border;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, TAU);
        ctx.fill();
    });

    // Connections
    state.connections.forEach(conn => {
        const x1 = conn.p1.x * width, y1 = (conn.p1.y - scrollShiftY) * height;
        const x2 = conn.p2.x * width, y2 = (conn.p2.y - scrollShiftY) * height;
        const progress = conn.life / conn.maxLife;

        // Mask basiert auf Mittelpunkt der Linie
        const mx = (conn.p1.x + conn.p2.x) / 2;
        const my = (conn.p1.y + conn.p2.y) / 2 - scrollShiftY;
        const mask = contentMaskFactor(mx, my);

        ctx.strokeStyle = conn.color;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = Math.sin(progress * Math.PI) * 0.7 * mask;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.fillStyle = conn.color;
        ctx.beginPath();
        ctx.arc(x1, y1, 2, 0, TAU);
        ctx.arc(x2, y2, 2, 0, TAU);
        ctx.fill();
    });

    ctx.globalAlpha = 1.0;
}
