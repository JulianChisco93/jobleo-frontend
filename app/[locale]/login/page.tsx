"use client";

import { useState, Suspense } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { getCV } from "@/lib/api";
import { Link } from "@/i18n/navigation";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const urlMsg = searchParams.get("msg");

  const [tab, setTab] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function handleLogin(data: LoginFormData) {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (err) throw err;

      try {
        const cv = await getCV();
        router.push(cv ? "/dashboard" : "/onboarding");
      } catch {
        router.push("/onboarding");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(data: RegisterFormData) {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { display_name: data.name } },
      });
      if (err) throw err;
      router.push("/onboarding");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  const displayError =
    error ||
    (urlError === "auth"
      ? urlMsg
        ? decodeURIComponent(urlMsg)
        : "Authentication failed. Please try again."
      : null);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg-page">
      {/* Back to home */}
      <div className="w-full max-w-md mb-4 px-1">
        <Link
          href="/"
          className="text-xs font-mono text-text-muted hover:text-text-primary transition-colors"
        >
          ← {t("backToHome")}
        </Link>
      </div>

      <div
        className="flex flex-col gap-8 p-12 bg-bg-card w-full max-w-md"
        style={{ border: "2px solid #000000" }}
      >
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-widest font-heading text-text-primary">
            JOBLEO
          </h1>
          <p className="text-2xl font-bold font-heading text-text-primary mt-3">
            {tab === "login" ? t("welcomeBack") : t("createAccountTitle")}
          </p>
          <p className="text-sm font-heading text-text-secondary mt-1">
            {tab === "login" ? t("signInSubtitle") : t("createAccountSubtitle")}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex" style={{ borderBottom: "2px solid #000000" }}>
          <button
            onClick={() => setTab("login")}
            className="flex-1 py-2.5 text-sm font-bold font-heading transition-colors"
            style={{
              borderBottom: tab === "login" ? "2px solid #000000" : "none",
              color: tab === "login" ? "#000000" : "#777777",
              marginBottom: tab === "login" ? "-2px" : "0",
            }}
          >
            {t("loginTab")}
          </button>
          <button
            onClick={() => setTab("register")}
            className="flex-1 py-2.5 text-sm font-bold font-heading transition-colors"
            style={{
              borderBottom: tab === "register" ? "2px solid #000000" : "none",
              color: tab === "register" ? "#000000" : "#777777",
              marginBottom: tab === "register" ? "-2px" : "0",
            }}
          >
            {t("registerTab")}
          </button>
        </div>

        {/* Error */}
        {displayError && (
          <div
            className="px-4 py-3 text-sm font-heading"
            style={{ backgroundColor: "#ffebee", color: "#E53935", border: "1px solid #ffcdd2" }}
          >
            {displayError}
          </div>
        )}

        {/* Login Form */}
        {tab === "login" && (
          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold tracking-wider font-mono text-text-secondary uppercase">
                {t("emailLabel")}
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder={t("emailPlaceholder")}
                {...loginForm.register("email")}
                className="h-11 px-4 border-2 border-border-color bg-bg-card text-sm font-heading text-text-primary placeholder:text-text-muted outline-none focus:border-accent-blue"
              />
              {loginForm.formState.errors.email && (
                <span className="text-xs font-heading" style={{ color: "#E53935" }}>
                  {loginForm.formState.errors.email.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold tracking-wider font-mono text-text-secondary uppercase">
                {t("passwordLabel")}
              </label>
              <input
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...loginForm.register("password")}
                className="w-full h-11 px-4 border-2 border-border-color bg-bg-card text-sm font-heading text-text-primary placeholder:text-text-muted outline-none focus:border-accent-blue"
              />
              {loginForm.formState.errors.password && (
                <span className="text-xs font-heading" style={{ color: "#E53935" }}>
                  {loginForm.formState.errors.password.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-bold font-heading text-text-on-dark bg-accent-red border-2 border-border-color hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? "..." : t("signIn")}
            </button>
          </form>
        )}

        {/* Register Form */}
        {tab === "register" && (
          <form onSubmit={registerForm.handleSubmit(handleRegister)} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold tracking-wider font-mono text-text-secondary uppercase">
                {t("nameLabel")}
              </label>
              <input
                type="text"
                autoComplete="name"
                placeholder={t("namePlaceholder")}
                {...registerForm.register("name")}
                className="h-11 px-4 border-2 border-border-color bg-bg-card text-sm font-heading text-text-primary placeholder:text-text-muted outline-none focus:border-accent-blue"
              />
              {registerForm.formState.errors.name && (
                <span className="text-xs font-heading" style={{ color: "#E53935" }}>
                  {registerForm.formState.errors.name.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold tracking-wider font-mono text-text-secondary uppercase">
                {t("emailLabel")}
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder={t("emailPlaceholder")}
                {...registerForm.register("email")}
                className="h-11 px-4 border-2 border-border-color bg-bg-card text-sm font-heading text-text-primary placeholder:text-text-muted outline-none focus:border-accent-blue"
              />
              {registerForm.formState.errors.email && (
                <span className="text-xs font-heading" style={{ color: "#E53935" }}>
                  {registerForm.formState.errors.email.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold tracking-wider font-mono text-text-secondary uppercase">
                {t("passwordLabel")}
              </label>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                {...registerForm.register("password")}
                className="h-11 px-4 border-2 border-border-color bg-bg-card text-sm font-heading text-text-primary placeholder:text-text-muted outline-none focus:border-accent-blue"
              />
              {registerForm.formState.errors.password && (
                <span className="text-xs font-heading" style={{ color: "#E53935" }}>
                  {registerForm.formState.errors.password.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-bold font-heading text-text-on-dark bg-accent-red border-2 border-border-color hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? "..." : t("createAccount")}
            </button>
          </form>
        )}

        {/* Divider + Google */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border-light" />
            <span className="text-xs font-mono text-text-muted">{t("orContinueWith")}</span>
            <div className="flex-1 h-px bg-border-light" />
          </div>
          <button
            onClick={handleGoogle}
            className="w-full py-3 flex items-center justify-center gap-3 text-sm font-bold font-heading text-text-primary bg-bg-card border-2 border-border-color hover:bg-bg-page transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {t("continueWithGoogle")}
          </button>
        </div>

        <p className="text-xs text-center font-heading text-text-muted">
          {t("termsNotice")}
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
