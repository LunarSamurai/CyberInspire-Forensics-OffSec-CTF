"use client";

import { useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Flag, CheckCircle2, XCircle, Lightbulb, ChevronRight } from "lucide-react";
import type { Challenge } from "@/lib/types";

interface FlagSubmitFormProps {
  challenge: Challenge;
  userId: string;
  alreadySolved: boolean;
  onSolve: () => void;
}

export default function FlagSubmitForm({ challenge, userId, alreadySolved, onSolve }: FlagSubmitFormProps) {
  const [flag, setFlag] = useState("");
  const [status, setStatus] = useState<"idle" | "correct" | "wrong" | "loading">("idle");
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const formRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const fireConfetti = useCallback(async () => {
    const confetti = (await import("canvas-confetti")).default;

    // First burst — center
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { x: 0.5, y: 0.6 },
      colors: ["#26c6da", "#1565c0", "#ffffff", "#42a5f5", "#80deea"],
      startVelocity: 45,
      gravity: 0.9,
      ticks: 200,
    });

    // Side bursts
    setTimeout(() => {
      confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0, y: 0.65 }, colors: ["#26c6da", "#ffffff", "#1976d2"] });
      confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 0.65 }, colors: ["#26c6da", "#ffffff", "#1976d2"] });
    }, 150);

    // Final shower
    setTimeout(() => {
      confetti({ particleCount: 80, spread: 100, origin: { x: 0.5, y: 0.4 }, colors: ["#26c6da", "#fff", "#42a5f5"], gravity: 1.2 });
    }, 400);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flag.trim() || status === "loading" || alreadySolved) return;

    setStatus("loading");

    // Normalize: trim whitespace, compare case-insensitively
    const submitted = flag.trim();
    const correct = challenge.flag.trim();
    const isCorrect = submitted === correct || submitted.toLowerCase() === correct.toLowerCase();

    if (isCorrect) {
      // Record the solve in Supabase
      await supabase.from("solves").insert({ user_id: userId, challenge_id: challenge.id });
      setStatus("correct");

      if (formRef.current) {
        formRef.current.classList.add("animate-pulse-glow");
        setTimeout(() => formRef.current?.classList.remove("animate-pulse-glow"), 2400);
      }

      fireConfetti();
      setTimeout(onSolve, 1500);
    } else {
      setAttempts((a) => a + 1);
      setStatus("wrong");

      if (formRef.current) {
        formRef.current.classList.add("animate-shake");
        formRef.current.classList.add("animate-red-flash");
        setTimeout(() => {
          formRef.current?.classList.remove("animate-shake");
          formRef.current?.classList.remove("animate-red-flash");
          setStatus("idle");
        }, 600);
      }
    }
  };

  if (alreadySolved) {
    return (
      <div className="rounded-xl p-6 text-center border animate-fade-in-up"
        style={{ background: "rgba(38,198,218,0.08)", borderColor: "rgba(38,198,218,0.4)" }}>
        <CheckCircle2 className="w-12 h-12 mx-auto mb-3" style={{ color: "#26c6da", filter: "drop-shadow(0 0 12px rgba(38,198,218,0.7))" }} />
        <p className="font-mono text-lg font-bold glow-text" style={{ color: "#26c6da" }}>FLAG CAPTURED!</p>
        <p className="font-mono text-sm mt-1" style={{ color: "#80deea" }}>+{challenge.points} points awarded</p>
      </div>
    );
  }

  return (
    <div ref={formRef} className="rounded-xl border p-6 transition-all duration-300"
      style={{ background: "rgba(7,20,40,0.8)", borderColor: status === "correct" ? "rgba(38,198,218,0.5)" : status === "wrong" ? "rgba(239,83,80,0.5)" : "rgba(21,101,192,0.3)" }}>

      <h3 className="font-mono text-sm uppercase tracking-widest mb-4 flex items-center gap-2"
        style={{ color: "#26c6da" }}>
        <Flag className="w-4 h-4" />
        Submit Flag
      </h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm select-none"
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

        <button type="submit" disabled={status === "loading" || !flag.trim()} className="ctf-btn-primary w-full flex items-center justify-center gap-2">
          {status === "loading" ? (
            <>
              <span className="inline-block w-4 h-4 border-2 rounded-full animate-spin"
                style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} />
              Validating...
            </>
          ) : (
            <>
              Submit Flag <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Status messages */}
      {status === "correct" && (
        <div className="mt-4 flex items-center gap-3 p-3 rounded-lg animate-fade-in-up"
          style={{ background: "rgba(38,198,218,0.12)", border: "1px solid rgba(38,198,218,0.4)" }}>
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: "#26c6da" }} />
          <div>
            <p className="font-mono text-sm font-bold" style={{ color: "#26c6da" }}>Correct! Flag accepted.</p>
            <p className="font-mono text-xs mt-0.5" style={{ color: "#80deea" }}>+{challenge.points} points awarded 🏆</p>
          </div>
        </div>
      )}

      {status === "wrong" && (
        <div className="mt-4 flex items-center gap-3 p-3 rounded-lg animate-fade-in-up"
          style={{ background: "rgba(239,83,80,0.08)", border: "1px solid rgba(239,83,80,0.35)" }}>
          <XCircle className="w-5 h-5 flex-shrink-0" style={{ color: "#ef5350" }} />
          <div>
            <p className="font-mono text-sm font-bold" style={{ color: "#ef9a9a" }}>Incorrect flag.</p>
            <p className="font-mono text-xs mt-0.5" style={{ color: "#ef9a9a", opacity: 0.7 }}>Attempt #{attempts} — keep trying.</p>
          </div>
        </div>
      )}

      {/* Hint */}
      {challenge.hint && attempts >= 2 && (
        <div className="mt-4">
          <button onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider transition-colors"
            style={{ color: showHint ? "#26c6da" : "#9db0dc" }}>
            <Lightbulb className="w-3.5 h-3.5" />
            {showHint ? "Hide Hint" : "Show Hint"} (after {attempts} attempts)
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
