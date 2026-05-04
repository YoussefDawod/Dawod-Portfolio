/**
 * Home Section â€” Image Configuration & Styling
 * =============================================
 * Zentrale Datei fÃ¼r ALLES was das Profilbild betrifft:
 * - Viewport/Responsive Werte (GrÃ¶ÃŸe, Position)
 * - Shadow & Glow Konfiguration
 * - Filter (Blur, Drop-Shadow)
 * - Parallax-StÃ¤rke
 */

// =============================================================================
// RESPONSIVE BREAKPOINTS (importiert aus core.js)
// =============================================================================

import { BREAKPOINTS } from '../../shared/core.js';

function getDevice() {
    if (typeof window === 'undefined') return 'desktop';
    return window.innerWidth < BREAKPOINTS.DESKTOP ? 'mobile' : 'desktop';
}

// =============================================================================
// IMAGE SIZING & POSITION
// =============================================================================

/**
 * Zentrale GrÃ¶ÃŸen-Konfiguration fÃ¼r Orbit und Profilbild.
 *
 * Architektur: Virtueller Container â†’ Kind-Elemente mit Prozent.
 *
 *  container    â€” Virtuelles Eltern-Element (Prozent vom Viewport)
 *                 Definiert den verfÃ¼gbaren Platz. WÃ¤chst/schrumpft mit dem Viewport.
 *
 *  orbitCenterX/Y â€” Orbit-Zentrum RELATIV zum Container (0-1)
 *  orbitRadius    â€” Orbit-Radius RELATIV zu min(container.w, container.h)
 *  imageRadius    â€” Bild-Radius RELATIV zu min(container.w, container.h)
 *  imageOffsetX/Y â€” Bild-Versatz RELATIV zum Container min-Dimension
 *
 * Ergebnis: Position UND GrÃ¶ÃŸe skalieren mit demselben Container
 *           â†’ immer gleicher Anschnitt, immer gleiche relative Position.
 */
export const IMAGE_CONFIG = {
    desktop: {
        container: { left: 0.22, top: 0.05, width: 1.0, height: 1.0 },
        orbitCenterX: 0.60,   // 55% der Container-Breite
        orbitCenterY: 0.50,   // 50% der Container-HÃ¶he (vertikal mittig)
        orbitRadius:  0.30,   // 30% von min(container.w, container.h)
        imageRadius:  0.40,   // 30% von min(container.w, container.h)
        imageOffsetX: 0.00,   // Bild-Versatz relativ zu cMin
        imageOffsetY: 0.00,   // Bild leicht nach unten relativ zu cMin
    },
    mobile: {
        container: { left: 0.00, top: 0.08, width: 1.0, height: 0.5 },
        orbitCenterX: 0.50,   // Horizontal mittig
        orbitCenterY: 0.50,   // Vertikal mittig im Container
        orbitRadius:  0.35,   // 35% von min(container.w, container.h)
        imageRadius:  0.48,   // 35% von min(container.w, container.h)
        imageOffsetX: 0.00,
        imageOffsetY: 0.00,
    },
};

/** Bildradius relativ zum Viewport â€” Fallback wenn kein Container-Rect verfÃ¼gbar */
export function getImageRadius() {
    return getDevice() === 'mobile' ? 0.30 : 0.22;
}

/** Bildzentrum â€” Fallback wenn kein Container-Rect verfÃ¼gbar */
export function getImageCenter() {
    return getDevice() === 'mobile' ? { x: 0.5, y: 0.25 } : { x: 0.75, y: 0.5 };
}

/** Aspekt-Ratio des Quellbilds (Breite / HÃ¶he) */
export const IMAGE_ASPECT = 877 / 1364;

/** Bildbreite als Faktor des sizePx (Kreisdurchmesser) */
export const IMAGE_WIDTH_FACTOR = 0.75;

// =============================================================================
// PARALLAX
// =============================================================================

export const PARALLAX = {
    strength: 15,       // px Verschiebung bei vollem Tilt/Mouse-Offset
};

