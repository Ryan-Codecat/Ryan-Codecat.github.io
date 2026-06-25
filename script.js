const year = document.querySelector("#year");
if (year) {
  year.textContent = new Date().getFullYear();
}

const header = document.querySelector(".site-header");
const updateHeader = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });
