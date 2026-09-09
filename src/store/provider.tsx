"use client";

import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./index";
import { ToastProvider } from "@/components/ui/toast";
import { setUser } from "./slices/authSlice";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Check if user session exists in local storage / session cookie
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data?.success && data?.data) {
          store.dispatch(setUser(data.data));
        } else {
          store.dispatch(setUser(null));
        }
      })
      .catch(() => {
        store.dispatch(setUser(null));
      });
  }, []);

  return <>{children}</>;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ToastProvider>
        <AuthInitializer>{children}</AuthInitializer>
      </ToastProvider>
    </Provider>
  );
}
