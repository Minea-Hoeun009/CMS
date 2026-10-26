const fs = require('fs');
const zlib = require('zlib');

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    table[i] = c;
  }
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function writeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc));
  return Buffer.concat([len, toCrc, crcBuf]);
}

function encodePNG(width, height, rgba) {
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0;
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = y * (1 + width * 4) + 1 + x * 4;
      raw[dstIdx] = rgba[srcIdx];
      raw[dstIdx + 1] = rgba[srcIdx + 1];
      raw[dstIdx + 2] = rgba[srcIdx + 2];
      raw[dstIdx + 3] = rgba[srcIdx + 3];
    }
  }
  const idat = zlib.deflateSync(raw);
  return Buffer.concat([
    header,
    writeChunk('IHDR', ihdr),
    writeChunk('IDAT', idat),
    writeChunk('IEND', Buffer.alloc(0))
  ]);
}

const inputPath = 'C:/Users/MSI PC/.gemini/antigravity/brain/69de9a27-1def-4b64-96bf-62bf9517a03a/.user_uploaded/media_1792991926900_4b4038e7.png';
const buf = fs.readFileSync(inputPath);
let pos = 8;
const idatChunks = [];
while (pos < buf.length) {
  const len = buf.readUInt32BE(pos);
  const type = buf.toString('ascii', pos + 4, pos + 8);
  if (type === 'IDAT') idatChunks.push(buf.slice(pos + 8, pos + 8 + len));
  pos += 12 + len;
}
const inflated = zlib.inflateSync(Buffer.concat(idatChunks));
const width = 283;
const height = 142;
const bpp = 4;
const stride = 1 + width * bpp;
const uncompressed = Buffer.alloc(width * height * bpp);
let prevRow = Buffer.alloc(width * bpp);
for (let y = 0; y < height; y++) {
  const filter = inflated[y * stride];
  const row = inflated.slice(y * stride + 1, (y + 1) * stride);
  const curRow = Buffer.alloc(width * bpp);
  for (let i = 0; i < width * bpp; i++) {
    const a = i >= bpp ? curRow[i - bpp] : 0;
    const b = prevRow[i];
    const c = i >= bpp ? prevRow[i - bpp] : 0;
    let val = row[i];
    if (filter === 1) val = (val + a) & 0xff;
    else if (filter === 2) val = (val + b) & 0xff;
    else if (filter === 3) val = (val + Math.floor((a + b) / 2)) & 0xff;
    else if (filter === 4) {
      const p = a + b - c;
      const pa = Math.abs(p - a);
      const pb = Math.abs(p - b);
      const pc = Math.abs(p - c);
      const pr = (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
      val = (val + pr) & 0xff;
    }
    curRow[i] = val;
    uncompressed[y * width * bpp + i] = val;
  }
  prevRow = curRow;
}

// Crop coordinates for the flourish
const cropX = 66;
const cropY = 114;
const cropW = 149;
const cropH = 12;

const cropped = Buffer.alloc(cropW * cropH * 4);
for (let y = 0; y < cropH; y++) {
  for (let x = 0; x < cropW; x++) {
    const srcIdx = ((cropY + y) * width + (cropX + x)) * 4;
    const dstIdx = (y * cropW + x) * 4;
    const r = uncompressed[srcIdx];
    const g = uncompressed[srcIdx + 1];
    const b = uncompressed[srcIdx + 2];
    const lum = (r + g + b) / 3;
    
    if (lum > 240) {
      cropped[dstIdx] = 0;
      cropped[dstIdx + 1] = 0;
      cropped[dstIdx + 2] = 0;
      cropped[dstIdx + 3] = 0;
    } else {
      const alpha = Math.min(255, Math.round((255 - lum) * 1.3));
      cropped[dstIdx] = 15;
      cropped[dstIdx + 1] = 23;
      cropped[dstIdx + 2] = 42;
      cropped[dstIdx + 3] = alpha;
    }
  }
}

if (!fs.existsSync('assets')) fs.mkdirSync('assets');
if (!fs.existsSync('assets/images')) fs.mkdirSync('assets/images');

const pngBuf = encodePNG(cropW, cropH, cropped);
fs.writeFileSync('assets/images/header-flourish.png', pngBuf);

const base64 = 'data:image/png;base64,' + pngBuf.toString('base64');

// Also create vector-based rect/path SVG for pixel-perfect sharpness
let svgRects = [];
for (let y = 0; y < cropH; y++) {
  let startX = -1;
  for (let x = 0; x < cropW; x++) {
    const idx = (y * cropW + x) * 4;
    const a = cropped[idx + 3];
    if (a > 60) {
      if (startX === -1) startX = x;
    } else {
      if (startX !== -1) {
        svgRects.push(`<rect x="${startX}" y="${y}" width="${x - startX}" height="1" fill="#0f172a" />`);
        startX = -1;
      }
    }
  }
  if (startX !== -1) {
    svgRects.push(`<rect x="${startX}" y="${y}" width="${cropW - startX}" height="1" fill="#0f172a" />`);
  }
}

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cropW} ${cropH}" width="140" height="11" style="display:block;margin:4px auto 0 auto;">${svgRects.join('')}</svg>`;
fs.writeFileSync('assets/images/header-flourish.svg', svgContent);

console.log('Successfully generated assets/images/header-flourish.png and assets/images/header-flourish.svg');
console.log('SVG length:', svgContent.length);
console.log('Base64 PNG length:', base64.length);
