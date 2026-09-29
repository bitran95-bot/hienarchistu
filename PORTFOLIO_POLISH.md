# Portfolio polish — 29/09/2026

## Delivered in the website

- All contact buttons open the same form; mobile presents the form first. Project viewers prefill a reference and include the project/page in the email. The API bounds and escapes these fields and rejects the hidden spam field.
- Settings load at the router root, including cold visits to Services and Shop.
- Mobile expanded photos are scoped to the current history entry, so Back cannot leave an old overlay above the project list.
- PDF pages retain their URLs and Next controls, with 100–300% zoom, scrolling, fit reset and an original-file link. No embedded browser PDF viewer.
- Services uses an inline accordion below 1024px. Desktop keeps six columns, with keyboard navigation scoped to the step controls. Existing deliverables remain visible. English interface copy is complete.
- Titles reveal by naturally wrapped line; project covers reveal once on entering the viewport; gallery media transitions in 240ms; Services draws a light architectural diagram. Reduced motion disables these movements, camera parallax and hover wobble.
- Retained original wall image for desktop. New mobile WebP variants: 960px / 28,998 bytes and 1440px / 60,496 bytes. Wood remains 2048px: WebP 1,727,906 bytes vs original JPEG 4,009,658 bytes. Originals remain available.
- Canvas DPR is capped at 1.5. Models and invisible night spotlights mount near the camera with a generous margin; every displayed project receives its own spotlight. The individual model viewer renders on demand.
- PWA registration now runs. Optional PDF/3D chunks stay outside precache, Sanity version matching is corrected and dynamic project/API URLs are excluded from the SPA navigation fallback. Updates wait until the previous app is closed, avoiding interruption of a form.
- Nine existing project URLs are preserved by document ID in `lib/legacyProjectSlugs.ts`, even before the CMS slug fields are filled.

## Requires account/content follow-up

- Sanity Studio schema now requires a slug. Publish that Studio update and populate existing slugs using the values in `legacyProjectSlugs.ts`; keep them when renaming a project. Website checks do not deploy the separate Studio package.
- Vercel Analytics code is ready behind `VITE_ENABLE_ANALYTICS=true`; enable the included Hobby plan first, then set the variable and deploy. The integration strips URL queries/hashes, excludes download URLs, respects DNT/GPC and sends no form content. Hobby does not include custom events; no paid upgrade is made.
- Supply verified facts and approved copy for Nhà Hoa Anh, Cao Thắng Hotel and Đà Lạt House. No project facts have been invented or published to Sanity.
- Distributed anti-spam still needs both Upstash variables; a hidden field is only a basic extra filter.
- Paid Shop remains outside this release. Resolve server-owned pricing, private delivery and webhook/fulfillment issues before opening sales.

## Acceptance

Run `npm run check` and production-build E2E. Regression coverage includes project context in mocked contact submission, all contact entry points, cold Services settings, expanded-photo Back, PDF zoom/reset/Next, mobile Services placement and reduced motion. Tests never send a real email.

Real-customer conversion is a business outcome to measure after release, not something inferred from a successful test submission.
