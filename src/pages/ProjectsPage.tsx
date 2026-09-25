import { useEffect, useState, useMemo, useCallback, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { OG_IMAGE_URL, pageUrl } from '../config/site';

import { useStore } from '../store/useStore';
import { urlFor } from '../sanityClient';
import { getResponsiveImageProps } from '../utils/image';
import { getYoutubeEmbedUrl } from '../utils/youtube';
import { projectPath, projectSlug } from '../utils/projectSlug';
import { projectMediaKeys, projectMediaPath } from '../utils/projectMedia';
import { useEscapeKey, useProjectImages, useIsMobile } from '../hooks';
import { useTranslation } from '../i18n';
import type { Project } from '../types';
import { SubpageNavigation } from '../components/SubpageNavigation';
import { DesktopProjectViewer } from '../components/DesktopProjectViewer';
import { ProjectModelPanel } from '../components/ProjectModelPanel';
import { ProjectShareLink } from '../components/ProjectShareLink';
import { RecoveryMessage } from '../components/ui/RecoveryMessage';
import { FullscreenImageOverlay, ProjectCardSkeleton } from '../components/ui';
const PdfPageMedia = lazy(() => import('../components/PdfPageMedia'));

export default function ProjectsPage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { projects, isDataLoaded, fetchData, error } = useStore();
  const selectedProject = slug ? projects.find(project => projectSlug(project) === slug) || null : null;
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [pdfPageInfo, setPdfPageInfo] = useState<{ projectId: string; count: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const isMobile = useIsMobile();
  const projectOpenerRef = useRef<HTMLElement | null>(null);

  const openProject = (project: Project, opener: HTMLElement) => {
    opener.focus();
    projectOpenerRef.current = opener;
    navigate(projectPath(project));
  };
  const closeProject = useCallback(() => {
    const source = location.state as { returnTo?: string } | null;
    navigate(source?.returnTo === '/' ? '/' : '/projects', { replace: true });
    requestAnimationFrame(() => projectOpenerRef.current?.focus());
  }, [location.state, navigate]);

  // Back to top visibility
  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);



  // Filter projects by search
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.generalInfo || '').toLowerCase().includes(q) ||
      (p.content || '').toLowerCase().includes(q)
    );
  }, [projects, searchQuery]);

  // Project images (shared hook)
  const projectImages = useProjectImages(selectedProject);
  const pdfCountLoaded = pdfPageInfo?.projectId === selectedProject?._id;
  const pdfPageCount = pdfCountLoaded ? pdfPageInfo?.count || 1 : 1;
  const mediaKeys = selectedProject ? projectMediaKeys(selectedProject, projectImages.length, pdfPageCount) : [];
  const galleryKeys = mediaKeys.filter(key => key !== 'model');
  const navigationKeys = isMobile ? galleryKeys : mediaKeys;
  const requestedMedia = new URLSearchParams(location.search).get('media');
  const pendingPdfPage = requestedMedia?.match(/^pdf-([1-9]\d*)$/);
  const isPendingPdfPage = Boolean(selectedProject?.pdfFileUrl && !pdfCountLoaded && pendingPdfPage);
  const defaultMedia = (isMobile ? galleryKeys[0] : mediaKeys[0]) || mediaKeys[0] || null;
  const activeMedia = requestedMedia && (mediaKeys.includes(requestedMedia) || isPendingPdfPage)
    ? requestedMedia : defaultMedia;
  const activeImageIndex = activeMedia?.startsWith('image-') ? Number(activeMedia.slice(6)) - 1 : -1;
  const showingPdf = activeMedia?.startsWith('pdf-') || false;
  const showMobileModel = activeMedia === 'model';
  const mediaCount = navigationKeys.length;
  const navigateMedia = (mediaKey: string) => {
    if (!selectedProject || mediaKey === activeMedia && requestedMedia === mediaKey) return;
    navigate(projectMediaPath(selectedProject, mediaKey), { state: location.state });
  };
  const moveMedia = (direction: -1 | 1) => {
    if (!navigationKeys.length) return;
    const index = navigationKeys.indexOf(activeMedia || '');
    navigateMedia(navigationKeys[(index + direction + navigationKeys.length) % navigationKeys.length]);
  };
  const updatePdfPageCount = (count: number) => {
    if (selectedProject) setPdfPageInfo({ projectId: selectedProject._id, count });
  };
  const metaTitle = `${selectedProject?.name || t.projectsPage.title} | Hiên Archi Studio`;
  const metaDescription = selectedProject?.generalInfo?.replace(/\s+/g, ' ').trim().slice(0, 160) || t.projectsPage.subtitle;
  const metaUrl = pageUrl(selectedProject ? projectPath(selectedProject) : '/projects');
  const metaImage = projectImages[0]
    ? getResponsiveImageProps({ source: projectImages[0], aspectRatio: 1200 / 630, baseWidth: 1200 })?.src || OG_IMAGE_URL
    : OG_IMAGE_URL;

  useEffect(() => {
    if (!selectedProject || !requestedMedia || requestedMedia === activeMedia) return;
    navigate(projectPath(selectedProject), { replace: true, state: location.state });
  }, [selectedProject, requestedMedia, activeMedia, navigate, location.state]);

  // Helper cho Youtube URL (shared utility)

  useEffect(() => {
    if (!isDataLoaded) {
      fetchData();
    }
  }, [fetchData, isDataLoaded]);

  // Handle escape key to close modal or fullscreen image
  const handleEscape = useCallback(() => {
    if (fullscreenImage) setFullscreenImage(null);
    else if (slug) closeProject();
  }, [fullscreenImage, slug, closeProject]);
  useEscapeKey(handleEscape);

  return (
    <div className="min-h-screen bg-[#fdfbf7] selection:bg-stone-300">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={metaUrl} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={metaImage} />
        <meta property="og:type" content={selectedProject ? 'article' : 'website'} />
        <meta property="og:url" content={metaUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={metaImage} />
      </Helmet>

      <SubpageNavigation />

      {/* Hero Section */}
      <section className="pt-20 pb-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-serif italic text-[#2a2a2a] mb-4">
            {t.projectsPage.title}
          </h1>
          <p className="text-lg text-stone-500 max-w-2xl mx-auto mb-8">
            {t.projectsPage.subtitle}
          </p>

          {/* Search + View Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center gap-3 max-w-xl mx-auto"
          >
            <div className="relative flex-1 w-full">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder={t.projectsPage.searchPlaceholder}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300 transition"
              />
            </div>
            <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-amber-700 text-white' : 'text-stone-400 hover:text-stone-600'}`}
                title="Lưới"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                  <rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/>
                  <rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/>
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-amber-700 text-white' : 'text-stone-400 hover:text-stone-600'}`}
                title="Danh sách"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
              </button>
            </div>
          </motion.div>

          {searchQuery && (
            <p className="text-sm text-stone-400 mt-3">
              {filteredProjects.length} kết quả cho &ldquo;<strong className="text-stone-600">{searchQuery}</strong>&rdquo;
            </p>
          )}
        </div>
      </section>

      {/* Projects Grid / List */}
      <section className="pb-24 px-4 min-h-[50vh]">
        <div className="max-w-7xl mx-auto">
          {error ? <RecoveryMessage onRetry={() => void fetchData()} /> : !isDataLoaded ? (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden p-3">
                  <ProjectCardSkeleton />
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-5xl mb-4">🏡</div>
              <h3 className="text-xl font-heading font-bold text-stone-400 mb-2">
                {projects.length === 0 ? t.projectsPage.noProjects : t.projectsPage.noMatch}
              </h3>
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="mt-4 text-sm text-amber-700 underline">{t.projectsPage.clearSearch}</button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, idx) => {
                const imgProps = getResponsiveImageProps({
                  source: project.image, aspectRatio: 4/3, baseWidth: 800,
                  sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
                  className: 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-700',
                  alt: project.name, loading: 'lazy'
                });
                return (
                  <motion.div
                    key={project._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.04 }}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-stone-100 flex flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-700"
                    role="button"
                    tabIndex={0}
                    aria-label={`${t.projectDetail.viewDetail}: ${project.name}`}
                    onClick={(event) => openProject(project, event.currentTarget)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openProject(project, event.currentTarget);
                      }
                    }}
                  >
                    <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                      {imgProps ? <img {...imgProps} /> : <div className="w-full h-full flex items-center justify-center text-stone-300">{t.projectDetail.noImage}</div>}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="font-heading font-bold text-[#2a2a2a] text-xl mb-3 group-hover:text-amber-800 transition-colors">{project.name}</h3>
                      {project.generalInfo && <p className="text-sm text-stone-500 mb-4 line-clamp-3">{project.generalInfo}</p>}
                      <div className="mt-auto pt-4 border-t border-stone-100 flex justify-between items-center text-sm font-medium text-amber-800 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>{t.projectDetail.viewDetail}</span><span>→</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              </AnimatePresence>
            </motion.div>
          ) : (
            /* List view */
            <motion.div layout className="flex flex-col divide-y divide-stone-100">
              <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, idx) => {
                const imgProps = getResponsiveImageProps({
                  source: project.image, aspectRatio: 4/3, baseWidth: 300,
                  sizes: '120px',
                  className: 'w-full h-full object-cover',
                  alt: project.name, loading: 'lazy'
                });
                return (
                  <motion.div
                    key={project._id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="group flex items-center gap-5 py-5 cursor-pointer hover:bg-amber-50/50 px-2 rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-700"
                    role="button"
                    tabIndex={0}
                    aria-label={`${t.projectDetail.viewDetail}: ${project.name}`}
                    onClick={(event) => openProject(project, event.currentTarget)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openProject(project, event.currentTarget);
                      }
                    }}
                  >
                    <div className="shrink-0 w-24 h-[72px] aspect-[4/3] bg-stone-100 rounded-xl overflow-hidden">
                      {imgProps ? <img {...imgProps} /> : <div className="w-full h-full bg-stone-200" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-bold text-[#2a2a2a] text-lg group-hover:text-amber-800 transition-colors truncate">{project.name}</h3>
                      {project.generalInfo && <p className="text-sm text-stone-500 line-clamp-2 mt-1">{project.generalInfo}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-amber-700 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">{t.projectDetail.viewDetail} →</span>
                    </div>
                  </motion.div>
                );
              })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* Back to Top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}
            className="fixed bottom-6 right-6 w-12 h-12 bg-[#2a2a2a] text-white rounded-full shadow-xl flex items-center justify-center z-50 hover:bg-amber-700 transition-colors"
            title={t.nav.backToTop}
            aria-label={t.nav.backToTop}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/></svg>
          </motion.button>
        )}
      </AnimatePresence>



      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (isMobile ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
              onClick={closeProject}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              role="dialog"
              aria-modal="true"
              aria-label={selectedProject.name}
              onKeyDown={(event) => {
                if (event.key !== 'Tab') return;
                const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'));
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
              className="relative flex h-[100dvh] w-full flex-col overflow-y-auto overscroll-contain bg-[#fdfbf7] shadow-2xl"
            >
              <button 
                autoFocus
                onClick={closeProject}
                aria-label={t.contact.close}
                className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur hover:bg-stone-100 rounded-full text-stone-600 transition-colors shadow-sm"
              >
                ✕
              </button>

              {/* Left Side: Content */}
              <div className="order-2 w-full p-6 pb-16">
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-[#2a2a2a] mb-8 border-b border-stone-200 pb-6">
                  {selectedProject.name}
                </h2>
                <ProjectShareLink key={projectPath(selectedProject)} project={selectedProject} mediaKey={activeMedia} className="mb-8 inline-block text-sm font-semibold text-amber-800 underline underline-offset-4" />

                {selectedProject.generalInfo && (
                  <div className="mb-10">
                    <h4 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-3">{t.projectDetail.generalInfo}</h4>
                    <p className="text-lg text-stone-600 whitespace-pre-wrap leading-relaxed">{selectedProject.generalInfo}</p>
                  </div>
                )}

                {selectedProject.content && (
                  <div className="mb-12">
                    <h4 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">{t.projectDetail.story}</h4>
                    <p className="text-stone-700 whitespace-pre-wrap leading-[2.5] font-handwriting text-lg">{selectedProject.content}</p>
                  </div>
                )}

                {selectedProject.youtubeLink && (
                  <div className="mt-10 pb-10">
                    <h4 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">{t.projectDetail.video}</h4>
                    <div className="aspect-video w-full rounded-xl overflow-hidden shadow-md">
                      <iframe 
                        className="w-full h-full"
                        src={getYoutubeEmbedUrl(selectedProject.youtubeLink)}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Slideshow / PDF Viewer */}
              <div className="relative order-1 w-full shrink-0 bg-stone-100 px-4 pb-4 pt-16">
                {selectedProject.modelFileUrl && (
                  <button
                    onClick={() => navigateMedia(showMobileModel ? galleryKeys[0] || 'model' : 'model')}
                    className="absolute left-6 top-6 z-10 rounded-full bg-white px-4 py-2 text-xs font-bold text-stone-800 shadow-sm"
                  >
                    {showMobileModel ? t.projectDetail.viewPhotos : t.projectDetail.viewModel}
                  </button>
                )}
                {showMobileModel && selectedProject.modelFileUrl ? (
                  <ProjectModelPanel
                    url={selectedProject.modelFileUrl}
                    name={selectedProject.name}
                    className="h-[min(74dvh,720px)] w-full"
                    fallback={selectedProject.image?.asset ? <img src={urlFor(selectedProject.image).width(1000).auto('format').url()} alt={selectedProject.name} className="h-full w-full object-contain" /> : undefined}
                  />
                ) : mediaCount > 0 ? (
                  <>
                    <div className="relative h-[min(74dvh,720px)] w-full overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
                      {showingPdf && selectedProject.pdfFileUrl ? (
                        <Suspense fallback={<div className="flex h-full items-center justify-center" role="status">{t.scene.loadingData}</div>}>
                          <PdfPageMedia url={selectedProject.pdfFileUrl} pageNumber={Number(activeMedia?.slice(4))} onPageCount={updatePdfPageCount} className="h-full w-full" />
                        </Suspense>
                      ) : projectImages[activeImageIndex] ? (
                        <button
                          type="button"
                          className="h-full w-full cursor-zoom-in"
                          aria-label={t.projectDetail.zoomIn}
                          onClick={() => setFullscreenImage(urlFor(projectImages[activeImageIndex]).width(2000).quality(90).auto('format').url())}
                        >
                          <img {...getResponsiveImageProps({
                            source: projectImages[activeImageIndex],
                            baseWidth: 1600,
                            sizes: '(max-width: 768px) 100vw, 60vw',
                            className: 'h-full w-full object-contain',
                            alt: `${selectedProject.name} image ${activeImageIndex + 1}`,
                          })} />
                        </button>
                      ) : null}
                    </div>
                    {mediaCount > 1 && (
                      <div className="mt-4 flex shrink-0 items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm shadow-sm" aria-label={t.projectDetail.gallery}>
                        <button type="button" onClick={() => moveMedia(-1)} aria-label={t.projectDetail.previousImage} className="h-12 w-12 rounded-full border border-stone-200">←</button>
                        <span className="font-medium tabular-nums">{Math.max(1, navigationKeys.indexOf(activeMedia || '') + 1)} / {mediaCount}</span>
                        <button type="button" onClick={() => moveMedia(1)} aria-label={t.projectDetail.nextImage} className="h-12 w-12 rounded-full border border-stone-200">→</button>
                      </div>
                    )}
                    {mediaCount > 1 && (
                      <div className="mt-3 flex gap-2 overflow-x-auto pb-2" aria-label={t.projectDetail.gallery}>
                        {navigationKeys.map((key, index) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => navigateMedia(key)}
                            aria-label={key.startsWith('pdf-') ? `PDF page ${key.slice(4)}` : `${selectedProject.name} image ${index + 1}`}
                            aria-current={activeMedia === key ? 'true' : undefined}
                            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium ${activeMedia === key ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 bg-white text-stone-700'}`}
                          >
                            {key.startsWith('pdf-') ? `PDF ${key.slice(4)}` : String(index + 1).padStart(2, '0')}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400">
                     {t.projectDetail.noImage}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        ) : (
          <DesktopProjectViewer key={selectedProject._id} project={selectedProject} activeMedia={activeMedia} mediaKeys={mediaKeys} onMediaChange={moveMedia} onPdfPageCount={updatePdfPageCount} onClose={closeProject} />
        ))}
      </AnimatePresence>

      {/* Fullscreen Image Viewer */}
      <FullscreenImageOverlay 
        selectedImage={fullscreenImage} 
        onClose={() => setFullscreenImage(null)} 
      />
    </div>
  );
}
