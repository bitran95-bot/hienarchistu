import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { ContactModal } from './ui/ContactModal';
import { useTranslation } from '../i18n';

export function ProjectContact({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const { lang } = useTranslation();
  return <>
    <button type="button" onClick={() => setOpen(true)} className="motion-link mt-8 inline-flex items-center gap-3 border-b border-amber-800 pb-2 text-sm font-semibold text-amber-800">
      {lang === 'vi' ? 'Trao đổi về một dự án tương tự' : 'Discuss a similar project'} <span aria-hidden="true">↗</span>
    </button>
    {createPortal(<AnimatePresence>{open && <ContactModal projectName={name} onClose={() => setOpen(false)} />}</AnimatePresence>, document.body)}
  </>;
}
