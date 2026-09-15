"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GradientBackground } from "@/components/gradient-background";
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
  const [fullName, setFullName] = useState("");
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
          options: {
            emailRedirectTo: redirectTo,
            data: { full_name: fullName.trim() },
          },
        });
        if (error) throw error;
        const { data: signedIn, error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });
        if (signInError) {
          setMessage("Check your email to confirm the account, then sign in.");
          return;
        }
        if (signedIn.user && fullName.trim()) {
          await supabase
            .from("profiles")
            .update({ full_name: fullName.trim() })
            .eq("id", signedIn.user.id);
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

  return (
    <div className="relative isolate min-h-dvh overflow-hidden">
      <div className="absolute inset-0">
        <GradientBackground tone="light" />
      </div>
      <div className="relative z-10 flex min-h-dvh items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-2xl bg-[#faf9f5]/72 px-7 py-8 ring-1 ring-[#d1cfc5]/70 backdrop-blur-sm">
        <a href={siteUrl()} className="mb-10 flex items-center gap-2.5">
          <Mark className="h-8 w-8" />
          <span className="text-[15px] font-medium tracking-tight">NLASmith</span>
        </a>
        <h1 className="font-display text-[clamp(28px,4vw,36px)] leading-[1.05]">
          {mode === "signin" ? "Sign in to the lab" : "Create your workspace"}
        </h1>
        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          {mode === "signup" ? (
            <div className="field">
              <Label htmlFor="full-name">Full name</Label>
              <Input
                id="full-name"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          ) : null}
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
          <Button type="submit" className="w-full" disabled={busy}>
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>
        <div className="mt-3 flex flex-wrap gap-3">
          <Button
            type="button"
            variant="link"
            className="text-[var(--muted)]"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Need an account?" : "Already have an account?"}
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#faf9f5]" />}>
      <LoginForm />
    </Suspense>
  );
}
