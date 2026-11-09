(() => {
  const THEME_KEY = "theme";
  const root = document.documentElement;
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  // Without a saved choice the page follows the system theme.
  const readTheme = () => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      return stored === "light" || stored === "dark" ? stored : "system";
    } catch {
      return "system";
    }
  };

  const applyTheme = (theme) => {
    const mode = theme === "system" ? (media.matches ? "dark" : "light") : theme;
    root.classList.toggle("dark", mode === "dark");
    root.setAttribute("data-theme", theme);
  };

  const persistTheme = (value) => {
    try {
      localStorage.setItem(THEME_KEY, value);
    } catch {
      // No-op: storage may be unavailable (private mode / policy).
    }
  };

  const initThemeSwitch = () => {
    const buttons = [...document.querySelectorAll("[data-theme-switch]")];
    if (buttons.length === 0) return;
    root.dataset.themeToggleReady = "true";

    applyTheme(readTheme());

    const handleSystemChange = () => {
      if (readTheme() === "system") applyTheme("system");
    };

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handleSystemChange);
    } else if (typeof media.addListener === "function") {
      media.addListener(handleSystemChange);
    }

    for (const button of buttons) {
      button.addEventListener("click", () => {
        const next = root.classList.contains("dark") ? "light" : "dark";
        persistTheme(next);
        applyTheme(next);
      });
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initThemeSwitch, { once: true });
  } else {
    initThemeSwitch();
  }
})();
