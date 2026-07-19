export async function copyMarkdown(markdown: string) {
  if (!navigator.clipboard?.writeText) {
    throw new Error("The Clipboard API is unavailable in this browser.");
  }

  await navigator.clipboard.writeText(markdown);
}

export function downloadMarkdown(markdown: string) {
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "blog-post.md";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
