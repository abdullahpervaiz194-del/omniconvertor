/**
 * Browser-Native Animated GIF89a Encoder
 * Converts video frame image data into valid animated GIF blobs
 */

export interface GifFrame {
  data: Uint8ClampedArray; // RGBA
  width: number;
  height: number;
  delayMs: number;
}

export class GifEncoder {
  private width: number;
  private height: number;
  private buffer: number[] = [];
  private repeat: number = 0; // 0 = loop forever

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.writeHeader();
  }

  private writeHeader() {
    // GIF89a
    this.writeBytes([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
    // Logical Screen Descriptor
    this.writeShort(this.width);
    this.writeShort(this.height);
    // Global Color Table Flag (none)
    this.writeByte(0x70);
    this.writeByte(0); // background color index
    this.writeByte(0); // pixel aspect ratio

    // Netscape Application Extension for looping
    this.writeBytes([
      0x21, 0xFF, 0x0B,
      0x4E, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32, 0x2E, 0x30, // NETSCAPE2.0
      0x03, 0x01,
      this.repeat & 0xFF, (this.repeat >> 8) & 0xFF,
      0x00
    ]);
  }

  public addFrame(frame: GifFrame) {
    const { data, width, height, delayMs } = frame;

    // 1. Build local color palette (max 256 colors)
    const { palette, indexedPixels } = quantizeFrame(data, width, height);

    // 2. Graphic Control Extension
    const delay = Math.round(delayMs / 10); // in hundredths of a second
    this.writeBytes([
      0x21, 0xF9, 0x04,
      0x04, // Disposal method: do not dispose
      delay & 0xFF, (delay >> 8) & 0xFF, // delay
      0x00, // transparent color index (none)
      0x00
    ]);

    // 3. Image Descriptor
    this.writeByte(0x2C);
    this.writeShort(0); // Left
    this.writeShort(0); // Top
    this.writeShort(width);
    this.writeShort(height);
    // Local Color Table Flag (8 bits per pixel = 256 colors)
    this.writeByte(0x87);

    // 4. Write Local Color Table (256 * 3 bytes)
    for (let i = 0; i < 256; i++) {
      if (i < palette.length) {
        this.writeByte(palette[i][0]);
        this.writeByte(palette[i][1]);
        this.writeByte(palette[i][2]);
      } else {
        this.writeBytes([0, 0, 0]);
      }
    }

    // 5. LZW Compress and write image data
    this.compressLzw(indexedPixels, 8);
  }

  public finish(): Blob {
    this.writeByte(0x3B); // GIF Trailer
    return new Blob([new Uint8Array(this.buffer)], { type: 'image/gif' });
  }

  private writeByte(b: number) {
    this.buffer.push(b & 0xFF);
  }

  private writeShort(s: number) {
    this.buffer.push(s & 0xFF);
    this.buffer.push((s >> 8) & 0xFF);
  }

  private writeBytes(bytes: number[]) {
    for (let i = 0; i < bytes.length; i++) {
      this.buffer.push(bytes[i]);
    }
  }

  private compressLzw(pixels: Uint8Array, colorDepth: number) {
    const initCodeSize = Math.max(2, colorDepth);
    this.writeByte(initCodeSize);

    const clearCode = 1 << initCodeSize;
    const eofCode = clearCode + 1;
    let codeSize = initCodeSize + 1;
    let maxCode = 1 << codeSize;

    // Simple LZW table
    const table = new Map<string, number>();

    const resetTable = () => {
      table.clear();
      for (let i = 0; i < clearCode; i++) {
        table.set(String(i), i);
      }
      codeSize = initCodeSize + 1;
      maxCode = 1 << codeSize;
    };

    resetTable();

    let curBits = 0;
    let curVal = 0;
    const packet: number[] = [];

    const emitBits = (code: number) => {
      curVal |= (code << curBits);
      curBits += codeSize;
      while (curBits >= 8) {
        packet.push(curVal & 0xFF);
        curVal >>= 8;
        curBits -= 8;
        if (packet.length === 254) {
          this.writeByte(packet.length);
          this.writeBytes(packet);
          packet.length = 0;
        }
      }
    };

    emitBits(clearCode);

    let prefix = '';
    for (let i = 0; i < pixels.length; i++) {
      const k = pixels[i];
      const pk = prefix === '' ? String(k) : `${prefix},${k}`;
      if (table.has(pk)) {
        prefix = pk;
      } else {
        emitBits(table.get(prefix)!);
        if (table.size < 4096) {
          table.set(pk, table.size + 2);
          if (table.size + 2 >= maxCode && codeSize < 12) {
            codeSize++;
            maxCode = 1 << codeSize;
          }
        } else {
          emitBits(clearCode);
          resetTable();
        }
        prefix = String(k);
      }
    }

    if (prefix !== '') {
      emitBits(table.get(prefix)!);
    }
    emitBits(eofCode);

    if (curBits > 0) {
      packet.push(curVal & 0xFF);
    }

    if (packet.length > 0) {
      this.writeByte(packet.length);
      this.writeBytes(packet);
    }

    this.writeByte(0x00); // Block terminator
  }
}

function quantizeFrame(
  data: Uint8ClampedArray,
  width: number,
  height: number
): { palette: [number, number, number][]; indexedPixels: Uint8Array } {
  // Fast uniform / popularity quantization to 256 colors
  const colorMap = new Map<number, number>();
  const step = 4 * 2; // sample

  for (let i = 0; i < data.length; i += step) {
    const r = data[i] & 0xF8; // 5-bit
    const g = data[i + 1] & 0xF8;
    const b = data[i + 2] & 0xF8;
    const key = (r << 16) | (g << 8) | b;
    colorMap.set(key, (colorMap.get(key) || 0) + 1);
  }

  // Sort by frequency and pick top 256
  const sortedColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 256)
    .map(([key]) => {
      const r = (key >> 16) & 0xFF;
      const g = (key >> 8) & 0xFF;
      const b = key & 0xFF;
      return [r, g, b] as [number, number, number];
    });

  if (sortedColors.length === 0) {
    sortedColors.push([0, 0, 0]);
  }

  // Map each pixel to nearest palette index
  const indexedPixels = new Uint8Array(width * height);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    let minDist = Infinity;
    let best = 0;
    for (let c = 0; c < sortedColors.length; c++) {
      const dr = r - sortedColors[c][0];
      const dg = g - sortedColors[c][1];
      const db = b - sortedColors[c][2];
      const dist = dr * dr + dg * dg + db * db;
      if (dist < minDist) {
        minDist = dist;
        best = c;
        if (dist === 0) break;
      }
    }
    indexedPixels[i / 4] = best;
  }

  return { palette: sortedColors, indexedPixels };
}
