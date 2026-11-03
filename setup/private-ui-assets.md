# Bảo vệ code Pimory và catalogue trước khi đăng nhập

Pimory/Masonry và trang gallery/trình xem catalogue (gồm canvas lật trang và cache ảnh riêng) được lazy-load vào `dist/protected/`. `AuthGuard`/`StaticClientGuard` render thành công mới yêu cầu chunk. Nginx kiểm tra cookie phiên `.picare.vn` với `https://core.picare.vn/api/v1/users/me` trước khi cấp HTML `/pimory`, `/catalogue/public/:catalogueId`, `/catalogue/public/gallery` hoặc bất kỳ file nào trong `/protected/`.

- Chưa đăng nhập: Pimory/catalogue chuyển về login kèm đường dẫn quay lại; chunk trả 401 kể cả khi biết filename hoặc giả User-Agent/Referer.
- Có cookie giả/hết hạn: Core từ chối nên Nginx từ chối. Không kiểm tra bằng sự tồn tại của cookie.
- Core lỗi/không truy cập được: từ chối cấp file.
- HTML/chunk riêng dùng `Cache-Control: private, no-store` và `Vary: Cookie`; không dùng immutable/public cache.
- Ảnh S3 và tài nguyên dùng chung vẫn public theo thiết kế.
- Build sẽ thất bại nếu code UI riêng rơi vào chunk public hoặc public chunk import tĩnh chunk riêng.
- `/login` và tài nguyên cần để đăng nhập vẫn public. Không thể bảo vệ UI login bằng đăng nhập trước; người chưa đăng nhập phải nhận được mã để sử dụng nó. Không tuyên bố chống sao chép UI public.

## Kiểm tra

```sh
npm run build
NGINX_BIN=/path/to/nginx node scripts/check-private-ui-security.mjs
```

Nginx cần module `http_auth_request`; image Nginx chính thức đang dùng hỗ trợ module này. Test dùng Nginx thật với Core giả lập trên loopback để kiểm tra cả phiên hợp lệ, phiên giả, lỗi Core và cache; không cần tài khoản production.

## Triển khai

Phải triển khai đồng thời bản build mới và `nginx.conf` mới (Dockerfile hiện có copy cả hai). Không dùng Vite dev/preview để phục vụ production: chúng không thực thi Nginx auth. Gateway/CDN bên ngoài phải chuyển Cookie đến container và không cache `/protected/*`, `/pimory` hoặc `/catalogue/public/*`. Không được có static file server khác phục vụ trực tiếp `dist/protected/` bỏ qua Nginx này.

Cookie đăng nhập production được Core cấp trên `.picare.vn`, path `/`, nên trình duyệt gửi được tới Hub. Nginx xác thực TLS của Core bằng CA bundle trong image.

Sau triển khai, xoá/purge bundle **cũ** khỏi static hosting/CDN nếu có; mã Pimory/catalogue đã nằm trong bundle cũ không thể được bảo vệ hồi tố bằng đường dẫn mới. Những bản đã được người khác tải về không thể thu hồi. Người đã đăng nhập hợp lệ vẫn nhận code và có thể lưu nó; thay đổi này chặn người chưa có phiên hợp lệ tải code riêng.

Kiểm tra lại trên production: truy cập ẩn danh `/pimory`, `/catalogue/public/gallery`, `/catalogue/public/:catalogueId`, tải trực tiếp chunk với User-Agent trình duyệt, thử cookie giả (đều phải bị chặn); đăng nhập thật rồi mở các trang này và xác nhận chunk tải thành công. Xác nhận `/login` vẫn mở được khi chưa đăng nhập. Không đưa cookie thật vào lịch sử shell/log chia sẻ.
