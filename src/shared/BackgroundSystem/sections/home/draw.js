/**
 * Home Animation — Draw Functions
 * Orbit-System, Constellation-Linien, Token-Rendering
 */

import {
    DEFAULT_COLORS,
    getThemeColors,
    TAU,
    BREAKPOINTS,
} from '../../shared/core.js';

import { globalTextCache } from '../../shared/rendering.js';
import { RING_SPACING_FACTOR, RING_OFFSET_FACTOR, BREATH_AMOUNT, MAX_DPR } from '../../shared/constants.js';

// =============================================================================
// LOCAL CONSTANTS
// =============================================================================

const FONT_SIZE_FACTOR = 0.55;
const MIN_VISIBLE_OPACITY = 0.05;
const ORBIT_RADIUS_FACTOR = 0.22;
const CONSTELLATION_SKIP = 3;
const LINE_OPACITY_BASE = 0.15;
const GLOW_BLUR_FACTOR = 0.4;
const FORMATION_SHOW_THRESHOLD = 0.3;
const DISSOLVE_HIDE_THRESHOLD = 0.8;

// =============================================================================
// OFFSCREEN CANVAS — Orbit-Elemente werden hier gezeichnet, dann per
// destination-in Gradient ECHT transparent gemacht (kein Overlay).
// =============================================================================

let _offCanvas = null;
let _offCtx = null;

function getOffCtx(w, h) {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const pw = Math.round(w * dpr);
    const ph = Math.round(h * dpr);
    if (!_offCanvas) {
        _offCanvas = document.createElement('canvas');
        _offCtx = _offCanvas.getContext('2d');
    }
    if (_offCanvas.width !== pw || _offCanvas.height !== ph) {
        _offCanvas.width = pw;
        _offCanvas.height = ph;
    } else {
        _offCtx.clearRect(0, 0, pw, ph);
    }
    _offCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { offCtx: _offCtx, offCanvas: _offCanvas };
}

/** Echte Transparenz: destination-in maskiert die gezeichneten Orbit-Elemente
 *  Nur innerhalb der Orbit-Bounding-Box (nicht den ganzen Canvas) */
function applyEdgeFade(offCtx, cx, cy, radius, w, h, isMobile) {
    offCtx.save();

    // Clip auf den Orbit-Bereich — außerhalb wird nichts geändert
    const pad = radius * 2.2;
    if (isMobile) {
        offCtx.beginPath();
        offCtx.rect(cx - pad, cy - pad * 0.5, pad * 2, pad * 1.8);
    } else {
        offCtx.beginPath();
        offCtx.rect(cx - pad, cy - pad, pad * 2.5, pad * 2);
    }
    offCtx.clip();

    offCtx.globalCompositeOperation = 'destination-in';

    let grad;
    if (isMobile) {
        // Unterkante → Mitte ausfaden
        grad = offCtx.createLinearGradient(0, cy + radius * 1.4, 0, cy - radius * 0.2);
    } else {
        // Linke Seite → Orbit-Center ausfaden
        grad = offCtx.createLinearGradient(cx - radius * 1.6, 0, cx - radius * 0.1, 0);
    }
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.4, 'rgba(0,0,0,0.3)');
    grad.addColorStop(0.8, 'rgba(0,0,0,0.8)');
    grad.addColorStop(1, 'rgba(0,0,0,1)');

    offCtx.fillStyle = grad;
    offCtx.fillRect(cx - pad, cy - pad, pad * 2.5, pad * 2);
    offCtx.restore();
}

// =============================================================================
// ORBIT SYSTEM (Ringe + Portal-Glow)
// =============================================================================

