/**
 * Contact Section — Update
 * Tokens loopen entlang ihrer Linie, übergangsweise Lerp aus vorheriger
 * Section-Position auf die Linie.
 */

import {
    ANIMATION_CONFIG,
    EASE_OUT_CUBIC,
    TAU,
} from '../../shared/core.js';
import { contentMaskFactor } from '../../engine/contentMask.js';

// Lokale Helpers spiegeln die in tokens.js definierten Bahnen
import { getLineConfig, progressOpacity } from '../projects/lineGeometry.js';

const TRANSITION_SPEED = ANIMATION_CONFIG.TRANSITION_SPEED;

export function updateContactNodes(tokens = [], deltaTime = 0.016, options = {}) {
    const { exitMode = false, exitDirection = 1, exitSpeedMultiplier = 2 } = options;
    const dt = Math.max(
        ANIMATION_CONFIG.MIN_DELTA_TIME,
        Math.min(deltaTime, ANIMATION_CONFIG.MAX_DELTA_TIME),
    );

    tokens.forEach((token) => {
        // 1. Progress auf der Linie weiterbewegen
        if (exitMode) {
            token.progress += token.speed * dt * exitDirection * exitSpeedMultiplier;
            // Kein Wrap: Token läuft bis zum Ende und bleibt dort
            if (exitDirection > 0) token.progress = Math.min(1.0, token.progress);
            else                   token.progress = Math.max(0.0, token.progress);
        } else {
            token.progress += token.speed * dt;
            if (token.progress >= 1) token.progress -= 1;
            else if (token.progress < 0) token.progress += 1;
        }

        // 2. Linien-Position
        const cfg = getLineConfig(token.group);
        const range = cfg.end - cfg.start;
        const along = cfg.start + range * token.progress;
        const linePos = cfg.axis === 'y'
            ? { x: cfg.fixed, y: along }
            : { x: along, y: cfg.fixed };

        // 3. Übergang aus vorheriger Section auf die Linie
        if (!exitMode && token.transitionProgress < 1) {
            token.transitionProgress = Math.min(1, token.transitionProgress + dt * TRANSITION_SPEED);
            const t = EASE_OUT_CUBIC(token.transitionProgress);
            token.renderX = token.transitionStartX + (linePos.x - token.transitionStartX) * t;
            token.renderY = token.transitionStartY + (linePos.y - token.transitionStartY) * t;
        } else {
            token.renderX = linePos.x;
            token.renderY = linePos.y;
        }

        // 4. Rotation & Breathing — wie Home, dezent
        token.rotation += token.rotationSpeed * dt;
        token.breathPhase += token.breathSpeed * dt;
        if (token.breathPhase > TAU) token.breathPhase -= TAU;

        // 5. Opacity
        const edgeFade = progressOpacity(token.progress);
        if (exitMode) {
            // Nur Edge-Fade: Tokens verlieren Opacity, wenn sie ans Linienende treiben
            token.opacity = edgeFade;
        } else {
            const mask = contentMaskFactor(token.renderX, token.renderY);
            const target = edgeFade * mask;
            if (token.transitionProgress < 1) {
                const t = EASE_OUT_CUBIC(token.transitionProgress);
                const start = token.startOpacity ?? 0;
                token.opacity = start + (target - start) * t;
            } else {
                token.opacity = target;
            }
        }
    });

    return tokens;
}
