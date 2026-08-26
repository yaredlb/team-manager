import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Shield,
  UsersRound,
} from "lucide-react";

const features = [
  {
    title: "Organize your roster",
    description:
      "Add players, assign positions and shirt numbers, and track matchday availability.",
    icon: UsersRound,
  },
  {
    title: "Build a valid lineup",
    description:
      "Select a formation-aware starting XI and avoid invalid position combinations.",
    icon: Shield,
  },
  {
    title: "Plan the bench",
    description:
      "Set substitution priority and make direct same-position swaps when plans change.",
    icon: ClipboardCheck,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <section className="relative border-b border-white/10 px-5 pb-20 pt-7 sm:px-8 md:pb-28">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-50 [background-size:42px_42px] [background-image:linear-gradient(to_right,rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.07)_1px,transparent_1px)]" />
        <div className="pointer-events-none absolute -right-32 top-0 -z-10 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />

        <header className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 font-mono text-xs font-bold text-emerald-400">
              TM
            </span>

            <span>
              <span className="block text-sm font-semibold text-white">
                Team Manager
              </span>
              <span className="block text-xs text-slate-500">
                Football workspace
              </span>
            </span>
          </Link>

          <Link
            href="/login"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/25 hover:text-white"
          >
            Sign in
          </Link>
        </header>

        <div className="mx-auto grid max-w-6xl gap-14 pb-8 pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-28">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.17em] text-emerald-400">
              Football team workspace
            </p>

            <h1 className="mt-6 max-w-3xl text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl md:text-7xl">
              Build a better matchday plan.
            </h1>

            <p className="mt-7 max-w-2xl text-pretty text-lg leading-8 text-slate-300 sm:text-xl">
              Team Manager helps coaches organize their roster, track player
              availability, build formation-aware lineups, and prioritize the
              bench—all in one focused workspace.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                Open workspace
                <ArrowRight size={17} aria-hidden="true" />
              </Link>

              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-3 font-medium text-slate-200 transition hover:border-white/25 hover:text-white"
              >
                Explore features
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400">
              {[
                "Roster management",
                "Formation validation",
                "Bench priority",
              ].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <CheckCircle2
                    size={16}
                    className="text-emerald-400"
                    aria-hidden="true"
                  />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-2xl shadow-black/30 backdrop-blur sm:p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>

              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500">
                Matchday workspace
              </span>
            </div>

            <div className="p-3 pt-7 sm:p-5 sm:pt-8">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.15em] text-emerald-400">
                    Team overview
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    Ready for kickoff
                  </h2>
                </div>

                <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 font-mono text-[10px] text-emerald-300">
                  4-3-3
                </span>
              </div>

              <div className="mt-7 grid grid-cols-3 gap-3">
                {[
                  ["18", "Roster"],
                  ["15", "Available"],
                  ["11", "Starting"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
                  >
                    <p className="font-mono text-lg text-white">{value}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-200">
                    Starting XI
                  </p>
                  <span className="font-mono text-xs text-emerald-300">
                    11 / 11
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-4 gap-2">
                  {Array.from({ length: 11 }).map((_, index) => (
                    <span
                      key={index}
                      className="h-9 rounded-md border border-emerald-400/25 bg-emerald-400/10"
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/70 p-4">
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    Bench priority
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    5 substitutes selected
                  </p>
                </div>

                <span className="font-mono text-sm text-emerald-300">
                  READY
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="px-5 py-20 sm:px-8 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.17em] text-emerald-400">
              Built for matchday
            </p>

            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
              A focused workspace for team decisions.
            </h2>

            <p className="mt-4 text-lg leading-8 text-slate-400">
              Keep the important details connected, from the full roster to the
              final bench order.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.025] p-6"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-400">
                    <Icon size={19} aria-hidden="true" />
                  </span>

                  <h3 className="mt-8 text-xl font-medium text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.02] px-5 py-20 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.17em] text-emerald-400">
              Get started
            </p>

            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
              One team. One clear plan.
            </h2>
          </div>

          <Link
            href="/login"
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-emerald-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300"
          >
            Create your workspace
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
