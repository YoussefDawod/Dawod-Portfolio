/**
 * Contact Animation — Draw & Convert
 */

import { TAU } from '../../shared/core.js';

// =============================================================================
// DRAW MESSAGE FLOW
// =============================================================================

export function drawContactNodes(ctx, state) {
    if (!ctx || !state) return;

    const width = ctx.canvas.clientWidth || window.innerWidth;
    const height = ctx.canvas.clientHeight || window.innerHeight;

    // 1. Connections
    state.connections.forEach(conn => {
        const x1 = conn.p1.x * width, y1 = conn.p1.y * height;
        const x2 = conn.p2.x * width, y2 = conn.p2.y * height;
        const alpha = conn.strength * 0.2 + conn.mouseBoost * 0.4;

        ctx.strokeStyle = conn.p1.color;
        ctx.lineWidth = 1 + conn.mouseBoost;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    });

    // 2. Trails
    state.particles.forEach(particle => {
        if (particle.trail.length < 2) return;
        for (let i = 1; i < particle.trail.length; i++) {
            const pos = particle.trail[i];
            const prev = particle.trail[i - 1];
            ctx.strokeStyle = particle.color;
            ctx.lineWidth = particle.size * 0.5;
            ctx.globalAlpha = particle.opacity * (1 - i / particle.trail.length) * 0.3;
            ctx.beginPath();
            ctx.moveTo(prev.x * width, prev.y * height);
            ctx.lineTo(pos.x * width, pos.y * height);
            ctx.stroke();
        }
    });

    // 3. Particles
    state.particles.forEach(particle => {
        const x = particle.x * width, y = particle.y * height;
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.beginPath();
        ctx.arc(x, y, particle.size, 0, TAU);
        ctx.fill();

        if (particle.mouseInfluence > 0.1) {
            ctx.globalAlpha = particle.mouseInfluence * 0.3;
            ctx.beginPath();
            ctx.arc(x, y, particle.size * 2.5, 0, TAU);
            ctx.fill();
        }
    });

    ctx.globalAlpha = 1.0;
}

// =============================================================================
// CONVERT CONTACT → PROJECTS
// =============================================================================

export function convertContactToProjects(contactState = {}) {
    const particles = contactState.particles || [];

    const points = particles.map((p) => ({
        x: p.x, y: p.y,
        targetX: p.x, targetY: p.y,
        startX: p.x, startY: p.y,
        transitionProgress: 1, active: false, hover: 0,
        config: { gridSpacing: 0.12, maxConnections: 14, connectionChance: 0.015 },
    }));

    return {
        points, connections: [], timer: 0,
        config: { gridSpacing: 0.12, maxConnections: 14, connectionChance: 0.015 },
    };
}
