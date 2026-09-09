"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSearchModalOpen } from "@/store/slices/uiSlice";
import { useLazyGlobalSearchQuery } from "@/store/api/apiSlice";
import { Search, X, Users, UserCheck, BookOpen, Megaphone, ArrowRight, Loader2 } from "lucide-react";

export function SearchModal() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isSearchModalOpen } = useAppSelector((state) => state.ui);

  const [query, setQuery] = useState("");
  const [triggerSearch, { data, isFetching }] = useLazyGlobalSearchQuery();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        triggerSearch(query.trim());
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, triggerSearch]);

  const handleClose = useCallback(() => {
    dispatch(setSearchModalOpen(false));
    setQuery("");
  }, [dispatch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    if (isSearchModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchModalOpen, handleClose]);

  if (!isSearchModalOpen) return null;

  const results = data?.data || { students: [], faculty: [], courses: [], announcements: [] };
  const totalResults =
    (results.students?.length || 0) +
    (results.faculty?.length || 0) +
    (results.courses?.length || 0) +
    (results.announcements?.length || 0);

  const handleNavigate = (path: string) => {
    handleClose();
    router.push(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:pt-20">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 dark:border-slate-800 dark:bg-slate-900 overflow-hidden z-10">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <Search className="h-5 w-5 text-slate-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students, faculty, courses, announcements..."
            autoFocus
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
          />
          {isFetching ? (
            <Loader2 className="h-4 w-4 animate-spin text-indigo-500 mr-2" />
          ) : query ? (
            <button onClick={() => setQuery("")} className="text-slate-400 hover:text-slate-600 mr-2">
              <X className="h-4 w-4" />
            </button>
          ) : null}
          <kbd className="hidden sm:inline-block rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {query.trim().length < 2 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Type at least 2 characters to search across the campus database.
            </div>
          ) : totalResults === 0 && !isFetching ? (
            <div className="py-8 text-center text-sm text-slate-500">
              No results found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <>
              {/* Students */}
              {results.students?.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" /> Students
                  </h4>
                  <div className="space-y-1">
                    {results.students.map((s: any) => (
                      <div
                        key={s.id}
                        onClick={() => handleNavigate(`/students?search=${s.studentId}`)}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs"
                      >
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {s.user.firstName} {s.user.lastName} ({s.studentId})
                        </span>
                        <span className="text-slate-400 flex items-center gap-1">
                          {s.program} <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Faculty */}
              {results.faculty?.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5" /> Faculty
                  </h4>
                  <div className="space-y-1">
                    {results.faculty.map((f: any) => (
                      <div
                        key={f.id}
                        onClick={() => handleNavigate(`/faculty-dir?search=${f.facultyId}`)}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs"
                      >
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {f.user.firstName} {f.user.lastName} ({f.facultyId})
                        </span>
                        <span className="text-slate-400 flex items-center gap-1">
                          {f.designation} <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Courses */}
              {results.courses?.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" /> Courses
                  </h4>
                  <div className="space-y-1">
                    {results.courses.map((c: any) => (
                      <div
                        key={c.id}
                        onClick={() => handleNavigate(`/courses?search=${c.code}`)}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs"
                      >
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {c.code} · {c.name}
                        </span>
                        <span className="text-slate-400 flex items-center gap-1">
                          {c.credits} Credits <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Announcements */}
              {results.announcements?.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Megaphone className="h-3.5 w-3.5" /> Announcements
                  </h4>
                  <div className="space-y-1">
                    {results.announcements.map((a: any) => (
                      <div
                        key={a.id}
                        onClick={() => handleNavigate("/announcements")}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs"
                      >
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-sm">
                          {a.title}
                        </span>
                        <span className="text-slate-400 flex items-center gap-1">
                          View <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
