/**
 * Image Manager — Profilbild-Positionierung & -Styling
 * Berechnet Opacity, Scale, Blur und Parallax für Front/Behind Layer
 * Konfiguration kommt aus sections/home/image.js
 */

import { BREAKPOINTS } from '../shared/core.js';

import {
    getImageCenter,
    getImageRadius,
    IMAGE_ASPECT,
    IMAGE_WIDTH_FACTOR,
    PARALLAX,
    IMAGE_SHADOWS,
    GLOW,
    getMaskGradients,
    LERP_RATES,
} from '../sections/home/image.js';

// =============================================================================
// COMPUTE — Zielwerte basierend auf Token-State
// =============================================================================

export function computeImageTargets(tokens, animationMode, isInHome) {
    let targetOpacity = 0, targetScale = 0.85, targetBlur = 0;
    let avgDissolve = 0;

    if (animationMode === 'home' && isInHome && tokens.length > 0) {
        let avgFormation = 0;
        for (const t of tokens) {
            avgFormation += t.formationProgress || 0;
            avgDissolve += t.dissolveProgress || 0;
        }
        avgFormation /= tokens.length;
        avgDissolve /= tokens.length;

        const dissolveFade = Math.max(0, Math.min(1, (avgDissolve - 0.2) / 0.4));
        targetOpacity = Math.min(1, avgFormation * 1.5) * (1 - dissolveFade);
        targetScale = 0.85 + 0.15 * avgFormation - 0.08 * dissolveFade;
        targetBlur = dissolveFade * 4;
    }

    document.documentElement.style.setProperty('--home-dissolve', avgDissolve.toFixed(3));
    return { targetOpacity, targetScale, targetBlur };
}

// =============================================================================
// LERP — Smooth Übergang zum Zielzustand
// =============================================================================

export function lerpImageState(state, targets, inHome) {
    const rates = inHome ? LERP_RATES.inHome : LERP_RATES.leaving;

    state.opacity += (targets.targetOpacity - state.opacity) * rates.opacity;
    state.scale  += (targets.targetScale  - state.scale)  * rates.scale;
    state.blur   += (targets.targetBlur   - state.blur)   * rates.blur;

    if (state.opacity < 0.01) state.opacity = 0;
}

// =============================================================================
// APPLY — DOM-Styles setzen
// =============================================================================

export function applyImageStyles(refs, state, orientation, mouse, cssWidth, cssHeight, container) {
    const { imageRef, imageBehindRef, glowRef } = refs;
    if (!imageRef || !imageBehindRef || !glowRef) return;

    // Bild-Zentrum direkt in Pixel (keine Normalisierung)
    const centerPx = (container && container.centerPx) || {
        x: cssWidth * getImageCenter().x,
        y: cssHeight * getImageCenter().y,
    };

    // Bild-Durchmesser direkt in Pixel
    let sizePx;
    if (container && container.imageRadiusPx) {
        sizePx = container.imageRadiusPx * 2;
    } else {
        sizePx = getImageRadius() * Math.min(cssWidth, cssHeight) * 2;
    }

    // Bildmaße (Seitenverhältnis aus image.js)
    const imgWidth = sizePx * IMAGE_WIDTH_FACTOR;
    const imgHeight = imgWidth / IMAGE_ASPECT;
    const shiftUp = (imgHeight - sizePx) / 2;
    const splitPct = ((shiftUp + imgHeight / 2) / imgHeight) * 100;

    // Parallax-Offset
    let offsetX = 0, offsetY = 0;
    const isTouchDevice = 'ontouchstart' in window;
    if (isTouchDevice && (orientation.beta !== 0 || orientation.gamma !== 0)) {
        offsetX = -orientation.gamma * PARALLAX.strength;
        offsetY = -orientation.beta * PARALLAX.strength;
    } else if (mouse.x !== null && mouse.y !== null) {
        offsetX = (mouse.x - 0.5) * PARALLAX.strength;
        offsetY = (mouse.y - 0.5) * PARALLAX.strength;
    }

    const posLeft = `${centerPx.x}px`;
    const posTop = `${centerPx.y}px`;
    const transform = `translate(calc(-50% + ${offsetX.toFixed(1)}px), calc(-50% - ${shiftUp.toFixed(1)}px + ${offsetY.toFixed(1)}px)) scale(${state.scale.toFixed(4)})`;
    const masks = getMaskGradients(splitPct);

    // Image-Fade Maske (nur auf Mobile: unten→oben)
    const isMobile = cssWidth < BREAKPOINTS.DESKTOP;
    const fadeMask = isMobile
        ? 'linear-gradient(to bottom, black 50%, transparent 92%)'
        : null;

    const frontMask  = fadeMask ? `${fadeMask}, ${masks.front}`  : masks.front;
    const behindMask = fadeMask ? `${fadeMask}, ${masks.behind}` : masks.behind;

    // maskComposite nur bei mehreren Layern (Mobile: fadeMask + split-mask)
    const compositeProps = fadeMask ? {
        maskComposite: 'intersect',
        WebkitMaskComposite: 'source-in',
    } : {};

    // Front Layer (Kopf)
    Object.assign(imageRef.style, {
        left: posLeft, top: posTop, width: `${imgWidth}px`, height: 'auto',
        opacity: state.opacity.toFixed(3), transform,
        maskImage: frontMask,
        webkitMaskImage: frontMask,
        ...compositeProps,
    });

    // Behind Layer (Body)
    Object.assign(imageBehindRef.style, {
        left: posLeft, top: posTop, width: `${imgWidth}px`, height: 'auto',
        opacity: state.opacity.toFixed(3), transform,
        maskImage: behindMask,
        webkitMaskImage: behindMask,
        ...compositeProps,
    });

    // Filter: Blur + eleganter Drop-Shadow
    if (state.blur > 0.1) {
        imageRef.style.filter = IMAGE_SHADOWS.withBlur(state.blur);
        imageBehindRef.style.filter = `blur(${state.blur.toFixed(1)}px)`;
    } else {
        // Ruhezustand: nur den eleganten Drop-Shadow
        imageRef.style.filter = IMAGE_SHADOWS.css;
        imageBehindRef.style.filter = '';
    }

    // Glow (Puls via JS, damit kein CSS-Animation-Override)
    const glowSize = sizePx + GLOW.sizeOffset;
    const pulse = state.opacity > 0
        ? GLOW.pulseBase + Math.sin(performance.now() * GLOW.pulseSpeed) * GLOW.pulseAmplitude
        : 0;
    Object.assign(glowRef.style, {
        left: `${centerPx.x}px`, top: `${centerPx.y}px`,
        width: `${glowSize}px`, height: `${glowSize}px`,
        opacity: (state.opacity * pulse).toFixed(3),
    });
}
