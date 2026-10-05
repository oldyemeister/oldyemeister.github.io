import { execFileSync } from 'node:child_process';
import { readFile, readdir, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, dirname, relative } from 'node:path';
import { personaPreview } from '../templates/persona/render.mjs';

const root = resolve(import.meta.dirname, '..');
const production = process.argv.includes('--production');
const destination = production ? resolve(root, '_site') : resolve('/private/tmp/personal-website-preview');
function loadYaml(path) {
  return JSON.parse(execFileSync('ruby', [
  '-ryaml', '-rjson', '-e', 'puts JSON.generate(YAML.load_file(ARGV[0]))',
  resolve(root, path)
  ], { encoding: 'utf8' }));
}
const data = loadYaml('_data/content.yml');
const config = loadYaml('_config.yml');

function frontMatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n/);
  const page = match ? JSON.parse(execFileSync('ruby', [
    '-ryaml', '-rjson', '-e', 'puts JSON.generate(YAML.load(STDIN.read))'
  ], { input: match[1], encoding: 'utf8' })) : {};
  return { page, body: match ? source.slice(match[0].length) : source };
}

function valueOf(expression, environment) {
  const path = expression.trim();
  const notEmpty = path.match(/^(.+?)\s*!=\s*empty$/);
  if (notEmpty) {
    const value = valueOf(notEmpty[1], environment);
    return value !== undefined && value !== null && value !== '';
  }
  const isEmpty = path.match(/^(.+?)\s*==\s*empty$/);
  if (isEmpty) {
    const value = valueOf(isEmpty[1], environment);
    return value === undefined || value === null || value === '';
  }
  if ((path.startsWith('"') && path.endsWith('"')) || (path.startsWith("'") && path.endsWith("'"))) return path.slice(1, -1);
  return path.split('.').reduce((value, key) => value?.[key], environment);
}

