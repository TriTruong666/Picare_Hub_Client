# Picare Digital Sign Helper - Mô tả và hướng dẫn sử dụng

## 1. Tổng quan

Picare Digital Sign Helper là dịch vụ chạy cục bộ trên Windows, dùng để kết nối hệ thống Picare với USB Token ký số của người dùng.

Ứng dụng hoạt động như một cầu nối local giữa trình duyệt/hệ thống Picare và driver USB Token được cài trên máy. Khi cần ký số, hệ thống Picare gọi API local của helper service, service sẽ giao tiếp với USB Token thông qua chuẩn PKCS#11 để lấy chứng thư số hoặc thực hiện thao tác ký.

URL mặc định sau khi cài đặt:

```text
http://picare.local:9999
```

`picare.local` được installer tự map về `127.0.0.1`, nên bản chất service vẫn chỉ chạy trên máy người dùng.

URL kỹ thuật tương đương:

```text
http://127.0.0.1:9999
```

## 2. Mục đích sử dụng

Ứng dụng phục vụ các nhu cầu chính:

- Kiểm tra service ký số local có đang hoạt động hay không.
- Phát hiện USB Token đang cắm trên máy.
- Đọc thông tin chứng thư số trong USB Token.
- Ký một chuỗi hash bằng private key nằm trong USB Token.
- Tạo chữ ký CMS/PKCS#7 cho quy trình ký PDF theo chuẩn ByteRange.

Private key không được xuất ra khỏi USB Token. Service chỉ gửi yêu cầu ký tới driver/token và nhận kết quả chữ ký trả về.

## 3. Phạm vi hoạt động

Service được thiết kế để chạy trên máy Windows của người dùng cuối.

Service lắng nghe trên:

```text
Host: 127.0.0.1
Port: 9999
```

Sau khi cài bằng installer, máy người dùng có thêm domain local:

```text
picare.local -> 127.0.0.1
```

Domain này chỉ có hiệu lực trên máy đã cài app. Máy khác muốn dùng cũng cần cài app hoặc tự cấu hình hosts tương ứng.

## 4. Yêu cầu hệ thống

Máy người dùng cần có:

- Windows.
- USB Token ký số.
- Driver/middleware của USB Token đã được cài đặt.
- Quyền Administrator khi cài đặt app.
- Cổng `9999` chưa bị ứng dụng khác chiếm.

Người dùng cuối không cần cài Node.js hoặc npm nếu dùng file setup release.

## 5. Nhà cung cấp USB Token đang hỗ trợ

Service nhận diện vendor thông qua mã `vendor` trong API.

Các vendor hiện có trong cấu hình:

| Vendor | Nhà cung cấp |
| --- | --- |
| `vinca` | VINCA |
| `vnpt` | VNPT-CA |
| `viettel` | Viettel-CA |
| `fpt` | FPT-CA |
| `misa` | MISA eSign |
| `bkav` | BKAV-CA |
| `ca2` | CA2 |
| `smartsign` | SmartSign |
| `newtel` | NewTel-CA |
| `easyca` | EasyCA |

Nếu driver của khách hàng được cài ở đường dẫn khác với mặc định, có thể cấu hình lại bằng biến môi trường PKCS#11 tương ứng, ví dụ:

```powershell
setx PKCS11_VINCA_PATH "C:\Windows\SysWOW64\VinaCA_p11.dll" /M
setx PKCS11_VNPT_PATH "C:\Windows\System32\vnptca_p11_v8.dll" /M
setx PKCS11_VIETTEL_PATH "C:\Windows\System32\viettel-ca_pkcs11.dll" /M
```

Lệnh có `/M` cần chạy bằng PowerShell hoặc CMD với quyền Administrator.

## 6. Cài đặt cho người dùng cuối

File gửi cho đối tác/người dùng cuối:

```text
PicareDigitalSignHelperSetup.exe
```

Cách cài đặt:

1. Cắm USB Token vào máy.
2. Đảm bảo driver/middleware của USB Token đã được cài.
3. Chuột phải vào `PicareDigitalSignHelperSetup.exe`.
4. Chọn `Run as administrator`.
5. Làm theo wizard cài đặt.
6. Sau khi cài xong, service sẽ được đăng ký và khởi động tự động.

Installer sẽ tự động:

- Copy app vào `C:\Program Files\Picare\DigitalSignHelper`.
- Đăng ký Windows Service tên `PicareDigitalSignHelper`.
- Khởi động service.
- Thêm domain local `picare.local` vào file hosts.
- Tạo entry uninstall trong Windows Apps & Features.

## 7. Kiểm tra sau khi cài

Mở trình duyệt hoặc PowerShell và gọi:

```text
http://picare.local:9999/health
```

Hoặc:

```powershell
curl http://picare.local:9999/health
```

Kết quả thành công sẽ có dạng:

```json
{
  "success": true,
  "message": "Thành công",
  "data": {
    "ok": true,
    "service": "PicareDigitalSignHelper",
    "port": 9999,
    "vendors": ["vinca", "vnpt", "viettel"]
  }
}
```

Danh sách `vendors` thực tế phụ thuộc cấu hình hiện tại của app.

## 8. Gỡ cài đặt

Người dùng có thể gỡ qua Windows Apps & Features.

Khi uninstall, app sẽ tự động:

- Dừng service.
- Gỡ Windows Service `PicareDigitalSignHelper`.
- Xóa file app khỏi thư mục cài đặt.
- Xóa domain local `picare.local` khỏi file hosts.

Nếu gỡ thủ công từ source hoặc thư mục build:

```powershell
npm run uninstall-service
```

Lệnh này cần quyền Administrator.

## 9. API local

Base URL:

```text
http://picare.local:9999
```

Swagger UI:

```text
http://picare.local:9999/docs
```

OpenAPI JSON:

```text
http://picare.local:9999/openapi.json
```

### 9.1. Kiểm tra trạng thái service

```http
GET /health
```

Ví dụ:

```powershell
curl http://picare.local:9999/health
```

Mục đích:

- Kiểm tra service có đang chạy.
- Kiểm tra port đang dùng.
- Xem danh sách vendor được cấu hình.

### 9.2. Lấy danh sách USB Token

```http
GET /tokens
GET /tokens?vendor=vinca
```

Nếu không truyền `vendor`, service sẽ thử quét theo các vendor đang cấu hình.

Ví dụ:

```powershell
curl "http://picare.local:9999/tokens?vendor=vinca"
```

Response thành công trả về thông tin token và danh sách chứng thư số tìm thấy, gồm các trường như:

- `vendor`
- `label`
- `driverPath`
- `token.label`
- `token.manufacturerID`
- `token.model`
- `token.serialNumber`
- `certificates[].certificateId`
- `certificates[].label`
- `certificates[].serialHex`

### 9.3. Lấy chứng thư số

```http
GET /certificate?vendor=vinca
GET /certificate?vendor=vinca&certificateId=<certificate-id>
```

Ví dụ:

```powershell
curl "http://picare.local:9999/certificate?vendor=vinca"
```

Response thành công trả về chứng thư số trong USB Token:

```json
{
  "success": true,
  "message": "Lấy chứng thư số thành công",
  "data": {
    "vendor": "vinca",
    "certificateId": "01ab...",
    "certificatePem": "-----BEGIN CERTIFICATE-----...",
    "certificateDerHex": "...",
    "serialHex": "...",
    "subjectHex": "...",
    "issuerHex": "..."
  }
}
```

Nếu không truyền `certificateId`, service dùng chứng thư số đầu tiên tìm thấy trong token.

### 9.4. Ký hash

```http
POST /sign-hash
Content-Type: application/json
```

Body:

```json
{
  "hash": "aabbccddeeff00112233445566778899",
  "pin": "12345678",
  "vendor": "vinca"
}
```

Yêu cầu:

- `hash` là chuỗi hex hợp lệ.
- `hash` có độ dài chẵn.
- `pin` là mã PIN USB Token.
- `vendor` là mã nhà cung cấp token.

Ví dụ:

```powershell
curl -X POST http://picare.local:9999/sign-hash `
  -H "Content-Type: application/json" `
  -d "{\"hash\":\"aabbccddeeff00112233445566778899\",\"pin\":\"12345678\",\"vendor\":\"vinca\"}"
```

Response thành công:

```json
{
  "success": true,
  "message": "Ký hash thành công",
  "data": {
    "signatureHex": "...",
    "vendor": "vinca"
  }
}
```

### 9.5. Ký CMS/PKCS#7 cho PDF ByteRange

```http
POST /sign-pdf-cms
Content-Type: application/json
```

API này dùng cho luồng ký PDF mà hệ thống chính đã chuẩn bị sẵn PDF ByteRange và tạo ra `hash` cần ký.

Body:

```json
{
  "hash": "aabbccddeeff00112233445566778899",
  "pin": "12345678",
  "vendor": "vinca",
  "certificateId": "optional-certificate-id"
}
```

`certificateId` là tùy chọn. Nếu không truyền, service dùng chứng thư số đầu tiên trong token.

Response thành công:

```json
{
  "success": true,
  "message": "Ký CMS/PKCS#7 cho PDF ByteRange thành công",
  "data": {
    "signatureHex": "...",
    "signatureFormat": "CMS_PKCS7_DER_HEX",
    "vendor": "vinca",
    "certificateId": "...",
    "certificatePem": "-----BEGIN CERTIFICATE-----...",
    "certificateSerial": "...",
    "certificateSubject": "...",
    "certificateIssuer": "..."
  }
}
```

Giá trị `signatureHex` là chữ ký CMS/PKCS#7 dạng DER hex để hệ thống chính nhúng lại vào vùng chữ ký của PDF.

## 10. Luồng tích hợp đề xuất

Luồng ký thông thường từ hệ thống Picare:

