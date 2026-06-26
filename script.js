const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();

const clock = document.querySelector("#clock");
if (clock) {
  const tick = () => {
    const now = new Date();
    const t = new Intl.DateTimeFormat("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Shanghai",
    }).format(now);
    clock.textContent = t;
  };
  tick();
  setInterval(tick, 1000);
}

document.querySelectorAll(".stagger").forEach((group) => {
  Array.from(group.children).forEach((child, i) =>
    child.style.setProperty("--i", i),
  );
});

const revealItems = document.querySelectorAll(".reveal");
if (reducedMotion) {
  revealItems.forEach((el) => el.classList.add("is-visible"));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
  );
  revealItems.forEach((el) => io.observe(el));
}

const nav = document.querySelector(".nav");
const progress = document.querySelector(".scroll-progress");
const pins = Array.from(document.querySelectorAll("[data-pin]"));
const parallax = Array.from(document.querySelectorAll("[data-parallax]"));
const mLines = Array.from(document.querySelectorAll(".manifesto .m-line"));

function frame() {
  const vh = window.innerHeight;
  const y = window.scrollY;

  if (progress) {
    const max = document.documentElement.scrollHeight - vh;
    progress.style.setProperty("--p", (max > 0 ? y / max : 0).toFixed(4));
  }

  if (nav) nav.classList.toggle("scrolled", y > 8);

  if (reducedMotion) return;

  pins.forEach((pin) => {
    const r = pin.getBoundingClientRect();
    const total = r.height - vh;
    const p = clamp(-r.top / (total || 1), 0, 1);

    if (pin.dataset.pin === "zoom") {
      const fig = pin.querySelector(".zoom-figure");
      if (fig) fig.style.setProperty("--s", lerp(0.74, 1.06, p).toFixed(4));
    } else if (pin.dataset.pin === "lines") {
      const span = clamp((p - 0.04) / 0.82, 0, 1);
      const active = Math.round(span * mLines.length);
      mLines.forEach((el, i) => el.classList.toggle("on", i < active));
    }
  });

  parallax.forEach((el) => {
    const factor = parseFloat(el.dataset.parallax) || 0;
    const r = el.getBoundingClientRect();
    const center = r.top + r.height / 2 - vh / 2;
    el.style.setProperty("--py", `${(-center * factor).toFixed(1)}px`);
  });
}

let ticking = false;
function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      frame();
      ticking = false;
    });
    ticking = true;
  }
}
frame();
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll, { passive: true });

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function glideTo(targetY, duration) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  if (Math.abs(distance) < 2) return;
  let startTime;
  const step = (now) => {
    if (startTime === undefined) startTime = now;
    const p = Math.min((now - startTime) / duration, 1);
    window.scrollTo(0, startY + distance * easeInOutCubic(p));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const hash = link.getAttribute("href");
    if (!hash || hash === "#") {
      event.preventDefault();
      return;
    }
    const target = document.querySelector(hash);
    if (!target) return;
    event.preventDefault();
    const offset = (nav ? nav.offsetHeight : 0) + 14;
    const top = Math.max(
      0,
      target.getBoundingClientRect().top + window.scrollY - offset,
    );
    glideTo(top, 850);
    if (history.replaceState) history.replaceState(null, "", hash);
  });
});

const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if (sections.length) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          navLinks.forEach((link) =>
            link.classList.toggle(
              "is-current",
              link.getAttribute("href") === `#${id}`,
            ),
          );
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  sections.forEach((section) => navObserver.observe(section));
}
