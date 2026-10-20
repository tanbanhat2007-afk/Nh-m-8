import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  content: string;
  className?: string;
  inline?: boolean;
}

export const MathView: React.FC<MathViewProps> = ({ content, className = '', inline = false }) => {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    // First replace block math: $$...$$
    let text = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
      try {
        return `<div class="my-2 overflow-x-auto text-center">${katex.renderToString(math.trim(), {
          displayMode: true,
          throwOnError: false,
        })}</div>`;
      } catch (e) {
        return `<code class="text-rose-500">${math}</code>`;
      }
    });

    // Replace inline math: $...$
    text = text.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), {
          displayMode: false,
          throwOnError: false,
        });
      } catch (e) {
        return `<code class="text-rose-500">${math}</code>`;
      }
    });

    // Simple markdown touches: bold, italic, code, line breaks
    text = text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
      .replace(/### (.*?)\n/g, '<h4 class="text-base font-semibold text-slate-900 mt-3 mb-1">$1</h4>')
      .replace(/## (.*?)\n/g, '<h3 class="text-lg font-semibold text-slate-900 mt-4 mb-2">$1</h3>')
      .replace(/\n\n/g, '<div class="h-2"></div>')
      .replace(/\n/g, '<br />');

    return text;
  }, [content]);

  if (inline) {
    return <span className={`inline-block ${className}`} dangerouslySetInnerHTML={{ __html: renderedHtml }} />;
  }

  return <div className={`leading-relaxed text-slate-700 ${className}`} dangerouslySetInnerHTML={{ __html: renderedHtml }} />;
};

export default MathView;
