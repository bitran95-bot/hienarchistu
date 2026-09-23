# Đánh giá website Hiên Archi Studio và lộ trình phát triển

Ngày đánh giá: 22/09/2026.

Repository: https://github.com/bitran95-bot/hienarchistu — nhánh `master`, commit `c593297c3fff3309582674986c80a07c5b2e3d98`.

Website quan sát: https://hienarchistu.vercel.app/.

## 1. Kết luận và định hướng

Nền tảng hiện tại đủ để phát triển tiếp. Nên giữ nhận diện Hiên, không gian 3D trên desktop, phong cách mobile tối giản và Sanity CMS. Ưu tiên độ tin cậy, hiệu năng và khả năng tạo liên hệ từ portfolio trước khi mở rộng cửa hàng.

Luồng kinh doanh đề xuất: trang chủ → dự án phù hợp → trang chi tiết có câu chuyện thiết kế → dịch vụ/quy trình → yêu cầu tư vấn. Thư viện Revit là nhánh phụ, chỉ mở bán sau khi hoàn thiện kiểm soát giá và quyền tải.

Chưa cần quyết định viết lại toàn bộ bằng framework khác. Trước tiên sửa các lỗi có bằng chứng, đo tốc độ và bổ sung URL dự án. Khi cần HTML/metadata riêng cho nhiều dự án, đánh giá prerender/SSG hoặc SSR trên một trang thử nghiệm trước khi chuyển kiến trúc rộng hơn.

## 2. Phạm vi và giới hạn

- Đã clone repository, cài dependencies bằng lockfile, đọc frontend, API, cấu hình Vercel và schema Sanity.
- Đã quan sát production: trang chủ desktop/mobile, danh sách dự án, thư viện, trang dịch vụ mobile và hộp liên hệ mobile. Desktop khoảng 1280px; mobile giả lập viewport 390 × 844, chưa phải kiểm thử thiết bị vật lý.
- Danh sách dự án hiển thị 9 dự án; thư viện hiển thị 1 sản phẩm miễn phí `Tree Collection 1` tại thời điểm kiểm tra.
- Chưa đối chiếu SHA đang deploy với GitHub HEAD; chưa truy cập dashboard Vercel, Stripe, Resend, Upstash hoặc quản trị Sanity.
- Chưa xác nhận biến môi trường production, email giao nhận, webhook thực tế, giao dịch thanh toán hoặc quyền truy cập file trả phí. Các rủi ro tương ứng dưới đây là kết luận từ code, có ghi điều kiện áp dụng.
- Không thực hiện giao dịch, gửi form/email hay thay đổi production trong đợt đánh giá này.
- Chưa đo Lighthouse/Core Web Vitals hoặc tỷ lệ chuyển đổi; không có cơ sở gán điểm hiệu năng hay dự đoán mức tăng doanh thu.

## 3. Kiến trúc hiện tại

| Thành phần | Hiện trạng |
|---|---|
| Frontend | React 19, TypeScript, Vite 8; React Router; Tailwind; Framer Motion |
| Trang chủ desktop | Three.js, React Three Fiber/Drei, postprocessing, kệ sách và model dự án |
| Mobile | `MobileHome.tsx`, bố cục 2D riêng tại chiều rộng dưới 768px |
| Nội dung | Sanity; client công khai trong `src/sanityClient.ts`; Studio riêng trong `hienarch/` |
| Trạng thái | Zustand: dự án, cài đặt, modal, trạng thái tải |
| Trang | `/`, `/projects`, `/services`, `/shop`, `/download`, trang không tồn tại |
| API Vercel | `api/contact.ts`, `create-checkout.ts`, `webhook.ts`, `download.ts` |
| Tích hợp | Stripe, JWT, Upstash Redis/rate limit, Resend qua HTTP |
| PWA | Vite PWA, cấu hình cache assets và Sanity |
| Kiểm thử | Vitest: 3 file; Playwright: 2 test chạy trên desktop/mobile |

Điểm tốt: đã có responsive images/srcset, lazy route, skeleton, ErrorBoundary, bản dịch VI/EN, trang 404 có noindex và CMS tách nội dung khỏi code. Một số phần cần hoàn thiện để đạt đúng mục tiêu của thiết kế hiện tại.

## 4. Kết quả kiểm tra kỹ thuật

Môi trường local: Windows, Node `v24.14.0`; dependencies lấy từ `package-lock.json`.

