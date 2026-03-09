/**
 * Generate a photo-realistic car image URL using Imagin Studio CDN.
 * Free for development — no API key needed.
 * Returns a side-profile render of the exact make/model/year.
 */
export function getVehicleImageUrl(
  make: string,
  model: string,
  year: number,
  options?: {
    angle?: 'side' | 'front' | 'rear' | 'front-side' | 'rear-side';
    width?: number;
    color?: string;
  }
): string {
  const { angle = 'side', width = 800, color } = options || {};

  // Imagin Studio expects lowercase, hyphenated names
  const cleanMake = make.toLowerCase().trim().replace(/\s+/g, '-');
  const cleanModel = model.toLowerCase().trim().replace(/\s+/g, '-');

  // Map angle names to Imagin Studio angle numbers
  const angleMap: Record<string, number> = {
    'side': 9,
    'front': 1,
    'rear': 5,
    'front-side': 2,
    'rear-side': 4,
  };

  const params = new URLSearchParams({
    customer: 'img',
    make: cleanMake,
    modelFamily: cleanModel,
    modelYear: String(year),
    angle: String(angleMap[angle] || 9),
    width: String(width),
    zoomType: 'fullscreen',
  });

  if (color) {
    params.set('paintId', color);
  }

  return `https://cdn.imagin.studio/getimage?${params.toString()}`;
}
