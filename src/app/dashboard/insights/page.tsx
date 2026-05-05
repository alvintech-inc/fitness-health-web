"use client";

import * as React from "react";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  Bot,
  Loader2,
  Send,
  Sparkles,
  TrendingDown,
  TrendingUp,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

// ─── Data (same 12-month fake dataset) ────────────────────────────────────────

type TimeRange = "3M" | "6M" | "1Y";

const ALL_MONTHS = [
  { label: "May '25",  steps: 7200,  workouts: 8,  carbs: 280, ldl: 145, hdl: 42,   glucose: 102, hba1c: 5.8 },
  { label: "Jun '25",  steps: 7500,  workouts: 9,  carbs: 275, ldl: null, hdl: null, glucose: null, hba1c: null },
  { label: "Jul '25",  steps: 8000,  workouts: 10, carbs: 270, ldl: null, hdl: null, glucose: null, hba1c: null },
  { label: "Aug '25",  steps: 8200,  workouts: 11, carbs: 260, ldl: 138, hdl: 44,   glucose: 99,  hba1c: 5.7 },
  { label: "Sep '25",  steps: 9000,  workouts: 14, carbs: 250, ldl: null, hdl: null, glucose: null, hba1c: null },
  { label: "Oct '25",  steps: 9500,  workouts: 16, carbs: 245, ldl: null, hdl: null, glucose: null, hba1c: null },
  { label: "Nov '25",  steps: 10000, workouts: 16, carbs: 240, ldl: 125, hdl: 47,   glucose: 95,  hba1c: 5.5 },
  { label: "Dec '25",  steps: 9000,  workouts: 12, carbs: 275, ldl: null, hdl: null, glucose: null, hba1c: null },
  { label: "Jan '26",  steps: 9200,  workouts: 16, carbs: 245, ldl: null, hdl: null, glucose: null, hba1c: null },
  { label: "Feb '26",  steps: 9800,  workouts: 16, carbs: 235, ldl: 102, hdl: 52,   glucose: 90,  hba1c: 5.3 },
  { label: "Mar '26",  steps: 10500, workouts: 20, carbs: 230, ldl: null, hdl: null, glucose: null, hba1c: null },
  { label: "Apr '26",  steps: 11000, workouts: 20, carbs: 225, ldl: null, hdl: null, glucose: null, hba1c: null },
];

const TIME_SLICES: Record<TimeRange, number> = { "3M": 3, "6M": 6, "1Y": 12 };

const axisProps = { tickLine: false, axisLine: false, tickMargin: 8, tick: { fontSize: 11 } };

const activityLabConfig: ChartConfig = {
  workouts: { label: "Workouts/mo",    color: "var(--chart-1)" },
  ldl:      { label: "LDL (mg/dL)",   color: "var(--chart-2)" },
  hdl:      { label: "HDL (mg/dL)",   color: "var(--chart-4)" },
};

const nutritionLabConfig: ChartConfig = {
  carbs:   { label: "Carbs (g/day)",      color: "var(--chart-3)" },
  glucose: { label: "Glucose (mg/dL)",    color: "var(--chart-5)" },
};

// ─── Suggested prompts ─────────────────────────────────────────────────────────

const SUGGESTIONS = [
  "What's driving my LDL improvement?",
  "How does my diet affect blood sugar?",
  "What's my biggest health win this year?",
  "Should I be concerned about anything?",
];

// ─── AI Chat panel ─────────────────────────────────────────────────────────────

interface ChatMessage { id: string; role: "user" | "assistant"; content: string }

