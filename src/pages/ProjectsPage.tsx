import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { urlFor } from '../sanityClient';
import type { Project } from '../types';

export default function ProjectsPage() {
  const { projects, isDataLoaded, fetchData } = useStore();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  const projectImages = useMemo(() => {
    if (!selectedProject) return [];
    
    let images: any[] = [];
    
    if (selectedProject.image?.asset) {
       images.push(selectedProject.image);
    }

    const hasMagazinePages = selectedProject.magazinePages && selectedProject.magazinePages.length > 0;
    const hasGallery = selectedProject.gallery && selectedProject.gallery.length > 0;
    
    if (hasMagazinePages) {
       selectedProject.magazinePages?.forEach(page => {
         if (page.images) {
           images = [...images, ...page.images];
         }
       });
    } else if (hasGallery) {
       images = [...images, ...(selectedProject.gallery || [])];
    }
    
    return images;
  }, [selectedProject]);

  useEffect(() => {
     setActiveImageIndex(0);
  }, [selectedProject]);

  // Helper cho Youtube URL
  const getYoutubeEmbedUrl = (url: string) => {
    let videoId = '';
    if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1].split('?')[0];
    else if (url.includes('watch?v=')) videoId = url.split('watch?v=')[1].split('&')[0];
    else if (url.includes('shorts/')) videoId = url.split('shorts/')[1].split('?')[0];
    else if (url.includes('embed/')) videoId = url.split('embed/')[1].split('?')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  useEffect(() => {
    if (!isDataLoaded) {
      fetchData();
    }
  }, [fetchData, isDataLoaded]);

  // Handle escape key to close modal or fullscreen image
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (fullscreenImage) setFullscreenImage(null);
        else setSelectedProject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenImage]);

  return (
    <div className="min-h-screen bg-[#fdfbf7] selection:bg-stone-300">
      <Helmet>
        <title>Dự án | Hiên Archi Studio</title>
        <meta name="description" content="Khám phá các dự án thiết kế kiến trúc và nội thất mộc mạc, gần gũi với tự nhiên của Hiên Archi Studio." />
      </Helmet>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#fdfbf7]/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="font-heading font-bold text-xl text-[#2a2a2a] tracking-widest uppercase hover:opacity-70 transition-opacity">
            Hiên.
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium text-stone-500">
            <Link to="/" className="hover:text-[#2a2a2a] transition-colors">Trang chủ 3D</Link>
            <Link to="/shop" className="hover:text-[#2a2a2a] transition-colors">Cửa hàng</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif italic text-[#2a2a2a] mb-6"
          >
            Các Dự Án Của Chúng Tôi
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-stone-500 max-w-2xl mx-auto"
          >
            Nơi lưu giữ những nếp nhà yên lành, những không gian mộc mạc và chân thành mà Hiên đã may mắn được đồng hành.
          </motion.p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="pb-24 px-4 min-h-[50vh]">
        <div className="max-w-7xl mx-auto">
          {!isDataLoaded ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-pulse text-stone-400 font-heading">Đang tải dự án...</div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center text-stone-400 mt-20">
              Chưa có dự án nào được đăng tải.
            </div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {projects.map((project, idx) => {
                const imageUrl = project.image?.asset
                  ? urlFor(project.image as any).width(800).height(600).quality(85).auto('format').url()
                  : null;

                return (
                  <motion.div
                    key={project._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-stone-100 flex flex-col"
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                      {imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt={project.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                          loading="lazy" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                          Không có ảnh
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="font-heading font-bold text-[#2a2a2a] text-xl mb-3 group-hover:text-amber-800 transition-colors">
                        {project.name}
                      </h3>
                      {project.generalInfo && (
                        <p className="text-sm text-stone-500 mb-4 line-clamp-3">
                          {project.generalInfo}
                        </p>
                      )}
                      <div className="mt-auto pt-4 border-t border-stone-100 flex justify-between items-center text-sm font-medium text-amber-800 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Xem chi tiết</span>
                        <span>→</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
              onClick={() => setSelectedProject(null)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full h-[100dvh] max-w-none bg-[#fdfbf7] shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur hover:bg-stone-100 rounded-full text-stone-600 transition-colors shadow-sm"
              >
                ✕
              </button>

              {/* Left Side: Content */}
              <div className="w-full md:w-2/5 h-1/2 md:h-full overflow-y-auto p-6 md:p-10 custom-scrollbar border-r border-stone-200 order-2 md:order-1">
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-[#2a2a2a] mb-8 border-b border-stone-200 pb-6">
                  {selectedProject.name}
                </h2>

                {selectedProject.generalInfo && (
                  <div className="mb-10">
                    <h4 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-3">Thông tin chung</h4>
                    <p className="text-lg text-stone-600 whitespace-pre-wrap leading-relaxed">{selectedProject.generalInfo}</p>
                  </div>
                )}

                {selectedProject.content && (
                  <div className="mb-12">
                    <h4 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">Câu chuyện dự án</h4>
                    <p className="text-stone-700 whitespace-pre-wrap leading-[2.5] font-handwriting text-lg">{selectedProject.content}</p>
                  </div>
                )}

                {selectedProject.youtubeLink && (
                  <div className="mt-10 pb-10">
                    <h4 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">Video Dự Án</h4>
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

              {/* Right Side: Slideshow */}
              <div className="w-full md:w-3/5 h-1/2 md:h-full relative shrink-0 bg-stone-100 flex flex-col p-4 md:p-6 order-1 md:order-2">
                {projectImages.length > 0 ? (
                  <>
                    <div className="w-full flex-1 relative bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden group cursor-pointer" onClick={() => setFullscreenImage(urlFor(projectImages[activeImageIndex]).width(2000).quality(90).auto('format').url())}>
                       <AnimatePresence mode="wait">
                         <motion.img 
                           key={activeImageIndex}
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           exit={{ opacity: 0 }}
                           transition={{ duration: 0.3 }}
                           src={urlFor(projectImages[activeImageIndex]).width(1600).quality(85).auto('format').url()}
                           alt={`${selectedProject.name} image ${activeImageIndex + 1}`}
                           className="w-full h-full object-contain"
                         />
                       </AnimatePresence>
                       <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                         <span className="opacity-0 group-hover:opacity-100 text-white bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm transition-opacity">Phóng to</span>
                       </div>
                    </div>
                    
                    {projectImages.length > 1 && (
                      <div className="mt-4 flex gap-3 overflow-x-auto custom-scrollbar pb-2 pt-1 px-1 h-24 md:h-32 shrink-0">
                         {projectImages.map((img, idx) => (
                           <div 
                             key={idx}
                             onClick={() => setActiveImageIndex(idx)}
                             className={`shrink-0 aspect-square h-full rounded-lg overflow-hidden cursor-pointer transition-all duration-300 border-2 ${activeImageIndex === idx ? 'border-amber-700 opacity-100 shadow-md scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                           >
                             <img 
                               src={urlFor(img).width(200).height(200).quality(60).auto('format').url()}
                               alt={`Thumbnail ${idx}`}
                               className="w-full h-full object-cover"
                             />
                           </div>
                         ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400">
                     Không có hình ảnh
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen Image Viewer */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 cursor-zoom-out"
            onClick={() => setFullscreenImage(null)}
          >
            <button 
              onClick={() => setFullscreenImage(null)}
              className="absolute top-6 right-6 z-10 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              ✕
            </button>
            <motion.img 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={fullscreenImage}
              alt="Fullscreen view"
              className="max-w-full max-h-[95vh] object-contain shadow-2xl rounded-sm"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