// Intrinsic size of a local WebP, PNG or JPEG, so lazy images reserve their space.
function imageSize(src) {
  const path = resolve(root, src.replace(/^\//, ''));
  if (!src.startsWith('/') || !existsSync(path)) return null;
  const bytes = readFileSync(path);
  if (bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = bytes.toString('ascii', 12, 16);
    if (chunk === 'VP8X') return { width: 1 + bytes.readUIntLE(24, 3), height: 1 + bytes.readUIntLE(27, 3) };
    if (chunk === 'VP8L') {
      const bits = bytes.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    if (chunk === 'VP8 ') return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
  }
  if (bytes.readUInt32BE(0) === 0x89504e47) return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    for (let offset = 2; offset < bytes.length;) {
      const marker = bytes[offset + 1];
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { width: bytes.readUInt16BE(offset + 7), height: bytes.readUInt16BE(offset + 5) };
      }
      offset += 2 + bytes.readUInt16BE(offset + 2);
    }
  }
  return null;
}

function markdownImage(alt, src) {
  const size = imageSize(src);
  const dimensions = size ? ` width="${size.width}" height="${size.height}"` : '';
  return `<img src="${src}" alt="${alt}"${dimensions} loading="lazy" decoding="async">`;
}

function inlineMarkdown(text) {
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => markdownImage(alt, src))
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

function markdownToHtml(source) {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let paragraph = [];
  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`);
    paragraph = [];
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();
    if (!trimmed) { flushParagraph(); continue; }

    const attribute = trimmed.match(/^\{:\s*\.([\w-]+)\s*}$/);
    if (attribute) {
      flushParagraph();
      const last = blocks.pop();
      if (last) blocks.push(last.replace(/^<([a-z0-9]+)/, `<$1 class="${attribute[1]}"`));
      continue;
    }

    const heading = trimmed.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      const level = heading[1].length;
      blocks.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    if (/^\|.+\|$/.test(trimmed) && /^\|[\s:|-]+\|$/.test(lines[index + 1]?.trim() || '')) {
      flushParagraph();
      const rows = [];
      const cells = (row) => row.slice(1, -1).split('|').map((cell) => cell.trim());
      rows.push(cells(trimmed));
      index += 2;
      while (index < lines.length && /^\|.+\|$/.test(lines[index].trim())) {
        rows.push(cells(lines[index].trim()));
        index += 1;
      }
      index -= 1;
      const header = `<thead><tr>${rows[0].map((cell) => `<th>${inlineMarkdown(cell)}</th>`).join('')}</tr></thead>`;
      const body = `<tbody>${rows.slice(1).map((row) => `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join('')}</tr>`).join('')}</tbody>`;
      blocks.push(`<table>${header}${body}</table>`);
      continue;
    }

    if (/^!\[[^\]]*\]\([^)]+\)$/.test(trimmed)) {
      flushParagraph();
      blocks.push(`<p>${inlineMarkdown(trimmed)}</p>`);
      continue;
    }

    if (trimmed.startsWith('> ')) {
      flushParagraph();
      blocks.push(`<blockquote><p>${inlineMarkdown(trimmed.slice(2))}</p></blockquote>`);
      continue;
    }

    const unordered = trimmed.match(/^[-*]\s+(.+)$/);
    if (unordered) {
      flushParagraph();
      const items = [unordered[1]];
      while (index + 1 < lines.length) {
        const next = lines[index + 1].trim().match(/^[-*]\s+(.+)$/);
        if (!next) break;
        items.push(next[1]);
        index += 1;
      }
      blocks.push(`<ul>${items.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('')}</ul>`);
      continue;
    }

    const ordered = trimmed.match(/^\d+\.\s+(.+)$/);
    if (ordered) {
      flushParagraph();
      const items = [ordered[1]];
      while (index + 1 < lines.length) {
        const next = lines[index + 1].trim().match(/^\d+\.\s+(.+)$/);
        if (!next) break;
        items.push(next[1]);
        index += 1;
      }
      blocks.push(`<ol>${items.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('')}</ol>`);
      continue;
    }

    paragraph.push(trimmed);
  }
  flushParagraph();
  return blocks.join('\n');
}

function applyFilters(expression, environment) {
  const parts = expression.split('|').map((part) => part.trim());
  let value = valueOf(parts.shift(), environment);
  for (const filter of parts) {
    const [name, argument] = filter.split(':').map((part) => part.trim());
    if (name === 'default' && (value === undefined || value === null || value === '')) value = valueOf(argument, environment);
    if (name === 'relative_url') value = value ?? '';
    if (name === 'absolute_url') {
      const path = String(value ?? '');
      if (!/^https?:\/\//.test(path)) {
        const origin = String(environment.site?.url || '').replace(/\/$/, '');
        const baseurl = String(environment.site?.baseurl || '').replace(/^\/?/, '/').replace(/\/$/, '');
        value = `${origin}${baseurl}${path.startsWith('/') ? '' : '/'}${path}`;
      }
    }
    if (name === 'jsonify') value = JSON.stringify(value);
    if (name === 'upcase') value = String(value).toUpperCase();
    if (name === 'slice') value = String(value).slice(Number(argument), Number(argument) + 1);
    if (name === 'markdownify') value = String(value).split(/\n\s*\n/).map((paragraph) => `<p>${paragraph.trim()}</p>`).join('\n');
  }
  return value ?? '';
}

function findBlock(template, type) {
  const opening = new RegExp(`{%\\s*${type}\\s+([^%]+)%}`);
  const start = opening.exec(template);
  if (!start) return null;
  const tokens = new RegExp(`{%\\s*(${type}|end${type})\\b[^%]*%}`, 'g');
  tokens.lastIndex = start.index;
  let depth = 0;
  let token;
  while ((token = tokens.exec(template))) {
    depth += token[1] === type ? 1 : -1;
    if (depth === 0) {
      return {
        start: start.index,
        end: tokens.lastIndex,
        expression: start[1].trim(),
        body: template.slice(start.index + start[0].length, token.index)
      };
    }
  }
  throw new Error(`Unclosed ${type} block.`);
}

function render(template, environment) {
  environment = { ...environment };
  template = template.replace(/{%\s*assign\s+(\w+)\s*=\s*([^%]+)%}/g, (_, name, expression) => {
    environment[name] = applyFilters(expression, environment);
    return '';
  });
  let block;
  while ((block = findBlock(template, 'for'))) {
    const match = block.expression.match(/^(\w+)\s+in\s+(.+)$/);
    const values = valueOf(match[2], environment) || [];
    const output = values.map((value) => render(block.body, { ...environment, [match[1]]: value })).join('');
    template = template.slice(0, block.start) + output + template.slice(block.end);
  }
  while ((block = findBlock(template, 'if'))) {
    const result = valueOf(block.expression, environment) ? render(block.body, environment) : '';
    template = template.slice(0, block.start) + result + template.slice(block.end);
  }
  return template.replace(/{{\s*([^}]+)\s*}}/g, (_, expression) => applyFilters(expression, environment));
}

// --- Asset versioning and CSS bundling -------------------------------------
// Every JS/CSS URL carries ?v=<hash of the file's final content>, so a deploy
// never serves a stale file under GitHub Pages' 10-minute cache. JS modules are
// rewritten first so an importer's hash also changes when a dependency does.
const hash = (content) => createHash('sha256').update(content).digest('hex').slice(0, 10);
const finalAssets = new Map(); // site path (/assets/...) -> final content

async function versionModules() {
  const importPattern = /(\bfrom\s*|\bimport\s*\(\s*)(['"])(\.{1,2}\/[^'"?]+\.m?js)(\?[^'"]*)?\2/g;
  const sources = new Map();
  const walk = async (directory) => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) await walk(path);
      else if (/\.m?js$/.test(entry.name)) sources.set(`/${relative(destination, path)}`, await readFile(path, 'utf8'));
    }
  };
  await walk(resolve(destination, 'assets'));
  const visiting = new Set();
  const finalize = (sitePath) => {
    if (finalAssets.has(sitePath)) return finalAssets.get(sitePath);
    if (visiting.has(sitePath)) throw new Error(`Circular module import through ${sitePath}`);
    visiting.add(sitePath);
    const content = sources.get(sitePath).replace(importPattern, (match, keyword, quote, specifier) => {
      const target = new URL(specifier, `https://site${sitePath}`).pathname;
      if (!sources.has(target)) throw new Error(`${sitePath} imports missing module ${specifier}`);
      return `${keyword}${quote}${specifier}?v=${hash(finalize(target))}${quote}`;
    });
    visiting.delete(sitePath);
    finalAssets.set(sitePath, content);
    return content;
  };
  for (const sitePath of sources.keys()) {
    await writeFile(resolve(destination, sitePath.slice(1)), finalize(sitePath));
  }
}

