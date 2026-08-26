import { redirect } from "next/navigation";
import { PlayerRoster } from "@/components/player-roster";
import { createClient } from "@/lib/supabase/server";
import type { Player } from "@/types/team";

export default async function PlayersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id")
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
    .order("created_at", { ascending: true });

  if (playersError) {
    throw new Error(playersError.message);
  }

  return (
    <PlayerRoster
      teamId={team.id}
      initialPlayers={(players ?? []) as Player[]}
    />
  );
}
