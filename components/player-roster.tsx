"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  CircleAlert,
  LoaderCircle,
  Plus,
  Trash2,
  UsersRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Player, PlayerAvailability, PlayerPosition } from "@/types/team";

const positions: PlayerPosition[] = ["GK", "DEF", "MID", "FWD"];

const availabilityOptions: {
  value: PlayerAvailability;
  label: string;
}[] = [
  { value: "available", label: "Available" },
  { value: "injured", label: "Injured" },
  { value: "unavailable", label: "Unavailable" },
];

const availabilityStyles: Record<PlayerAvailability, string> = {
  available: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  injured: "border-amber-400/25 bg-amber-400/10 text-amber-200",
  unavailable: "border-red-400/25 bg-red-400/10 text-red-200",
};

export function PlayerRoster({
  teamId,
  initialPlayers,
}: {
  teamId: string;
  initialPlayers: Player[];
}) {
  const [players, setPlayers] = useState(initialPlayers);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [position, setPosition] = useState<PlayerPosition>("MID");
  const [shirtNumber, setShirtNumber] = useState("");
  const [availability, setAvailability] =
    useState<PlayerAvailability>("available");
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const groupedPlayers = useMemo(
    () =>
      positions.map((groupPosition) => ({
        position: groupPosition,
        players: players
          .filter((player) => player.position === groupPosition)
          .sort(
            (a, b) =>
              (a.shirt_number ?? 999) - (b.shirt_number ?? 999) ||
              a.name.localeCompare(b.name),
          ),
      })),
    [players],
  );

  async function addPlayer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      setMessage("Enter a player name with at least 2 characters.");
      return;
    }

    const parsedNumber = shirtNumber ? Number(shirtNumber) : null;

    if (
      parsedNumber !== null &&
      (!Number.isInteger(parsedNumber) || parsedNumber < 1 || parsedNumber > 99)
    ) {
      setMessage("Shirt number must be a whole number between 1 and 99.");
      return;
    }

    setIsSaving(true);
    setMessage(null);

    const supabase = createClient();

    const { data, error } = await supabase
      .from("players")
      .insert({
        team_id: teamId,
        name: trimmedName,
        position,
        shirt_number: parsedNumber,
        availability,
      })
      .select()
      .single();

    setIsSaving(false);

    if (error) {
      if (error.code === "23505") {
        setMessage(
          "That shirt number is already assigned to a player on this team.",
        );
        return;
      }

      setMessage(error.message);
      return;
    }

    setPlayers((current) => [...current, data as Player]);
    setName("");
    setPosition("MID");
    setShirtNumber("");
    setAvailability("available");
    setIsAdding(false);
  }

  async function updateAvailability(
    playerId: string,
    nextAvailability: PlayerAvailability,
  ) {
    setPendingId(playerId);
    setMessage(null);

    const supabase = createClient();

    const { error } = await supabase
      .from("players")
      .update({ availability: nextAvailability })
      .eq("id", playerId);

    setPendingId(null);

    if (error) {
      setMessage(error.message);
      return;
    }

    setPlayers((current) =>
      current.map((player) =>
        player.id === playerId
          ? { ...player, availability: nextAvailability }
          : player,
      ),
    );
  }

  async function deletePlayer(playerId: string) {
    const player = players.find((item) => item.id === playerId);

    if (!player) return;

    const confirmed = window.confirm(`Remove ${player.name} from the roster?`);

    if (!confirmed) return;

    setPendingId(playerId);
    setMessage(null);

    const supabase = createClient();

    const { error } = await supabase
      .from("players")
      .delete()
      .eq("id", playerId);

    setPendingId(null);

    if (error) {
      setMessage(error.message);
      return;
    }

    setPlayers((current) => current.filter((item) => item.id !== playerId));
  }

  return (
    <section>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-emerald-400">
            Roster
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Players
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-400">
            Keep your roster organized before selecting a matchday lineup.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsAdding((value) => !value);
            setMessage(null);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300"
        >
          <Plus size={18} aria-hidden="true" />
          Add player
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
            Total players
          </p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {players.length}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
            Available
          </p>
          <p className="mt-2 text-3xl font-semibold text-emerald-300">
            {
              players.filter((player) => player.availability === "available")
                .length
            }
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
            Unavailable
          </p>
          <p className="mt-2 text-3xl font-semibold text-red-200">
            {
              players.filter((player) => player.availability !== "available")
                .length
            }
          </p>
        </div>
      </div>

      {isAdding ? (
        <form
          onSubmit={addPlayer}
          className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-5 sm:p-6"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm text-slate-200">
              Player name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                minLength={2}
                maxLength={80}
                placeholder="e.g. Alex Morgan"
                className="rounded-lg border border-white/10 bg-slate-950 px-3 py-3 text-white outline-none placeholder:text-slate-600 focus:border-emerald-400"
              />
            </label>

            <label className="grid gap-2 text-sm text-slate-200">
              Position
              <select
                value={position}
                onChange={(event) =>
                  setPosition(event.target.value as PlayerPosition)
                }
                className="rounded-lg border border-white/10 bg-slate-950 px-3 py-3 text-white outline-none focus:border-emerald-400"
              >
                {positions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm text-slate-200">
              Shirt number <span className="text-slate-500">(optional)</span>
              <input
                value={shirtNumber}
                onChange={(event) => setShirtNumber(event.target.value)}
                type="number"
                min="1"
                max="99"
                inputMode="numeric"
                placeholder="e.g. 10"
                className="rounded-lg border border-white/10 bg-slate-950 px-3 py-3 text-white outline-none placeholder:text-slate-600 focus:border-emerald-400"
              />
            </label>

            <label className="grid gap-2 text-sm text-slate-200">
              Availability
              <select
                value={availability}
                onChange={(event) =>
                  setAvailability(event.target.value as PlayerAvailability)
                }
                className="rounded-lg border border-white/10 bg-slate-950 px-3 py-3 text-white outline-none focus:border-emerald-400"
              >
                {availabilityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <LoaderCircle
                  className="animate-spin"
                  size={17}
                  aria-hidden="true"
                />
              ) : null}
              {isSaving ? "Saving..." : "Save player"}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setMessage(null);
              }}
              className="rounded-lg px-4 py-3 text-sm font-medium text-slate-400 transition hover:text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {message ? (
        <p
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-100"
        >
          <CircleAlert
            className="mt-0.5 shrink-0"
            size={17}
            aria-hidden="true"
          />
          {message}
        </p>
      ) : null}

      <div className="mt-8 grid gap-5">
        {players.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-14 text-center">
            <UsersRound
              className="mx-auto text-slate-500"
              size={30}
              aria-hidden="true"
            />
            <h2 className="mt-5 text-xl font-medium text-white">
              Build your roster
            </h2>
            <p className="mx-auto mt-3 max-w-md leading-7 text-slate-400">
              Add players with a position, shirt number, and availability
              status. You’ll use this roster to build your starting XI and
              bench.
            </p>
          </div>
        ) : (
          groupedPlayers.map((group) => (
            <section
              key={group.position}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <h2 className="font-mono text-xs font-semibold tracking-[0.14em] text-emerald-300">
                  {group.position}
                </h2>
                <span className="text-sm text-slate-500">
                  {group.players.length} player
                  {group.players.length === 1 ? "" : "s"}
                </span>
              </div>

              {group.players.length === 0 ? (
                <p className="px-5 py-5 text-sm text-slate-500">
                  No {group.position.toLowerCase()} players added yet.
                </p>
              ) : (
                <ul className="divide-y divide-white/10">
                  {group.players.map((player) => (
                    <li
                      key={player.id}
                      className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-slate-950 font-mono text-sm text-slate-300">
                          {player.shirt_number ?? "—"}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-white">
                            {player.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {player.position} · #
                            {player.shirt_number ?? "Unassigned"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <select
                          value={player.availability}
                          onChange={(event) =>
                            updateAvailability(
                              player.id,
                              event.target.value as PlayerAvailability,
                            )
                          }
                          disabled={pendingId === player.id}
                          className={`rounded-lg border px-2.5 py-2 text-xs font-medium outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${availabilityStyles[player.availability]}`}
                          aria-label={`Change availability for ${player.name}`}
                        >
                          {availabilityOptions.map((option) => (
                            <option
                              key={option.value}
                              value={option.value}
                              className="bg-slate-950 text-white"
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => deletePlayer(player.id)}
                          disabled={pendingId === player.id}
                          className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-400 transition hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label={`Remove ${player.name}`}
                        >
                          {pendingId === player.id ? (
                            <LoaderCircle
                              className="animate-spin"
                              size={16}
                              aria-hidden="true"
                            />
                          ) : (
                            <Trash2 size={16} aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))
        )}
      </div>
    </section>
  );
}
