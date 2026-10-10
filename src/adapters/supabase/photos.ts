import type { SupabaseBackend } from './backend';
export const PHOTO_LIMIT = 5 * 1024 * 1024;
export function validatePhoto(file: File) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Choisissez une image JPEG, PNG ou WebP.');
  if (!file.size || file.size > PHOTO_LIMIT) throw new Error('Chaque photo doit peser entre 1 octet et 5 Mo.');
}
export async function uploadPhoto(backend: SupabaseBackend, userId: string, file: File, replacing?: string) {
  validatePhoto(file);
  // Decode and re-encode: reject disguised files and discard EXIF metadata.
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
  const body = await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Image illisible.')), 'image/jpeg', .88));
  const path = `${userId}/${crypto.randomUUID()}.jpg`;
  const bucket = backend.client.storage.from('profile-photos');
  const { error } = await bucket.upload(path, body, { contentType: 'image/jpeg', upsert: false }); if (error) throw new Error(error.message);
  try { await backend.rpc('register_photo', { path, replacing: replacing || null }); }
  catch (error) { await bucket.remove([path]); throw error; }
  if (replacing) { const { error } = await bucket.remove([replacing]); if (error) throw new Error('Photo remplacée ; nettoyage de l’ancien fichier à réessayer depuis les paramètres.'); }
}
export async function removePhoto(backend: SupabaseBackend, path: string) {
  await backend.rpc('remove_photo', { path });
  const { error } = await backend.client.storage.from('profile-photos').remove([path]);
  if (error) throw new Error('Photo retirée du profil ; nettoyage du fichier à réessayer.');
}
