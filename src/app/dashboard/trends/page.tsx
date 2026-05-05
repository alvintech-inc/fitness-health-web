"use client";

import * as React from "react";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  Flame,
  Heart,
  Pill,
  TrendingDown,
  TrendingUp,
  Zap,
  Minus,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────

type TimeRange = "3M" | "6M" | "1Y";

interface MonthPoint {
  label: string;
  // Activity
  steps: number;
  mins: number;
  workouts: number;
  // Nutrition
  cal: number;
  protein: number;
  carbs: number;
  fat: number;
  // Labs — null when not measured this month
  ldl: number | null;
  hdl: number | null;
  glucose: number | null;
  hba1c: number | null;
  tg: number | null;
  crp: number | null;
}

interface MedRow {
  name: string;
  dose: string;
  started: string;
  indication: string;
  colorClass: string;
  refLabel: string;
}

// ─── Fake data (May 2025 – Apr 2026) ──────────────────────────────────────────
// Story arc: user steadily increased exercise + improved diet from Sep '25 onward;
// doctor added Atorvastatin in Jan '26 after LDL still elevated at Nov draw.

const ALL_MONTHS: MonthPoint[] = [
  { label: "May '25",  steps: 7200,  mins: 196, workouts: 8,  cal: 2400, protein: 85,  carbs: 280, fat: 90,  ldl: 145, hdl: 42,   glucose: 102, hba1c: 5.8, tg: 180, crp: 2.1  },
  { label: "Jun '25",  steps: 7500,  mins: 210, workouts: 9,  cal: 2350, protein: 88,  carbs: 275, fat: 88,  ldl: null, hdl: null, glucose: null, hba1c: null, tg: null, crp: null },
  { label: "Jul '25",  steps: 8000,  mins: 245, workouts: 10, cal: 2300, protein: 90,  carbs: 270, fat: 85,  ldl: null, hdl: null, glucose: null, hba1c: null, tg: null, crp: null },
  { label: "Aug '25",  steps: 8200,  mins: 266, workouts: 11, cal: 2250, protein: 95,  carbs: 260, fat: 82,  ldl: 138, hdl: 44,   glucose: 99,  hba1c: 5.7, tg: 165, crp: 1.8  },
  { label: "Sep '25",  steps: 9000,  mins: 294, workouts: 14, cal: 2200, protein: 100, carbs: 250, fat: 80,  ldl: null, hdl: null, glucose: null, hba1c: null, tg: null, crp: null },
  { label: "Oct '25",  steps: 9500,  mins: 315, workouts: 16, cal: 2150, protein: 105, carbs: 245, fat: 78,  ldl: null, hdl: null, glucose: null, hba1c: null, tg: null, crp: null },
  { label: "Nov '25",  steps: 10000, mins: 336, workouts: 16, cal: 2100, protein: 108, carbs: 240, fat: 76,  ldl: 125, hdl: 47,   glucose: 95,  hba1c: 5.5, tg: 148, crp: 1.2  },
  { label: "Dec '25",  steps: 9000,  mins: 280, workouts: 12, cal: 2350, protein: 95,  carbs: 275, fat: 90,  ldl: null, hdl: null, glucose: null, hba1c: null, tg: null, crp: null },
  { label: "Jan '26",  steps: 9200,  mins: 294, workouts: 16, cal: 2150, protein: 105, carbs: 245, fat: 78,  ldl: null, hdl: null, glucose: null, hba1c: null, tg: null, crp: null },
  { label: "Feb '26",  steps: 9800,  mins: 315, workouts: 16, cal: 2100, protein: 108, carbs: 235, fat: 76,  ldl: 102, hdl: 52,   glucose: 90,  hba1c: 5.3, tg: 128, crp: 0.8  },
  { label: "Mar '26",  steps: 10500, mins: 350, workouts: 20, cal: 2050, protein: 112, carbs: 230, fat: 74,  ldl: null, hdl: null, glucose: null, hba1c: null, tg: null, crp: null },
  { label: "Apr '26",  steps: 11000, mins: 364, workouts: 20, cal: 2000, protein: 115, carbs: 225, fat: 72,  ldl: null, hdl: null, glucose: null, hba1c: null, tg: null, crp: null },
];