function drawOrbitSystem(ctx, cx, cy, radius, opacity, layerOpacities) {
    if (opacity <= 0.01) return;
    const colors = getThemeColors();
    const time = performance.now() * 0.001;

    // Proportionale Abstände — skalieren mit dem Orbit-Radius
    const ringBase = radius * RING_OFFSET_FACTOR;
    const ringSpacing = radius * RING_SPACING_FACTOR;

    // Pro-Ring-Farben aus Theme (Gruppe 0 = brand, Gruppe 1 = hi, Gruppe 2 = accent)
    const ringColors = [
        colors.primary  || DEFAULT_COLORS.pri,   // Ring 0 — inner  (Gold)
        colors.primary2 || DEFAULT_COLORS.pri2,  // Ring 1 — mid    (Bernstein)
        colors.accent   || DEFAULT_COLORS.acc,   // Ring 2 — outer  (Navy)
    ];

    ctx.save();
    ctx.globalAlpha = opacity;

    // === Innerer Ring — dunkle Glasfläche + Brand-Rim ===
    const innerR = radius + ringBase;
    ctx.save();
    ctx.globalAlpha = opacity;

    // 1. Glasbase — theme-sensitiv: warmes Milchglas im Light Mode, Dunkelglas im Dark Mode
    const isLight = colors.mode === 'light';
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, TAU);
    ctx.fillStyle = isLight
        ? 'rgba(245, 242, 238, 0.72)'   // warmes Milchglas im Light Mode
        : 'rgba(6, 5, 3, 0.60)';        // dunkles Glas im Dark Mode
    ctx.fill();

    // 2. Brand-Rim — breiter Schein am Rand (letztes 35%)
    const rimGrad = ctx.createRadialGradient(cx, cy, innerR * 0.65, cx, cy, innerR);
    rimGrad.addColorStop(0, 'rgba(255, 183, 0, 0)');
    rimGrad.addColorStop(1, 'rgba(255, 183, 0, 0.2)');
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, TAU);
    ctx.fillStyle = rimGrad;
    ctx.fill();

    ctx.restore();

    // Orbit-Ringe — jeder Ring eigene Farbe + Opacity gekoppelt an seine Gruppe
    ctx.lineWidth = 1;
    for (let layer = 0; layer < 3; layer++) {
        const layerAlpha = layerOpacities ? layerOpacities[layer] : opacity;
        if (layerAlpha <= 0.01) continue;
        ctx.strokeStyle = ringColors[layer];
        ctx.globalAlpha = layerAlpha * 0.35;
        ctx.beginPath();
        ctx.arc(cx, cy, radius + layer * ringSpacing + ringBase, 0, TAU);
        ctx.stroke();
    }

    // Rotierende Daten-Segmente — pro Ring in seiner eigenen Farbe
    ctx.lineWidth = 2;

    // Inner-Ring-Segment (Layer 0)
    ctx.strokeStyle = ringColors[0];
    ctx.globalAlpha = (layerOpacities ? layerOpacities[0] : opacity) * 0.4;
    ctx.beginPath();
    ctx.arc(cx, cy, radius + ringBase, time, time + 1.5);
    ctx.stroke();

    // Outer-Ring-Segment (Layer 2)
    ctx.strokeStyle = ringColors[2];
    ctx.globalAlpha = (layerOpacities ? layerOpacities[2] : opacity) * 0.2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 2 * ringSpacing + ringBase, -time * 0.5, -time * 0.5 + 2);
    ctx.stroke();

    ctx.restore();
}

// =============================================================================
// CONSTELLATION LINES
// =============================================================================

function drawConstellationLines(ctx, tokens, w, h, formation, dissolve) {
    const lineOpacity = LINE_OPACITY_BASE * formation * (1 - dissolve);
    if (lineOpacity < 0.01) return;

    const colors = getThemeColors();
    ctx.save();
    ctx.strokeStyle = colors.primary || DEFAULT_COLORS.pri;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = lineOpacity;

    for (let i = 0; i < tokens.length; i++) {
        const next = tokens[(i + CONSTELLATION_SKIP) % tokens.length];
        if (tokens[i].orbitLayer === next.orbitLayer && tokens[i].spawned && next.spawned) {
            ctx.beginPath();
            ctx.moveTo(tokens[i].renderX * w, tokens[i].renderY * h);
            ctx.lineTo(next.renderX * w, next.renderY * h);
            ctx.stroke();
        }
    }
    ctx.restore();
}

