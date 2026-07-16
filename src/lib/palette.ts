// Categories/services without a real photo get a stable mock one (seeded by id, so it doesn't
// reshuffle every render) instead of a bare placeholder icon.
export function mockPhotoUrl(seed: string, width = 300, height = 200) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
}
