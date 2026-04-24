/**
 * Home Section — Image Configuration & Styling
 * =============================================
 * Zentrale Datei für ALLES was das Profilbild betrifft:
 * - Viewport/Responsive Werte (Größe, Position)
 * - Shadow & Glow Konfiguration
 * - Filter (Blur, Drop-Shadow)
 * - Parallax-Stärke
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
 * Zentrale Größen-Konfiguration für Orbit und Profilbild.
 *
 * Architektur: Virtueller Container → Kind-Elemente mit Prozent.
 *
 *  container    — Virtuelles Eltern-Element (Prozent vom Viewport)
 *                 Definiert den verfügbaren Platz. Wächst/schrumpft mit dem Viewport.
 *
 *  orbitCenterX/Y — Orbit-Zentrum RELATIV zum Container (0-1)
 *  orbitRadius    — Orbit-Radius RELATIV zu min(container.w, container.h)
 *  imageRadius    — Bild-Radius RELATIV zu min(container.w, container.h)
 *  imageOffsetX/Y — Bild-Versatz RELATIV zum Container min-Dimension
 *
 * Ergebnis: Position UND Größe skalieren mit demselben Container
 *           → immer gleicher Anschnitt, immer gleiche relative Position.
 */
export const IMAGE_CONFIG = {
    desktop: {
        container: { left: 0.22, top: 0, width: 1.0, height: 1.0 },
        orbitCenterX: 0.55,   // 55% der Container-Breite
        orbitCenterY: 0.50,   // 50% der Container-Höhe (vertikal mittig)
        orbitRadius:  0.34,   // 30% von min(container.w, container.h)
        imageRadius:  0.34,   // 30% von min(container.w, container.h)
        imageOffsetX: 0.00,   // Bild-Versatz relativ zu cMin
        imageOffsetY: 0.03,   // Bild leicht nach unten relativ zu cMin
    },
    mobile: {
        container: { left: 0.00, top: 0.01, width: 1.0, height: 0.5 },
        orbitCenterX: 0.50,   // Horizontal mittig
        orbitCenterY: 0.50,   // Vertikal mittig im Container
        orbitRadius:  0.35,   // 35% von min(container.w, container.h)
        imageRadius:  0.35,   // 35% von min(container.w, container.h)
        imageOffsetX: 0.00,
        imageOffsetY: -0.02,
    },
};

/** Bildradius relativ zum Viewport — Fallback wenn kein Container-Rect verfügbar */
export function getImageRadius() {
    return getDevice() === 'mobile' ? 0.30 : 0.22;
}

/** Bildzentrum — Fallback wenn kein Container-Rect verfügbar */
export function getImageCenter() {
    return getDevice() === 'mobile' ? { x: 0.5, y: 0.25 } : { x: 0.75, y: 0.5 };
}

/** Aspekt-Ratio des Quellbilds (Breite / Höhe) */
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
// DROP-SHADOW — Eleganter Gold-Glow statt harter Box-Shadow
// =============================================================================

/**
 * Gibt den CSS filter-String für das Profilbild zurück.
 * Wird sowohl vom CSS-Default als auch vom JS-Blur-Pfad genutzt.
 *
 * Design-Prinzip:
 *   - Weicher, warmer Gold-Schein (brand-Farbe mit niedriger Opazität)
 *   - Mehrere Ebenen mit zunehmendem Radius für natürlichen Falloff
 *   - Kein harter schwarzer Schatten — alles farbig und diffus
 */
export const IMAGE_SHADOWS = {
    /** CSS drop-shadow Kette für .bgs-profile-front (Ruhezustand, kein Blur) */
    css: [
        'drop-shadow(0 4px 6px rgba(245, 168, 0, 0.20))',
        'drop-shadow(0 8px 8px rgba(245, 168, 0, 0.12))',
        'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.18))',
    ].join(' '),

    /**
     * JS filter-String: Blur + Schatten kombiniert.
     * @param {number} blurPx — aktuelle Blur-Stärke in px
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

export const GLOW = {
    /** Extra px um den Ring herum */
    sizeOffset: 40,

    /** Puls-Geschwindigkeit (Multiplikator für performance.now) */
    pulseSpeed: 0.0008,

    /** Puls-Basis und Amplitude: opacity = base + sin(...) * amplitude */
    pulseBase: 0.75,
    pulseAmplitude: 0.15,

    /** CSS background für den Glow-Ring */
    background: `radial-gradient(circle,
        color-mix(in srgb, var(--brand) 15%, transparent) 0%,
        color-mix(in srgb, var(--brand) 6%, transparent) 50%,
        transparent 75%)`,
};

// =============================================================================
// MASK GRADIENTS (Front/Behind Split)
// =============================================================================

/**
 * Berechnet die CSS linear-gradient Masken für Front (Kopf) und Behind (Body).
 * @param {number} splitPct — Prozent-Position des Splits
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
    inHome:  { opacity: 0.10, scale: 0.10, blur: 0.10 },
    leaving: { opacity: 0.35, scale: 0.35, blur: 0.35 },
};
