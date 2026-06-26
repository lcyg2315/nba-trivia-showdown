/**
 * NBA Trivia Showdown - Basketball Engine v5
 *
 * ZERO setTimeout usage. Everything is driven by frame counters in the
 * requestAnimationFrame loop, so there are NO race conditions.
 *
 * States:
 *   'idle'     – players walk around, ball dribbles
 *   'scoring'  – bezier arc to hoop, particles, net jostle, then auto-reset
 */

class BasketballGame {
  constructor(canvasId, onScoreCallback) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) { console.error('Canvas not found:', canvasId); return; }
    this.ctx = this.canvas.getContext('2d');
    this.onScore = onScoreCallback || (() => {});
    this.W = 800;
    this.H = 360;
    this.canvas.width = this.W;
    this.canvas.height = this.H;
    this.floor = 300;

    // Hoops
    this.hoopRightX = 700;
    this.hoopLeftX = 100;
    this.hoopY = 150;
    this.rimW = 46;

    // Ball state
    this.ballX = 200;
    this.ballY = this.floor - 10;
    this.ballR = 9;

    // Players
    this.homeX = 200;
    this.awayX = 460;
    this.homeDir = 1;
    this.awayDir = -1;
    this.homeRun = 0;
    this.awayRun = 0;

    // Game state
    this.state = 'idle';      // 'idle' | 'possession' | 'scoring'
    this.dribbleT = 0;        // monotonic timer for dribble & walk
    this.carrier = 'home';    // 'home' | 'away' — who has the ball in idle

    // Possession transition state
    this.possT = 0;
    this.possDur = 18;        // frames for ball to zip to shooter (~0.3s)
    this.possBallSx = 0;
    this.possBallSy = 0;

    // Scoring arc state
    this.arcT = 0;            // current frame in arc
    this.arcDur = 40;         // total frames for arc
    this.arcSx = 0; this.arcSy = 0;
    this.arcCx = 0; this.arcCy = 0;
    this.arcEx = 0; this.arcEy = 0;
    this.arcScored = false;
    this.arcIsUser = false;
    this.postScoreT = 0;      // frames to wait after score before resetting
    this.postScoreDur = 45;   // ~0.75s at 60fps

    // Particles
    this.particles = [];

    // Nets (simple spring meshes)
    this.netNodesRight = this.buildNet(this.hoopRightX);
    this.netNodesLeft = this.buildNet(this.hoopLeftX);

    // Audio
    this.audioCtx = null;
    this.muted = false;

    // Pending score request (queued if already scoring)
    this.pendingScore = null;

    // Start loop
    this.lastTime = performance.now();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  // ─── Net ────────────────────────────────────────────────────────────

  buildNet(hoopX) {
    const rows = 4, cols = 5, nodes = [];
    for (let r = 0; r < rows; r++) {
      nodes[r] = [];
      for (let c = 0; c < cols; c++) {
        const frac = c / (cols - 1);
        const narrow = r * 0.1;
        const x = (hoopX - this.rimW / 2)
                  + (this.rimW * (1 - narrow)) * frac
                  + (this.rimW * narrow / 2);
        const y = this.hoopY + r * 10;
        nodes[r][c] = { x, y, ox: x, oy: y, vx: 0, vy: 0 };
      }
    }
    return nodes;
  }

  // ─── Audio ──────────────────────────────────────────────────────────

  ensureAudio() {
    if (!this.audioCtx) {
      try { this.audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  playSwoosh() {
    if (this.muted || !this.audioCtx) return;
    try {
      const c = this.audioCtx, now = c.currentTime;
      const buf = c.createBuffer(1, c.sampleRate * 0.25, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1);
      const src = c.createBufferSource(); src.buffer = buf;
      const flt = c.createBiquadFilter();
      flt.type = 'bandpass';
      flt.frequency.setValueAtTime(1200, now);
      flt.frequency.exponentialRampToValueAtTime(300, now + 0.25);
      flt.Q.value = 1.5;
      const g = c.createGain();
      g.gain.setValueAtTime(0.2, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      src.connect(flt); flt.connect(g); g.connect(c.destination);
      src.start(); src.stop(now + 0.25);
    } catch(e) {}
  }

  playBounce() {
    if (this.muted || !this.audioCtx) return;
    try {
      const c = this.audioCtx, now = c.currentTime;
      const o = c.createOscillator(), g = c.createGain();
      o.frequency.setValueAtTime(120, now);
      o.frequency.exponentialRampToValueAtTime(55, now + 0.08);
      g.gain.setValueAtTime(0.1, now);
      g.gain.linearRampToValueAtTime(0, now + 0.08);
      o.connect(g); g.connect(c.destination);
      o.start(); o.stop(now + 0.08);
    } catch(e) {}
  }

  playSynthSound(type) {
    this.ensureAudio();
    if (type === 'swoosh' || type === 'swish') { this.playSwoosh(); return; }
    if (type === 'bounce') { this.playBounce(); return; }
    if (type === 'click') {
      if (this.muted || !this.audioCtx) return;
      try {
        const c = this.audioCtx, now = c.currentTime;
        const o = c.createOscillator(), g = c.createGain();
        o.frequency.value = 600;
        g.gain.setValueAtTime(0.04, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        o.connect(g); g.connect(c.destination);
        o.start(); o.stop(now + 0.05);
      } catch(e) {}
    }
  }

  // ─── Public API ─────────────────────────────────────────────────────

  triggerCorrect() {
    this.streak = (this.streak || 0) + 1;
    this.queueScore(true);
  }

  triggerIncorrect() {
    this.streak = 0;
    this.queueScore(false);
  }

  queueScore(isUser) {
    if (this.state === 'scoring' || this.state === 'possession') {
      // Already active — queue it so it fires after reset
      this.pendingScore = isUser;
      return;
    }
    this.startPossessionPhase(isUser);
  }

  startPossessionPhase(isUser) {
    this.ensureAudio();
    this.arcIsUser = isUser;
    this.state = 'possession';
    this.possT = 0;
    this.possDur = 18; // ~0.3 seconds
    this.possBallSx = this.ballX;
    this.possBallSy = this.ballY;

    this.carrier = isUser ? 'home' : 'away';

    // Face players correctly
    if (isUser) {
      this.homeDir = 1;
    } else {
      this.awayDir = -1;
    }

    this.playSwoosh();
  }

  startScoreArc(isUser) {
    this.ensureAudio();

    const shooterX = isUser ? this.homeX : this.awayX;
    const sx = shooterX;
    const sy = this.floor - 35;

    // Target the appropriate hoop based on correct/incorrect answer
    const hoopTargetX = isUser ? this.hoopRightX : this.hoopLeftX;
    const ex = hoopTargetX + (isUser ? -3 : 3);
    const ey = this.hoopY;

    const mx = (sx + ex) / 2;
    const arcH = Math.max(80, Math.abs(ex - sx) * 0.5);

    this.arcSx = sx; this.arcSy = sy;
    this.arcCx = mx; this.arcCy = Math.min(sy, ey) - arcH;
    this.arcEx = ex; this.arcEy = ey;
    this.arcT = 0;
    this.arcDur = 40;
    this.arcScored = false;
    this.arcIsUser = isUser;
    this.postScoreT = 0;
    this.state = 'scoring';

    this.playSwoosh();
  }

  resetPositions() {
    this.homeX = 200;
    this.awayX = 460;
    this.homeDir = 1;
    this.awayDir = -1;
    this.homeRun = 0;
    this.awayRun = 0;
    this.ballX = 200;
    this.ballY = this.floor - 10;
    this.carrier = 'home';
    this.dribbleT = 0;
    this.state = 'idle';
    this.arcScored = false;
    this.pendingScore = null;
    this.streak = 0;
    this.netNodesRight = this.buildNet(this.hoopRightX);
    this.netNodesLeft = this.buildNet(this.hoopLeftX);
  }

  // ─── Main Loop ──────────────────────────────────────────────────────

  loop(now) {
    const dt = Math.min((now - this.lastTime) / 16.667, 3);
    this.lastTime = now;

    this.update(dt);
    this.draw();

    requestAnimationFrame(this.loop);
  }

  update(dt) {
    if (this.state === 'scoring') {
      this.updateScoring(dt);
    } else if (this.state === 'possession') {
      this.updatePossession(dt);
    } else {
      this.updateIdle(dt);
    }

    if (this.streak >= 3) {
      this.spawnFireParticle();
    }

    this.updateParticles(dt);
    this.updateNet(dt, this.netNodesRight);
    this.updateNet(dt, this.netNodesLeft);
  }

  // ─── Idle State ─────────────────────────────────────────────────────

  updateIdle(dt) {
    this.dribbleT += dt;

    // Carrier walks back and forth
    const cx = this.carrier === 'home' ? this.homeX : this.awayX;
    const targetZone = 400 + Math.sin(this.dribbleT * 0.15) * 140;
    const diff = targetZone - cx;
    const speed = Math.sign(diff) * Math.min(Math.abs(diff) * 0.03, 1.5) * dt;

    if (this.carrier === 'home') {
      this.homeX += speed;
      this.homeX = Math.max(60, Math.min(580, this.homeX));
      this.homeDir = speed >= 0 ? 1 : -1;
      this.homeRun += Math.abs(speed) * 0.2;
    } else {
      this.awayX += speed;
      this.awayX = Math.max(60, Math.min(580, this.awayX));
      this.awayDir = speed >= 0 ? 1 : -1;
      this.awayRun += Math.abs(speed) * 0.2;
    }

    // Defender shadows
    const defTarget = (this.carrier === 'home' ? this.homeX : this.awayX) + 60;
    if (this.carrier === 'home') {
      const dd = defTarget - this.awayX;
      this.awayX += Math.sign(dd) * Math.min(Math.abs(dd) * 0.04, 1.8) * dt;
      this.awayX = Math.max(60, Math.min(650, this.awayX));
      this.awayDir = -1;
      this.awayRun += Math.abs(dd * 0.02) * dt;
    } else {
      const dd = defTarget - this.homeX;
      this.homeX += Math.sign(dd) * Math.min(Math.abs(dd) * 0.04, 1.8) * dt;
      this.homeX = Math.max(60, Math.min(650, this.homeX));
      this.homeDir = -1;
      this.homeRun += Math.abs(dd * 0.02) * dt;
    }

    // Ball follows carrier with dribble bounce
    const ownerX = this.carrier === 'home' ? this.homeX : this.awayX;
    const ownerDir = this.carrier === 'home' ? this.homeDir : this.awayDir;
    const bounce = Math.sin(this.dribbleT * 4.5) * 8;
    this.ballX = ownerX + 12 * ownerDir;
    this.ballY = this.floor - 10 + bounce;

    // Dribble sound at bottom of bounce
    if (Math.sin(this.dribbleT * 4.5) > 0.97) {
      this.playBounce();
    }
  }

  // ─── Possession Transition State ────────────────────────────────────

  updatePossession(dt) {
    this.possT += dt;
    const p = Math.min(this.possT / this.possDur, 1);

    // Stop walking/running - no changes to player positions here
    // Turn the shooter to face their hoop:
    if (this.arcIsUser) {
      this.homeDir = 1;  // Home player shoots right
    } else {
      this.awayDir = -1; // Away player shoots left
    }

    // Target hand positions
    const shooterX = this.arcIsUser ? this.homeX : this.awayX;
    const shooterDir = this.arcIsUser ? this.homeDir : this.awayDir;
    const targetX = shooterX + 12 * shooterDir;
    const targetY = this.floor - 15;

    // Linearly interpolate ball from possBallSx/y to targetX/y
    this.ballX = this.possBallSx + (targetX - this.possBallSx) * p;
    this.ballY = this.possBallSy + (targetY - this.possBallSy) * p;

    if (p >= 1) {
      // Transition to scoring (arc shot)
      this.startScoreArc(this.arcIsUser);
    }
  }

  // ─── Scoring State ──────────────────────────────────────────────────

  updateScoring(dt) {
    if (!this.arcScored) {
      // Phase 1: ball arc in flight
      this.arcT += dt;
      const p = Math.min(this.arcT / this.arcDur, 1);
      const u = 1 - p;

      // Quadratic bezier
      this.ballX = u*u*this.arcSx + 2*u*p*this.arcCx + p*p*this.arcEx;
      this.ballY = u*u*this.arcSy + 2*u*p*this.arcCy + p*p*this.arcEy;

      if (p >= 1) {
        // Ball arrived at rim — SCORE!
        this.arcScored = true;
        this.postScoreT = 0;

        this.playSwoosh();

        // Particles
        this.spawnParticles(this.arcEx, this.arcEy, this.arcIsUser);

        // Jostle the correct net
        const net = this.arcIsUser ? this.netNodesRight : this.netNodesLeft;
        for (let r = 1; r < net.length; r++) {
          for (let c = 0; c < net[r].length; c++) {
            net[r][c].vy += 7;
            net[r][c].vx += (Math.random() - 0.5) * 5;
          }
        }

        // Score callback
        this.onScore(this.arcIsUser);
      }
    } else {
      // Phase 2: post-score pause (ball drops through net)
      this.postScoreT += dt;
      this.ballY += 2.5 * dt; // ball drifts down through net

      if (this.postScoreT >= this.postScoreDur) {
        // Check for queued score
        const pending = this.pendingScore;
        this.resetPositions();

        if (pending !== null) {
          this.startPossessionPhase(pending);
        }
      }
    }
  }

  // ─── Particles ──────────────────────────────────────────────────────

  spawnParticles(x, y, isUser) {
    const colors = isUser
      ? ['#ffd700', '#00f0ff', '#ffffff']
      : ['#ff4444', '#ff8800', '#ffffff'];
    for (let i = 0; i < 30; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 2 + Math.random() * 4;
      this.particles.push({
        x, y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd - 2,
        r: 2 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        fade: 0.02 + Math.random() * 0.02
      });
    }
  }

  spawnFireParticle() {
    this.particles.push({
      x: this.ballX + (Math.random() - 0.5) * this.ballR * 1.5,
      y: this.ballY + (Math.random() - 0.5) * this.ballR * 1.5,
      vx: (Math.random() - 0.5) * 0.8,
      vy: -1 - Math.random() * 1.5,
      r: 3 + Math.random() * 4,
      color: Math.random() > 0.3 ? '#ff4400' : '#ffcc00',
      alpha: 1,
      fade: 0.04 + Math.random() * 0.04,
      isFire: true
    });
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      
      if (p.isFire) {
        // Fire particles float upwards
        p.vy -= 0.04 * dt;
      } else {
        // Regular score splash particles fall under gravity
        p.vy += 0.08 * dt;
      }
      
      p.alpha -= p.fade * dt;
      if (p.alpha <= 0) this.particles.splice(i, 1);
    }
  }

  // ─── Net ────────────────────────────────────────────────────────────

  updateNet(dt, nodes) {
    for (let r = 1; r < nodes.length; r++) {
      for (let c = 0; c < nodes[r].length; c++) {
        const n = nodes[r][c];
        // Spring back to rest
        n.vx += 0.18 * (n.ox - n.x) * dt;
        n.vy += (0.18 * (n.oy - n.y) + 0.15) * dt;
        // Spring to node above
        const above = nodes[r - 1][c];
        const dx = above.x - n.x, dy = above.y - n.y;
        const dist = Math.hypot(dx, dy) || 0.001;
        const stretch = dist - 10;
        n.vx += (dx / dist) * stretch * 0.35 * dt;
        n.vy += (dy / dist) * stretch * 0.35 * dt;
        // Integrate
        n.x += n.vx * dt;
        n.y += n.vy * dt;
        n.vx *= 0.82;
        n.vy *= 0.82;
      }
    }
  }

  // ─── Drawing ────────────────────────────────────────────────────────

  draw() {
    const c = this.ctx;
    c.clearRect(0, 0, this.W, this.H);
    this.drawCourt(c);
    this.drawSingleNet(c, this.netNodesLeft);
    this.drawSingleNet(c, this.netNodesRight);
    this.drawSingleHoop(c, true);  // Left Hoop
    this.drawSingleHoop(c, false); // Right Hoop
    this.drawPlayer(c, this.homeX, this.floor, '#ffd700', 'rgba(255,215,0,0.5)', this.homeDir, this.homeRun, '23', true);
    this.drawPlayer(c, this.awayX, this.floor, '#ff4444', 'rgba(255,68,68,0.5)', this.awayDir, this.awayRun, '34', false);
    this.drawBall(c);
    this.drawParticles(c);
  }

  drawCourt(c) {
    c.fillStyle = '#060a14';
    c.fillRect(0, 0, this.W, this.H);

    const fg = c.createLinearGradient(0, this.floor, 0, this.H);
    fg.addColorStop(0, '#0a1020');
    fg.addColorStop(1, '#0e172e');
    c.fillStyle = fg;
    c.fillRect(0, this.floor, this.W, this.H - this.floor);

    // Neon floor line
    c.save();
    c.shadowColor = '#00f0ff'; c.shadowBlur = 10;
    c.strokeStyle = '#00f0ff'; c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(0, this.floor); c.lineTo(this.W, this.floor); c.stroke();
    c.restore();

    // Perspective grid
    c.strokeStyle = 'rgba(0,240,255,0.06)'; c.lineWidth = 1;
    for (let x = 0; x < this.W; x += 50) {
      c.beginPath();
      c.moveTo(x, this.floor);
      c.lineTo(x + (x - this.W / 2) * 0.15, this.H);
      c.stroke();
    }
  }

  drawSingleHoop(c, isLeft) {
    const hoopX = isLeft ? this.hoopLeftX : this.hoopRightX;
    const poleX = isLeft ? 30 : this.W - 30;
    const extX = isLeft ? hoopX - this.rimW / 2 - 12 : hoopX + this.rimW / 2 + 12;
    const bbX = isLeft ? 35 : this.W - 45;

    // Pole
    c.strokeStyle = '#374151'; c.lineWidth = 8;
    c.beginPath();
    c.moveTo(poleX, this.floor);
    c.lineTo(poleX, this.hoopY - 20);
    c.lineTo(extX, this.hoopY - 20);
    c.stroke();

    // Backboard
    c.save();
    c.shadowColor = '#00f0ff'; c.shadowBlur = 10;
    c.strokeStyle = '#00f0ff'; c.lineWidth = 3;
    c.strokeRect(bbX, this.hoopY - 50, 10, 80);
    c.restore();

    // Rim
    c.save();
    c.shadowColor = '#ff6b00'; c.shadowBlur = 12;
    c.strokeStyle = '#ff6b00'; c.lineWidth = 3.5;
    c.beginPath();
    c.moveTo(hoopX - this.rimW / 2, this.hoopY);
    c.lineTo(hoopX + this.rimW / 2, this.hoopY);
    c.stroke();
    c.restore();
  }

  drawSingleNet(c, nodes) {
    if (!nodes) return;
    c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 1.2;
    for (let r = 0; r < nodes.length - 1; r++) {
      for (let col = 0; col < nodes[r].length; col++) {
        const a = nodes[r][col];
        const b = nodes[r + 1][col];
        c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
        if (col < nodes[r].length - 1) {
          const br = nodes[r + 1][col + 1];
          c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(br.x, br.y); c.stroke();
        }
      }
    }
    const bot = nodes[nodes.length - 1];
    c.beginPath(); c.moveTo(bot[0].x, bot[0].y);
    for (let col = 1; col < bot.length; col++) c.lineTo(bot[col].x, bot[col].y);
    c.stroke();
  }

  drawBall(c) {
    c.save();
    if (this.streak >= 3) {
      c.shadowColor = '#ff5500';
      c.shadowBlur = 24;
    } else {
      c.shadowColor = '#ff6b00';
      c.shadowBlur = 14;
    }
    c.fillStyle = '#ff6b00';
    c.beginPath(); c.arc(this.ballX, this.ballY, this.ballR, 0, Math.PI * 2); c.fill();
    c.shadowBlur = 0;
    c.strokeStyle = '#2d1500'; c.lineWidth = 1.2;
    c.beginPath(); c.arc(this.ballX, this.ballY, this.ballR, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(this.ballX - this.ballR * 0.5, this.ballY, this.ballR * 0.8, -0.5, 0.5); c.stroke();
    c.beginPath(); c.arc(this.ballX + this.ballR * 0.5, this.ballY, this.ballR * 0.8, Math.PI - 0.5, Math.PI + 0.5); c.stroke();
    c.restore();
  }

  drawPlayer(c, px, py, color, glow, dir, runCycle, num, isHome) {
    c.save();
    c.shadowColor = glow; c.shadowBlur = 10;

    const headY = py - 50;
    const shoulderY = py - 40;
    const hipY = py - 22;

    // Determine if this player is shooting
    const isShooting = this.state === 'scoring' &&
      ((this.arcIsUser && isHome) || (!this.arcIsUser && !isHome));

    // Head
    c.fillStyle = '#ffffff';
    c.beginPath(); c.arc(px, headY, 7, 0, Math.PI * 2); c.fill();

    // Headband
    c.fillStyle = color;
    c.fillRect(px - 7, headY - 5, 14, 3);

    // Torso (jersey)
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(px - 7, shoulderY); c.lineTo(px + 7, shoulderY);
    c.lineTo(px + 5, hipY); c.lineTo(px - 5, hipY);
    c.closePath(); c.fill();

    // Shorts
    c.fillStyle = isHome ? '#002d62' : '#fff';
    c.fillRect(px - 5, hipY, 10, 8);

    // Jersey number
    c.fillStyle = isHome ? '#002d62' : color;
    c.font = 'bold 8px sans-serif'; c.textAlign = 'center';
    c.fillText(num, px, hipY - 2);

    c.strokeStyle = '#fff'; c.lineWidth = 3; c.lineCap = 'round';
    c.shadowBlur = 0;

    // Legs
    const kneeY = py - 11;
    let lx, ly, rx, ry;
    if (isShooting) {
      lx = px - 6; ly = py; rx = px + 6; ry = py;
    } else {
      const s = Math.sin(runCycle) * 8;
      lx = px - 4 + s; ly = py - Math.abs(Math.sin(runCycle * 2)) * 4;
      rx = px + 4 - s; ry = py - Math.abs(Math.cos(runCycle * 2)) * 4;
    }
    c.beginPath(); c.moveTo(px - 4, hipY + 6); c.lineTo(px - 4, kneeY); c.lineTo(lx, ly); c.stroke();
    c.beginPath(); c.moveTo(px + 4, hipY + 6); c.lineTo(px + 4, kneeY); c.lineTo(rx, ry); c.stroke();

    // Arms
    let hx, hy;
    if (isShooting) {
      hx = px + 22 * dir; hy = shoulderY - 14; // arms up toward hoop
    } else {
      hx = px + 16 * dir; hy = shoulderY + 4;
    }
    c.beginPath();
    c.moveTo(px - 5 * dir, shoulderY + 2);
    c.lineTo(px + 5 * dir, shoulderY + 6);
    c.lineTo(hx, hy);
    c.stroke();

    c.restore();
  }

  drawParticles(c) {
    c.save();
    for (const p of this.particles) {
      c.globalAlpha = Math.max(0, p.alpha);
      if (p.isFire) {
        c.shadowColor = p.color;
        c.shadowBlur = 6;
      } else {
        c.shadowBlur = 0;
      }
      c.fillStyle = p.color;
      c.beginPath(); c.arc(p.x, p.y, p.r, 0, Math.PI * 2); c.fill();
    }
    c.restore();
  }
}

window.BasketballGame = BasketballGame;
