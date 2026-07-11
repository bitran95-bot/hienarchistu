// ===== Translation type =====
export interface Translations {
  nav: { story: string; services: string; projects: string; library: string; contact: string };
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
  projectDetail: { generalInfo: string; story: string; video: string; noImage: string; viewDetail: string; zoomIn: string; gallery: string; detailHeader: string };
  servicesPage: {
    title: string;
    subtitle: string;
    step: string;
    duration: string;
    deliverable: string;
    ctaTitle: string;
    ctaDesc: string;
    ctaButton: string;
    exploreProjects: string;
    steps: Array<{
      id: string;
      title: string;
      duration: string;
      details: Array<{ label: string; text: string }>;
      deliverable: string;
    }>;
  };
}

// Vietnamese translations (default)
const vi: Translations = {
  // Navigation
  nav: {
    story: 'Câu chuyện',
    services: 'Dịch Vụ',
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
  projectDetail: {
    generalInfo: 'Thông tin chung',
    story: 'Câu chuyện dự án',
    video: 'Video Dự Án',
    noImage: 'Không có hình ảnh',
    viewDetail: 'Xem chi tiết',
    zoomIn: 'Phóng to',
    gallery: 'Thư viện ảnh',
    detailHeader: 'Chi tiết dự án',
  },
  servicesPage: {
    title: 'QUY TRÌNH THIẾT KẾ KIẾN TRÚC & NỘI THẤT',
    subtitle: 'Lộ trình chuyên nghiệp từng bước hiện thực hóa không gian sống của bạn.',
    step: 'Giai đoạn',
    duration: 'Thời gian',
    deliverable: 'Sản phẩm bàn giao',
    ctaTitle: 'Bạn đã sẵn sàng hiện thực hóa ngôi nhà trong mơ?',
    ctaDesc: 'Hãy cùng chúng tôi bắt đầu câu chuyện kiến trúc cho riêng bạn.',
    ctaButton: 'Liên hệ tư vấn ngay',
    exploreProjects: 'Khám phá dự án thực tế',
    steps: [
      {
        id: '01',
        title: 'Tiếp Nhận & Khảo Sát hiện trạng',
        duration: '1 - 3 ngày',
        details: [
          { label: 'Trao đổi', text: 'Gặp gỡ trực tiếp hoặc online để lắng nghe nhu cầu, sở thích, phân tích ngân sách đầu tư.' },
          { label: 'Khảo sát', text: 'Đo đạc hiện trạng, kiểm tra cao độ, hướng nắng, hướng gió và chụp ảnh tư liệu khu đất/công trình.' }
        ],
        deliverable: 'Biên bản thu thập yêu cầu (Brief) và hồ sơ hiện trạng.'
      },
      {
        id: '02',
        title: 'Ý Tưởng Sơ Bộ (Concept Design)',
        duration: '5 - 7 ngày',
        details: [
          { label: 'Mặt bằng', text: 'Thiết kế phương án phân chia không gian, giao thông và bố trí vật dụng (Layout 2D).' },
          { label: 'Định hướng', text: 'Gợi ý phong cách thiết kế, chất liệu và tông màu chủ đạo thông qua ảnh minh họa (Moodboard).' }
        ],
        deliverable: 'Bản vẽ mặt bằng định vị công năng + Moodboard phong cách.'
      },
      {
        id: '03',
        title: 'Ký Kết Hợp Đồng Thiết Kế',
        duration: '3 - 5 ngày',
        details: [
          { label: 'Thống nhất', text: 'Đôi bên chốt phương án mặt bằng sơ bộ và ký hợp đồng thiết kế chính thức.' },
          { label: 'Tạm ứng', text: 'Khách hàng thanh toán chi phí thiết kế đợt 1 theo điều khoản hợp đồng.' }
        ],
        deliverable: 'Hợp đồng thiết kế kiến trúc/nội thất chính thức.'
      },
      {
        id: '04',
        title: 'Phối Cảnh 3D Chi Tiết',
        duration: '10 - 15 ngày',
        details: [
          { label: 'Trực quan hóa', text: 'Dựng phối cảnh 3D giả lập không gian thực tế với đầy đủ ánh sáng, màu sắc và vật liệu chính xác.' },
          { label: 'Hiệu chỉnh', text: 'Trao đổi và điều chỉnh chi tiết dựa trên phản hồi của khách hàng (giới hạn số lần sửa đổi theo hợp đồng).' }
        ],
        deliverable: 'Bộ ảnh render 3D chất lượng cao mọi góc nhìn của công trình.'
      },
      {
        id: '05',
        title: 'Triển Khai Hồ Sơ Kỹ Thuật (Bản Vẽ Kỹ Thuật)',
        duration: '10 - 12 ngày',
        details: [
          { label: 'Chi tiết hóa', text: 'Khai triển bản vẽ thi công chi tiết (Kiến trúc, Kết cấu, Điện nước ME, Chi tiết nội thất, Trần - Tường - Sàn).' }
        ],
        deliverable: 'Bộ hồ sơ kỹ thuật thi công (bản cứng và bản mềm PDF) để thợ có thể đọc và xây dựng chính xác.'
      },
      {
        id: '06',
        title: 'Bàn Giao & Giám Sát Tác Giả',
        duration: 'Dọc theo tiến độ thi công',
        details: [
          { label: 'Bàn giao', text: 'Quyết toán hợp đồng thiết kế, bàn giao đầy đủ file và bản vẽ có dấu mộc.' },
          { label: 'Giám sát', text: 'Kiến trúc sư tham gia các buổi kiểm tra cốt lõi tại công trường (đổ bê tông, nghiệm thu thô, chọn mẫu vật liệu thực tế) để đảm bảo thi công đúng ý tưởng thiết kế.' }
        ],
        deliverable: 'Bộ hồ sơ bàn giao hoàn chỉnh & sự đồng hành kiểm tra tại công trường.'
      }
    ]
  },
};

export default vi;
