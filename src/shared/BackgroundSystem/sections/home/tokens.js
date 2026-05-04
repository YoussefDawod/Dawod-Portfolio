/**
 * Home Animation — Token Specs, Creation & Conversion
 * Orbit-Kreis mit gestaffelter Formation + Dissolve
 */

import {
    DEFAULT_COLORS,
    getThemeColors,
    getColor,
    getTokenColorKey,
    getResponsiveTokenCount,
    getResponsiveScale,
    getResponsiveCenter,
    clampNormalized,
    randomInRange,
    TAU,
} from '../../shared/core.js';

import { DEPTH_SCALE_STEP, DEPTH_SCALE_STEP_FLOAT, ORBIT_LAYERS, TEMPO_SCALE } from '../../shared/constants.js';

// =============================================================================
// RAW TOKEN SPEC — Label, Größe, Farbschlüssel
// =============================================================================

/**
 * 45 kuratierte JS/React-Tokens — keine Keywords, nur Operatoren, Syntax,
 * Kommentare/Meta. Pro Token eigene Farbe (hue/glow).
 *
 * Größen-System (3 Stufen):
 *   - Groß  (48): ikonische Haupt-Operatoren
 *   - Mittel(36): häufige Operatoren
 *   - Klein (28): Syntax-Zeichen / Meta
 *
 * Die Basis-Größe wird in createHomeTokens zusätzlich mit depthScale
 * (Ring-Tiefe) multipliziert → Tiefen-Effekt (Variante B+D).
 */
export const RAW_TOKEN_SPEC = [
    // --- Groß (48px) — 6 ikonische ---
    { label: "</>",  size: 48, hue: "pri",  glow: "pri"  },
    { label: "=>",   size: 48, hue: "pri2", glow: "pri2" },
    { label: "...",  size: 48, hue: "sig",  glow: "sig"  },
    { label: "{}",   size: 48, hue: "pri",  glow: "pri"  },
    { label: "[]",   size: 48, hue: "pri2", glow: "pri2" },
    { label: "()",   size: 48, hue: "sig",  glow: "sig"  },

    // --- Mittel (36px) — 19 Operatoren ---
    { label: "===",  size: 36, hue: "pri",  glow: "pri"  },
    { label: "!==",  size: 36, hue: "pri2", glow: "pri2" },
    { label: "&&",   size: 36, hue: "sig",  glow: "sig"  },
    { label: "||",   size: 36, hue: "pri",  glow: "pri"  },
    { label: "??",   size: 36, hue: "pri2", glow: "pri2" },
    { label: "?.",   size: 36, hue: "sig",  glow: "sig"  },
    { label: "|>",   size: 36, hue: "pri",  glow: "pri"  },
    { label: "**",   size: 36, hue: "pri2", glow: "pri2" },
    { label: "++",   size: 36, hue: "sig",  glow: "sig"  },
    { label: "--",   size: 36, hue: "pri",  glow: "pri"  },
    { label: ">=",   size: 36, hue: "pri2", glow: "pri2" },
    { label: "<=",   size: 36, hue: "sig",  glow: "sig"  },
    { label: "??=",  size: 36, hue: "pri",  glow: "pri"  },
    { label: "||=",  size: 36, hue: "pri2", glow: "pri2" },
    { label: "&&=",  size: 36, hue: "sig",  glow: "sig"  },
    { label: "+=",   size: 36, hue: "pri",  glow: "pri"  },
    { label: "-=",   size: 36, hue: "pri2", glow: "pri2" },
    { label: "*=",   size: 36, hue: "sig",  glow: "sig"  },
    { label: "//",   size: 36, hue: "pri",  glow: "pri"  },

    // --- Klein (28px) — 20 Syntax / Meta ---
    { label: "!",    size: 28, hue: "pri2", glow: "pri2" },
    { label: "%",    size: 28, hue: "sig",  glow: "sig"  },
    { label: "~",    size: 28, hue: "pri",  glow: "pri"  },
    { label: "^",    size: 28, hue: "pri2", glow: "pri2" },
    { label: "&",    size: 28, hue: "sig",  glow: "sig"  },
    { label: "|",    size: 28, hue: "pri",  glow: "pri"  },
    { label: "*",    size: 28, hue: "pri2", glow: "pri2" },
    { label: "/",    size: 28, hue: "sig",  glow: "sig"  },
    { label: "#",    size: 28, hue: "pri",  glow: "pri"  },
    { label: "$",    size: 28, hue: "pri2", glow: "pri2" },
    { label: "@",    size: 28, hue: "sig",  glow: "sig"  },
    { label: "_",    size: 28, hue: "pri",  glow: "pri"  },
    { label: ";",    size: 28, hue: "pri2", glow: "pri2" },
    { label: ":",    size: 28, hue: "sig",  glow: "sig"  },
    { label: ",",    size: 28, hue: "pri",  glow: "pri"  },
    { label: "=",    size: 28, hue: "pri2", glow: "pri2" },
    { label: "!=",   size: 28, hue: "sig",  glow: "sig"  },
    { label: "==",   size: 28, hue: "pri",  glow: "pri"  },
    { label: "<<",   size: 28, hue: "pri2", glow: "pri2" },
    { label: ">>",   size: 28, hue: "sig",  glow: "sig"  },
];

