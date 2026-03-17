"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Shield, LayoutDashboard, Trophy, LogOut, Menu, X, Terminal } from "lucide-react";

interface NavbarProps {
  username?: string;
}

export default function Navbar({ username }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const links = [
    { href: "/dashboard", label: "Challenges", icon: LayoutDashboard },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b"
      style={{ background: "rgba(2,11,23,0.92)", borderColor: "rgba(21,101,192,0.25)", backdropFilter: "blur(16px)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <Shield className="w-7 h-7 transition-all group-hover:scale-110"
              style={{ color: "#26c6da", filter: "drop-shadow(0 0 8px rgba(38,198,218,0.5))" }} />
            <span className="font-mono font-bold tracking-widest text-base uppercase" style={{ color: "#e8f0ff" }}>
              Cyber<span style={{ color: "#26c6da" }}>Inspire</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm uppercase tracking-wider transition-all duration-200"
                style={{
                  color: pathname === href ? "#26c6da" : "#9db0dc",
                  background: pathname === href ? "rgba(38,198,218,0.1)" : "transparent",
                  border: pathname === href ? "1px solid rgba(38,198,218,0.25)" : "1px solid transparent",
                }}>
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Right: user + signout */}
          <div className="hidden md:flex items-center gap-3">
            {username && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-sm"
                style={{ borderColor: "rgba(21,101,192,0.3)", background: "rgba(13,31,60,0.5)", color: "#26c6da" }}>
                <Terminal className="w-3.5 h-3.5" />
                {username}
                <span className="animate-blink" style={{ color: "#26c6da" }}>█</span>
              </div>
            )}
            <button onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm uppercase tracking-wider transition-all hover:border-opacity-60"
              style={{ color: "#9db0dc", border: "1px solid rgba(239,83,80,0.3)", background: "transparent" }}
              onMouseEnter={e => { (e.target as HTMLElement).closest("button")!.style.color = "#ef9a9a"; }}
              onMouseLeave={e => { (e.target as HTMLElement).closest("button")!.style.color = "#9db0dc"; }}>
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: "#9db0dc" }}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-4 space-y-1 animate-fade-in-up">
            {links.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-lg font-mono text-sm uppercase tracking-wider"
                style={{ color: pathname === href ? "#26c6da" : "#9db0dc", background: pathname === href ? "rgba(38,198,218,0.08)" : "transparent" }}>
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            {username && (
              <div className="flex items-center gap-2 px-4 py-2 font-mono text-sm" style={{ color: "#26c6da" }}>
                <Terminal className="w-4 h-4" /> {username}
              </div>
            )}
            <button onClick={handleSignOut}
              className="flex items-center gap-2 w-full px-4 py-3 rounded-lg font-mono text-sm uppercase tracking-wider"
              style={{ color: "#ef9a9a", background: "rgba(239,83,80,0.08)" }}>
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
