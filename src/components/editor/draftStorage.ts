const DRAFT_KEY = "wenbin-markdown-editor-draft-v1";

export function readDraft() {
  try {
    return window.localStorage.getItem(DRAFT_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveDraft(markdown: string) {
  try {
    window.localStorage.setItem(DRAFT_KEY, markdown);
  } catch {
    // Editing still works when storage is unavailable.
  }
}

export function clearDraft() {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // The in-memory document can still be cleared.
  }
}
