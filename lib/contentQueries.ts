export const siteContentQuery = `{
  "projects": *[_type == "project"] | order(order asc) {
    ...,
    image { ..., "lqip": asset->metadata.lqip },
    gallery[] { ..., "lqip": asset->metadata.lqip },
    magazinePages[] { ..., images[] { ..., "lqip": asset->metadata.lqip } },
    "modelFileUrl": modelFile.asset->url,
    "pdfFileUrl": pdfFile.asset->url
  },
  "settings": *[_type == "siteSettings"][0]
}`;

export const productsQuery = `*[_type == "product"] | order(order asc) {
  ...,
  "slug": slug,
  image { ..., "lqip": asset->metadata.lqip },
  gallery[] { ..., "lqip": asset->metadata.lqip }
}`;
