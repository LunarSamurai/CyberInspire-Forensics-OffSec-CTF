export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; username: string; created_at: string };
        Insert: { id: string; username: string; created_at?: string };
        Update: { id?: string; username?: string; created_at?: string };
      };
      challenges: {
        Row: {
          id: string;
          slug: string;
          title: string;
          category: string;
          description: string;
          points: number;
          flag: string;
          hint: string | null;
          difficulty: string;
          file_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["challenges"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["challenges"]["Insert"]>;
      };
      solves: {
        Row: { id: string; user_id: string; challenge_id: string; solved_at: string; points_awarded: number | null };
        Insert: { user_id: string; challenge_id: string; points_awarded?: number };
        Update: never;
      };
      attempts: {
        Row: { id: string; user_id: string; challenge_id: string; count: number };
        Insert: { user_id: string; challenge_id: string; count: number };
        Update: { count?: number };
      };
    };
    Views: {
      scoreboard: {
        Row: {
          user_id: string;
          username: string;
          joined_at: string;
          total_points: number;
          solves_count: number;
          last_solve: string | null;
        };
      };
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Challenge = Database["public"]["Tables"]["challenges"]["Row"];
export type Solve = Database["public"]["Tables"]["solves"]["Row"];
export type Attempt = Database["public"]["Tables"]["attempts"]["Row"];
export type ScoreboardEntry = Database["public"]["Views"]["scoreboard"]["Row"];
