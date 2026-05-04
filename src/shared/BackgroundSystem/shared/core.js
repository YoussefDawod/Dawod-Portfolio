/**
 * BackgroundSystem â€” Core Constants, Colors & Responsive Utilities
 */

export const TAU = Math.PI * 2;

// =============================================================================
// EASING FUNCTIONS
// =============================================================================

export const EASE_IN_OUT_CUBIC = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const EASE_OUT_CUBIC = (t) => 1 - Math.pow(1 - t, 3);

// =============================================================================
// DEFAULT COLORS (Fallbacks wenn CSS-Custom-Properties fehlen)
// =============================================================================

export const DEFAULT_COLORS = {
    pri: "#F5A800",   // Brand (Goldgelb)
    pri2: "#E8720C",  // Highlight (Bernstein)
    c3:  "#FFC74F",   // BGS-Farbe 3 (Champagne) â€” warme dritte Token-Farbe
    acc: "#1A2233",   // Accent (Navy)
    acc2: "#E8720C",  // Accent 2 (Bernstein)
    neu: "#1C1A14",   // Neutral (Tiefschwarz)
    neu2: "#2C2A1E",  // Neutral 2 (Dunkelgrau)
    war: "#f39c12",   // Warning (Orange)
    sig: "#2ecc71",   // Success (Green)
    err: "#e74c3c",   // Error (Red)
    txt: "#e7e7e9",   // Text (Light)
    mut: "#b7b9bf",   // Muted (Greyish)
    bor: "rgba(255,255,255,0.1)",
};

// =============================================================================
// ANIMATION CONFIG
// =============================================================================

export const ANIMATION_CONFIG = {
    // 1.47 â‰ˆ 0.68 s pro Section-Ãœbergang. Synchron zur Snap-Dauer.
    TRANSITION_SPEED: 1.47,
    FADE_SPEED: 2.0,
    SCROLL_PROGRESS_MULTIPLIER: 2.5,
    MOUSE_PARALLAX_STRENGTH: 0.03,
    MOUSE_INTERACTION_RADIUS: 0.25,
    MAX_DELTA_TIME: 0.05,
    MIN_DELTA_TIME: 0.001,
};

export const BREAKPOINTS = { DESKTOP: 1025, WIDE: 1200 };

// =============================================================================
// THEME COLORS â€” Liest CSS Custom Properties, cached Ergebnis
// =============================================================================

let cachedThemeColors = null;
let cachedThemeMode = null;

/** Aktueller Theme-Modus: 'light' | 'dark'. */
function getThemeMode() {
    if (typeof document === 'undefined') return 'dark';
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr === 'light' || attr === 'dark') return attr;
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches) {
        return 'light';
    }
    return 'dark';
}

/**
 * Globaler Alpha-Multiplikator fÃ¼rs BGS.
 * Light-Mode: gedÃ¤mpft (0.55) damit BGS auf hellem Grund nicht knallt.
 * Dark-Mode: voll (1.0).
 */
export function getThemeBGSAlpha() {
    return getThemeMode() === 'light' ? 0.55 : 1.0;
}

/** Cache invalidieren â€” wird vom ThemeProvider beim Theme-Wechsel aufgerufen. */
function clearThemeColorCache() {
    cachedThemeColors = null;
    cachedThemeMode = null;
}

if (typeof window !== 'undefined') {
    window.addEventListener('yd-theme-change', clearThemeColorCache);
}

