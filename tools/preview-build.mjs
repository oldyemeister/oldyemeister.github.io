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
  const page = {};
  if (match) {
    for (const line of match[1].split('\n')) {
      const separator = line.indexOf(':');
      if (separator > 0) {
        const key = line.slice(0, separator).trim();
        const raw = line.slice(separator + 1).trim();
        page[key] = raw === 'true' ? true : raw === 'false' ? false : raw;
      }
    }
  }
  return { page, body: match ? source.slice(match[0].length) : source };
}

function valueOf(expression, environment) {
  const path = expression.trim();
  if ((path.startsWith('"') && path.endsWith('"')) || (path.startsWith("'") && path.endsWith("'"))) return path.slice(1, -1);
  return path.split('.').reduce((value, key) => value?.[key], environment);
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
    site: { data: { content: data } }, content: data, laser: data.laser,
    game: data.donkey_kong, imu: data.imu_sandbox, page
  };
  const renderedBody = render(body, pageEnvironment);
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
await buildPage('404.html', '404.html');
process.stdout.write(`${destination}\n`);
