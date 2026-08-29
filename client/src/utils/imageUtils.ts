/**
 * Optimizes Cloudinary URLs to automatically serve the best format (f_auto)
 * and best quality/compression (q_auto) for the user's browser.
 * 
 * E.g. https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg
 * becomes: https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/v1234/sample.jpg
 */
export function getOptimizedImageUrl(url?: string): string | undefined {
  if (!url || typeof url !== 'string') return url;
  
  // If it's a cloudinary URL and doesn't already have f_auto or q_auto
  if (url.includes('cloudinary.com') && !url.includes('f_auto') && !url.includes('q_auto')) {
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex !== -1) {
      return url.slice(0, uploadIndex + 8) + 'f_auto,q_auto/' + url.slice(uploadIndex + 8);
    }
  }
  
  return url;
}
