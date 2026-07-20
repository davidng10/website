const FENCE_START = /^ {0,3}(`{3,}|~{3,})/;
const AUTOLINK = /^<(?:[a-z][a-z\d+.-]{0,31}:[^ <>]*|[^ <>@]+@[^ <>@]+)>/i;

function convertAutolink(autolink: string) {
  const label = autolink.slice(1, -1);
  const destination = label.includes(":") ? label : `mailto:${label}`;
  return `[${label}](${destination})`;
}

function escapeMdxProse(line: string) {
  let output = "";

  for (let index = 0; index < line.length; ) {
    const character = line[index];

    if (character === "\\" && index + 1 < line.length) {
      output += line.slice(index, index + 2);
      index += 2;
      continue;
    }

    if (character === "`") {
      let delimiterEnd = index + 1;
      while (line[delimiterEnd] === "`") delimiterEnd += 1;

      const delimiter = line.slice(index, delimiterEnd);
      const closingIndex = line.indexOf(delimiter, delimiterEnd);
      if (closingIndex !== -1) {
        output += line.slice(index, closingIndex + delimiter.length);
        index = closingIndex + delimiter.length;
        continue;
      }
    }

    if (character === "<") {
      const autolink = line.slice(index).match(AUTOLINK)?.[0];
      if (autolink) {
        output += convertAutolink(autolink);
        index += autolink.length;
        continue;
      }

      output += "&lt;";
    } else if (character === "{") {
      output += "&#123;";
    } else if (character === "}") {
      output += "&#125;";
    } else {
      output += character;
    }

    index += 1;
  }

  return output;
}

/** Makes plain Markdown safe to paste into an MDX file without changing its rendering. */
export function makeMarkdownMdxSafe(markdown: string) {
  let fenceCharacter = "";
  let fenceLength = 0;

  return markdown
    .split("\n")
    .map((line) => {
      const fence = line.match(FENCE_START)?.[1];

      if (fenceCharacter) {
        if (
          fence?.[0] === fenceCharacter &&
          fence.length >= fenceLength &&
          line.slice(line.indexOf(fence) + fence.length).trim() === ""
        ) {
          fenceCharacter = "";
          fenceLength = 0;
        }
        return line;
      }

      if (fence) {
        fenceCharacter = fence[0];
        fenceLength = fence.length;
        return line;
      }

      return escapeMdxProse(line);
    })
    .join("\n");
}

export async function copyMarkdown(markdown: string) {
  if (!navigator.clipboard?.writeText) {
    throw new Error("The Clipboard API is unavailable in this browser.");
  }

  await navigator.clipboard.writeText(makeMarkdownMdxSafe(markdown));
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
