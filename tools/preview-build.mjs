import { execFileSync } from 'node:child_process';
import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const destination = resolve('/private/tmp/personal-website-preview');
const data = JSON.parse(execFileSync('ruby', [
  '-ryaml', '-rjson', '-e', 'puts JSON.generate(YAML.load_file(ARGV[0]))',
  resolve(root, '_data/content.yml')
], { encoding: 'utf8' }));

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

function inlineMarkdown(text) {
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
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
  template = template.replace(/{%\s*assign\s+\w+\s*=\s*[^%]+%}/g, '');
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

async function buildPage(sourcePath, outputPath) {
  const source = await readFile(resolve(root, sourcePath), 'utf8');
  const { page, body } = frontMatter(source);
  const pageEnvironment = {
    site: { data: { content: data } }, site_content: data, laser: data.laser,
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
  await writeFile(resolve(destination, outputPath), output);
}

await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(resolve(root, 'assets'), resolve(destination, 'assets'), { recursive: true });
await buildPage('index.html', 'index.html');
await buildPage('projects/laser/index.html', 'projects/laser/index.html');
await buildPage('projects/donkey-kong/index.html', 'projects/donkey-kong/index.html');
await buildPage('projects/imu-sandbox/index.html', 'projects/imu-sandbox/index.html');
await buildPage('projects/rf-receiver/index.md', 'projects/rf-receiver/index.html');
await buildPage('404.html', '404.html');
process.stdout.write(`${destination}\n`);
