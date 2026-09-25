import { lazy, Suspense, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ProjectModelPanel } from './ProjectModelPanel';
import { ProjectShareLink } from './ProjectShareLink';
import { getResponsiveImageProps } from '../utils/image';
import { useProjectImages } from '../hooks';
import { getYoutubeEmbedUrl } from '../utils/youtube';
import { useTranslation } from '../i18n';
import type { Project } from '../types';
import { projectMediaKeys } from '../utils/projectMedia';

const PdfPageMedia = lazy(() => import('./PdfPageMedia'));

interface DesktopProjectViewerProps {
  project: Project;
  activeMedia?: string | null;
  mediaKeys?: string[];
  onMediaChange?: (direction: -1 | 1) => void;
  onPdfPageCount?: (count: number) => void;
  onClose: () => void;
}

export function DesktopProjectViewer({ project, activeMedia, mediaKeys, onMediaChange, onPdfPageCount, onClose }: DesktopProjectViewerProps) {
  const { t } = useTranslation();
  const images = useProjectImages(project);
  const [localSlide, setLocalSlide] = useState(0);
  const [localPdfPageCount, setLocalPdfPageCount] = useState(1);
  const keys = mediaKeys || projectMediaKeys(project, images.length, localPdfPageCount);
  const currentMedia = mediaKeys ? activeMedia : keys[localSlide] || null;
  const slideCount = keys.length;
  const activeSlide = keys.indexOf(currentMedia || '');
  const showingModel = currentMedia === 'model';
  const showingPdf = currentMedia?.startsWith('pdf-') || false;
  const imageIndex = currentMedia?.startsWith('image-') ? Number(currentMedia.slice(6)) - 1 : -1;
  const pdfPageNumber = showingPdf ? Number(currentMedia?.slice(4)) : 1;
  const moveSlide = (direction: -1 | 1) => {
    if (onMediaChange) onMediaChange(direction);
    else if (slideCount > 1) setLocalSlide(index => (index + direction + slideCount) % slideCount);
  };
  const currentImage = imageIndex >= 0 ? images[imageIndex] : undefined;
  const imageProps = currentImage ? getResponsiveImageProps({
    source: currentImage,
    baseWidth: 1800,
    sizes: '60vw',
    alt: `${project.name} ${imageIndex + 1}`,
    className: 'h-full w-full object-contain',
  }) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label={project.name}
      onKeyDown={event => {
        if (event.key === 'ArrowRight') moveSlide(1);
        if (event.key === 'ArrowLeft') moveSlide(-1);
        if (event.key !== 'Tab') return;
        const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      className="pointer-events-auto fixed inset-0 z-[100] grid h-[100dvh] grid-cols-[43%_57%] bg-white text-[#171717]"
    >
      <section className="flex min-h-0 flex-col overflow-y-auto overscroll-y-contain border-r border-stone-100 px-[clamp(2rem,4vw,5rem)] pb-10 pt-10">
        <p className="mb-14 text-[11px] font-bold uppercase tracking-[0.22em] text-stone-500">HIÊN studio / {t.nav.projects}</p>
        <h2 className="max-w-full break-words font-sans text-[clamp(3rem,5.7vw,7.5rem)] font-black leading-[0.94] tracking-[-0.075em]">
          {project.name}
        </h2>
        <div className="mt-auto pt-12">
          {project.generalInfo && <p className="max-w-lg whitespace-pre-line text-sm font-medium leading-7 text-stone-700">{project.generalInfo}</p>}
          {project.content && (
            <div className="mt-8 max-w-lg border-t border-stone-200 pt-6">
              <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">{t.projectDetail.story}</h3>
              <p className="whitespace-pre-line text-sm leading-7 text-stone-600">{project.content}</p>
            </div>
          )}
          {project.youtubeLink && (
            <div className="mt-8 max-w-lg">
              <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">{t.projectDetail.video}</h3>
              <iframe className="aspect-video w-full" src={getYoutubeEmbedUrl(project.youtubeLink)} title={`${project.name} video`} loading="lazy" allowFullScreen />
            </div>
          )}
          <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-stone-200 pt-5 text-xs font-bold uppercase tracking-[0.12em]">
            <ProjectShareLink project={project} mediaKey={mediaKeys ? currentMedia : null} />
            {project.pdfFileUrl && <a href={project.pdfFileUrl} target="_blank" rel="noopener noreferrer" className="hover:text-amber-700">PDF ↗</a>}
          </div>
        </div>
      </section>

      <section className="relative min-h-0 bg-white" aria-label={t.projectDetail.gallery}>
        <button autoFocus onClick={onClose} aria-label={t.contact.close} className="absolute right-6 top-6 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white/90 text-xl hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-amber-700">×</button>
        <AnimatePresence mode="wait">
          <motion.div key={`${project._id}-${currentMedia}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="absolute inset-0">
            {showingModel && project.modelFileUrl ? (
              <ProjectModelPanel
                url={project.modelFileUrl}
                name={project.name}
                className="h-full w-full"
                fallback={images[0] ? <img {...getResponsiveImageProps({ source: images[0], baseWidth: 1600, alt: project.name, className: 'h-full w-full object-contain' })} /> : undefined}
              />
            ) : showingPdf && project.pdfFileUrl ? (
              <Suspense fallback={<div role="status" className="flex h-full items-center justify-center">{t.scene.loadingData}</div>}>
                <PdfPageMedia url={project.pdfFileUrl} pageNumber={pdfPageNumber} onPageCount={onPdfPageCount || setLocalPdfPageCount} className="h-full w-full" />
              </Suspense>
            ) : imageProps ? (
              <img {...imageProps} />
            ) : (
              <div className="flex h-full items-center justify-center text-stone-400">{t.projectDetail.noImage}</div>
            )}
          </motion.div>
        </AnimatePresence>
        {slideCount > 1 && (
          <div className="absolute bottom-0 right-0 z-10 flex items-center bg-[#171717] text-white">
            <span className="px-5 text-xs font-medium tracking-widest">{String(Math.max(1, activeSlide + 1)).padStart(2, '0')} / {String(slideCount).padStart(2, '0')}</span>
            <button onClick={() => moveSlide(-1)} aria-label={t.projectDetail.previousImage} className="flex h-16 w-16 items-center justify-center border-l border-white/20 text-xl hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white">←</button>
            <button onClick={() => moveSlide(1)} aria-label={t.projectDetail.nextImage} className="flex h-16 w-16 items-center justify-center border-l border-white/20 text-xl hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white">→</button>
          </div>
        )}
      </section>
    </motion.div>
  );
}
