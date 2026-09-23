import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { SubpageNavigation } from '../components/SubpageNavigation';
import { RecoveryMessage } from '../components/ui/RecoveryMessage';
import { OG_IMAGE_URL, pageUrl } from '../config/site';
import { useProjectImages } from '../hooks';
import { useTranslation } from '../i18n';
import { useStore } from '../store/useStore';
import { getResponsiveImageProps } from '../utils/image';
import { projectPath, projectSlug } from '../utils/projectSlug';
import { getYoutubeEmbedUrl } from '../utils/youtube';

export default function ProjectPage() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const { projects, settings, isDataLoaded, error, fetchData } = useStore();
  const project = projects.find(item => projectSlug(item) === slug) || null;
  const images = useProjectImages(project);
  const hero = images[0];
  const heroProps = getResponsiveImageProps({
    source: hero,
    baseWidth: 1536,
    sizes: '(max-width: 768px) 100vw, 80vw',
    alt: project?.name || '',
    loading: 'eager',
    className: 'h-full w-full object-cover',
  });

  useEffect(() => {
    if (!isDataLoaded) void fetchData();
  }, [isDataLoaded, fetchData]);

  if (error) {
    return <div className="min-h-screen bg-[#fdfbf7]"><SubpageNavigation /><RecoveryMessage onRetry={() => void fetchData()} /></div>;
  }

  if (!isDataLoaded) {
    return <div className="min-h-screen bg-[#fdfbf7]"><SubpageNavigation /><main className="mx-auto max-w-6xl px-6 py-24" role="status">{t.scene.loadingData}</main></div>;
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#fdfbf7]">
        <Helmet><title>{t.caseStudy.missing} | Hiên Archi Studio</title><meta name="robots" content="noindex" /></Helmet>
        <SubpageNavigation />
        <main className="mx-auto max-w-6xl px-6 py-24">
          <h1 className="font-heading text-4xl text-[#2a2a2a]">{t.caseStudy.missing}</h1>
          <Link to="/projects" className="mt-8 inline-block text-amber-800 underline underline-offset-4">{t.caseStudy.back}</Link>
        </main>
      </div>
    );
  }

  const canonical = pageUrl(projectPath(project));
  const description = project.generalInfo?.replace(/\s+/g, ' ').trim().slice(0, 160) || t.projectsPage.subtitle;
  const imageUrl = getResponsiveImageProps({ source: hero, aspectRatio: 1200 / 630, baseWidth: 1200 })?.src || OG_IMAGE_URL;
  const title = `${project.name} | Hiên Archi Studio`;

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#2a2a2a]">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={imageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
      </Helmet>
      <SubpageNavigation />
      <main>
        <header className="mx-auto max-w-6xl px-6 pb-12 pt-14 md:pt-20">
          <Link to="/projects" className="text-sm font-semibold text-amber-800 hover:underline focus-visible:underline">{t.caseStudy.back}</Link>
          <p className="mt-12 text-xs font-bold uppercase tracking-[0.3em] text-stone-500">Hiên studio / {t.nav.projects}</p>
          <h1 className="mt-5 max-w-5xl font-heading text-5xl font-bold leading-tight tracking-tight md:text-7xl">{project.name}</h1>
          {project.generalInfo && <p className="mt-8 max-w-3xl whitespace-pre-line font-serif text-lg leading-relaxed text-stone-600 md:text-2xl">{project.generalInfo}</p>}
        </header>

        <div className="mx-auto max-w-[1600px] bg-stone-200">
          {heroProps ? <img {...heroProps} fetchPriority="high" className="max-h-[80vh] w-full object-cover" /> : <div className="flex aspect-[16/9] items-center justify-center text-stone-500">{t.projectDetail.noImage}</div>}
        </div>

        {project.content && (
          <section className="mx-auto grid max-w-6xl gap-8 px-6 py-20 md:grid-cols-[1fr_2fr] md:gap-20 md:py-28">
            <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-amber-800">{t.projectDetail.story}</h2>
            <p className="whitespace-pre-line font-serif text-lg leading-[1.9] text-stone-700 md:text-2xl">{project.content}</p>
          </section>
        )}

        {images.length > 1 && (
          <section className="mx-auto max-w-6xl px-6 pb-20 md:pb-28" aria-label={t.projectDetail.gallery}>
            <h2 className="mb-8 text-xs font-bold uppercase tracking-[0.25em] text-amber-800">{t.projectDetail.gallery}</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {images.slice(1).map((image, index) => {
                const props = getResponsiveImageProps({ source: image, baseWidth: 900, sizes: '(max-width: 768px) 100vw, 50vw', alt: `${project.name} ${index + 2}`, className: 'h-full w-full object-cover' });
                return props && <div key={image.asset?._ref || index} className="aspect-[4/3] overflow-hidden bg-stone-200"><img {...props} /></div>;
              })}
            </div>
          </section>
        )}

        {project.youtubeLink && (
          <section className="mx-auto max-w-6xl px-6 pb-20 md:pb-28">
            <h2 className="mb-8 text-xs font-bold uppercase tracking-[0.25em] text-amber-800">{t.projectDetail.video}</h2>
            <iframe className="aspect-video w-full" src={getYoutubeEmbedUrl(project.youtubeLink)} title={`${project.name} video`} loading="lazy" allowFullScreen />
          </section>
        )}

        <footer className="bg-[#ebe6db] px-6 py-20 text-center md:py-28">
          {project.pdfFileUrl && <a href={project.pdfFileUrl} target="_blank" rel="noopener noreferrer" className="mb-12 inline-block text-sm font-semibold text-amber-800 underline underline-offset-4">{t.caseStudy.viewPdf}</a>}
          <h2 className="font-heading text-3xl font-bold md:text-5xl">{t.caseStudy.contactPrompt}</h2>
          <a href={`mailto:${settings?.email || 'thaibao95arc@gmail.com'}`} className="mt-8 inline-block rounded-full bg-[#2a2a2a] px-8 py-4 text-sm font-bold uppercase tracking-widest text-white hover:bg-amber-800">{t.nav.contact}</a>
        </footer>
      </main>
    </div>
  );
}
