import { lazy, Suspense, type ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { useTranslation } from '../i18n';
import { useIsMobile } from '../hooks';

const ProjectModelCanvas = lazy(() => import('./ProjectModelCanvas'));

export function ProjectModelPanel({ url, name, className = '', fallback }: {
  url: string;
  name: string;
  className?: string;
  fallback?: ReactNode;
}) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  return (
    <div role="group" aria-label={`${t.projectDetail.modelOf} ${name}`} className={`relative overflow-hidden bg-white ${className}`}>
      <ErrorBoundary fallback={fallback || <div className="flex h-full items-center justify-center text-sm text-stone-500">{t.projectDetail.modelUnavailable}</div>}>
        <Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-stone-500">{t.projectDetail.loadingModel}</div>}>
          <ProjectModelCanvas url={url} loadingLabel={t.projectDetail.loadingModel} />
          <p className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-white/85 px-3 py-1.5 text-[11px] font-medium text-stone-600 shadow-sm">
            {isMobile ? t.projectDetail.rotateModelMobile : t.projectDetail.rotateModel}
          </p>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
