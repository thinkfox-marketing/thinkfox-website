// Markdown → HTML für CMS-Felder (Beitragstext, FAQ-Antworten, CTA-Text).
import { createMarkdownProcessor } from '@astrojs/markdown-remark';

const processor = await createMarkdownProcessor({ syntaxHighlight: false, gfm: true, smartypants: true });

export async function markdown(src: string): Promise<string> {
  if (!src.trim()) return '';
  return (await processor.render(src)).code;
}
