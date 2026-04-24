/**
 * BackgroundSystem — Shared Animation Constants
 * Zentrale Stelle für alle Magic Numbers.
 */

/** Abstand zwischen Orbit-Ringen als Faktor des Orbit-Radius */
export const RING_SPACING_FACTOR = 0.16;

/** Basis-Offset des innersten Rings als Faktor des Orbit-Radius */
export const RING_OFFSET_FACTOR = 0.08;

/** Sekunden bis ein einzelnes Token bei Formation zu 100% erreicht */
export const TOKEN_FORMATION_DURATION = 0.8;

/** Per-Layer-Multiplikator für depthScale (1 − layer × DEPTH_SCALE_STEP) */
export const DEPTH_SCALE_STEP = 0.10;

/** depthScale-Step für schwebende About-Tokens (stärkere Tiefenstaffelung) */
export const DEPTH_SCALE_STEP_FLOAT = 0.15;

/** Globale Stärke des Breath-Effekts (sin-Amplitude) */
export const BREATH_AMOUNT = 0.08;

/** Maximale Device-Pixel-Ratio (Performance-Begrenzung für Retina/HiDPI) */
export const MAX_DPR = 1.5;

/** Default Field-of-View für 3D-Projektionen */
export const FOV = 600;

/** Goldener Winkel (normiert auf TAU) — gleichmäßige Spiralverteilung */
export const GOLDEN_ANGLE_NORM = 3 - Math.sqrt(5);

/** Anzahl der Tiefenebenen für Orbit/Float-Tokens */
export const ORBIT_LAYERS = 3;
