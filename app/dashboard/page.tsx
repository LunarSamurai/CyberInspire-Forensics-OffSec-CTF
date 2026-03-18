import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import { Shield, Lock, CheckCircle2, Star, Target, Database, Globe, Key } from "lucide-react";
import type { Challenge, Solve, Profile, ScoreboardEntry } from "@/lib/types";

const categoryIcons: Record<string, React.ElementType> = {
  forensics: Database,
  web: Globe,
  crypto: Key,
};

const difficultyOrder: Record<string, number> = { "Part 1": 0, "Part 2": 1, "Part 3": 2, easy: 0, medium: 1, hard: 2 };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [{ data: profileData }, { data: challengesData }, { data: solvesData }, { data: boardData }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("challenges").select("*").order("difficulty"),
    supabase.from("solves").select("*").eq("user_id", user.id),
    supabase.from("scoreboard").select("*").eq("user_id", user.id).single(),
  ]);

  const profile = profileData as Profile | null;
  const challenges = challengesData as Challenge[] | null;
  const solves = solvesData as Solve[] | null;
  const board = boardData as ScoreboardEntry | null;

  const solvedIds = new Set(solves?.map((s) => s.challenge_id) ?? []);
  const totalPoints = board?.total_points ?? 0;
  const totalChallenges = challenges?.length ?? 0;
  const solvedCount = solvedIds.size;

  const grouped = (challenges ?? []).reduce<Record<string, Challenge[]>>((acc, c) => {
    if (!acc[c.category]) acc[c.category] = [];
    acc[c.category].push(c);
    return acc;
  }, {});

  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(ellipse 80% 50% at 50% -5%, rgba(21,101,192,0.18) 0%, #020b17 60%)" }}>
      <Navbar username={profile?.username} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs uppercase tracking-widest px-2 py-0.5 rounded"
              style={{ color: "#26c6da", background: "rgba(38,198,218,0.1)", border: "1px solid rgba(38,198,218,0.25)" }}>
              Live Competition
            </span>
          </div>
          <h1 className="font-mono text-3xl font-bold" style={{ color: "#e8f0ff" }}>
            Challenge Board
          </h1>
          <p className="mt-1 font-mono text-sm" style={{ color: "#9db0dc" }}>
            Welcome back, <span style={{ color: "#26c6da" }}>{profile?.username}</span>. {solvedCount}/{totalChallenges} challenges solved.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Points", value: totalPoints, icon: Star, color: "#26c6da" },
            { label: "Solved", value: `${solvedCount}/${totalChallenges}`, icon: CheckCircle2, color: "#42a5f5" },
            { label: "Remaining", value: totalChallenges - solvedCount, icon: Target, color: "#ffb74d" },
            { label: "Max Points", value: (challenges ?? []).reduce((s, c) => s + c.points, 0), icon: Shield, color: "#ce93d8" },
          ].map(({ label, value, icon: Icon, color }, i) => (
            <div key={label} className="ctf-card p-4 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs uppercase tracking-wider" style={{ color: "#9db0dc" }}>{label}</span>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <p className="font-mono text-2xl font-bold" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {totalChallenges > 0 && (
          <div className="mb-10 animate-fade-in-up delay-200">
            <div className="flex justify-between font-mono text-xs mb-2" style={{ color: "#9db0dc" }}>
              <span>Overall Progress</span>
              <span>{Math.round((solvedCount / totalChallenges) * 100)}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(21,101,192,0.15)" }}>
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${(solvedCount / totalChallenges) * 100}%`,
                  background: "linear-gradient(90deg, #1565c0, #26c6da)", boxShadow: "0 0 12px rgba(38,198,218,0.6)" }} />
            </div>
          </div>
        )}

        {/* Challenges grouped by category */}
        {Object.entries(grouped).sort().map(([cat, chals], gi) => {
          const Icon = categoryIcons[cat] ?? Shield;
          return (
            <div key={cat} className="mb-10 animate-fade-in-up" style={{ animationDelay: `${gi * 120}ms` }}>
              <div className="flex items-center gap-3 mb-4">
                <Icon className="w-5 h-5" style={{ color: "#26c6da" }} />
                <h2 className="font-mono text-lg font-bold uppercase tracking-widest" style={{ color: "#e8f0ff" }}>
                  {cat}
                </h2>
                <div className="flex-1 h-px" style={{ background: "rgba(21,101,192,0.25)" }} />
                <span className="font-mono text-xs" style={{ color: "#9db0dc" }}>
                  {chals.filter((c) => solvedIds.has(c.id)).length}/{chals.length} solved
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {chals.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]).map((challenge) => {
                  const solved = solvedIds.has(challenge.id);
                  return (
                    <Link key={challenge.id} href={`/challenges/${challenge.slug}`}
                      className="ctf-card p-5 relative block transition-all duration-200 hover:-translate-y-1 group"
                      style={{ opacity: 1 }}>

                      {solved && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle2 className="w-5 h-5" style={{ color: "#26c6da", filter: "drop-shadow(0 0 6px rgba(38,198,218,0.6))" }} />
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-3">
                        <div className="flex gap-2 flex-wrap">
                          <span className="badge-forensics font-mono text-xs px-2 py-0.5 rounded-full">{challenge.category}</span>
                          <span className={`badge-${challenge.difficulty} font-mono text-xs px-2 py-0.5 rounded-full`}>{challenge.difficulty}</span>
                        </div>
                      </div>

                      <h3 className="font-mono text-base font-bold mb-2 pr-6 group-hover:text-cyan-soft transition-colors"
                        style={{ color: solved ? "#26c6da" : "#e8f0ff" }}>
                        {solved ? "✓ " : ""}{challenge.title}
                      </h3>

                      <p className="text-sm mb-4 line-clamp-2" style={{ color: "#9db0dc" }}>
                        {challenge.description.split("\n")[0]}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xl font-bold" style={{ color: "#26c6da" }}>
                          {challenge.points} <span className="text-xs" style={{ color: "#9db0dc" }}>pts</span>
                        </span>
                        {solved ? (
                          <span className="font-mono text-xs" style={{ color: "#26c6da" }}>Solved ✓</span>
                        ) : (
                          <span className="font-mono text-xs flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: "#42a5f5" }}>
                            Attempt <Lock className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}

        {(!challenges || challenges.length === 0) && (
          <div className="text-center py-20">
            <Shield className="w-12 h-12 mx-auto mb-4" style={{ color: "rgba(21,101,192,0.4)" }} />
            <p className="font-mono" style={{ color: "#9db0dc" }}>No challenges loaded yet.</p>
            <p className="font-mono text-sm mt-1" style={{ color: "rgba(156,176,220,0.5)" }}>Run the schema.sql to seed challenges.</p>
          </div>
        )}
      </main>
    </div>
  );
}
