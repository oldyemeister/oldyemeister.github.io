// Small semantic additions for the optional redesign; original pages stay intact.
export function redesignContent(html) {
  return html.replace(/<article class="project-card[^\"]*">[\s\S]*?<\/article>/g, article => {
    const caption = article.match(/<img\b[^>]*\balt="([^\"]+)"/)?.[1];
    if (!caption) return article;
    return article.replace(/<div class="project-media">([\s\S]*?)<\/div>\s*(<div class="project-content">)/,
      (_, media, content) => `<figure class="project-visual"><div class="project-media">${media}</div><figcaption>${caption}</figcaption></figure>\n${content}`);
  });
}
