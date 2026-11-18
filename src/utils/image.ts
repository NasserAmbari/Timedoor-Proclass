export async function fileToAvatarDataUrl(
  file: File,
  size = 256,
  quality = 0.85,
): Promise<string> {
  const bitmap = await createImageBitmap(file);

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not supported');

  // Latar putih supaya PNG transparan tidak berubah jadi hitam saat jadi JPEG
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, size, size);
  bitmap.close();

  return canvas.toDataURL('image/jpeg', quality);
}
