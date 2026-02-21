import React from 'react';

const renderInline = (text: string, keyPrefix: string): React.ReactNode[] => {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.filter(Boolean).map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${keyPrefix}-b-${idx}`}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={`${keyPrefix}-c-${idx}`} className="px-1 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800/60">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={`${keyPrefix}-t-${idx}`}>{part}</React.Fragment>;
  });
};

export const renderMarkdown = (content: string): React.ReactNode => {
  const lines = content.split('\n');
  const nodes: React.ReactNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const headingMatch = /^(#{1,3})\s+(.*)$/.exec(line);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const cls = level === 1 ? 'text-xl font-bold' : level === 2 ? 'text-lg font-bold' : 'text-base font-semibold';
      nodes.push(
        <div key={`h-${i}`} className={`${cls} mt-3 first:mt-0`}>
          {renderInline(text, `h-${i}`)}
        </div>
      );
      i++;
      continue;
    }

    if (/^-\s+\[[xX ]\]\s+/.test(line) || /^[-*]\s+/.test(line)) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length && (/^-\s+\[[xX ]\]\s+/.test(lines[i]) || /^[-*]\s+/.test(lines[i]))) {
        const item = lines[i];
        const checkbox = /^-\s+\[([xX ])\]\s+(.*)$/.exec(item);
        if (checkbox) {
          const checked = checkbox[1].toLowerCase() === 'x';
          listItems.push(
            <li key={`li-${i}`} className="flex items-start gap-2">
              <span className={`mt-1 text-xs ${checked ? 'text-emerald-500' : 'text-zinc-400'}`}>{checked ? '✓' : '○'}</span>
              <span className={checked ? 'line-through opacity-70' : ''}>{renderInline(checkbox[2], `li-${i}`)}</span>
            </li>
          );
        } else {
          const txt = item.replace(/^[-*]\s+/, '');
          listItems.push(<li key={`li-${i}`}>{renderInline(txt, `li-${i}`)}</li>);
        }
        i++;
      }
      nodes.push(
        <ul key={`ul-${i}`} className="list-disc pl-5 space-y-1 my-2">
          {listItems}
        </ul>
      );
      continue;
    }

    if (!line.trim()) {
      nodes.push(<div key={`br-${i}`} className="h-2" />);
      i++;
      continue;
    }

    nodes.push(
      <p key={`p-${i}`} className="leading-relaxed">
        {renderInline(line, `p-${i}`)}
      </p>
    );
    i++;
  }

  return <div className="space-y-1 text-sm text-zinc-800 dark:text-zinc-300">{nodes}</div>;
};