| Kiểm tra | Kết quả | Ý nghĩa |
|---|---|---|
| `npm.cmd ci --no-audit --no-fund` | Đạt, 773 packages | Cài được dự án theo lockfile; chưa chạy audit lỗ hổng dependency |
| `npm.cmd run build` | Đạt | Frontend TypeScript + Vite/PWA build thành công |
| `npm.cmd test` | Đạt 10/10, 3 file | Bao phủ helper ảnh/layout và một số trạng thái store |
| `npm.cmd run lint` | Không đạt: 1 lỗi | `src/pages/ShopPage.tsx:310`, `react-hooks/set-state-in-effect` |
| TypeScript riêng cho `api/*.ts` | Không đạt | Stripe API version không khớp kiểu SDK; JWT secret chưa được thu hẹp kiểu đầy đủ |
| `npm.cmd run test:e2e -- --reporter=line` | Không khởi chạy browser | Thiếu Chromium headless build 1223; cả 4 lượt bị chặn trước khi kiểm tra ứng dụng |

Build/test ban đầu bị giới hạn tạo process trong sandbox Windows; chạy lại với quyền phù hợp thì build và unit test đạt. Đây là giới hạn môi trường, không phải lỗi ứng dụng.

Lệnh kiểm tra API độc lập đã dùng:

```powershell
.\node_modules\.bin\tsc.cmd --ignoreConfig --noEmit --skipLibCheck --module esnext --moduleResolution bundler --target es2023 --types node api/contact.ts api/create-checkout.ts api/download.ts api/webhook.ts
```

Lệnh trên dùng mặc định của TypeScript 6, không phải cấu hình API được dự án định nghĩa. Repo chưa có tsconfig riêng cho API; `tsconfig.app.json` chỉ include `src`, `tsconfig.node.json` chỉ include `vite.config.ts`. Vì vậy build frontend xanh không chứng minh API đã qua typecheck/deploy. Chưa kết luận deployment Vercel hiện tại bị lỗi từ phép kiểm tra riêng này.

Lỗi API version: cả ba file Stripe đặt `2025-04-30.basil`, trong khi SDK đã cài yêu cầu literal `2026-05-27.dahlia`. Cần chọn phiên bản API/SDK tương thích rồi kiểm thử luồng Stripe, không ép kiểu để che lỗi.

## 5. Các phát hiện cần xử lý

### P1 — Hoàn thiện trước khi bán sản phẩm trả phí

**A. Giá thanh toán do trình duyệt quyết định.**

`api/create-checkout.ts:15–37` nhận `productId`, `productName`, `price`, `currency` từ request rồi dùng trực tiếp để tạo session. Không tra sản phẩm/giá ở nguồn tin cậy. `api/download.ts:126–142` chỉ kiểm tra session đã trả tiền và lấy productId trong metadata, không kiểm tra số tiền theo sản phẩm.

Tác động: khi bật bán hàng, người mua có thể sửa giá request xuống một giá hợp lệ thấp hơn nhưng giữ productId. Cần để client chỉ gửi ID; server tra giá, trạng thái bán và currency, xác thực đầu vào, lưu thông tin đơn hàng. Chưa thử giao dịch hoặc khai thác trên production.

**B. URL file trả phí có nguy cơ được trả về ngay trong catalog.**

`src/pages/ShopPage.tsx:286–295` query product bằng spread `...`; schema `hienarch/schemaTypes/product.ts` lưu `downloadUrl` trên cùng document. Nếu có sản phẩm trả phí với URL thực, query có thể đưa đường dẫn đó xuống browser. Client không có token nên catalog hiện được thiết kế để đọc công khai.

