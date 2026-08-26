"use client";

import { FormEvent, useState } from "react";
import { AlertTriangle, Check, LoaderCircle, Save, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Team } from "@/types/team";

const formations = ["4-3-3", "4-2-3-1", "4-4-2", "3-5-2", "3-4-3"];

export function TeamSettings({ initialTeam }: { initialTeam: Team }) {
  const [team, setTeam] = useState(initialTeam);
  const [name, setName] = useState(initialTeam.name);
  const [formation, setFormation] = useState(initialTeam.formation);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isClearingLineup, setIsClearingLineup] = useState(false);

  const hasChanges = name.trim() !== team.name || formation !== team.formation;

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      setMessage("Enter a team name with at least 2 characters.");
      return;
    }

    setIsSaving(true);
    setMessage(null);

    const supabase = createClient();

    const { data, error } = await supabase
      .from("teams")
      .update({
        name: trimmedName,
        formation,
        updated_at: new Date().toISOString(),
      })
      .eq("id", team.id)
      .select()
      .single();

    setIsSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setTeam(data as Team);
    setName(data.name);
    setFormation(data.formation);
    setMessage("Team settings saved.");
  }

  async function clearLineup() {
    const confirmed = window.confirm(
      "Clear the current starting XI and bench order? This cannot be undone.",
    );

    if (!confirmed) return;

    setIsClearingLineup(true);
    setMessage(null);

    const supabase = createClient();

    const { error } = await supabase
      .from("lineup_selections")
      .delete()
      .eq("team_id", team.id);

    setIsClearingLineup(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Lineup cleared. Build a new lineup from the Lineup page.");
  }

  return (
    <section className="max-w-3xl">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-emerald-400">
          Workspace
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          Team settings
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-400">
          Update the identity and default matchday formation for your team.
        </p>
      </div>

      <form
        onSubmit={saveSettings}
        className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6"
      >
        <div className="grid gap-5">
          <label className="grid gap-2 text-sm text-slate-200">
            Team name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              minLength={2}
              maxLength={80}
              className="rounded-lg border border-white/10 bg-slate-950 px-3 py-3 text-white outline-none transition focus:border-emerald-400"
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

          {formation !== team.formation ? (
            <div className="flex gap-3 rounded-xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
              <AlertTriangle
                className="mt-0.5 shrink-0"
                size={18}
                aria-hidden="true"
              />
              <p>
                Changing formation does not automatically update your current
                lineup. Review the lineup afterward, and clear/rebuild it if it
                no longer fits the selected formation.
              </p>
            </div>
          ) : null}

          {message ? (
            <p
              role="status"
              className={`rounded-xl border px-4 py-3 text-sm leading-6 ${
                message === "Team settings saved." ||
                message.startsWith("Lineup cleared")
                  ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-100"
                  : "border-red-400/25 bg-red-400/10 text-red-100"
              }`}
            >
              {message}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3 border-t border-white/10 pt-6">
            <button
              type="submit"
              disabled={isSaving || !hasChanges}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? (
                <LoaderCircle
                  className="animate-spin"
                  size={17}
                  aria-hidden="true"
                />
              ) : (
                <Save size={17} aria-hidden="true" />
              )}
              {isSaving ? "Saving..." : "Save changes"}
            </button>

            <button
              type="button"
              onClick={() => {
                setName(team.name);
                setFormation(team.formation);
                setMessage(null);
              }}
              disabled={!hasChanges || isSaving}
              className="rounded-lg px-4 py-3 text-sm font-medium text-slate-400 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </div>
      </form>

      <section className="mt-8 rounded-2xl border border-red-400/20 bg-red-400/[0.04] p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-red-200">
              Matchday reset
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Clear saved lineup
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">
              Removes the saved starting XI and bench order, but keeps your team
              and player roster intact.
            </p>
          </div>

          <button
            type="button"
            onClick={clearLineup}
            disabled={isClearingLineup}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-red-400/30 px-4 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isClearingLineup ? (
              <LoaderCircle
                className="animate-spin"
                size={17}
                aria-hidden="true"
              />
            ) : (
              <Trash2 size={17} aria-hidden="true" />
            )}
            {isClearingLineup ? "Clearing..." : "Clear lineup"}
          </button>
        </div>
      </section>
    </section>
  );
}
