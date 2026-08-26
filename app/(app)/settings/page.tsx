import { redirect } from "next/navigation";
import { TeamSettings } from "@/components/team-settings";
import { createClient } from "@/lib/supabase/server";
import type { Team } from "@/types/team";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: team, error } = await supabase
    .from("teams")
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!team) {
    redirect("/onboarding");
  }

  return <TeamSettings initialTeam={team as Team} />;
}