// Only months that have lab results (used for scatter plots)
const LAB_POINTS = ALL_MONTHS.filter((d) => d.ldl !== null) as Required<MonthPoint>[];

const MED_ROWS: MedRow[] = [
  {
    name: "Atorvastatin",
    dose: "10 mg once daily",
    started: "Jan 2026",
    indication: "Elevated LDL cholesterol",
    colorClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    refLabel: "Jan '26",
  },
  {
    name: "Vitamin D3",
    dose: "2000 IU once daily",
    started: "May 2025",
    indication: "Vitamin D insufficiency",
    colorClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    refLabel: "May '25",
  },
];

const TIME_RANGE_SLICES: Record<TimeRange, number> = { "3M": 3, "6M": 6, "1Y": 12 };

const axisProps = {
  tickLine: false,
  axisLine: false,
  tickMargin: 8,
  tick: { fontSize: 11 },
};

// ─── Insight card ──────────────────────────────────────────────────────────────

function InsightCard({
  title,
  value,
  delta,
  direction,
  good,
  sub,
  icon: Icon,
  iconClass,
}: {
  title: string;
  value: string;
  delta: string;
  direction: "up" | "down" | "flat";
  good: boolean;
  sub: string;
  icon: React.ElementType;
  iconClass?: string;
}) {
  const positive = (direction === "down" && good) || (direction === "up" && good);
  const negative = (direction === "down" && !good) || (direction === "up" && !good);

  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{title}</span>
          <div className={cn("rounded-lg p-1.5", iconClass ?? "bg-primary/10 text-primary")}>
            <Icon className="size-3.5" />
          </div>
        </div>
        <div className="flex items-end justify-between gap-2">
          <p className="text-xl font-semibold leading-none">{value}</p>
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs",
              positive ? "text-emerald-500" : negative ? "text-red-500" : "text-muted-foreground",
            )}
          >
            {direction === "up"   && <TrendingUp   className="size-3" />}
            {direction === "down" && <TrendingDown className="size-3" />}
            {direction === "flat" && <Minus        className="size-3" />}
            {delta}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}

// ─── Finding card ──────────────────────────────────────────────────────────────

function FindingCard({
  title,
  titleClass,
  cardClass,
  children,
}: {
  title: string;
  titleClass?: string;
  cardClass?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={cardClass}>
      <CardHeader>
        <CardTitle className={titleClass}>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5 text-sm text-muted-foreground">
        {children}
      </CardContent>
    </Card>
  );
}

// ─── Overview tab ──────────────────────────────────────────────────────────────

const activityConfig: ChartConfig = {
  steps: { label: "Daily Steps", color: "var(--chart-1)" },
  workouts: { label: "Workouts/mo", color: "var(--chart-3)" },
};

const labOverviewConfig: ChartConfig = {
  ldl:     { label: "LDL (mg/dL)",  color: "var(--chart-2)" },
  hdl:     { label: "HDL (mg/dL)",  color: "var(--chart-4)" },
  glucose: { label: "Glucose (mg/dL)", color: "var(--chart-5)" },
};

