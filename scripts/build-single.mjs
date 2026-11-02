import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

/**
 * Builds the app, then folds the CSS, JavaScript, fonts, images, and icons into
 * one portable HTML file. Useful for sharing the prototype without a server.
 */

const root = process.cwd();
execSync('npm.cmd run build', { cwd: root, stdio: 'inherit' });

const dist = path.join(root, 'dist');
const output = path.resolve(root, '..', 'CampuSmart.html');

const mimeTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

function toDataUri(file) {
  const extension = path.extname(file).toLowerCase();
  const mime = mimeTypes[extension] ?? 'application/octet-stream';
  return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
}

function inlineCssAssets(css) {
  return css.replace(/url\(([^)]+)\)/g, (match, raw) => {
    const url = raw.trim().replace(/^['"]|['"]$/g, '');
    if (url.startsWith('data:')) return match;

    if (url.startsWith('/assets/')) {
      const file = path.join(dist, url.slice(1));
      if (fs.existsSync(file)) return `url(${toDataUri(file)})`;
    }

    if (url.startsWith('/img/')) {
      const file = path.join(dist, url.slice(1));
      if (fs.existsSync(file)) return `url(${toDataUri(file)})`;
    }

    return match;
  });
}

let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

const cssTag = html.match(/<link[^>]*rel="stylesheet"[^>]*>/)?.[0];
const cssHref = cssTag?.match(/href="([^"]+)"/)?.[1];

if (!cssTag || !cssHref) {
  throw new Error('Could not find the built stylesheet in dist/index.html');
}

const jsTag = html.match(/<script[^>]*type="module"[^>]*src="[^"]+"[^>]*><\/script>/)?.[0];
const jsSrc = jsTag?.match(/src="([^"]+)"/)?.[1];

if (!jsTag || !jsSrc) {
  throw new Error('Could not find the built module script in dist/index.html');
}

let css = inlineCssAssets(
  fs.readFileSync(path.join(dist, cssHref.replace(/^\//, '')), 'utf8'),
);
let js = fs.readFileSync(path.join(dist, jsSrc.replace(/^\//, '')), 'utf8');

// A service worker cannot be installed from a file:// page, so this file is
// intentionally standalone rather than an installable PWA.
js = js
  .split('navigator.serviceWorker.register(`/sw.js`).catch(()=>{})')
  .join('Promise.resolve()');

const imageDirectory = path.join(dist, 'img');
if (fs.existsSync(imageDirectory)) {
  const entries = [];
  const replacements = [];

  for (const name of fs.readdirSync(imageDirectory)) {
    const file = path.join(imageDirectory, name);
    if (!fs.statSync(file).isFile()) continue;

    const key = JSON.stringify(name);
    entries.push(`${key}:${JSON.stringify(toDataUri(file))}`);

    // Product paths are quoted with backticks in the minified bundle.
    for (const quote of ['`', '"', "'"]) {
      replacements.push([
        `${quote}/img/${name}${quote}`,
        `__CAMPUSSMART_IMAGES__[${key}]`,
      ]);
    }
  }

  for (const [from, to] of replacements) {
    js = js.split(from).join(to);
  }

  // The favicon and apple-touch-icon use plain href attributes in index.html.
  for (const name of fs.readdirSync(imageDirectory)) {
    const file = path.join(imageDirectory, name);
    if (!fs.statSync(file).isFile()) continue;
    const url = `/img/${name}`;
    html = html.split(url).join(toDataUri(file));
  }

  js = `const __CAMPUSSMART_IMAGES__={${entries.join(',')}};\n${js}`;
}

// Function replacers prevent `$&`, `$'`, and similar sequences inside the
// bundle from being interpreted as replacement patterns.
html = html.replace(
  cssTag,
  () => `<style>\n${css.replace(/<\/style/gi, '<\\/style')}\n</style>`,
);
html = html.replace(
  jsTag,
  () => `<script type="module">\n${js.replace(/<\/script/gi, '<\\/script')}\n</script>`,
);

// Remove references that only make sense when served from a web host.
html = html.replace(/<link[^>]*rel="modulepreload"[^>]*>\s*/gi, '');
html = html.replace(/<link[^>]*rel="manifest"[^>]*>\s*/gi, '');

fs.writeFileSync(output, html, 'utf8');

const sizeMb = (fs.statSync(output).size / (1024 * 1024)).toFixed(2);
console.log(`\nSingle-file app written to:\n${output}\nSize: ${sizeMb} MB`);
