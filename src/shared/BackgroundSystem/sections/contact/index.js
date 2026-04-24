/**
 * Contact Section Animation - "Message Flow"
 * Theme: Communication, Digital Connection, Information Flow
 * Visual: Particles flow in wave-like paths, forming temporary communication nodes
 * Interaction: Mouse creates attraction points, particles cluster and form connections
 * Design: Minimalist, fluid, represents digital message exchange
 */

import {
    getThemeColors,
    clampNormalized,
    EASE_OUT_CUBIC,
    ANIMATION_CONFIG,
    TAU,
    BREAKPOINTS,
} from '../../shared/core.js';

const FLOW_SPEED = 0.08; // Base flow speed
const WAVE_AMPLITUDE = 0.15; // Wave movement amplitude
const WAVE_FREQUENCY = 0.8; // Wave frequency
const MOUSE_ATTRACTION_RADIUS = 0.3; // Mouse interaction radius
const MOUSE_ATTRACTION_STRENGTH = 0.15; // How strongly mouse attracts particles
const CONNECTION_DISTANCE = 0.18; // Distance for particle connections
const TRAIL_LENGTH = 3; // Motion trail effect

// Responsive particle count
function getParticleCount() {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
  if (width < BREAKPOINTS.DESKTOP) return 25; // Mobile
  if (width < BREAKPOINTS.WIDE) return 35; // Tablet
  return 50; // Desktop
}

/**
 * Create message flow particles
 */
export function createContactNodes(options = {}) {
  const count = getParticleCount();
  const particles = [];
  const colors = getThemeColors();
  const colorPalette = [colors.accent, colors.primary, colors.text];
  
  const previousTokens = options.previousTokens || [];
  const hasPrevious = previousTokens.points || previousTokens.nodes || (Array.isArray(previousTokens) && previousTokens.length > 0);
  
  // Extract previous positions
  let prevPositions = [];
  if (Array.isArray(previousTokens)) {
    prevPositions = previousTokens;
  } else if (previousTokens.points) {
    prevPositions = previousTokens.points;
  } else if (previousTokens.nodes) {
    prevPositions = previousTokens.nodes;
  }

  for (let i = 0; i < count; i++) {
    const lane = i / count; // Vertical lane (0-1)
    const phase = Math.random() * TAU; // Random phase offset
    const waveSpeed = FLOW_SPEED * (0.8 + Math.random() * 0.4);
    const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    
    let startX, startY;
    
    // Transition from previous section
    if (hasPrevious && i < prevPositions.length) {
      const prev = prevPositions[i];
      startX = prev.x ?? prev.renderX ?? 0;
      startY = prev.y ?? prev.renderY ?? lane;
    } else {
      // Start at left edge
      startX = Math.random() * 0.3; // Random start on left third
      startY = lane + (Math.random() - 0.5) * 0.1;
    }

    particles.push({
      id: i,
      // Flow properties
      x: startX,
      y: startY,
      targetX: startX, // For smooth transitions
      targetY: startY,
      baseY: lane, // Base lane position
      phase: phase,
      waveSpeed: waveSpeed,
      flowProgress: Math.random() * TAU, // Position in flow cycle
      
      // Visual properties
      size: 2 + Math.random() * 2,
      baseSize: 2 + Math.random() * 2,
      color: color,
      opacity: 0.6 + Math.random() * 0.4,
      
      // Interaction
      mouseInfluence: 0, // 0-1, how much mouse affects this particle
      velocityX: 0,
      velocityY: 0,
      
      // Trail
      trail: [],
      
      // Transition
      transitionProgress: hasPrevious ? 0 : 1,
      startX: startX,
      startY: startY
    });
  }
  
  return {
    particles,
    mouse: { x: -1, y: -1 },
    connections: [],
    time: 0
  };
}

/**
 * Update message flow animation
 */
