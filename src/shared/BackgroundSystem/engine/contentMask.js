/**
 * Content-Mask — Inhalts-Respekt für das BackgroundSystem.
 *
 * Sammelt periodisch die Bounding-Boxen aller "respektpflichtigen" Content-
 * Elemente (Headlines, Karten, Formulare, Buttons) und stellt eine
 * `contentMaskFactor(nx, ny)` Funktion bereit, mit der jeder Section-Drawer
 * die Token-Opacity nahe an Inhalten reduziert.
 *
 * Performance: Snapshot wird alle ~180 ms aktualisiert (nicht jeden Frame).
 * Bei ~50 Tokens × ~10 Boxen ≈ 500 Distance-Checks/Frame — vernachlässigbar.
 */

import {
    CONTENT_MASK_PADDING_NORM,
    CONTENT_MASK_FADE_NORM,
    CONTENT_MASK_MIN_OPACITY,
} from '../shared/constants.js';

const SNAPSHOT_INTERVAL_MS = 180;

/**
 * Selektor: Was soll das BGS respektieren?
 * - `[data-bgs-respect]` → expliziter Opt-In für beliebige Elemente
 * - Headlines, Glass-Cards, Buttons, Formulare → Default
 */
const SELECTOR = [
    '[data-bgs-respect]',
    'main h1', 'main h2', 'main h3',
    'main .glass-card',
    'main form',
    'main .btn',
    'main .hero-title', 'main .hero-subtitle', 'main .hero-cta',
].join(', ');

let cachedBoxes = [];
let lastSnapshotMs = -Infinity;

/**
 * Aktualisiert die Bounding-Box-Sammlung wenn der Snapshot älter als
 * SNAPSHOT_INTERVAL_MS ist. Aufruf einmal pro Frame im Render-Loop.
 *
 * @param {number} nowMs `performance.now()` aus dem Render-Loop.
 */
export function refreshContentMask(nowMs) {
    if (typeof document === 'undefined') return;
    if (nowMs - lastSnapshotMs < SNAPSHOT_INTERVAL_MS) return;
    lastSnapshotMs = nowMs;

    const w = window.innerWidth;
    const h = window.innerHeight;
    if (!w || !h) {
        cachedBoxes = [];
        return;
    }

    let elements;
    try {
        elements = document.querySelectorAll(SELECTOR);
    } catch {
        cachedBoxes = [];
        return;
    }

    const boxes = [];
    elements.forEach((el) => {
        const r = el.getBoundingClientRect();
        // Außerhalb Viewport → ignorieren
        if (r.bottom < 0 || r.top > h || r.right < 0 || r.left > w) return;
        // Zu klein → ignorieren (schließt versteckte / ausgefadete Elemente aus)
        if (r.width < 12 || r.height < 12) return;

        const left = Math.max(0, r.left) / w;
        const right = Math.min(w, r.right) / w;
        const top = Math.max(0, r.top) / h;
        const bottom = Math.min(h, r.bottom) / h;

        boxes.push({
            x1: left,
            y1: top,
            x2: right,
            y2: bottom,
        });
    });

    cachedBoxes = boxes;
}

/**
 * Liefert einen Opacity-Faktor in [CONTENT_MASK_MIN_OPACITY .. 1].
 * 1.0 = außerhalb aller Boxen + Falloff-Zone (volle Sichtbarkeit).
 * MIN  = direkt im Content (Token soll fast unsichtbar sein).
 *
 * Glatter Übergang über CONTENT_MASK_FADE_NORM (smoothstep).
 *
 * @param {number} nx Normierte X-Koordinate (0..1)
 * @param {number} ny Normierte Y-Koordinate (0..1)
 * @returns {number} Opacity-Multiplikator
 */
export function contentMaskFactor(nx, ny) {
    if (cachedBoxes.length === 0) return 1;

    let nearestDist = Infinity;
    let insideAny = false;

    for (let i = 0; i < cachedBoxes.length; i++) {
        const b = cachedBoxes[i];
        const inside = nx >= b.x1 && nx <= b.x2 && ny >= b.y1 && ny <= b.y2;
        if (inside) {
            insideAny = true;
            break;
        }
        const dx = nx < b.x1 ? b.x1 - nx : (nx > b.x2 ? nx - b.x2 : 0);
        const dy = ny < b.y1 ? b.y1 - ny : (ny > b.y2 ? ny - b.y2 : 0);
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < nearestDist) nearestDist = d;
    }

    if (insideAny) return CONTENT_MASK_MIN_OPACITY;

    const padding = CONTENT_MASK_PADDING_NORM;
    const fade = CONTENT_MASK_FADE_NORM;

    if (nearestDist <= padding) return CONTENT_MASK_MIN_OPACITY;
    if (nearestDist >= padding + fade) return 1;

    // smoothstep
    const t = (nearestDist - padding) / fade;
    const s = t * t * (3 - 2 * t);
    return CONTENT_MASK_MIN_OPACITY + (1 - CONTENT_MASK_MIN_OPACITY) * s;
}


