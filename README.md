# Hiên Archi Studio

Website portfolio kiến trúc: React + TypeScript + Vite, không gian 3D trên desktop, bố cục 2D trên mobile, nội dung từ Sanity. Backend là Vercel Functions trong `api/`.

Website hiện tại: https://hienarchistu.vercel.app/

## Chạy frontend local

Yêu cầu Node.js 24 (đã kiểm tra với 24.14.0), npm và Git. Phiên bản Node được ghi trong `.nvmrc`.

```powershell
npm.cmd ci
Copy-Item .env.example .env.local
npm.cmd run dev
```

Trên macOS/Linux dùng `npm` và `cp .env.example .env.local`. Nếu đã có `.env.local`, giữ nguyên và bổ sung các biến còn thiếu thay vì chép đè.

Vite mặc định chạy tại http://localhost:5173. Frontend chỉ cần biến Sanity public; `.env.example` trỏ vào dataset hiện dùng của studio. Đổi project/dataset nếu cần môi trường riêng. Vite không tự chạy các route `/api/*`. Khi chạy local, trình duyệt đọc Sanity trực tiếp và origin local cần được cho phép trong Sanity. Trên Vercel, trang gọi `/api/public-content` cùng domain; Function đọc dataset public để Preview không cần thêm từng domain vào Sanity CORS.

Nếu local báo không tải được dữ liệu, kiểm tra mạng và CORS origins trong Sanity project: origin phải khớp cả hostname lẫn cổng (ví dụ `http://localhost:5173` khác `http://127.0.0.1:4174`). Chỉ thêm origin dev/preview thực sự sử dụng; không cần bật allow credentials cho client public này. Không thêm Sanity API token vào frontend để xử lý CORS.

## Kiểm tra chất lượng

```powershell
npm.cmd run check
# lint → unit/API tests → frontend + API typecheck → production build → bundle + SEO checks

npx.cmd playwright install chromium
npm.cmd run test:e2e
```

Playwright tự khởi động Vite trên http://127.0.0.1:4173, không dùng lại server đang chạy. Bộ test dùng Chromium desktop và Pixel 5, cố định ngôn ngữ EN, mock CMS/email cùng tài nguyên 3D bên ngoài. Không gửi email hay thanh toán thật. Test hỏng model chỉ áp dụng desktop; mobile vốn không render canvas.

Để chạy cùng bộ test trên artifact production: build trước, sau đó đặt `PLAYWRIGHT_PREVIEW=1` khi gọi test. Trong PowerShell: `$env:PLAYWRIGHT_PREVIEW='1'` rồi `npm.cmd run test:e2e`. CI đã dùng chế độ này. Xóa biến đó để trở lại Vite dev.

`npm run typecheck:api` dùng `tsconfig.api.json` strict và đã được đưa vào `npm run build`. Build xanh vì vậy bao phủ cả kiểu API. Unit tests cho API nằm trong `tests/api/`, dùng Node và mock dịch vụ ngoài. File React/helper/store tests nằm trong `src/`.

Workflow `.github/workflows/ci.yml` chạy các kiểm tra này khi mở PR hoặc push `master`. Bước bundle check kiểm tra entry trang chủ và bảo đảm 3D/PDF không bị preload hoặc tải trước qua PWA. Không yêu cầu secret cho CI.

## Domain và metadata tìm kiếm

`site.config.json` khai báo domain production. Build tạo HTML metadata riêng cho `/`, `/projects`, `/services`, `/shop`; trang `/download` có `noindex`. Trên Vercel, `/projects/:slug` là liên kết chia sẻ mở đúng dự án trong hộp xem của danh sách `/projects`, không có giao diện trang dự án thứ ba. Function vẫn tạo metadata và HTML dự phòng cho URL này khi có request; `/sitemap.xml` cũng lấy danh sách dự án đã publish từ Sanity. Dự án mới và thay đổi nội dung xuất hiện sau khi Sanity trả dữ liệu mới, không cần deploy lại website. `robots.txt` dẫn đến sitemap động. Khi đổi domain chính thức, cập nhật `site.config.json`, build và kiểm tra lại Preview trước khi đưa lên production. Đường dẫn dự án lấy từ trường `slug` (nếu có), hoặc tự tạo từ tên; nên nhập slug duy nhất, ổn định trong Sanity trước khi chia sẻ URL. Nếu hai dự án có cùng slug, một URL không thể phân biệt được chúng.

## Chạy API local hoặc trên Vercel Preview

Dùng Vercel CLI đã cài và được đăng nhập, trong root repository:

```powershell
vercel dev
```

Chỉ chọn đúng project Vercel của website khi liên kết. Kiểm tra cổng CLI thông báo và đặt `BASE_URL` tương ứng nếu không có `VERCEL_URL`. Không đưa secret vào Git hoặc biến `VITE_*`. Vite expose các biến có prefix đó cho trình duyệt.

Vercel project cần dùng root package ở repository root, build `npm run build`, output `dist`, Node 24.x. Thư mục `hienarch/` là Sanity Studio riêng, không phải root frontend trên Vercel.

## Biến môi trường