function OverviewTab({ data }: { data: MonthPoint[] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <InsightCard title="Daily Steps"        value="11,000"     delta="+53% vs baseline" direction="up"   good={true}  sub="Goal: 10,000 ✓" icon={Activity}     iconClass="bg-emerald-500/10 text-emerald-500" />
        <InsightCard title="LDL Cholesterol"    value="102 mg/dL"  delta="−43 mg/dL"        direction="down" good={true}  sub="Near-optimal (<100)" icon={Heart} iconClass="bg-blue-500/10 text-blue-500" />
        <InsightCard title="Fasting Glucose"    value="90 mg/dL"   delta="−12 mg/dL"        direction="down" good={true}  sub="Normal range (<100)" icon={Zap}    iconClass="bg-amber-500/10 text-amber-500" />
        <InsightCard title="Inflammation (CRP)" value="0.8 mg/L"   delta="−62%"             direction="down" good={true}  sub="Low risk (<1.0)" icon={Flame}        iconClass="bg-violet-500/10 text-violet-500" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Physical Activity</CardTitle>
          <CardDescription>Daily steps and monthly workout sessions over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={activityConfig} className="h-52 w-full">
            <ComposedChart data={data} margin={{ top: 4, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis yAxisId="steps"    {...axisProps} domain={[5000, 13000]} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <YAxis yAxisId="workouts" {...axisProps} orientation="right" domain={[4, 24]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <ReferenceLine yAxisId="steps" x="Jan '26" stroke="var(--chart-2)" strokeDasharray="4 2"
                label={{ value: "Atorvastatin", position: "insideTopRight", fontSize: 10, fill: "color-mix(in oklch, var(--muted-foreground), transparent 20%)" }} />
              <Line yAxisId="steps"    dataKey="steps"    stroke="var(--color-steps)"    strokeWidth={2} dot={{ r: 2 }} type="monotone" />
              <Line yAxisId="workouts" dataKey="workouts" stroke="var(--color-workouts)" strokeWidth={2} dot={{ r: 2 }} type="monotone" strokeDasharray="5 3" />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lab Markers</CardTitle>
          <CardDescription>LDL, HDL and fasting glucose at each quarterly blood draw (mg/dL)</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={labOverviewConfig} className="h-52 w-full">
            <ComposedChart data={data} margin={{ top: 4, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis {...axisProps} domain={[30, 200]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <ReferenceLine y={100} stroke="var(--chart-2)" strokeDasharray="3 2" opacity={0.4}
                label={{ value: "LDL goal", position: "right", fontSize: 9 }} />
              <ReferenceLine x="Jan '26" stroke="var(--chart-2)" strokeDasharray="4 2"
                label={{ value: "Atorvastatin", position: "insideTopRight", fontSize: 10, fill: "color-mix(in oklch, var(--muted-foreground), transparent 20%)" }} />
              <Line dataKey="ldl"     stroke="var(--color-ldl)"     strokeWidth={2.5} connectNulls dot={{ r: 5 }} type="monotone" />
              <Line dataKey="glucose" stroke="var(--color-glucose)" strokeWidth={2}   connectNulls dot={{ r: 4 }} type="monotone" />
              <Line dataKey="hdl"     stroke="var(--color-hdl)"     strokeWidth={2}   connectNulls dot={{ r: 4 }} type="monotone" strokeDasharray="5 3" />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Activity & Labs tab ───────────────────────────────────────────────────────

const activityLabConfig: ChartConfig = {
  workouts: { label: "Workouts/mo", color: "var(--chart-1)" },
  ldl:      { label: "LDL (mg/dL)", color: "var(--chart-2)" },
};

const crpStepsConfig: ChartConfig = {
  steps: { label: "Daily Steps", color: "var(--chart-1)" },
  crpX10: { label: "CRP ×10 (mg/L)", color: "var(--chart-5)" },
};

function ActivityLabsTab({ data }: { data: MonthPoint[] }) {
  // Scale CRP ×10 so it's visible alongside steps
  const augmented = data.map((d) => ({
    ...d,
    crpX10: d.crp != null ? Math.round(d.crp * 10) : null,
  }));

  const scatterWorkoutsLdl = LAB_POINTS.map((p) => ({
    workouts: p.workouts,
    ldl: p.ldl,
    label: p.label,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Dual-axis: workouts vs LDL */}
        <Card>
          <CardHeader>
            <CardTitle>Workouts vs. LDL Cholesterol</CardTitle>
            <CardDescription>Monthly workout count (left) and LDL at each quarterly draw (right)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={activityLabConfig} className="h-52 w-full">
              <ComposedChart data={data} margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis yAxisId="workouts" {...axisProps} domain={[4, 24]}
                  label={{ value: "Sessions/mo", angle: -90, position: "insideLeft", fontSize: 10, offset: 12 }} />
                <YAxis yAxisId="ldl" orientation="right" {...axisProps} domain={[80, 165]}
                  label={{ value: "LDL mg/dL", angle: 90, position: "insideRight", fontSize: 10, offset: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <ReferenceLine yAxisId="ldl" y={100} stroke="var(--chart-2)" strokeDasharray="3 2" opacity={0.4} />
                <ReferenceLine yAxisId="workouts" x="Jan '26" stroke="var(--chart-2)" strokeDasharray="4 2"
                  label={{ value: "Statin", position: "insideTopRight", fontSize: 9 }} />
                <Line yAxisId="workouts" dataKey="workouts" stroke="var(--color-workouts)" strokeWidth={2.5} dot={{ r: 3 }} type="monotone" />
                <Line yAxisId="ldl"      dataKey="ldl"      stroke="var(--color-ldl)"      strokeWidth={2}   dot={{ r: 5 }} connectNulls type="monotone" strokeDasharray="5 3" />
              </ComposedChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Scatter: workouts vs LDL */}
        <Card>
          <CardHeader>
            <CardTitle>Correlation: Workouts → LDL</CardTitle>
            <CardDescription>Each dot = one quarterly lab draw. Trend: more exercise, lower LDL.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ ldl: { label: "LDL", color: "var(--chart-2)" } }} className="h-52 w-full">
              <ScatterChart margin={{ top: 4, right: 16, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="workouts" name="Workouts/mo" {...axisProps}
                  label={{ value: "Workouts / month", position: "insideBottom", offset: -12, fontSize: 10 }} domain={[6, 22]} />
                <YAxis type="number" dataKey="ldl" name="LDL (mg/dL)" {...axisProps} domain={[90, 160]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ payload }) => {
                    if (!payload?.length) return null;
                    const p = payload[0].payload;
                    return (
                      <div className="rounded-xl border bg-popover px-3 py-2 text-xs shadow-lg">
                        <p className="mb-1 font-medium">{p.label}</p>
                        <p>Workouts: {p.workouts}/mo</p>
                        <p>LDL: {p.ldl} mg/dL</p>
                      </div>
                    );
                  }}
                />
                <Scatter data={scatterWorkoutsLdl} fill="var(--chart-2)" opacity={0.85} />
              </ScatterChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Steps vs CRP */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Steps vs. Inflammation (hs-CRP)</CardTitle>
          <CardDescription>
            Steps (left) and hs-CRP scaled ×10 for visibility (right, mg/L × 10). Quarterly lab points only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={crpStepsConfig} className="h-52 w-full">
            <ComposedChart data={augmented} margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis yAxisId="steps" {...axisProps} domain={[5000, 13000]} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <YAxis yAxisId="crp" orientation="right" {...axisProps} domain={[0, 30]} tickFormatter={(v) => `${v / 10}`} />
              <ChartTooltip
                content={<ChartTooltipContent formatter={(value, name) =>
                  name === "crpX10" ? [`${(Number(value) / 10).toFixed(1)} mg/L`, "hs-CRP"] : [value, name]
                } />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <ReferenceLine yAxisId="crp" y={10} stroke="var(--chart-5)" strokeDasharray="3 2" opacity={0.4}
                label={{ value: "Low-risk goal", position: "right", fontSize: 9 }} />
              <Line yAxisId="steps" dataKey="steps"  stroke="var(--color-steps)"  strokeWidth={2} dot={{ r: 2 }} type="monotone" />
              <Line yAxisId="crp"   dataKey="crpX10" stroke="var(--color-crpX10)" strokeWidth={2} dot={{ r: 5 }} connectNulls type="monotone" strokeDasharray="5 3" />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <FindingCard
        title="Key Finding: Exercise & Cardiovascular Health"
        titleClass="text-emerald-700 dark:text-emerald-400"
        cardClass="border-emerald-500/20 bg-emerald-500/5"
      >
        <p>Doubling workout frequency from <strong className="text-foreground">8 → 16 sessions/month</strong> tracked with a <strong className="text-foreground">30% LDL reduction</strong> (145 → 102 mg/dL) over 9 months.</p>
        <p>hs-CRP dropped from <strong className="text-foreground">2.1 → 0.8 mg/L</strong> — a 62% decrease, shifting from moderate to low cardiovascular-risk inflammation. Note: Atorvastatin started in January 2026 also contributes to the improvement seen in the February draw.</p>
      </FindingCard>
    </div>
  );
}

// ─── Nutrition & Labs tab ──────────────────────────────────────────────────────

const nutritionLabConfig: ChartConfig = {
  carbs:   { label: "Carbs (g/day)",   color: "var(--chart-3)" },
  glucose: { label: "Glucose (mg/dL)", color: "var(--chart-5)" },
  hba1c:   { label: "HbA1c ×10 (%)",  color: "var(--chart-4)" },
};

const macroConfig: ChartConfig = {
  protein: { label: "Protein (g)", color: "var(--chart-1)" },
  carbs:   { label: "Carbs (g)",   color: "var(--chart-3)" },
  fat:     { label: "Fat (g)",     color: "var(--chart-5)" },
};

const calConfig: ChartConfig = {
  cal: { label: "Calories/day", color: "var(--chart-1)" },
};

function NutritionLabsTab({ data }: { data: MonthPoint[] }) {
  // Scale HbA1c ×10 so it's on a similar axis to glucose
  const augmented = data.map((d) => ({
    ...d,
    hba1c: d.hba1c != null ? Math.round(d.hba1c * 10) : null,
  }));

  const scatterCarbsGlucose = LAB_POINTS.map((p) => ({
    carbs: p.carbs,
    glucose: p.glucose,
    label: p.label,
  }));

  return (
    <div className="flex flex-col gap-4">
      {/* Dual-axis: carbs vs glucose + HbA1c */}
      <Card>
        <CardHeader>
          <CardTitle>Carbohydrate Intake vs. Blood Sugar Markers</CardTitle>
          <CardDescription>
            Daily carbs (left) vs. fasting glucose and HbA1c ×10 at quarterly draws (right, mg/dL and % ×10)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={nutritionLabConfig} className="h-64 w-full">
            <ComposedChart data={augmented} margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis yAxisId="carbs"   {...axisProps} domain={[200, 300]}
                label={{ value: "Carbs g/day", angle: -90, position: "insideLeft", fontSize: 10, offset: 12 }} />
              <YAxis yAxisId="labs" orientation="right" {...axisProps} domain={[50, 115]}
                label={{ value: "mg/dL or % ×10", angle: 90, position: "insideRight", fontSize: 10, offset: 12 }} />
              <ChartTooltip
                content={<ChartTooltipContent formatter={(value, name) =>
                  name === "hba1c" ? [`${(Number(value) / 10).toFixed(1)}%`, "HbA1c"] : [value, name]
                } />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <ReferenceLine yAxisId="labs" y={100} stroke="var(--chart-5)" strokeDasharray="3 2" opacity={0.4}
                label={{ value: "Glucose normal", position: "right", fontSize: 9 }} />
              <Line yAxisId="carbs"   dataKey="carbs"   stroke="var(--color-carbs)"   strokeWidth={2.5} dot={{ r: 2 }} type="monotone" />
              <Line yAxisId="labs"    dataKey="glucose" stroke="var(--color-glucose)" strokeWidth={2}   dot={{ r: 5 }} connectNulls type="monotone" strokeDasharray="5 3" />
              <Line yAxisId="labs"    dataKey="hba1c"   stroke="var(--color-hba1c)"   strokeWidth={2}   dot={{ r: 4 }} connectNulls type="monotone" />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Scatter: carbs vs glucose */}
        <Card>
          <CardHeader>
            <CardTitle>Correlation: Carbs → Fasting Glucose</CardTitle>
            <CardDescription>Each dot = one quarterly lab draw.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ glucose: { label: "Glucose", color: "var(--chart-5)" } }} className="h-52 w-full">
              <ScatterChart margin={{ top: 4, right: 16, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="carbs" name="Carbs (g/day)" {...axisProps}
                  label={{ value: "Carbohydrates g/day", position: "insideBottom", offset: -12, fontSize: 10 }} domain={[220, 290]} />
                <YAxis type="number" dataKey="glucose" name="Fasting Glucose" {...axisProps} domain={[85, 110]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ payload }) => {
                    if (!payload?.length) return null;
                    const p = payload[0].payload;
                    return (
                      <div className="rounded-xl border bg-popover px-3 py-2 text-xs shadow-lg">
                        <p className="mb-1 font-medium">{p.label}</p>
                        <p>Carbs: {p.carbs} g/day</p>
                        <p>Glucose: {p.glucose} mg/dL</p>
                      </div>
                    );
                  }}
                />
                <Scatter data={scatterCarbsGlucose} fill="var(--chart-5)" opacity={0.85} />
              </ScatterChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Macro breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Macronutrient Trends</CardTitle>
            <CardDescription>Monthly average grams of protein, carbs, and fat per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={macroConfig} className="h-52 w-full">
              <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis {...axisProps} domain={[60, 310]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line dataKey="protein" stroke="var(--color-protein)" strokeWidth={2} dot={{ r: 2 }} type="monotone" />
                <Line dataKey="carbs"   stroke="var(--color-carbs)"   strokeWidth={2} dot={{ r: 2 }} type="monotone" />
                <Line dataKey="fat"     stroke="var(--color-fat)"     strokeWidth={2} dot={{ r: 2 }} type="monotone" />
              </ComposedChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Daily calories */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Calorie Intake</CardTitle>
          <CardDescription>Average calories consumed per day by month</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={calConfig} className="h-40 w-full">
            <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis {...axisProps} domain={[1900, 2500]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line dataKey="cal" stroke="var(--color-cal)" strokeWidth={2} dot={{ r: 2 }} type="monotone" />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <FindingCard
        title="Key Finding: Diet & Blood Sugar Control"
        titleClass="text-amber-700 dark:text-amber-400"
        cardClass="border-amber-500/20 bg-amber-500/5"
      >
        <p>Reducing daily carbohydrate intake by <strong className="text-foreground">55 g (280 → 225 g/day)</strong> tracked with fasting glucose dropping from <strong className="text-foreground">102 → 90 mg/dL</strong> — back within the normal range.</p>
        <p>HbA1c improved from <strong className="text-foreground">5.8% → 5.3%</strong>, reversing the pre-diabetic trend. Protein intake rose from 85 → 115 g/day supporting muscle gain and satiety.</p>
        <p>Total calorie intake fell ~400 kcal/day — a moderate deficit consistent with the observed weight and composition changes.</p>
      </FindingCard>
    </div>
  );
}

// ─── Medications & Labs tab ────────────────────────────────────────────────────

const lipidConfig: ChartConfig = {
  ldl: { label: "LDL (mg/dL)",      color: "var(--chart-2)" },
  hdl: { label: "HDL (mg/dL)",      color: "var(--chart-4)" },
  tg:  { label: "Triglycerides",    color: "var(--chart-5)" },
};

const glucoseHba1cConfig: ChartConfig = {
  glucose: { label: "Fasting Glucose (mg/dL)", color: "var(--chart-5)" },
  hba1cX10: { label: "HbA1c ×10 (%)",         color: "var(--chart-3)" },
};

function MedicationsTab({ data }: { data: MonthPoint[] }) {
  const augmented = data.map((d) => ({
    ...d,
    hba1cX10: d.hba1c != null ? Math.round(d.hba1c * 10) : null,
  }));

  return (
    <div className="flex flex-col gap-4">
      {/* Medication list */}
      <Card size="sm">
        <CardHeader>
          <CardTitle>Current Medications & Supplements</CardTitle>
          <CardDescription>Active medications with start dates and clinical indications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {MED_ROWS.map((med) => (
              <div
                key={med.name}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-foreground/8 bg-muted/30 px-4 py-3"
              >
                <div className={cn("flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium", med.colorClass)}>
                  <Pill className="size-3" />
                  {med.name}
                </div>
                <span className="text-sm font-medium">{med.dose}</span>
                <Badge variant="outline" className="text-xs">Since {med.started}</Badge>
                <span className="ml-auto text-xs text-muted-foreground">{med.indication}</span>
                <Badge className="text-xs">active</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lipid panel with statin event */}
      <Card>
        <CardHeader>
          <CardTitle>Lipid Panel Over Time</CardTitle>
          <CardDescription>
            LDL, HDL and triglycerides at quarterly draws. Dashed line = Atorvastatin start.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={lipidConfig} className="h-64 w-full">
            <ComposedChart data={data} margin={{ top: 4, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis {...axisProps} domain={[30, 200]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              {/* Reference lines for clinical targets */}
              <ReferenceLine y={100} stroke="var(--chart-2)" strokeDasharray="3 2" opacity={0.35}
                label={{ value: "LDL < 100 goal", position: "right", fontSize: 9 }} />
              <ReferenceLine y={150} stroke="var(--chart-5)" strokeDasharray="3 2" opacity={0.35}
                label={{ value: "TG < 150 goal", position: "right", fontSize: 9 }} />
              <ReferenceLine y={40}  stroke="var(--chart-4)" strokeDasharray="3 2" opacity={0.35}
                label={{ value: "HDL > 40 goal", position: "right", fontSize: 9 }} />
              {/* Medication event */}
              <ReferenceLine x="Jan '26" stroke="var(--chart-2)" strokeWidth={1.5} strokeDasharray="5 2"
                label={{ value: "Atorvastatin 10mg started", position: "insideTopLeft", fontSize: 10, fill: "color-mix(in oklch, var(--muted-foreground), transparent 10%)" }} />
              <Line dataKey="ldl" stroke="var(--color-ldl)" strokeWidth={2.5} connectNulls dot={{ r: 5 }} type="monotone" />
              <Line dataKey="tg"  stroke="var(--color-tg)"  strokeWidth={2}   connectNulls dot={{ r: 4 }} type="monotone" strokeDasharray="5 3" />
              <Line dataKey="hdl" stroke="var(--color-hdl)" strokeWidth={2}   connectNulls dot={{ r: 4 }} type="monotone" />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Glucose / HbA1c — Vitamin D3 has no direct effect, shown for completeness */}
      <Card>
        <CardHeader>
          <CardTitle>Metabolic Markers Over Time</CardTitle>
          <CardDescription>
            Fasting glucose and HbA1c ×10 (%) at quarterly draws. Improvement driven by diet and exercise.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={glucoseHba1cConfig} className="h-52 w-full">
            <ComposedChart data={augmented} margin={{ top: 4, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis {...axisProps} domain={[50, 115]} />
              <ChartTooltip
                content={<ChartTooltipContent formatter={(value, name) =>
                  name === "hba1cX10" ? [`${(Number(value) / 10).toFixed(1)}%`, "HbA1c"] : [value, name]
                } />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <ReferenceLine y={100} stroke="var(--chart-5)" strokeDasharray="3 2" opacity={0.35}
                label={{ value: "Glucose normal <100", position: "right", fontSize: 9 }} />
              <Line dataKey="glucose"  stroke="var(--color-glucose)"  strokeWidth={2.5} connectNulls dot={{ r: 5 }} type="monotone" />
              <Line dataKey="hba1cX10" stroke="var(--color-hba1cX10)" strokeWidth={2}   connectNulls dot={{ r: 4 }} type="monotone" strokeDasharray="5 3" />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <FindingCard
        title="Key Finding: Atorvastatin Impact on Lipid Panel"
        titleClass="text-blue-700 dark:text-blue-400"
        cardClass="border-blue-500/20 bg-blue-500/5"
      >
        <p>After starting Atorvastatin 10 mg in January 2026, LDL dropped from <strong className="text-foreground">125 → 102 mg/dL</strong> in the next quarterly draw — a further 23 mg/dL on top of the exercise-driven gains.</p>
        <p>HDL improved to <strong className="text-foreground">52 mg/dL</strong> (up from 42 at baseline), entering the protective range. Triglycerides fell below the 150 mg/dL goal for the first time at 128 mg/dL.</p>
        <p>The metabolic improvements in glucose and HbA1c are attributed primarily to dietary changes and increased physical activity, not the statin.</p>
      </FindingCard>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function TrendsPage() {
  const [range, setRange] = React.useState<TimeRange>("1Y");
  const sliced = ALL_MONTHS.slice(ALL_MONTHS.length - TIME_RANGE_SLICES[range]);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Trends & Correlations</h1>
          <p className="text-sm text-muted-foreground">
            Discover relationships between activity, nutrition, lab results, and medications
          </p>
        </div>

        {/* Time range picker */}
        <div className="flex items-center gap-1 rounded-xl border border-foreground/10 bg-muted/40 p-1">
          {(["3M", "6M", "1Y"] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                range === r
                  ? "bg-background text-foreground shadow-sm ring-1 ring-foreground/10"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList variant="line" className="flex-wrap">
          <TabsTrigger value="overview">
            <Activity className="size-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Heart className="size-3.5" />
            Activity & Labs
          </TabsTrigger>
          <TabsTrigger value="nutrition">
            <Flame className="size-3.5" />
            Nutrition & Labs
          </TabsTrigger>
          <TabsTrigger value="medications">
            <Pill className="size-3.5" />
            Medications & Labs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewTab data={sliced} />
        </TabsContent>
        <TabsContent value="activity" className="mt-4">
          <ActivityLabsTab data={sliced} />
        </TabsContent>
        <TabsContent value="nutrition" className="mt-4">
          <NutritionLabsTab data={sliced} />
        </TabsContent>
        <TabsContent value="medications" className="mt-4">
          <MedicationsTab data={sliced} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