// =============================================================================
// CONSTANTS
// =============================================================================

export const ORBIT_SPEED_BASE = 0.1;

// =============================================================================
// PHASE 1 — LAYER-WAVE-FORMATION (nur Initial-Load)
// =============================================================================

/**
 * Wellen-Aufbau pro Orbit-Layer beim ersten Anzeigen der Seite.
 * Innenring zuerst, dann Mitte, dann außen.
 *
 * Werte sind Sekunden:
 *   - WAVE_OFFSETS[layer] = Sekunden, ab denen Tokens dieser Schicht spawnen
 *   - WAVE_PER_TOKEN     = Versatz zwischen aufeinanderfolgenden Tokens
 *                          derselben Schicht (sichtbar einzeln, nicht im Block)
 */
const WAVE_OFFSETS = [0.00, 0.55, 1.10];
const WAVE_PER_TOKEN = 0.085;

// =============================================================================
// PHASE 1 — RADIALE HOME→ABOUT-EXPANSION
// =============================================================================
// Statt Tokens auf ein 6×3-Grid in der Mitte zu „explodieren", werden sie
// entlang ihres aktuellen Orbit-Winkels nach außen geschoben (Ring → weiter
// Ring). Das gleiche Ziel wird auch beim Scroll-Dissolve verwendet.
const HOME_TO_ABOUT_BASE_RADIUS = 0.36;
const HOME_TO_ABOUT_LAYER_STEP = 0.045;
const HOME_TO_ABOUT_VERTICAL_FLATTEN = 0.78;

// Dissolve-Phasen: Beginn und Ende als Scroll-Prozent
export const DISSOLVE_START = 0.10;
export const DISSOLVE_END = 0.85;

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Phase-1 Layer-Wave-Spawn-Delay.
 * Jeder Token bekommt einen eigenen Spawn-Zeitpunkt:
 *   – Layer-Offset (innen → außen)
 *   – plus index-in-layer × WAVE_PER_TOKEN (einzeln nacheinander, nicht im Block)
 */
function layerWaveSpawnDelay(index, _count, orbitLayer) {
    const indexInLayer = Math.floor(index / ORBIT_LAYERS);
    const offset = WAVE_OFFSETS[orbitLayer] ?? 0;
    return offset + indexInLayer * WAVE_PER_TOKEN;
}

// =============================================================================
// PHASE 3 — TRAIN-FLOW DISSOLVE (Outside-In Stagger)
// =============================================================================
// Beim Verlassen verlassen Outer-Ring-Tokens zuerst, Inner-Ring zuletzt
// (gespiegelt zur Formation, die Inner→Outer aufbaut). Innerhalb jeder
// Gruppe stagger pro Token → "Zug"-Effekt.
//
// Formel:
//   layerDelay  = (2 - layer) * LAYER_STAGGER   → Layer 2: 0.00, Layer 1: 0.18, Layer 0: 0.36
//   tokenDelay  = (indexInLayer / tokensPerLayer) * TOKEN_STAGGER
//   dissolveDuration = 1 - max(layerDelay + tokenDelay)  (jeder finished bei globalDissolve=1)
const TRAIN_LAYER_STAGGER = 0.18;   // ~70% Überlappung zwischen Gruppen
const TRAIN_TOKEN_STAGGER = 0.10;   // dezenter Wave innerhalb der Gruppe
const TRAIN_BASE_DURATION = 1 - (TRAIN_LAYER_STAGGER * (ORBIT_LAYERS - 1) + TRAIN_TOKEN_STAGGER);
// Mit Defaults: 1 - (0.36 + 0.10) = 0.54 → jeder Token braucht 54% des Scroll-Bereichs

