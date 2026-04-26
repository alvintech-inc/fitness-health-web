"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Activity,
  Droplets,
  Flame,
  Heart,
  Moon,
  Scale,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

// ─── Fake Data ────────────────────────────────────────────────────────────────

const stepsData = [
  { day: "Mon", steps: 8432 },
  { day: "Tue", steps: 11205 },
  { day: "Wed", steps: 7845 },
  { day: "Thu", steps: 9523 },
  { day: "Fri", steps: 12100 },
  { day: "Sat", steps: 6732 },
  { day: "Sun", steps: 9874 },
];

const caloriesData = [
  { day: "Mon", consumed: 2100, burned: 2350 },
  { day: "Tue", consumed: 1850, burned: 2600 },
  { day: "Wed", consumed: 2300, burned: 2200 },
  { day: "Thu", consumed: 1980, burned: 2450 },
  { day: "Fri", consumed: 2150, burned: 2800 },
  { day: "Sat", consumed: 2400, burned: 2100 },
  { day: "Sun", consumed: 2050, burned: 2300 },
];

const sleepData = [
  { day: "Mon", deep: 1.5, light: 3.2, rem: 1.8 },
  { day: "Tue", deep: 2.1, light: 3.5, rem: 2.0 },
  { day: "Wed", deep: 1.2, light: 2.8, rem: 1.4 },
  { day: "Thu", deep: 1.8, light: 3.1, rem: 1.9 },
  { day: "Fri", deep: 2.3, light: 3.7, rem: 2.1 },
  { day: "Sat", deep: 2.5, light: 4.0, rem: 2.2 },
  { day: "Sun", deep: 1.9, light: 3.3, rem: 1.8 },
];

const heartRateData = [
  { date: "Apr 13", resting: 65, active: 142 },
  { date: "Apr 14", resting: 63, active: 138 },
  { date: "Apr 15", resting: 67, active: 145 },
  { date: "Apr 16", resting: 62, active: 140 },
  { date: "Apr 17", resting: 64, active: 152 },
  { date: "Apr 18", resting: 61, active: 135 },
  { date: "Apr 19", resting: 63, active: 143 },
  { date: "Apr 20", resting: 66, active: 148 },
  { date: "Apr 21", resting: 62, active: 137 },
  { date: "Apr 22", resting: 60, active: 142 },
  { date: "Apr 23", resting: 63, active: 150 },
  { date: "Apr 24", resting: 61, active: 138 },
  { date: "Apr 25", resting: 59, active: 144 },
  { date: "Apr 26", resting: 62, active: 141 },
];

const workoutData = [
  { name: "Running", value: 35, fill: "var(--chart-1)" },
  { name: "Strength", value: 28, fill: "var(--chart-2)" },
  { name: "Cycling", value: 18, fill: "var(--chart-3)" },
  { name: "Yoga", value: 12, fill: "var(--chart-4)" },
  { name: "Swimming", value: 7, fill: "var(--chart-5)" },
];

const goals = [
  { label: "Daily Steps", current: 9874, target: 10000, unit: "steps", pct: 99 },
  { label: "Active Minutes", current: 48, target: 60, unit: "min", pct: 80 },
  { label: "Water Intake", current: 2.1, target: 2.5, unit: "L", pct: 84 },
  { label: "Calories Burned", current: 2300, target: 2500, unit: "kcal", pct: 92 },
  { label: "Sleep", current: 7.5, target: 8, unit: "hrs", pct: 94 },
];

// ─── Chart Configs ─────────────────────────────────────────────────────────────

const stepsConfig = {
  steps: { label: "Steps", color: "var(--chart-1)" },
} satisfies ChartConfig;

const caloriesConfig = {
  consumed: { label: "Consumed", color: "var(--chart-3)" },
  burned: { label: "Burned", color: "var(--chart-1)" },
} satisfies ChartConfig;

const sleepConfig = {
  deep: { label: "Deep", color: "var(--chart-1)" },
  light: { label: "Light", color: "var(--chart-3)" },
  rem: { label: "REM", color: "var(--chart-4)" },
} satisfies ChartConfig;

const heartRateConfig = {
  resting: { label: "Resting HR", color: "var(--chart-1)" },
  active: { label: "Active Peak", color: "var(--chart-2)" },
} satisfies ChartConfig;

const workoutConfig = {
  Running: { label: "Running", color: "var(--chart-1)" },
  Strength: { label: "Strength", color: "var(--chart-2)" },
  Cycling: { label: "Cycling", color: "var(--chart-3)" },
  Yoga: { label: "Yoga", color: "var(--chart-4)" },
  Swimming: { label: "Swimming", color: "var(--chart-5)" },
} satisfies ChartConfig;

const axisProps = {
  tickLine: false,
  axisLine: false,
  tickMargin: 8,
  tick: { fontSize: 11 },
};

// ─── Stat Card ─────────────────────────────────────────────────────────────────

