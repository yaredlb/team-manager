"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  CircleAlert,
  LoaderCircle,
  RotateCcw,
  Save,
  UsersRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Player } from "@/types/team";

type LineupRole = "starter" | "bench";

type LineupSelection = {
  id: string;
  team_id: string;
  player_id: string;
  role: LineupRole;
  lineup_order: number;
};

type Formation = {
  name: string;
  GK: number;
  DEF: number;
  MID: number;
  FWD: number;
};

const positionOrder: Player["position"][] = ["GK", "DEF", "MID", "FWD"];

const availabilityStyles = {
  available: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  injured: "border-amber-400/25 bg-amber-400/10 text-amber-100",
  unavailable: "border-red-400/25 bg-red-400/10 text-red-100",
} as const;

export function LineupBuilder({
  teamId,
  players,
  formation,
  initialSelections,
}: {
  teamId: string;
  players: Player[];
  formation: Formation;
  initialSelections: LineupSelection[];
}) {
  const [selections, setSelections] = useState(initialSelections);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [swapStarterId, setSwapStarterId] = useState<string | null>(null);

  const starters = useMemo(
    () =>
      selections
        .filter((selection) => selection.role === "starter")
        .sort((a, b) => a.lineup_order - b.lineup_order),
    [selections],
  );

  const bench = useMemo(
    () =>
      selections
        .filter((selection) => selection.role === "bench")
        .sort((a, b) => a.lineup_order - b.lineup_order),
    [selections],
  );

  const selectedPlayerIds = useMemo(
    () => new Set(selections.map((selection) => selection.player_id)),
    [selections],
  );

  const starterCountForPosition = (position: Player["position"]) =>
    starters.filter((selection) => {
      const player = players.find((item) => item.id === selection.player_id);
      return player?.position === position;
    }).length;

  function playerById(playerId: string) {
    return players.find((player) => player.id === playerId);
  }

  function addStarter(player: Player) {
    if (player.availability !== "available") {
      setMessage("Only available players can be added to the starting XI.");
      return;
    }

    if (selectedPlayerIds.has(player.id)) {
      setMessage(`${player.name} is already in the lineup.`);
      return;
    }

    const currentForPosition = starterCountForPosition(player.position);
    const allowedForPosition = formation[player.position];

    if (currentForPosition >= allowedForPosition) {
      setMessage(
        `${formation.name} allows ${allowedForPosition} ${player.position} player${allowedForPosition === 1 ? "" : "s"}.`,
      );
      return;
    }

    if (starters.length >= 11) {
      setMessage("Your starting XI already has 11 players.");
      return;
    }

    setMessage(null);
    setSelections((current) => [
      ...current,
      {
        id: `draft-starter-${player.id}`,
        team_id: teamId,
        player_id: player.id,
        role: "starter",
        lineup_order:
          current.filter((item) => item.role === "starter").length + 1,
      },
    ]);
  }

  function addBench(player: Player) {
    if (player.availability !== "available") {
      setMessage("Only available players can be added to the bench.");
      return;
    }

    if (selectedPlayerIds.has(player.id)) {
      setMessage(`${player.name} is already in the lineup.`);
      return;
    }

    setMessage(null);
    setSelections((current) => [
      ...current,
      {
        id: `draft-bench-${player.id}`,
        team_id: teamId,
        player_id: player.id,
        role: "bench",
        lineup_order:
          current.filter((item) => item.role === "bench").length + 1,
      },
    ]);
  }

  function removeSelection(playerId: string) {
    setMessage(null);
    setSelections((current) => {
      const next = current.filter(
        (selection) => selection.player_id !== playerId,
      );

      return normalizeOrders(next);
    });
  }

  function moveBench(playerId: string, direction: "up" | "down") {
    setSelections((current) => {
      const other = current.filter((selection) => selection.role !== "bench");
      const nextBench = current
        .filter((selection) => selection.role === "bench")
        .sort((a, b) => a.lineup_order - b.lineup_order);

      const index = nextBench.findIndex(
        (selection) => selection.player_id === playerId,
      );

      const swapIndex = direction === "up" ? index - 1 : index + 1;

      if (index < 0 || swapIndex < 0 || swapIndex >= nextBench.length) {
        return current;
      }

      [nextBench[index], nextBench[swapIndex]] = [
        nextBench[swapIndex],
        nextBench[index],
      ];

      return [
        ...other,
        ...nextBench.map((selection, order) => ({
          ...selection,
          lineup_order: order + 1,
        })),
      ];
    });
  }

  function normalizeOrders(items: LineupSelection[]) {
    const nextStarters = items
      .filter((item) => item.role === "starter")
      .sort((a, b) => a.lineup_order - b.lineup_order)
      .map((item, index) => ({ ...item, lineup_order: index + 1 }));

    const nextBench = items
      .filter((item) => item.role === "bench")
      .sort((a, b) => a.lineup_order - b.lineup_order)
      .map((item, index) => ({ ...item, lineup_order: index + 1 }));

    return [...nextStarters, ...nextBench];
  }

  function swapStarterWithBench(starterId: string, benchPlayerId: string) {
    const starter = selections.find(
      (selection) =>
        selection.player_id === starterId && selection.role === "starter",
    );

    const benchPlayer = selections.find(
      (selection) =>
        selection.player_id === benchPlayerId && selection.role === "bench",
    );

    if (!starter || !benchPlayer) return;

    const starterPlayer = playerById(starterId);
    const benchPlayerData = playerById(benchPlayerId);

    if (!starterPlayer || !benchPlayerData) return;

    if (starterPlayer.position !== benchPlayerData.position) {
      setMessage("You can only swap players in the same position.");
      return;
    }

    setSelections((current) =>
      current.map((selection) => {
        if (selection.player_id === starterId) {
          return {
            ...selection,
            role: "bench" as const,
            lineup_order: benchPlayer.lineup_order,
          };
        }

        if (selection.player_id === benchPlayerId) {
          return {
            ...selection,
            role: "starter" as const,
            lineup_order: starter.lineup_order,
          };
        }

        return selection;
      }),
    );

    setSwapStarterId(null);
    setMessage(`${benchPlayerData.name} replaced ${starterPlayer.name}.`);
  }

  async function saveLineup() {
    const currentStarters = selections.filter(
      (selection) => selection.role === "starter",
    );

    if (currentStarters.length !== 11) {
      setMessage(
        "Select exactly 11 players before saving your starting lineup.",
      );
      return;
    }

    const invalidPosition = positionOrder.find(
      (position) =>
        currentStarters.filter((selection) => {
          const player = playerById(selection.player_id);
          return player?.position === position;
        }).length !== formation[position],
    );

    if (invalidPosition) {
      setMessage(
        `Your ${formation.name} formation needs exactly ${formation[invalidPosition]} ${invalidPosition} player${formation[invalidPosition] === 1 ? "" : "s"}.`,
      );
      return;
    }

    setIsSaving(true);
    setMessage(null);

    const supabase = createClient();

    const { error: deleteError } = await supabase
      .from("lineup_selections")
      .delete()
      .eq("team_id", teamId);

    if (deleteError) {
      setIsSaving(false);
      setMessage(deleteError.message);
      return;
    }

    const finalSelections = normalizeOrders(selections).map((selection) => ({
      team_id: teamId,
      player_id: selection.player_id,
      role: selection.role,
      lineup_order: selection.lineup_order,
    }));

    if (finalSelections.length > 0) {
      const { data, error: insertError } = await supabase
        .from("lineup_selections")
        .insert(finalSelections)
        .select();

      setIsSaving(false);

      if (insertError) {
        setMessage(insertError.message);
        return;
      }

      setSelections((data ?? []) as LineupSelection[]);
    } else {
      setIsSaving(false);
    }

    setMessage("Lineup saved successfully.");
  }

  function clearLineup() {
    setSelections([]);
    setMessage("Draft cleared. Select a new starting XI, then save.");
  }

  return (
    <section>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-emerald-400">
            Matchday
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Lineup builder
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-400">
            Select an available starting XI for your {formation.name} formation,
            then prioritize your substitutes.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={clearLineup}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-white/25 hover:text-white"
          >
            <RotateCcw size={16} aria-hidden="true" />
            Clear draft
          </button>

          <button
            type="button"
            onClick={saveLineup}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
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
            {isSaving ? "Saving..." : "Save lineup"}
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
            Starting XI
          </p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {starters.length}
            <span className="text-slate-500"> / 11</span>
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
            Bench
          </p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {bench.length}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
            Formation
          </p>
          <p className="mt-2 text-3xl font-semibold text-emerald-300">
            {formation.name}
          </p>
        </div>
      </div>

      {message ? (
        <p
          role="status"
          className={`mt-6 rounded-xl border px-4 py-3 text-sm leading-6 ${
            message === "Lineup saved successfully."
              ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-100"
              : "border-amber-400/25 bg-amber-400/10 text-amber-100"
          }`}
        >
          {message}
        </p>
      ) : null}

      <div className="mt-8 grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
        <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-emerald-300">
                Available roster
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                Select players
              </h2>
            </div>
            <UsersRound
              className="text-emerald-400"
              size={20}
              aria-hidden="true"
            />
          </div>

          <div className="mt-7 grid gap-6">
            {positionOrder.map((position) => {
              const positionPlayers = players.filter(
                (player) => player.position === position,
              );

              return (
                <div key={position}>
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-xs text-emerald-300">
                      {position}
                    </p>
                    <p className="text-xs text-slate-500">
                      {starterCountForPosition(position)} /{" "}
                      {formation[position]} starters
                    </p>
                  </div>

                  <div className="mt-3 grid gap-2">
                    {positionPlayers.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        No {position} players added.
                      </p>
                    ) : (
                      positionPlayers.map((player) => {
                        const selected = selectedPlayerIds.has(player.id);
                        const disabled =
                          player.availability !== "available" || selected;

                        return (
                          <div
                            key={player.id}
                            className={`flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between ${
                              selected
                                ? "border-emerald-400/25 bg-emerald-400/[0.06]"
                                : "border-white/10 bg-slate-950/50"
                            }`}
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.03] font-mono text-xs text-slate-300">
                                {player.shirt_number ?? "—"}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-white">
                                  {player.name}
                                </p>
                                <span
                                  className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${availabilityStyles[player.availability]}`}
                                >
                                  {player.availability}
                                </span>
                              </div>
                            </div>

                            {selected ? (
                              <button
                                type="button"
                                onClick={() => removeSelection(player.id)}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-red-400/35 hover:text-red-200"
                              >
                                <Check size={14} aria-hidden="true" />
                                Remove
                              </button>
                            ) : (
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  disabled={disabled}
                                  onClick={() => addStarter(player)}
                                  className="rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-xs font-medium text-emerald-200 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-35"
                                >
                                  Start
                                </button>
                                <button
                                  type="button"
                                  disabled={disabled}
                                  onClick={() => addBench(player)}
                                  className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                                >
                                  Bench
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-emerald-300">
              Starting XI
            </p>

            <h2 className="mt-2 text-xl font-semibold text-white">
              Formation check
            </h2>

            <div className="mt-6 grid gap-3">
              {positionOrder.map((position) => {
                const selectedForPosition = starters.filter((selection) => {
                  const player = playerById(selection.player_id);
                  return player?.position === position;
                });

                const selectedStarter = swapStarterId
                  ? playerById(swapStarterId)
                  : null;

                const isSwapPanelForPosition =
                  selectedStarter?.position === position;

                const eligibleBench = bench.filter((selection) => {
                  const player = playerById(selection.player_id);

                  return (
                    player?.position === position &&
                    player.availability === "available"
                  );
                });

                return (
                  <div
                    key={position}
                    className="rounded-xl border border-white/10 bg-slate-950/60 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-emerald-300">
                        {position}
                      </span>

                      <span className="text-sm text-slate-500">
                        {selectedForPosition.length} / {formation[position]}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {Array.from({ length: formation[position] }).map(
                        (_, index) => {
                          const selection = selectedForPosition[index];
                          const player = selection
                            ? playerById(selection.player_id)
                            : null;

                          if (!player) {
                            return (
                              <span
                                key={`${position}-${index}`}
                                className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-600"
                              >
                                Open {position} slot
                              </span>
                            );
                          }

                          const isSwapTarget = swapStarterId === player.id;

                          return (
                            <div
                              key={player.id}
                              className="flex items-center gap-2 rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100"
                            >
                              <span>{player.name}</span>

                              <button
                                type="button"
                                onClick={() =>
                                  setSwapStarterId((current) =>
                                    current === player.id ? null : player.id,
                                  )
                                }
                                className={`rounded-md border px-2 py-1 text-[10px] font-medium transition ${
                                  isSwapTarget
                                    ? "border-emerald-300 bg-emerald-400/20 text-white"
                                    : "border-emerald-400/25 text-emerald-100 hover:bg-emerald-400/15"
                                }`}
                                aria-expanded={isSwapTarget}
                              >
                                {isSwapTarget ? "Cancel" : "Swap"}
                              </button>
                            </div>
                          );
                        },
                      )}
                    </div>

                    {isSwapPanelForPosition && selectedStarter ? (
                      <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] p-3">
                        <p className="text-xs leading-6 text-emerald-100">
                          Replace {selectedStarter.name} with an available{" "}
                          {position} from the bench.
                        </p>

                        {eligibleBench.length === 0 ? (
                          <p className="mt-2 text-xs leading-6 text-slate-400">
                            No available {position} players are currently on the
                            bench.
                          </p>
                        ) : (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {eligibleBench.map((selection) => {
                              const benchPlayer = playerById(
                                selection.player_id,
                              );

                              if (!benchPlayer) return null;

                              return (
                                <button
                                  key={benchPlayer.id}
                                  type="button"
                                  onClick={() =>
                                    swapStarterWithBench(
                                      selectedStarter.id,
                                      benchPlayer.id,
                                    )
                                  }
                                  className="rounded-lg border border-emerald-400/25 bg-slate-950/60 px-3 py-2 text-xs font-medium text-emerald-100 transition hover:bg-emerald-400/15"
                                >
                                  {benchPlayer.name}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-emerald-300">
              Bench order
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Substitution priority
            </h2>

            <div className="mt-6 grid gap-3">
              {bench.length === 0 ? (
                <p className="rounded-xl border border-dashed border-white/15 px-4 py-7 text-center text-sm leading-6 text-slate-500">
                  Add available players to the bench, then use the arrows to set
                  priority.
                </p>
              ) : (
                bench.map((selection, index) => {
                  const player = playerById(selection.player_id);

                  if (!player) return null;

                  return (
                    <div
                      key={selection.player_id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/60 p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 font-mono text-xs text-slate-400">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">
                            {player.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {player.position}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => moveBench(player.id, "up")}
                          disabled={index === 0}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-slate-300 transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label={`Move ${player.name} up`}
                        >
                          <ArrowUp size={15} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveBench(player.id, "down")}
                          disabled={index === bench.length - 1}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-slate-300 transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label={`Move ${player.name} down`}
                        >
                          <ArrowDown size={15} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
