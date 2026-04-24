/**
 * Home Animation — Token Specs, Creation & Conversion
 * Orbit-Kreis mit gestaffelter Formation + Dissolve
 */

import {
    DEFAULT_COLORS,
    getThemeColors,
    getColor,
    getResponsiveTokenCount,
    getResponsiveScale,
    getResponsiveCenter,
    clampNormalized,
    randomInRange,
    TAU,
} from '../../shared/core.js';

import { DEPTH_SCALE_STEP, DEPTH_SCALE_STEP_FLOAT, GOLDEN_ANGLE_NORM, ORBIT_LAYERS } from '../../shared/constants.js';

// =============================================================================
// RAW TOKEN SPEC — Label, Größe, Farbschlüssel
// =============================================================================

export const RAW_TOKEN_SPEC = [
    { label: "</>",    size: 64, hue: "pri", glow: "pri" },
    { label: "fn",     size: 48, hue: "pri", glow: "pri" },
    { label: "=>",     size: 46, hue: "acc", glow: "acc" },
    { label: "if",     size: 44, hue: "pri", glow: "pri" },
    { label: "else",   size: 32, hue: "pri", glow: "pri" },
    { label: "...args",size: 34, hue: "pri", glow: "pri" },
    { label: "!",      size: 38, hue: "acc", glow: "acc" },
    { label: "{}",     size: 42, hue: "war", glow: "war" },
    { label: "[]",     size: 38, hue: "acc", glow: "acc" },
    { label: "()",     size: 36, hue: "acc", glow: "acc" },
    { label: "...",    size: 40, hue: "sub", glow: "sub" },
    { label: "===",    size: 34, hue: "sig", glow: "sig" },
    { label: "!==",    size: 34, hue: "acc", glow: "acc" },
    { label: "&&",     size: 36, hue: "acc", glow: "acc" },
    { label: "||",     size: 36, hue: "acc", glow: "acc" },
    { label: "+=",     size: 30, hue: "sub", glow: "sub" },
    { label: "-=",     size: 28, hue: "war", glow: "war" },
    { label: "*",      size: 30, hue: "sig", glow: "sig" },
    { label: "/",      size: 30, hue: "acc", glow: "acc" },
    { label: "%",      size: 28, hue: "sub", glow: "sub" },
    { label: "<",      size: 40, hue: "acc", glow: "acc" },
    { label: ">",      size: 40, hue: "war", glow: "war" },
    { label: "<=",     size: 30, hue: "acc", glow: "acc" },
    { label: ">=",     size: 30, hue: "sig", glow: "sig" },
    { label: "?:",     size: 34, hue: "acc", glow: "acc" },
    { label: ":",      size: 28, hue: "acc", glow: "acc" },
    { label: ";",      size: 30, hue: "acc", glow: "acc" },
    { label: ",",      size: 36, hue: "sub", glow: "sub" },
    { label: "#",      size: 30, hue: "sub", glow: "sub" },
    { label: "$",      size: 30, hue: "sig", glow: "sig" },
    { label: "//",     size: 32, hue: "sub", glow: "sub" },
];

// =============================================================================
// CONSTANTS
// =============================================================================

export const ORBIT_SPEED_BASE = 0.1;
export const FORMATION_DURATION = 2.5;

// Dissolve-Phasen: Beginn und Ende als Scroll-Prozent
export const DISSOLVE_START = 0.10;
export const DISSOLVE_END = 0.85;

// =============================================================================
// HELPERS
// =============================================================================

/** Golden-Angle Chaos-Position für Dissolve-Phase */
function generateChaosPosition(i, count) {
    const golden = Math.PI * GOLDEN_ANGLE_NORM;
    const theta = i * golden;
    const r = Math.sqrt((i + 0.5) / count) * 0.5;
    const jitter = (Math.random() - 0.5) * 0.12;
    return {
        x: clampNormalized(0.5 + r * Math.cos(theta) + Math.cos(theta * 3 + i) * jitter, 0.01),
        y: clampNormalized(0.5 + r * Math.sin(theta) + Math.sin(theta * 2 + i) * jitter, 0.01),
    };
}

/** Spawn-Delay: gleichmäßig über alle Tokens verteilt */
function spawnDelay(index, count) {
    return index * (FORMATION_DURATION / count);
}

/** Orbit-Startwinkel für Token index bei gegebener Gesamtzahl und Layer */
export function computeOrbitAngle(index, count, orbitLayer) {
    const indexInLayer = Math.floor(index / ORBIT_LAYERS);
    const tokensPerLayer = Math.ceil(count / ORBIT_LAYERS);
    return (indexInLayer / tokensPerLayer) * TAU + (orbitLayer / ORBIT_LAYERS) * (TAU / tokensPerLayer);
}



// =============================================================================
// CREATE HOME TOKENS
// =============================================================================