1. Frontend hoặc backend chính kiểm tra service local bằng `GET /health`.
2. Người dùng chọn vendor USB Token, ví dụ `vinca`.
3. Hệ thống gọi `GET /tokens?vendor=vinca` để kiểm tra token và lấy danh sách chứng thư số.
4. Nếu cần hiển thị chứng thư, gọi `GET /certificate?vendor=vinca`.
5. Hệ thống chính chuẩn bị dữ liệu cần ký:
   - Với dữ liệu thường: tạo hash và gọi `/sign-hash`.
   - Với PDF: tạo ByteRange/hash và gọi `/sign-pdf-cms`.
6. Service yêu cầu USB Token ký bằng PIN người dùng nhập.
7. Service trả chữ ký về cho hệ thống chính.
8. Hệ thống chính lưu chữ ký hoặc nhúng chữ ký vào PDF.

## 11. Cấu hình khi chạy từ source

Cài dependencies:

```powershell
npm install
```

Chạy trực tiếp:

```powershell
npm start
```

Mặc định app chạy tại:

```text
http://127.0.0.1:9999
```

Có thể đổi host/port bằng biến môi trường:

```powershell
$env:SIGN_HELPER_HOST="127.0.0.1"
$env:SIGN_HELPER_PORT="9999"
npm start
```

Cài service từ source:

```powershell
npm run install-service
```

Gỡ service từ source:

```powershell
npm run uninstall-service
```

Các lệnh cài/gỡ service cần chạy bằng quyền Administrator.

## 12. Build và phát hành

Build các file executable:

```powershell
npm run build:all
```

Output:

```text
dist/picare-sign-helper.exe
dist/picare-sign-helper-console.exe
dist/picare-sign-helper-installer.exe
dist/picare-sign-helper-uninstaller.exe
```

Build file setup hoàn chỉnh:

```powershell
npm run build:release
```

Output gửi cho đối tác:

```text
release/PicareDigitalSignHelperSetup.exe
```

File setup này dùng Inno Setup để đóng gói. Máy build cần cài Inno Setup 6.

## 13. Các lỗi thường gặp

### Không mở được `http://picare.local:9999/health`

Kiểm tra:

- Service `PicareDigitalSignHelper` có đang chạy trong `services.msc` không.
- Cổng `9999` có bị chiếm không.
- Installer đã chạy bằng quyền Administrator chưa.
- File hosts có dòng `127.0.0.1 picare.local` chưa.

Có thể thử URL kỹ thuật:

```text
http://127.0.0.1:9999/health
```

### Không phát hiện USB Token

Kiểm tra:

- USB Token đã cắm vào máy.
- Driver/middleware của token đã cài.
- Vendor truyền vào API đúng với loại token.
- Driver PKCS#11 nằm đúng đường dẫn cấu hình.

### Sai PIN hoặc token từ chối đăng nhập

API có thể trả lỗi `TOKEN_PIN_ERROR`.

Nguyên nhân thường gặp:

- Người dùng nhập sai PIN.
- Token bị khóa do nhập sai PIN nhiều lần.
- Driver USB Token từ chối phiên đăng nhập.

### Windows từ chối quyền truy cập driver token

API có thể trả lỗi `WINDOWS_PERMISSION_DENIED`.

Cách xử lý:

- Chạy installer bằng quyền Administrator.
- Kiểm tra quyền của tài khoản chạy service trong `services.msc`.
- Đảm bảo middleware USB Token cho phép service truy cập thiết bị.

### Không tải được driver PKCS#11

Nguyên nhân:

- Máy chưa cài middleware USB Token.
- Đường dẫn DLL khác với cấu hình mặc định.
- Driver không đúng kiến trúc hoặc không tương thích.

Cách xử lý:

- Cài lại middleware USB Token từ nhà cung cấp.
- Cấu hình biến môi trường `PKCS11_<VENDOR>_PATH`.
- Khởi động lại service sau khi đổi biến môi trường.

## 14. Ghi chú bảo mật

- App chỉ bind vào `127.0.0.1`, không mở API ra mạng LAN.
- `picare.local` chỉ là alias local trỏ về `127.0.0.1`.
- Private key không rời khỏi USB Token.
- PIN chỉ dùng để đăng nhập phiên ký với token, không được lưu bởi service.
- Người dùng vẫn cần tự bảo vệ USB Token, PIN và máy tính cá nhân.

## 15. Thông tin kỹ thuật nhanh

| Mục | Giá trị |
| --- | --- |
| Service name | `PicareDigitalSignHelper` |
| Local URL | `http://picare.local:9999` |
| Fallback URL | `http://127.0.0.1:9999` |
| Health check | `GET /health` |
| Swagger UI | `GET /docs` |
| OpenAPI JSON | `GET /openapi.json` |
| Install folder | `C:\Program Files\Picare\DigitalSignHelper` |
| Release setup | `release/PicareDigitalSignHelperSetup.exe` |