type Trend = "up" | "down" | "neutral";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
  trendLabel,
  accentClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  trend?: Trend;
  trendLabel?: string;
  accentClass?: string;
}) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{label}</span>
          <div className={cn("rounded-lg p-1.5", accentClass ?? "bg-primary/10 text-primary")}>
            <Icon className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="flex items-end justify-between gap-2">
          <p className="text-xl font-semibold leading-none">{value}</p>
          {trend && trendLabel && (
            <span
              className={cn(
                "flex items-center gap-0.5 text-xs",
                trend === "up"
                  ? "text-emerald-500"
                  : trend === "down"
                    ? "text-red-500"
                    : "text-muted-foreground",
              )}
            >
              {trend === "up" && <TrendingUp className="h-3 w-3" />}
              {trend === "down" && <TrendingDown className="h-3 w-3" />}
              {trendLabel}
            </span>
          )}
        </div>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Good morning, Alex</h1>
          <p className="text-sm text-muted-foreground">Here&apos;s your health summary for today.</p>
        </div>
        <Badge variant="outline" className="w-fit">Sunday, Apr 26</Badge>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard
          icon={Activity}
          label="Steps Today"
          value="9,874"
          sub="Goal: 10,000 steps"
          trend="up"
          trendLabel="+12%"
          accentClass="bg-emerald-500/10 text-emerald-500"
        />
        <StatCard
          icon={Flame}
          label="Calories Burned"
          value="2,300"
          sub="Goal: 2,500 kcal"
          trend="up"
          trendLabel="+5%"
          accentClass="bg-orange-500/10 text-orange-500"
        />
        <StatCard
          icon={Heart}
          label="Resting HR"
          value="62 bpm"
          sub="Normal range"
          trend="down"
          trendLabel="-3 bpm"
          accentClass="bg-red-500/10 text-red-500"
        />
        <StatCard
          icon={Moon}
          label="Sleep"
          value="7h 30m"
          sub="Last night"
          trend="up"
          trendLabel="+30m"
          accentClass="bg-violet-500/10 text-violet-500"
        />
        <StatCard
          icon={Droplets}
          label="Water"
          value="2.1 L"
          sub="Goal: 2.5 L"
          trend="neutral"
          trendLabel="84%"
          accentClass="bg-blue-500/10 text-blue-500"
        />
        <StatCard
          icon={Scale}
          label="Weight"
          value="74.2 kg"
          sub="BMI: 22.4"
          trend="down"
          trendLabel="-0.3 kg"
          accentClass="bg-pink-500/10 text-pink-500"
        />
      </div>

      {/* Steps + Workout Mix */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Daily Steps</CardTitle>
            <CardDescription>Step count over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={stepsConfig} className="h-56 w-full">
              <AreaChart data={stepsData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradSteps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-steps)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--color-steps)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="day" {...axisProps} />
                <YAxis
                  domain={[5000, 13000]}
                  {...axisProps}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="steps"
                  type="monotone"
                  stroke="var(--color-steps)"
                  strokeWidth={2}
                  fill="url(#gradSteps)"
                  dot={{ r: 3, fill: "var(--color-steps)" }}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workout Mix</CardTitle>
            <CardDescription>This month&apos;s activity breakdown</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <ChartContainer config={workoutConfig} className="h-44 w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                <Pie
                  data={workoutData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={76}
                  strokeWidth={2}
                >
                  {workoutData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5">
              {workoutData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <span
                    className="h-2 w-2 shrink-0 rounded-[2px]"
                    style={{ background: d.fill }}
                  />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-medium">{d.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calories + Sleep */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calories</CardTitle>
            <CardDescription>Consumed vs. burned this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={caloriesConfig} className="h-56 w-full">
              <BarChart
                data={caloriesData}
                margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                barGap={4}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="day" {...axisProps} />
                <YAxis domain={[1500, 3000]} {...axisProps} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="consumed"
                  fill="var(--color-consumed)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={22}
                />
                <Bar
                  dataKey="burned"
                  fill="var(--color-burned)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={22}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sleep Breakdown</CardTitle>
            <CardDescription>Deep / Light / REM hours this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={sleepConfig} className="h-56 w-full">
              <BarChart data={sleepData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="day" {...axisProps} />
                <YAxis {...axisProps} tickFormatter={(v) => `${v}h`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="deep" stackId="sleep" fill="var(--color-deep)" maxBarSize={32} />
                <Bar dataKey="light" stackId="sleep" fill="var(--color-light)" maxBarSize={32} />
                <Bar
                  dataKey="rem"
                  stackId="sleep"
                  fill="var(--color-rem)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Heart Rate + Goals */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Heart Rate</CardTitle>
            <CardDescription>Resting vs. active peak over the last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={heartRateConfig} className="h-56 w-full">
              <LineChart data={heartRateData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="date" {...axisProps} />
                <YAxis domain={[50, 160]} {...axisProps} tickFormatter={(v) => `${v}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  dataKey="resting"
                  type="monotone"
                  stroke="var(--color-resting)"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
                <Line
                  dataKey="active"
                  type="monotone"
                  stroke="var(--color-active)"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  dot={{ r: 2 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <CardTitle>Today&apos;s Goals</CardTitle>
            </div>
            <CardDescription>Your daily progress</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {goals.map((goal) => (
              <div key={goal.label} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{goal.label}</span>
                  <span className="text-muted-foreground">
                    {goal.current} / {goal.target} {goal.unit}
                  </span>
                </div>
                <Progress value={goal.pct} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
