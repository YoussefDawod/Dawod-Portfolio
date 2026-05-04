/**
 * Home Animation — Update Logic
 * Formation, Dissolve-Phasen, Mouse/Gyro-Parallax
 */

import {
    ANIMATION_CONFIG,
    EASE_OUT_CUBIC,
    EASE_IN_OUT_CUBIC,
    TAU,
} from '../../shared/core.js';

import { TOKEN_FORMATION_DURATION, RING_SPACING_FACTOR, RING_OFFSET_FACTOR } from '../../shared/constants.js';
import { contentMaskFactor } from '../../engine/contentMask.js';

import {
    DISSOLVE_START,
    DISSOLVE_END,
} from './tokens.js';

// =============================================================================
// LOCAL CONSTANTS
// =============================================================================

const ORBIT_RADIUS_FACTOR = 0.22;
const SWIRL_ANGLE = Math.PI * 0.5;
const DISSOLVE_FADE_START = 0.7;
const DISSOLVE_FADE_RANGE = 0.3;
const EDGE_FADE_ZONE = 0.05;

// =============================================================================
// UPDATE HOME TOKENS
// =============================================================================

export function updateHomeTokens(tokens = [], deltaTime = 0.016, scrollProgress = 0, mouseX = null, mouseY = null, options = {}) {
    const dt = Math.max(ANIMATION_CONFIG.MIN_DELTA_TIME, Math.min(deltaTime, ANIMATION_CONFIG.MAX_DELTA_TIME));
    const reducedMotion = options.reducedMotion !== undefined
        ? options.reducedMotion
        : Boolean(typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
    const orientation = options.orientation || { beta: 0, gamma: 0 };

    const cssWidth = options.width || (typeof window !== 'undefined' ? window.innerWidth : 1024);
    const cssHeight = options.height || (typeof window !== 'undefined' ? window.innerHeight : 768);

    // Orbit-Radius direkt in Pixel (aus Container-Rect Pipeline)
    const baseRadiusPx = options.orbitRadiusPx !== undefined
        ? options.orbitRadiusPx
        : Math.min(cssWidth, cssHeight) * ORBIT_RADIUS_FACTOR;

    // Center direkt in Pixel
    const centerPx = options.centerPx || { x: cssWidth * 0.5, y: cssHeight * 0.5 };

    // Normalisiertes Center für renderX/renderY (0-1)
    const centerNorm = { x: centerPx.x / cssWidth, y: centerPx.y / cssHeight };

    // Dissolve Progress (scroll-basiert, 0-1)
    const globalDissolve = Math.max(0, Math.min(1,
        (scrollProgress - DISSOLVE_START) / (DISSOLVE_END - DISSOLVE_START)
    ));

    // ===== PER-TOKEN UPDATE =====
    tokens.forEach((token) => {
        token.age += dt;

        // Transition (About→Home Morph)
        if (token.transitionProgress < 1) {
            token.transitionProgress = Math.min(1, token.transitionProgress + dt * ANIMATION_CONFIG.TRANSITION_SPEED);
        }

        // Formation (zeitbasiert)
        if (!token.spawned && token.age >= token.spawnDelay) {
            token.spawned = true;
            token.formationProgress = 0;
        }
        if (token.spawned && token.formationProgress < 1) {
            token.formationProgress = Math.min(1, (token.age - token.spawnDelay) / TOKEN_FORMATION_DURATION);
        }

        // Opacity
        token.opacity = !token.spawned ? 0
            : token.formationProgress < 1 ? EASE_OUT_CUBIC(token.formationProgress) : 1;

        // Dissolve (Train-Flow: per-token Stagger + Half-Rotation Boost)
        // Outer Layer 2 verlässt zuerst, Inner Layer 0 zuletzt.
        // Innerhalb jeder Gruppe wave-stagger über indexInLayer.
        if (token.formationProgress < 1) {
            token.dissolveProgress = 0;
        } else {
            const delay = token.dissolveDelay ?? 0;
            const duration = token.dissolveDuration ?? 1;
            const localDissolve = Math.max(0, Math.min(1, (globalDissolve - delay) / duration));
            // Smooth decay beim Zurückscrollen
            token.dissolveProgress = (localDissolve > token.dissolveProgress)
                ? localDissolve
                : Math.max(localDissolve, token.dissolveProgress - dt * 2);
        }

        // ===== POSITION =====
        const dissolve = token.dissolveProgress;
        token.orbitAngle += token.orbitSpeed * dt;

        // Proportionaler Orbit-Radius: Layer-Offset skaliert mit dem Basis-Radius
        const currentRadius = baseRadiusPx * (1 + token.orbitLayer * RING_SPACING_FACTOR + RING_OFFSET_FACTOR);

        // Orbit-Position normalisiert (renderX/renderY sind 0-1, draw.js macht * w / * h)
        // Critically: gleicher Divisor (Breite für X, Höhe für Y) → garantiert kreisförmig
        const orbitX = centerNorm.x + (Math.cos(token.orbitAngle) * currentRadius) / cssWidth;
        const orbitY = centerNorm.y + (Math.sin(token.orbitAngle) * currentRadius) / cssHeight;

        let posX, posY;

        // Phase 1: Formation aus dem Außenraum (nicht mehr aus der Mitte).
        // Jeder Token erscheint an seiner Orbit-Position, leicht weiter
        // außen, und settelt sanft mit minimalem Swirl ein.
        if (token.formationProgress < 1) {
            const t = EASE_OUT_CUBIC(token.formationProgress);
            const outerScale = 1 + (1 - t) * 0.28;     // 1.28× → 1.00×
            const swirl = (1 - t) * SWIRL_ANGLE * 0.20; // sehr dezent
            const r = currentRadius * outerScale;
            posX = centerNorm.x + (Math.cos(token.orbitAngle + swirl) * r) / cssWidth;
            posY = centerNorm.y + (Math.sin(token.orbitAngle + swirl) * r) / cssHeight;
        } else {
            posX = orbitX;
            posY = orbitY;
        }

        // Transition: About→Home (Lerp von About-Position → Orbit)
        if (token.transitionProgress < 1 && token.transitionStartX !== undefined) {
            const tt = EASE_IN_OUT_CUBIC(token.transitionProgress);
            posX = token.transitionStartX + (posX - token.transitionStartX) * tt;
            posY = token.transitionStartY + (posY - token.transitionStartY) * tt;
        }

        // Dissolve: Orbit → Chaos-Position (single smooth lerp)
        if (dissolve > 0 && token.formationProgress >= 1) {
            const td = EASE_IN_OUT_CUBIC(dissolve);
            posX = posX + (token.chaosTargetX - posX) * td;
            posY = posY + (token.chaosTargetY - posY) * td;
            if (dissolve > DISSOLVE_FADE_START) token.opacity *= 1 - (dissolve - DISSOLVE_FADE_START) / DISSOLVE_FADE_RANGE;
        }

        // Mouse Parallax / Device Tilt
        if (!reducedMotion && token.formationProgress > 0.5) {
            let oX = 0, oY = 0;
            if (mouseX !== null && mouseY !== null) {
                oX = (mouseX - 0.5) * ANIMATION_CONFIG.MOUSE_PARALLAX_STRENGTH * token.depthScale;
                oY = (mouseY - 0.5) * ANIMATION_CONFIG.MOUSE_PARALLAX_STRENGTH * token.depthScale;
            } else if (orientation.beta !== 0 || orientation.gamma !== 0) {
                oX = -orientation.gamma * ANIMATION_CONFIG.MOUSE_PARALLAX_STRENGTH * 2 * token.depthScale;
                oY = -orientation.beta * ANIMATION_CONFIG.MOUSE_PARALLAX_STRENGTH * 2 * token.depthScale;
            }
            posX += oX;
            posY += oY;
        }

        token.renderX = posX;
        token.renderY = posY;

        // Rotation & Breathing
        token.rotation += token.rotationSpeed * dt;

        // Train-Flow Half-Rotation Boost: peakt bei dissolveProgress=0.5,
        // kehrt zurück bei 1. Delta zur Vorframe wird auf rotation addiert,
        // damit der Effekt "transient" bleibt und sich nicht akkumuliert.
        const newBoost = Math.sin(token.dissolveProgress * Math.PI) * (Math.PI / 4);
        const prevBoost = token.dissolveRotBoost ?? 0;
        token.rotation += (newBoost - prevBoost);
        token.dissolveRotBoost = newBoost;

        token.breathPhase += token.breathSpeed * dt;
        if (token.breathPhase > TAU) token.breathPhase -= TAU;

        // Wrap-Opacity (Randbereich)
        const edgeDist = Math.min(token.renderX, 1 - token.renderX, token.renderY, 1 - token.renderY);
        token.wrapOpacity = (edgeDist < EDGE_FADE_ZONE) ? Math.max(0, edgeDist / EDGE_FADE_ZONE) : 1;
        token.opacity *= token.wrapOpacity;

        // Phase 1: Inhalts-Respekt-Mask
        token.opacity *= contentMaskFactor(token.renderX, token.renderY);
    });

    return tokens;
}
