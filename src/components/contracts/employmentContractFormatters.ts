export function formatDate(value?: string | null) {
  if (!value) return ".../.../...";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (match) return `${match[3]}/${match[2]}/${match[1]}`;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatLongDate(value?: string | null) {
  const [day, month, year] = formatDate(value).split("/");
  return `ngày ${day} tháng ${month} năm ${year}`;
}

export function formatMoney(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "-";
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return String(value);
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(numberValue);
}
