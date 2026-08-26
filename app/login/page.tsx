"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const supabase = createClient();

    const result = isSignUp
      ? await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
      : await supabase.auth.signInWithPassword({
          email,
          password,
        });

    setIsLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (isSignUp) {
      setMessage(
        "Check your email to confirm your account, then return here to sign in.",
      );
      return;
    }

    window.location.assign("/dashboard");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-5 py-12 text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/70 p-7 shadow-2xl shadow-black/30 sm:p-9">
        <Link
          href="/"
          className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400"
        >
          YLB Team Manager
        </Link>

        <h1 className="mt-8 text-3xl font-semibold tracking-tight">
          {isSignUp ? "Create your workspace" : "Welcome back"}
        </h1>

        <p className="mt-3 leading-7 text-slate-400">
          {isSignUp
            ? "Create an account to save your roster and lineup plans."
            : "Sign in to manage your football team."}
        </p>

        <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm text-slate-200">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              className="rounded-lg border border-white/10 bg-slate-950 px-3 py-3 text-white outline-none transition focus:border-emerald-400"
            />
          </label>

          <label className="grid gap-2 text-sm text-slate-200">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              className="rounded-lg border border-white/10 bg-slate-950 px-3 py-3 text-white outline-none transition focus:border-emerald-400"
            />
          </label>

          {message ? (
            <p
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-sm leading-6 text-slate-300"
              role="status"
            >
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <LoaderCircle
                className="animate-spin"
                size={17}
                aria-hidden="true"
              />
            ) : null}
            {isLoading
              ? "Please wait..."
              : isSignUp
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setIsSignUp((value) => !value);
            setMessage(null);
          }}
          className="mt-6 text-sm text-slate-400 underline-offset-4 transition hover:text-white hover:underline"
        >
          {isSignUp
            ? "Already have an account? Sign in"
            : "Need an account? Create one"}
        </button>
      </section>
    </main>
  );
}