async function assetContent(sitePath) {
  if (!finalAssets.has(sitePath)) finalAssets.set(sitePath, await readFile(resolve(destination, sitePath.slice(1)), 'utf8'));
  return finalAssets.get(sitePath);
}

// A page's stylesheets become one file, concatenated in their original cascade
// order, with relative url()s rewritten so fonts still resolve.
async function bundleStyles(html) {
  const head = html.slice(0, html.indexOf('</head>'));
  const links = [...head.matchAll(/<link rel="stylesheet" href="(\/assets\/[^"?]+\.css)(?:\?[^"]*)?">\s*/g)];
  if (links.length < 2) return html;
  const parts = [];
  for (const [, sitePath] of links) {
    const css = (await assetContent(sitePath)).replace(/url\((['"]?)(?!data:|#|\/|https?:)([^'")]+)\1\)/g,
      (_, quote, url) => `url(${quote}${new URL(url, `https://site${sitePath}`).pathname}${quote})`);
    parts.push(`/* ${sitePath} */\n${css}`);
  }
  const bundle = parts.join('\n');
  const bundlePath = `/assets/bundles/${hash(bundle)}.css`;
  await mkdir(resolve(destination, 'assets/bundles'), { recursive: true });
  await writeFile(resolve(destination, bundlePath.slice(1)), bundle);
  let first = true;
  return html.replace(/<link rel="stylesheet" href="\/assets\/[^"?]+\.css(?:\?[^"]*)?">\s*/g, (tag, offset) => {
    if (offset > html.indexOf('</head>')) return tag;
    if (!first) return '';
    first = false;
    return `<link rel="stylesheet" href="${bundlePath}">\n    `;
  });
}

async function versionReferences(html) {
  const references = [...html.matchAll(/\b(src|href|data-module)="(\/assets\/(?!bundles\/)[^"?]+\.(?:m?js|css))(?:\?[^"]*)?"/g)];
  const versions = new Map();
  for (const [, , sitePath] of references) versions.set(sitePath, hash(await assetContent(sitePath)));
  return html.replace(/\b(src|href|data-module)="(\/assets\/(?!bundles\/)[^"?]+\.(?:m?js|css))(?:\?[^"]*)?"/g,
    (_, attribute, sitePath) => `${attribute}="${sitePath}?v=${versions.get(sitePath)}"`);
}

const finalizePage = async (html) => versionReferences(await bundleStyles(html));

// The /original/ and /persona/ copies stay reachable but out of search results;
// each copy's canonical link still points at the root page.
const noindex = (html) => html.replace('</head>', '  <meta name="robots" content="noindex, follow">\n  </head>');

async function buildPage(sourcePath, outputPath) {
  const source = await readFile(resolve(root, sourcePath), 'utf8');
  const { page, body } = frontMatter(source);
  page.url = `/${outputPath.replace(/(^|\/)index\.html$/, '$1')}`;
  page.og_type = page.url === '/' ? 'website' : 'article';
  page.project = outputPath.startsWith('projects/');
  // Game pages name their content.yml block; its description feeds the meta tags.
  if (page.content_key && !page.description) page.description = data[page.content_key]?.description;
  const pageEnvironment = {
    site: { ...config, data: { content: data } }, site_content: data, laser: data.laser,
    game: data.donkey_kong, imu: data.imu_sandbox, page
  };
  let renderedBody = sourcePath.endsWith('.md') ? markdownToHtml(body) : render(body, pageEnvironment);
  if (page.layout && page.layout !== 'default') {
    const nestedLayoutSource = await readFile(resolve(root, `_layouts/${page.layout}.html`), 'utf8');
    const nestedLayout = frontMatter(nestedLayoutSource).body;
    renderedBody = render(nestedLayout, { ...pageEnvironment, content: renderedBody });
  }
  const layout = await readFile(resolve(root, '_layouts/default.html'), 'utf8');
  const navigation = render(await readFile(resolve(root, '_includes/navigation.html'), 'utf8'), pageEnvironment);
  const footer = render(await readFile(resolve(root, '_includes/footer.html'), 'utf8'), pageEnvironment);
  const assembled = layout
    .replace('{% include navigation.html %}', navigation)
    .replace('{% include footer.html %}', footer)
    .replace('{{ content }}', renderedBody);
  const output = render(assembled, { ...pageEnvironment, content: renderedBody });
  await mkdir(dirname(resolve(destination, outputPath)), { recursive: true });
  await writeFile(resolve(destination, outputPath), await finalizePage(production ? personaPreview(output, '', true, data.ui) : output));
  if (production) {
    const originalPath = resolve(destination, 'original', outputPath);
    const original = output.replace(/href="(\/[^"#?]*)([^" ]*)"/g, (match, path, suffix) =>
      path === '/' || path.startsWith('/projects/') || path === '/404.html'
        ? `href="/original${path}${suffix}"` : match);
    await mkdir(dirname(originalPath), { recursive: true });
    await writeFile(originalPath, await finalizePage(noindex(original)));
  }
  // Retain /persona/ for preview links and existing bookmarks.
  const alternatePath = resolve(destination, 'persona', outputPath);
  await mkdir(dirname(alternatePath), { recursive: true });
  await writeFile(alternatePath, await finalizePage(noindex(personaPreview(output, '/persona', true, data.ui))));
  return page;
}

await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(resolve(root, 'assets'), resolve(destination, 'assets'), {
  recursive: true,
  filter: source => !source.endsWith('/.DS_Store') &&
    (!production || source !== resolve(root, 'assets/images/projects/aps380/APS380_Group8.mp4'))
});
if (production) await writeFile(resolve(destination, '.nojekyll'), '');
await versionModules();
// Every projects/<name>/index.html or index.md is a page; empty folders are skipped.
const projectPages = [];
for (const entry of (await readdir(resolve(root, 'projects'), { withFileTypes: true })).filter(e => e.isDirectory())) {
  const source = ['index.html', 'index.md'].map(file => `projects/${entry.name}/${file}`)
    .find(path => existsSync(resolve(root, path)));
  if (source) projectPages.push({ source, output: `projects/${entry.name}/index.html` });
}
const pages = [{ source: 'index.html', output: 'index.html' }, ...projectPages, { source: '404.html', output: '404.html' }];
const published = [];
for (const { source, output } of pages) {
  const page = await buildPage(source, output);
  if (page.published !== false && output !== '404.html') published.push(page.url);
}

const siteUrl = `${String(config.url || '').replace(/\/$/, '')}${String(config.baseurl || '').replace(/\/$/, '')}`;
await writeFile(resolve(destination, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${published.map(url => `  <url><loc>${siteUrl}${url}</loc></url>`).join('\n')}
</urlset>
`);
// The /original/ and /persona/ copies aren't disallowed here: crawlers must be
// able to fetch them to see their noindex tag.
await writeFile(resolve(destination, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
process.stdout.write(`${destination}\n`);
