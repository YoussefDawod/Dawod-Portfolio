/**
 * BackgroundSystem — Hauptkomponente
 * Rendert das Canvas-basierte Hintergrund-Animationssystem
 */

import { useRef } from 'react';
import './bgs.css';
import ProfileImage from '../../assets/Dawod.png';
import { useBGSAnimation } from './hooks/useBGSAnimation.js';

function BGS() {
    const canvasRef = useRef(null);
    const imageRef = useRef(null);
    const imageBehindRef = useRef(null);
    const glowRef = useRef(null);

    useBGSAnimation({ canvasRef, imageRef, imageBehindRef, glowRef });

    return (
        <>
            <canvas ref={canvasRef} className="background-canvas" aria-hidden="true" />
            <div ref={glowRef} className="bgs-image-glow" aria-hidden="true" />
            <img
                ref={imageBehindRef}
                src={ProfileImage}
                alt=""
                className="bgs-profile-behind"
                aria-hidden="true"
                draggable={false}
                decoding="async"
            />
            <img
                ref={imageRef}
                src={ProfileImage}
                alt="Youssef Dawod — Web & Software Developer aus Berlin"
                className="bgs-profile-front"
                draggable={false}
                decoding="async"
                fetchPriority="high"
            />
        </>
    );
}

export default BGS;
