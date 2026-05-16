"use client";

interface Props {
  content: string;
}

export function MarkdownContent({ content }: Props) {
  const elements: React.ReactNode[] = [];
  const lines = content.split("\n");
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.trimStart().startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(
        <pre
          key={key++}
          className="bg-ink/5 dark:bg-cream-200/5 border border-ink/10 dark:border-cream-200/10 p-4 overflow-x-auto text-xs font-mono leading-relaxed text-ink dark:text-cream-200 my-4"
        >
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }

    // Table (line starts with |)
    if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      const isHeaderSep = (l: string) => /^\|[\s|:-]+\|$/.test(l.replace(/[^|:\s-]/g, ""));
      const dataRows = tableLines.filter((l) => !isHeaderSep(l));
      if (dataRows.length >= 2) {
        const header = dataRows[0].split("|").filter(Boolean).map((c) => c.trim());
        const body = dataRows.slice(1);
        elements.push(
          <div key={key++} className="overflow-x-auto my-4">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  {header.map((h, hi) => (
                    <th
                      key={hi}
                      className="text-left px-3 py-2 border border-ink/15 dark:border-cream-200/15 font-bold uppercase tracking-widest text-ink/60 dark:text-cream-200/60 bg-ink/5 dark:bg-cream-200/5"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, ri) => (
                  <tr key={ri}>
                    {row
                      .split("|")
                      .filter(Boolean)
                      .map((cell, ci) => (
                        <td
                          key={ci}
                          className="px-3 py-2 border border-ink/10 dark:border-cream-200/10 text-ink/70 dark:text-cream-200/70 font-mono"
                        >
                          {renderInline(cell.trim())}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // Heading ##
    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={key++}
          className="text-base font-black uppercase tracking-tight text-ink dark:text-cream-200 mt-8 mb-3 first:mt-0"
        >
          {line.slice(3)}
        </h2>
      );
      i++;
      continue;
    }

    // Heading ###
    if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={key++}
          className="text-sm font-bold uppercase tracking-tight text-ink dark:text-cream-200 mt-6 mb-2"
        >
          {line.slice(4)}
        </h3>
      );
      i++;
      continue;
    }

    // Unordered list
    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={key++} className="list-disc list-inside space-y-1 my-3 text-sm text-ink/70 dark:text-cream-200/70">
          {items.map((item, ii) => (
            <li key={ii}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Blank line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph
    const paraLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("#") && !lines[i].startsWith("- ") && !lines[i].startsWith("|") && !lines[i].trimStart().startsWith("```")) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      elements.push(
        <p key={key++} className="text-sm text-ink/80 dark:text-cream-200/80 leading-relaxed my-3">
          {renderInline(paraLines.join(" "))}
        </p>
      );
    }
  }

  return <div className="space-y-0">{elements}</div>;
}

function renderInline(text: string): React.ReactNode {
  // Split on **bold** and `code` markers
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-bold text-ink dark:text-cream-200">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="text-xs font-mono bg-ink/5 dark:bg-cream-200/5 px-1 py-0.5 text-ink dark:text-cream-200">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
