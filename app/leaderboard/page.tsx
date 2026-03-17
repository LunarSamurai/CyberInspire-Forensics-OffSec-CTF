import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import { Trophy, Shield, Star, CheckCircle2, Clock, Crown, Activity } from "lucide-react";
import type { ScoreboardEntry } from "@/lib/types";

export const revalidate = 30; // refresh every 30 seconds

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [{ data: profile }, { data: board }, { data: challenges }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("scoreboard").select("*").limit(50),
    supabase.from("challenges").select("id, points"),
  ]);

  const entries = (board as ScoreboardEntry[] | null) ?? [];
  const maxPoints = (challenges ?? []).reduce((s: number, c: { points: number }) => s + c.points, 0);
  const currentUserRank = entries.findIndex((e) => e.user_id === user.id) + 1;
  const currentUser = entries.find((e) => e.user_id === user.id);

  const rankStyle = (rank: number) => {
    if (rank === 1) return { color: "#ffd700", label: "🥇", glow: "rgba(255,215,0,0.5)" };
    if (rank === 2) return { color: "#c0c0c0", label: "🥈", glow: "rgba(192,192,192,0.4)" };
    if (rank === 3) return { color: "#cd7f32", label: "🥉", glow: "rgba(205,127,50,0.4)" };
    return { color: "#9db0dc", label: `#${rank}`, glow: "transparent" };
  };

  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(ellipse 90% 50% at 50% -5%, rgba(21,101,192,0.2) 0%, #020b17 60%)" }}>
      <Navbar username={profile?.username} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 relative"
            style={{ background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)" }}>
            <div className="absolute inset-0 rounded-full blur-xl" style={{ background: "rgba(255,215,0,0.15)" }} />
            <Trophy className="w-8 h-8 relative z-10" style={{ color: "#ffd700", filter: "drop-shadow(0 0 12px rgba(255,215,0,0.8))" }} />
          </div>
          <h1 className="font-mono text-3xl md:text-4xl font-bold mb-2" style={{ color: "#e8f0ff" }}>
            Leaderboard
          </h1>
          <p className="font-mono text-sm" style={{ color: "#9db0dc" }}>
            {entries.length} competitors — refreshes every 30s
          </p>
        </div>

        {/* Top 3 podium */}
        {entries.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-10 animate-fade-in-up delay-100">
            {[entries[1], entries[0], entries[2]].map((entry, podiumIdx) => {
              const realRank = podiumIdx === 0 ? 2 : podiumIdx === 1 ? 1 : 3;
              const { color, label, glow } = rankStyle(realRank);
              const isMe = entry.user_id === user.id;
              const heights = ["h-28", "h-36", "h-24"];
              return (
                <div key={entry.user_id}
                  className={`ctf-card p-4 flex flex-col items-center justify-end ${heights[podiumIdx]} relative`}
                  style={{
                    borderColor: isMe ? "rgba(38,198,218,0.5)" : `${color}30`,
                    boxShadow: realRank <= 3 ? `0 0 30px ${glow}` : undefined,
                  }}>
                  <div className="absolute -top-4 text-2xl">{label}</div>
                  <p className="font-mono text-sm font-bold truncate w-full text-center" style={{ color: isMe ? "#26c6da" : "#e8f0ff" }}>
                    {isMe ? "YOU" : entry.username}
                  </p>
                  <p className="font-mono text-lg font-bold" style={{ color }}>{entry.total_points}</p>
                  <p className="font-mono text-xs" style={{ color: "#9db0dc" }}>{entry.solves_count} solves</p>
                  {maxPoints > 0 && (
                    <div className="w-full mt-2 h-1 rounded-full overflow-hidden" style={{ background: "rgba(21,101,192,0.2)" }}>
                      <div className="h-full rounded-full" style={{
                        width: `${Math.min(100, (entry.total_points / maxPoints) * 100)}%`,
                        background: `linear-gradient(90deg, #1565c0, ${color})`,
                      }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Your rank callout (if not in top 3) */}
        {currentUserRank > 3 && currentUser && (
          <div className="ctf-card p-4 mb-6 flex items-center gap-4 animate-fade-in-up delay-200"
            style={{ borderColor: "rgba(38,198,218,0.4)", background: "rgba(38,198,218,0.06)" }}>
            <Crown className="w-5 h-5 flex-shrink-0" style={{ color: "#26c6da" }} />
            <div>
              <p className="font-mono text-sm font-bold" style={{ color: "#26c6da" }}>Your Position</p>
              <p className="font-mono text-xs" style={{ color: "#9db0dc" }}>
                Rank #{currentUserRank} · {currentUser.total_points} pts · {currentUser.solves_count} solves
              </p>
            </div>
            <div className="ml-auto font-mono text-2xl font-bold" style={{ color: "#26c6da" }}>#{currentUserRank}</div>
          </div>
        )}

        {/* Full table */}
        <div className="ctf-card overflow-hidden animate-fade-in-up delay-300">
          {/* Table header */}
          <div className="grid grid-cols-12 px-6 py-3 font-mono text-xs uppercase tracking-widest border-b"
            style={{ color: "#9db0dc", borderColor: "rgba(21,101,192,0.2)", background: "rgba(7,20,40,0.5)" }}>
            <div className="col-span-1">Rank</div>
            <div className="col-span-4">Player</div>
            <div className="col-span-3 text-right">Points</div>
            <div className="col-span-2 text-center">Solves</div>
            <div className="col-span-2 text-right hidden sm:block">Last Solve</div>
          </div>

          {entries.length === 0 ? (
            <div className="text-center py-16">
              <Activity className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(21,101,192,0.4)" }} />
              <p className="font-mono" style={{ color: "#9db0dc" }}>No competitors yet.</p>
              <p className="font-mono text-sm mt-1" style={{ color: "rgba(156,176,220,0.4)" }}>Be the first to register and solve a challenge!</p>
            </div>
          ) : (
            <div className="divide-y" style={{ divideColor: "rgba(21,101,192,0.1)" }}>
              {entries.map((entry, i) => {
                const rank = i + 1;
                const { color, label } = rankStyle(rank);
                const isMe = entry.user_id === user.id;
                return (
                  <div key={entry.user_id}
                    className="grid grid-cols-12 px-6 py-4 items-center transition-colors animate-slide-in"
                    style={{
                      animationDelay: `${i * 40}ms`,
                      background: isMe ? "rgba(38,198,218,0.05)" : "transparent",
                      borderLeft: isMe ? "2px solid rgba(38,198,218,0.5)" : "2px solid transparent",
                    }}
                    onMouseEnter={e => { if (!isMe) (e.currentTarget as HTMLElement).style.background = "rgba(21,101,192,0.06)"; }}
                    onMouseLeave={e => { if (!isMe) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>

                    {/* Rank */}
                    <div className="col-span-1 font-mono text-sm font-bold" style={{ color, textShadow: rank <= 3 ? `0 0 12px ${color}` : "none" }}>
                      {label}
                    </div>

                    {/* Username */}
                    <div className="col-span-4 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-mono text-xs font-bold"
                        style={{ background: isMe ? "rgba(38,198,218,0.2)" : "rgba(21,101,192,0.15)", color: isMe ? "#26c6da" : "#42a5f5" }}>
                        {entry.username.slice(0, 1).toUpperCase()}
                      </div>
                      <span className="font-mono text-sm font-medium truncate" style={{ color: isMe ? "#26c6da" : "#e8f0ff" }}>
                        {entry.username}
                        {isMe && <span className="ml-1 text-xs" style={{ color: "rgba(38,198,218,0.7)" }}>(you)</span>}
                      </span>
                    </div>

                    {/* Points */}
                    <div className="col-span-3 text-right">
                      <span className="font-mono text-base font-bold" style={{ color: "#26c6da" }}>{entry.total_points}</span>
                      {maxPoints > 0 && (
                        <div className="mt-1 h-1 rounded-full overflow-hidden ml-auto" style={{ width: "60%", background: "rgba(21,101,192,0.15)" }}>
                          <div className="h-full rounded-full" style={{
                            width: `${Math.min(100, (entry.total_points / maxPoints) * 100)}%`,
                            background: "linear-gradient(90deg, #1565c0, #26c6da)",
                          }} />
                        </div>
                      )}
                    </div>

                    {/* Solves */}
                    <div className="col-span-2 text-center">
                      <div className="inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#42a5f5" }} />
                        <span className="font-mono text-sm" style={{ color: "#c5d3f0" }}>{entry.solves_count}</span>
                      </div>
                    </div>

                    {/* Last solve */}
                    <div className="col-span-2 text-right hidden sm:flex items-center justify-end gap-1">
                      {entry.last_solve ? (
                        <>
                          <Clock className="w-3 h-3" style={{ color: "#9db0dc" }} />
                          <span className="font-mono text-xs" style={{ color: "#9db0dc" }}>
                            {new Date(entry.last_solve).toLocaleDateString()}
                          </span>
                        </>
                      ) : (
                        <span className="font-mono text-xs" style={{ color: "rgba(156,176,220,0.3)" }}>—</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="mt-6 flex items-center justify-center gap-2 animate-fade-in-up">
          <Shield className="w-3.5 h-3.5" style={{ color: "rgba(156,176,220,0.4)" }} />
          <p className="font-mono text-xs" style={{ color: "rgba(156,176,220,0.4)" }}>
            Ties broken by earliest last solve time.
          </p>
        </div>
      </main>
    </div>
  );
}
