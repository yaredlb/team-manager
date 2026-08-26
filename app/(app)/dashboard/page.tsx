import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  ClipboardCheck,
  Shield,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Player } from "@/types/team";

const positionOrder: Player["position"][] = ["GK", "DEF", "MID", "FWD"];

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id, name, formation")
    .maybeSingle();

  if (teamError) {
    throw new Error(teamError.message);
  }

  if (!team) {
    redirect("/onboarding");
  }

  const [
    { data: players, error: playersError },
    { data: selections, error: selectionsError },
  ] = await Promise.all([
    supabase.from("players").select("*").eq("team_id", team.id).order("name"),
    supabase
      .from("lineup_selections")
      .select("*")
      .eq("team_id", team.id)
      .order("role")
      .order("lineup_order"),
  ]);

  if (playersError) {
    throw new Error(playersError.message);
  }

  if (selectionsError) {
    throw new Error(selectionsError.message);
  }

  const roster = (players ?? []) as Player[];
  const lineupSelections = selections ?? [];

  const starters = lineupSelections
    .filter((selection) => selection.role === "starter")
    .sort((a, b) => a.lineup_order - b.lineup_order);

  const bench = lineupSelections
    .filter((selection) => selection.role === "bench")
    .sort((a, b) => a.lineup_order - b.lineup_order);

  const availableCount = roster.filter(
    (player) => player.availability === "available",
  ).length;

  const unavailableCount = roster.length - availableCount;

  function playerById(playerId: string) {
    return roster.find((player) => player.id === playerId);
  }

  return (
    <section>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-emerald-400">
            Team workspace
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {team.name}
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-slate-400">
            Your roster and matchday plan in one place.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/players"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-white/25 hover:text-white"
          >
            <UsersRound size={17} aria-hidden="true" />
            Manage roster
          </Link>

          <Link
            href="/lineup"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
          >
            Edit lineup
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
                Roster
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {roster.length}
              </p>
            </div>
            <UsersRound
              className="text-slate-400"
              size={19}
              aria-hidden="true"
            />
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Total registered players
          </p>
        </article>

        <article className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
                Available
              </p>
              <p className="mt-2 text-3xl font-semibold text-emerald-300">
                {availableCount}
              </p>
            </div>
            <UserRoundCheck
              className="text-emerald-400"
              size={19}
              aria-hidden="true"
            />
          </div>
          <p className="mt-4 text-sm text-slate-500">
            {unavailableCount} unavailable
          </p>
        </article>

        <article className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
                Starting XI
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {starters.length}
                <span className="text-slate-500"> / 11</span>
              </p>
            </div>
            <ClipboardCheck
              className="text-emerald-400"
              size={19}
              aria-hidden="true"
            />
          </div>
          <p className="mt-4 text-sm text-slate-500">
            {starters.length === 11 ? "Lineup complete" : "Lineup in progress"}
          </p>
        </article>

        <article className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
                Formation
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {team.formation}
              </p>
            </div>
            <Shield className="text-slate-400" size={19} aria-hidden="true" />
          </div>
          <p className="mt-4 text-sm text-slate-500">
            {bench.length} bench player{bench.length === 1 ? "" : "s"} selected
          </p>
        </article>
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-emerald-300">
                Matchday lineup
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                Current starting XI
              </h2>
            </div>

            <Link
              href="/lineup"
              className="inline-flex items-center gap-2 text-sm font-medium text-emerald-300 transition hover:text-emerald-200"
            >
              Edit lineup <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>

          {starters.length === 0 ? (
            <div className="mt-7 rounded-xl border border-dashed border-white/15 px-5 py-12 text-center">
              <ClipboardCheck
                className="mx-auto text-slate-500"
                size={28}
                aria-hidden="true"
              />
              <h3 className="mt-4 text-lg font-medium text-white">
                No lineup selected
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                Select available players and build a formation-aware starting
                XI.
              </p>
              <Link
                href="/lineup"
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-emerald-300"
              >
                Build lineup <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <div className="mt-7 grid gap-4">
              {positionOrder.map((position) => {
                const positionSelections = starters.filter((selection) => {
                  const player = playerById(selection.player_id);
                  return player?.position === position;
                });

                if (positionSelections.length === 0) return null;

                return (
                  <div
                    key={position}
                    className="rounded-xl border border-white/10 bg-slate-950/60 p-4"
                  >
                    <p className="font-mono text-xs text-emerald-300">
                      {position}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {positionSelections.map((selection) => {
                        const player = playerById(selection.player_id);

                        if (!player) return null;

                        return (
                          <span
                            key={selection.id}
                            className="rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100"
                          >
                            {player.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <aside className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-emerald-300">
            Bench priority
          </p>

          <h2 className="mt-2 text-xl font-semibold text-white">
            Substitution order
          </h2>

          {bench.length === 0 ? (
            <p className="mt-7 rounded-xl border border-dashed border-white/15 px-4 py-7 text-center text-sm leading-6 text-slate-500">
              Bench players will appear here after you build a lineup.
            </p>
          ) : (
            <ol className="mt-7 grid gap-3">
              {bench.map((selection, index) => {
                const player = playerById(selection.player_id);

                if (!player) return null;

                return (
                  <li
                    key={selection.id}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/60 p-3"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 font-mono text-xs text-slate-400">
                      {index + 1}
                    </span>

                    <div>
                      <p className="text-sm font-medium text-white">
                        {player.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {player.position}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </aside>
      </div>
    </section>
  );
}
