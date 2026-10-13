// Work in an isotropic SVG coordinate system so .4 degrees stays .4 degrees
// on both narrow phones and tall desktop sections. Overlap grows with height.
export function stripeFanGeometry(widths, height, step, kick, overlap = 8) {
  const total = widths.reduce((sum, width) => sum + width, 0);
  const radians = step * Math.PI / 180;
  const seam = overlap + height * Math.tan(Math.abs(radians));
  let edge = 0;
  return widths.map((width, index) => {
    edge += width;
    const angle = (index - (widths.length - 1) / 2) * step;
    const cosine = Math.cos(angle * Math.PI / 180);
    const extra = kick / cosine;
    // Rightmost band covers the outer edge even as the preceding bars kick.
    const paintedWidth = width + seam + (index === widths.length - 1 ? extra : 0);
    const right = edge + (index === widths.length - 1 ? extra : 0);
    return { x: right - paintedWidth, width: paintedWidth, right, angle,
      scaleX: 1 + extra / paintedWidth, center: edge - width / 2, total };
  });
}