| Nhóm | Biến | Ghi chú |
|---|---|---|
| Frontend CMS | `VITE_SANITY_PROJECT_ID`, `VITE_SANITY_DATASET` | Public; không phải secret |
| Email | `RESEND_API_KEY`, `CONTACT_FROM`, `CONTACT_TO_EMAIL` | Cả ba bắt buộc để form gửi được; sender phải hợp lệ với tài khoản/domain Resend |
| Rate limit | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Khai báo cùng nhau; 5 lần/10 phút/IP; thiếu cả hai thì không rate limit |
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Dùng test mode ở development/preview |
| Download | `DOWNLOAD_JWT_SECRET` | Chuỗi ngẫu nhiên riêng cho môi trường; bắt buộc cho API download |
| Server CMS | `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_API_TOKEN` | Token chỉ khi cần nội dung private; download hiện ưu tiên giá trị `VITE_SANITY_*` nếu cả hai có |
| Redirect | `BASE_URL` | Fallback khi Vercel không cung cấp `VERCEL_URL`; code hiện ưu tiên URL deployment |

Giữ scope Development, Preview và Production tách biệt. Muốn kiểm thử gửi email thật cần chọn trước hộp thư nhận test, cấu hình Resend và kiểm tra tại inbox cùng log dịch vụ; không chỉ dựa vào toast trên UI.

### Hành vi form liên hệ

- Validation kiểu dữ liệu, email, khoảng trắng và độ dài: tên 100, email 254, tin nhắn 5000 ký tự.
- Thiếu cấu hình email: HTTP 503 với `success: false`, ở mọi môi trường; không còn giả lập gửi thành công bằng log.
- Redis đã cấu hình nhưng lỗi/timeout: HTTP 503; giới hạn gửi: HTTP 429 kèm `Retry-After`.
- Resend bị lỗi hoặc không trả email ID hợp lệ: không trả thành công. Chỉ HTTP 200 + `success: true` sau xác nhận tiếp nhận của Resend mới làm UI xóa nội dung form.
- Form giữ lại nội dung khi gửi thất bại và cho phép thử lại. Không ghi nội dung liên hệ/secret vào log lỗi.
- Resend tiếp nhận không đồng nghĩa email chắc chắn vào inbox; nghiệm thu thật cần kiểm tra giao nhận.

### Hành vi tải dữ liệu và 3D

Sanity có giới hạn chờ 12 giây; request trùng đang chạy được gộp bằng trạng thái loading. Khi lỗi, trang chủ và trang dự án hiện nút thử lại. Kết quả trễ của request timeout không ghi đè kết quả mới.

Loader dùng React thuần; tiến độ Three.js chỉ nằm trong component desktop. Tải 3D quá 20 giây hoặc model/WebGL lỗi sẽ có đường dẫn sang danh sách dự án 2D. Giai đoạn 2 đã tách 3D/PDF khỏi entry và PWA precache; texture 3D vẫn cần tối ưu và đo trên thiết bị thật.

## Stripe và phạm vi giai đoạn 1

API đã được đồng bộ sang `2026-05-27.dahlia`, khớp kiểu của Stripe SDK đang khóa trong lockfile. Đây là thay đổi API version từ `2025-04-30.basil`. Vercel project hiện chưa có khóa Stripe; cần kiểm thử checkout/download/webhook trong Stripe test mode và đối chiếu version webhook endpoint trước khi cấu hình thanh toán production hoặc mở bán. Không có giao dịch thật được chạy trong bộ test hiện tại.

Giai đoạn 1 chưa làm lại thương mại điện tử. Các vấn đề đã ghi trong `WEBSITE_REVIEW.md` về giá do client gửi, dữ liệu URL tải, token dùng một lần và raw webhook vẫn cần xử lý trước khi bán sản phẩm trả phí. Typecheck đạt không phải xác nhận luồng thanh toán sẵn sàng production.

Tham khảo: [Stripe API versioning](https://docs.stripe.com/api/versioning), [Resend Send Email](https://resend.com/docs/api-reference/emails/send-email).

## Sanity Studio

`hienarch/` có package riêng. Chạy `npm install` và `npm run dev` trong thư mục đó khi cần làm nội dung/schema. Root `npm ci` và CI frontend không cài/build Studio. Dùng đúng project/dataset và tài khoản có quyền trong Sanity; test frontend không sửa dữ liệu CMS.

## Nghiệm thu cho các bản cập nhật tiếp theo

1. Chạy `npm run check` và `npm run test:e2e`.
2. Xem Preview trên desktop/mobile: tải dự án, thử lại khi offline, fallback 3D, form báo lỗi có giữ dữ liệu.
3. Đối chiếu biến môi trường đúng scope; cấu hình sender Resend và Upstash trước khi kỳ vọng form gửi email thật.
4. Khi được phép gửi test, gửi tới hộp thư test đã chọn và xác minh cả trạng thái gửi lẫn email nhận.
5. Kiểm thử Stripe test mode cho API version đã đổi; các lỗ hổng thương mại còn lại phải được xử lý trước khi mở bán.
6. Chỉ promote/deploy production sau khi bản Preview được nghiệm thu.