function trainDissolveDelay(index, _count, orbitLayer) {
    const indexInLayer = Math.floor(index / ORBIT_LAYERS);
    const tokensPerLayer = Math.ceil(_count / ORBIT_LAYERS);
    const layerDelay = (ORBIT_LAYERS - 1 - orbitLayer) * TRAIN_LAYER_STAGGER;
    const tokenDelay = tokensPerLayer > 0 ? (indexInLayer / tokensPerLayer) * TRAIN_TOKEN_STAGGER : 0;
    return layerDelay + tokenDelay;
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
        const motionScale = (reducedMotion ? 0.2 : 1) * TEMPO_SCALE;
        const orbitAngle = computeOrbitAngle(index, count, orbitLayer);

        // Phase 1: Dissolve-/About-Ziel = radiale Expansion entlang des
        // Orbit-Winkels (Ring → weiterer Ring). Vermeidet das „Explodieren"
        // auf ein zentrales 6×3-Grid und harmonisiert mit Projects↔About.
        const targetR = HOME_TO_ABOUT_BASE_RADIUS + orbitLayer * HOME_TO_ABOUT_LAYER_STEP;
        const chaosTarget = {
            x: clampNormalized(0.5 + Math.cos(orbitAngle) * targetR, 0.05),
            y: clampNormalized(0.5 + Math.sin(orbitAngle) * targetR * HOME_TO_ABOUT_VERTICAL_FLATTEN, 0.05),
        };
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
            // Pro-Token Farb-Verteilung — jeder Ring bekommt alle 3 Farben
            baseColor: getColor(colors, getTokenColorKey(index), DEFAULT_COLORS.pri),
            glowColor: getColor(colors, getTokenColorKey(index), DEFAULT_COLORS.acc),
            textColor: colors.text || colors.txt || DEFAULT_COLORS.txt,
            // Orbit
            orbitAngle,
            orbitSpeed: ORBIT_SPEED_BASE * (orbitLayer % 2 === 0 ? 1 : -1) * motionScale,
            orbitLayer,
            // Formation
            formationProgress: fromTransition ? 1 : 0,
            spawnDelay: (reducedMotion || fromTransition) ? 0 : layerWaveSpawnDelay(index, count, orbitLayer),
            spawned: reducedMotion || fromTransition,
            // Dissolve (Train-Flow Stagger)
            dissolveProgress: 0,
            dissolveDelay: trainDissolveDelay(index, count, orbitLayer),
            dissolveDuration: TRAIN_BASE_DURATION,
            dissolveRotBoost: 0,

            // Position
            renderX: startX, renderY: startY,
            opacity: fromTransition ? 1 : 0,
            // Visual
            rotation: (Math.random() - 0.5) * 0.05,
            rotationSpeed: randomInRange(0.00005, 0.00015) * (Math.random() > 0.5 ? 1 : -1) * motionScale,
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

/**
 * Phase 1: Statt die Tokens vom engen Orbit auf ein 6×3-Grid zu „explodieren",
 * werden sie radial nach außen geschoben — entlang ihres aktuellen Orbit-
 * Winkels auf einen weiteren Ring (~0.36 Norm-Radius). Daraus übernimmt
 * About's natürliche Drift, sodass die Verteilung organisch wirkt.
 *
 * Ergebnis: Home → About fühlt sich an wie About → Projects (kurze,
 * nahe Bewegung statt großer Sprung).
 */
export function convertHomeTokensToAbout(homeTokens = []) {
    const count = homeTokens.length;
    return homeTokens.map((token, index) => {
        const depthLayer = index % ORBIT_LAYERS;
        const depthScale = 1 - depthLayer * DEPTH_SCALE_STEP_FLOAT;
        const t = TEMPO_SCALE;

        // Radial-expandiertes Ziel entlang des Orbit-Winkels
        const angle = token.orbitAngle ?? computeOrbitAngle(index, count, depthLayer);
        const targetR = HOME_TO_ABOUT_BASE_RADIUS + depthLayer * HOME_TO_ABOUT_LAYER_STEP;
        const aboutX = clampNormalized(0.5 + Math.cos(angle) * targetR, 0.05);
        const aboutY = clampNormalized(0.5 + Math.sin(angle) * targetR * HOME_TO_ABOUT_VERTICAL_FLATTEN, 0.05);

        return {
            ...token,
            startPosition: { x: token.renderX, y: token.renderY },
            transitionProgress: 0,
            position: { x: aboutX, y: aboutY },
            driftX: token.renderX,
            driftSpeed: randomInRange(0.008, 0.015) * depthScale * t,
            flowPhase: Math.random() * TAU,
            flowSpeed: randomInRange(0.012, 0.025) * depthScale * t,
            loopPhase: Math.random() * TAU,
            loopSpeed: randomInRange(0.15, 0.3) * depthScale * t,
            amplitudeX: randomInRange(0.03, 0.06),
            amplitudeY: randomInRange(0.025, 0.06),
            floatPhase: Math.random() * TAU,
            floatSpeed: 0.1 * randomInRange(0.85, 1.15) * t,
            z: randomInRange(-150, 300), baseZ: randomInRange(-150, 300),
            depthLayer, depthScale,
            wrapOpacity: 1.0, opacityMultiplier: 1.0,
        };
    });
}
