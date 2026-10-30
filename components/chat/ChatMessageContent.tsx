import { Fragment, type ReactNode } from "react";
import styles from "./Chat.module.css";

function safeHref(value: string) {
  if (/^\/(?!\/)/.test(value) || /^#[\w-]+$/.test(value)) return value;
  try { const url = new URL(value); return ["https:", "http:", "mailto:"].includes(url.protocol) ? url.href : null; } catch { return null; }
}

// Deliberately small Markdown subset. Text is always escaped by React; raw HTML
// and remote images are never interpreted as markup.
function inline(text: string): ReactNode[] {
  const pattern = /(`[^`\n]+`|\*\*[^*\n]+\*\*|\*[^*\n]+\*|\[[^\]\n]+\]\([^\s)]+\))/g;
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    const token = match[0], index = match.index!;
    if (index > cursor) parts.push(text.slice(cursor, index));
    const key = index;
    if (token.startsWith("`")) parts.push(<code key={key}>{token.slice(1, -1)}</code>);
    else if (token.startsWith("**")) parts.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    else if (token.startsWith("*")) parts.push(<em key={key}>{token.slice(1, -1)}</em>);
    else {
      const end = token.indexOf("]("), label = token.slice(1, end), href = safeHref(token.slice(end + 2, -1));
      parts.push(href ? <a key={key} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined}>{label}</a> : <Fragment key={key}>{label}</Fragment>);
    }
    cursor = index + token.length;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

export function ChatMessageContent({ content }: { content: string }) {
  const lines = content.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  for (let index = 0; index < lines.length;) {
    const key = index, line = lines[index];
    if (!line.trim()) { index++; continue; }
    if (/^\s*```/.test(line)) {
      const code: string[] = []; index++;
      while (index < lines.length && !/^\s*```/.test(lines[index])) code.push(lines[index++]);
      if (index < lines.length) index++;
      blocks.push(<pre key={key} tabIndex={0} aria-label="Blok kode"><code>{code.join("\n")}</code></pre>);
    } else if (/^\s*([-*+] |\d+\. )/.test(line)) {
      const ordered = /^\s*\d+\. /.test(line), entries: ReactNode[] = [];
      const pattern = ordered ? /^\s*\d+\. / : /^\s*[-*+] /;
      while (index < lines.length && pattern.test(lines[index])) {
        entries.push(<li key={index}>{inline(lines[index++].replace(pattern, ""))}</li>);
      }
      blocks.push(ordered ? <ol key={key}>{entries}</ol> : <ul key={key}>{entries}</ul>);
    } else if (/^> ?/.test(line)) {
      const quote: string[] = [];
      while (index < lines.length && /^> ?/.test(lines[index])) quote.push(lines[index++].replace(/^> ?/, ""));
      blocks.push(<blockquote key={key}>{inline(quote.join("\n"))}</blockquote>);
    } else if (/^#{1,6} /.test(line)) {
      blocks.push(<h3 key={key}>{inline(line.replace(/^#{1,6} /, ""))}</h3>); index++;
    } else {
      const paragraph = [line]; index++;
      while (index < lines.length && lines[index].trim() && !/^\s*(```|[-*+] |\d+\. |>|#{1,6} )/.test(lines[index])) paragraph.push(lines[index++]);
      blocks.push(<p key={key}>{inline(paragraph.join("\n"))}</p>);
    }
  }
  return <div className={styles.richText} data-chat-content>{blocks}</div>;
}
