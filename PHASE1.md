# Giai đoạn 1 — Kết quả triển khai

Ngày cập nhật: 23/09/2026. Nhánh: `codex/phase-1-foundation`.

Phần mã nguồn và kiểm thử local đã hoàn thành. Vercel Preview đã xác nhận đọc được dữ liệu Sanity thật; email và Stripe chưa thể nghiệm thu vì project chưa có biến môi trường tương ứng. Chưa deploy production.

## Thay đổi chính

- Sửa lỗi lint của Shop bằng cách tách thao tác retry khỏi effect tải dữ liệu; bỏ qua phản hồi của effect đã cleanup.
- Thêm `tsconfig.api.json` strict, `typecheck`, `typecheck:api`; build kiểm tra cả frontend và API.
- Đồng bộ API Stripe với SDK đang cài: `2026-05-27.dahlia`. JWT secret có hàm kiểm tra trả về kiểu string; bỏ helper token trùng, không được sử dụng ở webhook.
- Store Sanity có trạng thái đang tải, chống gọi trùng, timeout 12 giây, hủy request và khả năng thử lại. Phản hồi cũ sau timeout không ghi đè dữ liệu mới.
- Trang chủ desktop/mobile và Projects có thông báo lỗi kèm nút thử lại.
- Loader React thuần; tiến độ Drei chuyển vào module desktop. 3D quá thời gian chờ 20 giây hoặc render/model lỗi có đường dẫn sang portfolio 2D.
- Contact API kiểm tra kiểu và độ dài dữ liệu; yêu cầu cấu hình Resend/sender/recipient rõ ràng. Thiếu cấu hình, Redis lỗi hoặc Resend chưa xác nhận đều không báo gửi thành công. Không log nội dung tin nhắn.
- Form xác minh cả HTTP status và JSON response, giữ nội dung khi lỗi, hiển thị thông báo rate limit; chỉ xóa form sau xác nhận thành công.
- Bổ sung env mẫu, hướng dẫn frontend/API/Studio/Vercel, Node 24, bỏ qua file env và báo cáo test trong Git.
- Thêm workflow CI, unit/API tests và E2E có fixtures. E2E chặn dịch vụ ngoài, không ghi CMS hoặc gửi email thật; CI dùng artifact production.

## Kiểm tra đã thực hiện

| Kiểm tra | Kết quả |
|---|---|
| ESLint | Đạt |
| Frontend + API TypeScript | Đạt |
| Unit/API tests | 46/46 đạt, 5 file |
| Production build | Đạt, bao gồm PWA |
| Playwright trên Vite dev | 13 đạt, 1 bỏ qua vì chỉ dành cho 3D desktop |
| Playwright trên production artifact | 13 đạt, 1 bỏ qua vì chỉ dành cho 3D desktop |
| `git diff --check` | Không có lỗi whitespace |

E2E bao phủ trang chủ đúng loại thiết bị, tìm kiếm/mở dự án, CMS lỗi rồi retry trên trang chủ/Projects, model lỗi có đường chuyển sang 2D, Shop lỗi rồi retry, và form thất bại rồi gửi thành công. API tests dùng mock Resend/Redis; không xác minh giao nhận email thật.

Các lệnh:

```powershell
npm.cmd run check
npm.cmd run test:e2e -- --reporter=line
$env:PLAYWRIGHT_PREVIEW='1'
npm.cmd run test:e2e -- --reporter=line
```

Đã cài Chromium cho Playwright trên máy local. CI Linux của [PR #1](https://github.com/bitran95-bot/hienarchistu/pull/1) đã chạy thành công, bao gồm `npm ci`, `npm run check` và Playwright trên production artifact. Vercel báo bản Preview ở trạng thái Ready.

## Quan sát bản build bằng trình duyệt

Đã mở artifact local tại `http://127.0.0.1:4174`. Request tới Sanity CDN thất bại; giao diện hiển thị đúng thông báo lỗi và nút retry, không còn loader vô hạn. Log hiện có chưa phân biệt nguyên nhân mạng với CORS origin. Chưa thay đổi cấu hình Sanity bên ngoài. Cần đối chiếu origin local/Preview được cho phép trong Sanity; README đã hướng dẫn.

Kiểm tra hành vi thành công của artifact được thực hiện qua Playwright với dữ liệu CMS giả lập. Không coi kết quả này là xác nhận kết nối Sanity thật trên Preview.

## Kiểm tra Vercel Preview ngày 23/09/2026

- [Preview của PR #1](https://hienarchistu-git-codex-phase-55492b-bi-trans-projects-2bf6a203.vercel.app) mở được trong phiên Vercel của chủ project. Trang Projects hiển thị 9 dự án thật và Library hiển thị 1 sản phẩm; đây là bằng chứng luồng đọc Sanity hoạt động trên Preview. Chưa kiểm tra thao tác ghi CMS.
- Vercel Project Settings cho thấy **không có Project Environment Variables** và **không có Shared Variables** liên kết. Danh sách Integrations chỉ hiển thị Sanity. Frontend đang đọc Sanity nhờ `projectId` và dataset mặc định trong mã nguồn.
- Do thiếu `RESEND_API_KEY`, `CONTACT_FROM` và `CONTACT_TO_EMAIL`, API contact sẽ trả `503 contact_unavailable` theo điều kiện trong mã; chưa gửi email thử. Các API Stripe cũng chưa có `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` và chưa được thử ở test mode.
- Preview đã deploy từ commit của PR; production vẫn ở commit `c593297` trên `master` tại thời điểm kiểm tra.

## Các bước nghiệm thu còn cần môi trường dịch vụ

1. Cấu hình `RESEND_API_KEY`, `CONTACT_FROM`, `CONTACT_TO_EMAIL` cho Preview; cấu hình cặp Upstash nếu cần rate limit. Chọn địa chỉ nhận test, gửi thử khi được phép và kiểm tra email nhận thật.
2. Cấu hình Stripe test mode, `DOWNLOAD_JWT_SECRET` và webhook secret cho Preview; kiểm thử webhook/version trước khi áp dụng API version mới lên production. Chưa thực hiện giao dịch trong đợt này.
3. Xem xét khai báo `VITE_SANITY_PROJECT_ID` và `VITE_SANITY_DATASET` cho từng môi trường để project/dataset được ghi rõ trong Vercel, dù fallback hiện tại đã đọc đúng dữ liệu.

Không cần chia sẻ secret qua chat; cấu hình trực tiếp trong dashboard/môi trường phù hợp.

Các mục thương mại trong báo cáo ban đầu — server xác định giá, file tải private, quyền tải bền vững/atomic, raw webhook/idempotency — vẫn thuộc giai đoạn thương mại hóa. Cửa hàng trả phí chưa được nghiệm thu để mở bán chỉ dựa vào đợt sửa này.

Hướng dẫn vận hành cập nhật ở `README.md`; `WEBSITE_REVIEW.md` giữ nguyên làm baseline trước thay đổi.
