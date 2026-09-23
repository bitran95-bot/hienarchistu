export interface ProjectForPage {
  _id: string;
  name: string;
  slug?: { current: string };
  generalInfo?: string;
  content?: string;
  image?: { asset?: { _ref: string } };
  firstMagazineImage?: { asset?: { _ref: string } };
  firstGalleryImage?: { asset?: { _ref: string } };
}

export function slugifyProjectName(name: string): string {
  return name
    .replace(/[đĐ]/g, char => char === 'đ' ? 'd' : 'D')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'project';
}

export function projectSlug(project: Pick<ProjectForPage, 'name' | 'slug'>): string {
  return slugifyProjectName(project.slug?.current?.trim() || project.name);
}

export function projectPath(project: Pick<ProjectForPage, 'name' | 'slug'>): string {
  return `/projects/${encodeURIComponent(projectSlug(project))}`;
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}

export function renderProjectHtml(template: string, project: ProjectForPage, origin: string, imageUrl: string): string {
  const url = new URL(projectPath(project), origin).toString();
  const title = `${project.name} | Hiên Archi Studio`;
  const description = project.generalInfo?.replace(/\s+/g, ' ').trim().slice(0, 160)
    || 'Dự án kiến trúc và nội thất của Hiên Archi Studio.';
  const meta = [
    ['name', 'description', description],
    ['property', 'og:title', title],
    ['property', 'og:description', description],
    ['property', 'og:type', 'article'],
    ['property', 'og:url', url],
    ['property', 'og:image', imageUrl],
    ['property', 'og:locale', 'vi_VN'],
    ['property', 'og:site_name', 'Hiên Archi Studio'],
    ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:title', title],
    ['name', 'twitter:description', description],
    ['name', 'twitter:image', imageUrl],
  ].map(([attribute, key, value]) => `<meta ${attribute}="${escapeHtml(key)}" content="${escapeHtml(value)}" data-static-seo>`).join('');
  const paragraphs = [project.generalInfo, project.content]
    .filter((value): value is string => Boolean(value))
    .map(value => `<p style="white-space:pre-line;line-height:1.7">${escapeHtml(value)}</p>`).join('');
  const image = imageUrl.endsWith('/og-image.png') ? ''
    : `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(project.name)}" style="max-width:100%;height:auto">`;
  const body = `<main style="max-width:1100px;margin:4rem auto;padding:0 1.5rem;font-family:serif"><h1>${escapeHtml(project.name)}</h1>${paragraphs}${image}</main>`;

  if (!template.includes('<div id="root"></div>') || !template.includes('</head>')) {
    throw new Error('The built HTML template is missing the expected app shell.');
  }
  return template
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, `<title data-static-seo>${escapeHtml(title)}</title>`)
    .replace(/<(?:meta|link)\b[^>]*\bdata-static-seo\b[^>]*>/gi, '')
    .replace('</head>', `${meta}<link rel="canonical" href="${escapeHtml(url)}" data-static-seo></head>`)
    .replace(/<noscript>[\s\S]*?<\/noscript>/i, '')
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}

export function renderSitemap(origin: string, paths: string[]): string {
  const entries = paths.map(path => `  <url><loc>${escapeHtml(new URL(path, origin).toString())}</loc></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;
}
