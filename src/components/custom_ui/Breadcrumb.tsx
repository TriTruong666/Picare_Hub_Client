import { Link } from "react-router-dom";

type BreadcrumbChildProps = {
  label: string;
  path?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbChildProps[];
};

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-400 dark:font-medium">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-2">
            {item.path && !isLast ? (
              <Link
                to={item.path}
                className="text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 dark:text-white">{item.label}</span>
            )}

            {!isLast && (
              <span className="text-gray-400 dark:text-gray-600">/</span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
