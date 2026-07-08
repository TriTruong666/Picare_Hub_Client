import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiX,
} from "react-icons/fi";
import { formatDate } from "@/common/format";
import { toast } from "@/hooks/useToast";

type CalendarProps = {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minDate?: Date;
  disabled?: boolean;
  allowClear?: boolean;
  compact?: boolean;
};

const WEEK_DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const MONTHS = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getValidDate(value?: string) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parts = value.split("-");
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateDMY(value: string): string {
  if (!value) return "";
  const date = getValidDate(value);
  if (!date) return "";
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function parseDateString(str: string): Date | null {
  const cleaned = str.trim();
  if (!cleaned) return null;

  // 1. DD/MM/YYYY or DD-MM-YYYY
  const dmyRegex = /^(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})$/;
  const dmyMatch = cleaned.match(dmyRegex);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1; // 0-indexed
    const year = parseInt(dmyMatch[3], 10);
    const date = new Date(year, month, day);
    if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
      return date;
    }
  }

  // 2. YYYY-MM-DD or YYYY/MM/DD
  const ymdRegex = /^(\d{4})[/\-](\d{1,2})[/\-](\d{1,2})$/;
  const ymdMatch = cleaned.match(ymdRegex);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    const date = new Date(year, month, day);
    if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
      return date;
    }
  }

  // 3. DDMMYYYY (8 digits)
  const digitsRegex = /^(\d{2})(\d{2})(\d{4})$/;
  const digitsMatch = cleaned.match(digitsRegex);
  if (digitsMatch) {
    const day = parseInt(digitsMatch[1], 10);
    const month = parseInt(digitsMatch[2], 10) - 1;
    const year = parseInt(digitsMatch[3], 10);
    const date = new Date(year, month, day);
    if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
      return date;
    }
  }

  // 4. Try parsing Vietnamese wordy formats (e.g. "Ngày 02 tháng 07 năm 2026" or "02 tháng 7, 2026")
  const numbers = cleaned.match(/\d+/g);
  if (numbers && numbers.length === 3) {
    let day = parseInt(numbers[0], 10);
    let month = parseInt(numbers[1], 10) - 1;
    let year = parseInt(numbers[2], 10);

    if (numbers[0].length === 4) {
      year = parseInt(numbers[0], 10);
      month = parseInt(numbers[1], 10) - 1;
      day = parseInt(numbers[2], 10);
    }

    if (year >= 1000 && year <= 9999) {
      const date = new Date(year, month, day);
      if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
        return date;
      }
    }
  }

  return null;
}

