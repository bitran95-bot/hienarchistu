import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { urlFor } from '../sanityClient';
import type { Project } from '../types';

export default function ProjectsPage() {
  const { projects, isDataLoaded, fetchData } = useStore();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    if (!isDataLoaded) {
      fetchData();
    }
  }, [fetchData, isDataLoaded]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedProject(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
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
              className="relative w-full h-[95vh] max-w-[1400px] bg-[#fdfbf7] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur hover:bg-stone-100 rounded-full text-stone-600 transition-colors shadow-sm"
              >
                ✕
              </button>

              {/* Left Side: Main Image */}
              {selectedProject.image?.asset && (
                <div className="w-full md:w-1/2 h-64 md:h-full relative shrink-0 border-r border-stone-200">
                  <img 
                    src={urlFor(selectedProject.image as any).width(1200).height(1600).quality(85).auto('format').url()} 
                    alt={selectedProject.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <h2 className="absolute bottom-6 left-6 right-6 text-3xl sm:text-4xl font-heading font-bold text-white drop-shadow-lg">
                    {selectedProject.name}
                  </h2>
                </div>
              )}

              {/* Right Side: Content */}
              <div className={`w-full ${selectedProject.image?.asset ? 'md:w-1/2' : ''} h-full overflow-y-auto p-6 md:p-12 custom-scrollbar`}>
                {!selectedProject.image?.asset && (
                  <h2 className="text-4xl md:text-5xl font-heading font-bold text-[#2a2a2a] mb-8 border-b border-stone-200 pb-6">
                    {selectedProject.name}
                  </h2>
                )}

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

                {selectedProject.gallery && selectedProject.gallery.length > 0 && (
                  <div className="mb-12">
                    <h4 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">Thư viện ảnh</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedProject.gallery.map((img, i) => (
                        <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 shadow-sm border border-stone-100">
                          <img 
                            src={urlFor(img as any).width(800).height(600).quality(85).auto('format').url()} 
                            alt={`Gallery ${i}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProject.youtubeLink && (
                  <div className="mt-10 pb-10">
                    <h4 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">Video Dự Án</h4>
                    <div className="aspect-video w-full rounded-xl overflow-hidden shadow-md">
                      <iframe 
                        className="w-full h-full"
                        src={selectedProject.youtubeLink.replace('watch?v=', 'embed/').split('&')[0]}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
