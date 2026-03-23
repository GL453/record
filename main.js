

const FACE_NAMES = [
  "Welcome",
  "Question 2",
  "Question 3",
  "Question 4",
  "Thank you!",
  "Goodbye!"
];

const STOPS = [
  { rx: 90, ry: 0 },
  { rx: 0, ry: 0 },
  { rx: 0, ry: -90 },
  { rx: 0, ry: -180 },
  { rx: 0, ry: -270 },
  { rx: -90, ry: -360 }
];

const N = STOPS.length;

const cube = document.getElementById("cube");

const faces = [...document.querySelectorAll(".face")];



const hudPct = document.getElementById("hud_pct");
const progFill = document.getElementById("prog_fill");
const sceneName = document.getElementById("scene_name");
const captionNum = document.getElementById("face_caption_num");
const captionName = document.getElementById("face_caption_name");
const dots = document.querySelectorAll(".scene-dot");

const easeIO = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

let lastFaceIdx = -1;
let isManualPaused = false;
const playBtn = document.querySelector(".play-btn");

const updateHUD = (s) => {
  const p = Math.round(s * 100);
  const si = Math.min(N - 1, Math.floor(s * N));

  hudPct.textContent = String(p).padStart(3, "0") + "%";
  progFill.style.width = `${p}%`;

  if (si !== lastFaceIdx) {
    lastFaceIdx = si;
    const name = FACE_NAMES[si];
    sceneName.textContent = name;
    captionNum.textContent = String(si + 1).padStart(2, "0");
    captionName.textContent = name;
    dots.forEach((d, i) => d.classList.toggle("active", i === si));

    // 自动播放当前面视频（除非用户手动暂停）
    faces.forEach((face, i) => {
      const video = face.querySelector("video");
      if (!video) return;
      if (i === si) {
        if (!isManualPaused) video.play();
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });

    //  重置按钮状态为播放

    isManualPaused = false;
  }
};

// 按钮控制当前面视频播放/暂停
playBtn.addEventListener("click", () => {
  const currentVideo = faces[lastFaceIdx]?.querySelector("video");
  if (!currentVideo) return;

  if (currentVideo.paused) {
    currentVideo.play();

    isManualPaused = false;
  } else {
    currentVideo.pause();

    isManualPaused = true;
  }
});


const setCubeTransform = (s) => {
  const t = s * (N - 1);
  const i = Math.min(Math.floor(t), N - 2);
  const f = easeIO(t - i);
  const a = STOPS[i];
  const b = STOPS[i + 1];
  const rx = a.rx + (b.rx - a.rx) * f;
  const ry = a.ry + (b.ry - a.ry) * f;
  cube.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
};


const mqSmall = window.matchMedia("(max-width: 56.25em)");

let maxScroll = 1;
let vh = innerHeight * 0.92;

const resize = () => {
  maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  vh = innerHeight * 0.92;
};

resize();
window.addEventListener("resize", resize);

let resizePending = false;
const ro = new ResizeObserver(() => {
  if (resizePending) return;
  resizePending = true;
  requestAnimationFrame(() => {
    resize();
    resizePending = false;
  });
});
ro.observe(document.documentElement);

let tgt = 0;
let smooth = 0;
let velocity = 0;

const ease = 0.1;
const FRICTION = 0.85;

window.addEventListener(
  "scroll",
  () => {
    tgt = maxScroll > 0 ? scrollY / maxScroll : 0;
    tgt = Math.max(0, Math.min(1, tgt));
  },
  { passive: true }
);

window.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    const linePx = 16;
    const pagePx = innerHeight * 0.9;
    const delta =
      e.deltaMode === 1
        ? e.deltaY * linePx
        : e.deltaMode === 2
        ? e.deltaY * pagePx
        : e.deltaY;
    velocity += delta;
    velocity = Math.max(-600, Math.min(600, velocity));
  },
  { passive: false }
);

let lastNow = performance.now();

const revealEls = [
  ...document.querySelectorAll(
    ".tag, h1, h2, .body-text, .stat-row, .cta, .h-line"
  )
];

const io = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        io.unobserve(e.target);
      }
    }),
  { threshold: 0.1 }
);
revealEls.forEach((el) => io.observe(el));

const frame = (now) => {
  requestAnimationFrame(frame);

  const dt = Math.min((now - lastNow) / 1000, 0.05);
  lastNow = now;

  velocity *= Math.pow(FRICTION, dt * 60);
  if (Math.abs(velocity) < 0.01) velocity = 0;
  if (Math.abs(velocity) > 0.2)
    window.scrollBy({ top: velocity * ease, behavior: "auto" });

  smooth += (tgt - smooth) * (1 - Math.exp(-dt * 8));
  smooth = Math.max(0, Math.min(1, smooth));

  updateHUD(smooth);
  setCubeTransform(smooth);
};

requestAnimationFrame(frame);

let anchorAnim = null;

const stopAnchorAnim = () => {
  if (anchorAnim) {
    cancelAnimationFrame(anchorAnim);
    anchorAnim = null;
  }
};

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const smoothScrollToY = (targetY, duration = 900) => {
  stopAnchorAnim();
  velocity = 0;
  const startY = window.scrollY;
  const diff = targetY - startY;
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min(1, (now - start) / duration);
    window.scrollTo(0, startY + diff * easeInOutCubic(p));
    anchorAnim = p < 1 ? requestAnimationFrame(tick) : null;
  };
  anchorAnim = requestAnimationFrame(tick);
};

window.addEventListener("wheel", stopAnchorAnim, { passive: true });
window.addEventListener("touchstart", stopAnchorAnim, { passive: true });
window.addEventListener("mousedown", stopAnchorAnim, { passive: true });
window.addEventListener("keydown", stopAnchorAnim);

document.querySelectorAll('a[href^="#s"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute("href"));
    if (!target) return;
    const isSmall = mqSmall.matches;
    const isHero = a.getAttribute("href") === "#s0";
    const extraOffset =
      isSmall && !isHero ? Math.max(0, target.offsetHeight - innerHeight) : 0;
    smoothScrollToY(
      Math.max(0, Math.min(target.offsetTop + extraOffset, maxScroll))
    );
  });
});
