import type { ReactNode } from "react";

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1.5 block text-[11px] text-black/40 dark:text-white/40">
      {children}
    </label>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-5 text-sm font-medium text-[#111111] dark:text-white">
      {children}
    </h2>
  );
}

export function TextInput({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "url" | "date" | "number";
  required?: boolean;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      className="h-11 w-full rounded-lg border border-black/15 bg-white px-4 text-sm text-[#111111] transition-all outline-none placeholder:text-black/35 hover:border-black/25 hover:bg-white focus:border-black/35 dark:border-white/10 dark:bg-transparent dark:text-white dark:placeholder:text-white/25 dark:hover:border-white/20 dark:hover:bg-transparent dark:focus:border-white/30"
    />
  );
}

export function TextareaInput({
  id,
  value,
  onChange,
  placeholder,
  required,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      rows={3}
      className="w-full resize-none rounded-lg border border-black/15 bg-white px-4 py-2.5 text-sm text-[#111111] transition-all outline-none placeholder:text-black/35 hover:border-black/25 hover:bg-white focus:border-black/35 dark:border-white/10 dark:bg-transparent dark:text-white dark:placeholder:text-white/25 dark:hover:border-white/20 dark:hover:bg-transparent dark:focus:border-white/30"
    />
  );
}

