import type {
  ReactNode,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";
import clsx from "clsx";

type TableHeaderProps = ThHTMLAttributes<HTMLTableCellElement> & {
  children: ReactNode;
  isLast?: boolean;
};

type TableCellProps = TdHTMLAttributes<HTMLTableCellElement> & {
  children: ReactNode;
  isLast?: boolean;
  verticalAlign?: "top" | "middle" | "bottom";
};

const verticalAlignClass = {
  top: "align-top",
  middle: "align-middle",
  bottom: "align-bottom",
};

/** Standard dashboard table header cell. */
export function Th({
  children,
  className,
  isLast = false,
  ...props
}: TableHeaderProps) {
  return (
    <th
      className={clsx(
        "border-b border-gray-400 p-4 text-xs font-semibold text-gray-600 uppercase dark:border-white/10 dark:text-gray-400",
        !isLast && "border-r border-gray-400 dark:border-white/10",
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

/** Standard dashboard table data cell. */
export function Td({
  children,
  className,
  isLast = false,
  verticalAlign = "top",
  ...props
}: TableCellProps) {
  return (
    <td
      className={clsx(
        "p-3.5",
        verticalAlignClass[verticalAlign],
        !isLast && "border-r border-gray-400 dark:border-white/10",
        className,
      )}
      {...props}
    >
      {children}
    </td>
  );
}
