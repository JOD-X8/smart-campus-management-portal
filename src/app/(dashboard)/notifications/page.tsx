"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from "@/store/api/apiSlice";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  CheckCheck,
  ArrowRight,
} from "lucide-react";

export default function NotificationsPage() {
  const { showToast } = useToast();
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");

  const { data, isLoading } = useGetNotificationsQuery(undefined);
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();

  const notifications = data?.data || [];
  const filtered =
    filter === "UNREAD" ? notifications.filter((n: any) => !n.isRead) : notifications;
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const handleMarkAll = async () => {
    try {
      await markAllRead().unwrap();
      showToast("Updated", "All notifications marked as read", "success");
    } catch {
      showToast("Error", "Failed to update notifications", "danger");
    }
  };

  const handleMarkSingle = async (id: string) => {
    try {
      await markRead(id).unwrap();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Notification Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            System alerts, assignment postings, attendance threshold warnings, and academic updates.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAll}
            isLoading={isMarkingAll}
            className="gap-1.5 self-start sm:self-auto"
          >
            <CheckCheck className="h-4 w-4" /> Mark All as Read
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={filter === "ALL" ? "primary" : "outline"}
          size="sm"
          onClick={() => setFilter("ALL")}
        >
          All ({notifications.length})
        </Button>
        <Button
          variant={filter === "UNREAD" ? "primary" : "outline"}
          size="sm"
          onClick={() => setFilter("UNREAD")}
        >
          Unread ({unreadCount})
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} columns={2} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No notifications"
          description={
            filter === "UNREAD"
              ? "You have read all your notifications."
              : "No notifications recorded in your feed."
          }
        />
      ) : (
        <Card className="p-0 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.map((item: any) => {
            const icons = {
              SUCCESS: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
              WARNING: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
              ALERT: <XCircle className="h-5 w-5 text-rose-500 shrink-0" />,
              INFO: <Info className="h-5 w-5 text-indigo-500 shrink-0" />,
            };

            const icon = icons[item.type as keyof typeof icons] || icons.INFO;

            return (
              <div
                key={item.id}
                className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                  !item.isRead ? "bg-indigo-50/30 dark:bg-indigo-950/20" : "bg-white dark:bg-slate-900"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5">{icon}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </h4>
                      {!item.isRead && (
                        <span className="h-2 w-2 rounded-full bg-indigo-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {item.message}
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-2">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.link && (
                    <Link href={item.link}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1 py-1 h-8"
                        onClick={() => handleMarkSingle(item.id)}
                      >
                        View <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  )}
                  {!item.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs py-1 h-8 text-slate-400 hover:text-slate-700"
                      onClick={() => handleMarkSingle(item.id)}
                    >
                      Dismiss
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