// =============================================================================
// DRAW HOME TOKENS (Hauptfunktion)
// =============================================================================

export function drawHomeTokens(ctx, tokens = [], options = {}) {
    if (!ctx || tokens.length === 0) return;

    const w = options.w || window.innerWidth;
    const h = options.h || window.innerHeight;
    const isMobile = w < BREAKPOINTS.DESKTOP;

    // Pixel-basierte Werte direkt verwenden
    const cx = options.centerPx ? options.centerPx.x : w * 0.5;
    const cy = options.centerPx ? options.centerPx.y : h * 0.5;
    const radiusPx = options.radiusPx !== undefined ? options.radiusPx : Math.min(w, h) * ORBIT_RADIUS_FACTOR;
    const tokenScale = options.tokenScale || (isMobile ? 0.7 : 1.0);

    // Durchschnittswerte (gesamt + pro Layer)
    let avgFormation = 0, avgDissolve = 0;
    const layerSum = [0, 0, 0];
    const layerCount = [0, 0, 0];
    tokens.forEach(t => {
        avgFormation += t.formationProgress;
        avgDissolve += t.dissolveProgress;
        const l = t.orbitLayer ?? 0;
        layerSum[l] += t.formationProgress * (1 - t.dissolveProgress);
        layerCount[l] += 1;
    });
    avgFormation /= tokens.length;
    avgDissolve /= tokens.length;

    const orbitOpacity = avgFormation * (1 - avgDissolve);
    const layerOpacities = layerSum.map((s, i) => layerCount[i] ? s / layerCount[i] : 0);

    // --- Offscreen-Canvas: Orbit-Elemente zeichnen, dann echt transparent machen ---
    const { offCtx, offCanvas } = getOffCtx(w, h);
    offCtx.globalCompositeOperation = 'lighter';
    offCtx.imageSmoothingEnabled = true;

    // 1. Orbit-System (Ringe, Portal-Glow) — Ring-Opacity pro Gruppe
    drawOrbitSystem(offCtx, cx, cy, radiusPx, orbitOpacity, layerOpacities);

    // 2. Constellation-Linien
    if (avgFormation > FORMATION_SHOW_THRESHOLD && avgDissolve < DISSOLVE_HIDE_THRESHOLD) {
        drawConstellationLines(offCtx, tokens, w, h, avgFormation, avgDissolve);
    }

    // 3. Tokens
    tokens.forEach((token) => {
        if (token.opacity < MIN_VISIBLE_OPACITY) return;

        const breathScale = 1 + Math.sin(token.breathPhase) * BREATH_AMOUNT;
        const drawScale = token.depthScale * breathScale * tokenScale;

        const fontSize = Math.floor(token.radius * FONT_SIZE_FACTOR);
        const cached = globalTextCache.get(token.label, fontSize, token.baseColor || DEFAULT_COLORS.pri);

        offCtx.save();
        offCtx.translate(token.renderX * w, token.renderY * h);
        offCtx.rotate(token.rotation);
        offCtx.globalAlpha = token.opacity;
        offCtx.scale(drawScale, drawScale);

        if (!isMobile && avgFormation > 0.5 && avgDissolve < 0.5) {
            offCtx.shadowColor = token.glowColor || DEFAULT_COLORS.acc;
            offCtx.shadowBlur = token.radius * GLOW_BLUR_FACTOR;
        }

        offCtx.drawImage(cached, -cached.width / 2, -cached.height / 2);
        if (!isMobile) offCtx.shadowBlur = 0;
        offCtx.restore();
    });

    // 4. Echte Transparenz — Orbit-Elemente selbst werden an den Rändern transparent
    applyEdgeFade(offCtx, cx, cy, radiusPx, w, h, isMobile);

    // 5. Offscreen → Haupt-Canvas (1:1 physische Pixel, additive Blending bleibt erhalten)
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(offCanvas, 0, 0);
    ctx.restore();
}
