import Link from "next/link";
import { Activity, ArrowRight, Droplets, Flame, Heart, Moon, Zap } from "lucide-react";
import { startRoute } from "../config";

const stats = [
    { icon: Activity, label: "Steps Today", value: "9,874", color: "text-emerald-400", bg: "bg-emerald-500/15", bar: "85%" },
    { icon: Flame, label: "Calories Burned", value: "2,300 kcal", color: "text-orange-400", bg: "bg-orange-500/15", bar: "92%" },
    { icon: Heart, label: "Resting HR", value: "62 bpm", color: "text-red-400", bg: "bg-red-500/15", bar: "75%" },
    { icon: Moon, label: "Sleep", value: "7h 30m", color: "text-violet-400", bg: "bg-violet-500/15", bar: "94%" },
    { icon: Droplets, label: "Water", value: "2.1 L", color: "text-blue-400", bg: "bg-blue-500/15", bar: "84%" },
];

export function LandingHero() {
    return (
        <section className="relative overflow-hidden bg-background pt-32 pb-20 sm:pt-40 sm:pb-28">
            {/* Background */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-x-0 -top-24 h-160 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(96,165,250,0.15),transparent)]" />
                <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute left-16 bottom-16 h-56 w-56 rounded-full bg-emerald-500/8 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
                    {/* Left */}
                    <div className="space-y-8">
                        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                            <Zap className="h-3 w-3" />
                            Personal Health Tracking
                        </span>

                        <div className="space-y-5">
                            <h1 className="max-w-2xl text-5xl font-bold tracking-tight text-foreground sm:text-6xl leading-[1.08]">
                                Your health, tracked.{" "}
                                <span className="bg-linear-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent">
                                    Every single day.
                                </span>
                            </h1>
                            <p className="max-w-xl text-lg leading-8 text-muted-foreground">
                                Responsibly brings together your steps, calories, heart rate, sleep, and workouts into one beautiful dashboard — so you always know where you stand and what to focus on next.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                href={startRoute}
                                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:brightness-110"
                            >
                                Start tracking free
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <a
                                href="#how-it-works"
                                className="inline-flex items-center gap-2 rounded-full border border-border bg-transparent px-6 py-3 text-sm font-medium text-foreground transition hover:bg-accent"
                            >
                                See how it works
                            </a>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                            {["No credit card required", "Setup in 2 minutes", "Cancel anytime"].map((item) => (
                                <div key={item} className="flex items-center gap-2">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 text-[10px] font-bold">
                                        ✓
                                    </span>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Dashboard mock */}
                    <div className="relative">
                        {/* Floating achievement badge */}
                        <div className="absolute -top-5 -right-2 z-10 rounded-2xl border border-white/10 bg-card/95 backdrop-blur-xl px-4 py-3 shadow-xl">
                            <div className="flex items-center gap-2.5">
                                <span className="text-xl">🏆</span>
                                <div>
                                    <p className="text-xs font-semibold text-foreground leading-tight">Goal Achieved!</p>
                                    <p className="text-[11px] text-muted-foreground">10,000 steps · 7 days in a row</p>
                                </div>
                            </div>
                        </div>

                        {/* Main card */}
                        <div className="overflow-hidden rounded-2xl border border-white/10 bg-card/50 p-1 shadow-2xl shadow-primary/10 backdrop-blur-xl">
                            <div className="rounded-xl border border-white/5 bg-background/80 p-5 space-y-4">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Today&apos;s Summary</p>
                                        <p className="text-sm font-semibold text-foreground mt-0.5">Good morning, Alex</p>
                                    </div>
                                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold text-emerald-500">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Live
                                    </span>
                                </div>

                                {/* Stat rows */}
                                <div className="space-y-2">
                                    {stats.map((stat) => (
                                        <div key={stat.label} className="flex items-center gap-3 rounded-xl bg-white/5 px-3.5 py-3">
                                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${stat.bg}`}>
                                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                                                    <span className={`text-xs font-bold ${stat.color}`}>{stat.value}</span>
                                                </div>
                                                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                                                    <div
                                                        className="h-full rounded-full bg-linear-to-r from-primary to-blue-400"
                                                        style={{ width: stat.bar }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Stats row */}
                                <div className="grid grid-cols-3 gap-2.5 pt-1">
                                    <div className="rounded-xl border border-white/8 bg-white/5 p-3 text-center">
                                        <p className="text-[10px] text-muted-foreground">Goals Met</p>
                                        <p className="mt-1 text-base font-bold text-emerald-500">4 / 5</p>
                                    </div>
                                    <div className="rounded-xl border border-white/8 bg-white/5 p-3 text-center">
                                        <p className="text-[10px] text-muted-foreground">Streak</p>
                                        <p className="mt-1 text-base font-bold text-orange-400">7d 🔥</p>
                                    </div>
                                    <div className="rounded-xl border border-white/8 bg-white/5 p-3 text-center">
                                        <p className="text-[10px] text-muted-foreground">BMI</p>
                                        <p className="mt-1 text-base font-bold text-foreground">22.4</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating activity card */}
                        <div className="absolute -bottom-5 -left-4 rounded-2xl border border-white/10 bg-card/95 backdrop-blur-xl px-4 py-3 shadow-xl">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-base">🏃</div>
                                <div>
                                    <p className="text-[11px] text-muted-foreground">Workout logged</p>
                                    <p className="text-sm font-bold text-foreground">Running · 5.2 km · 28 min</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
