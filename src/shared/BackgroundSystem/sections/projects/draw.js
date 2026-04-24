/**
 * Projects Animation — Draw & Convert
 */

import {
    getThemeColors,
    getResponsiveTokenCount,
    TAU,
    randomInRange,
    clampNormalized,
} from '../../shared/core.js';

import { DEPTH_SCALE_STEP_FLOAT, GOLDEN_ANGLE_NORM, ORBIT_LAYERS } from '../../shared/constants.js';
import { RAW_TOKEN_SPEC } from '../home/tokens.js';

// =============================================================================
// DRAW GRID + CONNECTIONS
// =============================================================================

export function drawProjectsForms(ctx, state) {
    if (!ctx || !state) return;

    const width = ctx.canvas.clientWidth || window.innerWidth;
    const height = ctx.canvas.clientHeight || window.innerHeight;
    const colors = getThemeColors();
    const scrollShiftY = state.scrollShiftY || 0;

    // Grid Points
    state.points.forEach(p => {
        const x = p.x * width;
        const y = (p.y - scrollShiftY) * height;
        const alpha = 0.1 + p.hover * 0.5;

        ctx.fillStyle = p.hover > 0.1 ? colors.accent : colors.border;
        ctx.globalAlpha = alpha;
        const size = p.hover > 0.1 ? 3 : 2;
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
    });

    // Connections
    state.connections.forEach(conn => {
        const x1 = conn.p1.x * width, y1 = (conn.p1.y - scrollShiftY) * height;
        const x2 = conn.p2.x * width, y2 = (conn.p2.y - scrollShiftY) * height;
        const progress = conn.life / conn.maxLife;

        ctx.strokeStyle = conn.color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = Math.sin(progress * Math.PI) * 0.8;
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

// =============================================================================
// CONVERT PROJECTS → ABOUT (Grid → Chaos)
// =============================================================================

export function convertProjectsToAbout(projectsState = {}) {
    const colors = getThemeColors();
    const points = projectsState.points || [];
    const aboutCount = getResponsiveTokenCount();
    const source = points.slice(0, aboutCount);

    return source.map((point, index) => {
        const spec = RAW_TOKEN_SPEC[index % RAW_TOKEN_SPEC.length];
        const depthLayer = index % ORBIT_LAYERS;
        const depthScale = 1 - depthLayer * DEPTH_SCALE_STEP_FLOAT;

        const golden = Math.PI * GOLDEN_ANGLE_NORM;
        const theta = index * golden;
        const r = Math.sqrt((index + 0.5) / aboutCount) * 0.5;
        const chaosX = clampNormalized(0.5 + r * Math.cos(theta), 0.01);
        const chaosY = clampNormalized(0.5 + r * Math.sin(theta), 0.01);

        const palette = [colors.primary, colors.accent, colors.warm, colors.primary2, colors.text];
        const color = palette[Math.floor(Math.random() * palette.length)];

        return {
            id: `about-from-projects-${index}`,
            label: spec.label,
            radius: 48,
            baseColor: color,
            glowColor: colors.accent,
            textColor: colors.text,
            renderX: point.x, renderY: point.y,
            startPosition: { x: point.x, y: point.y },
            transitionProgress: 0,
            position: { x: chaosX, y: chaosY },
            driftX: point.x,
            driftSpeed: randomInRange(0.008, 0.015) * depthScale,
            flowPhase: Math.random() * TAU,
            flowSpeed: randomInRange(0.012, 0.025) * depthScale,
            loopPhase: Math.random() * TAU,
            loopSpeed: randomInRange(0.15, 0.3) * depthScale,
            amplitudeX: randomInRange(0.03, 0.06),
            amplitudeY: randomInRange(0.025, 0.06),
            floatPhase: Math.random() * TAU,
            floatSpeed: 0.1 * randomInRange(0.85, 1.15),
            rotation: Math.random() * 0.2,
            rotationSpeed: randomInRange(0.0004, 0.0012) * (Math.random() > 0.5 ? 1 : -1),
            breathPhase: Math.random() * TAU,
            breathSpeed: randomInRange(0.2, 0.4),
            z: randomInRange(-150, 300),
            baseZ: randomInRange(-150, 300),
            depthLayer, depthScale,
            opacity: 1.0, opacityMultiplier: 1.0, wrapOpacity: 1.0,
            age: 0,
        };
    });
}
