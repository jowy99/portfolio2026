(() => {
  const forms = Array.from(document.querySelectorAll("[data-contact-form]"));
  if (forms.length === 0) return;

  const queryStatus = new URLSearchParams(window.location.search).get("contact");
  const queryStatusMap = {
    sent: "success",
    invalid: "invalid",
    rate_limit: "rateLimit",
    service_unavailable: "unavailable",
    send_error: "error",
  };
  const STATUS_ANIMATION_MS = 200;
  const STATUS_SUCCESS_HIDE_MS = 5200;
  const hideTimers = new WeakMap();
  const cleanupTimers = new WeakMap();
  const SVG_NS = "http://www.w3.org/2000/svg";
  const toastMounted = new WeakSet();

  const getMessage = (form, code) => {
    const dataset = form.dataset;
    if (code === "success") return dataset.msgSuccess || "";
    if (code === "sending") return dataset.msgSending || "";
    if (code === "invalid") return dataset.msgInvalid || dataset.msgError || "";
    if (typeof code === "string" && code.startsWith("invalid_")) return dataset.msgInvalid || dataset.msgError || "";
    if (code === "rate_limited") return dataset.msgRateLimit || dataset.msgError || "";
    if (code === "service_unavailable") return dataset.msgUnavailable || dataset.msgError || "";
    if (code === "rateLimit") return dataset.msgRateLimit || dataset.msgError || "";
    if (code === "unavailable") return dataset.msgUnavailable || dataset.msgError || "";
    return dataset.msgError || "";
  };

  const createStatusIcon = (type) => {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");

    if (type === "info") {
      const track = document.createElementNS(SVG_NS, "circle");
      track.setAttribute("cx", "12");
      track.setAttribute("cy", "12");
      track.setAttribute("r", "8");
      track.setAttribute("opacity", "0.3");

      const arc = document.createElementNS(SVG_NS, "path");
      arc.setAttribute("d", "M20 12a8 8 0 0 0-8-8");
      arc.setAttribute("class", "notice-spinner");

      svg.append(track, arc);
      return svg;
    }

    if (type === "success") {
      const circle = document.createElementNS(SVG_NS, "circle");
      circle.setAttribute("cx", "12");
      circle.setAttribute("cy", "12");
      circle.setAttribute("r", "9");
      circle.setAttribute("opacity", "0.3");

      const check = document.createElementNS(SVG_NS, "path");
      check.setAttribute("d", "M7 12.5l3.2 3.2L17 9.2");

      svg.append(circle, check);
      return svg;
    }

    const triangle = document.createElementNS(SVG_NS, "path");
    triangle.setAttribute("d", "M12 4.2 20 19H4L12 4.2Z");
    triangle.setAttribute("opacity", "0.3");

    const line = document.createElementNS(SVG_NS, "path");
    line.setAttribute("d", "M12 9.4v5");

    const dot = document.createElementNS(SVG_NS, "circle");
    dot.setAttribute("cx", "12");
    dot.setAttribute("cy", "16.7");
    dot.setAttribute("r", "0.7");
    dot.setAttribute("fill", "currentColor");
    dot.setAttribute("stroke", "none");

    svg.append(triangle, line, dot);
    return svg;
  };

  const renderStatusContent = (statusEl, type, message) => {
    if (!(statusEl instanceof HTMLElement)) return;
    statusEl.replaceChildren();

    const icon = document.createElement("span");
    icon.className = "notice-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.append(createStatusIcon(type));

    const text = document.createElement("span");
    text.className = "notice-text";
    text.textContent = message;

    statusEl.append(icon, text);
  };

  const clearStatusTimers = (statusEl) => {
    const hideTimer = hideTimers.get(statusEl);
    if (hideTimer) {
      window.clearTimeout(hideTimer);
      hideTimers.delete(statusEl);
    }
    const cleanupTimer = cleanupTimers.get(statusEl);
    if (cleanupTimer) {
      window.clearTimeout(cleanupTimer);
      cleanupTimers.delete(statusEl);
    }
  };

  const hideStatus = (statusEl) => {
    if (!(statusEl instanceof HTMLElement)) return;
    clearStatusTimers(statusEl);
    statusEl.classList.remove("is-visible");
    statusEl.setAttribute("aria-hidden", "true");

    const cleanupTimer = window.setTimeout(() => {
      if (statusEl.classList.contains("is-visible")) return;
      statusEl.classList.add("hidden");
      statusEl.classList.remove("is-success", "is-error", "is-info");
      statusEl.replaceChildren();
    }, STATUS_ANIMATION_MS);

    cleanupTimers.set(statusEl, cleanupTimer);
  };

  const showStatus = (statusEl, type, message, { autoHideMs = 0 } = {}) => {
    if (!(statusEl instanceof HTMLElement)) return;
    if (!message) return;
    clearStatusTimers(statusEl);
    statusEl.classList.remove("hidden", "is-success", "is-error", "is-info", "is-visible");
    statusEl.setAttribute("aria-hidden", "false");
    renderStatusContent(statusEl, type, message);

    if (type === "success") {
      statusEl.classList.add("is-success");
      statusEl.setAttribute("role", "status");
      statusEl.setAttribute("aria-live", "polite");
    } else if (type === "info") {
      statusEl.classList.add("is-info");
      statusEl.setAttribute("role", "status");
      statusEl.setAttribute("aria-live", "polite");
    } else {
      statusEl.classList.add("is-error");
      statusEl.setAttribute("role", "alert");
      statusEl.setAttribute("aria-live", "assertive");
    }

    window.requestAnimationFrame(() => {
      statusEl.classList.add("is-visible");
    });

    if (autoHideMs > 0) {
      const hideTimer = window.setTimeout(() => hideStatus(statusEl), autoHideMs);
      hideTimers.set(statusEl, hideTimer);
    }
  };

  for (const node of forms) {
    if (!(node instanceof HTMLFormElement)) continue;
    const form = node;
    const statusEl = form.querySelector("[data-contact-status]");
    const toastEl = form.querySelector("[data-contact-toast]");
    const submitButton = form.querySelector("[data-contact-submit]");
    const startedAtInput = form.querySelector("[data-contact-started-at]");

    if (toastEl instanceof HTMLElement && !toastMounted.has(toastEl)) {
      document.body.append(toastEl);
      toastMounted.add(toastEl);
    }

    if (startedAtInput instanceof HTMLInputElement && !startedAtInput.value) {
      startedAtInput.value = String(Date.now());
    }

    if (queryStatus) {
      const mappedStatus = queryStatusMap[queryStatus];
      if (mappedStatus === "success") {
        hideStatus(statusEl);
        showStatus(toastEl, "success", getMessage(form, mappedStatus), { autoHideMs: STATUS_SUCCESS_HIDE_MS });
      } else if (mappedStatus) {
        hideStatus(statusEl);
        showStatus(toastEl, "error", getMessage(form, mappedStatus));
      }
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      if (!(submitButton instanceof HTMLButtonElement)) return;
      const defaultLabel = submitButton.dataset.labelDefault || submitButton.textContent || "";
      const sendingLabel = submitButton.dataset.labelSending || defaultLabel;

      submitButton.disabled = true;
      submitButton.textContent = sendingLabel;
      form.setAttribute("aria-busy", "true");
      hideStatus(toastEl);
      showStatus(statusEl, "info", getMessage(form, "sending"));

      const formData = new FormData(form);
      if (startedAtInput instanceof HTMLInputElement && !startedAtInput.value) {
        startedAtInput.value = String(Date.now());
        formData.set("form_started_at", startedAtInput.value);
      }

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: formData,
          headers: {
            accept: "application/json",
          },
        });

        const payload = await response.json().catch(() => null);
        const isSuccess = response.ok && payload && payload.ok === true;

        if (isSuccess) {
          form.reset();
          if (startedAtInput instanceof HTMLInputElement) {
            startedAtInput.value = String(Date.now());
          }
          hideStatus(statusEl);
          showStatus(toastEl, "success", getMessage(form, "success"), { autoHideMs: STATUS_SUCCESS_HIDE_MS });
          return;
        }

        const errorCode = payload && typeof payload.error === "string" ? payload.error : "error";
        hideStatus(statusEl);
        showStatus(toastEl, "error", getMessage(form, errorCode));
      } catch {
        hideStatus(statusEl);
        showStatus(toastEl, "error", getMessage(form, "error"));
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = defaultLabel;
        form.removeAttribute("aria-busy");
      }
    });
  }

  if (queryStatus) {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete("contact");
    history.replaceState(null, "", `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
  }
})();
