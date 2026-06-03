// ===== Sanity CMS Types =====

export interface SanityImageAsset {
  _ref: string;
  _type: 'reference';
}

export interface SanityImage {
  _type?: 'image';
  asset?: SanityImageAsset;
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
}

export interface MagazinePage {
  _key?: string;
  layout: 'full' | 'col' | 'row' | 'mixed';
  images: SanityImage[];
}

export interface Project {
  _id: string;
  name: string;
  generalInfo?: string;
  content?: string;
  image?: SanityImage;
  gallery?: SanityImage[];
  magazinePages?: MagazinePage[];
  modelFileUrl?: string;
  modelFile?: { asset?: SanityImageAsset };
  modelScale?: number;
  youtubeLink?: string;
  order?: number;
}

export interface SiteSettings {
  title?: string;
  heroDescription?: string;
  aboutTitle?: string;
  aboutText?: string;
  phone?: string;
  email?: string;
  instagram?: string;
}

// ===== Layout Types =====

export interface ProjectLayoutItem extends Project {
  computedX: number;
  computedRow: number;
  expectedWidth: number;
}

export interface GridLocation {
  gridRow: number;
  computedX: number;
}

export interface GridData {
  map: (GridLocation | undefined)[];
  path: GridLocation[];
}
