import React, { useState, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { urlFor } from '../sanityClient';
import { motion, AnimatePresence } from 'framer-motion';

// Component wrapper for each page
const Page = React.forwardRef((props: any, ref: any) => {
  return (
    <div className="page bg-[#fdfbf7] shadow-xl overflow-hidden border-r border-stone-200" ref={ref} style={{ backgroundImage: 'radial-gradient(#d5d5d5 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      <div className="h-full w-full flex flex-col p-8 md:p-12 relative overflow-y-auto">
        {props.children}
        {props.number && (
           <div className="absolute bottom-4 left-0 w-full text-center text-xs font-serif text-stone-400">
             - {props.number} -
           </div>
        )}
      </div>
    </div>
  );
});

export function MagazineViewer({ project, onClose, onNext, onPrev, currentIndex, totalIndex }: any) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Calculate flipbook dimensions based on screen size
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const width = isMobile ? window.innerWidth * 0.9 : 500;
  const height = isMobile ? window.innerHeight * 0.7 : 700;

  // Prepare gallery images
  const gallery = project.gallery || [];
  
  // Front Cover image
  const coverImageUrl = project.image?.asset 
    ? urlFor(project.image).width(800).quality(80).auto('format').url() 
    : (project.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&auto=format&fit=crop");

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center pointer-events-auto bg-black/80 backdrop-blur-sm"
    >
      {/* Controls */}
      <div className="absolute top-6 w-full px-6 flex justify-between items-center z-50">
         <div className="flex items-center gap-4 text-white">
            <button onClick={onPrev} className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/20 transition-colors">
               ←
            </button>
            <span className="text-sm font-medium">{currentIndex + 1} / {totalIndex}</span>
            <button onClick={onNext} className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/20 transition-colors">
               →
            </button>
         </div>
         <button onClick={onClose} className="w-10 h-10 rounded-full border border-white/30 text-white flex items-center justify-center hover:bg-white/20 transition-colors text-xl">
            ×
         </button>
      </div>

      {/* Magazine */}
      <div className="relative shadow-2xl">
        {/* @ts-ignore */}
        <HTMLFlipBook
          width={width}
          height={height}
          size="stretch"
          minWidth={300}
          maxWidth={800}
          minHeight={400}
          maxHeight={1000}
          maxShadowOpacity={0.5}
          showCover={true}
          mobileScrollSupport={true}
          className="magazine-flipbook"
        >
          {/* Page 1: Cover */}
          <Page>
             <div className="w-full h-full relative -m-8 md:-m-12" style={{ width: 'calc(100% + 4rem)', height: 'calc(100% + 6rem)' }}>
                <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-12 left-8 right-8 text-white">
                   <h1 className="text-4xl md:text-6xl font-heading font-bold leading-tight mb-2 tracking-tighter">
                     {project.name}
                   </h1>
                   <p className="text-white/80 font-serif italic">Ấn phẩm kiến trúc Hiên studio</p>
                </div>
             </div>
          </Page>

          {/* Page 2: Inside Cover (Blank/Credits) */}
          <Page number="2">
             <div className="h-full flex flex-col items-center justify-center text-stone-400 font-serif italic text-sm">
                <p>HIÊN studio</p>
                <p className="mt-4">Designed with passion.</p>
             </div>
          </Page>

          {/* Page 3: General Info & Content */}
          <Page number="3">
             <h2 className="text-2xl md:text-4xl font-heading font-bold text-[#2a2a2a] mb-6 tracking-tighter">Về dự án</h2>
             <div className="text-base md:text-lg text-[#333] leading-relaxed whitespace-pre-wrap mb-8 font-medium">
                {project.generalInfo || project.desc || "Thông tin chung dự án đang được cập nhật..."}
             </div>
             {project.content && (
                <>
                  <h3 className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <span className="w-6 h-[1px] bg-stone-300 inline-block"></span> Chi tiết
                  </h3>
                  <p className="font-serif italic text-sm md:text-base text-[#555] leading-relaxed pl-4 border-l-2 border-amber-700 whitespace-pre-wrap pb-12">
                    {project.content}
                  </p>
                </>
             )}
          </Page>

          {/* Page 4: Video (if any) or first gallery image */}
          {project.youtubeLink ? (
             <Page number="4">
                <h2 className="text-xl md:text-2xl font-heading font-bold text-[#2a2a2a] mb-6 tracking-tighter">Video Thực Tế</h2>
                <div className="w-full aspect-video rounded-md overflow-hidden shadow-md">
                   <iframe 
                     className="w-full h-full"
                     src={project.youtubeLink.replace("watch?v=", "embed/").replace("youtu.be/", "www.youtube.com/embed/")} 
                     title="YouTube video player" 
                     frameBorder="0" 
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                     allowFullScreen
                   ></iframe>
                </div>
             </Page>
          ) : (
             <Page number="4">
                <div className="h-full flex flex-col items-center justify-center text-stone-400 font-serif italic text-sm">
                   <p>Hình ảnh dự án ở các trang tiếp theo...</p>
                </div>
             </Page>
          )}

          {/* Page 5+: Gallery Images */}
          {gallery.map((img: any, idx: number) => {
             const fullSrc = urlFor(img).quality(100).auto('format').url();
             return (
               <Page key={`gallery-${idx}`} number={5 + idx}>
                  <div className="w-full h-full flex items-center justify-center cursor-zoom-in" onClick={() => setSelectedImage(fullSrc)}>
                     <img src={fullSrc} alt={`Gallery ${idx}`} className="max-w-full max-h-full object-contain shadow-md" />
                  </div>
               </Page>
             );
          })}
          
          {/* Ensure even number of pages so back cover exists */}
          {gallery.length % 2 !== 0 && (
             <Page number={5 + gallery.length}>
                <div className="h-full flex flex-col items-center justify-center text-stone-400 font-serif italic text-sm">
                   <p>The End.</p>
                </div>
             </Page>
          )}

        </HTMLFlipBook>
      </div>

      {/* FULLSCREEN IMAGE VIEWER */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.img 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedImage}
              alt="Fullscreen view"
              className="max-w-full max-h-full object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
