/**
 * Projects Section — Linien-Geometrie
 * Geteilt zwischen contact/tokens.js und contact/update.js.
 *
 * Die Linien definieren die Token-Bahnen, die im Projects-Bereich sichtbar
 * sind (BGS-Tausch: Projects rendert das Contact-Linien-System).
 * Tokens loopen nahtlos, der Wrap am Ende wird durch FADE_ZONE weich überblendet.
 */

import { BREAKPOINTS } from '../../shared/core.js';

// Pro Gruppe: { axis, fixed, start, end }
//   axis  = die Achse, auf der das Token wandert
//   fixed = Position auf der Querachse (0..1 normiert)
//   start/end = volle Reichweite (0..1)
//
// Layout (User-Vorgabe):
//   G0 → vertikal links bei x=0.15, oben → unten
//   G1 → horizontal unten bei y=0.75, links → rechts
//   G2 → vertikal direkt neben G0 (x=0.18), unten → oben (Gegenrichtung)
const LINE_CONFIG = [
    { axis: 'y', fixed: 0.40, start: 0.0, end: 1.0 },
    { axis: 'x', fixed: 0.7425, start: 0.0, end: 1.0 },
    { axis: 'y', fixed: 0.36, start: 1.0, end: 0.0 },
];

const LINE_CONFIG_MOBILE = [
    { axis: 'y', fixed: 0.03, start: 0.0, end: 1.0 },
    { axis: 'x', fixed: 0.11, start: 0.0, end: 1.0 },
    { axis: 'y', fixed: 0.97, start: 1.0, end: 0.0 },
];

// Weiche Ein-/Ausblendzone an den Linien-Enden (für nahtlosen Wrap)
const FADE_ZONE = 0.04;

function isMobile() {
    return typeof window !== 'undefined' && window.innerWidth < BREAKPOINTS.DESKTOP;
}

export function getLineConfig(group) {
    const cfg = isMobile() ? LINE_CONFIG_MOBILE : LINE_CONFIG;
    return cfg[group] ?? cfg[0];
}

export function progressToPosition(progress, group) {
    const cfg = getLineConfig(group);
    const range = cfg.end - cfg.start;
    const along = cfg.start + range * progress;
    if (cfg.axis === 'y') return { x: cfg.fixed, y: along };
    return { x: along, y: cfg.fixed };
}

export function progressOpacity(progress) {
    if (progress < FADE_ZONE) return progress / FADE_ZONE;
    if (progress > 1 - FADE_ZONE) return (1 - progress) / FADE_ZONE;
    return 1;
}
