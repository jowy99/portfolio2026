(() => {
  const THEME_KEY = "theme";
  const root = document.documentElement;
  const THEME_LABELS = {
    es: { system: "Sistema", light: "Claro", dark: "Oscuro" },
    en: { system: "System", light: "Light", dark: "Dark" },
    ca: { system: "Sistema", light: "Clar", dark: "Fosc" },
    fr: { system: "Systeme", light: "Clair", dark: "Sombre" },
  };

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
    const controls = [...document.querySelectorAll("[data-theme-toggle], [data-theme-option], [data-theme-current-label]")];
    if (controls.length === 0) return;
    root.dataset.themeToggleReady = "true";

    const syncControls = (value) => {
      const lang = (root.lang || "es").toLowerCase();
      const labels = THEME_LABELS[lang] || THEME_LABELS.es;

      for (const control of document.querySelectorAll("[data-theme-toggle]")) {
        if (control instanceof HTMLSelectElement && control.value !== value) {
          control.value = value;
        }
      }

      for (const option of document.querySelectorAll("[data-theme-option]")) {
        if (!(option instanceof HTMLButtonElement)) continue;
        const isCurrent = option.dataset.themeOption === value;
        option.setAttribute("aria-checked", String(isCurrent));
        option.setAttribute("aria-pressed", String(isCurrent));
        option.classList.toggle("is-active", isCurrent);
      }

      for (const label of document.querySelectorAll("[data-theme-current-label]")) {
        if (!(label instanceof HTMLElement)) continue;
        label.textContent = labels[value] ?? labels.system;
      }

      for (const trigger of document.querySelectorAll("[data-theme-trigger-button]")) {
        if (!(trigger instanceof HTMLButtonElement)) continue;
        const baseLabel = trigger.dataset.themeTriggerLabel || "Theme";
        trigger.setAttribute("aria-label", `${baseLabel}: ${labels[value] ?? labels.system}`);
      }

      for (const field of document.querySelectorAll("[data-theme-current-value]")) {
        if (!(field instanceof HTMLInputElement)) continue;
        field.value = value;
      }
    };

    const persistTheme = (value) => {
      try {
        localStorage.setItem(THEME_KEY, value);
      } catch {
        // No-op: storage may be unavailable (private mode / policy).
      }
    };

    const setTheme = (value) => {
      const nextTheme = isThemeValue(value) ? value : "system";
      persistTheme(nextTheme);
      applyTheme(nextTheme);
      syncControls(nextTheme);
    };

    const current = readTheme();
    syncControls(current);
    applyTheme(current);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = () => {
      if (readTheme() !== "system") return;
      applyTheme("system");
      syncControls("system");
    };

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handleSystemChange);
    } else if (typeof media.addListener === "function") {
      media.addListener(handleSystemChange);
    }

    for (const control of document.querySelectorAll("[data-theme-toggle]")) {
      if (!(control instanceof HTMLSelectElement)) continue;
      control.addEventListener("change", () => {
        setTheme(control.value);
      });
    }

    for (const option of document.querySelectorAll("[data-theme-option]")) {
      if (!(option instanceof HTMLButtonElement)) continue;
      option.addEventListener("click", () => {
        setTheme(option.dataset.themeOption);
      });
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initThemeToggle, { once: true });
  } else {
    initThemeToggle();
  }
})();
