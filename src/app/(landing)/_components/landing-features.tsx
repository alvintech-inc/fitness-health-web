import { Activity, BarChart3, Droplets, Flame, Heart, Moon } from "lucide-react";

const features = [
    {
        icon: Activity,
        title: "Step & Activity Tracking",
        description:
            "Monitor your daily step count and active minutes with trend charts. See your week at a glance and stay on pace toward your movement goals.",
        iconColor: "text-emerald-400",
        iconBg: "bg-emerald-400/10",
        glow: "group-hover:bg-emerald-400/5",
    },
    {
        icon: Flame,
        title: "Calorie Management",
        description:
            "Track calories consumed and burned side-by-side. Understand your daily energy balance and make informed decisions about nutrition and exercise.",
        iconColor: "text-orange-400",
        iconBg: "bg-orange-400/10",
        glow: "group-hover:bg-orange-400/5",
    },
    {
        icon: Heart,
        title: "Heart Rate Monitoring",
        description:
            "Visualize resting and active peak heart rate over time. Spot cardiovascular improvements as your fitness level rises week over week.",
        iconColor: "text-red-400",
        iconBg: "bg-red-400/10",
        glow: "group-hover:bg-red-400/5",
    },
    {
        icon: Moon,
        title: "Sleep Analysis",
        description:
            "Break down your nightly rest into Deep, Light, and REM stages. Identify patterns that affect your recovery and daily energy levels.",
        iconColor: "text-violet-400",
        iconBg: "bg-violet-400/10",
        glow: "group-hover:bg-violet-400/5",
    },
    {
        icon: BarChart3,
        title: "Workout Mix",
        description:
            "See a breakdown of your monthly activity types — running, strength, cycling, yoga, and more — to keep your routine balanced and varied.",
        iconColor: "text-blue-400",
        iconBg: "bg-blue-400/10",
        glow: "group-hover:bg-blue-400/5",
    },
    {
        icon: Droplets,
        title: "Hydration & Weight Goals",
        description:
            "Log daily water intake and track weight trends alongside BMI. Set personalised targets and get a clear progress view for every metric.",
        iconColor: "text-cyan-400",
        iconBg: "bg-cyan-400/10",
        glow: "group-hover:bg-cyan-400/5",
    },
];

export function LandingFeatures() {
    return (
        <section
            className="relative overflow-hidden border-t border-border/50 bg-background py-24 sm:py-32"
            id="features"
        >
            {/* Background glows */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-primary/8 blur-3xl" />
                <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-emerald-500/8 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                {/* Header */}
                <div className="mx-auto max-w-2xl space-y-4 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                        Built for your wellbeing
                    </p>
                    <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                        Every health metric, in one place.
                    </h2>
                    <p className="text-base leading-8 text-muted-foreground sm:text-lg">
                        From daily step counts to deep sleep stages — Responsibly surfaces the data that matters most so you can make healthier choices, every day.
                    </p>
                </div>

                {/* Feature grid */}
                <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-7 transition duration-300 hover:-translate-y-1 hover:border-border hover:bg-card/70 hover:shadow-xl hover:shadow-slate-950/5"
                        >
                            <div className={`absolute inset-0 ${feature.glow} transition duration-300`} />
                            <div className="relative">
                                <div
                                    className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.iconBg} transition duration-300`}
                                >
                                    <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                                </div>
                                <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-muted-foreground">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
