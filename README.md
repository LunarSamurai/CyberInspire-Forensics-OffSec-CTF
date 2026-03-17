# 🏴 CTF Platform

A sleek, hacker-aesthetic Capture The Flag platform built with **Next.js 14**, **Supabase**, **Tailwind CSS**, and deployed on **Vercel**.

---

## ✨ Features

- 🔐 **Auth** — Email/password sign-up & sign-in (Supabase Auth)
- 🏆 **Leaderboard** — Live scoreboard ranked by points & earliest solve time
- 🎯 **3 Challenges** — Forensics File Carving, Browser History Hacking, Windows Password Hacking
- 🎉 **Confetti** on correct flag submission (canvas-confetti)
- 💥 **Shake + red flash** on wrong flag submission
- 💡 **Hints** unlock after 2 failed attempts
- 🌐 **Responsive** — Works on mobile & desktop
- ⚡ **ISR** — Leaderboard refreshes every 30 seconds

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd ctf-platform
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. In the SQL Editor, paste and run `supabase/schema.sql`
3. Copy your **Project URL** and **anon public key** from Project Settings → API

### 3. Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### 4. Add Your Flags

Edit `supabase/schema.sql` (bottom of file) — replace the placeholder flags:

```sql
'CTF{YOUR_FORENSICS_FLAG_HERE}'   -- File Carving
'CTF{YOUR_BROWSER_FLAG_HERE}'     -- Browser History
'CTF{YOUR_WINDOWS_FLAG_HERE}'     -- Windows Password
```

Or update them directly in the Supabase Table Editor after running the schema.

### 5. Run Dev Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deploy to Vercel

```bash
npm i -g vercel
vercel
```

When prompted, add your environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Or via the Vercel Dashboard → Project Settings → Environment Variables.

**Important:** In your Supabase project, go to:
**Authentication → URL Configuration** → add your Vercel URL to:
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/auth/callback`

---

## 📁 Project Structure

```
ctf-platform/
├── app/
│   ├── page.tsx                    # Sign in / Register
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles + animations
│   ├── not-found.tsx
│   ├── auth/callback/route.ts      # OAuth callback
│   ├── dashboard/page.tsx          # Challenge board
│   ├── challenges/[slug]/page.tsx  # Challenge detail + flag submit
│   └── leaderboard/page.tsx        # Scoreboard
├── components/
│   ├── Navbar.tsx                  # Navigation bar
│   └── FlagSubmitForm.tsx          # Flag submission with confetti/shake
├── lib/
│   ├── types.ts                    # TypeScript types
│   └── supabase/
│       ├── client.ts               # Browser Supabase client
│       └── server.ts               # Server Supabase client
├── supabase/
│   └── schema.sql                  # Full DB schema + seed data
├── middleware.ts                   # Auth route protection
├── tailwind.config.ts
└── vercel.json
```

---

## 🗄️ Database Schema

| Table        | Purpose                              |
|--------------|--------------------------------------|
| `profiles`   | Extends auth.users with username     |
| `challenges` | CTF challenges with flags & metadata |
| `solves`     | One row per user-challenge solve     |
| `scoreboard` | View: aggregated scores & rankings   |

---

## 🎮 Adding More Challenges

Insert into the `challenges` table:

```sql
INSERT INTO public.challenges (slug, title, category, description, points, flag, hint, difficulty)
VALUES (
  'my-new-challenge',
  'My New Challenge',
  'forensics',
  'Description of the challenge...',
  200,
  'CTF{my_real_flag}',
  'Optional hint shown after 2 failed attempts',
  'medium'
);
```

---

## 🎨 Design

- **Font**: Share Tech Mono (headings) + IBM Plex Sans (body)
- **Palette**: Deep navy `#020B17` · Cobalt `#1565C0` · Cyan glow `#26C6DA`
- **Effects**: Scanlines overlay, grid background, CSS glow animations, confetti

---

## 🔒 Security Notes

- Flags are stored in the `challenges` table — ensure **RLS** is enabled (the schema does this)
- The `flag` column is NOT exposed to the client. Flag checking happens server-side via Supabase RLS — authenticated users can read challenges but the flag comparison logic lives in the server component / API
- One solve per user per challenge enforced by DB unique constraint
- Consider hashing flags with bcrypt if you want extra security (update the flag comparison logic accordingly)
