import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'www');
const sourceDirectories = ['css', 'img', 'js'];
const sourceFiles = [
  '403.html', 'admin.html', 'anunturi.html', 'asistent.html',
  'calculatorilegal.html', 'cereri.html', 'changelog.html', 'contracte.html',
  'craftmecanics.html', 'developer.html', 'diagnostic.html',
  'discord-configurare.html', 'edit.html', 'index.html', 'organizatii.html',
  'locatiiilegale.html', 'login.html', 'logs.html', 'marketplace-ilegal.html',
  'marketplace.html', 'pontaj.html', 'rapoarte.html', 'thank-you.html'
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const directory of sourceDirectories) {
  await cp(join(root, directory), join(output, directory), { recursive: true });
}

const mobileHead = [
  '    <meta name="theme-color" content="#020617">',
  '    <meta name="mobile-web-app-capable" content="yes">',
  '    <link rel="stylesheet" href="css/mobile-app.css">',
  '    <script src="js/mobile-runtime.js"></script>'
].join('\n');

for (const file of sourceFiles) {
  const sourcePath = join(root, file);
  const destinationPath = join(output, file);
  let html = await readFile(sourcePath, 'utf8');
  if (!html.includes('mobile-runtime.js')) {
    html = html.replace('</head>', `${mobileHead}\n</head>`);
  }
  await mkdir(dirname(destinationPath), { recursive: true });
  await writeFile(destinationPath, html, 'utf8');
}

console.log(`Aplicatia web a fost generata in ${relative(root, output)}.`);
