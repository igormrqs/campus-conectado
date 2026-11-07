const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crc = crc32(buf.subarray(4, 8 + len));
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

function createPng(width, height, getPixel) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdr);

  const rowLen = 1 + width * 4;
  const rawData = Buffer.alloc(rowLen * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLen;
    rawData[rowOffset] = 0; // Filter none
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

// Colors
// Paper: #F7F5EF (247, 245, 239)
// Ink: #171A21 (23, 26, 33)
// Blue: #314BCE (49, 75, 206)
// Lime: #DBF57A (219, 245, 122)

function renderEmblemPixel(x, y, w, h, isTransparentBg = false, scale = 1.0) {
  // Normalize coordinates -1 to 1, apply scaling factor
  const nx = ((x / w) * 2 - 1) / scale;
  const ny = ((y / h) * 2 - 1) / scale;

  let r = 247, g = 245, b = 239, a = isTransparentBg ? 0 : 255;

  // Notebook shape: bounds
  const rectL = -0.56, rectR = 0.56, rectT = -0.62, rectB = 0.62;
  const rad = 0.14;

  let insideNotebook = false;
  if (nx >= rectL && nx <= rectR && ny >= rectT && ny <= rectB) {
    let dx = 0, dy = 0;
    if (nx < rectL + rad) dx = (rectL + rad) - nx;
    else if (nx > rectR - rad) dx = nx - (rectR - rad);

    if (ny < rectT + rad) dy = (rectT + rad) - ny;
    else if (ny > rectB - rad) dy = ny - (rectB - rad);

    if (dx === 0 || dy === 0 || Math.hypot(dx, dy) <= rad) {
      insideNotebook = true;
    }
  }

  if (insideNotebook) {
    a = 255;
    // Base notebook color: deep ink #171A21
    r = 23; g = 26; b = 33;

    // Left spine strip
    if (nx <= rectL + 0.22) {
      r = 49; g = 75; b = 206; // Electric blue #314BCE
    }

    // Interior notebook guidelines
    const lineSpacing = 0.13;
    const lineY = Math.abs((ny + 0.02) % lineSpacing);
    if (nx > rectL + 0.32 && nx < rectR - 0.10 && ny > -0.38 && ny < 0.44) {
      if (lineY < 0.015) {
        r = 48; g = 54; b = 68;
      }
    }

    // Lime Bookmark ribbon at top-right
    if (nx >= 0.20 && nx <= 0.38 && ny >= rectT && ny <= -0.16) {
      r = 219; g = 245; b = 122; // Lime #DBF57A
    }

    // Connected orbital node at bottom-right
    const dotDist = Math.hypot(nx - 0.29, ny - 0.27);
    if (dotDist <= 0.075) {
      r = 49; g = 75; b = 206; // Blue center dot
    } else if (dotDist <= 0.115 && dotDist > 0.085) {
      r = 219; g = 245; b = 122; // Lime orbital ring
    }
  }

  return [r, g, b, a];
}

const assetsDir = path.resolve(__dirname, '../assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

console.log('Generating app icon assets (1024x1024)...');

// 1. Full square icon with paper background
const campusIcon = createPng(1024, 1024, (x, y, w, h) => renderEmblemPixel(x, y, w, h, false, 1.0));
fs.writeFileSync(path.join(assetsDir, 'campus-icon.png'), campusIcon);
fs.writeFileSync(path.join(assetsDir, 'icon.png'), campusIcon);

// 2. Android adaptive icon foreground (scaled into safe zone with transparent background)
const androidForeground = createPng(1024, 1024, (x, y, w, h) => renderEmblemPixel(x, y, w, h, true, 0.72));
fs.writeFileSync(path.join(assetsDir, 'android-icon-foreground.png'), androidForeground);

// 3. Splash icon (scaled into center)
const splashIcon = createPng(1024, 1024, (x, y, w, h) => renderEmblemPixel(x, y, w, h, false, 0.65));
fs.writeFileSync(path.join(assetsDir, 'splash-icon.png'), splashIcon);

console.log('Successfully generated:');
console.log(' - assets/campus-icon.png');
console.log(' - assets/icon.png');
console.log(' - assets/android-icon-foreground.png');
console.log(' - assets/splash-icon.png');
