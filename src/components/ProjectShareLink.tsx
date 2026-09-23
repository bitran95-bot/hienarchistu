import { useState } from 'react';
import { pageUrl } from '../config/site';
import { useTranslation } from '../i18n';
import { projectPath } from '../utils/projectSlug';
import type { Project } from '../types';

interface ProjectShareLinkProps {
  project: Pick<Project, 'name' | 'slug'>;
  className?: string;
}

export function ProjectShareLink({ project, className }: ProjectShareLinkProps) {
  const { t } = useTranslation();
  const [state, setState] = useState<'idle' | 'copied' | 'manual'>('idle');
  const url = pageUrl(projectPath(project));

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setState('copied');
    } catch {
      setState('manual');
    }
  };

  return (
    <span className={className}>
      <button type="button" onClick={() => void copyLink()} className="hover:text-amber-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700">
        {state === 'copied' ? t.projectDetail.linkCopied : t.projectDetail.copyLink}
      </button>
      {state === 'manual' && (
        <input
          aria-label={t.projectDetail.copyLink}
          className="mt-2 block w-full rounded border border-stone-300 bg-white px-2 py-1 text-xs text-stone-700"
          readOnly
          value={url}
          onFocus={event => event.currentTarget.select()}
          onClick={event => event.currentTarget.select()}
        />
      )}
    </span>
  );
}
