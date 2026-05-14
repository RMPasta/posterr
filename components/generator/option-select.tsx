import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

type OptionSelectProps = {
  id: string;
  label: string;
  name: string;
  options: readonly Option[];
  defaultValue?: string;
  className?: string;
};

export function OptionSelect({
  id,
  label,
  name,
  options,
  defaultValue,
  className,
}: OptionSelectProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <label htmlFor={id} className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </label>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-sky-500/30 focus:border-sky-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
      {children}
    </label>
  );
}
