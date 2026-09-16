export type Rgb = { r: number; g: number; b: number };

export function parseHex(hex: string): Rgb | null {
  const raw = hex.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$|^[0-9a-fA-F]{8}$/.test(raw)) {
    return null;
  }
  if (raw.length === 3) {
    return {
      r: parseInt(raw[0]! + raw[0], 16),
      g: parseInt(raw[1]! + raw[1], 16),
      b: parseInt(raw[2]! + raw[2], 16),
    };
  }
  return {
    r: parseInt(raw.slice(0, 2), 16),
    g: parseInt(raw.slice(2, 4), 16),
    b: parseInt(raw.slice(4, 6), 16),
  };
}

export function normalizeHex(hex: string): string | null {
  const rgb = parseHex(hex);
  if (!rgb) return null;
  const to = (n: number) => n.toString(16).padStart(2, "0");
  return `#${to(rgb.r)}${to(rgb.g)}${to(rgb.b)}`.toUpperCase();
}

export function sameHex(a: string, b: string): boolean {
  const left = normalizeHex(a);
  const right = normalizeHex(b);
  return Boolean(left && right && left === right);
}

export function luminance(rgb: Rgb): number {
  const lin = (channel: number) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(rgb.r) + 0.7152 * lin(rgb.g) + 0.0722 * lin(rgb.b);
}

export function inkOnAccent(
  hex: string,
  light = "#F6F3F0",
  dark = "#161018"
): string {
  const rgb = parseHex(hex);
  if (!rgb) return dark;
  return luminance(rgb) > 0.48 ? dark : light;
}

export function hexAlpha(hex: string, alpha: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return `rgba(255,255,255,${alpha})`;
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
}

export function paintString(value: string, fromHex: string, toHex: string): string {
  const from = parseHex(fromHex);
  const to = parseHex(toHex);
  if (!from || !to) return value;

  const hexMatch = value.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/);
  if (hexMatch) {
    const parsed = parseHex(value);
    if (parsed && parsed.r === from.r && parsed.g === from.g && parsed.b === from.b) {
      const painted = normalizeHex(toHex) ?? value;
      return value.replace("#", "").length === 8 ? `${painted}${value.slice(7)}` : painted;
    }
    return value;
  }

  const rgba = value.match(
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i
  );
  if (rgba) {
    const r = Number(rgba[1]);
    const g = Number(rgba[2]);
    const b = Number(rgba[3]);
    if (r === from.r && g === from.g && b === from.b) {
      if (rgba[4] !== undefined) return `rgba(${to.r},${to.g},${to.b},${rgba[4]})`;
      return `rgb(${to.r},${to.g},${to.b})`;
    }
  }

  return value;
}

export function paintColorTree<T>(value: T, fromHex: string, toHex: string): T {
  if (typeof value === "string") return paintString(value, fromHex, toHex) as T;
  if (Array.isArray(value)) {
    return value.map((item) => paintColorTree(item, fromHex, toHex)) as T;
  }
  if (value && typeof value === "object") {
    const next: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      next[key] = paintColorTree(item, fromHex, toHex);
    }
    return next as T;
  }
  return value;
}
