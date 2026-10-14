// Keep the seven-row profile on the device grid after the SVG is scaled.
export function skyTextureGeometry(viewport, scale, dpr = 1, origin = 0) {
  const ratio = Math.max(1, dpr);
  const target = Math.max(viewport < 900 ? 3.5 : 0, viewport * 7 / 1920);
  const pixels = Math.max(1, Math.round(target * ratio));
  const unit = 1 / (ratio * scale);
  return {
    period: pixels * unit,
    rows: Array.from({ length: 6 }, (_, i) => Math.round((i + 1) * pixels / 7) * unit),
    offset: (Math.round(origin * ratio) / ratio - origin) / scale,
  };
}
