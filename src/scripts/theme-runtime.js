(() => {
  const THEME_KEY = "theme";
  const root = document.documentElement;

  const isThemeValue = (value) => value === "system" || value === "light" || value === "dark";

  const readTheme = () => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      return isThemeValue(stored) ? stored : "system";
    } catch {
      return "system";
    }
  };

  const applyTheme = (theme) => {
    const mode =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;
    root.classList.toggle("dark", mode === "dark");
    root.setAttribute("data-theme", theme);
  };

  const initThemeToggle = () => {
    const controls = [...document.querySelectorAll("[data-theme-toggle]")];
    if (controls.length === 0 || root.dataset.themeToggleReady === "true") return;
    root.dataset.themeToggleReady = "true";

    const syncControls = (value) => {
      for (const control of controls) {
        if (control instanceof HTMLSelectElement && control.value !== value) {
          control.value = value;
        }
      }
    };

    const current = readTheme();
    syncControls(current);
    applyTheme(current);

    for (const control of controls) {
      if (!(control instanceof HTMLSelectElement)) continue;
      control.addEventListener("change", () => {
        const nextTheme = isThemeValue(control.value) ? control.value : "system";
        try {
          localStorage.setItem(THEME_KEY, nextTheme);
        } catch {
          // No-op: storage may be unavailable (private mode / policy).
        }
        applyTheme(nextTheme);
        syncControls(nextTheme);
      });
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initThemeToggle, { once: true });
  } else {
    initThemeToggle();
  }
})();
