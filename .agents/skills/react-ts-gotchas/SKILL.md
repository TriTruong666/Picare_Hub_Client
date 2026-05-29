---
name: react-ts-gotchas
description: Hướng dẫn xử lý các lỗi TypeScript thường gặp trong React (như type mismatch ở onClick, biến có thể null/undefined trong callback).
---

# React & TypeScript Common Gotchas

Kỹ năng (Skill) này cung cấp hướng dẫn xử lý một số lỗi TypeScript phổ biến khi làm việc với React và các thư viện hệ sinh thái (như React Query).

## 1. Lỗi truyền hàm vào Event Handler (React Query `refetch` mismatch)

**Lỗi thường gặp:**
```text
Type '(options?: RefetchOptions | undefined) => Promise<QueryObserverResult<...>>' is not assignable to type 'MouseEventHandler<HTMLButtonElement>'.
```

**Nguyên nhân:**
Khi bạn gán trực tiếp một hàm vào sự kiện (ví dụ `onClick={refetch}`), React sẽ tự động truyền `MouseEvent` vào đối số đầu tiên của hàm đó.
Tuy nhiên, `refetch` của React Query mong đợi đối số đầu tiên là một object cấu hình `options` (kiểu `RefetchOptions`). Do đó, TypeScript sẽ báo lỗi vì `MouseEvent` không khớp với `RefetchOptions`.

**Cách khắc phục:**
Bọc hàm gọi lại bằng một arrow function ẩn danh (inline arrow function) để chặn việc truyền event object vào hàm không mong muốn.

```tsx
// ❌ SAI: Truyền trực tiếp, dẫn đến mismatch argument
<button onClick={refetch}>Thử lại</button>

// ✅ ĐÚNG: Sử dụng arrow function
<button onClick={() => refetch()}>Thử lại</button>
```

## 2. Lỗi "possibly 'null' or 'undefined'" bên trong Closures (Callback Functions)

**Lỗi thường gặp:**
```text
'object.property' is possibly 'null' or 'undefined'.
```

**Nguyên nhân:**
Ngay cả khi bạn đã bọc component hoặc block code bằng một toán tử kiểm tra (ví dụ: `if (obj) { ... }` hoặc `obj ? (...) : null`), TypeScript không thể duy trì trạng thái "đã được kiểm tra an toàn" (type narrowing) vào bên trong các callback functions (closures) như `onClick={() => ...}` hay các object method khai báo muộn.
Bởi vì TypeScript không thể đảm bảo rằng object đó không bị thay đổi (mutate) thành `null` hay `undefined` trước khi callback được thực thi.

**Cách khắc phục:**
Sử dụng toán tử Optional Chaining (`?.`) một cách triệt để khi truy cập các thuộc tính lồng nhau bên trong callback.

```tsx
// ❌ SAI: TypeScript mất context type narrowing bên trong callback
{contract.individualCredential ? (
  <button onClick={() => openS3Asset(contract.individualCredential.first_identification_image_key)}>
    Xem
  </button>
) : null}

// ✅ ĐÚNG: Sử dụng Optional Chaining (?.)
{contract.individualCredential ? (
  <button onClick={() => openS3Asset(contract.individualCredential?.first_identification_image_key)}>
    Xem
  </button>
) : null}
```

## Lưu ý cho AI Agent
Khi gặp các lỗi tương tự trong quá trình lập trình hoặc fix bug React + TypeScript, hãy áp dụng trực tiếp các phương pháp trên thay vì tìm cách sửa đổi kiểu dữ liệu gốc (types/interfaces) của thư viện.
