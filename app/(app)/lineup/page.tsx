import { redirect } from "next/navigation";
import { LineupBuilder } from "@/components/lineup-builder";
import { createClient } from "@/lib/supabase/server";
import type { Player } from "@/types/team";

const formations = {
  "4-3-3": { name: "4-3-3", GK: 1, DEF: 4, MID: 3, FWD: 3 },
  "4-2-3-1": { name: "4-2-3-1", GK: 1, DEF: 4, MID: 5, FWD: 1 },
  "4-4-2": { name: "4-4-2", GK: 1, DEF: 4, MID: 4, FWD: 2 },
  "3-5-2": { name: "3-5-2", GK: 1, DEF: 3, MID: 5, FWD: 2 },
  "3-4-3": { name: "3-4-3", GK: 1, DEF: 3, MID: 4, FWD: 3 },
} as const;

export default async function LineupPage() {
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

  const { data: players, error: playersError } = await supabase
    .from("players")
    .select("*")
    .eq("team_id", team.id)
    .order("name");

  if (playersError) {
    throw new Error(playersError.message);
  }

  const { data: selections, error: selectionsError } = await supabase
    .from("lineup_selections")
    .select("*")
    .eq("team_id", team.id)
    .order("role")
    .order("lineup_order");

  if (selectionsError) {
    throw new Error(selectionsError.message);
  }

  const formation =
    formations[team.formation as keyof typeof formations] ??
    formations["4-3-3"];

  return (
    <LineupBuilder
      teamId={team.id}
      players={(players ?? []) as Player[]}
      formation={formation}
      initialSelections={selections ?? []}
    />
  );
}
