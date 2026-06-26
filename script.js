const year = document.querySelector("#year");
if (year) {
  year.textContent = new Date().getFullYear();
}

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const indexItems = document.querySelectorAll(".index-list li");
indexItems.forEach((item, i) => item.style.setProperty("--i", i));

const revealItems = document.querySelectorAll(".reveal");
if (reducedMotion) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
  );
  revealItems.forEach((item) => revealObserver.observe(item));
}

const progress = document.querySelector(".scroll-progress");
if (progress) {
  let ticking = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    progress.style.setProperty("--p", ratio.toFixed(4));
    ticking = false;
  };
  update();
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true },
  );
  window.addEventListener("resize", update, { passive: true });
}

const navLinks = Array.from(document.querySelectorAll(".masthead-nav a"));
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
