import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'product',
  title: 'Sản Phẩm',
  type: 'document',
  groups: [
    { name: 'info', title: 'Thông tin', default: true },
    { name: 'media', title: 'Hình ảnh' },
    { name: 'pricing', title: 'Giá & Bán hàng' },
    { name: 'technical', title: 'Kỹ thuật' },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Tên sản phẩm',
      type: 'string',
      group: 'info',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      group: 'info',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Mô tả sản phẩm',
      type: 'text',
      group: 'info',
      rows: 4,
    }),
    defineField({
      name: 'category',
      title: 'Danh mục',
      type: 'string',
      group: 'info',
      options: {
        list: [
          { title: 'Revit Family', value: 'revit-family' },
          { title: 'Revit Template', value: 'revit-template' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Ảnh đại diện',
      type: 'image',
      group: 'media',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'gallery',
      title: 'Thư viện ảnh (xem trước)',
      type: 'array',
      group: 'media',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'price',
      title: 'Giá (VNĐ)',
      type: 'number',
      group: 'pricing',
      validation: (Rule) => Rule.required().min(0),
      description: 'Nhập 0 nếu miễn phí',
    }),
    defineField({
      name: 'salePrice',
      title: 'Giá khuyến mãi (VNĐ)',
      type: 'number',
      group: 'pricing',
      description: 'Để trống nếu không giảm giá',
    }),
    defineField({
      name: 'featured',
      title: 'Sản phẩm nổi bật',
      type: 'boolean',
      group: 'pricing',
      initialValue: false,
    }),
    defineField({
      name: 'fileFormat',
      title: 'Định dạng file',
      type: 'string',
      group: 'technical',
      description: 'Ví dụ: .rfa, .rte, .rvt',
    }),
    defineField({
      name: 'compatibility',
      title: 'Tương thích',
      type: 'string',
      group: 'technical',
      description: 'Ví dụ: Revit 2021 trở lên',
    }),
    defineField({
      name: 'downloadUrl',
      title: 'Link tải / Link mua',
      type: 'url',
      group: 'pricing',
      description: 'Link Google Drive, Gumroad, hoặc trang thanh toán',
    }),
    defineField({
      name: 'order',
      title: 'Thứ tự hiển thị',
      type: 'number',
      group: 'info',
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category',
      media: 'image',
    },
    prepare(selection) {
      const categoryLabels: Record<string, string> = {
        'revit-family': '📦 Revit Family',
        'revit-template': '📐 Revit Template',
      };
      return {
        ...selection,
        subtitle: categoryLabels[selection.subtitle] || selection.subtitle,
      };
    },
  },
  orderings: [
    {
      title: 'Thứ tự hiển thị',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
})
