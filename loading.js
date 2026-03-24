
const orbitWrapper = document.getElementById("orbitWrapper");
const btnWrapper = document.getElementById("btnWrapper");
const startBtn = document.getElementById("startBtn");

let hideTimeout;

// ===== Hover 控制 =====
btnWrapper.addEventListener("mouseenter", () => {
  clearTimeout(hideTimeout);
  orbitWrapper.classList.add("active");
});

btnWrapper.addEventListener("mouseleave", () => {
  hideTimeout = setTimeout(() => {
    orbitWrapper.classList.remove("active");
  }, 200);
});

// ===== 创建轨道点 =====
const n = 6;
const dotDeg = 360 / n;

function createDots(container, total, divisor) {
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < total; i++) {
    const dot = document.createElement("div");
    dot.className = "dot";

    const angle = (i * dotDeg) / divisor;
    dot.style.transform = `rotate(${angle}deg)`;

    fragment.appendChild(dot);
  }

  container.appendChild(fragment);
}

const outer = orbitWrapper.querySelector(".outer");
const middle = orbitWrapper.querySelector(".middle");
const inner = orbitWrapper.querySelector(".inner");

createDots(outer, 18, 3);
createDots(middle, 12, 2);
createDots(inner, 6, 1);

const btn = document.getElementById("bubblyBtn");

btn.addEventListener("click", function (e) {
  e.preventDefault();

  // 先移除再添加（模拟 React state 触发）
  btn.classList.remove("animate");

  setTimeout(() => {
    btn.classList.add("animate");
  }, 100);

  setTimeout(() => {
    btn.classList.remove("animate");
  }, 700);

});


const loading = document.getElementById("loadingScreen");

let scrollTop;

// 页面加载时禁止滚动
scrollTop = window.scrollY;
document.body.style.position = 'fixed';
document.body.style.top = `-${scrollTop}px`;
document.body.style.width = '100%';
document.body.style.overflow = 'hidden';

// 点击按钮
btn.addEventListener("click", () => {
  loading.classList.add("hide"); // 渐隐动画

  // 恢复滚动
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  document.body.style.overflow = '';
  window.scrollTo(0, scrollTop);

  // 移除 loading DOM
  setTimeout(() => loading.remove(), 2400);
});
