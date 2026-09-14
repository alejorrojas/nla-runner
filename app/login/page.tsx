"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mark } from "@/components/mark";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { appUrl, siteUrl } from "@/lib/urls";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/lab";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const supabase = createBrowserSupabase();
    const redirectTo = `${appUrl()}/auth/callback?next=${encodeURIComponent(next)}`;
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo },
        });
        if (error) throw error;
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          setMessage("Check your email to confirm the account, then sign in.");
          return;
        }
        router.replace(next);
        router.refresh();
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.replace(next);
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function sendMagicLink() {
    setBusy(true);
    setMessage("");
    const supabase = createBrowserSupabase();
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${appUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) throw error;
      setMessage("Magic link sent. Check your email.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-[#faf9f5] px-6">
      <div className="w-full max-w-md">
        <a href={siteUrl()} className="mb-10 flex items-center gap-2.5">
          <Mark className="h-8 w-8" />
          <span className="text-[15px] font-medium tracking-tight">NLASmith</span>
        </a>
        <h1 className="font-display text-[clamp(28px,4vw,36px)] leading-[1.05]">
          {mode === "signin" ? "Sign in to the lab" : "Create your workspace"}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--muted)]">
          Datasets, evaluators, and runs stay attached to your account. A starter
          forum-prior experiment is copied in so you can inspect aggregates immediately.
        </p>
        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <div className="field">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {message ? (
            <p className="text-[13px] text-[var(--muted)]">{message}</p>
          ) : null}
          <Button type="submit" className="h-10 w-full" disabled={busy}>
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>
        <div className="mt-3 flex flex-wrap gap-3 text-[13px]">
          <button
            type="button"
            className="text-[var(--muted)] hover:text-[var(--ink)]"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Need an account?" : "Already have an account?"}
          </button>
          <button
            type="button"
            className="text-[var(--muted)] hover:text-[var(--ink)]"
            onClick={() => void sendMagicLink()}
            disabled={busy || !email}
          >
            Email me a magic link
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-full bg-[#faf9f5]" />}>
      <LoginForm />
    </Suspense>
  );
}
