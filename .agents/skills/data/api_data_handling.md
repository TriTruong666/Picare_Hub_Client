---
name: api_data_workflow
description: "Master Guide for full API-to-UI integration in Picare OMS, covering Types, Services, Hooks, UI State Handling, and Validation Strategy."
---

# Picare API-to-UI Integration Workflow

This guide defines the complete standard for integrating backend data into the Picare OMS frontend. To maintain a premium, high-end experience, every new feature must follow these 4 steps exactly and utilize standardized components.

---

## 🏗️ Step 1: Define Types (`src/types/*.ts`)
All data structures must be explicitly typed. Match backend naming conventions exactly.

---

## 🔗 Step 2: Create API Service (`src/apis/*.service.ts`)
Use the decentralized `omsAxiosClient`. 
- Standard: `Promise<BaseResponse<T>>`.
- Paginated: `Promise<BasePaginatedResponse<T[]>>`.

---

## ⚓ Step 3: Write React Query Hooks (`src/hooks/data/use*Hooks.ts`)
Hooks manage data fetching and mutations with standardized feedback.
- Use `translateErrorMessage(data.error_code, data.message)`.
- Use `getApiErrorMessage(err)` for network/system errors.

---

## ✅ Step 4: Form Validation Strategy (`src/common/validation.ts`)
Before calling a mutation, always validate the input data. We have two distinct styles:

### 1. Public Pages (Login, Forgot Password)
Use **inline red text** below the input fields for a better user experience on long forms.
```tsx
{errors.email && <p className="mt-1 text-xs text-red-500">* {errors.email}</p>}
```

### 2. Dashboard Pages (Create/Edit Entity)
Use **Toast notifications** to keep the UI clean and minimalist.
```tsx
import { toast } from "@/hooks/useToast";

const handleSubmit = () => {
  if (!isRequired(name)) {
    toast.error("Thiếu thông tin", "Vui lòng nhập tên công ty");
    return;
  }
  // Proceed with mutate
};
```

---

## 🎨 Step 5: Handle UI States (`src/pages/*.tsx`)

### 🧰 Standard Components (`src/components/custom-ui/`)
- **`Button`**: All clickable actions (use `color="primary"` for main actions).
- **`Spinner`**: Loading indicators.
- **`Toast`**: Mutation feedback.

### 1. Loading State (Skeletons)
Use `animate-pulse` skeletons matching the final structure.

### 2. Error State (Minimalist)
Centered icon + error message + **Standard `Button`** for retry.

### 3. Empty State (Minimalist)
Minimalist icon + text + **Standard `Button`** for primary action.

---

## ♾️ Step 6: Pagination & "Load More" Pattern
For lists requiring pagination, follow the "Append" strategy for a seamless experience.

### 1. Hook Usage
Update the hook to accept `params: { page, limit }`.

### 2. Component Implementation
Use `useState` to maintain a combined list and current page.
```tsx
const [page, setPage] = useState(1);
const [allData, setAllData] = useState<Item[]>([]);

const { data: items, fullResponse, isFetching } = useItems({ page, limit: 20 });

// Handle appending
useEffect(() => {
  if (items) {
    if (page === 1) setAllData(items);
    else setAllData(prev => [...prev, ...items]);
  }
}, [items, page]);

// "Load More" Button
{hasMore && (
  <button onClick={() => setPage(p => p + 1)} disabled={isFetching}>
    {isFetching ? <Spinner /> : "Tải thêm"}
  </button>
)}
```

## 🧼 Step 7: Data Formatting (`src/common/format.ts`)
To maintain a unified display across the entire platform, **never** manually format raw data (dates, prices, times) inside components. Always use the provided utility functions.

### 💰 Price & Numeric Formatting
- **`formatPrice(price: number)`**: Formats a number to Vietnamese currency style with "VND" suffix (e.g., `150.000 VND`).
- **`formatPriceDisplay(value: string)`**: Specifically for input masking or raw string-to-price formatting.

### 📅 Date & Time Formatting
- **`formatTime(isoString: string)`**: Returns time in `HH:mm` (24h format).
- **`formatDate(isoString: string)`**: Returns date in long Vietnamese format (`dd MMMM yyyy`).
- **`formatDateTime(isoString: string)`**: Returns both full date and short time.
- **`formatRelativeTime(dateString: string)`**: Returns human-readable relative strings like "5 phút trước", "Bây giờ", or full date if older. **Automatically handles conversion from UTC to Vietnam (UTC+7) timezone.**

```tsx
import { formatPrice, formatRelativeTime } from "@/common/format";

// Standard Usage
<span className="tabular-nums font-semibold">
  {formatPrice(order.totalAmount)}
</span>
<span className="text-xs text-gray-500">
  {formatRelativeTime(order.updatedAt)}
</span>
```

---

## 📑 Consolidation Rules
- **Component Priority**: If a `custom-ui` component exists, you **must** use it.
- **Global Error Handling**: Always import from `src/common/api.error.ts`.
- **Validation**: Use functions from `src/common/validation.ts` for consistency.
- **Formatting**: **Mandatory** use of `@/common/format` for any price, date, or time display to ensure timezone and locale consistency.
