export const themeInitScript =
  '!function(){const e="theme",t=document.documentElement,o=window.matchMedia("(prefers-color-scheme: dark)");let r="system";try{const t=localStorage.getItem(e);("light"===t||"dark"===t||"system"===t)&&(r=t)}catch{}const a="system"===r?o.matches?"dark":"light":r;t.classList.toggle("dark","dark"===a),t.setAttribute("data-theme",r)}();';
