export type ChipIndicatorController = {
  syncFromSelection: () => void;
  onSelectionChange: (changedInput?: HTMLInputElement) => void;
};

export const initChipIndicator = (
  form: HTMLFormElement,
  stackCheckboxes: HTMLInputElement[],
): ChipIndicatorController | null => {
  const wrap = form.querySelector<HTMLElement>("[data-chipwrap]");
  const indicator = wrap?.querySelector<HTMLElement>("[data-chip-indicator]");
  if (!(wrap instanceof HTMLElement) || !(indicator instanceof HTMLElement)) return null;

  const chips = Array.from(wrap.querySelectorAll<HTMLElement>("[data-chip]"));
  if (chips.length === 0) return null;

  const checkboxToChip = new Map<HTMLInputElement, HTMLElement>();
  for (const checkbox of stackCheckboxes) {
    const chip = checkbox.closest<HTMLElement>("[data-chip]");
    if (chip instanceof HTMLElement) {
      checkboxToChip.set(checkbox, chip);
    }
  }

  let pinned: HTMLElement | null = null;
  let activeChip: HTMLElement | null = null;
  const outerOffset = 0;

  const moveTo = (chip: HTMLElement): void => {
    const wrapRect = wrap.getBoundingClientRect();
    const chipRect = chip.getBoundingClientRect();

    const rawLeft = chipRect.left - wrapRect.left + wrap.scrollLeft - outerOffset;
    const rawTop = chipRect.top - wrapRect.top + wrap.scrollTop - outerOffset;
    const width = chipRect.width + outerOffset * 2;
    const height = chipRect.height + outerOffset * 2;
    const maxLeft = Math.max(0, wrap.scrollWidth - width);
    const maxTop = Math.max(0, wrap.scrollHeight - height);
    const left = Math.min(Math.max(0, rawLeft), maxLeft);
    const top = Math.min(Math.max(0, rawTop), maxTop);

    indicator.style.width = `${width}px`;
    indicator.style.height = `${height}px`;
    indicator.style.transform = `translate3d(${left}px, ${top}px, 0)`;
    indicator.style.opacity = "1";
  };

  const hide = (): void => {
    indicator.style.opacity = "0";
  };

  const getLastSelectedChip = (): HTMLElement | null => {
    let lastSelected: HTMLElement | null = null;
    for (const checkbox of stackCheckboxes) {
      if (!checkbox.checked) continue;
      const chip = checkboxToChip.get(checkbox);
      if (chip) lastSelected = chip;
    }
    return lastSelected;
  };

  const anchorOrHide = (): void => {
    if (pinned) {
      activeChip = pinned;
      moveTo(pinned);
      return;
    }
    activeChip = null;
    hide();
  };

  const syncFromSelection = (): void => {
    pinned = getLastSelectedChip();
    if (document.activeElement instanceof Node && wrap.contains(document.activeElement)) return;
    if (wrap.matches(":hover")) return;
    anchorOrHide();
  };

  const onSelectionChange = (changedInput?: HTMLInputElement): void => {
    if (changedInput) {
      const changedChip = checkboxToChip.get(changedInput) ?? null;
      if (changedInput.checked && changedChip) {
        pinned = changedChip;
        activeChip = changedChip;
        moveTo(changedChip);
        return;
      }
    }

    pinned = getLastSelectedChip();
    anchorOrHide();
  };

  for (const chip of chips) {
    chip.addEventListener("mouseenter", () => {
      activeChip = chip;
      moveTo(chip);
    });

    chip.addEventListener("focusin", () => {
      activeChip = chip;
      moveTo(chip);
    });
  }

  wrap.addEventListener("mouseleave", () => {
    anchorOrHide();
  });

  wrap.addEventListener("focusout", (event) => {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && wrap.contains(nextTarget)) return;
    if (wrap.matches(":hover")) return;
    anchorOrHide();
  });

  let scrollRaf = 0;
  const refreshPosition = (): void => {
    if (!activeChip) return;
    moveTo(activeChip);
  };
  wrap.addEventListener(
    "scroll",
    () => {
      if (scrollRaf) return;
      scrollRaf = window.requestAnimationFrame(() => {
        scrollRaf = 0;
        refreshPosition();
      });
    },
    { passive: true },
  );

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      refreshPosition();
    }, 120);
  });

  pinned = getLastSelectedChip();
  if (pinned) {
    activeChip = pinned;
    moveTo(pinned);
  } else {
    hide();
  }

  return {
    syncFromSelection,
    onSelectionChange,
  };
};
