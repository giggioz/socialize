export async function copyTextToClipboard(text: string): Promise<void> {
  if (!text) return;

  const clipboard = globalThis.navigator?.clipboard;
  if (clipboard?.writeText) {
    try {
      await clipboard.writeText(text);
      return;
    } catch {
      // Fallback below (can fail due to permissions / non-secure context).
    }
  }

  const doc = globalThis.document;
  if (!doc) throw new Error("Clipboard unavailable");

  const el = doc.createElement("textarea");
  el.value = text;

  // Keep the element out of view without affecting layout.
  el.setAttribute("readonly", "true");
  el.style.position = "fixed";
  el.style.top = "-9999px";
  el.style.left = "-9999px";
  el.style.opacity = "0";

  doc.body.appendChild(el);

  try {
    el.focus();
    el.select();
    el.setSelectionRange(0, el.value.length);

    const ok = doc.execCommand?.("copy") ?? false;
    if (!ok) throw new Error("Copy failed");
  } finally {
    el.remove();
  }
}

