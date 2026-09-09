"use client";

import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTheme } from "@/store/slices/uiSlice";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  User,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Shield,
  BellRing,
  KeyRound,
  CheckCircle2,
} from "lucide-react";

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { theme } = useAppSelector((state) => state.ui);
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || "Campus User");
  const [email] = useState(user?.email || "user@campus.edu");

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Profile Updated", "Display preferences saved", "success");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Account &amp; System Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your account profile, UI theme settings, and security credentials.
        </p>
      </div>

      {/* User Profile Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" /> Personal Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xl shadow-md">
                {user?.name ? user.name.charAt(0) : "U"}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  {user?.name}
                </h3>
                <p className="text-xs text-slate-400">{user?.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="primary" size="sm">
                    {user?.role} ACCOUNT
                  </Badge>
                  <Badge variant="success" size="sm">
                    ACTIVE STATUS
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Display Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Registered Email (Primary)"
                value={email}
                disabled
                helperText="Email is bound to academic registrar credentials"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" size="sm">
                Update Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Interface & Theme Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" /> Visual Appearance &amp; Theme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select your preferred appearance mode for the campus portal.
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-sm">
              <button
                type="button"
                onClick={() => {
                  dispatch(setTheme("light"));
                  showToast("Theme Changed", "Light mode activated", "info");
                }}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  theme === "light"
                    ? "border-indigo-600 bg-indigo-50/40 text-indigo-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                }`}
              >
                <Sun className="h-6 w-6" />
                <span className="text-xs font-semibold">Light Mode</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  dispatch(setTheme("dark"));
                  showToast("Theme Changed", "Dark mode activated", "info");
                }}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  theme === "dark"
                    ? "border-indigo-500 bg-indigo-950/40 text-indigo-300 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                }`}
              >
                <Moon className="h-6 w-6" />
                <span className="text-xs font-semibold">Dark Mode</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security & Access Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-indigo-600" /> Security &amp; Session Telemetry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Password Encryption
                </p>
                <p className="text-slate-400">Bcrypt Salted Hash (10 Rounds)</p>
              </div>
              <Badge variant="success">Enabled</Badge>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Session Token Architecture
                </p>
                <p className="text-slate-400">HTTP-Only Signed Jose JWT Cookies</p>
              </div>
              <Badge variant="success">Secure</Badge>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Attendance Warning Threshold
                </p>
                <p className="text-slate-400">Automated warning triggered below 75% attendance</p>
              </div>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">75% Threshold</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
