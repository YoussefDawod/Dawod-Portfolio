/**
 * useBGSAnimation — Custom Hook für die BackgroundSystem Animation-Engine
 * Setup: Canvas, Event-Listener, IntersectionObserver, Render-Loop
 */

import { useEffect, useRef } from 'react';
import { setupCanvas } from '../shared/setupCanvas.js';
import { globalTextCache } from '../shared/rendering.js';
import { getResponsiveCircleTokenScale, BREAKPOINTS } from '../shared/core.js';

import { createHomeTokens, convertHomeTokensToAbout } from '../sections/home/tokens.js';
import { updateHomeTokens } from '../sections/home/update.js';
import { drawHomeTokens } from '../sections/home/draw.js';
import { updateAboutTokens, drawAboutTokens } from '../sections/about/index.js';
import { updateProjectsForms, drawProjectsForms, createProjectsForms } from '../sections/projects/index.js';
import { updateContactNodes, drawContactNodes, createContactNodes } from '../sections/contact/index.js';
import { handleSectionChange } from '../engine/sectionTransitions.js';
import { computeImageTargets, lerpImageState, applyImageStyles } from '../engine/imageManager.js';
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

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const { ctx, resize } = setupCanvas(canvas);
        ctxRef.current = ctx;
        tokensRef.current = createHomeTokens();

        let animationFrameId;
        let lastTime = performance.now();
        let cachedCssWidth = window.innerWidth;
        let cachedCssHeight = window.innerHeight;

        // ===== REDUCED MOTION CACHE =====
        const mqlReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let cachedReducedMotion = mqlReducedMotion.matches;
        const onMotionChange = (e) => { cachedReducedMotion = e.matches; };
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
        const observer = new IntersectionObserver((entries) => {
            const visible = entries.reduce((max, e) => e.intersectionRatio > max.intersectionRatio ? e : max, entries[0]);
            if (visible?.isIntersecting && visible.intersectionRatio > 0.3) {
                const id = visible.target.getAttribute('data-section');
                handleSectionChange(id, scrollRef, tokensRef, ANIMATION_MODE);
            }
        }, { threshold: [0.3, 0.5, 0.7] });

        const sectionElements = Array.from(document.querySelectorAll('section[data-section]'));
        sectionElements.forEach(s => observer.observe(s));

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

            // Scroll-position-based section detection (Viewport-Mittelpunkt)
            // Robuster als IntersectionObserver allein, besonders für
            // große Sections (150vh+ About) auf Mobile
            const scrollMid = currentY + viewH / 2;
            for (const el of sectionElements) {
                const top = el.offsetTop;
                if (scrollMid >= top && scrollMid < top + el.offsetHeight) {
                    handleSectionChange(el.getAttribute('data-section'), scrollRef, tokensRef, ANIMATION_MODE);
                    break;
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

        const handleScroll = () => { if (!isScrollTicking) { window.requestAnimationFrame(updateScrollProgress); isScrollTicking = true; } };
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
                else if (m === 'projects') tokensRef.current = createProjectsForms();
                else if (m === 'contact') tokensRef.current = createContactNodes();
            }

            lastWindowWidthRef.current = currentWidth;
        };
        window.addEventListener('resize', handleResize);

        // ===== VISIBILITY (Tab-Wechsel → RAF pausieren) =====
        let isTabVisible = true;
        const handleVisibility = () => {
            if (document.hidden) {
                isTabVisible = false;
                cancelAnimationFrame(animationFrameId);
            } else {
                isTabVisible = true;
                lastTime = performance.now();
                animationFrameId = requestAnimationFrame(render);
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);

        // ===== RENDER LOOP =====
        const render = (time) => {
            const delta = Math.max(0, (time - lastTime) / 1000);
            lastTime = time;

            const section = scrollRef.current.currentSection;
            const mode = ANIMATION_MODE.current;
            const scroll = scrollRef.current;
            const mx = mouseRef.current.x, my = mouseRef.current.y;
            const ori = orientationRef.current;

            // Update + Draw
            if (mode === 'about' && section === 'ABOUT') {
                updateAboutTokens(tokensRef.current, delta, mx, my, { orientation: ori, reducedMotion: cachedReducedMotion });
                ctxRef.current.clearRect(0, 0, cachedCssWidth, cachedCssHeight);
                drawAboutTokens(ctxRef.current, tokensRef.current);
            } else if (mode === 'projects' && section === 'PROJECTS') {
                updateProjectsForms(tokensRef.current, delta, scroll.scrollProgress, mx, my);
                ctxRef.current.clearRect(0, 0, cachedCssWidth, cachedCssHeight);
                drawProjectsForms(ctxRef.current, tokensRef.current);
            } else if (mode === 'contact' && section === 'CONTACT') {
                updateContactNodes(tokensRef.current, delta, mouseRef.current);
                ctxRef.current.clearRect(0, 0, cachedCssWidth, cachedCssHeight);
                drawContactNodes(ctxRef.current, tokensRef.current);
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
                drawHomeTokens(ctxRef.current, tokensRef.current, {
                    w: cachedCssWidth,
                    h: cachedCssHeight,
                    centerPx: orbitCenterPx,
                    radiusPx: orbitRadiusPx,
                    tokenScale: tokenScale,
                });
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
                    { centerPx: imageCenterPx, imageRadiusPx: imageRadiusPx }
                );
            }

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
