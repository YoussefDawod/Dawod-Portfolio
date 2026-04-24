/**
 * BackgroundSystem — Hauptkomponente
 * Rendert das Canvas-basierte Hintergrund-Animationssystem
 */

import { useRef } from 'react';
import './bgs.css';
import ProfileImage from '../../assets/Youssef-Dawod.webp';
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
            <img ref={imageBehindRef} src={ProfileImage} alt="" className="bgs-profile-behind" aria-hidden="true" draggable={false} />
            <img ref={imageRef} src={ProfileImage} alt="" className="bgs-profile-front" aria-hidden="true" draggable={false} />
        </>
    );
}

export default BGS;
