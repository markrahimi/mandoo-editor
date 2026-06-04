'use client';

/**
 * Convert an HTML string to Markdown.
 * Handles common elements with regex-based transformation.
 */
export function htmlToMarkdown(html: string): string {
  let md = html;

  // 1. Headings h1–h6
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, c) => `\n\n# ${stripTags(c).trim()}\n\n`);
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, c) => `\n\n## ${stripTags(c).trim()}\n\n`);
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, c) => `\n\n### ${stripTags(c).trim()}\n\n`);
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, c) => `\n\n#### ${stripTags(c).trim()}\n\n`);
  md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, (_, c) => `\n\n##### ${stripTags(c).trim()}\n\n`);
  md = md.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, (_, c) => `\n\n###### ${stripTags(c).trim()}\n\n`);

  // 2. Strong / bold
  md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, (_, c) => `**${c}**`);
  md = md.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, (_, c) => `**${c}**`);

  // 3. Em / italic
  md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, (_, c) => `*${c}*`);
  md = md.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, (_, c) => `*${c}*`);

  // 4. Underline — strip tag, keep text
  md = md.replace(/<u[^>]*>([\s\S]*?)<\/u>/gi, (_, c) => c);

  // 5. Links
  md = md.replace(/<a[^>]+href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, url, text) => `[${stripTags(text)}](${url})`);

  // 6. Images
  md = md.replace(/<img[^>]+src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi, (_, src, alt) => `![${alt}](${src})`);
  md = md.replace(/<img[^>]+alt=["']([^"']*)["'][^>]+src=["']([^"']*)["'][^>]*\/?>/gi, (_, alt, src) => `![${alt}](${src})`);
  md = md.replace(/<img[^>]+src=["']([^"']*)["'][^>]*\/?>/gi, (_, src) => `![](${src})`);

  // 7. Blockquote
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, c) => {
    const inner = stripTags(c).trim();
    return inner.split('\n').map(line => `> ${line}`).join('\n') + '\n\n';
  });

  // 8. Inline code
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, c) => `\`${c}\``);

  // 9. Pre (code block)
  md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, c) => {
    const code = stripTags(c);
    return `\n\n\`\`\`\n${code}\n\`\`\`\n\n`;
  });

  // 10. Lists — process list items inside ul/ol
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, c) => {
    const items = c.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_2: string, item: string) => `- ${stripTags(item).trim()}\n`);
    return '\n' + items + '\n';
  });
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, c) => {
    let i = 0;
    const items = c.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_2: string, item: string) => {
      i++;
      return `${i}. ${stripTags(item).trim()}\n`;
    });
    return '\n' + items + '\n';
  });
  // Catch any stray <li> outside of lists
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, c) => `- ${stripTags(c).trim()}\n`);

  // 11. <br> → newline
  md = md.replace(/<br\s*\/?>/gi, '\n');

  // 12. <p> → paragraph with double newline
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, c) => `${c}\n\n`);

  // 13. Strip remaining HTML tags
  md = stripTags(md);

  // 14. Decode HTML entities
  md = md
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ');

  // 15. Collapse 3+ newlines to 2
  md = md.replace(/\n{3,}/g, '\n\n');

  return md.trim();
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}
