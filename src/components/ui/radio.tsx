import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  selectedValue?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  className?: string;
}

export function RadioGroup({
  name,
  options,
  selectedValue,
  onChange,
  label,
  error,
  className,
}: RadioGroupProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>}
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50",
              selectedValue === option.value && "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20"
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={selectedValue === option.value}
              onChange={(e) => onChange?.(e.target.value)}
              className="h-4 w-4 mt-0.5 text-indigo-600 focus:ring-indigo-500/20"
            />
            <div className="text-sm">
              <span className="font-medium text-slate-800 dark:text-slate-200">{option.label}</span>
              {option.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{option.description}</p>
              )}
            </div>
          </label>
        ))}
      </div>
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}