export default function Calendar({
  value,
  onChange,
  placeholder = "Chọn ngày",
  minDate,
  disabled = false,
  allowClear = true,
  compact = false,
}: CalendarProps) {
  const selectedDate = getValidDate(value);
  const initialDate = selectedDate ?? new Date();
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
  );
  
  const [inputValue, setInputValue] = useState(value ? formatDateDMY(value) : "");
  const [isFocused, setIsFocused] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupPosition, setPopupPosition] = useState({
    top: 0,
    left: 0,
    width: 352,
  });
  
  const todayTime = startOfDay(new Date()).getTime();
  const selectedTime = selectedDate ? startOfDay(selectedDate).getTime() : null;
  const minTime = minDate ? startOfDay(minDate).getTime() : null;

  // Synchronize state when the value prop changes
  useEffect(() => {
    if (!isFocused) {
      setInputValue(value ? formatDateDMY(value) : "");
    }
    if (value) {
      const date = getValidDate(value);
      if (date) {
        setViewDate(new Date(date.getFullYear(), date.getMonth(), 1));
      }
    }
  }, [value, isFocused]);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        ref.current &&
        !ref.current.contains(target) &&
        !popupRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const trigger = ref.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const viewportPadding = 12;
      const popupHeight = popupRef.current?.offsetHeight || (compact ? 330 : 420);
      const width = Math.min(
        Math.max(rect.width, compact ? 320 : 352),
        window.innerWidth - viewportPadding * 2,
      );
      const left = Math.min(
        Math.max(rect.left, viewportPadding),
        window.innerWidth - width - viewportPadding,
      );
      const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
      const spaceAbove = rect.top - viewportPadding;
      const openAbove = spaceBelow < popupHeight && spaceAbove > spaceBelow;
      const top = openAbove
        ? Math.max(viewportPadding, rect.top - popupHeight - 8)
        : Math.min(rect.bottom + 8, window.innerHeight - popupHeight - viewportPadding);

      setPopupPosition({ top, left, width });
    };

    updatePosition();
    const frame = window.requestAnimationFrame(updatePosition);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [compact, open]);

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const firstWeekday = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPreviousMonth = new Date(year, month, 0).getDate();

    return Array.from({ length: 42 }, (_, index) => {
      const dayNumber = index - firstWeekday + 1;
      const inCurrentMonth = dayNumber >= 1 && dayNumber <= daysInMonth;
      const displayDay = inCurrentMonth
        ? dayNumber
        : dayNumber < 1
          ? daysInPreviousMonth + dayNumber
          : dayNumber - daysInMonth;
      const date = inCurrentMonth
        ? new Date(year, month, dayNumber)
        : dayNumber < 1
          ? new Date(year, month - 1, displayDay)
          : new Date(year, month + 1, displayDay);

      return { date, displayDay, inCurrentMonth };
    });
  }, [viewDate]);

  const canMovePrevious =
    !minDate ||
    new Date(viewDate.getFullYear(), viewDate.getMonth(), 0).getTime() >=
      new Date(minDate.getFullYear(), minDate.getMonth(), 1).getTime();

  const moveMonth = (offset: number) => {
    setViewDate(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  };

  const selectDate = (date: Date) => {
    const ymd = formatDateToYYYYMMDD(date);
    onChange(ymd);
    setInputValue(formatDateDMY(ymd));
    setOpen(false);
  };

  const selectToday = () => {
    const today = startOfDay(new Date());
    if (minTime !== null && today.getTime() < minTime) return;
    selectDate(today);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    let cleaned = val.replace(/[^0-9/\-]/g, "");

    // Auto-insert slash for DD/MM/YYYY typing flow if adding chars
    if (cleaned.length > inputValue.length) {
      if (/^\d{2}$/.test(cleaned)) {
        cleaned = cleaned + "/";
      } else if (/^\d{2}\/\d{2}$/.test(cleaned)) {
        cleaned = cleaned + "/";
      }
    }

    setInputValue(cleaned);

    const parsed = parseDateString(cleaned);
    if (parsed) {
      const parsedTime = startOfDay(parsed).getTime();
      if (minTime === null || parsedTime >= minTime) {
        onChange(formatDateToYYYYMMDD(parsed));
        setViewDate(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
      }
    }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    const parsed = parseDateString(inputValue);
    if (parsed) {
      const parsedTime = startOfDay(parsed).getTime();
      if (minTime !== null && parsedTime < minTime) {
        toast.error("Ngày không hợp lệ", `Ngày chọn không được trước ngày ${formatDateDMY(formatDateToYYYYMMDD(minDate!))}`);
        setInputValue(value ? formatDateDMY(value) : "");
      } else {
        const ymd = formatDateToYYYYMMDD(parsed);
        onChange(ymd);
        setInputValue(formatDateDMY(ymd));
      }
    } else {
      if (allowClear && !inputValue.trim()) {
        onChange("");
        setInputValue("");
      } else {
        setInputValue(value ? formatDateDMY(value) : "");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
      setOpen(false);
    } else if (e.key === "Escape") {
      setOpen(false);
      e.currentTarget.blur();
    }
  };

  return (
    <div ref={ref} className="relative w-full">
      <div className="relative flex items-center">
        <input
          type="text"
          disabled={disabled}
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
            if (selectedDate) {
              setViewDate(
                new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
              );
            }
            setOpen(true);
          }}
          className="input-primary w-full pr-10 text-[13px]"
        />
        {allowClear && value && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
              setInputValue("");
              setOpen(false);
            }}
            className="absolute right-10 flex h-6 w-6 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-white/35 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
          >
            <FiX className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((current) => !current)}
          className="absolute right-3 flex h-6 w-6 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-white/35 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
        >
          <FiCalendar className="h-4 w-4 shrink-0" />
        </button>
      </div>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={popupRef}
              style={popupPosition}
              className="fixed z-[100] overflow-hidden rounded-xl border border-gray-300 bg-white shadow-2xl dark:border-white/[0.08] dark:bg-[#0a0a0c]/98 dark:shadow-[0_24px_70px_rgba(0,0,0,0.85)] dark:backdrop-blur-xl"
            >
              <div
                className={`border-b border-gray-200 bg-gray-50/50 px-4 dark:border-white/[0.08] dark:bg-white/[0.02] ${compact ? "py-2.5" : "py-3"}`}
              >
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => moveMonth(-1)}
                    disabled={!canMovePrevious}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-gray-500 transition hover:border-gray-200 hover:bg-white hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-30 dark:text-white/45 dark:hover:border-white/10 dark:hover:bg-white/5 dark:hover:text-white"
                  >
                    <FiChevronLeft />
                  </button>

                  <div className="text-center">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                    </div>
                    <div className="mt-0.5 text-[11px] text-gray-500 dark:text-white/45 font-medium">
                      {selectedDate
                        ? `Đã chọn ${formatDate(value || "")}`
                        : "Chưa chọn ngày"}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => moveMonth(1)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-gray-500 transition hover:border-gray-200 hover:bg-white hover:text-gray-900 dark:text-white/45 dark:hover:border-white/10 dark:hover:bg-white/5 dark:hover:text-white"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>

              <div className={compact ? "p-3" : "p-4"}>
                {/* Weekdays Grid */}
                <div className="grid grid-cols-7 gap-px border border-gray-200 dark:border-white/[0.08] bg-gray-200 dark:bg-white/[0.08] rounded-t-lg overflow-hidden">
                  {WEEK_DAYS.map((day) => (
                    <div
                      key={day}
                      className={`flex items-center justify-center text-[11px] font-bold text-gray-500 dark:text-white/45 bg-gray-50 dark:bg-[#0d0d0f] ${compact ? "h-7" : "h-9"}`}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-px border-x border-b border-gray-200 dark:border-white/[0.08] bg-gray-200 dark:bg-white/[0.08] rounded-b-lg overflow-hidden">
                  {calendarDays.map(({ date, displayDay, inCurrentMonth }) => {
                    const dayTime = startOfDay(date).getTime();
                    const isSelected = selectedTime === dayTime;
                    const isToday = todayTime === dayTime;
                    const isDisabled =
                      !inCurrentMonth || (minTime !== null && dayTime < minTime);

                    return (
                      <button
                        key={`${date.getFullYear()}-${date.getMonth()}-${displayDay}`}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => selectDate(date)}
                        className={[
                          `relative flex flex-col items-center justify-center text-[12px] font-bold transition-all disabled:cursor-not-allowed ${compact ? "h-9" : "h-11"}`,
                          isSelected
                            ? "bg-primary text-white"
                            : isToday && !isDisabled
                              ? "bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/15 dark:text-primary dark:hover:bg-primary/25"
                              : isDisabled
                                ? "bg-gray-50/50 text-gray-300 dark:bg-white/[0.01] dark:text-white/10"
                                : inCurrentMonth
                                  ? "bg-white text-gray-800 hover:bg-gray-50 dark:bg-[#0c0c0e] dark:text-white/80 dark:hover:bg-white/5"
                                  : "bg-gray-50/30 text-gray-400/40 dark:bg-[#09090b]/50 dark:text-white/15",
                        ].join(" ")}
                      >
                        <span>{displayDay}</span>
                        {isToday && !isDisabled ? (
                          <span
                            className={[
                              "absolute bottom-1.5 h-1 w-1 rounded-full",
                              isSelected ? "bg-white" : "bg-primary",
                            ].join(" ")}
                          />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div
                className={`flex items-center justify-between border-t border-gray-200 bg-gray-50/85 px-4 dark:border-white/[0.08] dark:bg-white/[0.02] ${compact ? "py-2" : "py-3"}`}
              >
                <button
                  type="button"
                  onClick={selectToday}
                  disabled={minTime !== null && todayTime < minTime}
                  className="rounded-lg border border-transparent px-3 py-2 text-[12px] font-semibold text-gray-700 transition hover:border-gray-200 hover:bg-white hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-white/60 dark:hover:border-white/10 dark:hover:bg-[#0d0d0f]/20 dark:hover:text-white"
                >
                  Hôm nay
                </button>

                {allowClear ? (
                  <button
                    type="button"
                    onClick={() => {
                      onChange("");
                      setOpen(false);
                    }}
                    className="flex items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-[12px] font-semibold text-gray-500 transition hover:border-gray-200 hover:bg-white hover:text-gray-900 dark:text-white/40 dark:hover:border-white/10 dark:hover:bg-[#0d0d0f]/20 dark:hover:text-white"
                  >
                    <FiX />
                    Xóa ngày
                  </button>
                ) : null}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}



function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}
