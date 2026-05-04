/**
 * Contact Section — Token Creation & Update
 *
 * Dieselben 30/45 Tokens wie Home, aber statt 3 Ringen jetzt 3 unsichtbare
 * Linien (eine pro Gruppe):
 *   – Gruppe 0 (inner)  → linke Vertikale (x ≈ 0.15), oben → unten
 *   – Gruppe 1 (mid)    → Horizontale unten (y ≈ 0.78), links → rechts
 *   – Gruppe 2 (outer)  → rechte Vertikale (x ≈ 0.85), unten → oben
 *
 * Tokens loopen endlos auf ihrer Linie — am Ende verschwindet ein Token
 * weich am Rand und erscheint am anderen Ende wieder.
 */

import {
    DEFAULT_COLORS,
    getThemeColors,
    getColor,
    getTokenColorKey,
    getResponsiveTokenCount,
    getResponsiveScale,
    TAU,
} from '../../shared/core.js';
import { DEPTH_SCALE_STEP, ORBIT_LAYERS, TEMPO_SCALE } from '../../shared/constants.js';
import { RAW_TOKEN_SPEC } from '../home/tokens.js';
import { progressToPosition } from '../projects/lineGeometry.js';

// =============================================================================
// CONFIG
// =============================================================================

// Geschwindigkeit: progress wechselt von 0 → 1 in `LOOP_SECONDS` Sekunden.
// ALLE Tokens haben dieselbe Speed → die einmal etablierte Gleichverteilung
// auf der Linie bleibt für immer erhalten (wie die Ringe in Home).
const LOOP_SECONDS = 26;            // ruhig, ambient

// =============================================================================
// CREATE
// =============================================================================

export function createContactNodes(options = {}) {
    const colors = getThemeColors();
    const previousTokens = options.previousTokens;
    const count = getResponsiveTokenCount();
    const scale = getResponsiveScale();

    // PreviousTokens normalisieren — kann Array (Home/About) oder
    // Object mit .points/.particles/.tokens (Projects/altes Contact) sein.
    let prev = [];
    if (Array.isArray(previousTokens)) prev = previousTokens;
    else if (previousTokens?.points) prev = previousTokens.points;
    else if (previousTokens?.particles) prev = previousTokens.particles;
    else if (previousTokens?.nodes) prev = previousTokens.nodes;
    else if (previousTokens?.tokens) prev = previousTokens.tokens;
    const fromTransition = prev.length > 0;

    const tokens = [];
    const perGroup = [0, 0, 0]; // Token-Zähler pro Gruppe

    for (let i = 0; i < count; i++) {
        const spec = RAW_TOKEN_SPEC[i % RAW_TOKEN_SPEC.length];
        const group = i % ORBIT_LAYERS;
        // Tiefen-Skalierung wie in Home: G0 = 1.0 (vorne), G2 = kleinster
        const depthScale = 1 - group * DEPTH_SCALE_STEP;

        // Initialer Progress: gleichmäßig auf der Linie verteilt
        const indexInGroup = perGroup[group];
        const tokensPerGroup = Math.ceil(count / ORBIT_LAYERS);
        const progress = (indexInGroup + 0.5) / tokensPerGroup;
        perGroup[group] += 1;

        const target = progressToPosition(progress, group);

        // EINHEITLICHE Speed → konstanter Abstand auf der Linie
        const speed = (1 / LOOP_SECONDS) * TEMPO_SCALE;

        // Start aus vorheriger Section übernehmen — Position UND Visuals,
        // damit die Tokens als "dieselben" wahrgenommen werden, die nur in
        // eine neue Formation wandern (kein opacity:0 Aufblitzen).
        let startX = target.x;
        let startY = target.y;
        let startOpacity = 0;
        let startRotation = (Math.random() - 0.5) * 0.05;
        let startBreathPhase = Math.random() * TAU;
        if (fromTransition && i < prev.length) {
            const p = prev[i];
            startX = p.renderX ?? p.x ?? target.x;
            startY = p.renderY ?? p.y ?? target.y;
            // Opacity übernehmen → kein Aufflackern
            startOpacity = typeof p.opacity === 'number' ? p.opacity : 1;
            if (typeof p.rotation === 'number') startRotation = p.rotation;
            if (typeof p.breathPhase === 'number') startBreathPhase = p.breathPhase;
        }

        tokens.push({
            id: `contact-token-${i}`,
            label: spec.label,
            radius: spec.size * scale,
            // Pro-Token Farb-Verteilung — jede Linie bekommt alle 3 Farben
            baseColor: getColor(colors, getTokenColorKey(i), DEFAULT_COLORS.pri),
            glowColor: getColor(colors, getTokenColorKey(i), DEFAULT_COLORS.acc),
            textColor: colors.text || colors.txt || DEFAULT_COLORS.txt,

            // Linien-Bewegung
            group,
            progress,
            speed,

            // Position (renderX/renderY in 0..1)
            renderX: startX,
            renderY: startY,

            // Visual — Startwerte aus Vorgänger
            opacity: startOpacity,
            startOpacity,
            rotation: startRotation,
            rotationSpeed: (0.00005 + Math.random() * 0.0001) * (Math.random() > 0.5 ? 1 : -1) * TEMPO_SCALE,
            breathPhase: startBreathPhase,
            breathSpeed: (0.2 + Math.random() * 0.2) * TEMPO_SCALE,
            depthScale,
            depthLayer: group,

            // Übergang von vorheriger Section auf die Linie
            transitionProgress: fromTransition ? 0 : 1,
            transitionStartX: startX,
            transitionStartY: startY,
        });
    }

    return tokens;
}
