const fs = require('fs');
const path = require('path');

// Читаем JSON со строками base64, сгенерированными Puppeteer Canvas
const sourceFile = 'C:/Users/Admin/.gemini/antigravity-cli/brain/c829954f-36fa-41c8-944e-b41e1046a410/.system_generated/steps/1127/output.txt';
const raw = fs.readFileSync(sourceFile, 'utf8');

// Извлекаем строку JSON между кавычками на строке 2
const lines = raw.split(/\r?\n/);
let jsonStr = '';
for (let line of lines) {
  line = line.trim();
  if (line.startsWith('"{') && line.endsWith('}"')) {
    jsonStr = JSON.parse(line);
    break;
  }
}

if (!jsonStr) {
  // fallback parsing
  const match = raw.match(/"(\{.*?\})"/s);
  if (match) {
    jsonStr = JSON.parse('"' + match[1] + '"');
  }
}

const icons = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;

const b16 = Buffer.from(icons['16'], 'base64');
const b32 = Buffer.from(icons['32'], 'base64');
const b48 = Buffer.from(icons['48'], 'base64');
const b180 = Buffer.from(icons['180'], 'base64');

const rootDir = path.resolve(__dirname, '..');

// 1. Сохраняем PNG файлы
fs.writeFileSync(path.join(rootDir, 'favicon-16x16.png'), b16);
fs.writeFileSync(path.join(rootDir, 'favicon-32x32.png'), b32);
fs.writeFileSync(path.join(rootDir, 'apple-touch-icon.png'), b180);

console.log('PNG files written successfully:');
console.log(' - favicon-16x16.png:', b16.length, 'bytes');
console.log(' - favicon-32x32.png:', b32.length, 'bytes');
console.log(' - apple-touch-icon.png:', b180.length, 'bytes');

// 2. Формируем мультиразмерный ICO файл (16x16, 32x32, 48x48)
const images = [
  { width: 16, height: 16, buf: b16 },
  { width: 32, height: 32, buf: b32 },
  { width: 48, height: 48, buf: b48 }
];

const count = images.length;
const headerSize = 6;
const dirEntrySize = 16;
let currentOffset = headerSize + count * dirEntrySize;

const header = Buffer.alloc(headerSize);
header.writeUInt16LE(0, 0); // Reserved
header.writeUInt16LE(1, 2); // Type 1 = ICO
header.writeUInt16LE(count, 4); // Count

const entries = [];
for (const img of images) {
  const entry = Buffer.alloc(dirEntrySize);
  entry.writeUInt8(img.width === 256 ? 0 : img.width, 0); // Width
  entry.writeUInt8(img.height === 256 ? 0 : img.height, 1); // Height
  entry.writeUInt8(0, 2); // Color count (0 = >=8bpp)
  entry.writeUInt8(0, 3); // Reserved
  entry.writeUInt16LE(1, 4); // Color planes
  entry.writeUInt16LE(32, 6); // Bits per pixel
  entry.writeUInt32LE(img.buf.length, 8); // Size of image data
  entry.writeUInt32LE(currentOffset, 12); // Offset of image data
  entries.push(entry);
  currentOffset += img.buf.length;
}

const icoBuffer = Buffer.concat([
  header,
  ...entries,
  ...images.map(img => img.buf)
]);

fs.writeFileSync(path.join(rootDir, 'favicon.ico'), icoBuffer);
console.log(' - favicon.ico:', icoBuffer.length, 'bytes');
