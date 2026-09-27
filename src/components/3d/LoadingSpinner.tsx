import { useEffect, useState } from 'react';
import { Html } from '@react-three/drei';
import { useLinkClickHandler } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import type { Project } from '../../types';
import { InlineLoadingIndicator } from '../ui/InlineLoadingIndicator';

export function LoadingSpinner({ project }: { project?: Project }) {
  const { t } = useTranslation();
  // Html renders a separate DOM root; capture routing here and pass its handler.
  const openProjects = useLinkClickHandler('/projects');
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 20_000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <Html center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <div className="flex flex-col items-center justify-center gap-3">
        <InlineLoadingIndicator label={`${t.projectDetail.loadingModel}${project ? ` ${project.name}` : ''}`} />
        {slow && <a href="/projects" onClick={openProjects} className="pointer-events-auto whitespace-nowrap rounded-full bg-white/90 px-3 py-2 text-xs text-amber-800 underline">
          {t.projectDetail.viewInProjects}
        </a>}
      </div>
    </Html>
  );
}

export function ModelUnavailable({ project }: { project: Project }) {
  const { t } = useTranslation();
  const openProjects = useLinkClickHandler('/projects');
  return (
    <Html center zIndexRange={[20, 0]}>
      <div role="alert" aria-label={`${t.projectDetail.modelOf} ${project.name}`} className="w-48 rounded-xl bg-white/95 p-3 text-center text-xs text-stone-600 shadow-sm">
        <p>{t.projectDetail.modelUnavailable}</p>
        <a href="/projects" onClick={openProjects} className="mt-2 block text-amber-800 underline">{t.projectDetail.viewInProjects}</a>
      </div>
    </Html>
  );
}
