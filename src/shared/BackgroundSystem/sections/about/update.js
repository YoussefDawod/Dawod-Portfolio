// about/update.js
// Update-Logik für About-Section — Chaotische schwebende Code-Tokens

import {
    clampNormalized,
    EASE_IN_OUT_CUBIC,
    ANIMATION_CONFIG,
    TAU,
    BREAKPOINTS,
} from '../../shared/core.js';

// =============================================================================
// CONSTANTS
// =============================================================================

const WRAP_FADE_ZONE = 0.18;
const WRAP_MARGIN = 0.15;
const VERTICAL_FLOAT_RANGE = 0.05;

// Text-Area Dampening (reduziert Opacity von Tokens hinter dem Text)
const TEXT_WIDTH_MOBILE = 600;
const TEXT_WIDTH_DESKTOP = 800;
const TEXT_MAX_NORM_MOBILE = 0.65;
const TEXT_MAX_NORM_DESKTOP = 0.85;
const TEXT_TOP = 0.2;
const TEXT_BOTTOM = 0.85;
const DAMPEN_MOBILE = 0.35;
const DAMPEN_DESKTOP = 0.15;

// Z-Axis Breathing
const Z_BREATH_SPEED = 0.3;
const Z_BREATH_AMPLITUDE = 30;

/**
 * Prüft ob ein Token im Textbereich liegt (Dampening)
 * About-Text ist zentriert, max-width 800px
 * Mobile: schmalere Zone, damit Tokens sichtbar bleiben
 */
function isInTextArea(nx, ny, cssWidth) {
    const isMobile = cssWidth < BREAKPOINTS.DESKTOP;
    const textWidthNorm = isMobile
        ? Math.min(TEXT_WIDTH_MOBILE / cssWidth, TEXT_MAX_NORM_MOBILE)
        : Math.min(TEXT_WIDTH_DESKTOP / cssWidth, TEXT_MAX_NORM_DESKTOP);
    const left = (1 - textWidthNorm) / 2;
    const right = 1 - left;
    return nx > left && nx < right && ny > TEXT_TOP && ny < TEXT_BOTTOM;
}

// =============================================================================
// UPDATE ABOUT TOKENS (Chaos-Floating)
// =============================================================================

export function updateAboutTokens(tokens = [], deltaTime = 0.016, mouseX = null, mouseY = null, options = {}) {
    const dt = Math.max(ANIMATION_CONFIG.MIN_DELTA_TIME, Math.min(deltaTime, ANIMATION_CONFIG.MAX_DELTA_TIME));
    const reducedMotion = options.reducedMotion !== undefined
        ? options.reducedMotion
        : Boolean(typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
    const orientation = options.orientation || { beta: 0, gamma: 0 };
    const cssWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;

    tokens.forEach((token) => {
        token.age += dt;

        // Transition from Home → About
        if (token.transitionProgress < 1) {
            token.transitionProgress += dt * ANIMATION_CONFIG.TRANSITION_SPEED;
            if (token.transitionProgress > 1) token.transitionProgress = 1;
        }

        // Opacity: immer sichtbar
        token.opacity = 1.0;

        // Loop animation
        token.loopPhase += token.loopSpeed * dt;
        if (token.loopPhase > TAU) token.loopPhase -= TAU;

        // Flow animation
        token.flowPhase += token.flowSpeed * dt;
        if (token.flowPhase > TAU) token.flowPhase -= TAU;

        // Horizontal drift mit sanftem Wrapping
        token.driftX -= token.driftSpeed * dt;

        if (token.driftX < -WRAP_MARGIN) {
            token.driftX = 1 + WRAP_MARGIN;
            token.wrapOpacity = 0;
        } else if (token.driftX > 1 + WRAP_MARGIN) {
            token.driftX = -WRAP_MARGIN;
            token.wrapOpacity = 0;
        }

        // Wrap-Opacity (smoothstep für sanften Übergang)
        if (token.driftX < WRAP_FADE_ZONE) {
            const raw = Math.min(1, token.driftX / WRAP_FADE_ZONE);
            token.wrapOpacity = raw * raw * (3 - 2 * raw);
        } else if (token.driftX > 1 - WRAP_FADE_ZONE) {
            const raw = Math.min(1, (1 - token.driftX) / WRAP_FADE_ZONE);
            token.wrapOpacity = raw * raw * (3 - 2 * raw);
        } else {
            token.wrapOpacity = 1;
        }

        // Rotation & Breathing
        token.rotation += token.rotationSpeed * dt;
        token.breathPhase += token.breathSpeed * dt;
        if (token.breathPhase > TAU) token.breathPhase -= TAU;

        // Float
        token.floatPhase += token.floatSpeed * dt;
        if (token.floatPhase > TAU) token.floatPhase -= TAU;

        // Z-Breathing
        token.z = (token.baseZ || 0) + Math.sin(token.age * Z_BREATH_SPEED) * Z_BREATH_AMPLITUDE;

        // Position
        const waveX = Math.sin(token.flowPhase) * token.amplitudeX * 0.5;
        const waveY = Math.sin(token.loopPhase) * token.amplitudeY;
        const floatOffset = Math.sin(token.floatPhase) * VERTICAL_FLOAT_RANGE;

        let nextX = token.driftX + waveX;
        let nextY = (token.position?.y ?? 0.5) + waveY + floatOffset;

        // Mouse parallax / Device Tilt
        if (!reducedMotion) {
            let offsetX = 0, offsetY = 0;
            if (mouseX !== null && mouseY !== null) {
                offsetX = (mouseX - 0.5) * ANIMATION_CONFIG.MOUSE_PARALLAX_STRENGTH * token.depthScale;
                offsetY = (mouseY - 0.5) * ANIMATION_CONFIG.MOUSE_PARALLAX_STRENGTH * token.depthScale;
            } else if (orientation.beta !== 0 || orientation.gamma !== 0) {
                offsetX = -orientation.gamma * ANIMATION_CONFIG.MOUSE_PARALLAX_STRENGTH * 2 * token.depthScale;
                offsetY = -orientation.beta * ANIMATION_CONFIG.MOUSE_PARALLAX_STRENGTH * 2 * token.depthScale;
            }
            nextX += offsetX;
            nextY += offsetY;
        }

        // Transition Lerp
        if (token.transitionProgress < 1) {
            const t = EASE_IN_OUT_CUBIC(token.transitionProgress);
            const startX = token.startPosition?.x ?? token.renderX;
            const startY = token.startPosition?.y ?? token.renderY;
            token.renderX = startX + (nextX - startX) * t;
            token.renderY = startY + (clampNormalized(nextY) - startY) * t;
        } else {
            token.renderX = nextX;
            token.renderY = clampNormalized(nextY);
        }

        // Text-Dampening: Tokens im Textbereich werden gedimmt
        let textDampen = 1.0;
        if (isInTextArea(token.renderX, token.renderY, cssWidth)) {
            textDampen = cssWidth < BREAKPOINTS.DESKTOP ? DAMPEN_MOBILE : DAMPEN_DESKTOP;
        }

        token.opacity = token.wrapOpacity * (token.opacityMultiplier ?? 1.0) * textDampen;
    });

    return tokens;
}
