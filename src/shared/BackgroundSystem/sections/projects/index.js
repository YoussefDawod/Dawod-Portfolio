// projects-bgs.js
// Minimalist Constructive Grid Animation
// Represents: Logic, structure, and building
// Design: Isometric-style grid with dynamic connections and mouse interaction

import {
    getThemeColors,
    clampNormalized,
    EASE_OUT_CUBIC,
    ANIMATION_CONFIG,
    TAU,
    BREAKPOINTS,
} from '../../shared/core.js';

const CONNECTION_LIFETIME = 4.0;
const MOUSE_RADIUS = 0.25; // Interaction radius

function getResponsiveConfig() {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
  if (width < BREAKPOINTS.DESKTOP) {
    return {
      gridSpacing: 0.14, // Tighter grid for more points on mobile (was 0.19)
      maxConnections: 8, // Increased from 6
      connectionChance: 0.01
    };
  }
  if (width < BREAKPOINTS.WIDE) {
    return {
      gridSpacing: 0.13, // Tighter (was 0.16)
      maxConnections: 10, // Increased from 9
      connectionChance: 0.012
    };
  }
  return {
    gridSpacing: 0.12, // Tighter (was 0.15)
    maxConnections: 14, // Increased from 12
    connectionChance: 0.015
  };
}

export function createProjectsForms(options = {}) {
  const previousTokens = options.previousTokens || [];
  const config = getResponsiveConfig();
  
  // Generate grid points
  const points = [];
  
  // Calculate optimal grid dimensions to be perfectly centered
  // We use floor to ensure we don't overflow
  const cols = Math.floor(1 / config.gridSpacing);
  const rows = Math.floor(1 / config.gridSpacing);
  
  const totalGridW = (cols - 1) * config.gridSpacing;
  const totalGridH = (rows - 1) * config.gridSpacing;
  
  const offsetX = (1 - totalGridW) / 2;
  const offsetY = (1 - totalGridH) / 2;
  
  let tokenIndex = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const targetX = offsetX + c * config.gridSpacing;
      const targetY = offsetY + r * config.gridSpacing;
      
      // No strict bounds check needed as we calculated it to fit 0-1
      // But we can add a small safety margin check if needed
      if (targetX >= 0.01 && targetX <= 0.99 && targetY >= 0.01 && targetY <= 0.99) {
        // Transition Logic
        let startX = targetX;
        let startY = targetY;
        let transitionProgress = 1;

        if (previousTokens.length > 0) {
          // Map previous token to this grid point
          // If we run out of tokens, loop or just spawn at target
          if (tokenIndex < previousTokens.length) {
             const prev = previousTokens[tokenIndex];
             startX = prev.x ?? prev.renderX ?? targetX;
             startY = prev.y ?? prev.renderY ?? targetY;
             transitionProgress = 0;
             tokenIndex++;
          } else {
             // Extra grid points fade in
             transitionProgress = 0; // Start invisible? Or just pop in?
             // Let's make them start at target but scale up
          }
        }

        points.push({ 
          x: startX, 
          y: startY, 
          targetX, 
          targetY,
          startX,
          startY,
          transitionProgress,
          active: false, 
          hover: 0,
          config: config // Store config
        });
      }
    }
  }
  
  return {
    points,
    connections: [],
    timer: 0,
    config // Store global config
  };
}

export function updateProjectsForms(state, deltaTime = 0.016, scrollProgress = 0, mouseX = 0.5, mouseY = 0.5) {
  const dt = Math.max(ANIMATION_CONFIG.MIN_DELTA_TIME, Math.min(deltaTime, ANIMATION_CONFIG.MAX_DELTA_TIME));
  const colors = getThemeColors();
  const config = state.config || getResponsiveConfig();
  
  // Scroll effect: Shift grid slightly basierend auf scrollProgress
  const scrollShiftY = scrollProgress * 0.1;
  
  // Update points (mouse interaction + transition)
  state.points.forEach(p => {
    // Transition
    if (p.transitionProgress < 1) {
      p.transitionProgress += dt * ANIMATION_CONFIG.TRANSITION_SPEED;
      if (p.transitionProgress > 1) p.transitionProgress = 1;
      
      const t = EASE_OUT_CUBIC(p.transitionProgress);
      p.x = p.startX + (p.targetX - p.startX) * t;
      p.y = p.startY + (p.targetY - p.startY) * t;
      
      // Clamp during transition
      p.x = clampNormalized(p.x, 0.02);
      p.y = clampNormalized(p.y, 0.02);
    } else {
      p.x = p.targetX;
      p.y = p.targetY;
      
      // Clamp final positions
      p.x = clampNormalized(p.x, 0.02);
      p.y = clampNormalized(p.y, 0.02);
    }

    // Calculate distance to mouse (normalized coords)
    // Adjust mouse Y for scroll shift if we apply it to rendering
    // Here we just check raw distance
    const dx = p.x - mouseX;
    const dy = (p.y - scrollShiftY) - mouseY; // Apply scroll shift logic inverse
    const dist = Math.sqrt(dx*dx + dy*dy);
    
    if (dist < MOUSE_RADIUS) {
      p.hover = Math.min(1, p.hover + dt * 1.5); // Slower hover in
    } else {
      p.hover = Math.max(0, p.hover - dt);
    }
  });

  // Manage connections
  state.timer += dt;
  
  // Spawn new connection
  // Higher chance if near mouse
  if (state.connections.length < config.maxConnections) {
    // Pick a random point, prefer hovered ones
    // Only pick points that have finished transition
    const candidates = state.points.filter(p => p.transitionProgress >= 0.8 && Math.random() < (config.connectionChance + p.hover * 0.1));
    if (candidates.length > 0) {
      const p1 = candidates[Math.floor(Math.random() * candidates.length)];
      
      // Find neighbor
      const neighbors = state.points.filter(p => {
        const dx = p.x - p1.x;
        const dy = p.y - p1.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        return dist < config.gridSpacing * 1.5 && dist > 0.01 && p.transitionProgress >= 0.8;
      });
      
      if (neighbors.length > 0) {
        const p2 = neighbors[Math.floor(Math.random() * neighbors.length)];
        state.connections.push({
          p1,
          p2,
          life: 0,
          maxLife: CONNECTION_LIFETIME * (0.8 + Math.random() * 0.4),
          color: Math.random() > 0.5 ? colors.primary : colors.accent
        });
      }
    }
  }
  
  // Update connections
  state.connections.forEach(conn => {
    conn.life += dt;
  });
  
  // Remove dead connections
  state.connections = state.connections.filter(conn => conn.life < conn.maxLife);
  
  // Store scroll progress for rendering
  state.scrollShiftY = scrollShiftY;
  
  return state;
}

// Re-export draw & convert from dedicated module
export { drawProjectsForms, convertProjectsToAbout } from './draw.js';