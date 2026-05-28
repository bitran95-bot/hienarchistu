import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { urlFor } from '../sanityClient';

export function Overlay({ modalOpen, setModalOpen, activeProject, projects = [] }: any) {
  const [contactOpen, setContactOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fallbackProjects = [
    { name: "Nhà bên Hiên", generalInfo: "Đang cập nhật...", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop" },
    { name: "Sài Gòn Pavilion", generalInfo: "Đang cập nhật...", image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2070&auto=format&fit=crop" }
  ];

  const currentDetail = (projects && projects.length > 0) ? projects[activeProject] || projects[0] : fallbackProjects[0];
  
  const imageUrl = currentDetail?.image?.asset 
    ? urlFor(currentDetail.image).width(1200).quality(80).auto('format').url() 
    : (currentDetail?.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop");

  // Used for fullscreen viewing
  const fullImageUrl = currentDetail?.image?.asset 
    ? urlFor(currentDetail.image).quality(100).auto('format').url() 
    : (currentDetail?.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&auto=format&fit=crop");

  return (
    <>
      {/* Logo lớn bắt đầu ở giữa và cuộn về góc */}
      <div 
        id="main-logo"
        className="fixed z-[100] cursor-pointer pointer-events-auto flex flex-col items-start"
        style={{ 
           top: '40%', 
           left: '25%', 
           transform: 'translate(-50%, -50%)',
           fontFamily: '"Be Vietnam Pro", sans-serif', 
           color: '#2a2a2a', 
           textShadow: '2px 10px 15px rgba(0,0,0,0.15)',
           transition: 'color 0.3s ease',
        }}
        onClick={() => {
           window.dispatchEvent(new CustomEvent('scroll-to-home'));
        }}
        onMouseEnter={(e) => {
           e.currentTarget.style.color = '#b45309';
        }}
        onMouseLeave={(e) => {
           e.currentTarget.style.color = '#2a2a2a';
        }}
      >
        <div style={{ fontSize: '176px', lineHeight: '0.8', paddingLeft: '0px' }}>HIÊN</div>
        <div style={{ fontSize: '176px', lineHeight: '0.8', paddingLeft: '80px' }}>studio</div>
      </div>

      <header className="fixed top-0 left-0 w-full px-12 py-8 flex items-center z-50 pointer-events-auto" style={{ fontFamily: '"Be Vietnam Pro", sans-serif' }}>
        <div className="w-1/3"></div>
        <div className="hidden md:flex items-center justify-center space-x-12 text-sm font-medium text-[#444444] w-1/3">
          <button onClick={() => window.dispatchEvent(new CustomEvent('scroll-to-about'))} className="hover:text-amber-700 transition-colors">Câu chuyện</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('scroll-to-projects'))} className="hover:text-amber-700 transition-colors">Dự Án</button>
          <button onClick={() => setContactOpen(true)} className="hover:text-amber-700 transition-colors">Liên Hệ</button>
        </div>
        <div className="w-1/3"></div>
      </header>

      {/* DETAIL MODAL FULLSCREEN */}
      <AnimatePresence>
      {modalOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex flex-col lg:flex-row pointer-events-auto bg-[#fdfbf7]"
        >
           {/* Nửa bên trái là hình ảnh 2D */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 100 }}
              className="w-full lg:w-1/2 h-[40vh] lg:h-full relative bg-stone-200 cursor-zoom-in"
              onClick={() => setSelectedImage(fullImageUrl)}
            >
               <img src={imageUrl} alt={currentDetail.name} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-black/10 hover:bg-black/0 transition-colors"></div>
            </motion.div>
           
           {/* Nửa bên phải là thông tin dự án, nền sáng */}
           <motion.div 
             initial={{ x: '100%' }}
             animate={{ x: 0 }}
             exit={{ x: '100%' }}
             transition={{ type: "spring", damping: 30, stiffness: 100 }}
             className="w-full lg:w-1/2 h-[60vh] lg:h-full bg-[#fdfbf7] shadow-2xl flex flex-col overflow-y-auto relative"
             style={{ backgroundImage: 'radial-gradient(#d5d5d5 1px, transparent 1px)', backgroundSize: '40px 40px' }}
           >
              {/* Nút Đóng (Header) */}
              <div className="p-8 md:p-12 flex justify-between items-center sticky top-0 z-10" style={{ background: 'linear-gradient(to bottom, #fdfbf7 60%, transparent)' }}>
                 <h2 className="text-sm font-bold text-stone-400 uppercase tracking-[0.2em]">Dự án</h2>
                 <button 
                   onClick={() => setModalOpen(false)}
                   className="text-2xl font-medium hover:text-amber-700 transition-colors flex items-center gap-2 group"
                 >
                   <span className="uppercase text-xs tracking-widest font-bold hidden md:inline">Đóng</span>
                   <div className="w-10 h-10 rounded-full border-2 border-[#2a2a2a] group-hover:border-amber-700 flex items-center justify-center transition-colors bg-[#fdfbf7]">
                      <span className="mb-1 text-xl leading-none">×</span>
                   </div>
                 </button>
              </div>

              {/* Nội dung chính */}
              <div className="px-8 md:px-12 pb-24 flex-1 flex flex-col">
                 <motion.h1 
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] text-[#2a2a2a] tracking-tighter mb-8"
                 >
                    {currentDetail.name}
                 </motion.h1>

                 <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, type: "spring" }} className="mb-8">
                     <p className="text-xl md:text-2xl text-[#333] leading-relaxed whitespace-pre-wrap">
                        {currentDetail.generalInfo || currentDetail.desc || "Thông tin chung dự án đang được cập nhật..."}
                     </p>
                 </motion.div>

                 <div className="flex flex-col gap-8 md:gap-12 mt-4 border-t border-stone-300 pt-8">
                    {/* Inspiration */}
                    {currentDetail.inspiration && (
                       <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, type: "spring" }}>
                          <h3 className="text-sm font-bold text-stone-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <span className="w-8 h-[1px] bg-stone-300 inline-block"></span> Cảm hứng sáng tác
                          </h3>
                          <p className="font-serif italic text-lg md:text-xl text-[#555] leading-relaxed border-l-4 border-amber-700 pl-6 whitespace-pre-wrap">
                            "{currentDetail.inspiration}"
                          </p>
                       </motion.div>
                    )}

                    {/* Target Audience */}
                    {currentDetail.targetAudience && (
                       <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, type: "spring" }}>
                          <h3 className="text-sm font-bold text-stone-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <span className="w-8 h-[1px] bg-stone-300 inline-block"></span> Dành cho ai
                          </h3>
                          <p className="text-lg md:text-xl text-[#333] whitespace-pre-wrap">
                             {currentDetail.targetAudience}
                          </p>
                       </motion.div>
                    )}

                    {/* Concepts */}
                    {currentDetail.concepts && (
                       <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6, type: "spring" }}>
                          <h3 className="text-sm font-bold text-stone-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <span className="w-8 h-[1px] bg-stone-300 inline-block"></span> Ý tứ công trình
                          </h3>
                          <p className="text-lg md:text-xl text-[#333] leading-relaxed whitespace-pre-wrap">
                             {currentDetail.concepts}
                          </p>
                       </motion.div>
                    )}

                    {/* Gallery */}
                    {currentDetail.gallery && currentDetail.gallery.length > 0 && (
                       <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-8">
                           <h3 className="text-sm font-bold text-stone-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                             <span className="w-8 h-[1px] bg-stone-300 inline-block"></span> Thư viện hình ảnh
                           </h3>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               {currentDetail.gallery.map((img: any, idx: number) => {
                                   const thumbSrc = urlFor(img).width(800).quality(80).auto('format').url();
                                   const fullSrc = urlFor(img).quality(100).auto('format').url();
                                   return (
                                       <img key={idx} src={thumbSrc} alt={`${currentDetail.name} ${idx}`} onClick={() => setSelectedImage(fullSrc)} className="w-full h-auto object-cover border border-stone-300 shadow-sm cursor-zoom-in hover:opacity-90 transition-opacity" loading="lazy" />
                                   );
                               })}
                           </div>
                       </motion.div>
                    )}
                 </div>
              </div>
           </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* CONTACT FULLPAGE */}
      <AnimatePresence>
      {contactOpen && (
        <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: "spring", damping: 30, stiffness: 100 }}
          className="fixed inset-0 z-[110] bg-[#fdfbf7] pointer-events-auto flex flex-col overflow-y-auto"
          style={{ backgroundImage: 'radial-gradient(#d5d5d5 1px, transparent 1px)', backgroundSize: '40px 40px', fontFamily: '"Be Vietnam Pro", sans-serif' }}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-8 md:p-12 w-full">
             <div className="text-3xl font-bold tracking-tighter text-[#2a2a2a]">HIÊN studio</div>
             <button 
               onClick={() => setContactOpen(false)}
               className="text-2xl font-medium hover:text-amber-700 transition-colors flex items-center gap-3 group"
             >
               <span className="uppercase text-sm tracking-widest font-bold">Đóng</span>
               <div className="w-12 h-12 rounded-full border-2 border-[#2a2a2a] group-hover:border-amber-700 flex items-center justify-center transition-colors">
                  <span className="mb-1 text-2xl leading-none">×</span>
               </div>
             </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col md:flex-row p-8 md:p-12 lg:p-24 gap-16 lg:gap-24 h-full max-w-7xl mx-auto w-full items-center">
             {/* Left side: Huge Title */}
             <div className="md:w-1/2 flex flex-col justify-center">
                <motion.h2 
                   initial={{ opacity: 0, y: 50 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -50 }}
                   transition={{ delay: 0.2, duration: 0.5 }}
                   className="text-6xl md:text-8xl lg:text-[9rem] font-bold leading-[0.9] text-[#2a2a2a] uppercase tracking-tighter"
                >
                   Let's<br/>Talk.
                </motion.h2>
                <motion.p 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   transition={{ delay: 0.4 }}
                   className="mt-8 text-xl md:text-2xl text-stone-600 font-serif italic max-w-md border-l-4 border-amber-700 pl-6"
                >
                   "Mỗi dự án là một câu chuyện. Hãy cùng nhau viết nên câu chuyện kiến trúc của bạn."
                </motion.p>
             </div>

             {/* Right side: Contact Details */}
             <div className="md:w-1/2 flex flex-col justify-center space-y-12 md:space-y-16">
                <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ delay: 0.3, type: "spring" }}>
                   <h3 className="text-sm font-bold text-stone-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                     <span className="w-8 h-[1px] bg-stone-300 inline-block"></span> Điện thoại
                   </h3>
                   <a href="tel:0338777017" className="text-4xl md:text-5xl lg:text-6xl font-medium text-[#2a2a2a] hover:text-amber-700 transition-colors inline-block">
                      033 877 7017
                   </a>
                </motion.div>
                
                <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ delay: 0.4, type: "spring" }}>
                   <h3 className="text-sm font-bold text-stone-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                     <span className="w-8 h-[1px] bg-stone-300 inline-block"></span> Email
                   </h3>
                   <a href="mailto:thaibao95arc@gmail.com" className="text-3xl md:text-4xl lg:text-5xl font-medium text-[#2a2a2a] hover:text-amber-700 transition-colors inline-block break-all">
                      thaibao95arc@gmail.com
                   </a>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ delay: 0.5, type: "spring" }}>
                   <h3 className="text-sm font-bold text-stone-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                     <span className="w-8 h-[1px] bg-stone-300 inline-block"></span> Instagram
                   </h3>
                   <a href="https://instagram.com/hien.archi" target="_blank" rel="noopener noreferrer" className="text-3xl md:text-4xl lg:text-5xl font-medium text-[#2a2a2a] hover:text-amber-700 transition-colors inline-flex items-center gap-4 group">
                      hien.archi
                      <span className="inline-block transform group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform text-amber-700">↗</span>
                   </a>
                </motion.div>
             </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
      {/* FULLSCREEN IMAGE VIEWER */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out pointer-events-auto"
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
    </>
  );
}
