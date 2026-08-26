# Team Manager

A full-stack football team-management workspace for organizing a roster, tracking player availability, building a formation-aware starting XI, and prioritizing the bench.

Built as a focused product workflow for coaches and team managers who need a clearer way to prepare for matchday.

## Live Demo

> Add your Vercel deployment URL here after deployment.

## Features

- Email/password authentication with Supabase Auth
- One team workspace per account
- Team onboarding with a configurable default formation
- Roster management with player name, position, shirt number, and availability
- Persistent player data protected by Supabase Row Level Security
- Formation-aware starting XI selection
- Available-player validation for starters and bench selections
- Bench ordering with move-up and move-down controls
- Direct same-position swaps between a starter and bench player
- Dashboard with roster, availability, lineup-readiness, and bench summaries
- Team settings for name, formation, and saved-lineup reset
- Responsive desktop sidebar and mobile bottom navigation

## Tech Stack

| Area           | Technology                  |
| -------------- | --------------------------- |
| Framework      | Next.js App Router          |
| Language       | TypeScript                  |
| Styling        | Tailwind CSS                |
| Authentication | Supabase Auth               |
| Database       | Supabase Postgres           |
| Security       | Supabase Row Level Security |
| Hosting        | Vercel                      |
| Icons          | Lucide React                |

## Core Workflow

```txt
Sign in
→ Create team workspace
→ Add and manage players
→ Track availability
→ Build a formation-aware starting XI
→ Add and prioritize bench players
→ Save the matchday lineup
```

## Screenshots

> Add screenshots after deployment.

| Dashboard                          | Roster                           |
| ---------------------------------- | -------------------------------- |
| `public/screenshots/dashboard.png` | `public/screenshots/players.png` |

| Lineup Builder                  | Team Settings                     |
| ------------------------------- | --------------------------------- |
| `public/screenshots/lineup.png` | `public/screenshots/settings.png` |

## Data Model

The app centers on three Supabase tables:

- `teams` — one team per authenticated user, including team name and formation
- `players` — roster players tied to a team, with position, shirt number, and availability
- `lineup_selections` — saved starter and bench assignments, including lineup order

Row Level Security policies ensure users can only access teams, players, and lineup selections associated with their own account.

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/your-github-username/team-manager.git
cd team-manager
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

### 4. Configure Supabase

Create a Supabase project, enable Email authentication, and add the application callback URL:

```txt
http://localhost:3000/auth/callback
```

Run the SQL schema and Row Level Security policies found in the project setup documentation or Supabase SQL Editor.

### 5. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Key Product Decisions

### One team per account

Version one deliberately supports one team per user. This keeps onboarding and navigation focused on the roster-to-lineup workflow while leaving room for future multi-team support.

### Football-specific positions

The v1 position model uses `GK`, `DEF`, `MID`, and `FWD`. That makes formation validation and lineup-building behavior clear and reliable.

### Safe lineup changes

The app does not automatically delete a saved lineup when users change formation. Instead, it warns users and gives them control to review or clear the lineup, preventing unexpected data loss.

### Same-position starter/bench swaps

Direct swaps are limited to players in the same position. This protects formation validity while allowing faster matchday adjustments.

## Future Improvements

- Multi-team accounts
- Drag-and-drop lineup and bench ordering
- Player editing beyond availability
- Match schedule and opponent tracking
- Matchday notes and player statistics
- Role-based staff access
- Automated test coverage for formation and lineup constraints

## Author

Built by [Yared L Bekele](https://github.com/yaredlb)

- Portfolio: `https://yaredbekele.com`
- LinkedIn: `https://www.linkedin.com/in/yaredbekele/`
