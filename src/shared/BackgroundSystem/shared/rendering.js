/**
 * BackgroundSystem — Rendering Utilities
 * TextCache, 3D Projection, Token Normalization
 */

import { DEFAULT_COLORS, EASE_OUT_CUBIC } from './core.js';

// =============================================================================
// TEXT CACHE — Rendert Texte einmalig auf Offscreen-Canvas (Performance)
// =============================================================================

export class TextCache {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Holt gecachtes Canvas für einen Text oder erstellt es neu.
     * @param {string} label - Der Text
     * @param {number} size  - Schriftgröße in px
     * @param {string} color - CSS Farbe
     * @param {string} font  - Font-Family
     */
    get(label, size, color, font = '"JetBrains Mono", monospace') {
        const key = `${label}-${size}-${color}`;
        if (this.cache.has(key)) return this.cache.get(key);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        ctx.font = `600 ${Math.floor(size)}px ${font}`;
        const metrics = ctx.measureText(label);
        canvas.width = Math.ceil(metrics.width + size * 2);
        canvas.height = Math.ceil(size * 2.5);

        // Context muss nach canvas.width/height-Änderung neu gesetzt werden
        ctx.font = `600 ${Math.floor(size)}px ${font}`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, canvas.width / 2, canvas.height / 2);

        this.cache.set(key, canvas);
        return canvas;
    }

    clear() {
        this.cache.clear();
    }
}

/** Singleton für globale Nutzung */
export const globalTextCache = new TextCache();

// =============================================================================
// 3D PROJECTION
// =============================================================================

/**
 * Projiziert normalisierte (0-1) Koordinaten mit Z-Tiefe auf 2D-Pixel.
 * @param {number} x   - Normalisierte X-Position (0-1)
 * @param {number} y   - Normalisierte Y-Position (0-1)
 * @param {number} z   - Tiefe (0 = Oberfläche, positiv = weiter weg)
 * @param {number} w   - Canvas-Breite in CSS-Pixeln
 * @param {number} h   - Canvas-Höhe in CSS-Pixeln
 * @param {number} fov - Field of View (default 600)
 */
export function project3D(x, y, z, w, h, fov = 600) {
    const scale = fov / (fov + z);
    return {
        x: (x - 0.5) * w * scale + w / 2,
        y: (y - 0.5) * h * scale + h / 2,
        scale,
    };
}

/**
 * Fog-Effekt: Opacity fällt mit zunehmender Z-Tiefe.
 */
export function getDepthOpacity(z, maxDepth = 1000) {
    return Math.max(0, Math.min(1, 1 - z / maxDepth));
}

// =============================================================================
// TOKEN NORMALIZATION — Cross-Section Transitions
// =============================================================================

/**
 * Normalisiert verschiedene Token-Strukturen auf gemeinsame Properties.
 */
export function normalizeTokens(tokens = []) {
    if (!Array.isArray(tokens)) {
        if (tokens.points) return normalizeTokens(tokens.points);
        if (tokens.nodes) return normalizeTokens(tokens.nodes);
        return [];
    }
    return tokens.map((t, i) => ({
        x: t.renderX ?? t.x ?? t.position?.x ?? 0.5,
        y: t.renderY ?? t.y ?? t.position?.y ?? 0.5,
        z: t.z ?? 0,
        size: t.radius ?? t.size ?? t.baseRadius ?? 32,
        color: t.baseColor ?? t.color ?? DEFAULT_COLORS.pri,
        glowColor: t.glowColor ?? t.color ?? DEFAULT_COLORS.acc,
        label: t.label ?? '',
        opacity: t.opacity ?? 1,
        id: t.id ?? `token-${i}`,
        originalIndex: i,
    }));
}