export function createHomeTokens(options = {}) {
    const colors = getThemeColors();
    const reducedMotion = Boolean(options.reducedMotion || (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches));
    const previousTokens = options.previousTokens || [];
    const count = getResponsiveTokenCount();
    const scale = getResponsiveScale();
    const center = getResponsiveCenter();

    const specs = Array.from({ length: count }, (_, i) => {
        const t = RAW_TOKEN_SPEC[i % RAW_TOKEN_SPEC.length];
        return { ...t, size: t.size * scale };
    });

    return specs.map((spec, index) => {
        const orbitLayer = index % ORBIT_LAYERS;
        const depthScale = 1 - orbitLayer * DEPTH_SCALE_STEP;
        const motionScale = reducedMotion ? 0.2 : 1;
        const chaosTarget = generateChaosPosition(index, count);
        const fromTransition = previousTokens.length > 0;

        let startX = center.x, startY = center.y;
        if (fromTransition) {
            const prev = previousTokens[index % previousTokens.length];
            startX = prev.renderX ?? prev.x ?? center.x;
            startY = prev.renderY ?? prev.y ?? center.y;
        }

        return {
            id: `home-token-${index}`, label: spec.label,
            radius: spec.size,
            baseColor: getColor(colors, spec.hue, DEFAULT_COLORS.pri),
            glowColor: getColor(colors, spec.glow, DEFAULT_COLORS.acc),
            textColor: colors.text || colors.txt || DEFAULT_COLORS.txt,
            // Orbit
            orbitAngle: computeOrbitAngle(index, count, orbitLayer),
            orbitSpeed: (ORBIT_SPEED_BASE + Math.random() * 0.05) * (orbitLayer % 2 === 0 ? 1 : -1) * motionScale,
            orbitLayer,
            // Formation
            formationProgress: fromTransition ? 1 : 0,
            spawnDelay: (reducedMotion || fromTransition) ? 0 : spawnDelay(index, count),
            spawned: reducedMotion || fromTransition,
            // Dissolve
            dissolveProgress: 0,

            // Position
            renderX: startX, renderY: startY,
            opacity: fromTransition ? 1 : 0,
            // Visual
            rotation: (Math.random() - 0.5) * 0.2,
            rotationSpeed: randomInRange(0.0004, 0.0012) * (Math.random() > 0.5 ? 1 : -1) * motionScale,
            breathPhase: Math.random() * TAU,
            breathSpeed: randomInRange(0.2, 0.4) * motionScale,
            depthLayer: orbitLayer, depthScale, age: 0,
            // Chaos targets
            chaosTargetX: chaosTarget.x, chaosTargetY: chaosTarget.y,

            // Chaos-Motion (aktiviert nach dissolve)
            driftX: chaosTarget.x,
            driftSpeed: randomInRange(0.008, 0.015) * depthScale * motionScale,
            flowPhase: Math.random() * TAU,
            flowSpeed: randomInRange(0.012, 0.025) * depthScale * motionScale,
            loopPhase: Math.random() * TAU,
            loopSpeed: randomInRange(0.15, 0.3) * depthScale * motionScale,
            amplitudeX: randomInRange(0.03, 0.06) * motionScale,
            amplitudeY: randomInRange(0.025, 0.06) * motionScale,
            floatPhase: Math.random() * TAU,
            floatSpeed: 0.1 * randomInRange(0.85, 1.15) * motionScale,
            // 3D (z=0 für exakte Ring-Positionierung, keine Perspektiv-Verzerrung)
            z: 0, baseZ: 0,
            wrapOpacity: 1.0,
            transitionStartX: startX, transitionStartY: startY,
            transitionProgress: fromTransition ? 0 : 1,
        };
    });
}

// =============================================================================
// CONVERT HOME → ABOUT (Orbit → Chaos)
// =============================================================================

export function convertHomeTokensToAbout(homeTokens = []) {
    return homeTokens.map((token, index) => {
        const depthLayer = index % ORBIT_LAYERS;
        const depthScale = 1 - depthLayer * DEPTH_SCALE_STEP_FLOAT;
        return {
            ...token,
            startPosition: { x: token.renderX, y: token.renderY },
            transitionProgress: 0,
            position: { x: token.chaosTargetX, y: token.chaosTargetY },
            driftX: token.renderX,
            driftSpeed: randomInRange(0.008, 0.015) * depthScale,
            flowPhase: Math.random() * TAU,
            flowSpeed: randomInRange(0.012, 0.025) * depthScale,
            loopPhase: Math.random() * TAU,
            loopSpeed: randomInRange(0.15, 0.3) * depthScale,
            amplitudeX: randomInRange(0.03, 0.06),
            amplitudeY: randomInRange(0.025, 0.06),
            floatPhase: Math.random() * TAU,
            floatSpeed: 0.1 * randomInRange(0.85, 1.15),
            z: randomInRange(-150, 300), baseZ: randomInRange(-150, 300),
            depthLayer, depthScale,
            wrapOpacity: 1.0, opacityMultiplier: 1.0,
        };
    });
}
