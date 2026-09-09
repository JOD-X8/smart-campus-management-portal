"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/schemas/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import {
  GraduationCap,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  UserCheck,
  BookOpen,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@campus.edu",
      password: "Admin@123",
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setAuthError(json.error || "Authentication failed. Please verify your credentials.");
        setIsLoading(false);
        return;
      }

      dispatch(setUser(json.data));
      showToast("Welcome back!", `Signed in as ${json.data.name}`, "success");

      // Role-based redirection
      if (json.data.role === "ADMIN") {
        router.push("/admin");
      } else if (json.data.role === "FACULTY") {
        router.push("/faculty");
      } else {
        router.push("/student");
      }
      router.refresh();
    } catch {
      setAuthError("Network connection error. Please try again.");
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (email: string, pass: string) => {
    setValue("email", email, { shouldValidate: true });
    setValue("password", pass, { shouldValidate: true });
    setAuthError(null);
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-100 py-12 sm:px-6 lg:px-8 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/20">
          <GraduationCap className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          Smart Campus Portal
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Unified academic ERP &amp; university information management system
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="rounded-2xl bg-white px-6 py-8 shadow-xl shadow-slate-200/50 border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 dark:shadow-none sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {authError && (
              <Alert variant="danger" title="Sign In Error">
                {authError}
              </Alert>
            )}

            <div>
              <Input
                label="Email Address"
                type="email"
                placeholder="name@campus.edu"
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                required
                {...register("email")}
              />
            </div>

            <div>
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  leftIcon={<Lock className="h-4 w-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  error={errors.password?.message}
                  required
                  {...register("password")}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <Checkbox label="Remember me" {...register("rememberMe")} />
              <button
                type="button"
                onClick={() =>
                  showToast(
                    "Password Reset",
                    "For academic credentials reset, please contact your university IT registrar office.",
                    "info"
                  )
                }
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
              Sign In to Portal
            </Button>
          </form>

          {/* Quick Demo Credentials Switcher */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <p className="text-center text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
              One-Click Demo Accounts
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemoCredentials("admin@campus.edu", "Admin@123")}
                className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 transition-all text-center"
              >
                <ShieldCheck className="h-4 w-4 text-indigo-600 mb-1" />
                <span className="text-[11px] font-bold">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoCredentials("alan.turing@campus.edu", "Faculty@123")}
                className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 transition-all text-center"
              >
                <UserCheck className="h-4 w-4 text-indigo-600 mb-1" />
                <span className="text-[11px] font-bold">Faculty</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoCredentials("alex.chen@campus.edu", "Student@123")}
                className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 transition-all text-center"
              >
                <BookOpen className="h-4 w-4 text-indigo-600 mb-1" />
                <span className="text-[11px] font-bold">Student</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
