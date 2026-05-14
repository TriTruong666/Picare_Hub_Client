type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
};

export function Toggle({ checked, onChange, className }: ToggleProps) {
  return (
    <label className={`relative inline-flex cursor-pointer items-center ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <div className="relative h-5 w-9 rounded-full border border-gray-300 bg-gray-200 transition-colors after:absolute after:top-1 after:left-1 after:h-3 after:w-3 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:border-[#de3c3c] peer-checked:bg-[#de3c3c] peer-checked:after:translate-x-4 dark:border-white/10 dark:bg-white/10 dark:peer-checked:border-[#de3c3c] dark:peer-checked:bg-[#de3c3c]" />
  </label>
  );
}
