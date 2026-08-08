import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'www');
const sourceDirectories = ['css', 'img', 'js', 'supabase'];
const sourceFiles = [
  '403.html', 'admin.html', 'administrare-organizatie.html', 'anunturi.html',
  'asistent.html', 'bucatarie.html', 'calculator.html', 'calculatorilegal.html',
  'cereri.html', 'changelog.html', 'contracte.html', 'craftmecanics.html',
  'creare-organizatie-voucher.html', 'descarca-android.html', 'developer.html',
  'diagnostic.html', 'discord-configurare.html', 'guest.html', 'index.html',
  'instalare-ios.html', 'locatiiilegale.html', 'login.html', 'logs.html', 'marketplace-ilegal.html',
  'marketplace.html', 'organizatii.html', 'pontaj.html', 'rapoarte.html',
  'service-worker.js', 'status-live.html', 'thank-you.html', 'vouchere.html',
  'manifest.webmanifest',
  'MIGRARE-MULTI-ORGANIZATIE.md'
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const directory of sourceDirectories) {
  await cp(join(root, directory), join(output, directory), { recursive: true });
}

for (const file of sourceFiles) {
  const sourcePath = join(root, file);
  const destinationPath = join(output, file);
  await mkdir(dirname(destinationPath), { recursive: true });
  let html = await readFile(sourcePath, 'utf8');
  if (file.endsWith('.html') && !html.includes('android-oauth-runtime.js')) {
    html = html.replace('</head>', '    <script src="js/android-oauth-runtime.js"></script>\n</head>');
  }
  await writeFile(destinationPath, html, 'utf8');
}

console.log(`Aplicatia web a fost generata in ${relative(root, output)}.`);
