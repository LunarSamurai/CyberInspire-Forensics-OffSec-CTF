import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import FlagSubmitForm from "@/components/FlagSubmitForm";
import { ArrowLeft, Clock, Star, Users, Terminal, Download, Cpu } from "lucide-react";
import type { Solve } from "@/lib/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ChallengePage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [{ data: profile }, { data: challenge }, { data: solves }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("challenges").select("*").eq("slug", slug).single(),
    supabase.from("solves").select("*, profiles(username)").eq("challenge_id",
      // We need challenge id — will re-fetch after
      "00000000-0000-0000-0000-000000000000"
    ),
  ]);

  if (!challenge) notFound();

  // Fetch solves properly now that we have the challenge id
  const { data: realSolves } = await supabase
    .from("solves")
    .select("*, profiles(username)")
    .eq("challenge_id", challenge.id)
    .order("solved_at", { ascending: true })
    .limit(10);

  const { data: userSolve } = await supabase
    .from("solves")
    .select("*")
    .eq("challenge_id", challenge.id)
    .eq("user_id", user.id)
    .maybeSingle();

  const alreadySolved = !!userSolve;

  const diffColor: Record<string, string> = {
    easy: "#26c6da",
    medium: "#ffb74d",
    hard: "#ef5350",
  };

  const lines = challenge.description.split("\n").filter(Boolean);

  return (
    <div className="min-h-screen" style={{ background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(21,101,192,0.15) 0%, #020b17 55%)" }}>
      <Navbar username={profile?.username} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* Back */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 font-mono text-sm mb-8 transition-colors animate-fade-in-up"
          style={{ color: "#9db0dc" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#26c6da")}
          onMouseLeave={e => (e.currentTarget.style.color = "#9db0dc")}>
          <ArrowLeft className="w-4 h-4" />
          Back to challenges
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Header card */}
            <div className="ctf-card p-6 animate-fade-in-up">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="badge-forensics font-mono text-xs px-3 py-1 rounded-full">{challenge.category}</span>
                <span className="font-mono text-xs px-3 py-1 rounded-full"
                  style={{ background: `${diffColor[challenge.difficulty]}15`, color: diffColor[challenge.difficulty], border: `1px solid ${diffColor[challenge.difficulty]}40` }}>
                  {challenge.difficulty}
                </span>
                {alreadySolved && (
                  <span className="font-mono text-xs px-3 py-1 rounded-full animate-pulse-glow"
                    style={{ background: "rgba(38,198,218,0.15)", color: "#26c6da", border: "1px solid rgba(38,198,218,0.4)" }}>
                    ✓ Solved
                  </span>
                )}
              </div>

              <h1 className="font-mono text-2xl md:text-3xl font-bold mb-2" style={{ color: "#e8f0ff" }}>
                {challenge.title}
              </h1>

              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 font-mono text-sm" style={{ color: "#26c6da" }}>
                  <Star className="w-4 h-4" />
                  <span className="font-bold">{challenge.points}</span>
                  <span style={{ color: "#9db0dc" }}>points</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-sm" style={{ color: "#9db0dc" }}>
                  <Users className="w-4 h-4" />
                  <span>{realSolves?.length ?? 0} solver{(realSolves?.length ?? 0) !== 1 ? "s" : ""}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="ctf-card p-6 animate-fade-in-up delay-100">
              <div className="flex items-center gap-2 mb-4">
                <Terminal className="w-4 h-4" style={{ color: "#26c6da" }} />
                <h2 className="font-mono text-sm uppercase tracking-widest" style={{ color: "#26c6da" }}>
                  Mission Brief
                </h2>
              </div>

              <div className="space-y-3">
                {lines.map((line, i) => (
                  <p key={i} className="text-sm leading-relaxed" style={{ color: "#c5d3f0", fontFamily: "IBM Plex Sans, sans-serif" }}>
                    {line.startsWith("Tools") || line.startsWith("Files") || line.startsWith("The ") && i === 0
                      ? <span style={{ color: "#42a5f5" }}>{line}</span>
                      : line}
                  </p>
                ))}
              </div>
            </div>

            {/* Terminal-style code block for tool hints */}
            <div className="ctf-card p-6 animate-fade-in-up delay-200">
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="w-4 h-4" style={{ color: "#26c6da" }} />
                <h2 className="font-mono text-sm uppercase tracking-widest" style={{ color: "#26c6da" }}>
                  Resources & Downloads
                </h2>
              </div>
              <div className="rounded-lg p-4" style={{ background: "rgba(2,11,23,0.8)", border: "1px solid rgba(21,101,192,0.2)" }}>
                <p className="font-mono text-xs mb-3" style={{ color: "#9db0dc" }}>
                  <span style={{ color: "#26c6da" }}>$</span> ls -la ./challenge_files/
                </p>
                <div className="space-y-2">
                  {[
                    { name: "challenge.zip", size: "Coming soon", type: "Archive" },
                    { name: "README.txt", size: "—", type: "Instructions" },
                  ].map((f) => (
                    <div key={f.name} className="flex items-center justify-between py-2 px-3 rounded-lg group"
                      style={{ background: "rgba(21,101,192,0.08)", border: "1px solid rgba(21,101,192,0.15)" }}>
                      <div className="flex items-center gap-2">
                        <Download className="w-3.5 h-3.5" style={{ color: "#42a5f5" }} />
                        <span className="font-mono text-sm" style={{ color: "#c5d3f0" }}>{f.name}</span>
                        <span className="font-mono text-xs" style={{ color: "#9db0dc" }}>({f.type})</span>
                      </div>
                      <span className="font-mono text-xs" style={{ color: "rgba(156,176,220,0.5)" }}>{f.size}</span>
                    </div>
                  ))}
                </div>
                <p className="font-mono text-xs mt-3" style={{ color: "rgba(156,176,220,0.4)" }}>
                  # Upload challenge files via Supabase Storage and add download links here
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">

            {/* Flag submission */}
            <div className="animate-fade-in-up delay-100">
              <FlagSubmitForm
                challenge={challenge}
                userId={user.id}
                alreadySolved={alreadySolved}
                onSolve={() => {}}
              />
            </div>

            {/* Solvers list */}
            <div className="ctf-card p-5 animate-fade-in-up delay-200">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4" style={{ color: "#26c6da" }} />
                <h3 className="font-mono text-sm uppercase tracking-widest" style={{ color: "#26c6da" }}>
                  First Solvers
                </h3>
              </div>

              {(realSolves?.length ?? 0) === 0 ? (
                <p className="font-mono text-xs text-center py-4" style={{ color: "rgba(156,176,220,0.4)" }}>
                  No solvers yet — be the first!
                </p>
              ) : (
                <div className="space-y-2">
                  {realSolves?.map((s: Solve & { profiles?: { username: string } | null }, i) => (
                    <div key={s.id} className="flex items-center justify-between px-3 py-2 rounded-lg animate-slide-in"
                      style={{ background: "rgba(13,31,60,0.5)", border: "1px solid rgba(21,101,192,0.15)", animationDelay: `${i * 50}ms` }}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs w-5 text-center" style={{
                          color: i === 0 ? "#ffd700" : i === 1 ? "#c0c0c0" : i === 2 ? "#cd7f32" : "#9db0dc"
                        }}>
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                        </span>
                        <span className="font-mono text-sm" style={{ color: "#c5d3f0" }}>
                          {s.profiles?.username ?? "unknown"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 font-mono text-xs" style={{ color: "#9db0dc" }}>
                        <Clock className="w-3 h-3" />
                        {new Date(s.solved_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Points breakdown */}
            <div className="ctf-card p-5 animate-fade-in-up delay-300">
              <h3 className="font-mono text-sm uppercase tracking-widest mb-3" style={{ color: "#26c6da" }}>
                Point Value
              </h3>
              <div className="text-center py-2">
                <p className="font-mono text-5xl font-bold glow-text" style={{ color: "#26c6da" }}>{challenge.points}</p>
                <p className="font-mono text-xs mt-1" style={{ color: "#9db0dc" }}>points on solve</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
