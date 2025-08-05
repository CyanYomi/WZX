// 获取元素
const bgCanvas = document.getElementById('bg-canvas');
const fxCanvas = document.getElementById('fx-canvas');
const bgCtx = bgCanvas.getContext('2d');
const fxCtx = fxCanvas.getContext('2d');
const btn = document.getElementById('press-btn');

// 自适应画布
function resizeCanvas() {
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
  fxCanvas.width = window.innerWidth;
  fxCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ---- 背景星星 ---- //
const stars = Array.from({ length: 80 }, () => ({
  x: Math.random() * window.innerWidth,
  y: Math.random() * window.innerHeight,
  r: Math.random() * 1.5 + 0.5,
  alpha: Math.random()
}));

function drawStars() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  for (let star of stars) {
    star.alpha += (Math.random() - 0.5) * 0.05;
    star.alpha = Math.max(0.1, Math.min(star.alpha, 1));
    bgCtx.beginPath();
    bgCtx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    bgCtx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
    bgCtx.fill();
  }
  requestAnimationFrame(drawStars);
}
drawStars();

// ---- 烟花系统 ---- //
let fireworks = [];

class Firework {
  constructor(x, y) {
    this.x = x;
    this.y = fxCanvas.height;
    this.targetY = y;
    this.vy = -7;
    this.trail = [];
    this.exploded = false;
    this.particles = [];
    this.color = `hsl(${Math.random() * 360}, 100%, 70%)`;
  }

  update() {
    if (!this.exploded) {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 10) this.trail.shift();
      this.y += this.vy;

      if (this.y <= this.targetY) {
        this.exploded = true;
        for (let i = 0; i < 30; i++) {
          const angle = (Math.PI * 2 * i) / 30;
          const speed = Math.random() * 3 + 2;
          this.particles.push({
            x: this.x,
            y: this.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1
          });
        }
      }
    } else {
      this.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.02;
      });
      this.particles = this.particles.filter(p => p.alpha > 0);
    }
  }

  draw() {
    if (!this.exploded) {
      fxCtx.beginPath();
      fxCtx.moveTo(this.trail[0]?.x ?? this.x, this.trail[0]?.y + 40 ?? this.y + 40);
      this.trail.forEach(p => fxCtx.lineTo(p.x, p.y));
      fxCtx.strokeStyle = this.color;
      fxCtx.lineWidth = 2;
      fxCtx.stroke();
    } else {
      this.particles.forEach(p => {
        fxCtx.beginPath();
        fxCtx.moveTo(p.x, p.y);
        fxCtx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2);
        fxCtx.strokeStyle = `rgba(255,255,255,${p.alpha})`;
        fxCtx.lineWidth = 1;
        fxCtx.stroke();
      });
    }
  }

  done() {
    return this.exploded && this.particles.length === 0;
  }
}

// 每帧更新烟花
function updateFireworks() {
  fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);

  fireworks.forEach(f => {
    f.update();
    f.draw();
  });
  fireworks = fireworks.filter(f => !f.done());
  requestAnimationFrame(updateFireworks);
}
updateFireworks();

// 点击按钮放多个烟花（随机位置）
btn.addEventListener('click', () => {
  const count = Math.floor(Math.random() * 3) + 5; // 5~7 个
  for (let i = 0; i < count; i++) {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight * 0.5 + 50;
    fireworks.push(new Firework(x, y));
  }
});

// 防御双击放大
btn.addEventListener('dblclick', (e) => e.preventDefault());
