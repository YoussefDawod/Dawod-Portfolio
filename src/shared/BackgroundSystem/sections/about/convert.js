// about/convert.js
// Konvertierungsfunktionen für About-Section Übergänge

import { ORBIT_SPEED_BASE, computeOrbitAngle } from '../home/tokens.js';
import { ORBIT_LAYERS } from '../../shared/constants.js';

// =============================================================================
// CONVERT ABOUT → PROJECTS (Chaos → Grid)
// =============================================================================

export function convertAboutToProjects(aboutTokens = []) {
    return aboutTokens.map((token) => ({
        x: token.renderX ?? token.driftX ?? 0.5,
        y: token.renderY ?? 0.5,
        renderX: token.renderX ?? 0.5,
        renderY: token.renderY ?? 0.5,
    }));
}

// =============================================================================
// CONVERT ABOUT → HOME (Chaos → Orbit)
// =============================================================================

export function convertAboutToHome(aboutTokens = []) {
    const count = aboutTokens.length;

    return aboutTokens.map((token, index) => {
        const orbitLayer = index % ORBIT_LAYERS;
        return {
            ...token,
            // Aktuelle Chaos-Position → Start für Re-Formation
            transitionStartX: token.renderX,
            transitionStartY: token.renderY,

            // Orbit-Ziel berechnen
            orbitAngle: computeOrbitAngle(index, count, orbitLayer),
            orbitSpeed: (ORBIT_SPEED_BASE + Math.random() * 0.05) * (orbitLayer % 2 === 0 ? 1 : -1),
            orbitLayer,

            // Formation neu starten (sofort, Token sind schon sichtbar)
            formationProgress: 0,
            spawnDelay: 0,
            spawned: true,
            dissolveProgress: 0,

            renderX: token.renderX || 0.5,
            renderY: token.renderY || 0.5,
            opacity: token.opacity || 1,
        };
    });
}
