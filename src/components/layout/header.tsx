"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleMobileSidebar, toggleSearchModal, toggleTheme } from "@/store/slices/uiSlice";
import { logoutUser } from "@/store/slices/authSlice";
import {
  Menu,
  Search,
  Sun,
  Moon,
  Bell,
  LogOut,
  User,
  Settings,
  Sparkles,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { Dropdown } from "@/components/ui/dropdown";
import { useToast } from "@/components/ui/toast";
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
} from "@/store/api/apiSlice";

export function Header() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);
  const { showToast } = useToast();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { data: notificationsData } = useGetNotificationsQuery(undefined, {
    pollingInterval: 30000,
  });
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  const notifications = notificationsData?.data || [];
  const unreadCount = notifications.filter((n: { isRead: boolean }) => !n.isRead).length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        dispatch(toggleSearchModal());
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      dispatch(logoutUser());
      showToast("Logged Out", "You have been signed out safely", "info");
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead().unwrap();
      showToast("Notifications", "All marked as read", "success");
    } catch (e) {
      console.error(e);
    }
  };

  const userMenuItems = [
    {
      id: "profile",
      label: "My Profile",
      icon: <User className="h-4 w-4" />,
      onClick: () => router.push("/settings"),
    },
    {
      id: "ai-assistant",
      label: "AI Academic Assistant",
      icon: <Sparkles className="h-4 w-4 text-amber-500" />,
      onClick: () => router.push("/ai-assistant"),
    },
    {
      id: "settings",
      label: "Account Settings",
      icon: <Settings className="h-4 w-4" />,
      onClick: () => router.push("/settings"),
    },
    {
      id: "logout",
      label: "Sign Out",
      icon: <LogOut className="h-4 w-4 text-rose-500" />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={() => dispatch(toggleMobileSidebar())}
          className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Open sidebar navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Search trigger */}
        <button
          onClick={() => dispatch(toggleSearchModal())}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-800 transition-all sm:w-64"
        >
          <Search className="h-4 w-4 text-slate-400" />
          <span className="flex-1 text-left truncate">Search campus portal...</span>
          <kbd className="hidden sm:inline-flex items-center rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsNotificationsOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white p-4 shadow-elevated border border-slate-200 dark:bg-slate-900 dark:border-slate-800 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Notifications
                    </h4>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium dark:text-indigo-400 flex items-center gap-1"
                    >
                      <CheckCircle2 className="h-3 w-3" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 py-1">
                  {notifications.length === 0 ? (
                    <p className="py-6 text-center text-xs text-slate-500">
                      No notifications right now.
                    </p>
                  ) : (
                    notifications.slice(0, 6).map((item: any) => (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-lg transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                          !item.isRead ? "bg-indigo-50/40 dark:bg-indigo-950/20" : ""
                        }`}
                        onClick={() => {
                          if (item.link) router.push(item.link);
                          setIsNotificationsOpen(false);
                        }}
                      >
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                          {item.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      router.push("/notifications");
                      setIsNotificationsOpen(false);
                    }}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile Menu */}
        <Dropdown
          align="right"
          trigger={
            <div className="flex items-center gap-2.5 rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                {user?.name ? user.name.charAt(0) : "U"}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                  {user?.name || "User"}
                </span>
                <span className="text-[10px] text-slate-400 font-medium uppercase leading-tight">
                  {user?.role || "GUEST"}
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
            </div>
          }
          items={userMenuItems}
        />
      </div>
    </header>
  );
}
