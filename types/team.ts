export type PlayerPosition = "GK" | "DEF" | "MID" | "FWD";

export type PlayerAvailability = "available" | "injured" | "unavailable";

export type Player = {
  id: string;
  team_id: string;
  name: string;
  position: PlayerPosition;
  shirt_number: number | null;
  availability: PlayerAvailability;
  created_at: string;
  updated_at: string;
};

export type Team = {
  id: string;
  user_id: string;
  name: string;
  formation: string;
  created_at: string;
  updated_at: string;
};
