/**
 * realmeow Surf Rush - Subway Surfers Style Endless Runner
 * Optimized for HTML5 Canvas inside the realme C100 Display Frame
 * Powered by Web Audio API for responsive sound effects without external assets
 */

(function () {
  'use strict';

  // --- Sound Engine (Web Audio API) ---
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.muted = false;
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playJump() {
      if (this.muted || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(620, this.ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.18);
      } catch (e) {}
    }

    playSlide() {
      if (this.muted || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(140, this.ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
      } catch (e) {}
    }

    playCoin() {
      if (this.muted || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, this.ctx.currentTime); // B5
        osc.frequency.setValueAtTime(1318.51, this.ctx.currentTime + 0.08); // E6
        gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.22);
      } catch (e) {}
    }

    playPowerup() {
      if (this.muted || !this.ctx) return;
      try {
        const notes = [440, 554, 659, 880];
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.06);
          gain.gain.setValueAtTime(0.15, this.ctx.currentTime + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.06 + 0.12);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(this.ctx.currentTime + idx * 0.06);
          osc.stop(this.ctx.currentTime + idx * 0.06 + 0.12);
        });
      } catch (e) {}
    }

    playCrash() {
      if (this.muted || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.28, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.35);
      } catch (e) {}
    }
  }

  // --- Game Engine ---
  class RealmeowGame {
    constructor() {
      this.canvas = document.getElementById('gameCanvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');

      // Canvas roundRect Polyfill for universal browser compatibility
      if (!this.ctx.roundRect) {
        this.ctx.roundRect = function (x, y, w, h, r) {
          if (typeof r === 'undefined') r = 5;
          if (typeof r === 'number') r = { tl: r, tr: r, br: r, bl: r };
          this.beginPath();
          this.moveTo(x + r.tl, y);
          this.lineTo(x + w - r.tr, y);
          this.quadraticCurveTo(x + w, y, x + w, y + r.tr);
          this.lineTo(x + w, y + h - r.br);
          this.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
          this.lineTo(x + r.bl, y + h);
          this.quadraticCurveTo(x, y + h, x, y + h - r.bl);
          this.lineTo(x, y + r.tl);
          this.quadraticCurveTo(x, y, x + r.tl, y);
          this.closePath();
          return this;
        };
      }

      this.sound = new SoundEngine();

      // Virtual Canvas Dimensions
      this.width = 380;
      this.height = 640;
      this.canvas.width = this.width;
      this.canvas.height = this.height;

      // Horizon & Lanes (Subway Surfers Perspective)
      this.horizonY = 160;
      this.laneOffsets = [-1, 0, 1]; // Left (-1), Middle (0), Right (1)

      // Player State (realmeow)
      this.player = {
        lane: 0, // -1, 0, 1
        currentX: 0, // interpolated X offset
        y: 0, // height above ground (for jump)
        vy: 0,
        isJumping: false,
        isSliding: false,
        slideTimer: 0,
        runFrame: 0,
        invincibleTime: 0
      };

      // Game Parameters
      this.gameState = 'IDLE'; // 'IDLE', 'PLAYING', 'GAMEOVER'
      this.speed = 1.0;
      this.distance = 0;
      this.score = 0;
      this.coins = 0;
      this.highScore = parseInt(localStorage.getItem('realmeow_highscore') || '0', 10);

      // Track Entities
      this.obstacles = [];
      this.coinsList = [];
      this.particles = [];
      this.trackMarkers = [];
      this.spawnTimer = 0;
      this.nextSpawnDistance = 35;

      // Skyline & Scenery
      this.cityScenery = this.generateCity();

      // UI Elements
      this.scoreDisplay = document.getElementById('hudScore');
      this.coinsDisplay = document.getElementById('hudCoins');
      this.modal = document.getElementById('gameModal');
      this.modalTitle = document.getElementById('modalTitle');
      this.modalSubtitle = document.getElementById('modalSubtitle');
      this.modalFinalScore = document.getElementById('modalFinalScore');
      this.modalFinalCoins = document.getElementById('modalFinalCoins');
      this.btnPlay = document.getElementById('btnStartGame');
      this.btnSound = document.getElementById('btnSoundToggle');
      this.miniCapsule = document.getElementById('miniCapsule');
      this.capsuleText = document.getElementById('capsuleStatusText');

      this.initEvents();
      this.initTrackMarkers();
      this.render(); // initial render
    }

    generateCity() {
      const buildings = [];
      for (let i = 0; i < 18; i++) {
        buildings.push({
          x: i * 24 - 20,
          w: 16 + Math.random() * 16,
          h: 40 + Math.random() * 65,
          color: Math.random() > 0.4 ? '#141824' : '#1c2233',
          hasLights: Math.random() > 0.3,
          lightColor: Math.random() > 0.5 ? '#FFC915' : '#38bdf8'
        });
      }
      return buildings;
    }

    initTrackMarkers() {
      this.trackMarkers = [];
      for (let z = 0.05; z <= 1.0; z += 0.065) {
        this.trackMarkers.push(z);
      }
    }

    initEvents() {
      // Keyboard input
      window.addEventListener('keydown', (e) => {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'w', 'a', 's', 'd'].includes(e.key)) {
          if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault();
          }
        }
        if (this.gameState === 'PLAYING') {
          if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.moveLane(-1);
          if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.moveLane(1);
          if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') this.jump();
          if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.slide();
        } else if (e.key === ' ' || e.key === 'Enter') {
          if (this.gameState !== 'PLAYING') {
            this.startGame();
          }
        }
      });

      // Virtual touch buttons
      const btnLeft = document.getElementById('ctrlLeft');
      const btnRight = document.getElementById('ctrlRight');
      const btnJump = document.getElementById('ctrlJump');
      const btnSlide = document.getElementById('ctrlSlide');

      if (btnLeft) btnLeft.addEventListener('click', () => this.moveLane(-1));
      if (btnRight) btnRight.addEventListener('click', () => this.moveLane(1));
      if (btnJump) btnJump.addEventListener('click', () => this.jump());
      if (btnSlide) btnSlide.addEventListener('click', () => this.slide());

      // Start / Play Again Button
      if (this.btnPlay) {
        this.btnPlay.addEventListener('click', () => {
          this.sound.init();
          this.startGame();
        });
      }

      // Sound toggle
      if (this.btnSound) {
        this.btnSound.addEventListener('click', () => {
          this.sound.init();
          this.sound.muted = !this.sound.muted;
          this.btnSound.innerHTML = this.sound.muted
            ? '<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>'
            : '<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
        });
      }

      // Touch Swipe Detection on Canvas
      let touchStartX = 0;
      let touchStartY = 0;
      this.canvas.addEventListener('touchstart', (e) => {
        this.sound.init();
        if (e.touches.length > 0) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }
      }, { passive: true });

      this.canvas.addEventListener('touchend', (e) => {
        if (e.changedTouches.length > 0) {
          const deltaX = e.changedTouches[0].clientX - touchStartX;
          const deltaY = e.changedTouches[0].clientY - touchStartY;
          const absX = Math.abs(deltaX);
          const absY = Math.abs(deltaY);

          if (this.gameState !== 'PLAYING') {
            this.startGame();
            return;
          }

          if (Math.max(absX, absY) > 25) {
            if (absX > absY) {
              if (deltaX > 0) this.moveLane(1);
              else this.moveLane(-1);
            } else {
              if (deltaY < 0) this.jump();
              else this.slide();
            }
          }
        }
      }, { passive: true });
    }

    triggerCapsule(text, isAlert = false) {
      if (!this.miniCapsule || !this.capsuleText) return;
      this.capsuleText.textContent = text;
      this.miniCapsule.classList.add('active-capsule');
      if (isAlert) {
        this.capsuleText.style.color = '#ef4444';
      } else {
        this.capsuleText.style.color = '#FFC915';
      }
      clearTimeout(this.capsuleTimeout);
      this.capsuleTimeout = setTimeout(() => {
        this.miniCapsule.classList.remove('active-capsule');
        this.capsuleText.textContent = '120Hz Ultra';
        this.capsuleText.style.color = '#FFC915';
      }, 2500);
    }

    startGame() {
      this.gameState = 'PLAYING';
      this.speed = 1.0;
      this.distance = 0;
      this.score = 0;
      this.coins = 0;
      this.obstacles = [];
      this.coinsList = [];
      this.particles = [];
      this.player.lane = 0;
      this.player.currentX = 0;
      this.player.y = 0;
      this.player.vy = 0;
      this.player.isJumping = false;
      this.player.isSliding = false;
      this.player.slideTimer = 0;
      this.player.invincibleTime = 0;
      this.spawnTimer = 0;

      if (this.modal) this.modal.classList.add('hidden');
      this.triggerCapsule('⚡ realmeow Surf Online!');

      this.lastTime = performance.now();
      requestAnimationFrame(this.loop.bind(this));
    }

    moveLane(dir) {
      const nextLane = this.player.lane + dir;
      if (nextLane >= -1 && nextLane <= 1) {
        this.player.lane = nextLane;
        this.createLaneShiftParticles();
      }
    }

    jump() {
      if (!this.player.isJumping) {
        this.player.isJumping = true;
        this.player.vy = 12.5;
        this.player.isSliding = false; // cancel slide
        this.sound.playJump();
        this.createJumpParticles();
      }
    }

    slide() {
      this.player.isSliding = true;
      this.player.slideTimer = 34; // frames
      // Fast drop if in air
      if (this.player.isJumping) {
        this.player.vy = -14;
      }
      this.sound.playSlide();
    }

    spawnEntities() {
      this.spawnTimer += this.speed;
      if (this.spawnTimer >= this.nextSpawnDistance) {
        this.spawnTimer = 0;
        this.nextSpawnDistance = 32 + Math.random() * 22;

        const randLane = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
        const roll = Math.random();

        if (roll < 0.42) {
          // Low Barrier (Must jump or switch lane)
          this.obstacles.push({
            type: 'BARRIER',
            lane: randLane,
            z: 0.05,
            width: 0.28,
            height: 0.16
          });
        } else if (roll < 0.72) {
          // High Cyber Beam (Must slide/duck or switch lane)
          this.obstacles.push({
            type: 'OVERHEAD',
            lane: randLane,
            z: 0.05,
            width: 0.32,
            height: 0.22
          });
        } else if (roll < 0.88) {
          // realme Rapid Train (Block lane)
          this.obstacles.push({
            type: 'TRAIN',
            lane: randLane,
            z: 0.05,
            width: 0.34,
            height: 0.48
          });
        } else {
          // Power-up: Super DART Boost Battery
          this.coinsList.push({
            type: 'DART_BOOST',
            lane: randLane,
            z: 0.05,
            collected: false
          });
        }

        // Spawn a coin strip in another lane
        const coinLane = randLane === 0 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        for (let i = 0; i < 4; i++) {
          this.coinsList.push({
            type: 'COIN',
            lane: coinLane,
            z: 0.05 - (i * 0.04),
            collected: false
          });
        }
      }
    }

    createJumpParticles() {
      for (let i = 0; i < 8; i++) {
        this.particles.push({
          x: this.getLaneCanvasX(this.player.currentX, 0.95),
          y: this.height - 75,
          vx: (Math.random() - 0.5) * 4,
          vy: -Math.random() * 3,
          color: '#FFC915',
          size: 3 + Math.random() * 3,
          life: 20
        });
      }
    }

    createLaneShiftParticles() {
      for (let i = 0; i < 5; i++) {
        this.particles.push({
          x: this.getLaneCanvasX(this.player.currentX, 0.95),
          y: this.height - 70,
          vx: (Math.random() - 0.5) * 3,
          vy: -Math.random() * 2,
          color: '#ffffff',
          size: 2 + Math.random() * 2,
          life: 15
        });
      }
    }

    createCoinSparkle(x, y) {
      for (let i = 0; i < 10; i++) {
        this.particles.push({
          x: x,
          y: y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          color: '#FFC915',
          size: 3 + Math.random() * 3,
          life: 24
        });
      }
    }

    update() {
      if (this.gameState !== 'PLAYING') return;

      // Increase speed gradually
      this.speed = Math.min(2.4, 1.0 + this.distance * 0.0006);
      this.distance += this.speed;
      this.score = Math.floor(this.distance * 1.5) + (this.coins * 25);

      if (this.scoreDisplay) this.scoreDisplay.textContent = this.score;
      if (this.coinsDisplay) this.coinsDisplay.textContent = this.coins;

      // Smooth horizontal lane transition
      const targetX = this.player.lane;
      this.player.currentX += (targetX - this.player.currentX) * 0.22;

      // Jump Physics
      if (this.player.isJumping) {
        this.player.y += this.player.vy;
        this.player.vy -= 0.72; // Gravity
        if (this.player.y <= 0) {
          this.player.y = 0;
          this.player.isJumping = false;
          this.player.vy = 0;
        }
      }

      // Slide Timer
      if (this.player.isSliding) {
        this.player.slideTimer--;
        if (this.player.slideTimer <= 0) {
          this.player.isSliding = false;
        }
      }

      // Run cycle animation
      this.player.runFrame += 0.2 * this.speed;

      // Power-up timer
      if (this.player.invincibleTime > 0) {
        this.player.invincibleTime--;
      }

      // Move track markers
      for (let i = 0; i < this.trackMarkers.length; i++) {
        this.trackMarkers[i] += 0.016 * this.speed;
        if (this.trackMarkers[i] > 1.0) {
          this.trackMarkers[i] -= 0.95;
        }
      }

      // Entity Spawning
      this.spawnEntities();

      // Update Obstacles
      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obs = this.obstacles[i];
        obs.z += 0.016 * this.speed;

        // Collision Check when close to player (z ~ 0.86 to 0.98)
        if (obs.z > 0.84 && obs.z < 0.98) {
          const laneDist = Math.abs(this.player.currentX - obs.lane);
          if (laneDist < 0.5) {
            let hit = false;
            if (obs.type === 'BARRIER') {
              // Can be jumped over (player.y > 35)
              if (this.player.y < 35) hit = true;
            } else if (obs.type === 'OVERHEAD') {
              // Can be ducked under (player.isSliding)
              if (!this.player.isSliding) hit = true;
            } else if (obs.type === 'TRAIN') {
              // Cannot be jumped or ducked
              hit = true;
            }

            if (hit) {
              if (this.player.invincibleTime > 0) {
                // Destroy obstacle in DART Boost mode
                this.createCoinSparkle(this.getLaneCanvasX(obs.lane, obs.z), this.getZtoY(obs.z));
                this.obstacles.splice(i, 1);
                continue;
              } else {
                this.gameOver();
                return;
              }
            }
          }
        }

        // Remove offscreen
        if (obs.z > 1.05) {
          this.obstacles.splice(i, 1);
        }
      }

      // Update Coins and Powerups
      for (let i = this.coinsList.length - 1; i >= 0; i--) {
        const item = this.coinsList[i];
        item.z += 0.016 * this.speed;

        // Magnet attraction if boost active
        if (this.player.invincibleTime > 0 && item.z > 0.5) {
          item.lane += (this.player.currentX - item.lane) * 0.2;
        }

        // Collect check
        if (!item.collected && item.z > 0.82 && item.z < 0.98) {
          const laneDist = Math.abs(this.player.currentX - item.lane);
          if (laneDist < 0.55) {
            item.collected = true;
            const coinX = this.getLaneCanvasX(item.lane, item.z);
            const coinY = this.getZtoY(item.z);

            if (item.type === 'COIN') {
              this.coins++;
              this.sound.playCoin();
              this.createCoinSparkle(coinX, coinY);
            } else if (item.type === 'DART_BOOST') {
              this.player.invincibleTime = 300; // ~5 seconds boost
              this.sound.playPowerup();
              this.triggerCapsule('⚡ 67W DART Boost ACTIVE!');
              this.createCoinSparkle(coinX, coinY);
            }
          }
        }

        // Remove offscreen or collected
        if (item.z > 1.05 || item.collected) {
          this.coinsList.splice(i, 1);
        }
      }

      // Update Particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) {
          this.particles.splice(i, 1);
        }
      }
    }

    gameOver() {
      this.gameState = 'GAMEOVER';
      this.sound.playCrash();
      this.triggerCapsule('💥 Game Over!', true);

      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('realmeow_highscore', this.highScore);
      }

      if (this.modal) {
        this.modal.classList.remove('hidden');
        if (this.modalTitle) this.modalTitle.textContent = 'GAME OVER';
        if (this.modalSubtitle) this.modalSubtitle.textContent = 'realmeow tersandung! Coba lagi dan raih skor tertinggi.';
        if (this.modalFinalScore) this.modalFinalScore.textContent = this.score;
        if (this.modalFinalCoins) this.modalFinalCoins.textContent = this.coins;
        if (this.btnPlay) this.btnPlay.textContent = 'MAIN LAGI ⚡';
      }
    }

    // --- Perspective Projection Helpers ---
    getZtoY(z) {
      // Non-linear projection to give authentic depth
      return this.horizonY + Math.pow(z, 1.45) * (this.height - this.horizonY);
    }

    getLaneCanvasX(lane, z) {
      const centerX = this.width / 2;
      const spread = Math.pow(z, 1.45) * 170; // track expands towards player
      return centerX + lane * spread;
    }

    // --- Drawing Routines ---
    drawSkyline() {
      const ctx = this.ctx;

      // Dark Futuristic Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, this.horizonY);
      skyGrad.addColorStop(0, '#05070c');
      skyGrad.addColorStop(0.65, '#0d1322');
      skyGrad.addColorStop(1, '#1b233a');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, this.width, this.horizonY);

      // Distant Stars & Glow
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 20; i++) {
        const sx = (i * 37) % this.width;
        const sy = (i * 19) % (this.horizonY - 30);
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Skyline Buildings
      this.cityScenery.forEach((b) => {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, this.horizonY - b.h, b.w, b.h);

        if (b.hasLights) {
          ctx.fillStyle = b.lightColor;
          ctx.fillRect(b.x + 3, this.horizonY - b.h + 8, 3, 3);
          ctx.fillRect(b.x + b.w - 6, this.horizonY - b.h + 16, 3, 3);
        }
      });

      // Neon Billboard: "DARE TO LEAP"
      ctx.fillStyle = '#FFC915';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#FFC915';
      ctx.shadowBlur = 8;
      ctx.fillText('DARE TO LEAP', this.width / 2, this.horizonY - 24);
      ctx.shadowBlur = 0;
    }

    drawTrack() {
      const ctx = this.ctx;
      const hY = this.horizonY;
      const bY = this.height;

      // Ground plane
      const groundGrad = ctx.createLinearGradient(0, hY, 0, bY);
      groundGrad.addColorStop(0, '#10141f');
      groundGrad.addColorStop(0.5, '#0b0d14');
      groundGrad.addColorStop(1, '#050608');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, hY, this.width, bY - hY);

      // Track Bed
      const leftH = this.getLaneCanvasX(-1.5, 0.05);
      const rightH = this.getLaneCanvasX(1.5, 0.05);
      const leftB = this.getLaneCanvasX(-1.5, 1.0);
      const rightB = this.getLaneCanvasX(1.5, 1.0);

      ctx.beginPath();
      ctx.moveTo(leftH, hY);
      ctx.lineTo(rightH, hY);
      ctx.lineTo(rightB, bY);
      ctx.lineTo(leftB, bY);
      ctx.closePath();
      ctx.fillStyle = '#151926';
      ctx.fill();

      // Moving Railway Ties
      this.trackMarkers.forEach((z) => {
        if (z < 0.05 || z > 1.0) return;
        const tieY = this.getZtoY(z);
        const lX = this.getLaneCanvasX(-1.5, z);
        const rX = this.getLaneCanvasX(1.5, z);
        const thickness = Math.max(1.5, z * 5);

        ctx.strokeStyle = '#272d40';
        ctx.lineWidth = thickness;
        ctx.beginPath();
        ctx.moveTo(lX, tieY);
        ctx.lineTo(rX, tieY);
        ctx.stroke();
      });

      // Rails (4 Rail Lines separating 3 lanes)
      const railPositions = [-1.5, -0.5, 0.5, 1.5];
      railPositions.forEach((pos) => {
        const topX = this.getLaneCanvasX(pos, 0.05);
        const botX = this.getLaneCanvasX(pos, 1.0);

        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(topX, hY);
        ctx.lineTo(botX, bY);
        ctx.stroke();

        // Glowing Yellow Edge Rails
        if (pos === -1.5 || pos === 1.5) {
          ctx.strokeStyle = '#FFC915';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(topX, hY);
          ctx.lineTo(botX, bY);
          ctx.stroke();
        }
      });
    }

    drawObstacles() {
      const ctx = this.ctx;

      // Sort obstacles by z so distant ones are drawn first
      const sorted = [...this.obstacles].sort((a, b) => a.z - b.z);

      sorted.forEach((obs) => {
        const x = this.getLaneCanvasX(obs.lane, obs.z);
        const y = this.getZtoY(obs.z);
        const scale = Math.pow(obs.z, 1.35);
        const w = 75 * scale;
        const h = 85 * scale;

        ctx.save();
        ctx.translate(x, y);

        if (obs.type === 'BARRIER') {
          // Roadblock / Hurdle
          const barH = 34 * scale;
          const barW = 60 * scale;

          // Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.beginPath();
          ctx.ellipse(0, 0, barW / 1.8, 6 * scale, 0, 0, Math.PI * 2);
          ctx.fill();

          // Barrier Posts
          ctx.fillStyle = '#64748B';
          ctx.fillRect(-barW / 2 + 4 * scale, -barH, 6 * scale, barH);
          ctx.fillRect(barW / 2 - 10 * scale, -barH, 6 * scale, barH);

          // Striped Hazard Bar
          ctx.fillStyle = '#FFC915';
          ctx.fillRect(-barW / 2, -barH + 4 * scale, barW, 14 * scale);
          ctx.fillStyle = '#000000';
          for (let s = -barW / 2 + 5; s < barW / 2; s += 12 * scale) {
            ctx.beginPath();
            ctx.moveTo(s, -barH + 4 * scale);
            ctx.lineTo(s + 6 * scale, -barH + 4 * scale);
            ctx.lineTo(s + 2 * scale, -barH + 18 * scale);
            ctx.lineTo(s - 4 * scale, -barH + 18 * scale);
            ctx.fill();
          }
        } else if (obs.type === 'OVERHEAD') {
          // High Cyber Beam (must slide)
          const beamW = 75 * scale;
          const beamH = 18 * scale;
          const clearance = 42 * scale; // gap under beam

          // Vertical Supports
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 3 * scale;
          ctx.beginPath();
          ctx.moveTo(-beamW / 2, 0);
          ctx.lineTo(-beamW / 2, -clearance - beamH);
          ctx.moveTo(beamW / 2, 0);
          ctx.lineTo(beamW / 2, -clearance - beamH);
          ctx.stroke();

          // Cyber Bar
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2 * scale;
          ctx.fillRect(-beamW / 2, -clearance - beamH, beamW, beamH);
          ctx.strokeRect(-beamW / 2, -clearance - beamH, beamW, beamH);

          // Caution Neon Text
          ctx.fillStyle = '#38bdf8';
          ctx.font = `bold ${Math.max(6, Math.floor(8 * scale))}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('⚡ DUCK', 0, -clearance - beamH / 3);
        } else if (obs.type === 'TRAIN') {
          // Futuristic realme Maglev Train
          const trainW = 68 * scale;
          const trainH = 95 * scale;

          // Train Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.6)';
          ctx.fillRect(-trainW / 2, -5, trainW, 10);

          // Train Front Face
          const trainGrad = ctx.createLinearGradient(0, -trainH, 0, 0);
          trainGrad.addColorStop(0, '#1e293b');
          trainGrad.addColorStop(0.7, '#0f172a');
          trainGrad.addColorStop(1, '#020617');
          ctx.fillStyle = trainGrad;
          ctx.fillRect(-trainW / 2, -trainH, trainW, trainH);

          // Yellow Accent Lines
          ctx.fillStyle = '#FFC915';
          ctx.fillRect(-trainW / 2, -trainH * 0.45, trainW, 6 * scale);

          // Train Windshield
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(-trainW / 2 + 8 * scale, -trainH + 12 * scale, trainW - 16 * scale, 24 * scale);

          // Headlights
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#FFC915';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(-trainW / 3, -16 * scale, 5 * scale, 0, Math.PI * 2);
          ctx.arc(trainW / 3, -16 * scale, 5 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        ctx.restore();
      });
    }

    drawCollectibles() {
      const ctx = this.ctx;
      this.coinsList.forEach((item) => {
        if (item.collected || item.z < 0.05 || item.z > 1.0) return;
        const x = this.getLaneCanvasX(item.lane, item.z);
        const y = this.getZtoY(item.z);
        const scale = Math.pow(item.z, 1.35);

        ctx.save();
        ctx.translate(x, y);

        if (item.type === 'COIN') {
          // 3D Spinning Golden Coin
          const coinR = 12 * scale;
          const spin = Math.sin(this.distance * 0.15 + item.z * 10);
          const spinW = Math.max(2, coinR * Math.abs(spin));

          ctx.fillStyle = '#FFC915';
          ctx.beginPath();
          ctx.ellipse(0, -18 * scale, spinW, coinR, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#FFA000';
          ctx.lineWidth = 2 * scale;
          ctx.stroke();

          // Coin Core 'R' (realme)
          if (spinW > coinR * 0.5) {
            ctx.fillStyle = '#000000';
            ctx.font = `bold ${Math.max(6, Math.floor(10 * scale))}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('r', 0, -18 * scale);
          }
        } else if (item.type === 'DART_BOOST') {
          // DART Battery Power-up
          const bW = 20 * scale;
          const bH = 28 * scale;

          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-bW / 2, -bH - 12 * scale, bW, bH);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(-bW / 2 + 2, -bH - 10 * scale, bW - 4, bH - 4);

          // Lightning Bolt Symbol
          ctx.fillStyle = '#FFC915';
          ctx.beginPath();
          ctx.moveTo(2 * scale, -bH - 8 * scale);
          ctx.lineTo(-4 * scale, -bH + 2 * scale);
          ctx.lineTo(1 * scale, -bH + 2 * scale);
          ctx.lineTo(-2 * scale, -bH + 12 * scale);
          ctx.lineTo(5 * scale, -bH);
          ctx.lineTo(0, -bH);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      });
    }

    // --- Vector Render of realme Mascot "realmeow" ---
    drawRealmeow() {
      const ctx = this.ctx;
      const x = this.getLaneCanvasX(this.player.currentX, 0.95);
      const groundY = this.height - 70;
      const y = groundY - this.player.y;

      ctx.save();
      ctx.translate(x, y);

      // Shadow on Ground (scales with jump)
      const shadowScale = Math.max(0.3, 1 - this.player.y / 180);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(0, groundY - y, 22 * shadowScale, 7 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Invincible / DART Boost Aura
      if (this.player.invincibleTime > 0) {
        ctx.strokeStyle = '#FFC915';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#FFC915';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(0, -28, 42, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Drawing Pose depending on state
      if (this.player.isSliding) {
        // --- SLIDING POSE ---
        // Yellow Skateboard / Slider
        ctx.fillStyle = '#FFC915';
        ctx.fillRect(-28, -6, 56, 8);
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-20, 2, 4, 0, Math.PI * 2);
        ctx.arc(20, 2, 4, 0, Math.PI * 2);
        ctx.fill();

        // Crouched Body
        ctx.fillStyle = '#111827';
        ctx.fillRect(-16, -22, 32, 16);

        // Head low
        ctx.fillStyle = '#FFC915';
        ctx.beginPath();
        ctx.arc(6, -24, 13, 0, Math.PI * 2);
        ctx.fill();

        // Visor
        ctx.fillStyle = '#0a0a0c';
        ctx.fillRect(8, -27, 12, 6);

        // Slide Sparks Particles
        if (Math.random() > 0.4) {
          this.particles.push({
            x: x - 20,
            y: groundY - 2,
            vx: -3 - Math.random() * 3,
            vy: -Math.random() * 2,
            color: '#FFC915',
            size: 2.5,
            life: 12
          });
        }
      } else {
        // --- RUNNING / JUMPING POSE ---
        const bobY = this.player.isJumping ? 0 : Math.sin(this.player.runFrame * 2) * 3;
        const legSwing = this.player.isJumping ? 0 : Math.sin(this.player.runFrame) * 12;

        // Cat Tail (swings behind)
        ctx.strokeStyle = '#FFC915';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-10, -25 + bobY);
        ctx.quadraticCurveTo(-24, -38 + Math.sin(this.player.runFrame) * 6, -18, -48);
        ctx.stroke();
        // Tail Tip (Black)
        ctx.strokeStyle = '#111827';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-20, -42);
        ctx.lineTo(-18, -48);
        ctx.stroke();

        // Legs (Tech suit legs & yellow sneakers)
        // Left Leg
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(-12, -18 + bobY, 7, 18 + legSwing);
        ctx.fillStyle = '#FFC915'; // Shoe
        ctx.fillRect(-14, 0 + bobY + legSwing, 10, 6);

        // Right Leg
        ctx.fillStyle = '#111827';
        ctx.fillRect(5, -18 + bobY, 7, 18 - legSwing);
        ctx.fillStyle = '#FFC915'; // Shoe
        ctx.fillRect(3, 0 + bobY - legSwing, 10, 6);

        // Torso / Sport Hoodie (Black with realme yellow accents)
        ctx.fillStyle = '#111827';
        ctx.beginPath();
        ctx.roundRect(-16, -42 + bobY, 32, 28, 8);
        ctx.fill();

        // Yellow Accent Stripe & Chest Logo
        ctx.fillStyle = '#FFC915';
        ctx.fillRect(-16, -34 + bobY, 4, 18);
        ctx.fillRect(12, -34 + bobY, 4, 18);
        ctx.beginPath();
        ctx.arc(0, -30 + bobY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Arms
        const armSwing = this.player.isJumping ? -15 : -legSwing;
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(-22, -40 + bobY + armSwing * 0.5, 6, 20);
        ctx.fillRect(16, -40 + bobY - armSwing * 0.5, 6, 20);

        // realmeow Cat Head (Signature Yellow Cat)
        ctx.fillStyle = '#FFC915';
        ctx.beginPath();
        ctx.arc(0, -56 + bobY, 18, 0, Math.PI * 2);
        ctx.fill();

        // Cat Ears
        // Left Ear
        ctx.fillStyle = '#FFC915';
        ctx.beginPath();
        ctx.moveTo(-16, -64 + bobY);
        ctx.lineTo(-18, -80 + bobY);
        ctx.lineTo(-4, -70 + bobY);
        ctx.closePath();
        ctx.fill();
        // Left Ear Inner
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.moveTo(-14, -65 + bobY);
        ctx.lineTo(-16, -76 + bobY);
        ctx.lineTo(-6, -69 + bobY);
        ctx.closePath();
        ctx.fill();

        // Right Ear
        ctx.fillStyle = '#FFC915';
        ctx.beginPath();
        ctx.moveTo(16, -64 + bobY);
        ctx.lineTo(18, -80 + bobY);
        ctx.lineTo(4, -70 + bobY);
        ctx.closePath();
        ctx.fill();
        // Right Ear Inner
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.moveTo(14, -65 + bobY);
        ctx.lineTo(16, -76 + bobY);
        ctx.lineTo(6, -69 + bobY);
        ctx.closePath();
        ctx.fill();

        // Futuristic Black Cyber Visor / Laser Goggles
        ctx.fillStyle = '#0a0a0c';
        ctx.beginPath();
        ctx.roundRect(-15, -62 + bobY, 30, 11, 4);
        ctx.fill();

        // Glowing Laser Slit Eyes in Visor
        ctx.fillStyle = '#FFC915';
        ctx.shadowColor = '#FFC915';
        ctx.shadowBlur = 4;
        ctx.fillRect(-11, -58 + bobY, 8, 3);
        ctx.fillRect(3, -58 + bobY, 8, 3);
        ctx.shadowBlur = 0;

        // Cute Cat Snout / Nose
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(0, -48 + bobY, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    drawParticles() {
      const ctx = this.ctx;
      this.particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    render() {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.drawSkyline();
      this.drawTrack();
      this.drawObstacles();
      this.drawCollectibles();
      this.drawRealmeow();
      this.drawParticles();
    }

    loop() {
      if (this.gameState === 'PLAYING') {
        this.update();
        this.render();
        requestAnimationFrame(this.loop.bind(this));
      }
    }
  }

  // Auto-init game on DOM load
  window.addEventListener('DOMContentLoaded', () => {
    window.realmeowGameInstance = new RealmeowGame();
  });
})();
