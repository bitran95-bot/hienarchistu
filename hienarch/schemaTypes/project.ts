import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'project',
  title: 'Dự án (Project)',
  type: 'document',
  groups: [
    {
      name: 'content',
      title: 'Thông tin Nội dung',
    },
    {
      name: 'media',
      title: 'Hình ảnh & Mô hình',
    },
    {
      name: 'settings',
      title: 'Cài đặt',
    },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Tên dự án',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'generalInfo',
      title: 'Mô tả ngắn (Hiển thị ngay dưới Tên dự án)',
      type: 'text',
      group: 'content',
      description: 'Giới thiệu ngắn gọn hoặc các thông tin chung (Địa điểm, diện tích, quy mô...)',
    }),
    defineField({
      name: 'content',
      title: 'Đoạn nội dung chi tiết',
      type: 'text',
      group: 'content',
      description: 'Sẽ hiển thị dưới phần "Nội dung chi tiết" với viền nhấn mạnh.',
    }),
    defineField({
      name: 'image',
      title: 'Hình ảnh đại diện',
      type: 'image',
      group: 'media',
      description: 'Hình ảnh này sẽ hiển thị trong khung ảnh trên kệ 3D (nếu không tải lên mô hình 3D) và hiển thị bên trái màn hình khi bấm vào xem chi tiết.',
      options: { hotspot: true },
    }),
    defineField({
      name: 'gallery',
      title: 'Thư viện hình ảnh (Các góc nhìn khác)',
      type: 'array',
      group: 'media',
      description: 'Kéo thả nhiều ảnh cùng lúc để upload.',
      options: { layout: 'grid' },
      of: [{ type: 'image', options: { hotspot: true } }]
    }),
    defineField({
      name: 'magazinePages',
      title: 'Các trang tạp chí (Tự giàn trang)',
      type: 'array',
      group: 'media',
      description: 'Nếu thêm dữ liệu ở đây, hệ thống sẽ BỎ QUA Thư viện hình ảnh ở trên và dùng các trang này để tạo tạp chí theo đúng ý đồ của bạn.',
      of: [
        {
          type: 'object',
          name: 'page',
          title: 'Trang tạp chí',
          fields: [
            {
              name: 'layout',
              title: 'Kiểu bố cục (Layout)',
              type: 'string',
              options: {
                list: [
                  { title: '1 Ảnh (Toàn trang)', value: 'full' },
                  { title: '1 Ảnh (Giữa trang)', value: 'col' },
                  { title: '2 Ảnh (Chia dọc)', value: 'row' },
                  { title: '3 Ảnh (Hỗn hợp)', value: 'mixed' }
                ],
                layout: 'radio'
              },
              initialValue: 'col',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'images',
              title: 'Hình ảnh (Vui lòng upload số ảnh tương ứng với layout)',
              type: 'array',
              of: [{ type: 'image', options: { hotspot: true } }]
            }
          ],
          preview: {
            select: {
              layout: 'layout',
              media: 'images.0'
            },
            prepare(selection: any) {
              const { layout, media } = selection;
              const titles: Record<string, string> = {
                full: '1 Ảnh (Toàn trang)',
                col: '1 Ảnh (Giữa trang)',
                row: '2 Ảnh (Chia dọc)',
                mixed: '3 Ảnh (Hỗn hợp)'
              };
              return {
                title: `Trang: ${titles[layout] || 'Chưa chọn'}`,
                media: media
              }
            }
          }
        }
      ]
    }),
    defineField({
      name: 'modelFile',
      title: 'File mô hình 3D (.gltf / .glb)',
      type: 'file',
      group: 'media',
      description: 'Nếu có tải lên file này, dự án sẽ hiển thị dưới dạng mô hình 3D trên kệ sách.',
      options: {
        accept: '.gltf,.glb'
      }
    }),
    defineField({
      name: 'youtubeLink',
      title: 'Link YouTube',
      type: 'url',
      group: 'media',
      description: 'Đường dẫn video YouTube của dự án (nếu có)',
    }),
    defineField({
      name: 'pdfFile',
      title: 'File PDF (Layout / Trình bày)',
      type: 'file',
      group: 'media',
      description: 'Upload file PDF trình bày dự án để khách xem nhanh. Nếu có file này, hệ thống sẽ ưu tiên hiển thị PDF.',
      options: {
        accept: '.pdf'
      }
    }),
    defineField({
      name: 'modelScale',
      title: 'Tuỳ chỉnh tỷ lệ 3D (Scale)',
      type: 'number',
      group: 'media',
      description: 'Dùng để thu nhỏ/phóng to mô hình 3D trên kệ nếu hệ thống tự động tính toán bị sai lệch (ví dụ nhập 1.5 để to gấp rưỡi, 0.5 để nhỏ đi một nửa). Mặc định là 1.',
      initialValue: 1,
    }),
    defineField({
      name: 'order',
      title: 'Thứ tự hiển thị',
      type: 'number',
      group: 'settings',
      description: 'Số nhỏ sẽ xếp trước (trái sang phải, trên xuống dưới kệ).'
    }),
  ],
})
