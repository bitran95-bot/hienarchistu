import { useTranslation } from '../../i18n';

/** A loading indicator that never covers content or captures input. */
export function InlineLoadingIndicator({ label, className = '' }: { label?: string; className?: string }) {
  const { t } = useTranslation();
  return (
    <div role="status" aria-label={label || t.projectDetail.loadingModel} className={`pointer-events-none flex items-center justify-center ${className}`}>
      <span aria-hidden="true" className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#bda994]/30 border-t-[#8b7355]" />
    </div>
  );
}
