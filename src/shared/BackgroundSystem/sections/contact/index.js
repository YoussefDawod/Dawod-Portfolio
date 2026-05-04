/**
 * Contact Section — Public API
 *
 * Liefert das Linien-basierte Token-System (3 Bahnen, Endlosloop). Wird durch
 * den BGS-Tausch im PROJECTS-Bereich gerendert (siehe useBGSAnimation.js).
 * Die Bahn-Geometrie liegt in `sections/projects/lineGeometry.js`.
 */

export { createContactNodes } from './tokens.js';
export { updateContactNodes } from './update.js';
export { drawContactNodes } from './draw.js';