// =============================================================================
// DROP-SHADOW â€” Eleganter Gold-Glow statt harter Box-Shadow
// =============================================================================

/**
 * Gibt den CSS filter-String fÃ¼r das Profilbild zurÃ¼ck.
 * Wird sowohl vom CSS-Default als auch vom JS-Blur-Pfad genutzt.
 *
 * Design-Prinzip:
 *   - Weicher, warmer Gold-Schein (brand-Farbe mit niedriger OpazitÃ¤t)
 *   - Mehrere Ebenen mit zunehmendem Radius fÃ¼r natÃ¼rlichen Falloff
 *   - Kein harter schwarzer Schatten â€” alles farbig und diffus
 */
export const IMAGE_SHADOWS = {
    /** CSS drop-shadow Kette fÃ¼r .bgs-profile-front (Ruhezustand, kein Blur) */
    css: [
        'drop-shadow(0 4px 6px rgba(245, 168, 0, 0.20))',
        'drop-shadow(0 8px 8px rgba(245, 168, 0, 0.12))',
        'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.18))',
    ].join(' '),

    /**
     * JS filter-String: Blur + Schatten kombiniert.
     * @param {number} blurPx â€” aktuelle Blur-StÃ¤rke in px
     */
    withBlur(blurPx) {
        return [
            `blur(${blurPx.toFixed(1)}px)`,
            'drop-shadow(0 4px 6px rgba(245, 168, 0, 0.20))',
            'drop-shadow(0 8px 8px rgba(245, 168, 0, 0.12))',
            'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.18))',
        ].join(' ');
    },
};

// =============================================================================
// GLOW RING (hinter dem Bild)
// =============================================================================

const GLOW = {
    /** Extra px um den Ring herum */
    sizeOffset: 40,

    /** Puls-Geschwindigkeit (Multiplikator fÃ¼r performance.now) */
    pulseSpeed: 0.0008,

    /** Puls-Basis und Amplitude: opacity = base + sin(...) * amplitude */
    pulseBase: 0.75,
    pulseAmplitude: 0.15,

    /** CSS background fÃ¼r den Glow-Ring */
    background: `radial-gradient(circle,
        color-mix(in srgb, var(--brand) 15%, transparent) 0%,
        color-mix(in srgb, var(--brand) 6%, transparent) 50%,
        transparent 75%)`,
};

// =============================================================================
// MASK GRADIENTS (Front/Behind Split)
// =============================================================================

/**
 * Berechnet die CSS linear-gradient Masken fÃ¼r Front (Kopf) und Behind (Body).
 * @param {number} splitPct â€” Prozent-Position des Splits
 */
export function getMaskGradients(splitPct) {
    const fadeStart = splitPct - 10;
    const fadeEnd = splitPct + 10;
    return {
        front: `linear-gradient(to bottom, black 0%, black ${fadeStart.toFixed(0)}%, transparent ${fadeEnd.toFixed(0)}%)`,
        behind: `linear-gradient(to bottom, transparent ${(fadeStart - 5).toFixed(0)}%, black ${fadeEnd.toFixed(0)}%, black 70%, transparent 92%)`,
    };
}

// =============================================================================
// LERP RATES
// =============================================================================

export const LERP_RATES = {
    // Symmetrisch zur leaving-Rate \u2192 Bild f\u00e4dt beim Snap-Wrap (Contact\u2192Home)
    // genauso schnell ein, wie es beim Verlassen verschwindet. Ohne diese
    // Symmetrie bleibt nach dem 680 ms Snap noch ein ~500 ms Bild-Lerp,
    // der sich als \u201eVerz\u00f6gerung\u201c anf\u00fchlt.
    inHome:  { opacity: 0.30, scale: 0.18, blur: 0.18 },
    // Phase 1: schÃ¤rferer, sauberer Cut beim Verlassen von Home
    leaving: { opacity: 0.55, scale: 0.40, blur: 0.40 },
};
