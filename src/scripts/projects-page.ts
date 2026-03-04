import {
  DEFAULT_PROJECTS_SORT,
  normalizeToken,
  parseNormalizedStackValues,
  parseProjectsSort,
  readTrimmedParam,
} from "../utils/url";
import { initChipIndicator } from "./chip-indicator";

const SEARCH_DEBOUNCE_MS = 320;

const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;

  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
};

const initProjectsPage = (): void => {
  const root = document.documentElement;
  if (root.dataset.projectsPageReady === "true") return;
  root.dataset.projectsPageReady = "true";

  const form = document.querySelector("[data-projects-toolbar-form]");
  const list = document.getElementById("list");
  if (!(form instanceof HTMLFormElement) || !(list instanceof HTMLElement)) return;

  const items = Array.from(list.querySelectorAll<HTMLElement>("[data-project-item]"));
  const resultsNode = document.querySelector<HTMLElement>("[data-projects-results]");
  const emptyNode = document.querySelector<HTMLElement>("[data-projects-empty]");

  const searchInput = form.querySelector<HTMLInputElement>("[data-projects-search-input]");
  const clearButton = form.querySelector<HTMLButtonElement>("[data-projects-search-clear]");
  const stackCheckboxes = Array.from(form.querySelectorAll<HTMLInputElement>("[data-projects-stack-checkbox]"));
  const sortSelect = form.querySelector<HTMLSelectElement>("[data-projects-sort-select]");
  const filtersDialog = form.querySelector<HTMLDialogElement>("[data-projects-filters-dialog]");
  const filtersOpenButton = form.querySelector<HTMLButtonElement>("[data-projects-filters-open]");
  const filtersCloseButton = form.querySelector<HTMLButtonElement>("[data-projects-filters-close]");
  const filtersDot = form.querySelector<HTMLElement>("[data-projects-filters-dot]");
  const chipIndicator = initChipIndicator(form, stackCheckboxes);

  if (!(searchInput instanceof HTMLInputElement)) return;
  const supportsDialog = filtersDialog instanceof HTMLDialogElement && typeof filtersDialog.showModal === "function";

  if (!supportsDialog && filtersDialog) {
    filtersDialog.setAttribute("open", "");
    filtersDialog.classList.add("is-static");
    filtersOpenButton?.setAttribute("hidden", "hidden");
  }

  const setDialogExpanded = (isOpen: boolean): void => {
    if (!filtersOpenButton) return;
    filtersOpenButton.setAttribute("aria-expanded", String(isOpen));
  };

  const toggleClearButton = (): void => {
    if (!clearButton) return;
    clearButton.classList.toggle("is-visible", searchInput.value.trim().length > 0);
  };

  const getActiveFilterCount = (): number => {
    const qActive = searchInput.value.trim().length > 0 ? 1 : 0;
    const selectedStacks = stackCheckboxes.filter((checkbox) => checkbox.checked).length;
    const sortActive = sortSelect && parseProjectsSort(sortSelect.value) !== DEFAULT_PROJECTS_SORT ? 1 : 0;
    return qActive + selectedStacks + sortActive;
  };

  const syncFiltersDot = (): void => {
    if (!filtersDot) return;
    filtersDot.classList.toggle("is-active", getActiveFilterCount() > 0);
  };

  const formatResults = (count: number): string => {
    if (!resultsNode) return String(count);
    const one = resultsNode.dataset.wordOne ?? "";
    const many = resultsNode.dataset.wordMany ?? "";
    return `${count} ${count === 1 ? one : many}`.trim();
  };

  const applyFiltersFromUrl = (): void => {
    const params = new URLSearchParams(window.location.search);
    const q = normalizeToken(readTrimmedParam(params, "q"));
    const sort = parseProjectsSort(params.get("sort"));
    const selectedStacks = parseNormalizedStackValues(params);

    const matched: HTMLElement[] = [];
    for (const item of items) {
      const title = item.dataset.title ?? "";
      const description = item.dataset.description ?? "";
      const stackRaw = item.dataset.stacks ?? "";
      const haystack = normalizeToken(`${title} ${description} ${stackRaw.split("|").join(" ")}`);
      const projectStacks = new Set(
        stackRaw
          .split("|")
          .map((stack) => normalizeToken(stack))
          .filter(Boolean),
      );

      const matchesQ = q.length === 0 || haystack.includes(q);
      const matchesStack = selectedStacks.length === 0 || selectedStacks.some((stack) => projectStacks.has(stack));
      const isMatch = matchesQ && matchesStack;

      item.hidden = !isMatch;
      if (isMatch) matched.push(item);
    }

    const sortByFeaturedThenDate = (a: HTMLElement, b: HTMLElement): number => {
      const aFeatured = a.dataset.featured === "1";
      const bFeatured = b.dataset.featured === "1";
      if (aFeatured !== bFeatured) {
        return aFeatured ? -1 : 1;
      }
      const aDate = Date.parse(a.dataset.date ?? "");
      const bDate = Date.parse(b.dataset.date ?? "");
      return bDate - aDate;
    };

    matched.sort((a, b) => {
      if (sort === "recent") {
        const aDate = Date.parse(a.dataset.date ?? "");
        const bDate = Date.parse(b.dataset.date ?? "");
        return bDate - aDate;
      }
      return sortByFeaturedThenDate(a, b);
    });

    for (const item of matched) {
      list.appendChild(item);
    }

    if (resultsNode) {
      resultsNode.textContent = formatResults(matched.length);
    }
    if (emptyNode) {
      emptyNode.classList.toggle("hidden", matched.length > 0);
    }

    searchInput.value = readTrimmedParam(params, "q");
    if (sortSelect) {
      sortSelect.value = sort;
    }
    const selected = new Set(selectedStacks);
    for (const checkbox of stackCheckboxes) {
      checkbox.checked = selected.has(normalizeToken(checkbox.value));
    }
    toggleClearButton();
    syncFiltersDot();
    chipIndicator?.syncFromSelection();
  };

  const buildParamsFromControls = (): URLSearchParams => {
    const params = new URLSearchParams();
    const qValue = searchInput.value.trim();
    if (qValue.length > 0) {
      params.set("q", qValue);
    }

    for (const checkbox of stackCheckboxes) {
      if (!checkbox.checked) continue;
      const value = checkbox.value.trim();
      if (!value) continue;
      params.append("stack", value);
    }

    if (sortSelect) {
      const sort = parseProjectsSort(sortSelect.value);
      if (sort !== DEFAULT_PROJECTS_SORT) {
        params.set("sort", sort);
      }
    }
    return params;
  };

  const submitWithReplace = (): void => {
    const wasFocused = document.activeElement === searchInput;
    const selectionStart = searchInput.selectionStart;
    const selectionEnd = searchInput.selectionEnd;
    const selectionDirection = searchInput.selectionDirection;

    const params = buildParamsFromControls();
    const query = params.toString();
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
    window.history.replaceState({ projectsLiveSearch: true }, "", nextUrl);
    applyFiltersFromUrl();

    if (!wasFocused) return;
    searchInput.focus({ preventScroll: true });
    if (selectionStart === null || selectionEnd === null) return;

    const max = searchInput.value.length;
    searchInput.setSelectionRange(
      Math.min(selectionStart, max),
      Math.min(selectionEnd, max),
      selectionDirection ?? "none",
    );
  };

  type DialogSnapshot = {
    sort: string;
    selected: Set<string>;
  };

  let dialogSnapshot: DialogSnapshot | null = null;
  let committedFromDialog = false;

  const snapshotDialogValues = (): DialogSnapshot => ({
    sort: sortSelect?.value ?? DEFAULT_PROJECTS_SORT,
    selected: new Set(
      stackCheckboxes
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => normalizeToken(checkbox.value)),
    ),
  });

  const restoreDialogValues = (snapshot: DialogSnapshot): void => {
    if (sortSelect) {
      sortSelect.value = snapshot.sort;
    }
    for (const checkbox of stackCheckboxes) {
      checkbox.checked = snapshot.selected.has(normalizeToken(checkbox.value));
    }
    chipIndicator?.syncFromSelection();
    syncFiltersDot();
  };

  const openFiltersDialog = (): void => {
    if (!supportsDialog || !filtersDialog || filtersDialog.open) return;
    dialogSnapshot = snapshotDialogValues();
    committedFromDialog = false;
    filtersDialog.showModal();
    setDialogExpanded(true);
  };

  const closeFiltersDialog = (): void => {
    if (!supportsDialog || !filtersDialog || !filtersDialog.open) return;
    filtersDialog.close();
  };

  let debounceId = 0;
  const requestLiveSearch = (): void => {
    submitWithReplace();
  };

  searchInput.setAttribute("aria-keyshortcuts", "Meta+K Control+K");

  document.addEventListener("keydown", (event) => {
    const isShortcut = (event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey;
    if (!isShortcut || event.key.toLowerCase() !== "k") return;
    if (event.defaultPrevented) return;

    const targetIsEditable = isEditableTarget(event.target);
    if (targetIsEditable && event.target !== searchInput) return;

    event.preventDefault();
    closeFiltersDialog();
    searchInput.focus();
    searchInput.select();
  });

  searchInput.addEventListener("input", () => {
    toggleClearButton();
    window.clearTimeout(debounceId);
    debounceId = window.setTimeout(requestLiveSearch, SEARCH_DEBOUNCE_MS);
  });

  searchInput.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    if (!searchInput.value.trim()) return;
    searchInput.value = "";
    toggleClearButton();
    requestLiveSearch();
  });

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      if (!searchInput.value.trim()) return;
      searchInput.value = "";
      toggleClearButton();
      requestLiveSearch();
    });
  }

  for (const checkbox of stackCheckboxes) {
    checkbox.addEventListener("change", () => {
      chipIndicator?.onSelectionChange(checkbox);
      syncFiltersDot();
    });
  }

  if (filtersOpenButton) {
    filtersOpenButton.addEventListener("click", (event) => {
      event.preventDefault();
      openFiltersDialog();
    });
  }

  if (filtersCloseButton) {
    filtersCloseButton.addEventListener("click", (event) => {
      event.preventDefault();
      closeFiltersDialog();
    });
  }

  if (supportsDialog && filtersDialog) {
    filtersDialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeFiltersDialog();
    });

    filtersDialog.addEventListener("click", (event) => {
      if (event.target === filtersDialog) {
        closeFiltersDialog();
      }
    });

    filtersDialog.addEventListener("close", () => {
      setDialogExpanded(false);
      if (!committedFromDialog && dialogSnapshot) {
        restoreDialogValues(dialogSnapshot);
      }
      dialogSnapshot = null;
      committedFromDialog = false;
    });
  }

  form.addEventListener("submit", (event) => {
    if (!(event.submitter instanceof HTMLElement)) return;
    if (!supportsDialog || !(filtersDialog instanceof HTMLDialogElement)) return;
    if (!filtersDialog.contains(event.submitter)) return;

    committedFromDialog = true;
    closeFiltersDialog();
  });

  if (sortSelect) {
    sortSelect.addEventListener("change", syncFiltersDot);
  }

  applyFiltersFromUrl();
  window.addEventListener("popstate", applyFiltersFromUrl);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initProjectsPage, { once: true });
} else {
  initProjectsPage();
}

export { initProjectsPage };
