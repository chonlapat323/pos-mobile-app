// Deterministic per-id color, used as a stand-in thumbnail for categories/services that have no
// real photo uploaded yet - same idea as the reference mockup's hue-tinted placeholder cards
// (not a photo mock: no network image service involved, so it never breaks on a flaky connection).
export function hueFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash % 360;
}

export function tintGradient(id: string): string {
  const hue = hueFromId(id);
  return `linear-gradient(140deg, oklch(0.34 0.06 ${hue}), oklch(0.24 0.035 ${hue}))`;
}
