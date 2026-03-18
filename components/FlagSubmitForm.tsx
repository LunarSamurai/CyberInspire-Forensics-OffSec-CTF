"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Flag, CheckCircle2, XCircle, Lightbulb, ChevronRight, TrendingDown } from "lucide-react";
import type { Challenge } from "@/lib/types";

interface FlagSubmitFormProps {
  challenge: Challenge;
  userId: string;
  alreadySolved: boolean;
}

// Scoring formula:
// - First wrong attempt is free (no penalty)
// - From 2nd wrong attempt onwards: -5.38% per attempt
// - Floor: 35% of base points
function calcPoints(base: number, wrongAttempts: number): number {
  const penaltyAttempts = Math.max(0, wrongAttempts - 1); // first attempt is free
  const multiplier = Math.max(0.35, 1 - penaltyAttempts * 0.0538);
  return Math.round(base * multiplier);
}

export default function FlagSubmitForm({ challenge, userId, alreadySolved }: FlagSubmitFormProps) {
  const [flag, setFlag] = useState("");
  const [status, setStatus] = useState<"idle" | "correct" | "wrong" | "loading">("idle");
  const [showHint, setShowHint] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [pointsAwarded, setPointsAwarded] = useState<number | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  // Load existing attempt count on mount
  useEffect(() => {
    const loadAttempts = async () => {
      const { data } = await supabase
        .from("attempts")
        .select("count")
        .eq("user_id", userId)
        .eq("challenge_id", challenge.id)
        .maybeSingle();
      if (data) setWrongAttempts(data.count);
    };
    if (!alreadySolved) loadAttempts();
  }, [userId, challenge.id, alreadySolved]);

  const currentPoints = calcPoints(challenge.points, wrongAttempts);
  const penaltyActive = wrongAttempts > 1;
  const penaltyPct = Math.round((1 - currentPoints / challenge.points) * 100);

  const fireConfetti = useCallback(async () => {
    const confetti = (await import("canvas-confetti")).default;
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { x: 0.5, y: 0.6 },
      colors: ["#26c6da", "#1565c0", "#ffffff", "#42a5f5", "#80deea"],
      startVelocity: 45,
      gravity: 0.9,
      ticks: 200,
    });
    setTimeout(() => {
      confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0, y: 0.65 }, colors: ["#26c6da", "#ffffff", "#1976d2"] });
      confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 0.65 }, colors: ["#26c6da", "#ffffff", "#1976d2"] });
    }, 150);
    setTimeout(() => {
      confetti({ particleCount: 80, spread: 100, origin: { x: 0.5, y: 0.4 }, colors: ["#26c6da", "#fff", "#42a5f5"], gravity: 1.2 });
    }, 400);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flag.trim() || status === "loading" || alreadySolved) return;
    setStatus("loading");

    const submitted = flag.trim();
    const correct = challenge.flag.trim();
    const isCorrect = submitted === correct || submitted.toLowerCase() === correct.toLowerCase();

    if (isCorrect) {
      const awarded = calcPoints(challenge.points, wrongAttempts);
      setPointsAwarded(awarded);

      // Record solve with points awarded
      await supabase.from("solves").insert({
        user_id: userId,
        challenge_id: challenge.id,
        points_awarded: awarded,
      });

      setStatus("correct");
      if (formRef.current) formRef.current.classList.add("animate-pulse-glow");
      fireConfetti();
      setTimeout(() => router.refresh(), 1800);
    } else {
      const newAttempts = wrongAttempts + 1;
      setWrongAttempts(newAttempts);
      setStatus("wrong");

      // Upsert attempt count
      await supabase.from("attempts").upsert(
        { user_id: userId, challenge_id: challenge.id, count: newAttempts },
        { onConflict: "user_id,challenge_id" }
      );

      if (formRef.current) {
        formRef.current.classList.add("animate-shake", "animate-red-flash");
        setTimeout(() => {
          formRef.current?.classList.remove("animate-shake", "animate-red-flash");
          setStatus("idle");
        }, 600);
      }
    }
  };

  if (alreadySolved) {
    return (
      <div className="rounded-xl p-6 text-center border animate-fade-in-up"
        style={{ background: "rgba(38,198,218,0.08)", borderColor: "rgba(38,198,218,0.4)" }}>
        <CheckCircle2 className="w-12 h-12 mx-auto mb-3"
          style={{ color: "#26c6da", filter: "drop-shadow(0 0 12px rgba(38,198,218,0.7))" }} />
        <p className="font-mono text-lg font-bold glow-text" style={{ color: "#26c6da" }}>FLAG CAPTURED!</p>
        <p className="font-mono text-sm mt-1" style={{ color: "#80deea" }}>Points awarded to your score</p>
      </div>
    );
  }

  return (
    <div ref={formRef} className="rounded-xl border p-6 transition-all duration-300"
      style={{
        background: "rgba(7,20,40,0.8)",
        borderColor: status === "correct"
          ? "rgba(38,198,218,0.5)"
          : status === "wrong"
          ? "rgba(239,83,80,0.5)"
          : "rgba(21,101,192,0.3)",
      }}>

      <h3 className="font-mono text-sm uppercase tracking-widest mb-4 flex items-center gap-2"
        style={{ color: "#26c6da" }}>
        <Flag className="w-4 h-4" />
        Submit Flag
      </h3>

      {/* Dynamic points display */}
      <div className="mb-4 p-3 rounded-lg flex items-center justify-between"
        style={{ background: "rgba(2,11,23,0.6)", border: "1px solid rgba(21,101,192,0.2)" }}>
        <div>
          <p className="font-mono text-xs uppercase tracking-wider mb-0.5" style={{ color: "#9db0dc" }}>
            Points if solved now
          </p>
          <div className="flex items-center gap-2">
            <span className="font-mono text-2xl font-bold" style={{ color: penaltyActive ? "#ffb74d" : "#26c6da" }}>
              {currentPoints}
            </span>
            {penaltyActive && (
              <span className="font-mono text-xs" style={{ color: "#ef9a9a" }}>
                (-{penaltyPct}% penalty)
              </span>
            )}
          </div>
        </div>
        {penaltyActive && (
          <TrendingDown className="w-5 h-5" style={{ color: "#ef9a9a" }} />
        )}
        {!penaltyActive && wrongAttempts === 1 && (
          <div className="font-mono text-xs text-right" style={{ color: "#ffb74d" }}>
            ⚠️ Next wrong<br />starts penalty
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm select-none pointer-events-none"
            style={{ color: "rgba(38,198,218,0.5)" }}>
            {">>>"}
          </span>
          <input
            className="ctf-input pl-12"
            type="text"
            placeholder="CTF{your_flag_here}"
            value={flag}
            onChange={(e) => setFlag(e.target.value)}
            disabled={status === "loading" || status === "correct"}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <button
          type="submit"
          disabled={status === "loading" || !flag.trim()}
          className="ctf-btn-primary w-full flex items-center justify-center gap-2"
        >
          {status === "loading" ? (
            <>
              <span className="inline-block w-4 h-4 border-2 rounded-full animate-spin"
                style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} />
              Validating...
            </>
          ) : (
            <>Submit Flag <ChevronRight className="w-4 h-4" /></>
          )}
        </button>
      </form>

      {/* Correct */}
      {status === "correct" && (
        <div className="mt-4 flex items-center gap-3 p-3 rounded-lg animate-fade-in-up"
          style={{ background: "rgba(38,198,218,0.12)", border: "1px solid rgba(38,198,218,0.4)" }}>
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: "#26c6da" }} />
          <div>
            <p className="font-mono text-sm font-bold" style={{ color: "#26c6da" }}>Correct! Flag accepted.</p>
            <p className="font-mono text-xs mt-0.5" style={{ color: "#80deea" }}>
              +{pointsAwarded ?? currentPoints} points awarded 🏆
            </p>
          </div>
        </div>
      )}

      {/* Wrong */}
      {status === "wrong" && (
        <div className="mt-4 flex items-center gap-3 p-3 rounded-lg animate-fade-in-up"
          style={{ background: "rgba(239,83,80,0.08)", border: "1px solid rgba(239,83,80,0.35)" }}>
          <XCircle className="w-5 h-5 flex-shrink-0" style={{ color: "#ef5350" }} />
          <div>
            <p className="font-mono text-sm font-bold" style={{ color: "#ef9a9a" }}>Incorrect flag.</p>
            <p className="font-mono text-xs mt-0.5" style={{ color: "#ef9a9a", opacity: 0.7 }}>
              {wrongAttempts === 1
                ? "First attempt — no penalty yet."
                : `Attempt #${wrongAttempts} — points reduced to ${calcPoints(challenge.points, wrongAttempts)}.`}
            </p>
          </div>
        </div>
      )}

      {/* Scoring info */}
      <div className="mt-4 p-2 rounded font-mono text-xs" style={{ color: "rgba(156,176,220,0.4)", background: "rgba(2,11,23,0.4)" }}>
        -5.38% per wrong attempt after the first · min {Math.round(challenge.points * 0.35)} pts (35%)
      </div>

      {/* Hint after 2 wrong attempts */}
      {challenge.hint && wrongAttempts >= 2 && (
        <div className="mt-3">
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider transition-colors"
            style={{ color: showHint ? "#26c6da" : "#9db0dc" }}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            {showHint ? "Hide Hint" : `Show Hint (after ${wrongAttempts} attempts)`}
          </button>
          {showHint && (
            <div className="mt-2 p-3 rounded-lg text-sm font-mono animate-fade-in-up"
              style={{ background: "rgba(255,183,77,0.07)", border: "1px solid rgba(255,183,77,0.25)", color: "#ffcc80" }}>
              💡 {challenge.hint}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

