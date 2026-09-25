import { useState } from 'react';
import { pageUrl } from '../config/site';
import { useTranslation } from '../i18n';
import { projectPath } from '../utils/projectSlug';
import { projectMediaPath } from '../utils/projectMedia';
import type { Project } from '../types';

interface ProjectShareLinkProps {
  project: Pick<Project, 'name' | 'slug'>;
  className?: string;
  mediaKey?: string | null;
}

export function ProjectShareLink({ project, className, mediaKey }: ProjectShareLinkProps) {
  const { t } = useTranslation();
  const [state, setState] = useState<'idle' | 'project-copied' | 'media-copied' | 'project-manual' | 'media-manual'>('idle');
  const projectUrl = pageUrl(projectPath(project));
  const mediaUrl = mediaKey ? pageUrl(projectMediaPath(project, mediaKey)) : null;

  const copyLink = async (url: string, kind: 'project' | 'media') => {
    try {
      await navigator.clipboard.writeText(url);
      setState(`${kind}-copied`);
    } catch {
      setState(`${kind}-manual`);
    }
  };

  return (
    <span className={`${className || ''} flex flex-wrap gap-x-5 gap-y-2`}>
      <button type="button" onClick={() => void copyLink(projectUrl, 'project')} className="hover:text-amber-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700">
        {state === 'project-copied' ? t.projectDetail.linkCopied : t.projectDetail.copyLink}
      </button>
      {mediaUrl && (
        <button type="button" onClick={() => void copyLink(mediaUrl, 'media')} className="hover:text-amber-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700">
          {state === 'media-copied' ? t.projectDetail.mediaLinkCopied : t.projectDetail.copyMediaLink}
        </button>
      )}
      {(state === 'project-manual' || state === 'media-manual') && (
        <input
          aria-label={state === 'media-manual' ? t.projectDetail.copyMediaLink : t.projectDetail.copyLink}
          className="mt-2 block w-full rounded border border-stone-300 bg-white px-2 py-1 text-xs text-stone-700"
          readOnly
          value={state === 'media-manual' ? mediaUrl || '' : projectUrl}
          onFocus={event => event.currentTarget.select()}
          onClick={event => event.currentTarget.select()}
        />
      )}
    </span>
  );
}
