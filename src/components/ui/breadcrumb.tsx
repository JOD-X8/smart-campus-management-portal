import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center text-xs text-slate-500 dark:text-slate-400", className)}>
      <ol className="flex items-center space-x-1.5">
        <li>
          <Link href="/" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center">
            <Home className="h-3.5 w-3.5" />
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={index}>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <li>
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors font-medium"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className={cn("font-medium", isLast ? "text-slate-900 dark:text-slate-100" : "")}>
                    {item.label}
                  </span>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
