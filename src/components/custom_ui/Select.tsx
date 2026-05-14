import { useEffect, useRef, useState } from "react";
import { HiChevronDown } from "react-icons/hi";

type Option = {
  label: string;
  value: string;
};

type GlassSelectProps = {
  value?: string;
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export default function GlassSelect({
  value,
  options,
  placeholder = "Chọn một giá trị",
  onChange,
  disabled = false,
}: GlassSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-gray-500 bg-white px-4 py-2 text-[13px] text-gray-800 transition hover:bg-gray-50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/3 dark:text-gray-200 dark:hover:bg-white/6"
      >
        <span className={selected ? "text-gray-900 dark:text-white" : "text-gray-600"}>
          {selected?.label ?? placeholder}
        </span>

        <HiChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-gray-500 bg-white shadow-xl dark:border-white/10 dark:bg-neutral-900/90 dark:shadow-[0_20px_40px_rgba(0,0,0,0.6)] dark:backdrop-blur-xl">
          <ul className="max-h-60 overflow-auto">
            {options.map((opt) => {
              const active = opt.value === value;

              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center px-4 py-2 text-[13px] transition ${
                      active
                        ? "bg-primary/10 text-primary dark:bg-primary/15"
                        : "text-gray-800 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
                    } `}
                  >
                    {opt.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
