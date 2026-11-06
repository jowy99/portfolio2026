import {
  DEFAULT_PROJECTS_SORT,
  normalizeToken,
  parseNormalizedStackValues,
  parsePositivePage,
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
  const pagination = document.querySelector<HTMLElement>("[data-projects-pagination]");
  const loadMore = document.querySelector<HTMLAnchorElement>("[data-projects-load-more]");
  const pageSize = parsePositivePage(list.dataset.projectsPageSize, 12);

  const searchInput = form.querySelector<HTMLInputElement>("[data-projects-search-input]");
  const clearButton = form.querySelector<HTMLButtonElement>("[data-projects-search-clear]");
  const stackCheckboxes = Array.from(form.querySelectorAll<HTMLInputElement>("[data-projects-stack-checkbox]"));
  const sortSelect = form.querySelector<HTMLSelectElement>("[data-projects-sort-select]");
  const filtersDialog = form.querySelector<HTMLDialogElement>("[data-projects-filters-dialog]");
  const filtersOpenButton = form.querySelector<HTMLButtonElement>("[data-projects-filters-open]");
  const filtersCloseButton = form.querySelector<HTMLButtonElement>("[data-projects-filters-close]");
  const filtersCount = form.querySelector<HTMLElement>("[data-projects-filters-count]");
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
    const hasQuery = searchInput.value.trim().length > 0;
    clearButton.classList.toggle("is-visible", hasQuery);
    clearButton.disabled = !hasQuery;
  };

  const getActiveFilterCount = (): number => {
    const qActive = searchInput.value.trim().length > 0 ? 1 : 0;
    const selectedStacks = stackCheckboxes.filter((checkbox) => checkbox.checked).length;
    const sortActive = sortSelect && parseProjectsSort(sortSelect.value) !== DEFAULT_PROJECTS_SORT ? 1 : 0;
    return qActive + selectedStacks + sortActive;
  };

  const syncFiltersCount = (): void => {
    if (!filtersCount) return;
    const count = getActiveFilterCount();
    filtersCount.classList.toggle("is-active", count > 0);
    filtersCount.textContent = count > 0 ? String(count) : "";
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

      item.hidden = true;
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

    const totalPages = Math.max(1, Math.ceil(matched.length / pageSize));
    const page = Math.min(parsePositivePage(params.get("page")), totalPages);
    for (const [index, item] of matched.entries()) {
      item.hidden = index >= page * pageSize;
      item.parentElement?.appendChild(item);
    }
    for (const group of list.querySelectorAll<HTMLElement>("[data-project-group]")) {
      group.hidden = !group.querySelector("[data-project-item]:not([hidden])");
    }
    if (pagination) pagination.hidden = page >= totalPages;
    if (loadMore) {
      const nextParams = new URLSearchParams(params);
      nextParams.set("page", String(page + 1));
      loadMore.href = `${form.action}?${nextParams.toString()}`;
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
    syncFiltersCount();
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

  for (const checkbox of stackCheckboxes) {
    checkbox.addEventListener("change", submitWithReplace);
  }

  const sortToggle = form.querySelector<HTMLButtonElement>("[data-projects-sort-toggle]");
  const syncSortToggle = (): void => {
    if (!sortToggle || !sortSelect) return;
    const label = (sortSelect.value === "recent" ? sortToggle.dataset.labelRecent : sortToggle.dataset.labelRelevance) ?? "";
    const labelNode = sortToggle.querySelector("[data-projects-sort-label]");
    if (labelNode) labelNode.textContent = label;
    sortToggle.setAttribute("aria-label", `${sortToggle.dataset.prefix}: ${label}`);
  };
  sortToggle?.addEventListener("click", () => {
    if (!sortSelect) return;
    sortSelect.value = sortSelect.value === "recent" ? "relevance" : "recent";
    syncSortToggle();
    submitWithReplace();
  });
  window.addEventListener("popstate", syncSortToggle);

  const techMenu = form.querySelector<HTMLDetailsElement>("[data-projects-tech-menu]");
  const techCount = form.querySelector<HTMLElement>("[data-projects-tech-count]");
  const syncTechCount = (): void => {
    if (!techCount) return;
    const count = stackCheckboxes.filter((checkbox) => checkbox.checked).length;
    techCount.textContent = count > 0 ? String(count) : "";
    techCount.classList.toggle("is-active", count > 0);
  };
  for (const checkbox of stackCheckboxes) {
    checkbox.addEventListener("change", syncTechCount);
  }
  form.querySelector("[data-projects-tech-clear]")?.addEventListener("click", () => {
    for (const checkbox of stackCheckboxes) checkbox.checked = false;
    syncTechCount();
    submitWithReplace();
  });
  document.addEventListener("click", (event) => {
    if (techMenu?.open && !techMenu.contains(event.target as Node)) techMenu.open = false;
  });
  techMenu?.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    techMenu.open = false;
    techMenu.querySelector("summary")?.focus();
  });
  window.addEventListener("popstate", syncTechCount);

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
    syncFiltersCount();
  };

  let debounceId = 0;
  const requestLiveSearch = (): void => {
    window.clearTimeout(debounceId);
    debounceId = 0;
    submitWithReplace();
  };

  const openFiltersDialog = (): void => {
    if (!supportsDialog || !filtersDialog || filtersDialog.open) return;
    // Finish pending search before the dialog controls become an uncommitted draft.
    if (debounceId) requestLiveSearch();
    dialogSnapshot = snapshotDialogValues();
    committedFromDialog = false;
    filtersDialog.showModal();
    setDialogExpanded(true);
  };

  const closeFiltersDialog = (): void => {
    if (!supportsDialog || !filtersDialog || !filtersDialog.open) return;
    filtersDialog.close();
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
      searchInput.focus({ preventScroll: true });
      searchInput.value = "";
      toggleClearButton();
      requestLiveSearch();
    });
  }

  for (const checkbox of stackCheckboxes) {
    checkbox.addEventListener("change", () => {
      chipIndicator?.onSelectionChange(checkbox);
      syncFiltersCount();
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
    sortSelect.addEventListener("change", syncFiltersCount);
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