Cần tách metadata công khai khỏi thông tin giao file ở nơi chỉ server đọc được. Bỏ field khỏi query UI chưa đủ nếu document chứa URL vẫn đọc công khai. Với file cần kiểm soát quyền tải, dùng private storage và URL có thời hạn. Sanity phân biệt dataset public/private; cần xác minh cấu hình thực tế trước khi triển khai thay đổi. [Tài liệu Sanity](https://www.sanity.io/docs/content-lake/datasets).

**C. Cam kết “tải một lần, 30 phút” chưa được bảo đảm đầy đủ.**

`api/download.ts:74–90` dùng GET rồi SETEX riêng biệt, có cửa sổ race condition. Không có Redis thì dùng Set trong RAM, không chia sẻ giữa serverless instances và mất khi cold start. Session đã trả tiền có thể xin token mới nhiều lần (`:142`); sau redirect, URL file đích có thể tiếp tục được chia sẻ nếu nó công khai.

Cần định nghĩa chính sách tải theo đơn hàng: được tải lại bao nhiêu lần, trong thời gian nào; dùng thao tác atomic cho quyền tải và lưu trạng thái bền vững. Chỉ đánh dấu lượt tải theo chính sách khi nguồn file đã sẵn sàng. Không nên hứa giới hạn ở UI vượt quá cơ chế bảo vệ thực tế.

**D. Webhook có nhánh làm thay đổi raw body.**

`api/webhook.ts:49` dùng `JSON.stringify(req.body)` khi body đã được parse. Chuỗi này không bảo đảm giữ nguyên byte Stripe ký. Cần lấy raw body và kiểm thử chữ ký hợp lệ/không hợp lệ; bổ sung xử lý idempotent theo event/session. Hiện webhook chỉ ghi log, chưa lưu fulfillment. Chưa xác nhận webhook đang lỗi trên production. [Stripe yêu cầu body nguyên trạng](https://docs.stripe.com/webhooks/signature).

### P1 — Độ tin cậy và tiếp nhận khách hàng

**E. Form có thể báo gửi thành công nhưng không có email.**

`api/contact.ts:71–76` trả HTTP 200 và `success:true` nếu thiếu `RESEND_API_KEY`, không giới hạn nhánh này cho development. UI chỉ kiểm tra `resp.ok`. Nếu production thiếu cấu hình, khách tưởng đã gửi nhưng studio chỉ có log.

Cần fail rõ ở production, xác minh domain gửi, bổ sung validation kiểu/độ dài cho name/email/message, xử lý lỗi Redis và thông báo phù hợp. `.env.example` đang thiếu Resend/Upstash/contact sender-recipient nên setup mới dễ bỏ sót. Chưa xác minh tình trạng khóa trên Vercel.

**F. Sanity lỗi có thể khiến màn hình tải chờ vô hạn.**

`src/store/useStore.ts:65–68` chỉ đặt `error`, không chuyển sang trạng thái tải thất bại có thể hiển thị. `LoadingScreen` cần `started=true`; ProjectsPage/MobileHome tiếp tục dựa vào `isDataLoaded` để hiển thị skeleton. Cần trạng thái loading/success/error rõ ràng, nút thử lại, timeout và đường dẫn xem portfolio 2D khi 3D không khả dụng.

### P1/P2 — Hiệu năng và tìm kiếm

**G. Mobile vẫn tải sớm thư viện 3D.**

`src/App.tsx` import `LoadingScreen` trực tiếp; component này import `useProgress` từ Drei. Trong `vite.config.ts:75–80`, điều kiện chứa `three` đứng trước `@react-three`, khiến nhánh vendor-r3f không được chọn. Nhóm vendor React cũng gộp các thư viện tên chứa react, làm hạn chế lazy loading.

Bằng chứng build: `dist/index.html` có modulepreload cho vendor-three, vendor-postprocessing, vendor-react và vendor. Các chunk chính này cùng các chunk preload khác và entry xấp xỉ **2,29 MB chưa nén / 690 KB gzip JavaScript**. Đây là số liệu artifact local, không phải tổng lưu lượng thực tế đã đo trên thiết bị.

Một số chunk: vendor 960,51 KB; vendor-react 657,58 KB; vendor-three 280,08 KB; vendor-postprocessing 269,18 KB. PWA tạo danh sách precache 35 entries, 3432,29 KiB; việc này không tự chứng minh service worker đã đăng ký/hoạt động trên production.

Texture đang được Bookshelf dùng: displacement PNG khoảng 9,59 MB và plywood JPG khoảng 4,01 MB. EXR khoảng 7,69 MB nằm trong public nhưng không thấy được dùng bởi Bookshelf; không tính nó là tài nguyên tải chắc chắn.

Hướng sửa: loader 2D độc lập, ranh giới lazy import rõ ràng, điều chỉnh chunk theo module thực, tải PDF/3D khi cần, giảm texture theo chất lượng nhìn thấy. Xác minh lại bằng network ở mobile với cache lạnh và đo LCP/INP/CLS sau thay đổi.

**H. Domain SEO chưa trùng URL đang hoạt động được cung cấp.**

`src/App.tsx:42`, `index.html`, sitemap và robots dùng `https://hienarchi.studio`, trong khi URL user cung cấp là `https://hienarchistu.vercel.app`. Browser trả `ERR_NAME_NOT_RESOLVED` cho domain studio trong lần kiểm tra này. Đây là quan sát từ môi trường kiểm tra, chưa kiểm tra quyền sở hữu/DNS toàn cầu.

Cần chọn domain production chính thức, cấu hình dùng chung cho canonical/OG/sitemap và email. Homepage runtime OG dùng favicon SVG trong khi HTML có `og-image.png`; cần thống nhất ảnh chia sẻ có URL tuyệt đối.

**I. Dự án chưa có URL chi tiết độc lập.**

Router chưa có `/projects/:slug`; danh sách mở modal. Hash dự án chỉ được đọc ở homepage desktop, và slug hiện suy ra từ tên. Sitemap chỉ chứa `/` và `/shop`, thiếu `/projects`, `/services` và các trang dự án. Metadata phần lớn thay đổi sau khi JavaScript chạy.

Đề xuất thêm slug ổn định trong CMS, trang riêng cho từng dự án, canonical/OG theo dự án và sitemap sinh theo nội dung. Google có thể render JavaScript, nhưng HTML render sẵn giúp cả người dùng và crawler, và không phải bot nào cũng chạy JS. [Hướng dẫn Google về JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).

### P2 — Trải nghiệm, nội dung và khả năng bảo trì

- **Song ngữ chưa xuyên suốt:** production đang ở EN nhưng phần giới thiệu, mô tả quy trình, nhãn mobile và nội dung CMS còn tiếng Việt. Cần quyết định bilingual thực sự hoặc Vietnamese-first, tránh trạng thái giao diện trộn ngôn ngữ. ProjectsPage còn title/meta hard-code tiếng Việt.
- **Nút liên hệ mobile chưa rõ nghĩa:** icon bookmark ở góc mở Contact, không có accessible name. Nên dùng chữ “Liên hệ” hoặc icon phù hợp kèm aria-label; thêm CTA xem dự án/đặt lịch dễ nhìn trong màn hình đầu.
- **Bàn phím/modal:** các card dự án dùng motion.div onClick, không có semantics link/button. ContactModal có role dialog nhưng chưa thấy quản lý focus/focus trap; SubpageNavigation không tự xử lý Escape cho modal. Nên dùng phần tử chuẩn, khôi phục focus khi đóng, hỗ trợ reduced motion.
- **Điều hướng Our Story:** subpage link `/#about` nhưng Scene nghe custom event `scroll-to-about`, phần nội dung dùng ID `about-section`; chưa thấy cầu nối xử lý hash này. Mobile cũng chưa có section ID `about`. Cần thống nhất và thêm kiểm tra điều hướng trực tiếp.
- **Cửa hàng còn nội dung thử:** sản phẩm đang hiện mô tả `ádg`. Cần ảnh minh họa đúng sản phẩm, mô tả, phiên bản Revit, dung lượng và hướng dẫn sử dụng trước khi quảng bá.
- **Tài liệu/CI:** README còn mẫu Vite; chưa có `.github` workflow trong checkout. Chưa có test API/payment/contact/failure state. Test E2E homepage yêu cầu canvas cho cả Pixel 5 mặc dù MobileHome không render canvas; cần tách expectation theo thiết bị. Test dự án còn phụ thuộc ngôn ngữ mặc định.
- **Cấu hình môi trường:** root không khai báo engines Node; Sanity Studio là package riêng, chưa có lockfile riêng được thấy trong checkout. Cần chuẩn hóa môi trường build và quy trình chạy Studio.
- **Đo lường:** GA4 ở index.html đang comment; chưa xác minh analytics được thêm qua dashboard hay công cụ khác. Nên đo view_project, contact_open và contact_success để đánh giá thay đổi.

## 6. Lộ trình đề xuất

Thời lượng dưới đây là ước lượng công sức ban đầu cho một người phát triển, chưa bao gồm chờ nội dung, quyền truy cập dịch vụ hoặc kiểm duyệt. Mỗi giai đoạn nên có preview và nghiệm thu trước khi đưa production.

| Giai đoạn | Phạm vi | Công sức dự kiến | Tiêu chí hoàn thành |
|---|---|---|---|
| 1. Ổn định nền tảng | Sửa lint; thêm API typecheck; hoàn thiện env/README; lỗi Sanity và fallback 2D; đảm bảo form không báo thành công giả; sửa test E2E | 2–4 ngày | Build/lint/unit/API checks đạt; E2E desktop/mobile chạy; failure state có phục hồi; preview contact được xác minh với hộp thư do chủ site chọn |
| 2. Nhanh và dễ liên hệ | Tách bundle 3D/PDF; tối ưu texture; CTA mobile; điều hướng Our Story; focus/bàn phím; thống nhất VI/EN | 3–5 ngày | Mobile cache lạnh không tải 3D trước khi cần; không kẹt loader; CTA rõ; kiểm tra 390px/768px/desktop và reduced motion |
| 3. Portfolio và SEO | URL dự án, slug CMS, template case study, domain chuẩn, metadata/OG, sitemap, render sẵn trang nội dung, đo conversion | 4–7 ngày | Mỗi dự án có URL chia sẻ trực tiếp và metadata riêng; sitemap đúng domain; link mở được trên mobile; đo được hành trình xem dự án → liên hệ |
| 4. Thương mại hóa thư viện | Giá server-side; catalog tách dữ liệu bí mật; file private; đơn hàng/quyền tải; raw webhook/idempotency; trạng thái lỗi/hỗ trợ | 4–7 ngày | Test mode: sửa giá không có tác dụng; thanh toán thất bại không cấp file; duplicate webhook không giao hàng trùng; token hết hạn/replay xử lý đúng chính sách |

Giai đoạn 4 có thể làm sau nếu ưu tiên hiện tại là kiếm khách thiết kế. Nếu bắt đầu bán Revit ngay, các mục A–D trở thành điều kiện bắt buộc trước khi mở bán và cần đưa lên trước.

Mục tiêu đo lường sau khi có baseline: giảm payload mobile đáng kể so với ~690 KB gzip JS ban đầu; theo dõi Core Web Vitals ngoài thực tế; tăng số lượt xem chi tiết và liên hệ có chất lượng. Đây là mục tiêu cần đo, không phải kết quả đã đạt.

### Cấu trúc case study dự án đề xuất

Ảnh đại diện → địa điểm/năm/diện tích/loại công trình → nhu cầu gia chủ → bài toán khí hậu và hiện trạng → giải pháp không gian/vật liệu → ảnh hoàn thiện, bản vẽ chọn lọc → vai trò của studio → lời mời trao đổi dự án tương tự.

Giữ ảnh và câu chuyện là trung tâm. Trải nghiệm 3D là một cách khám phá bổ sung; khách cần có đường đi nhanh tới ảnh, thông tin dự án và liên hệ.

## 7. Chạy và phát triển local

```powershell
Set-Location C:\Users\baott\Documents\ChatGPT\web\hienarchistu
npm.cmd ci
npm.cmd run dev
# Vite mặc định: http://localhost:5173

npm.cmd run build
npm.cmd run preview
npm.cmd test
npm.cmd run lint
```

Không cần chạy lại npm ci cho mỗi lần mở dự án. Dependencies đã được cài trong lần đánh giá này. Frontend hiện có fallback Sanity project ID trong code; cần chỉ định project/dataset phù hợp khi bắt đầu chỉnh sửa dữ liệu.

Vite dev chỉ phục vụ frontend; không tự chạy các Vercel API `/api/*`. Kiểm tra contact/checkout/download cần Vercel development runtime hoặc preview deployment có biến môi trường test. Không dùng live Stripe keys để chạy test giao dịch.

Sanity Studio ở thư mục `hienarch/`, có package và lệnh `dev` riêng. Chưa cài/build Studio trong đợt này.

### Danh mục cấu hình cần xác minh trên Vercel

| Nhóm | Biến/cấu hình |
|---|---|
| Frontend CMS | `VITE_SANITY_PROJECT_ID`, `VITE_SANITY_DATASET` |
| Server CMS | `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_API_TOKEN` nếu server cần đọc dữ liệu private |
| Thanh toán | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DOWNLOAD_JWT_SECRET` |
| Email | `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM` và domain gửi đã xác minh |
| Redis | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |
| URL | Domain production và chính sách `BASE_URL`; code hiện ưu tiên `VERCEL_URL` nên có thể quay lại domain deployment thay vì domain chính |
| Build | Root dự án là package Vite ở root repository; build `npm run build`, output `dist`; đối chiếu cấu hình thật ở dashboard |

Chỉ cần kiểm tra tên biến và scope; không đưa giá trị secret vào báo cáo, chat hoặc Git. Prefix `VITE_` dành cho dữ liệu có thể xuất hiện trong frontend.

Tách cấu hình development/preview/production; dùng preview để nghiệm thu rồi mới cập nhật bản đang phục vụ khách. [Tài liệu môi trường Vercel](https://vercel.com/docs/deployments/environments).

## 8. Bước triển khai đầu tiên nên chọn

Một đợt sửa nền tảng có phạm vi rõ: sửa lint và API typecheck, bổ sung hướng dẫn/env, xử lý Sanity lỗi có nút thử lại, tách loader khỏi Three.js và sửa trạng thái thành công của contact. Kèm các test có ý nghĩa cho dữ liệu lỗi, form thiếu cấu hình và mobile không cần canvas. Sau đó mới tối ưu sâu giao diện và bổ sung trang dự án.

Kết quả của đợt đánh giá này là checkout local và tài liệu này. Mã ứng dụng chưa được sửa, chưa có commit/push hoặc deployment mới.
