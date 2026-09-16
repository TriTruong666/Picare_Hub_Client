import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";

export interface AccordionItemData {
  id: string | number;
  title: React.ReactNode;
  content: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
}

export type AccordionVariant = "clean" | "bordered" | "card" | "minimal";

export interface AccordionProps {
  items?: AccordionItemData[];
  children?: React.ReactNode;
  allowMultiple?: boolean;
  defaultOpenIds?: (string | number)[];
  openIds?: (string | number)[];
  onOpenChange?: (openIds: (string | number)[]) => void;
  className?: string;
  itemClassName?: string;
  variant?: AccordionVariant;
}

interface AccordionContextType {
  openIds: (string | number)[];
  toggleItem: (id: string | number) => void;
  variant: AccordionVariant;
  itemClassName?: string;
}

const AccordionContext = React.createContext<AccordionContextType | null>(null);

const useAccordion = () => {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error("useAccordion must be used within an Accordion component");
  }
  return context;
};

export interface AccordionItemProps {
  id: string | number;
  title: React.ReactNode;
  children?: React.ReactNode;
  content?: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  id,
  title,
  children,
  content,
  subtitle,
  badge,
  disabled = false,
  className = "",
}) => {
  const { openIds, toggleItem, variant, itemClassName } = useAccordion();
  const isOpen = openIds.includes(id);

  const displayContent = content ?? children;

  // Variants styling
  const variantWrapperClasses: Record<AccordionVariant, string> = {
    clean: "border-b border-neutral-200/85 last:border-b-0",
    bordered:
      "border border-neutral-200/85 rounded-xl px-5 transition-colors duration-200 hover:border-neutral-300",
    card: "rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-5 shadow-[0_1px_4px_rgba(0,0,0,0.02)] transition-all duration-200 hover:bg-neutral-50 hover:border-neutral-300/90",
    minimal: "border-b border-neutral-200/50 last:border-b-0",
  };

  return (
    <div
      className={`font-haffer group transition-colors duration-200 ${variantWrapperClasses[variant]} ${itemClassName ?? ""} ${className}`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && toggleItem(id)}
        aria-expanded={isOpen}
        className={`flex w-full items-center justify-between gap-4 py-5 text-left transition-colors select-none ${
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        }`}
      >
        <div className="flex flex-1 flex-col pr-2">
          <div className="flex items-center gap-2.5">
            <span
              className={`text-[15.5px] font-medium leading-snug transition-colors sm:text-[17px] ${
                isOpen
                  ? "text-neutral-950 font-semibold"
                  : "text-neutral-800 group-hover:text-black"
              }`}
            >
              {title}
            </span>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>

          {subtitle && (
            <p className="mt-1 text-xs text-neutral-400 sm:text-[13px]">
              {subtitle}
            </p>
          )}
        </div>

        {/* Circular Chevron Button Indicator */}
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
            isOpen
              ? "bg-neutral-900 text-white shadow-sm"
              : "bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200/70 group-hover:text-neutral-800"
          }`}
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <FiChevronDown className="h-4 w-4" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key={`accordion-content-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-5 pt-1 text-[14px] leading-relaxed font-normal text-neutral-600 sm:text-[15px]">
              {displayContent}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Accordion: React.FC<AccordionProps> = ({
  items,
  children,
  allowMultiple = false,
  defaultOpenIds = [],
  openIds: controlledOpenIds,
  onOpenChange,
  className = "",
  itemClassName = "",
  variant = "clean",
}) => {
  const [internalOpenIds, setInternalOpenIds] =
    useState<(string | number)[]>(defaultOpenIds);

  const isControlled = controlledOpenIds !== undefined;
  const currentOpenIds = isControlled ? controlledOpenIds : internalOpenIds;

  const toggleItem = useCallback(
    (id: string | number) => {
      let nextOpenIds: (string | number)[];

      if (currentOpenIds.includes(id)) {
        nextOpenIds = currentOpenIds.filter((item) => item !== id);
      } else {
        nextOpenIds = allowMultiple ? [...currentOpenIds, id] : [id];
      }

      if (!isControlled) {
        setInternalOpenIds(nextOpenIds);
      }

      onOpenChange?.(nextOpenIds);
    },
    [allowMultiple, currentOpenIds, isControlled, onOpenChange]
  );

  return (
    <AccordionContext.Provider
      value={{
        openIds: currentOpenIds,
        toggleItem,
        variant,
        itemClassName,
      }}
    >
      <div
        className={`flex flex-col ${
          variant === "bordered" || variant === "card"
            ? "space-y-3.5"
            : "divide-y divide-neutral-200/85"
        } ${className}`}
      >
        {items
          ? items.map((item) => (
              <AccordionItem
                key={item.id}
                id={item.id}
                title={item.title}
                subtitle={item.subtitle}
                content={item.content}
                badge={item.badge}
                disabled={item.disabled}
              />
            ))
          : children}
      </div>
    </AccordionContext.Provider>
  );
};

export default Accordion;
