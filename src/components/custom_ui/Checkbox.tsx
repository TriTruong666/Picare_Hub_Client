import { LuCheck } from "react-icons/lu";
import clsx from "clsx";

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

export function Checkbox({
  checked,
  onChange,
  disabled = false,
  className,
}: CheckboxProps) {
  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      className={clsx(
        "flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded border transition-all duration-200",
        checked
          ? "border-primary bg-primary text-white"
          : "border-white/20 bg-white/5 hover:border-white/30",
        disabled && "pointer-events-none opacity-40",
        className,
      )}
    >
      {checked && <LuCheck size={14} strokeWidth={3} />}
    </div>
  );
}