function AiPanel() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [streaming, setStreaming] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || streaming) return;
    setApiError(null);
    const userMsg: ChatMessage = { id: String(Date.now()), role: "user", content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const asstId = String(Date.now() + 1);
      setMessages((prev) => [...prev, { id: asstId, role: "assistant", content: "" }]);

      const dec = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += dec.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === asstId ? { ...m, content: full } : m)),
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setApiError(
        msg.toLowerCase().includes("api_key") || msg.includes("401") || msg.includes("500")
          ? "AI unavailable — add an OPENAI_API_KEY to your .env to enable this feature."
          : `Error: ${msg}`,
      );
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-foreground/10 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b px-4 py-3 shrink-0">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
          <Sparkles className="size-3.5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium leading-none">AI Analysis</p>
          <p className="text-xs text-muted-foreground">Ask about your health data</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col gap-3 py-2">
            <p className="text-xs text-muted-foreground text-center">
              Your data is loaded. Ask anything about your trends, correlations, or habits.
            </p>
            <div className="flex flex-col gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}
                  className="flex items-center justify-between rounded-xl border border-foreground/8 bg-muted/30 px-3 py-2.5 text-left text-xs font-medium hover:bg-muted/60 transition-colors group">
                  {s}
                  <ArrowRight className="size-3 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={cn("flex gap-2.5 text-sm", m.role === "user" ? "flex-row-reverse" : "flex-row")}>
            <div className={cn("flex size-6 shrink-0 items-center justify-center rounded-full mt-0.5",
              m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}>
              {m.role === "user" ? <User className="size-3" /> : <Bot className="size-3.5 text-muted-foreground" />}
            </div>
            <div className={cn("max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
              m.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted/60 rounded-tl-sm")}>
              {m.content}
            </div>
          </div>
        ))}

        {streaming && messages.at(-1)?.role !== "assistant" && (
          <div className="flex gap-2.5">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted mt-0.5">
              <Bot className="size-3.5 text-muted-foreground" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-muted/60 px-3.5 py-3">
              <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}

        {apiError && (
          <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">{apiError}</p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t px-3 py-3 shrink-0 flex gap-2 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
          placeholder="Ask about your data…"
          rows={1}
          className="flex-1 resize-none rounded-xl border border-input bg-input/30 px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 placeholder:text-muted-foreground"
        />
        <Button size="icon-sm" disabled={streaming || !input.trim()} onClick={() => send(input)}>
          <Send className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, delta, good, sub }: {
  label: string; value: string; delta: string; good: boolean; sub: string;
}) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-1.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        <div className="flex items-end justify-between gap-1">
          <span className="text-xl font-semibold leading-none">{value}</span>
          <span className={cn("flex items-center gap-0.5 text-xs pb-0.5", good ? "text-emerald-500" : "text-red-500")}>
            {good ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {delta}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{sub}</span>
      </CardContent>
    </Card>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function InsightsPage() {
  const [range, setRange] = React.useState<TimeRange>("1Y");
  const data = ALL_MONTHS.slice(ALL_MONTHS.length - TIME_SLICES[range]);

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Insights</h1>
          <p className="text-sm text-muted-foreground">
            Visualise patterns across your data and ask AI to explain them
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-foreground/10 bg-muted/40 p-1">
          {(["3M", "6M", "1Y"] as TimeRange[]).map((r) => (
            <button key={r} onClick={() => setRange(r)}
              className={cn("rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                range === r ? "bg-background text-foreground shadow-sm ring-1 ring-foreground/10" : "text-muted-foreground hover:text-foreground")}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Main layout: charts left, AI right */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">

        {/* ── Charts column ── */}
        <div className="flex flex-col gap-4">
          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="LDL Cholesterol" value="102 mg/dL" delta="−43 mg/dL" good={true}  sub="Near-optimal range" />
            <StatCard label="Fasting Glucose" value="90 mg/dL"  delta="−12 mg/dL" good={true}  sub="Normal (<100 mg/dL)" />
            <StatCard label="Daily Steps"     value="11,000"    delta="+53%"       good={true}  sub="Goal: 10,000 ✓" />
            <StatCard label="Inflammation"    value="0.8 mg/L"  delta="−62%"       good={true}  sub="Low risk (<1.0)" />
          </div>

          {/* Chart 1: Exercise vs Cholesterol */}
          <Card>
            <CardHeader>
              <CardTitle>Exercise vs. Cholesterol</CardTitle>
              <CardDescription>
                Monthly workouts (left axis) alongside LDL & HDL at quarterly lab draws (right axis, mg/dL)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={activityLabConfig} className="h-52 w-full">
                <ComposedChart data={data} margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="label" {...axisProps} />
                  <YAxis yAxisId="w" {...axisProps} domain={[4, 24]}
                    label={{ value: "Sessions/mo", angle: -90, position: "insideLeft", fontSize: 10, offset: 12 }} />
                  <YAxis yAxisId="c" orientation="right" {...axisProps} domain={[30, 165]}
                    label={{ value: "mg/dL", angle: 90, position: "insideRight", fontSize: 10, offset: 10 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <ReferenceLine yAxisId="c" y={100} stroke="var(--chart-2)" strokeDasharray="3 2" opacity={0.35}
                    label={{ value: "LDL goal", position: "right", fontSize: 9 }} />
                  <ReferenceLine yAxisId="w" x="Jan '26" stroke="var(--chart-2)" strokeDasharray="4 2"
                    label={{ value: "Statin", position: "insideTopRight", fontSize: 9, fill: "var(--muted-foreground)" }} />
                  <Line yAxisId="w" dataKey="workouts" stroke="var(--color-workouts)" strokeWidth={2.5} dot={{ r: 3 }} type="monotone" />
                  <Line yAxisId="c" dataKey="ldl" stroke="var(--color-ldl)" strokeWidth={2} dot={{ r: 5 }} connectNulls type="monotone" strokeDasharray="5 3" />
                  <Line yAxisId="c" dataKey="hdl" stroke="var(--color-hdl)" strokeWidth={2} dot={{ r: 4 }} connectNulls type="monotone" />
                </ComposedChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Chart 2: Diet vs Blood Sugar */}
          <Card>
            <CardHeader>
              <CardTitle>Diet vs. Blood Sugar</CardTitle>
              <CardDescription>
                Daily carbohydrates (left, g/day) vs. fasting glucose at quarterly draws (right, mg/dL)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={nutritionLabConfig} className="h-52 w-full">
                <ComposedChart data={data} margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="label" {...axisProps} />
                  <YAxis yAxisId="n" {...axisProps} domain={[200, 300]}
                    label={{ value: "Carbs g/day", angle: -90, position: "insideLeft", fontSize: 10, offset: 12 }} />
                  <YAxis yAxisId="g" orientation="right" {...axisProps} domain={[80, 115]}
                    label={{ value: "mg/dL", angle: 90, position: "insideRight", fontSize: 10, offset: 10 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <ReferenceLine yAxisId="g" y={100} stroke="var(--chart-5)" strokeDasharray="3 2" opacity={0.35}
                    label={{ value: "Normal limit", position: "right", fontSize: 9 }} />
                  <Line yAxisId="n" dataKey="carbs"   stroke="var(--color-carbs)"   strokeWidth={2.5} dot={{ r: 2 }} type="monotone" />
                  <Line yAxisId="g" dataKey="glucose" stroke="var(--color-glucose)" strokeWidth={2}   dot={{ r: 5 }} connectNulls type="monotone" strokeDasharray="5 3" />
                </ComposedChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Summary insight */}
          <div className="rounded-2xl border border-foreground/8 bg-muted/20 px-5 py-4 text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Key takeaway:</strong> Doubling workouts (8 → 20/month) and cutting carbs by 55 g/day over 12 months drove LDL down 30% and returned glucose to normal range. Atorvastatin added in Jan 2026 accelerated the final LDL push.
            <span className="ml-1 inline-flex items-center text-xs text-muted-foreground/60">Ask the AI for details →</span>
          </div>
        </div>

        {/* ── AI panel column ── */}
        <div className="h-[600px] lg:h-auto lg:min-h-[500px]">
          <AiPanel />
        </div>
      </div>
    </div>
  );
}
