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
import { LangToggle } from "@/components/ui/LangToggle";

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

function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const urlMsg = searchParams.get("msg");

  const [tab, setTab] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const loginForm = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  function handleTabChange(newTab: "login" | "register") {
    setTab(newTab);
    setError(null);
    setSuccess(null);
    setShowForgotPassword(false);
  }

  async function handleLogin(data: LoginFormData) {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
      if (err) throw err;
      try {
        const cv = await getCV();
        router.push(cv ? "/dashboard" : "/onboarding");
      } catch {
        router.push("/onboarding");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : typeof err === "string" ? err : t("loginFailed");
      setError(message || t("loginFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(data: RegisterFormData) {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const supabase = createClient();
      const { data: signUpData, error: err } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { display_name: data.name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (err) throw err;
      if (signUpData?.user && !signUpData.session) {
        setSuccess(t("checkEmailSuccess"));
        return;
      }
      router.push("/onboarding");
    } catch (err: unknown) {
      let message: string;
      if (err instanceof Error) message = err.message;
      else if (typeof err === "object" && err !== null && "message" in err) message = String((err as { message: unknown }).message);
      else if (typeof err === "string") message = err;
      else message = t("registrationFailed");
      setError(message || t("registrationFailed"));
    } finally {
      setLoading(false);
    }
  }

  function handleGoogle() {
    setLoading(true);
    setError(null);
    // Use server-side OAuth initiation so the code_verifier is set
    // in the response cookies (more reliable than document.cookie on first visit)
    window.location.href = "/auth/login";
  }

  async function handleForgotPassword() {
    if (!forgotEmail) { setError(t("forgotPasswordEmailRequired")); return; }
    setForgotLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });
      if (err) throw err;
      setSuccess(t("forgotPasswordSuccess"));
      setShowForgotPassword(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("forgotPasswordFailed"));
    } finally {
      setForgotLoading(false);
    }
  }

  const displayError =
    error ||
    (urlError === "pkce" ? t("pkceError") : null) ||
    (urlError === "auth" ? (urlMsg ? decodeURIComponent(urlMsg) : "Authentication failed. Please try again.") : null);

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/10">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <Link href="/" className="text-2xl font-extrabold tracking-tight text-primary font-display">
            Jobleo
          </Link>
          <LangToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex items-center justify-center px-6 pt-28 pb-12">
        <div className="w-full max-w-md">
          {/* Heading */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-on-surface font-display tracking-tight mb-2">
              {tab === "login" ? t("welcomeBack") : t("createAccountTitle")}
            </h1>
            <p className="text-on-surface-variant">
              {tab === "login" ? t("signInSubtitle") : t("createAccountSubtitle")}
            </p>
          </div>

          {/* Auth card */}
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[var(--shadow-ambient)] border border-outline-variant/10">
            {/* Tab toggle */}
            <div className="flex mb-8 bg-surface-container-low p-1 rounded-xl">
              <button
                onClick={() => handleTabChange("login")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  tab === "login"
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {t("loginTab")}
              </button>
              <button
                onClick={() => handleTabChange("register")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  tab === "register"
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {t("registerTab")}
              </button>
            </div>

            {/* Error banner */}
            {displayError && (
              <div className="mb-6 px-4 py-3 rounded-xl bg-error-container text-on-error-container text-sm font-medium">
                {displayError}
              </div>
            )}

            {/* Success banner */}
            {success && (
              <div className="mb-6 px-4 py-3 rounded-xl bg-secondary-container text-on-secondary-container text-sm font-medium">
                {success}
              </div>
            )}

            {/* Google login */}
            {!showForgotPassword && (
              <>
                <button
                  onClick={handleGoogle}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-surface border border-outline-variant hover:bg-surface-container-low transition-colors mb-6"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="text-on-surface font-semibold text-sm">{t("continueWithGoogle")}</span>
                </button>

                <div className="relative mb-6 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-outline-variant/30" />
                  </div>
                  <span className="relative px-4 bg-surface-container-lowest text-xs font-bold text-outline uppercase tracking-widest">
                    {t("orContinueWith")}
                  </span>
                </div>
              </>
            )}

            {/* Login form */}
            {tab === "login" && !showForgotPassword && (
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 px-1">
                    {t("emailLabel")}
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder={t("emailPlaceholder")}
                    {...loginForm.register("email")}
                    className="w-full px-4 py-3 rounded-xl bg-surface-container-low border-transparent focus:border-primary focus:bg-surface-container-lowest focus:ring-0 transition-all text-sm"
                  />
                  {loginForm.formState.errors.email && (
                    <span className="text-xs text-error mt-1 block">{loginForm.formState.errors.email.message}</span>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2 px-1">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      {t("passwordLabel")}
                    </label>
                    <button
                      type="button"
                      onClick={() => { setError(null); setSuccess(null); setShowForgotPassword(true); }}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      {t("forgotPassword")}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      {...loginForm.register("password")}
                      className="w-full px-4 py-3 rounded-xl bg-surface-container-low border-transparent focus:border-primary focus:bg-surface-container-lowest focus:ring-0 transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                      tabIndex={-1}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showLoginPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <span className="text-xs text-error mt-1 block">{loginForm.formState.errors.password.message}</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-xl bg-primary-gradient text-on-primary font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? <><Spinner />{t("signingIn")}</> : t("signIn")}
                </button>
              </form>
            )}

            {/* Forgot password */}
            {tab === "login" && showForgotPassword && (
              <div className="space-y-5">
                <p className="text-sm text-on-surface-variant">{t("forgotPasswordInstructions")}</p>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 px-1">
                    {t("emailLabel")}
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder={t("emailPlaceholder")}
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface-container-low border-transparent focus:border-primary focus:ring-0 transition-all text-sm"
                  />
                </div>
                <button
                  type="button"
                  disabled={forgotLoading}
                  onClick={handleForgotPassword}
                  className="w-full py-4 rounded-xl bg-primary-gradient text-on-primary font-bold text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {forgotLoading ? <><Spinner />{t("sending")}</> : t("sendResetEmail")}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForgotPassword(false); setError(null); setSuccess(null); }}
                  className="w-full text-sm text-on-surface-variant hover:text-primary transition-colors text-center"
                >
                  ← {t("backToLogin")}
                </button>
              </div>
            )}

            {/* Register form */}
            {tab === "register" && (
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 px-1">
                    {t("nameLabel")}
                  </label>
                  <input
                    type="text"
                    autoComplete="name"
                    placeholder={t("namePlaceholder")}
                    {...registerForm.register("name")}
                    className="w-full px-4 py-3 rounded-xl bg-surface-container-low border-transparent focus:border-primary focus:ring-0 transition-all text-sm"
                  />
                  {registerForm.formState.errors.name && (
                    <span className="text-xs text-error mt-1 block">{registerForm.formState.errors.name.message}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 px-1">
                    {t("emailLabel")}
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder={t("emailPlaceholder")}
                    {...registerForm.register("email")}
                    className="w-full px-4 py-3 rounded-xl bg-surface-container-low border-transparent focus:border-primary focus:ring-0 transition-all text-sm"
                  />
                  {registerForm.formState.errors.email && (
                    <span className="text-xs text-error mt-1 block">{registerForm.formState.errors.email.message}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 px-1">
                    {t("passwordLabel")}
                  </label>
                  <div className="relative">
                    <input
                      type={showRegisterPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      {...registerForm.register("password")}
                      className="w-full px-4 py-3 rounded-xl bg-surface-container-low border-transparent focus:border-primary focus:ring-0 transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                      tabIndex={-1}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showRegisterPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  {registerForm.formState.errors.password && (
                    <span className="text-xs text-error mt-1 block">{registerForm.formState.errors.password.message}</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-xl bg-primary-gradient text-on-primary font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? <><Spinner />{t("creatingAccount")}</> : t("createAccount")}
                </button>
              </form>
            )}
          </div>

          {/* Terms */}
          <p className="mt-8 text-xs text-center text-on-surface-variant">
            {t("termsNotice")}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 px-6 bg-surface-container-low border-t border-outline-variant/10">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto gap-4">
          <p className="text-xs text-on-surface-variant">© 2026 Jobleo. Operated by Julian David Chisco Henao.</p>
          <div className="flex gap-6">
            <Link href="/" className="text-xs text-on-surface-variant font-bold hover:text-primary transition-colors">
              {t("backToHome")}
            </Link>
          </div>
        </div>
      </footer>

      {/* Decorative blobs */}
      <div className="fixed top-1/4 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="fixed bottom-1/4 -left-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
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
