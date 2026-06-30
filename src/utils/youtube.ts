/**
 * Helper to convert any YouTube URL format into an embed URL.
 * Supports: watch, youtu.be, shorts, and embed formats.
 */
export function getYoutubeEmbedUrl(url: string): string {
  let videoId = '';
  if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1].split('?')[0];
  else if (url.includes('watch?v=')) videoId = url.split('watch?v=')[1].split('&')[0];
  else if (url.includes('shorts/')) videoId = url.split('shorts/')[1].split('?')[0];
  else if (url.includes('embed/')) videoId = url.split('embed/')[1].split('?')[0];
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}
