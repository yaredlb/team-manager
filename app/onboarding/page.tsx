"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const formations = ["4-3-3", "4-2-3-1", "4-4-2", "3-5-2", "3-4-3"];

export default function OnboardingPage() {
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [formation, setFormation] = useState("4-3-3");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = teamName.trim();

    if (name.length < 2) {
      setMessage("Enter a team name with at least 2 characters.");
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.replace("/login");
      return;
    }

    const { error } = await supabase.from("teams").insert({
      user_id: user.id,
      name,
      formation,
    });

    setIsLoading(false);

    if (error) {
      if (error.code === "23505") {
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      setMessage(error.message);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-white sm:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl place-items-center">
        <section className="w-full max-w-xl rounded-2xl border border-white/10 bg-slate-900/70 p-7 shadow-2xl shadow-black/30 sm:p-10">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-400">
              <ShieldCheck size={20} aria-hidden="true" />
            </span>

            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-emerald-400">
                Team setup
              </p>
              <p className="mt-1 text-sm text-slate-400">Step 1 of 1</p>
            </div>
          </div>

          <h1 className="mt-10 text-3xl font-semibold tracking-tight sm:text-4xl">
            Create your team workspace.
          </h1>

          <p className="mt-4 leading-7 text-slate-400">
            Start with a team name and a default formation. You can update both
            later from settings.
          </p>

          <form className="mt-9 grid gap-6" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-sm text-slate-200">
              Team name
              <input
                type="text"
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
                required
                minLength={2}
                maxLength={80}
                placeholder="e.g. Sunday League FC"
                className="rounded-lg border border-white/10 bg-slate-950 px-3 py-3 text-white outline-none placeholder:text-slate-600 transition focus:border-emerald-400"
              />
            </label>

            <label className="grid gap-2 text-sm text-slate-200">
              Default formation
              <select
                value={formation}
                onChange={(event) => setFormation(event.target.value)}
                className="rounded-lg border border-white/10 bg-slate-950 px-3 py-3 text-white outline-none transition focus:border-emerald-400"
              >
                {formations.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            {message ? (
              <p
                className="rounded-lg border border-red-400/25 bg-red-400/10 px-3 py-3 text-sm leading-6 text-red-200"
                role="alert"
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
              {isLoading ? "Creating workspace..." : "Create team"}
              {!isLoading ? <ArrowRight size={17} aria-hidden="true" /> : null}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}