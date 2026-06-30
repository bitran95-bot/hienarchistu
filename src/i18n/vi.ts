// ===== Translation type =====
export interface Translations {
  nav: { story: string; projects: string; library: string; contact: string };
  loading: { text: string };
  contact: { close: string; phone: string; quote: string };
  contactForm: {
    title: string; name: string; namePlaceholder: string;
    email: string; emailPlaceholder: string;
    message: string; messagePlaceholder: string;
    send: string; sending: string; success: string; error: string;
  };
  scene: { loadingData: string };
  about: { title: string; text: string };
  magazine: { aboutProject: string; details: string; videoTitle: string; galleryAlt: string; galleryHint: string; theEnd: string; subtitle: string; infoFallback: string };
  shop: {
    pageTitle: string; pageDesc: string; heroTitle: string; heroHighlight: string;
    heroSubtitle: string; backHome: string; activeLabel: string;
    filterAll: string; filterFamily: string; filterTemplate: string;
    productCount: (n: number) => string;
    free: string; buy: string; download: string; downloadFree: string; buyNow: string;
    comingSoon: string; featured: string; emptyTitle: string; emptyText: string;
    previewImages: string; fileFormat: string; compatibility: string;
    backHomeFooter: string; footerCopy: (year: number) => string;
  };
  seo: { siteTitle: string; siteDesc: string };
  projectsPage: { title: string; subtitle: string; searchPlaceholder: string; noProjects: string; noMatch: string; clearSearch: string };
}

// Vietnamese translations (default)
const vi: Translations = {
  // Navigation
  nav: {
    story: 'Câu chuyện',
    projects: 'Dự Án',
    library: 'Thư viện',
    contact: 'Liên Hệ',
  },
  // Loading screen
  loading: {
    text: 'Đang tải không gian...',
  },
  // Contact page
  contact: {
    close: 'Đóng',
    phone: 'Điện thoại',
    quote: '"Mỗi dự án là một câu chuyện. Hãy cùng nhau viết nên câu chuyện kiến trúc của bạn."',
  },
  contactForm: {
    title: 'Gửi tin nhắn',
    name: 'Họ và tên',
    namePlaceholder: 'Nguyễn Văn A',
    email: 'Email',
    emailPlaceholder: 'email@example.com',
    message: 'Tin nhắn',
    messagePlaceholder: 'Mô tả yêu cầu hoặc câu hỏi của bạn...',
    send: 'Gửi tin nhắn',
    sending: 'Đang gửi...',
    success: 'Tin nhắn đã được gửi thành công! Chúng tôi sẽ phản hồi sớm nhất.',
    error: 'Có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ qua điện thoại.',
  },
  // 3D Scene
  scene: {
    loadingData: 'Đang tải dữ liệu...',
  },
  // About section (fallback when no CMS data)
  about: {
    title: 'Tôi là Trần Thái Bảo, một kiến trúc sư yêu bản sắc địa phương. Tôi chọn thiết kế những ngôi nhà dung dị, thích ứng với tự nhiên và tình yêu cuộc sống của gia chủ.',
    text: 'Trong quá trình làm nghề, tôi đi tìm vẻ đẹp trong sự mộc mạc của gỗ, của bê tông, đá cuội và những hang hiên đón nắng che mưa. Hợp tác cùng những người thợ lành nghề tại địa phương, chúng tôi dựng nên những nếp nhà yên lành, nơi con người tìm đến sự kết nối với tự nhiên, với bản thân và gia đình',
  },
  // Magazine viewer
  magazine: {
    aboutProject: 'Về dự án',
    details: 'Chi tiết',
    videoTitle: 'Video Thực Tế',
    galleryAlt: 'Thư viện ảnh',
    galleryHint: 'Lật sang trang kế tiếp →',
    theEnd: 'The End.',
    subtitle: 'Ấn phẩm kiến trúc Hiên studio',
    infoFallback: 'Thông tin chung dự án đang được cập nhật...',
  },
  // Shop page
  shop: {
    pageTitle: 'Thư viện Revit — Hiên Archi Studio',
    pageDesc: 'Mua và tải Revit Family, Revit Template chất lượng cao từ Hiên Archi Studio.',
    heroTitle: 'Thư viện',
    heroHighlight: 'Revit',
    heroSubtitle: 'Revit Family & Template chất lượng cao, thiết kế tỉ mỉ bởi kiến trúc sư Hiên studio',
    backHome: '← Trang chủ',
    activeLabel: 'Thư viện Revit',
    filterAll: 'Tất cả',
    filterFamily: 'Revit Family',
    filterTemplate: 'Revit Template',
    productCount: (n: number) => `${n} sản phẩm`,
    free: 'Miễn phí',
    buy: 'Mua ngay',
    download: 'Tải về',
    downloadFree: '📥 Tải về miễn phí',
    buyNow: '🛒 Mua ngay',
    comingSoon: 'Sắp mở bán',
    featured: '★ Nổi bật',
    emptyTitle: 'Chưa có sản phẩm',
    emptyText: 'Sản phẩm đang được cập nhật, vui lòng quay lại sau!',
    previewImages: 'Hình ảnh xem trước',
    fileFormat: 'Định dạng',
    compatibility: 'Tương thích',
    backHomeFooter: '← Về trang chủ',
    footerCopy: (year: number) => `© ${year} Hiên Archi Studio. Thiết kế với ❤️`,
  },
  // SEO
  seo: {
    siteTitle: 'Hiên Archi Studio',
    siteDesc: 'Studio thiết kế kiến trúc và nội thất, nơi kiến tạo không gian sống mộc mạc và chân thành.',
  },
  projectsPage: {
    title: 'Các Dự Án Của Chúng Tôi',
    subtitle: 'Nơi lưu giữ những nếp nhà yên lành, những không gian mộc mạc và chân thành.',
    searchPlaceholder: 'Tìm dự án...',
    noProjects: 'Chưa có dự án nào.',
    noMatch: 'Không tìm thấy dự án phù hợp.',
    clearSearch: 'Xóa tìm kiếm',
  },
};

export default vi;