export function getThemeColors(forceRefresh = false) {
    const mode = getThemeMode();
    if (cachedThemeColors && !forceRefresh && cachedThemeMode === mode) return cachedThemeColors;
    if (typeof window === 'undefined') return DEFAULT_COLORS;

    try {
        const root = getComputedStyle(document.documentElement);
        const get = (prop, fallback) => root.getPropertyValue(prop).trim() || fallback;

        cachedThemeColors = {
            primary:  get('--brand', DEFAULT_COLORS.pri),
            primary2: get('--hi', DEFAULT_COLORS.pri2),
            c3:       get('--bgs-c3', DEFAULT_COLORS.c3),
            accent:   get('--accent', DEFAULT_COLORS.acc),
            accent2:  get('--hi', DEFAULT_COLORS.acc2),
            neutral:  get('--neu', DEFAULT_COLORS.neu),
            neutral2: get('--neu2', DEFAULT_COLORS.neu2),
            warm:     get('--warn', DEFAULT_COLORS.war),
            success:  get('--ok', DEFAULT_COLORS.sig),
            error:    get('--err', DEFAULT_COLORS.err),
            text:     get('--txt', DEFAULT_COLORS.txt),
            muted:    get('--txt-soft', DEFAULT_COLORS.mut),
            border:   get('--brd', DEFAULT_COLORS.bor),
            mode,
            // Legacy / Short Aliases
            pri:  get('--brand', DEFAULT_COLORS.pri),
            pri2: get('--hi', DEFAULT_COLORS.pri2),
            acc:  get('--accent', DEFAULT_COLORS.acc),
            acc2: get('--hi', DEFAULT_COLORS.acc2),
            war:  get('--warn', DEFAULT_COLORS.war),
            sub:  get('--hi', DEFAULT_COLORS.pri2),
            sig:  get('--ok', DEFAULT_COLORS.sig),
            txt:  get('--txt', DEFAULT_COLORS.txt),
            mut:  get('--txt-soft', DEFAULT_COLORS.mut),
            bor:  get('--brd', DEFAULT_COLORS.bor),
        };
        cachedThemeMode = mode;
        return cachedThemeColors;
    } catch {
        return DEFAULT_COLORS;
    }
}

// =============================================================================
// COLOR KEY RESOLUTION (unterstÃ¼tzt alte + neue Keys)
// =============================================================================

const COLOR_KEY_MAP = {
    pri: 'primary', pri2: 'primary2', acc: 'accent', acc2: 'accent2',
    war: 'warm', sub: 'primary2', sig: 'success', err: 'error',
    txt: 'text', mut: 'muted', bor: 'border',
};

export function getColor(colors, key, fallback = DEFAULT_COLORS.pri) {
    if (colors[key]) return colors[key];
    const mapped = COLOR_KEY_MAP[key];
    if (mapped && colors[mapped]) return colors[mapped];
    const reverse = Object.keys(COLOR_KEY_MAP).find(k => COLOR_KEY_MAP[k] === key);
    if (reverse && colors[reverse]) return colors[reverse];
    return fallback;
}

// =============================================================================
// PER-TOKEN COLOR DISTRIBUTION
// =============================================================================
//
// Drei Farben â€” pri (Brand), pri2 (Hi/Bernstein), c3 (Champagne) â€” werden so
// auf die Tokens verteilt, dass jede Orbit-/Linien-Gruppe alle drei Farben
// in gleicher Anzahl bekommt (statt einer Farbe pro Gruppe).
//
// Token i: group = i % 3 (Ring/Linie), indexInGroup = floor(i / 3).
// Hue-Key  = TOKEN_COLOR_KEYS[indexInGroup % 3]  â†’ rotiert *innerhalb* der Gruppe.

const TOKEN_COLOR_KEYS = ['pri', 'pri2', 'c3'];

export function getTokenColorKey(index) {
    const indexInGroup = Math.floor(index / 3);
    return TOKEN_COLOR_KEYS[indexInGroup % TOKEN_COLOR_KEYS.length];
}

// =============================================================================
// RESPONSIVE HELPERS
// =============================================================================

function getDeviceType() {
    if (typeof window === 'undefined') return 'desktop';
    return window.innerWidth < BREAKPOINTS.DESKTOP ? 'mobile' : 'desktop';
}

export function getResponsiveTokenCount() {
    return getDeviceType() === 'mobile' ? 30 : 45;
}

export function getResponsiveScale() {
    return getDeviceType() === 'mobile' ? 0.75 : 1.0;
}

export function getResponsiveCenter() {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1024;
    return w < BREAKPOINTS.DESKTOP ? { x: 0.5, y: 0.25 } : { x: 0.75, y: 0.5 };
}

export function getResponsiveCircleTokenScale() {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1024;
    return w < BREAKPOINTS.DESKTOP ? 0.7 : 1.0;
}

// =============================================================================
// MATH HELPERS
// =============================================================================

export function clampNormalized(value, margin = 0.05) {
    return Math.max(margin, Math.min(1 - margin, value));
}

export function randomInRange(min, max) {
    return min + Math.random() * (max - min);
}
