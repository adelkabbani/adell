const canvas = document.getElementById('space-canvas');
const ctx = canvas.getContext('2d');

const config = {
  starCount: 600,
  baseSpeed: 45,
  maxDepth: 1800,
  minDepth: 60
};

const stars = [];
let width = 0;
let height = 0;
let centerX = 0;
let centerY = 0;
let focalLength = 0;
let lastTime = performance.now();

function resize() {
  const dpr = window.devicePixelRatio || 1;
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  centerX = width / 2;
  centerY = height / 2;
  focalLength = Math.min(width, height) * 0.8;
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function createStar() {
  return {
    x: randomRange(-width, width),
    y: randomRange(-height, height),
    z: randomRange(config.minDepth, config.maxDepth),
    radius: randomRange(0.6, 2.4),
    driftX: randomRange(-8, 8),
    driftY: randomRange(-8, 8),
    twinkle: randomRange(0.4, 1)
  };
}

function recycleStar(star) {
  star.x = randomRange(-width, width);
  star.y = randomRange(-height, height);
  star.z = randomRange(config.maxDepth * 0.6, config.maxDepth);
  star.radius = randomRange(0.6, 2.4);
  star.driftX = randomRange(-8, 8);
  star.driftY = randomRange(-8, 8);
  star.twinkle = randomRange(0.4, 1);
}

function initStars() {
  stars.length = 0;
  for (let i = 0; i < config.starCount; i += 1) {
    stars.push(createStar());
  }
}

function drawStar(star) {
  const scale = focalLength / (focalLength + star.z);
  const x = star.x * scale + centerX;
  const y = star.y * scale + centerY;
  const size = star.radius * scale * 2.8;

  if (x < 0 || x > width || y < 0 || y > height || size < 0.1) {
    return;
  }

  const opacity = Math.min(1, Math.max(0.12, star.twinkle * (1 - star.z / config.maxDepth) + 0.18));
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
  gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
  gradient.addColorStop(0.35, `rgba(194, 216, 255, ${opacity * 0.7})`);
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(x - size, y - size, size * 2, size * 2);
}

function update(time) {
  const delta = (time - lastTime) / 1000 || 0;
  lastTime = time;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'lighter';

  for (const star of stars) {
    star.z -= config.baseSpeed * delta;
    star.x += star.driftX * delta * 0.3;
    star.y += star.driftY * delta * 0.3;

    if (star.z <= config.minDepth) {
      recycleStar(star);
      continue;
    }

    drawStar(star);
  }

  ctx.globalCompositeOperation = 'source-over';
  requestAnimationFrame(update);
}

resize();
initStars();
window.addEventListener('resize', () => {
  resize();
  initStars();
});
requestAnimationFrame(update);
