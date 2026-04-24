---
name: api_hooks
description: "Guidelines and templates for writing API hooks (React Query) in the Picare dashboard."
---

# Picare API Hooks Standard

This skill defines the standard pattern for writing API integration hooks in the Picare project. All API calls must be wrapped in custom React hooks using `@tanstack/react-query` to ensure consistent data fetching, caching, error handling, and UI feedback (toast notifications).

## 📁 File Structure & Location
- API service files (Axios calls) are placed in `src/apis/*.service.ts`.
- Hooks mapping to these services are placed in `src/hooks/data/use*Hooks.ts`.

## 📦 Required Imports

When creating a new hook file, ensure you include the following standard imports:

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch, useSuspenseFetch } from "../useFetch"; // Use these instead of standard useQuery
import { toast } from "../useToast"; // Standard toast notification
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error"; // Error handling
// Import your service and types here:
// import * as YourService from "@/apis/your.service";
// import type { ... } from "@/types/...";
```

## 🔍 1. Queries (Fetching Data)

For data fetching, use the custom `useFetch` wrapper. It automatically handles extracting `data` from our standard `BaseResponse<T>` and throwing errors when `success` is false. Use `useSuspenseFetch` if the component uses React Suspense.

### Template:
```typescript
/**
 * Lấy danh sách thực thể
 */
export function useEntityList() {
  return useFetch(["entities"], () => EntityService.getEntities());
}

/**
 * Lấy chi tiết chi tiết thực thể theo ID
 */
export function useEntity(id: string) {
  return useFetch(["entities", id], () => EntityService.getEntity(id), {
    enabled: !!id,
  });
}
```

## ✍️ 2. Mutations (Creating, Updating, Deleting)

For operations that modify data, we use `useMutation`.

### Standard Mutation Rules:
1. **`onSuccess` Logic**:
   - Check `data.success`.
   - If `true`: Show `toast.success` and call `queryClient.invalidateQueries`.
   - If `false`: Show `toast.error` using `translateErrorMessage(data.error_code, data.message)`.
2. **`onError` Logic**: Use `toast.error("Lỗi", getApiErrorMessage(err))` to handle network/system errors.
3. **Typing**: Use specific types for `mutationFn` arguments.

### Template for Create:
```typescript
export function useCreateEntity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PostEntityBody) => EntityService.createEntity(data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Thành công", "Đã tạo thực thể mới");
        queryClient.invalidateQueries({ queryKey: ["entities"] });
      } else {
        toast.error("Thất bại", translateErrorMessage(data.error_code, data.message));
      }
    },
    onError: (err) => toast.error("Lỗi", getApiErrorMessage(err)),
  });
}
```

### Template for Update (Handling ID and Data):
```typescript
export function useUpdateEntity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PutEntityBody }) =>
      EntityService.updateEntity(data, id), // Note: order depends on service signature
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Thành công", "Đã cập nhật thông tin");
        queryClient.invalidateQueries({ queryKey: ["entities"] });
        queryClient.invalidateQueries({ queryKey: ["entities", variables.id] });
      } else {
        toast.error("Thất bại", translateErrorMessage(data.error_code, data.message));
      }
    },
    onError: (err) => toast.error("Lỗi", getApiErrorMessage(err)),
  });
}
```

### Template for Delete:
```typescript
export function useDeleteEntity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => EntityService.deleteEntity(id),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Thành công", "Đã xóa thực thể");
        queryClient.invalidateQueries({ queryKey: ["entities"] });
      } else {
        toast.error("Thất bại", translateErrorMessage(data.error_code, data.message));
      }
    },
    onError: (err) => toast.error("Lỗi", getApiErrorMessage(err)),
  });
}
```

## ⚖️ Error Handling Flow Explained
- **`translateErrorMessage(error_code, message)`**: Used inside `onSuccess` when the HTTP request succeeds (200 OK) but the API returns `success: false`. It maps backend error codes to Vietnamese messages.
- **`getApiErrorMessage(error)`**: Used inside `onError` for network errors, 4xx/5xx responses. It internaly calls `translateErrorMessage`.
- **Field Name**: Always use `data.error_code` (not `error.code`) as per `BaseResponse` interface.