export function updateContactNodes(state, deltaTime, mousePos) {
  const dt = Math.max(ANIMATION_CONFIG.MIN_DELTA_TIME, Math.min(deltaTime, ANIMATION_CONFIG.MAX_DELTA_TIME));
  
  state.time += dt;
  
  // Update mouse position
  if (mousePos) {
    state.mouse.x = mousePos.x;
    state.mouse.y = mousePos.y;
  }

  state.particles.forEach((particle) => {
    // Transition from previous section
    if (particle.transitionProgress < 1) {
      particle.transitionProgress += dt * ANIMATION_CONFIG.TRANSITION_SPEED;
      if (particle.transitionProgress > 1) particle.transitionProgress = 1;
      
      const t = EASE_OUT_CUBIC(particle.transitionProgress);
      
      // Interpolate to flow position
      const flowX = (particle.flowProgress / TAU) * 1.2 - 0.1; // Horizontal flow
      const waveOffset = Math.sin(particle.phase + state.time * particle.waveSpeed) * WAVE_AMPLITUDE;
      const flowY = particle.baseY + waveOffset;
      
      particle.x = particle.startX + (flowX - particle.startX) * t;
      particle.y = particle.startY + (flowY - particle.startY) * t;
    } else {
      // Normal flow animation
      particle.flowProgress += particle.waveSpeed * dt;
      if (particle.flowProgress > TAU) {
        particle.flowProgress -= TAU;
      }
      
      // Calculate base flow position
      const baseX = (particle.flowProgress / TAU) * 1.2 - 0.1; // -0.1 to 1.1 for seamless wrap
      const waveOffset = Math.sin(particle.phase + state.time * particle.waveSpeed) * WAVE_AMPLITUDE;
      const baseY = particle.baseY + waveOffset;
      
      // Mouse interaction
      let mouseForceX = 0;
      let mouseForceY = 0;
      
      if (state.mouse.x > 0) {
        const dx = state.mouse.x - baseX;
        const dy = state.mouse.y - baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < MOUSE_ATTRACTION_RADIUS) {
          const influence = 1 - (dist / MOUSE_ATTRACTION_RADIUS);
          particle.mouseInfluence = Math.min(1, particle.mouseInfluence + dt * 3);
          
          // Attract towards mouse
          mouseForceX = dx * influence * MOUSE_ATTRACTION_STRENGTH;
          mouseForceY = dy * influence * MOUSE_ATTRACTION_STRENGTH;
        } else {
          particle.mouseInfluence = Math.max(0, particle.mouseInfluence - dt * 2);
        }
      }
      
      // Apply forces with smooth velocity
      particle.velocityX += (mouseForceX - particle.velocityX) * 0.1;
      particle.velocityY += (mouseForceY - particle.velocityY) * 0.1;
      
      // Final position
      particle.x = baseX + particle.velocityX;
      particle.y = baseY + particle.velocityY;
      
      // Wrap around horizontally
      if (particle.flowProgress > TAU * 0.95) {
        // About to wrap - fade out
        const wrapProgress = (particle.flowProgress - TAU * 0.95) / (TAU * 0.05);
        particle.opacity = 0.6 * (1 - wrapProgress);
      } else if (particle.flowProgress < TAU * 0.05) {
        // Just wrapped - fade in
        const wrapProgress = particle.flowProgress / (TAU * 0.05);
        particle.opacity = 0.6 * wrapProgress + 0.4;
      } else {
        particle.opacity = 0.6 + particle.mouseInfluence * 0.4;
      }
      
      // Clamp positions
      particle.x = clampNormalized(particle.x, 0.02);
      particle.y = clampNormalized(particle.y, 0.02);
      
      // Size grows with mouse influence
      particle.size = particle.baseSize * (1 + particle.mouseInfluence * 0.5);
    }
    
    // Update trail
    particle.trail.unshift({ x: particle.x, y: particle.y });
    if (particle.trail.length > TRAIL_LENGTH) {
      particle.trail.pop();
    }
  });
  
  // Build connections between nearby particles
  state.connections = [];
  for (let i = 0; i < state.particles.length; i++) {
    const p1 = state.particles[i];
    
    // Limit connections per particle
    let connectionCount = 0;
    const maxConnections = 3;
    
    for (let j = i + 1; j < state.particles.length && connectionCount < maxConnections; j++) {
      const p2 = state.particles[j];
      
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < CONNECTION_DISTANCE) {
        state.connections.push({
          p1,
          p2,
          strength: 1 - (dist / CONNECTION_DISTANCE),
          mouseBoost: Math.max(p1.mouseInfluence, p2.mouseInfluence)
        });
        connectionCount++;
      }
    }
  }
  
  return state;
}

// Re-export draw & convert from dedicated module
export { drawContactNodes, convertContactToProjects } from './draw.js';