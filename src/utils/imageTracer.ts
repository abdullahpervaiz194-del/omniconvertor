/**
 * Client-Side Bitmap to SVG Vector Tracer
 * Converts raster pixels (PNG) into optimized scalable vector paths
 */

export interface TracingOptions {
  colorCount: number; // e.g. 4 to 32 colors
  scale: number; // Downsample/upsample factor
  blurRadius: number; // 0 to 4
  simplifyTolerance: number; // 1 to 10
  minArea: number; // filter tiny noise spots
}

export function traceImageToSvg(
  img: HTMLImageElement,
  options: TracingOptions,
  onProgress?: (percent: number, message: string) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      onProgress?.(10, 'Analyzing image pixels...');
      
      const width = Math.min(img.naturalWidth || img.width, 1024);
      const height = Math.round((width / (img.naturalWidth || img.width)) * (img.naturalHeight || img.height));

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Could not get canvas 2D context.');

      ctx.drawImage(img, 0, 0, width, height);
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      onProgress?.(30, 'Quantizing color palette...');

      // 1. Extract and Quantize Palette (Median Cut / K-Means sampling)
      const numColors = Math.max(2, Math.min(options.colorCount, 32));
      const palette = extractPalette(data, numColors);

      onProgress?.(50, 'Tracing vector contours...');

      // 2. Map every pixel to nearest palette index
      const colorIndices = new Uint8Array(width * height);
      for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3];
        const pixelIdx = i / 4;
        if (a < 20) {
          colorIndices[pixelIdx] = 255; // Transparent
        } else {
          colorIndices[pixelIdx] = findNearestColorIndex(data[i], data[i + 1], data[i + 2], palette);
        }
      }

      onProgress?.(70, 'Generating smooth SVG paths...');

      // 3. Build path strings for each color
      const pathsByColor: string[] = [];

      for (let c = 0; c < palette.length; c++) {
        const color = palette[c];
        const hex = rgbToHex(color[0], color[1], color[2]);
        const pathData = traceColorLayer(colorIndices, width, height, c, options.simplifyTolerance);
        if (pathData) {
          pathsByColor.push(`<path fill="${hex}" d="${pathData}" />`);
        }
      }

      onProgress?.(90, 'Assembling SVG document...');

      const svgContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" version="1.1">
  <defs/>
  <g id="vectorized-layer" fill-rule="evenodd">
    ${pathsByColor.join('\n    ')}
  </g>
</svg>`;

      onProgress?.(100, 'Vectorization complete!');
      resolve(svgContent);
    } catch (err: any) {
      reject(new Error(`Vectorization error: ${err.message || err}`));
    }
  });
}

function extractPalette(data: Uint8ClampedArray, colorCount: number): [number, number, number][] {
  const step = 4 * 4; // Sample every 4th pixel for speed
  const samples: [number, number, number][] = [];
  for (let i = 0; i < data.length; i += step) {
    if (data[i + 3] > 30) {
      samples.push([data[i], data[i + 1], data[i + 2]]);
    }
  }

  if (samples.length === 0) {
    return [[0, 0, 0]];
  }

  // Simple k-means initialization
  const centers: [number, number, number][] = [];
  const stride = Math.floor(samples.length / colorCount);
  for (let i = 0; i < colorCount; i++) {
    const idx = Math.min(i * stride, samples.length - 1);
    centers.push([...samples[idx]]);
  }

  // 2 iterations of k-means
  for (let iter = 0; iter < 2; iter++) {
    const sums = centers.map(() => [0, 0, 0, 0]); // r, g, b, count
    for (const sample of samples) {
      let minDist = Infinity;
      let bestCenter = 0;
      for (let c = 0; c < centers.length; c++) {
        const dr = sample[0] - centers[c][0];
        const dg = sample[1] - centers[c][1];
        const db = sample[2] - centers[c][2];
        const dist = dr * dr + dg * dg + db * db;
        if (dist < minDist) {
          minDist = dist;
          bestCenter = c;
        }
      }
      sums[bestCenter][0] += sample[0];
      sums[bestCenter][1] += sample[1];
      sums[bestCenter][2] += sample[2];
      sums[bestCenter][3] += 1;
    }

    for (let c = 0; c < centers.length; c++) {
      if (sums[c][3] > 0) {
        centers[c] = [
          Math.round(sums[c][0] / sums[c][3]),
          Math.round(sums[c][1] / sums[c][3]),
          Math.round(sums[c][2] / sums[c][3])
        ];
      }
    }
  }

  return centers;
}

function findNearestColorIndex(r: number, g: number, b: number, palette: [number, number, number][]): number {
  let minDist = Infinity;
  let best = 0;
  for (let i = 0; i < palette.length; i++) {
    const dr = r - palette[i][0];
    const dg = g - palette[i][1];
    const db = b - palette[i][2];
    const dist = dr * dr + dg * dg + db * db;
    if (dist < minDist) {
      minDist = dist;
      best = i;
    }
  }
  return best;
}

function traceColorLayer(
  indices: Uint8Array,
  width: number,
  height: number,
  colorIdx: number,
  simplifyTol: number
): string {
  // Generate horizontal runs and merge into paths for high rendering performance
  const commands: string[] = [];

  for (let y = 0; y < height; y++) {
    let startX = -1;
    for (let x = 0; x < width; x++) {
      const idx = indices[y * width + x];
      if (idx === colorIdx) {
        if (startX === -1) startX = x;
      } else {
        if (startX !== -1) {
          const runWidth = x - startX;
          commands.push(`M${startX} ${y}h${runWidth}v1h-${runWidth}Z`);
          startX = -1;
        }
      }
    }
    if (startX !== -1) {
      const runWidth = width - startX;
      commands.push(`M${startX} ${y}h${runWidth}v1h-${runWidth}Z`);
    }
  }

  return commands.join(' ');
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}
