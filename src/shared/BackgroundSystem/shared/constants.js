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

/** Anzahl der Tiefenebenen für Orbit/Float-Tokens */
export const ORBIT_LAYERS = 3;

// =============================================================================
// PHASE 1 — GLOBALE TEMPO-DISZIPLIN (ruhig, gleichmäßig, harmonisch)
// =============================================================================

/**
 * Globaler Tempo-Multiplikator.
 * Alle Drift-, Orbit-, Stream- und Connection-Geschwindigkeiten werden mit
 * diesem Faktor multipliziert. < 1 = ruhiger.
 */
export const TEMPO_SCALE = 0.7;

/**
 * Inhalts-Respekt-Maske: Tokens, deren Mittelpunkt < CONTENT_MASK_PADDING_NORM
 * von einer Content-Bounding-Box entfernt liegen, werden in der Opacity gedimmt.
 * Werte normiert auf Canvas (0..1). Faktoren ergeben weichen Falloff.
 */
export const CONTENT_MASK_PADDING_NORM = 0.05;
export const CONTENT_MASK_FADE_NORM = 0.06;
export const CONTENT_MASK_MIN_OPACITY = 0.18;
