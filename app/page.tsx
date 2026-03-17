"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Shield, Terminal, Eye, EyeOff, Lock, User, Mail, AlertCircle } from "lucide-react";

type Mode = "signin" | "signup";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [particles, setParticles] = useState<{ x: number; y: number; char: string; opacity: number; speed: number }[]>([]);

  const router = useRouter();
  const supabase = createClient();

  // Generate floating binary/hex particles
  useEffect(() => {
    const chars = "01ABCDEF0110CTF{}[]<>!#";
    const p = Array.from({ length: 24 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      char: chars[Math.floor(Math.random() * chars.length)],
      opacity: 0.04 + Math.random() * 0.08,
      speed: 0.3 + Math.random() * 0.7,
    }));
    setParticles(p);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        if (username.length < 3) throw new Error("Username must be at least 3 characters.");
        if (!/^[a-zA-Z0-9_-]+$/.test(username))
          throw new Error("Username can only contain letters, numbers, _ and -");

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
            emailRedirectTo: `${location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setSuccess("Account created! Check your email to confirm, then sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const challenges = [
    { label: "Forensics File Carving", pts: 300 },
    { label: "Browser History Hacking", pts: 250 },
    { label: "Windows Password Hacking", pts: 350 },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse 100% 80% at 50% -10%, rgba(21,101,192,0.22) 0%, #020b17 65%)" }}>

      {/* Animated grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(21,101,192,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(21,101,192,0.07) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

      {/* Floating particles */}
      {particles.map((p, i) => (
        <div key={i} className="absolute font-mono text-sm pointer-events-none select-none"
          style={{ left: `${p.x}%`, top: `${p.y}%`, opacity: p.opacity, color: "#26c6da",
            animation: `fadeInUp ${2 + p.speed}s ease-in-out infinite alternate`, animationDelay: `${i * 0.3}s` }}>
          {p.char}
        </div>
      ))}

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-12 items-center">

        {/* Left: Branding */}
        <div className="flex-1 text-center lg:text-left animate-fade-in-up">
          <div className="flex items-center gap-3 justify-center lg:justify-start mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-cyan-glow opacity-20 blur-xl scale-150" />
              <Shield className="w-12 h-12 relative z-10" style={{ color: "#26c6da", filter: "drop-shadow(0 0 12px rgba(38,198,218,0.7))" }} />
            </div>
            <span className="font-mono text-2xl font-bold tracking-widest uppercase glow-text" style={{ color: "#26c6da" }}>
              CTF<span style={{ color: "#fff" }}>Platform</span>
            </span>
          </div>

          <h1 className="font-mono text-4xl lg:text-5xl font-bold mb-4 leading-tight" style={{ color: "#e8f0ff" }}>
            Can you <span style={{ color: "#26c6da" }} className="glow-text">capture</span>
            <br />the flags?
          </h1>
          <p className="text-ice-200 text-lg mb-8 max-w-md lg:mx-0 mx-auto" style={{ color: "#9db0dc" }}>
            Test your skills in digital forensics, web exploitation, and more. Climb the leaderboard.
          </p>

          {/* Challenge previews */}
          <div className="space-y-2 max-w-xs lg:mx-0 mx-auto">
            {challenges.map((c, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5 rounded-lg border animate-slide-in"
                style={{ borderColor: "rgba(21,101,192,0.3)", background: "rgba(13,31,60,0.5)", animationDelay: `${i * 100 + 200}ms` }}>
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#26c6da" }} />
                  <span className="font-mono text-xs" style={{ color: "#c5d3f0" }}>{c.label}</span>
                </div>
                <span className="font-mono text-xs font-bold" style={{ color: "#26c6da" }}>{c.pts} pts</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Auth Form */}
        <div className="w-full max-w-md animate-fade-in-up delay-200">
          <div className="ctf-card p-8">
            {/* Tabs */}
            <div className="flex mb-8 rounded-lg overflow-hidden border" style={{ borderColor: "rgba(21,101,192,0.3)" }}>
              {(["signin", "signup"] as Mode[]).map((m) => (
                <button key={m} onClick={() => { setMode(m); setError(null); setSuccess(null); }}
                  className="flex-1 py-3 font-mono text-sm uppercase tracking-widest transition-all duration-200"
                  style={{
                    background: mode === m ? "linear-gradient(135deg, #1565c0, #0d47a1)" : "transparent",
                    color: mode === m ? "#fff" : "#9db0dc",
                    borderRight: m === "signin" ? "1px solid rgba(21,101,192,0.3)" : "none",
                  }}>
                  {m === "signin" ? "Sign In" : "Register"}
                </button>
              ))}
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {mode === "signup" && (
                <div className="relative animate-fade-in-up">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#26c6da" }} />
                  <input className="ctf-input pl-10" type="text" placeholder="username" value={username}
                    onChange={(e) => setUsername(e.target.value)} required autoComplete="username" />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#26c6da" }} />
                <input className="ctf-input pl-10" type="email" placeholder="email@example.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#26c6da" }} />
                <input className="ctf-input pl-10 pr-10" type={showPw ? "text" : "password"} placeholder="password"
                  value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete={mode === "signup" ? "new-password" : "current-password"} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity">
                  {showPw ? <EyeOff className="w-4 h-4" style={{ color: "#9db0dc" }} /> : <Eye className="w-4 h-4" style={{ color: "#9db0dc" }} />}
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg animate-fade-in-up"
                  style={{ background: "rgba(239,83,80,0.1)", border: "1px solid rgba(239,83,80,0.3)" }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#ef5350" }} />
                  <p className="text-sm font-mono" style={{ color: "#ef9a9a" }}>{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg animate-fade-in-up"
                  style={{ background: "rgba(38,198,218,0.1)", border: "1px solid rgba(38,198,218,0.3)" }}>
                  <Shield className="w-4 h-4 flex-shrink-0" style={{ color: "#26c6da" }} />
                  <p className="text-sm font-mono" style={{ color: "#80deea" }}>{success}</p>
                </div>
              )}

              <button type="submit" disabled={loading} className="ctf-btn-primary w-full mt-2">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 rounded-full border-t-transparent animate-spin"
                      style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} />
                    Processing...
                  </span>
                ) : mode === "signin" ? "▶ Access Terminal" : "▶ Create Account"}
              </button>
            </form>

            <p className="mt-6 text-center font-mono text-xs" style={{ color: "#9db0dc" }}>
              {mode === "signin" ? "No account? " : "Already registered? "}
              <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="hover:underline transition-colors" style={{ color: "#26c6da" }}>
                {mode === "signin" ? "Register here" : "Sign in"}
              </button>
            </p>
          </div>

          <p className="mt-4 text-center font-mono text-xs" style={{ color: "rgba(156,176,220,0.4)" }}>
            All challenges are legal and sandboxed. Happy hacking.
          </p>
        </div>
      </div>
    </div>
  );
}
