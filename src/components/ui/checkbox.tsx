import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="flex items-start gap-2.5">
        <input
          id={inputId}
          type="checkbox"
          ref={ref}
          className={cn(
            "h-4 w-4 mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 transition-colors cursor-pointer",
            className
          )}
          {...props}
        />
        {(label || description) && (
          <div className="text-sm">
            {label && (
              <label htmlFor={inputId} className="font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                {label}
              </label>
            )}
            {description && <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
