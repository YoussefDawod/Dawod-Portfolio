// about/convert.js
// Konvertierungsfunktionen für About-Section Übergänge

import { ORBIT_SPEED_BASE, computeOrbitAngle } from '../home/tokens.js';
import { ORBIT_LAYERS, TEMPO_SCALE } from '../../shared/constants.js';

// =============================================================================
// CONVERT ABOUT → HOME (Chaos → Orbit)
// =============================================================================

export function convertAboutToHome(aboutTokens = []) {
    const count = aboutTokens.length;

    return aboutTokens.map((token, index) => {
        const orbitLayer = index % ORBIT_LAYERS;
        return {
            ...token,
            // Aktuelle Position als Lerp-Start (kein Sprung in die Mitte!)
            transitionStartX: token.renderX,
            transitionStartY: token.renderY,
            transitionProgress: 0,

            // Orbit-Ziel berechnen
            orbitAngle: computeOrbitAngle(index, count, orbitLayer),
            orbitSpeed: ORBIT_SPEED_BASE * (orbitLayer % 2 === 0 ? 1 : -1) * TEMPO_SCALE,
            orbitLayer,

            // Formation überspringen — Tokens sind schon sichtbar.
            // Sie gleiten direkt von ihrer About-Position auf den Orbit.
            formationProgress: 1,
            spawnDelay: 0,
            spawned: true,
            dissolveProgress: 0,

            renderX: token.renderX || 0.5,
            renderY: token.renderY || 0.5,
            opacity: token.opacity || 1,
        };
    });
}
