# Bảo vệ phân phối UI Hub

Đây là các lớp tăng chi phí sao chép và hỗ trợ truy vết, không phải cơ chế phân biệt chắc chắn người/agent. Tài khoản được cấp quyền vẫn nhận code của nhóm UI được phép, có thể lưu bundle hoặc dựng lại giao diện từ ảnh. Không có chặn F12, chuột phải hay tự đăng xuất dựa vào phỏng đoán DevTools.

## Phân loại tự động khi build

- Trang `.tsx` ở cấp đầu của `src/pages/private/` và các file `*Page.tsx` lồng sâu thuộc nhóm dashboard. Hai router nội bộ cũng là điểm bắt đầu của nhóm này.
- Trang trong `src/pages/authenticated/` thuộc nhóm member.
- Hai trang QR Product Generator/Edit thuộc scope `qr-products`; hai trang Catalogue Create/Edit thuộc scope `catalogue`. HTML và bundle của mỗi công cụ dùng cùng allowedRoles lấy từ `src/constants/staticHubClients.ts` khi build, thay vì kế thừa quyền dashboard.
- Dependency dùng chung giữa các công cụ/dashboard có chunk và danh sách role riêng (hợp các quyền cần dùng dependency đó). Build chặn trộn màn hình chỉ dành cho dashboard vào chunk được cấp cho marketing.
- Build duyệt đồ thị import tĩnh, đưa cả dependency riêng của từng nhóm sang `dist/protected/<scope>/`. Dependency thực sự cần cho trang public vẫn được chia sẻ public. Thêm trang theo quy ước thư mục không cần thêm vào allowlist bảo vệ.
- Các modal tài khoản chỉ được import qua router dashboard. Metadata sidebar không import component trang nội bộ nữa.
- Nếu import tĩnh màn hình riêng vào public entry, build thất bại. Manifest `.security/ui-policy.json` là allowlist file và scope do build sinh; không phục vụ manifest này qua HTTP.
- Tất cả JS chunk đều được obfuscate, kể cả dynamic imports; tắt source map. Cấu hình không bật anti-debugger/control-flow flattening để hạn chế ảnh hưởng runtime. Obfuscation không phải ranh giới xác thực.

## Xác thực, quyền và giới hạn

Dịch vụ `hub-ui-access` chỉ chạy trong mạng Docker, không publish cổng ra host. Nginx gửi subrequest nội bộ trước khi cấp HTML/chunk riêng. Dịch vụ gọi Core `/api/v1/users/me`, yêu cầu tài khoản ACTIVE và kiểm tra scope:

- member: mọi tài khoản ACTIVE có phiên hợp lệ;
- qr-products/catalogue: role của static client tương ứng (hiện gồm admin, business_development, marketing); không mở quyền `/dashboard/*` cho marketing;
- dashboard: các role trong `src/config/dashboardAccess.ts`, được build đưa vào policy. Đây là quyền phân phối theo nhóm; các quyền chi tiết của tài khoản/lưu trữ/hợp đồng vẫn phải được backend API kiểm tra. Không tuyên bố phân phối chunk riêng cho từng role con trong cùng nhóm dashboard.

Cookie phải được Core xác thực; không tin cookie tự đặt, header `X-Ui-Actor`, User-Agent hay Referer. Không cache quyết định thành công sau request; chỉ gộp các lần kiểm tra cùng token đang đồng thời chờ Core. Core lỗi thì không cấp file.

Mỗi tài khoản được mặc định 180 lượt cấp HTML/chunk riêng/phút; vượt trả 429 + Retry-After. Giới hạn theo tài khoản nên đổi IP không đặt lại bộ đếm. Đây là cửa sổ 60 giây trong một instance, không phải phát hiện agent; nếu scale nhiều instance phải chuyển bộ đếm sang Redis. `UI_ASSET_LIMIT_PER_MINUTE` điều chỉnh ngưỡng (60–10000). Public login/landing không chịu giới hạn này.

Gateway có lớp riêng 10 request asset/giây/IP, burst 120 cho Hub; không áp dụng cho API/login. Thư mục `setup/nginx-gateway/` chứa cấu hình và script áp dụng chỉ vhost Hub, backup, `nginx -t`, reload và rollback khi cấu hình sai. File HTTP-context phải có tiền tố `01-` để log_format được nạp trước vhost. Không thay chính sách Office/WMS/SFA.

## Truy vết

- Log JSON của UI service ghi userId/role do Core xác thực, auditId, buildId, đường dẫn, quyết định, requestId; không ghi cookie/token, query string, email, tên hay body form.
- `ui.delivery` là lần server cấp/từ chối code. `ui.navigation.client_reported` là đường dẫn client khai báo, có thể bị sửa; không dùng nó một mình làm bằng chứng sao chép.
- Audit điều hướng chạy nền, không render watermark, auditId hay lớp phủ nào lên giao diện; không thay đổi thao tác click, selection hay bản in. Client không gọi endpoint lấy auditId để hiển thị. Log phía server vẫn đối chiếu theo userId/auditId, nhưng không còn dấu định danh trên ảnh chụp màn hình.
- AuditId là HMAC theo user/token với khóa ngẫu nhiên chỉ ở bộ nhớ service; đổi khi restart. Log đã có cả auditId/userId nên vẫn tra được các phiên cũ. Không lưu bearer token làm mã truy vết.
- Log container xoay vòng 10 MB x 5 file; cần chuyển log sang hệ thống lưu trữ tập trung nếu muốn điều tra dài hạn. Không có tự khóa tài khoản hoặc MFA step-up vì repo này chưa có backend hỗ trợ luồng đó.

## Kiểm thử và triển khai

```sh
npm run build
NGINX_BIN=/path/to/nginx node scripts/check-private-ui-security.mjs
```

Script dùng Nginx thật và Core giả lập để kiểm tra graph public/private, role member/dashboard, cookie giả/inactive/revoked, lỗi Core, rate limit, manifest nội bộ và log không lộ token. Có thể chạy thêm harness Chrome qua `UI_BROWSER_CHECK=file:///path/to/harness.mjs`; harness local dùng dữ liệu giả.

Dockerfile có hai target `ui-access` và `hub-client`. CI build/push hai image cùng nguồn; compose chờ service khỏe rồi mới khởi động frontend. Phải triển khai hai image tương ứng cùng build, không ghép manifest cũ với frontend mới. Nginx private HTML/chunks dùng `private, no-store`; gateway/CDN phải chuyển Cookie và không bỏ qua auth khi trả cache. Vite dev/preview chỉ dành cho local, không có ranh giới xác thực production.

Gateway production: dùng `ssh -i ~/.ssh/laptop_it_picare vps` (alias `vps` hiện không tự chọn key này). Copy `apply-hub-security.py` và `hub-delivery-limits.conf` vào cùng thư mục trên VPS rồi chạy script. Backup tại `~/.picare-backups/nginx/<UTC timestamp>/`.

Sau phát hành: xác minh public `/login` và `/` vẫn 200; anonymous `/dashboard`, `/pimory`, catalogue chuyển login; tải trực tiếp mọi `/protected/*` bằng User-Agent trình duyệt vẫn bị chặn; member không nhận dashboard chunks; account hợp lệ sử dụng bình thường. Xóa/purge bundle cũ khỏi hosting/CDN nếu có. Các bản từng được tải về không thể thu hồi.
