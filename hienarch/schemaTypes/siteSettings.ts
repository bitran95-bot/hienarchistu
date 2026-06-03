export const siteSettings = {
  name: 'siteSettings',
  title: 'Cài Đặt Trang Web',
  type: 'document',
  groups: [
    { name: 'home', title: 'Màn hình chính' },
    { name: 'about', title: 'Câu chuyện' },
    { name: 'contact', title: 'Liên hệ' },
  ],
  fields: [
    {
      name: 'heroDescription',
      title: 'Đoạn giới thiệu ngắn (Hiển thị ngoài màn hình chính)',
      type: 'text',
      group: 'home',
      description: 'Ví dụ: Hiên archi là một xưởng thiết kế kiến trúc nhỏ...',
    },
    {
      name: 'aboutTitle',
      title: 'Đoạn mở đầu phần Câu chuyện (Chữ to, in nghiêng)',
      type: 'text',
      group: 'about',
      description: 'Ví dụ: Tôi là Trần Thái Bảo, một kiến trúc sư yêu bản sắc địa phương...',
    },
    {
      name: 'aboutText',
      title: 'Đoạn tiếp theo phần Câu chuyện (Chữ nhỏ hơn)',
      type: 'text',
      group: 'about',
      description: 'Đoạn văn kể chi tiết về bản thân, phong cách thiết kế...',
    },
    {
      name: 'phone',
      title: 'Số điện thoại',
      type: 'string',
      group: 'contact',
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      group: 'contact',
    },
    {
      name: 'instagram',
      title: 'Instagram Link',
      type: 'url',
      group: 'contact',
      description: 'Ví dụ: https://instagram.com/hien.archi',
    }
  ],
};
