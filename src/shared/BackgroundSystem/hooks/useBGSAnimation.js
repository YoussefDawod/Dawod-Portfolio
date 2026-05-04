/**
 * useBGSAnimation — Custom Hook für die BackgroundSystem Animation-Engine
 * Setup: Canvas, Event-Listener, IntersectionObserver, Render-Loop
 */

import { useEffect, useRef } from 'react';
import { setupCanvas } from '../shared/setupCanvas.js';
import { globalTextCache } from '../shared/rendering.js';
import { getResponsiveCircleTokenScale, BREAKPOINTS, getThemeBGSAlpha } from '../shared/core.js';

import { createHomeTokens, convertHomeTokensToAbout } from '../sections/home/tokens.js';
import { updateHomeTokens } from '../sections/home/update.js';
import { drawHomeTokens } from '../sections/home/draw.js';
import { updateAboutTokens, drawAboutTokens } from '../sections/about/index.js';
import { updateProjectsForms, drawProjectsForms, createProjectsForms } from '../sections/projects/index.js';
import { updateContactNodes, drawContactNodes, createContactNodes } from '../sections/contact/index.js';
import { handleSectionChange } from '../engine/sectionTransitions.js';
import { computeImageTargets, lerpImageState, applyImageStyles } from '../engine/imageManager.js';
import { refreshContentMask } from '../engine/contentMask.js';
import { IMAGE_CONFIG } from '../sections/home/image.js';

/**
 * @param {{ canvasRef, imageRef, imageBehindRef, glowRef }} refs
 */
