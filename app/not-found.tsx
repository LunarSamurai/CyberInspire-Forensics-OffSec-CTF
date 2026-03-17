import Link from "next/link";
import { Shield } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "#020b17" }}>
      <div className="text-center">
        <Shield className="w-16 h-16 mx-auto mb-4" style={{ color: "rgba(21,101,192,0.4)" }} />
        <p className="font-mono text-6xl font-bold mb-2" style={{ color: "rgba(21,101,192,0.5)" }}>404</p>
        <p className="font-mono text-xl mb-2" style={{ color: "#e8f0ff" }}>Challenge not found</p>
        <p className="font-mono text-sm mb-8" style={{ color: "#9db0dc" }}>This flag doesn't exist in our system.</p>
        <Link href="/dashboard" className="ctf-btn-primary inline-block">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
