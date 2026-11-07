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
  // Signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bit per channel
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // Deflate
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // No interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data with filter byte (0) per row
  const rowLen = 1 + width * 4;
  const rawData = Buffer.alloc(rowLen * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLen;
    rawData[rowOffset] = 0; // None filter
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

// Colors:
// Paper: #F7F5EF -> (247, 245, 239)
// Ink: #171A21 -> (23, 26, 33)
// Blue: #314BCE -> (49, 75, 206)
// Lime: #DBF57A -> (219, 245, 122)
// Coral: #E6674D -> (230, 103, 77)

// Editorial icon design:
// - Background: warm paper #F7F5EF with soft border
// - Center: Stylized notebook emblem in #171A21 with rounded corners
// - Left spine: electric blue #314BCE vertical spine band
// - Accent ribbon / bookmark / orbital arc in lime #DBF57A and blue
// - Clean geometry representing "Caderno em Movimento"

function renderIconPixel(x, y, w, h) {
  // Normalize coordinates -1 to 1
  const nx = (x / w) * 2 - 1;
  const ny = (y / h) * 2 - 1;

  // Background: warm paper
  let r = 247, g = 245, b = 239, a = 255;

  // Notebook shape: rectangle from -0.62 to +0.62 in X, -0.68 to +0.68 in Y
  // with rounded corners radius ~ 0.16
  const rectL = -0.58, rectR = 0.58, rectT = -0.64, rectB = 0.64;
  const rad = 0.15;

  let insideNotebook = false;
  let distToCorner = 0;

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
    // Base notebook color: deep ink #171A21
    r = 23; g = 26; b = 33;

    // Left spine strip: nx from rectL to rectL + 0.22
    if (nx <= rectL + 0.22) {
      // Electric blue #314BCE
      r = 49; g = 75; b = 206;
    }

    // Grid lines / horizontal notebook lines in muted tone
    // Y between -0.4 and 0.45
    const lineSpacing = 0.14;
    const lineY = Math.abs((ny + 0.02) % lineSpacing);
    if (nx > rectL + 0.32 && nx < rectR - 0.12 && ny > -0.42 && ny < 0.46) {
      if (lineY < 0.015) {
        // Line paper guide
        r = 50; g = 55; b = 68;
      }
    }

    // Bookmark / orbital arc:
    // A diagonal ribbon or arc in lime #DBF57A
    // Top-right corner bookmark: nx from 0.25 to 0.42, ny from rectT to -0.2
    if (nx >= 0.22 && nx <= 0.40 && ny >= rectT && ny <= -0.15) {
      r = 219; g = 245; b = 122; // Lime
    }

    // Bottom check / geometric dot: circle centered at (0.31, 0.28) radius 0.09
    const dotDist = Math.hypot(nx - 0.31, ny - 0.28);
    if (dotDist <= 0.08) {
      r = 49; g = 75; b = 206; // Blue accent dot
    } else if (dotDist <= 0.12 && dotDist > 0.095) {
      r = 219; g = 245; b = 122; // Lime orbital ring
    }
  }

  // Border / subtle outline around notebook
  return [r, g, b, a];
}

const icon1024 = createPng(1024, 1024, renderIconPixel);
const assetsDir = path.resolve(__dirname, '../assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

fs.writeFileSync(path.join(assetsDir, 'campus-icon.png'), icon1024);
fs.writeFileSync(path.join(assetsDir, 'android-icon-foreground.png'), icon1024);
fs.writeFileSync(path.join(assetsDir, 'icon.png'), icon1024);
console.log('Successfully generated assets/campus-icon.png and assets/android-icon-foreground.png (1024x1024)!');
