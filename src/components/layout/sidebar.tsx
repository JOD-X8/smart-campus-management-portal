"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleSidebar, setMobileSidebarOpen } from "@/store/slices/uiSlice";
import { cn } from "@/lib/utils";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  UserCheck,
  BookOpen,
  Building2,
  CalendarCheck,
  Award,
  Calendar,
  FileText,
  Bell,
  Megaphone,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Role } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  allowedRoles: Role[];
  badge?: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { isSidebarCollapsed, isMobileSidebarOpen } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);

  const role = user?.role || "STUDENT";

  const getDashboardHref = () => {
    if (role === "ADMIN") return "/admin";
    if (role === "FACULTY") return "/faculty";
    return "/student";
  };

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: getDashboardHref(),
      icon: <LayoutDashboard className="h-5 w-5 shrink-0" />,
      allowedRoles: ["ADMIN", "FACULTY", "STUDENT"],
    },
    {
      label: "Students",
      href: "/students",
      icon: <Users className="h-5 w-5 shrink-0" />,
      allowedRoles: ["ADMIN", "FACULTY"],
    },
    {
      label: "Faculty",
      href: "/faculty-dir",
      icon: <UserCheck className="h-5 w-5 shrink-0" />,
      allowedRoles: ["ADMIN", "FACULTY", "STUDENT"],
    },
    {
      label: "Courses",
      href: "/courses",
      icon: <BookOpen className="h-5 w-5 shrink-0" />,
      allowedRoles: ["ADMIN", "FACULTY", "STUDENT"],
    },
    {
      label: "Departments",
      href: "/departments",
      icon: <Building2 className="h-5 w-5 shrink-0" />,
      allowedRoles: ["ADMIN", "FACULTY", "STUDENT"],
    },
    {
      label: "Attendance",
      href: "/attendance",
      icon: <CalendarCheck className="h-5 w-5 shrink-0" />,
      allowedRoles: ["ADMIN", "FACULTY", "STUDENT"],
    },
    {
      label: "Grades & Marks",
      href: "/grades",
      icon: <Award className="h-5 w-5 shrink-0" />,
      allowedRoles: ["ADMIN", "FACULTY", "STUDENT"],
    },
    {
      label: "Timetable",
      href: "/timetable",
      icon: <Calendar className="h-5 w-5 shrink-0" />,
      allowedRoles: ["ADMIN", "FACULTY", "STUDENT"],
    },
    {
      label: "Assignments",
      href: "/assignments",
      icon: <FileText className="h-5 w-5 shrink-0" />,
      allowedRoles: ["ADMIN", "FACULTY", "STUDENT"],
    },
    {
      label: "Announcements",
      href: "/announcements",
      icon: <Megaphone className="h-5 w-5 shrink-0" />,
      allowedRoles: ["ADMIN", "FACULTY", "STUDENT"],
    },
    {
      label: "Notifications",
      href: "/notifications",
      icon: <Bell className="h-5 w-5 shrink-0" />,
      allowedRoles: ["ADMIN", "FACULTY", "STUDENT"],
    },
    {
      label: "AI Assistant",
      href: "/ai-assistant",
      icon: <Sparkles className="h-5 w-5 shrink-0 text-amber-500 animate-pulse" />,
      allowedRoles: ["ADMIN", "FACULTY", "STUDENT"],
      badge: "AI",
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5 shrink-0" />,
      allowedRoles: ["ADMIN", "FACULTY", "STUDENT"],
    },
  ];

  const filteredNavItems = navItems.filter((item) => item.allowedRoles.includes(role));

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between">
      {/* Brand Header */}
      <div>
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
          <Link href={getDashboardHref()} className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-md">
              <GraduationCap className="h-5 w-5" />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col overflow-hidden transition-opacity">
                <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate">
                  SmartCampus
                </span>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                  Academic Portal
                </span>
              </div>
            )}
          </Link>

          {/* Mobile close button */}
          <button
            onClick={() => dispatch(setMobileSidebarOpen(false))}
            className="md:hidden p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-10rem)] scrollbar-none">
          {filteredNavItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => dispatch(setMobileSidebarOpen(false))}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all group",
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-950/60 dark:text-indigo-300 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
                )}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <div
                  className={cn(
                    "transition-colors",
                    isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-slate-600 dark:text-slate-400"
                  )}
                >
                  {item.icon}
                </div>
                {!isSidebarCollapsed && (
                  <span className="flex-1 truncate">{item.label}</span>
                )}
                {!isSidebarCollapsed && item.badge && (
                  <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-950/80 dark:text-amber-300">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Role profile & Collapse button */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        {!isSidebarCollapsed && user && (
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
            <div className="h-7 w-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs font-bold shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate uppercase">{user.role}</p>
            </div>
          </div>
        )}

        {/* Desktop sidebar collapse toggle */}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="hidden md:flex w-full items-center justify-center gap-2 rounded-lg p-2 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse Menu</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 transition-all duration-300 z-30 shrink-0",
          isSidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => dispatch(setMobileSidebarOpen(false))}
          />
          <div className="relative w-72 max-w-[85%] bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
