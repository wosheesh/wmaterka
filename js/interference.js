class WaveInterferenceReveal {
  constructor(containerId, imagePath, options = {}) {
    this.container = document.querySelector(containerId);
    this.imagePath = imagePath;
    this.options = options;
    
    this.canvas = document.createElement('canvas');
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    
    this.waves = [];
    this.manualWaveIds = new Set(); // Track manually added droplets
    this.maxManualWaves = 3;
    this.time = 0;
    this.binaryMatrix = null;
    this.revealedMatrix = null;
    this.flickerMatrix = null;
    this.animating = false;
    this.complete = false;
    this.ripplePhase = 0;
    this.rippleCount = 0;
    this.maxRipples = 3; // Number of wave passes after completion
    
    // Pixel size based on device pixel ratio - use larger pixels for better performance
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    
    this.config = {
      maxWaves: options.maxWaves || 6,
      waveSpeed: options.waveSpeed || 0.5,
      ringCount: options.ringCount || 3,
      // Ring spacing decreases - first gap larger, subsequent smaller (like real ripples)
      ringSpacings: options.ringSpacings || [14, 10, 7],
      spawnInterval: options.spawnInterval || 1200,
      // Higher resolution (2px base)
      pixelSize: Math.max(2, Math.round(3 / dpr)),
      baseGray: 255,
      waveGray: 140,
      revealGray: 70,
      flickerDuration: options.flickerDuration || 30, // Shorter flicker
      starExpandSpeed: options.starExpandSpeed || 0.5,
      // How opposed the wave directions need to be (0 = any angle, -1 = exactly opposite)
      oppositionThreshold: options.oppositionThreshold || -0.3,
      // Max radius before wave fades completely and stops
      maxWaveRadius: options.maxWaveRadius || 200,
      // Wider ring detection for performance
      ringThickness: 1.5
    };
    
    // Performance optimization: throttle to ~30fps
    this.lastRenderTime = 0;
    this.renderThrottle = 33; // ~30fps
    
    this.onProgress = options.onProgress || null;
    
    this.init();
  }

  init() {
    this.loadImage();
  }

  loadImage() {
    const img = new Image();
    img.onload = () => {
      // Smaller canvas size (max 500x350)
      const containerWidth = Math.min(
        this.options.width || this.container.offsetWidth || 400,
        500
      );
      const aspectRatio = img.width / img.height;
      
      this.width = containerWidth;
      this.height = Math.round(containerWidth / aspectRatio);
      
      // Limit canvas size for smaller display
      const maxWidth = 500;
      const maxHeight = 350;
      if (this.width > maxWidth) {
        this.height = Math.round(this.height * (maxWidth / this.width));
        this.width = maxWidth;
      }
      if (this.height > maxHeight) {
        this.width = Math.round(this.width * (maxHeight / this.height));
        this.height = maxHeight;
      }
      
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      // Let CSS handle sizing - canvas scales to container
      this.canvas.style.width = '100%';
      this.canvas.style.height = 'auto';
      
      // Add click handler for manual droplets
      this.canvas.style.cursor = 'crosshair';
      this.canvas.addEventListener('click', (e) => this.handleClick(e));
      
      this.createBinaryMatrix(img);
      this.drawInitialState();
      this.start();
    };
    img.onerror = () => {
      console.error('WaveInterferenceReveal: Failed to load image:', this.imagePath);
    };
    img.src = this.imagePath;
  }

  createBinaryMatrix(img) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.width;
    tempCanvas.height = this.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCtx.fillStyle = '#fff';
    tempCtx.fillRect(0, 0, this.width, this.height);
    tempCtx.drawImage(img, 0, 0, this.width, this.height);
    
    const imageData = tempCtx.getImageData(0, 0, this.width, this.height);
    const pixels = imageData.data;
    
    const step = this.config.pixelSize;
    const gridW = Math.ceil(this.width / step);
    const gridH = Math.ceil(this.height / step);
    
    this.gridWidth = gridW;
    this.gridHeight = gridH;
    this.binaryMatrix = new Uint8Array(gridW * gridH);
    this.revealedMatrix = new Float32Array(gridW * gridH);
    this.flickerMatrix = [];
    
    for (let i = 0; i < gridW * gridH; i++) {
      this.flickerMatrix[i] = null;
    }
    
    this.totalImagePixels = 0;
    
    for (let gy = 0; gy < gridH; gy++) {
      for (let gx = 0; gx < gridW; gx++) {
        const px = Math.min(gx * step + Math.floor(step / 2), this.width - 1);
        const py = Math.min(gy * step + Math.floor(step / 2), this.height - 1);
        const pi = (py * this.width + px) * 4;
        
        const gray = (pixels[pi] + pixels[pi + 1] + pixels[pi + 2]) / 3;
        const gridIdx = gy * gridW + gx;
        this.binaryMatrix[gridIdx] = gray < 128 ? 1 : 0;
        if (this.binaryMatrix[gridIdx]) this.totalImagePixels++;
      }
    }
  }

  drawInitialState() {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  start() {
    this.animating = true;
    this.startWaveSpawner();
    this.animate();
  }

  stop() {
    this.animating = false;
  }

  startWaveSpawner() {
    const spawn = () => {
      if (!this.animating) return;
      // Stop spawning when complete
      if (this.complete) return;
      
      if (this.waves.length < this.config.maxWaves) {
        // Allow drops to spawn outside the visible area (up to maxWaveRadius outside)
        // This lets waves enter from edges and reveal border pixels
        const overflow = this.config.maxWaveRadius * 0.8;
        this.waves.push({
          id: Date.now() + Math.random(),
          x: -overflow + Math.random() * (this.width + 2 * overflow),
          y: -overflow + Math.random() * (this.height + 2 * overflow),
          radius: 0,
          birth: this.time
        });
      }
      setTimeout(spawn, this.config.spawnInterval + Math.random() * 800);
    };
    spawn();
  }

  // Handle click to add manual droplet
  handleClick(e) {
    // Disable clicks when complete
    if (this.complete) return;
    
    // Count active manual waves
    const activeManualCount = this.waves.filter(w => this.manualWaveIds.has(w.id)).length;
    
    if (activeManualCount >= this.maxManualWaves) {
      return; // Can't add more until some finish
    }
    
    // Get click position relative to canvas
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.width / rect.width;
    const scaleY = this.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const id = Date.now() + Math.random();
    this.manualWaveIds.add(id);
    
    this.waves.push({
      id: id,
      x: x,
      y: y,
      radius: 0,
      birth: this.time,
      manual: true // Flag for accent color rendering
    });
    
    this.updateManualCounter();
  }

  // Update the manual droplet counter display
  updateManualCounter() {
    const counter = document.getElementById('manual-drop-counter');
    if (counter) {
      if (this.complete) {
        counter.textContent = 'Picture revealed!';
      } else {
        const active = this.waves.filter(w => w.manual).length;
        const remaining = this.maxManualWaves - active;
        counter.textContent = `${active} dropped, ${remaining} remaining`;
      }
    }
  }

  // Get the ring radii for a wave (non-uniform spacing like real droplets)
  getRingRadii(wave) {
    const radii = [];
    let offset = 0;
    for (let i = 0; i < this.config.ringCount; i++) {
      const ringRadius = wave.radius - offset;
      if (ringRadius > 0) {
        radii.push({ radius: ringRadius, ringIndex: i });
      }
      offset += this.config.ringSpacings[i] || this.config.ringSpacings[this.config.ringSpacings.length - 1];
    }
    return radii;
  }

  // Get intensity of wave at distance (fades with distance like real droplets)
  getWaveIntensity(wave, dist) {
    const maxRadius = this.config.maxWaveRadius;
    
    // Fade out completely as wave approaches max radius
    if (wave.radius >= maxRadius) return 0;
    
    // Intensity falls off with distance (1/sqrt for 2D wave spreading)
    const falloff = 1 / Math.sqrt(1 + dist * 0.02);
    
    // Fade out near the end of wave life
    const lifeFade = 1 - Math.pow(wave.radius / maxRadius, 2);
    
    return falloff * lifeFade;
  }

  // Check if a point is on a wave ring, return intensity
  getWaveRingInfo(px, py, wave) {
    const dx = px - wave.x;
    const dy = py - wave.y;
    
    // Fast distance approximation (avoid sqrt when possible)
    const distSq = dx * dx + dy * dy;
    const maxRingRadius = wave.radius + this.config.ringThickness;
    const minRingRadius = Math.max(0, wave.radius - this.config.ringSpacings[0] - this.config.ringThickness);
    
    // Quick bounds check to skip expensive calculations
    if (distSq > maxRingRadius * maxRingRadius || distSq < minRingRadius * minRingRadius) {
      return { onRing: false };
    }
    
    const dist = Math.sqrt(distSq);
    const ringRadii = this.getRingRadii(wave);
    const lineThickness = this.config.ringThickness;
    
    for (const { radius, ringIndex } of ringRadii) {
      if (Math.abs(dist - radius) < lineThickness) {
        // Inner rings are stronger than outer
        const ringFade = 1 - ringIndex * 0.25;
        const intensity = this.getWaveIntensity(wave, dist) * ringFade;
        
        // Return direction vector (normalized) from wave center to point
        const len = Math.max(dist, 0.001);
        return {
          onRing: true,
          intensity,
          dirX: dx / len,
          dirY: dy / len,
          wave
        };
      }
    }
    return { onRing: false };
  }

  // Get all waves that touch this point with their direction info
  getWavesAtPoint(px, py) {
    const touchingWaves = [];
    for (const wave of this.waves) {
      const info = this.getWaveRingInfo(px, py, wave);
      if (info.onRing) {
        touchingWaves.push(info);
      }
    }
    return touchingWaves;
  }

  // Check if waves are crossing against each other (opposing directions)
  hasOpposingInterference(px, py) {
    const touchingWaves = this.getWavesAtPoint(px, py);
    if (touchingWaves.length < 2) return { has: false, waves: touchingWaves };
    
    // Check all pairs for opposing directions
    for (let i = 0; i < touchingWaves.length; i++) {
      for (let j = i + 1; j < touchingWaves.length; j++) {
        const w1 = touchingWaves[i];
        const w2 = touchingWaves[j];
        
        // Must be from different origins
        if (w1.wave.id === w2.wave.id) continue;
        
        // Dot product of direction vectors
        // -1 = exactly opposite, 0 = perpendicular, 1 = same direction
        const dot = w1.dirX * w2.dirX + w1.dirY * w2.dirY;
        
        // Check if they're opposing (dot product below threshold)
        if (dot < this.config.oppositionThreshold) {
          return { has: true, waves: touchingWaves };
        }
      }
    }
    
    return { has: false, waves: touchingWaves };
  }

  render() {
    const now = performance.now();
    // Throttle rendering for performance (but always render during ripple animation)
    if (!this.complete && now - this.lastRenderTime < this.renderThrottle) {
      return;
    }
    this.lastRenderTime = now;
    
    const step = this.config.pixelSize;
    
    // Clear to white
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    let revealedCount = 0;
    
    // Pre-cache colors to avoid string creation in loop
    const revealColor = `rgb(${this.config.revealGray},${this.config.revealGray},${this.config.revealGray})`;
    const waveGray = this.config.waveGray;
    
    // Collect pixels to draw by color for batching
    const revealedPixels = [];
    const wavePixels = new Map(); // gray value -> pixel list

    for (let gy = 0; gy < this.gridHeight; gy++) {
      for (let gx = 0; gx < this.gridWidth; gx++) {
        const gridIdx = gy * this.gridWidth + gx;
        const revealed = this.revealedMatrix[gridIdx];
        
        // Skip already revealed pixels from expensive calculations
        if (revealed > 0.5) {
          // Only count image pixels for progress
          if (this.binaryMatrix[gridIdx] === 1) {
            revealedCount++;
            revealedPixels.push({ x: gx * step, y: gy * step });
          }
          continue;
        }
        
        const isImagePixel = this.binaryMatrix[gridIdx] === 1;
        const px = gx * step + step / 2;
        const py = gy * step + step / 2;
        
        // Process flicker animation first
        if (this.flickerMatrix[gridIdx]) {
          const flicker = this.flickerMatrix[gridIdx];
          const elapsed = this.time - flicker.startTime;
          
          if (elapsed < this.config.flickerDuration) {
            const flickerPhase = Math.floor(elapsed / 4);
            if (flickerPhase % 2 === 0 && isImagePixel) {
              revealedPixels.push({ x: gx * step, y: gy * step });
            }
            continue;
          } else {
            this.revealedMatrix[gridIdx] = 1;
            this.flickerMatrix[gridIdx] = null;
            if (isImagePixel) {
              revealedCount++;
              revealedPixels.push({ x: gx * step, y: gy * step });
            }
            continue;
          }
        }
        
        // Only check interference for image pixels that aren't revealed
        if (isImagePixel) {
          const interference = this.hasOpposingInterference(px, py);
          if (interference.has) {
            this.flickerMatrix[gridIdx] = {
              startTime: this.time,
              centerX: gx,
              centerY: gy
            };
            continue;
          }
        }
        
        // Draw wave rings - simplified check
        const touchingWaves = this.getWavesAtPoint(px, py);
        if (touchingWaves.length > 0) {
          const maxIntensity = Math.max(...touchingWaves.map(w => w.intensity));
          // Check if any touching wave is manual (for accent color)
          const hasManual = touchingWaves.some(w => w.wave && w.wave.manual);
          
          if (hasManual) {
            // Use accent color for manual waves
            const colorKey = 'accent-' + Math.round(maxIntensity * 10);
            if (!wavePixels.has(colorKey)) {
              wavePixels.set(colorKey, { pixels: [], intensity: maxIntensity, manual: true });
            }
            wavePixels.get(colorKey).pixels.push({ x: gx * step, y: gy * step });
          } else {
            const gray = Math.round(255 - (255 - waveGray) * Math.min(1, maxIntensity));
            if (!wavePixels.has(gray)) {
              wavePixels.set(gray, { pixels: [], intensity: maxIntensity, manual: false });
            }
            wavePixels.get(gray).pixels.push({ x: gx * step, y: gy * step });
          }
        }
      }
    }
    
    // Batch draw revealed pixels
    if (revealedPixels.length > 0) {
      this.ctx.fillStyle = revealColor;
      for (const p of revealedPixels) {
        this.ctx.fillRect(p.x, p.y, step, step);
      }
    }
    
    // Batch draw wave pixels by color
    for (const [key, data] of wavePixels) {
      if (data.manual) {
        // Accent color: #1a5f5e with intensity fade
        const intensity = Math.min(1, data.intensity);
        const r = Math.round(255 - (255 - 26) * intensity);
        const g = Math.round(255 - (255 - 95) * intensity);
        const b = Math.round(255 - (255 - 94) * intensity);
        this.ctx.fillStyle = `rgb(${r},${g},${b})`;
      } else {
        this.ctx.fillStyle = `rgb(${key},${key},${key})`;
      }
      const pixels = data.pixels;
      for (const p of pixels) {
        this.ctx.fillRect(p.x, p.y, step, step);
      }
    }
    
    // Calculate progress
    const percent = this.totalImagePixels > 0 ? (revealedCount / this.totalImagePixels) * 100 : 0;
    
    // Check for completion (use 99.5% threshold to handle edge cases)
    if (!this.complete && percent >= 99.5) {
      this.complete = true;
      this.ripplePhase = 0;
      this.rippleCount = 0;
      // Clear any remaining waves
      this.waves = [];
      this.manualWaveIds.clear();
      // Update counter to show completion
      this.updateManualCounter();
    }
    
    // Render water ripple effect when complete
    if (this.complete && this.rippleCount < this.maxRipples) {
      this.renderWaterRipple(revealedPixels, step);
    }
    
    if (this.onProgress) {
      this.onProgress(Math.min(100, percent));
    }
  }

  // Render a gentle water ripple effect on the revealed image
  renderWaterRipple(pixels, step) {
    this.ripplePhase += 0.15;
    
    // Complete one full ripple cycle
    if (this.ripplePhase > Math.PI * 2) {
      this.ripplePhase = 0;
      this.rippleCount++;
      
      if (this.rippleCount >= this.maxRipples) {
        // Final render without ripple
        return;
      }
    }
    
    const amplitude = 2 * (1 - this.rippleCount / this.maxRipples); // Fade amplitude
    const frequency = 0.02;
    
    // Redraw pixels with wave displacement
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    const revealGray = this.config.revealGray;
    this.ctx.fillStyle = `rgb(${revealGray},${revealGray},${revealGray})`;
    
    for (const p of pixels) {
      // Calculate wave displacement based on position
      const waveOffset = Math.sin(p.y * frequency + this.ripplePhase) * amplitude;
      const yOffset = Math.sin(p.x * frequency * 0.7 + this.ripplePhase * 1.2) * amplitude * 0.5;
      
      this.ctx.fillRect(
        p.x + waveOffset,
        p.y + yOffset,
        step,
        step
      );
    }
  }

  update() {
    this.time++;
    
    // Remove waves that have reached max radius
    this.waves = this.waves.filter(w => {
      w.radius += this.config.waveSpeed;
      const keep = w.radius < this.config.maxWaveRadius;
      
      // Clean up manual wave tracking when wave finishes
      if (!keep && this.manualWaveIds.has(w.id)) {
        this.manualWaveIds.delete(w.id);
        this.updateManualCounter();
      }
      
      return keep;
    });
  }

  animate() {
    if (!this.animating) return;
    this.update();
    this.render();
    requestAnimationFrame(() => this.animate());
  }
}