export function useBGSAnimation({ canvasRef, imageRef, imageBehindRef, glowRef }) {
    const ctxRef = useRef(null);
    const mouseRef = useRef({ x: null, y: null });
    const orientationRef = useRef({ beta: 0, gamma: 0 });
    const scrollRef = useRef({ lastY: 0, currentSection: null, justReturned: false, sectionScrollStart: 0, scrollProgress: 0 });
    const tokensRef = useRef([]);
    const lastWindowWidthRef = useRef(typeof window !== 'undefined' ? window.innerWidth : 1024);
    const ANIMATION_MODE = useRef(null);
    const imageStateRef = useRef({ opacity: 0, scale: 0.85, blur: 0 });
    /* About Slide-Kick: jede Slide-Navigation löst einen kurzen Token-Schub
       in der Gegenrichtung aus. value=1 → Tokens nach rechts (Slide ging vor),
       value=-1 → Tokens nach links (Slide ging zurück). Klingt exponentiell ab. */
    const aboutKickRef = useRef(0);

    /* BGS Exit Overlay: Wenn Projects verlassen wird, werden die Contact-Linien-Tokens
       in einem separaten Pass weitergerendert und zum Linienende getrieben, bis sie
       durch den Edge-Fade verschwunden sind. */
    const bgsExitRef = useRef({ active: false, tokens: [], direction: 1, startTime: 0 });

    /* Projects Card-Hover-Echo: Wenn eine Project-Card gehovert wird, übernimmt
       das BGS-Grid für die Hover-Dauer die Project-Farbe für ~70 % seiner neuen
       Connections — dezentes Farb-Echo der Card-Auswahl im Hintergrund. */
    const projectsHoverColorRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const { ctx, resize } = setupCanvas(canvas);
        ctxRef.current = ctx;

        // Alle Zustandsrefs auf Ausgangswert zurücksetzen.
        // Notwendig weil React StrictMode im Dev-Mode Effects zweimal ausführt:
        // mount → cleanup → mount. Ohne Reset überleben ANIMATION_MODE und
        // scrollRef.currentSection den zweiten Mount, tokensRef wird aber neu
        // auf createHomeTokens() gesetzt → inkonsistenter Zustand → Crash.
        tokensRef.current = createHomeTokens();
        ANIMATION_MODE.current = null;
        scrollRef.current.currentSection = null;

        let animationFrameId;
        let lastTime = performance.now();
        let cachedCssWidth = window.innerWidth;
        let cachedCssHeight = window.innerHeight;

        // ===== REDUCED MOTION CACHE =====
        const mqlReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let cachedReducedMotion = mqlReducedMotion.matches;
        const onMotionChange = (e) => {
            const wasReduced = cachedReducedMotion;
            cachedReducedMotion = e.matches;
            // Wechsel von Reduce → Full Motion: RAF-Loop wieder anwerfen
            if (wasReduced && !cachedReducedMotion) {
                lastTime = performance.now();
                cancelAnimationFrame(animationFrameId);
                animationFrameId = requestAnimationFrame(render);
            }
        };
        mqlReducedMotion.addEventListener('change', onMotionChange);

        // ===== RESPONSIVE CACHE (alle Werte direkt in Pixel) =====
        let orbitCenterPx = { x: 0, y: 0 };   // Orbit-Zentrum in Pixel
        let imageCenterPx = { x: 0, y: 0 };   // Bild-Zentrum in Pixel (unabhängig)
        let orbitRadiusPx = 100;                // Orbit-Radius in Pixel
        let imageRadiusPx = 100;                // Bild-Radius in Pixel (unabhängig)
        let tokenScale = getResponsiveCircleTokenScale();

        /**
         * Berechnet Zentrum und Radien direkt in Pixel
         * über einen virtuellen Container (wie ein CSS-Elternelement).
         * Container-Rect skaliert mit dem Viewport →
         * Orbit-Position & Größe bleiben immer proportional gleich.
         */
        function updateContainerDerivedValues() {
            const isMobile = cachedCssWidth < BREAKPOINTS.DESKTOP;
            const cfg = isMobile ? IMAGE_CONFIG.mobile : IMAGE_CONFIG.desktop;
            const c = cfg.container;

            // Virtueller Container in Pixel (wie ein DOM-Element)
            const cX = c.left * cachedCssWidth;
            const cY = c.top * cachedCssHeight;
            const cW = c.width * cachedCssWidth;
            const cH = c.height * cachedCssHeight;
            const cMin = Math.min(cW, cH);

            // Orbit-Center: relativ zum Container
            const cx = cX + cfg.orbitCenterX * cW;
            const cy = cY + cfg.orbitCenterY * cH;
            orbitCenterPx = { x: cx, y: cy };

            // Bild-Center: Orbit-Center + Versatz relativ zu cMin
            imageCenterPx = {
                x: cx + cfg.imageOffsetX * cMin,
                y: cy + cfg.imageOffsetY * cMin,
            };

            // Radien: relativ zu min(Container-Breite, Container-Höhe)
            orbitRadiusPx = cMin * cfg.orbitRadius;
            imageRadiusPx = cMin * cfg.imageRadius;

            // Token-Scale: proportional zum Container
            tokenScale = Math.min(1.0, (cMin / 500) * 1.1);
        }

        updateContainerDerivedValues();

        // ===== CSS CUSTOM PROPERTY CACHE (Dirty-Flag + Throttle ~30fps) =====
        const CSS_THROTTLE_MS = 33;
        let lastCssWrite = 0;
        let prevCssMx = '', prevCssMy = '', prevCssTiltX = '', prevCssTiltY = '';

        // ===== DEVICE ORIENTATION (Mobile Parallax) =====
        let orientationBaseline = null;
        const handleOrientation = (e) => {
            const beta = e.beta || 0;
            const gamma = e.gamma || 0;

            // Erste Messung als Referenz speichern (natürliche Haltung)
            if (orientationBaseline === null) {
                orientationBaseline = { beta, gamma };
            }

            // Delta zur Referenz berechnen, auf ±20° clampen, auf [-1, 1] normalisieren
            const maxTilt = 20;
            const dBeta = beta - orientationBaseline.beta;
            const dGamma = gamma - orientationBaseline.gamma;
            orientationRef.current.beta = Math.min(maxTilt, Math.max(-maxTilt, dBeta)) / maxTilt;
            orientationRef.current.gamma = Math.min(maxTilt, Math.max(-maxTilt, dGamma)) / maxTilt;
        };

        if (window.DeviceOrientationEvent && 'ontouchstart' in window) {
            window.addEventListener('deviceorientation', handleOrientation);
        }

        // iOS Gyro-Permission
        const handleFirstInteraction = async () => {
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                try {
                    const perm = await DeviceOrientationEvent.requestPermission();
                    if (perm === 'granted') window.addEventListener('deviceorientation', handleOrientation);
                } catch { /* User denied */ }
            }
        };
        document.addEventListener('click', handleFirstInteraction, { once: true });
        document.addEventListener('touchstart', handleFirstInteraction, { once: true });

        // ===== MOUSE TRACKING =====
        const isTouchDevice = 'ontouchstart' in window;
        const handleMouseMove = (e) => { mouseRef.current.x = e.clientX / window.innerWidth; mouseRef.current.y = e.clientY / window.innerHeight; };
        const handleMouseLeave = () => { mouseRef.current.x = null; mouseRef.current.y = null; };

        if (!isTouchDevice) {
            window.addEventListener('mousemove', handleMouseMove, { passive: true });
            window.addEventListener('mouseleave', handleMouseLeave);
        }

        // ===== INTERSECTION OBSERVER (Section-Wechsel) =====
        // Sehr niedriger Threshold (0.05) + Scroll-getriebene Detection unten
        // damit der Übergang im SELBEN Frame wie der Scroll-Tick startet.
        // snapLockedUntil sperrt IO + Scroll w\u00e4hrend eines aktiven Snap-Sprungs
        // \u2014 das page-snap-start-Event ist dann autoritativ.
        let snapLockedUntil = 0;
        const observer = new IntersectionObserver((entries) => {
            if (performance.now() < snapLockedUntil) return;
            const visible = entries.reduce((max, e) => e.intersectionRatio > max.intersectionRatio ? e : max, entries[0]);
            if (visible?.isIntersecting && visible.intersectionRatio > 0.05) {
                const id = visible.target.getAttribute('data-section');
                handleSectionChange(id, scrollRef, tokensRef, ANIMATION_MODE);
            }
        }, { threshold: [0.05, 0.15, 0.3, 0.5] });

        const sectionElements = Array.from(document.querySelectorAll('section[data-section]'));
        sectionElements.forEach(s => observer.observe(s));

        // ===== SNAP-SYNC =====
        // Desktop nutzt usePageSnap → 680 ms Snap-Sprung. Damit BGS-Übergang
        // SYNCHRON mit dem Sprung startet (nicht erst danach), lauschen wir
        // auf 'page-snap-start' (gefeuert direkt am Snap-Beginn) und
        // triggern den Section-Wechsel im selben Frame.
        //
        // Während eines aktiven Snaps wird die scroll-getriebene Detection
        // GESPERRT — sonst feuert sie während der 680 ms Animation und
        // setzt den Modus wieder auf die Ausgangs-Section zurück (Flackern
        // bei Home↔Contact-Wrap).
        const handleSnapStart = (e) => {
            const id = e.detail?.id;
            if (!id) return;
            // usePageSnap sendet HTML-IDs ('home', 'about', ...). Das
            // BGS-System arbeitet mit data-section ('YD', 'ABOUT', ...).
            // \u00dcbersetzung \u00fcber das DOM-Element \u2192 robust gegen ID-\u00c4nderungen.
            const el = document.getElementById(id);
            const dataSection = el?.getAttribute('data-section');
            if (!dataSection) return;
            const duration = e.detail?.duration ?? 680;
            // Lock 100 ms l\u00e4nger als Snap-Dauer, um Tail-Scroll-Events nach
            // Wrap-Jumps (`window.scrollTo` zum echten Section-Top) zu \u00fcberspringen.
            snapLockedUntil = performance.now() + duration + 120;
            // BGS Exit Overlay: Tokens einfrieren bevor handleSectionChange sie ersetzt
            const SECTION_ORDER = ['YD', 'ABOUT', 'PROJECTS', 'CONTACT'];
            if (scrollRef.current.currentSection === 'PROJECTS' && dataSection !== 'PROJECTS') {
                const isForward = SECTION_ORDER.indexOf(dataSection) > SECTION_ORDER.indexOf('PROJECTS');
                bgsExitRef.current = {
                    active: true,
                    tokens: tokensRef.current,
                    direction: isForward ? 1 : -1,
                    startTime: performance.now(),
                };
            }
            // Exit-Overlay verwerfen, wenn wir NACH Projects navigieren
            if (dataSection === 'PROJECTS') {
                bgsExitRef.current.active = false;
            }
            handleSectionChange(dataSection, scrollRef, tokensRef, ANIMATION_MODE);
        };
        window.addEventListener('page-snap-start', handleSnapStart);

        // ===== ABOUT SLIDE-KICK =====
        // About.jsx feuert beim Slide-Wechsel ein CustomEvent. Wir setzen den
        // Kick-Wert (in Slide-Richtung) und lassen ihn im Render-Loop
        // exponentiell abklingen. updateAboutTokens liest ihn aus
        // options.scrollKick und beschleunigt die Tokens entsprechend.
        const handleAboutSlideChange = (e) => {
            const direction = e.detail?.direction;
            if (direction !== 1 && direction !== -1) return;
            // Mit der Slide-Richtung: Slide vorwärts → Tokens nach links (-1)
            //                         Slide rückwärts → Tokens nach rechts (+1)
            // (Slide-Inhalte gleiten bei "vorwärts" nach links → Tokens ziehen mit.)
            aboutKickRef.current = -direction;
        };
        window.addEventListener('about-slide-change', handleAboutSlideChange);

        // Projects: Card-Hover → BGS übernimmt Project-Farbe für neue Connections.
        // detail.color === null beim mouseleave löst das Echo wieder auf.
        const handleProjectsCardHover = (e) => {
            const color = e.detail?.color;
            projectsHoverColorRef.current = (typeof color === 'string' && color) ? color : null;
        };
        window.addEventListener('projects-card-hover', handleProjectsCardHover);

        // Initiale Section anhand der aktuellen Scroll-Position erkennen
        // (statt hardcoded 'YD', damit Reload auf About/Projects/Contact korrekt startet)
        const scrollMid = window.scrollY + window.innerHeight / 2;
        let initialSection = 'YD';
        for (const el of sectionElements) {
            const top = el.offsetTop;
            if (scrollMid >= top && scrollMid < top + el.offsetHeight) {
                initialSection = el.getAttribute('data-section');
                break;
            }
        }
        handleSectionChange(initialSection, scrollRef, tokensRef, ANIMATION_MODE);

        // ===== SCROLL TRACKING =====
        let isScrollTicking = false;
        const updateScrollProgress = () => {
            const currentY = window.scrollY;
            const viewH = window.innerHeight;

            // Scroll-getriebene Section-Detection \u2014 nur wenn KEIN Snap aktiv ist.
            // (W\u00e4hrend des 680 ms Snap-Sprungs ist `page-snap-start` autoritativ.)
            const snapActive = performance.now() < snapLockedUntil;
            if (!snapActive) {
                const triggerPoint = currentY + viewH * 0.65;
                for (const el of sectionElements) {
                    const top = el.offsetTop;
                    if (triggerPoint >= top && triggerPoint < top + el.offsetHeight) {
                        handleSectionChange(el.getAttribute('data-section'), scrollRef, tokensRef, ANIMATION_MODE);
                        break;
                    }
                }
            }

            if (ANIMATION_MODE.current === 'home') {
                const homeSection = document.querySelector('section[data-section="YD"]');
                if (homeSection) {
                    const rect = homeSection.getBoundingClientRect();
                    scrollRef.current.scrollProgress = Math.max(0, Math.min(1, -rect.top / rect.height));
                }
                if (scrollRef.current.justReturned && tokensRef.current.every?.(t => (t.formationProgress || 0) > 0.9)) {
                    scrollRef.current.justReturned = false;
                }
            } else {
                const start = scrollRef.current.sectionScrollStart || 0;
                const height = scrollRef.current.sectionHeight || window.innerHeight;
                scrollRef.current.scrollProgress = Math.max(0, Math.min(1, (currentY + window.innerHeight / 2 - start) / height));
            }

            scrollRef.current.lastY = currentY;
            isScrollTicking = false;
        };

        const handleScroll = () => {
            // Während eines Snap-Sprungs ist der page-snap-start-Event
            // autoritativ — scroll-getriebene Detection würde sonst die
            // Ausgangs-Section während der 680 ms Animation neu triggern
            // und den BGS-Modus zurückschalten (Flackern bei Wrap-Übergängen).
            const snapActive = performance.now() < snapLockedUntil;
            if (!snapActive) {
                // Section-Detection SOFORT im Scroll-Event (synchron).
                const currentY = window.scrollY;
                const viewH = window.innerHeight;
                const triggerPoint = currentY + viewH * 0.65;
                for (const el of sectionElements) {
                    const top = el.offsetTop;
                    if (triggerPoint >= top && triggerPoint < top + el.offsetHeight) {
                        handleSectionChange(el.getAttribute('data-section'), scrollRef, tokensRef, ANIMATION_MODE);
                        break;
                    }
                }
            }
            // Schwerere Berechnungen (scrollProgress) weiterhin gedrosselt
            if (!isScrollTicking) {
                window.requestAnimationFrame(updateScrollProgress);
                isScrollTicking = true;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });

        // ===== RESIZE =====
        const handleResize = () => {
            resize();
            globalTextCache.clear();
            cachedCssWidth = window.innerWidth;
            cachedCssHeight = window.innerHeight;

            updateContainerDerivedValues();

            const currentWidth = window.innerWidth;
            const bp = BREAKPOINTS.DESKTOP;
            const crossed = (
                (lastWindowWidthRef.current < bp && currentWidth >= bp) ||
                (lastWindowWidthRef.current >= bp && currentWidth < bp)
            );

            if (crossed) {
                const m = ANIMATION_MODE.current;
                if (m === 'home') tokensRef.current = createHomeTokens();
                else if (m === 'about') tokensRef.current = convertHomeTokensToAbout(createHomeTokens());
                else if (m === 'projects') tokensRef.current = createContactNodes();
                else if (m === 'contact') tokensRef.current = createProjectsForms();
            }

            lastWindowWidthRef.current = currentWidth;
        };
        window.addEventListener('resize', handleResize);
        // Mobile Browser (iOS Safari, Chrome Android) feuern `resize` beim
        // Toolbar-Ein/Ausblenden nicht zuverlässig. visualViewport ist hier präzise
        // und verhindert, dass Canvas-Pixel-Auflösung und CSS-Größe auseinanderlaufen.
        window.visualViewport?.addEventListener('resize', handleResize);

        // ===== VISIBILITY (Tab-Wechsel → RAF pausieren) =====
        const handleVisibility = () => {
            if (document.hidden) {
                cancelAnimationFrame(animationFrameId);
            } else {
                lastTime = performance.now();
                animationFrameId = requestAnimationFrame(render);
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);

        // ===== RENDER LOOP =====
        const render = (time) => {
            const delta = Math.max(0, (time - lastTime) / 1000);
            lastTime = time;

            // Inhalts-Respekt: Bounding-Box-Snapshot aktualisieren (gedrosselt)
            refreshContentMask(time);

            const section = scrollRef.current.currentSection;
            const mode = ANIMATION_MODE.current;
            const scroll = scrollRef.current;
            const mx = mouseRef.current.x, my = mouseRef.current.y;
            const ori = orientationRef.current;
            const themeAlpha = getThemeBGSAlpha();

            // Update + Draw
            if (mode === 'about' && section === 'ABOUT') {
                /* Kick exponentiell abklingen lassen (~280 ms half-life).
                   Math.exp(-delta / 0.28) bei 60 fps ≈ 0.94 pro Frame. */
                if (aboutKickRef.current !== 0) {
                    aboutKickRef.current *= Math.exp(-delta / 0.28);
                    if (Math.abs(aboutKickRef.current) < 0.01) aboutKickRef.current = 0;
                }
                updateAboutTokens(tokensRef.current, delta, mx, my, {
                    orientation: ori,
                    reducedMotion: cachedReducedMotion,
                    scrollKick: aboutKickRef.current,
                });
                ctxRef.current.clearRect(0, 0, cachedCssWidth, cachedCssHeight);
                ctxRef.current.globalAlpha = themeAlpha;
                drawAboutTokens(ctxRef.current, tokensRef.current);
                ctxRef.current.globalAlpha = 1;
            } else if (mode === 'projects' && section === 'PROJECTS') {
                // BGS-Tausch: Projects-Bereich rendert jetzt das Contact-Linien-System.
                // Linien teilen den Bereich visuell in 4 Quadranten (y=0.35, x=0.75, y=0.33).
                updateContactNodes(tokensRef.current, delta, mouseRef.current);
                ctxRef.current.clearRect(0, 0, cachedCssWidth, cachedCssHeight);
                ctxRef.current.globalAlpha = themeAlpha;
                drawContactNodes(ctxRef.current, tokensRef.current);
                ctxRef.current.globalAlpha = 1;
            } else if (mode === 'contact' && section === 'CONTACT') {
                // BGS-Tausch: Contact-Bereich rendert jetzt das Projects-Grid (Constructive Grid).
                updateProjectsForms(tokensRef.current, delta, scroll.scrollProgress, mx, my, {
                    cardHoverColor: projectsHoverColorRef.current,
                });
                ctxRef.current.clearRect(0, 0, cachedCssWidth, cachedCssHeight);
                ctxRef.current.globalAlpha = themeAlpha;
                drawProjectsForms(ctxRef.current, tokensRef.current);
                ctxRef.current.globalAlpha = 1;
            } else {
                const isHome = section === 'YD';
                updateHomeTokens(tokensRef.current, delta, isHome ? scroll.scrollProgress : 0, mx, my, {
                    orientation: ori,
                    reducedMotion: cachedReducedMotion,
                    width: cachedCssWidth,
                    height: cachedCssHeight,
                    centerPx: orbitCenterPx,
                    orbitRadiusPx: orbitRadiusPx,
                });
                ctxRef.current.clearRect(0, 0, cachedCssWidth, cachedCssHeight);
                ctxRef.current.globalAlpha = themeAlpha;
                drawHomeTokens(ctxRef.current, tokensRef.current, {
                    w: cachedCssWidth,
                    h: cachedCssHeight,
                    centerPx: orbitCenterPx,
                    radiusPx: orbitRadiusPx,
                    tokenScale: tokenScale,
                });
                ctxRef.current.globalAlpha = 1;
            }

            // BGS Exit Overlay — Contact-Linien-Tokens abblenden wenn Projects verlassen wird.
            // Zeitbasiertes globalAlpha-Fade über 380ms (abgeschlossen vor dem 680ms-Snap).
            if (bgsExitRef.current.active) {
                const elapsed = (performance.now() - bgsExitRef.current.startTime) / 1000;
                const FADE_DURATION = 0.38;

                if (elapsed >= FADE_DURATION) {
                    bgsExitRef.current.active = false;
                } else {
                    updateContactNodes(bgsExitRef.current.tokens, delta, {
                        exitMode: true,
                        exitDirection: bgsExitRef.current.direction,
                    });
                    const timeFade = 1 - elapsed / FADE_DURATION;
                    ctxRef.current.globalAlpha = themeAlpha * timeFade;
                    drawContactNodes(ctxRef.current, bgsExitRef.current.tokens);
                    ctxRef.current.globalAlpha = 1;
                }
            }

            // CSS Custom Properties (Mouse + Tilt) — Dirty-Flag + Throttle
            if (time - lastCssWrite >= CSS_THROTTLE_MS) {
                const root = document.documentElement.style;
                if (mx != null && my != null) {
                    const smx = mx.toFixed(3), smy = my.toFixed(3);
                    if (smx !== prevCssMx) { root.setProperty('--mouse-x', smx); prevCssMx = smx; }
                    if (smy !== prevCssMy) { root.setProperty('--mouse-y', smy); prevCssMy = smy; }
                }
                if (isTouchDevice && (ori.gamma !== 0 || ori.beta !== 0)) {
                    const stx = ori.gamma.toFixed(3), sty = ori.beta.toFixed(3);
                    if (stx !== prevCssTiltX) { root.setProperty('--tilt-x', stx); prevCssTiltX = stx; }
                    if (sty !== prevCssTiltY) { root.setProperty('--tilt-y', sty); prevCssTiltY = sty; }
                }
                lastCssWrite = time;
            }

            // Image Management (nur wenn Refs vorhanden)
            if (imageRef.current && glowRef.current) {
                const isHome = mode === 'home' && section === 'YD';
                const targets = computeImageTargets(tokensRef.current, mode, isHome);
                lerpImageState(imageStateRef.current, targets, isHome);
                applyImageStyles(
                    { imageRef: imageRef.current, imageBehindRef: imageBehindRef.current, glowRef: glowRef.current },
                    imageStateRef.current, orientationRef.current, mouseRef.current,
                    cachedCssWidth, cachedCssHeight,
                    { centerPx: imageCenterPx, imageRadiusPx: imageRadiusPx, orbitRadiusPx: orbitRadiusPx }
                );
            }

            // Reduced-Motion: Idle-Frame zeichnen, dann Loop stoppen.
            // Wechsel zurück zu Full-Motion startet den Loop über onMotionChange.
            if (cachedReducedMotion) return;

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        // ===== CLEANUP =====
        return () => {
            cancelAnimationFrame(animationFrameId);
            observer.disconnect();
            mqlReducedMotion.removeEventListener('change', onMotionChange);
            document.removeEventListener('visibilitychange', handleVisibility);
            window.removeEventListener('deviceorientation', handleOrientation);
            if (!isTouchDevice) { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseleave', handleMouseLeave); }
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('page-snap-start', handleSnapStart);
            window.removeEventListener('about-slide-change', handleAboutSlideChange);
            window.removeEventListener('projects-card-hover', handleProjectsCardHover);
            window.visualViewport?.removeEventListener('resize', handleResize);
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('touchstart', handleFirstInteraction);
            document.documentElement.style.removeProperty('--home-dissolve');
            document.documentElement.style.removeProperty('--mouse-x');
            document.documentElement.style.removeProperty('--mouse-y');
            document.documentElement.style.removeProperty('--tilt-x');
            document.documentElement.style.removeProperty('--tilt-y');
        };
    }, [canvasRef, imageRef, imageBehindRef, glowRef]);
}
