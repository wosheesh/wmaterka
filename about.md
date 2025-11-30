---
layout: default
title: "About — Wojtek Materka"
description: "About - Wojtek Materka"
---

<div class="page-header">
    <h2>About me</h2>
</div>

<div class="section about-intro">
    <div class="about-text">
        <div class="about-item">
            <span class="about-bullet">🎭</span>
            <p>I'm a professor, a consultant, a father, a painter, someone who rides motorcycles. These are some of the costumes I am currently wearing. Some fit better than others.</p>
        </div>
        <div class="about-item">
            <span class="about-bullet">📄</span>
            <p>If you are after my academic CV <a href="/s/Wojtek Materka CV Nov_2025.pdf" target="_blank" rel="noopener noreferrer">here it is</a>. Or if you want connect with me, you can find me on <a href="https://www.linkedin.com/in/wmaterka/" target="_blank" rel="noopener noreferrer">LinkedIn</a>.</p>
        </div>
        <div class="about-item">
            <span class="about-bullet">🎨</span>
            <p>I also make <a href= "/art">art - painting and photography</a> - that help me stay in contact with what I can't say any other way.</p>
        </div>
        <div class="about-item">
            <span class="about-bullet">💻</span>
            <p>Sometimes I make things with code. The one below asks: what does it take to reveal a hidden image? Patience, interference, or a well-placed drop. Play with it.</p>
        </div>
    </div>
    <img src="{{ '/images/about/Tims Bike WM.jpg' | relative_url }}" alt="Wojtek Materka" class="about-photo">
</div>

<div class="interference-section">
    <h3>"Paint with Rain" - a little experiment</h3>
    <p>What kind of rain would reveal this picture — play to find out!</p>
    <div class="interference-controls">
        <div class="control-group">
            <label for="ctrl-frequency">Rain Frequency</label>
            <input type="range" id="ctrl-frequency" min="50" max="1200" value="1050" step="25">
            <span class="control-value" id="val-frequency">Fast</span>
        </div>
        <div class="control-group">
            <label for="ctrl-size">Droplet Size</label>
            <input type="range" id="ctrl-size" min="60" max="300" value="120" step="10">
            <span class="control-value" id="val-size">120px</span>
        </div>
        <div class="control-group">
            <label for="ctrl-speed">Rain Speed</label>
            <input type="range" id="ctrl-speed" min="0.3" max="3" value="1.2" step="0.1">
            <span class="control-value" id="val-speed">1.2</span>
        </div>
    </div>
    <div class="interference-container-wide" id="wave-container"></div>
    <div class="interference-info">
        <p class="reveal-progress">Revealed: <span id="reveal-percent">0%</span></p>
        <p class="manual-drop-hint">Click to add droplets: <span id="manual-drop-counter">0 dropped, 3 remaining</span></p>
    </div>
</div>

<script>
(function() {
    let reveal = null;
    
    function initAnimation() {
        if (typeof WaveInterferenceReveal === 'undefined') {
            setTimeout(initAnimation, 50);
            return;
        }
        
        const container = document.querySelector('#wave-container');
        if (!container) {
            console.error('Wave container not found');
            return;
        }
        
        // Constrained width for better visual balance
        const maxWidth = Math.min(container.offsetWidth || 400, 400);
        
        reveal = new WaveInterferenceReveal('#wave-container', '/images/about/interference_pic.png', {
            width: maxWidth,
            maxWaves: 30, // More droplets allowed
            waveSpeed: 1.2,
            ringCount: 3,
            ringSpacings: [14, 10, 7],
            spawnInterval: 200, // More frequent default
            flickerDuration: 50,
            oppositionThreshold: -0.3,
            maxWaveRadius: 120,
            onProgress: function(percent) {
                const el = document.getElementById('reveal-percent');
                if (el) {
                    el.textContent = Math.round(percent) + '%';
                    if (percent >= 100) {
                        el.textContent = 'Complete!';
                    }
                }
            }
        });
        
        // Set up controls
        setupControls();
    }
    
    function setupControls() {
        const freqSlider = document.getElementById('ctrl-frequency');
        const sizeSlider = document.getElementById('ctrl-size');
        const speedSlider = document.getElementById('ctrl-speed');
        
        const freqVal = document.getElementById('val-frequency');
        const sizeVal = document.getElementById('val-size');
        const speedVal = document.getElementById('val-speed');
        
        if (freqSlider) {
            freqSlider.addEventListener('input', function() {
                const val = parseInt(this.value);
                const maxVal = parseInt(freqSlider.max);
                const minVal = parseInt(freqSlider.min);
                
                // Invert: higher slider value = more drops (lower spawn interval)
                const spawnInterval = maxVal - val + minVal;
                if (reveal) reveal.config.spawnInterval = spawnInterval;
                
                // Display as Few to Many droplets
                const range = maxVal - minVal;
                const position = (val - minVal) / range;
                
                if (position < 0.2) {
                    freqVal.textContent = 'Few';
                } else if (position < 0.4) {
                    freqVal.textContent = 'Light';
                } else if (position < 0.6) {
                    freqVal.textContent = 'Medium';
                } else if (position < 0.8) {
                    freqVal.textContent = 'Heavy';
                } else {
                    freqVal.textContent = 'Downpour';
                }
            });
            // Trigger initial update
            freqSlider.dispatchEvent(new Event('input'));
        }
        
        if (sizeSlider) {
            sizeSlider.addEventListener('input', function() {
                const val = parseInt(this.value);
                if (reveal) reveal.config.maxWaveRadius = val;
                
                const maxVal = parseInt(sizeSlider.max);
                const minVal = parseInt(sizeSlider.min);
                const range = maxVal - minVal;
                const position = (val - minVal) / range;
                
                if (position < 0.2) {
                    sizeVal.textContent = 'Tiny';
                } else if (position < 0.4) {
                    sizeVal.textContent = 'Small';
                } else if (position < 0.6) {
                    sizeVal.textContent = 'Medium';
                } else if (position < 0.8) {
                    sizeVal.textContent = 'Large';
                } else {
                    sizeVal.textContent = 'Huge';
                }
            });
            // Trigger initial update
            sizeSlider.dispatchEvent(new Event('input'));
        }
        
        if (speedSlider) {
            speedSlider.addEventListener('input', function() {
                const val = parseFloat(this.value);
                if (reveal) reveal.config.waveSpeed = val;
                
                const maxVal = parseFloat(speedSlider.max);
                const minVal = parseFloat(speedSlider.min);
                const range = maxVal - minVal;
                const position = (val - minVal) / range;
                
                if (position < 0.2) {
                    speedVal.textContent = 'Gentle';
                } else if (position < 0.4) {
                    speedVal.textContent = 'Calm';
                } else if (position < 0.6) {
                    speedVal.textContent = 'Steady';
                } else if (position < 0.8) {
                    speedVal.textContent = 'Brisk';
                } else {
                    speedVal.textContent = 'Stormy';
                }
            });
            // Trigger initial update
            speedSlider.dispatchEvent(new Event('input'));
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAnimation);
    } else {
        initAnimation();
    }
})();
</script>
