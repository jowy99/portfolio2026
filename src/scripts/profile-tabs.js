(() => {
  const root = document.querySelector("[data-profile-tabs]");
  if (!(root instanceof HTMLElement)) return;

  const stage = root.querySelector("[data-profile-stage]");
  const sidebar = root.querySelector(".profile-sidebar");
  const tablists = Array.from(root.querySelectorAll('[role="tablist"][data-profile-tablist]'));
  const tabs = Array.from(root.querySelectorAll('[role="tab"][data-profile-tab]'));
  const panels = Array.from(root.querySelectorAll('[role="tabpanel"][data-profile-panel]'));
  if (tablists.length === 0 || tabs.length === 0 || panels.length === 0) return;

  const valid = new Set(
    tabs
      .map((tab) => tab.getAttribute("data-profile-tab"))
      .filter((value) => Boolean(value)),
  );

  const readHashTab = () => {
    const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
    if (!hash.startsWith("profile=")) return null;
    const value = hash.slice("profile=".length);
    return valid.has(value) ? value : null;
  };

  const writeHashTab = (value) => {
    const nextHash = `#profile=${value}`;
    if (window.location.hash === nextHash) return;
    history.replaceState(null, "", `${window.location.pathname}${window.location.search}${nextHash}`);
  };

  const activate = (value, { focus = false, updateHash = true, focusWithin = null, reveal = false } = {}) => {
    if (!valid.has(value)) return;

    for (const tab of tabs) {
      if (!(tab instanceof HTMLButtonElement)) continue;
      const isActive = tab.dataset.profileTab === value;
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
      tab.tabIndex = isActive ? 0 : -1;
      tab.classList.toggle("is-active", isActive);
    }

    if (focus) {
      const targetTab = tabs.find((tab) => {
        if (!(tab instanceof HTMLButtonElement)) return false;
        if (tab.dataset.profileTab !== value) return false;
        if (!(focusWithin instanceof HTMLElement)) return true;
        return tab.closest("[data-profile-tablist]") === focusWithin;
      });
      if (targetTab instanceof HTMLButtonElement) targetTab.focus();
    }

    for (const panel of panels) {
      if (!(panel instanceof HTMLElement)) continue;
      const isActive = panel.dataset.profilePanel === value;
      panel.hidden = !isActive;
      panel.setAttribute("aria-hidden", isActive ? "false" : "true");
      panel.classList.toggle("is-active", isActive);
    }

    if (updateHash) writeHashTab(value);

    // A shorter panel can move the sticky tabs above the viewport after a switch.
    if (reveal && stage instanceof HTMLElement && sidebar instanceof HTMLElement) {
      requestAnimationFrame(() => {
        if (sidebar.getClientRects().length === 0) return;
        const top = Number.parseFloat(getComputedStyle(sidebar).top) || 0;
        const offset = stage.getBoundingClientRect().top - top;
        if (offset < 0) window.scrollBy({ top: offset, behavior: "instant" });
      });
    }
  };

  const initial =
    readHashTab() ??
    tabs.find((tab) => tab.getAttribute("aria-selected") === "true")?.getAttribute("data-profile-tab") ??
    tabs[0]?.getAttribute("data-profile-tab") ??
    root.getAttribute("data-default-tab") ??
    "why";

  activate(initial, { updateHash: false });

  for (const tab of tabs) {
    if (!(tab instanceof HTMLButtonElement)) continue;
    tab.addEventListener("click", () => {
      const value = tab.dataset.profileTab;
      if (value) activate(value, { reveal: true });
    });
  }

  for (const tablist of tablists) {
    if (!(tablist instanceof HTMLElement)) continue;
    tablist.addEventListener("keydown", (event) => {
      const key = event.key;
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(key)) return;
      event.preventDefault();

      const listTabs = tabs.filter((tab) => tab.closest("[data-profile-tablist]") === tablist);
      const currentIndex = listTabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
      if (currentIndex < 0) return;

      let nextIndex = currentIndex;
      if (key === "Home") nextIndex = 0;
      if (key === "End") nextIndex = listTabs.length - 1;
      if (key === "ArrowRight" || key === "ArrowDown") nextIndex = (currentIndex + 1) % listTabs.length;
      if (key === "ArrowLeft" || key === "ArrowUp") nextIndex = (currentIndex - 1 + listTabs.length) % listTabs.length;

      const nextTab = listTabs[nextIndex];
      if (!(nextTab instanceof HTMLButtonElement)) return;
      const value = nextTab.dataset.profileTab;
      if (value) activate(value, { focus: true, focusWithin: tablist, reveal: true });
    });
  }

  window.addEventListener("hashchange", () => {
    const value = readHashTab();
    if (value) activate(value, { updateHash: false });
  });
})();
