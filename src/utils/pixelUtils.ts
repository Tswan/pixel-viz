export interface PixelPoint {
  x: number; // X position in image
  y: number; // Y position in image
  r: number; // Red value (0-255)
  g: number; // Green value (0-255)
  b: number; // Blue value (0-255)
  normalizedR: number; // Red normalized to 0-1
  normalizedG: number; // Green normalized to 0-1
  normalizedB: number; // Blue normalized to 0-1
}

export const extractPixelData = (imageData: ImageData, sampleRate: number = 1): PixelPoint[] => {
  const pixels: PixelPoint[] = [];
  const { data, width, height } = imageData;

  // Sample pixels based on the sample rate to control performance
  for (let y = 0; y < height; y += sampleRate) {
    for (let x = 0; x < width; x += sampleRate) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3];

      // Skip transparent pixels
      if (a === 0) continue;

      pixels.push({
        x,
        y,
        r,
        g,
        b,
        normalizedR: r / 255,
        normalizedG: g / 255,
        normalizedB: b / 255,
      });
    }
  }

  return pixels;
};

export const getColorStats = (pixels: PixelPoint[]) => {
  if (pixels.length === 0) return null;

  const rValues = pixels.map(p => p.r);
  const gValues = pixels.map(p => p.g);
  const bValues = pixels.map(p => p.b);

  return {
    count: pixels.length,
    red: {
      min: Math.min(...rValues),
      max: Math.max(...rValues),
      avg: rValues.reduce((a, b) => a + b, 0) / rValues.length,
    },
    green: {
      min: Math.min(...gValues),
      max: Math.max(...gValues),
      avg: gValues.reduce((a, b) => a + b, 0) / gValues.length,
    },
    blue: {
      min: Math.min(...bValues),
      max: Math.max(...bValues),
      avg: bValues.reduce((a, b) => a + b, 0) / bValues.length,
    },
  };
};