/**
 * Converts a File or Blob into a Base64 Data URL
 */
export function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Downloads an image given a data URL or public URL
 */
export function downloadImage(dataUrl: string, filename = 'professional-headshot.png') {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copies an image data URL to the clipboard as PNG
 */
export async function copyImageToClipboard(dataUrl: string): Promise<boolean> {
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    // Convert to image/png if necessary
    const pngBlob = blob.type === 'image/png' ? blob : await convertBlobToPng(blob);
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': pngBlob,
      }),
    ]);
    return true;
  } catch (err) {
    console.error('Failed to copy image to clipboard:', err);
    return false;
  }
}

/**
 * Helper to convert any image blob to PNG blob using offscreen canvas
 */
function convertBlobToPng(blob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 800;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2d context unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((pngBlob) => {
        if (pngBlob) resolve(pngBlob);
        else reject(new Error('Conversion to PNG failed'));
      }, 'image/png');
    };
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Fetches an image URL (like Unsplash sample) and returns a base64 string
 */
export async function urlToBase64(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl, { referrerPolicy: 'no-referrer' });
  const blob = await response.blob();
  return fileToBase64(blob);
}
