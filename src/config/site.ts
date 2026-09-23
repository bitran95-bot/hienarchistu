import site from '../../site.config.json';

export const SITE_URL = site.url;
export const OG_IMAGE_URL = `${SITE_URL}/og-image.png`;
export const pageUrl = (path: string) => new URL(path, SITE_URL).toString();
