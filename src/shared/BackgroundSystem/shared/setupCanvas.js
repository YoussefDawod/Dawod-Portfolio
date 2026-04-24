import { MAX_DPR } from './constants.js';

export function setupCanvas(canvas) {
  // Ohne Canvas-Referenz können wir nicht weiterarbeiten.
  if (!canvas) {
    throw new Error("setupCanvas: canvas-Referenz fehlt");
  }

  // 2D-Kontext ist unser Stift, ohne den passiert nichts.
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("setupCanvas: 2D-Kontext konnte nicht erstellt werden");
  }

  const resize = () => {
    // CSS-Größe des Fensters – damit orientieren wir uns an Layout-Pixeln.
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    // devicePixelRatio > 1 bedeutet Retina/HiDPI. Wir deckeln das für Performance.
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

    // Canvas bekommt die physische Auflösung (CSS * dpr), damit alles scharf bleibt.
    canvas.width = windowWidth * dpr;
    canvas.height = windowHeight * dpr;
    // canvas.style.width/height entfernen wir, da CSS (width: 100%) das übernimmt.
    // Das verhindert Overflow-Probleme auf Mobile.

    // Transform sorgt dafür, dass wir weiterhin in CSS-Pixeln zeichnen dürfen.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true; // schönes Anti-Aliasing
    ctx.globalCompositeOperation = "lighter"; // Additive Blending für Glow-Effekte

    // Wir löschen die komplette Fläche in CSS-Pixeln; Transform kümmert sich um die Skalierung.
    ctx.clearRect(0, 0, windowWidth, windowHeight);
  };

  resize(); // direkt initialisieren

  return { ctx, resize }; // Kontext + Resize-Handler für spätere Hooks
}