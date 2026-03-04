const REVEAL_SELECTOR = "[data-reveal]";

const initReveal = (): void => {
  const root = document.documentElement;
  if (root.dataset.revealReady === "true") return;
  root.dataset.revealReady = "true";

  const elements = Array.from(document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR));
  if (elements.length === 0) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion || !("IntersectionObserver" in window)) {
    for (const element of elements) {
      element.classList.add("ui-visible");
    }
    return;
  }

  for (const element of elements) {
    const delay = Number.parseInt(element.dataset.revealDelay ?? "", 10);
    if (Number.isFinite(delay) && delay > 0) {
      element.style.transitionDelay = `${delay}ms`;
    }
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const target = entry.target;
        if (!(target instanceof HTMLElement)) continue;
        target.classList.add("ui-visible");
        currentObserver.unobserve(target);
      }
    },
    {
      // Keep reveals snappy on mobile (especially for tall containers).
      threshold: 0.01,
      rootMargin: "0px 0px 8% 0px",
    },
  );

  for (const element of elements) {
    const rect = element.getBoundingClientRect();
    const isAlreadyVisible = rect.bottom > 0 && rect.top < window.innerHeight;
    if (isAlreadyVisible) {
      element.classList.add("ui-visible");
      continue;
    }
    observer.observe(element);
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initReveal, { once: true });
} else {
  initReveal();
}

export { initReveal };
