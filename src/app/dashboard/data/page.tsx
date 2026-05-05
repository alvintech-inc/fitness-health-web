"use client";

import * as React from "react";
import {
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  Link2,
  Trash2,
  Upload,
  Watch,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────

type DataSource = "lab" | "wearable" | "sleep";

interface UploadedFile {
  id: string;
  name: string;
  source: DataSource;
  size: number;
  uploadedAt: Date;
  records?: number;
  file: File;
}

// ─── Sample pre-loaded files ───────────────────────────────────────────────────

const SAMPLE: UploadedFile[] = [
  { id: "s1", name: "CBC_Panel_2025-05-10.pdf",          source: "lab",      size: 248_000, uploadedAt: new Date("2025-05-10"), records: 18,  file: new File([], "CBC_Panel_2025-05-10.pdf") },
  { id: "s2", name: "Lipid_Profile_2025-08-04.pdf",      source: "lab",      size: 196_400, uploadedAt: new Date("2025-08-04"), records: 6,   file: new File([], "Lipid_Profile_2025-08-04.pdf") },
  { id: "s3", name: "Metabolic_Panel_2025-11-12.xlsx",   source: "lab",      size: 84_200,  uploadedAt: new Date("2025-11-12"), records: 14,  file: new File([], "Metabolic_Panel_2025-11-12.xlsx") },
  { id: "s4", name: "Lipid_HbA1c_2026-02-18.pdf",        source: "lab",      size: 210_500, uploadedAt: new Date("2026-02-18"), records: 8,   file: new File([], "Lipid_HbA1c_2026-02-18.pdf") },
  { id: "s5", name: "apple_health_export_2026-04.xml",   source: "wearable", size: 7_340_000, uploadedAt: new Date("2026-04-01"), records: 4820, file: new File([], "apple_health_export_2026-04.xml") },
  { id: "s6", name: "garmin_activity_export.csv",        source: "wearable", size: 380_000, uploadedAt: new Date("2026-03-15"), records: 312, file: new File([], "garmin_activity_export.csv") },
  { id: "s7", name: "sleep_log_2026_q1.csv",             source: "sleep",    size: 42_000,  uploadedAt: new Date("2026-04-01"), records: 90,  file: new File([], "sleep_log_2026_q1.csv") },
];

const SOURCE_CONFIG: Record<DataSource, { label: string; color: string }> = {
  lab:      { label: "Lab Result",     color: "border-blue-200   text-blue-600   dark:border-blue-800   dark:text-blue-400"   },
  wearable: { label: "Wearable/Watch", color: "border-emerald-200 text-emerald-600 dark:border-emerald-800 dark:text-emerald-400" },
  sleep:    { label: "Sleep Log",      color: "border-violet-200  text-violet-600  dark:border-violet-800  dark:text-violet-400"  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1_048_576) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1_048_576).toFixed(1)} MB`;
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function fileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return <FileText className="size-4 text-red-500" />;
  if (ext === "xml" || ext === "zip") return <FileText className="size-4 text-orange-500" />;
  return <FileSpreadsheet className="size-4 text-emerald-500" />;
}

const ACCEPTED: Record<DataSource, { exts: string; mime: string[] }> = {
  lab:      { exts: ".pdf,.xlsx,.xls,.csv",            mime: ["application/pdf", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel", "text/csv"] },
  wearable: { exts: ".xml,.zip,.json,.csv,.fit",       mime: ["text/xml", "application/xml", "application/zip", "application/json", "text/csv"] },
  sleep:    { exts: ".csv,.json,.xlsx",                mime: ["text/csv", "application/json", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"] },
};

// ─── Drop zone ─────────────────────────────────────────────────────────────────

function DropZone({ source, onFiles }: { source: DataSource; onFiles: (files: File[]) => void }) {
  const [dragging, setDragging] = React.useState(false);
  const ref = React.useRef<HTMLInputElement>(null);
  const cfg = ACCEPTED[source];

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); onFiles(Array.from(e.dataTransfer.files)); }}
      onClick={() => ref.current?.click()}
      className={cn(
        "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-7 text-center transition-colors",
        dragging ? "border-primary bg-primary/5" : "border-foreground/12 hover:border-primary/40 hover:bg-muted/30",
      )}
    >
      <input ref={ref} type="file" multiple accept={cfg.exts} className="sr-only"
        onChange={(e) => { onFiles(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
      <Upload className={cn("size-5 transition-colors", dragging ? "text-primary" : "text-muted-foreground")} />
      <p className="text-sm font-medium">{dragging ? "Drop to upload" : "Drag & drop or click to browse"}</p>
      <p className="text-xs text-muted-foreground">{cfg.exts.replaceAll(",", "  ·  ")}</p>
    </div>
  );
}

// ─── Section ───────────────────────────────────────────────────────────────────

function UploadSection({
  title,
  description,
  source,
  icon: Icon,
  hint,
  files,
  onFiles,
  onDelete,
  providers,
}: {
  title: string;
  description: string;
  source: DataSource;
  icon: React.ElementType;
  hint: string;
  files: UploadedFile[];
  onFiles: (files: File[]) => void;
  onDelete: (id: string) => void;
  providers?: { label: string; logo: string }[];
}) {
  const cfg = SOURCE_CONFIG[source];
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-muted p-2"><Icon className="size-4 text-muted-foreground" /></div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <DropZone source={source} onFiles={onFiles} />

        {providers && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Or connect directly:</span>
            {providers.map((p) => (
              <Button key={p.label} variant="outline" size="xs" className="gap-1.5 text-xs">
                <Link2 className="size-3" />{p.label}
                <Badge variant="secondary" className="ml-1 text-[10px]">soon</Badge>
              </Button>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground">{hint}</p>

        {files.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {files.map((f) => (
              <div key={f.id} className="group flex items-center gap-3 rounded-xl border border-foreground/8 bg-muted/20 px-3 py-2.5">
                <div className="shrink-0">{fileIcon(f.name)}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{f.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(f.uploadedAt)} · {formatBytes(f.size)}
                    {f.records != null && ` · ${f.records.toLocaleString()} records`}
                  </p>
                </div>
                <Badge variant="outline" className={cn("hidden text-xs sm:flex shrink-0", cfg.color)}>
                  {cfg.label}
                </Badge>
                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button variant="ghost" size="icon-xs" title="Download"
                    onClick={() => { const url = URL.createObjectURL(f.file); const a = document.createElement("a"); a.href = url; a.download = f.name; a.click(); URL.revokeObjectURL(url); }}>
                    <Download className="size-3" />
                  </Button>
                  <Button variant="ghost" size="icon-xs" className="text-destructive hover:text-destructive" title="Delete" onClick={() => onDelete(f.id)}>
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function DataPage() {
  const [files, setFiles] = React.useState<UploadedFile[]>(SAMPLE);

  function addFiles(source: DataSource) {
    return (raw: File[]) => {
      const next: UploadedFile[] = raw.map((f) => ({
        id: `${Date.now()}-${Math.random()}`,
        name: f.name,
        source,
        size: f.size,
        uploadedAt: new Date(),
        file: f,
      }));
      setFiles((prev) => [...next, ...prev]);
    };
  }

  function deleteFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  const bySource = (src: DataSource) => files.filter((f) => f.source === src);
  const totalRecords = files.reduce((s, f) => s + (f.records ?? 0), 0);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Health Data</h1>
          <p className="text-sm text-muted-foreground">
            Upload lab results, wearable exports, and sleep logs — all in one place.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex flex-col items-center rounded-xl border border-foreground/8 bg-muted/30 px-4 py-2 text-center">
            <span className="text-lg font-semibold leading-none">{files.length}</span>
            <span className="text-xs text-muted-foreground">files</span>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-foreground/8 bg-muted/30 px-4 py-2 text-center">
            <span className="text-lg font-semibold leading-none">{totalRecords.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground">records</span>
          </div>
        </div>
      </div>

      {/* Upload sections */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <UploadSection
          title="Lab Results"
          description="Blood work, metabolic panels, and any lab report"
          source="lab"
          icon={FileText}
          hint="Accepted: PDF reports from any lab, Excel/CSV exports from patient portals (Quest, LabCorp, etc.)"
          files={bySource("lab")}
          onFiles={addFiles("lab")}
          onDelete={deleteFile}
        />

        <UploadSection
          title="Wearable & Health Data"
          description="Apple Health, Garmin, Fitbit, Whoop, Oura exports"
          source="wearable"
          icon={Watch}
          hint="Apple Health: export from the Health app → share icon → Export All Health Data (.zip). Garmin/Fitbit: download from your account dashboard as CSV."
          files={bySource("wearable")}
          onFiles={addFiles("wearable")}
          onDelete={deleteFile}
          providers={[
            { label: "Apple Health", logo: "" },
            { label: "Garmin",       logo: "" },
            { label: "Fitbit",       logo: "" },
            { label: "Whoop",        logo: "" },
            { label: "Oura",         logo: "" },
          ]}
        />

        <UploadSection
          title="Sleep Logs"
          description="Sleep stage data from any tracker or app"
          source="sleep"
          icon={Clock}
          hint="Accepted: Oura CSV export, Apple Sleep JSON, Fitbit sleep CSV, or any spreadsheet with date + duration columns."
          files={bySource("sleep")}
          onFiles={addFiles("sleep")}
          onDelete={deleteFile}
          providers={[
            { label: "Oura Ring", logo: "" },
            { label: "Eight Sleep", logo: "" },
          ]}
        />
      </div>

      {/* Summary footer */}
      <Card size="sm">
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(["lab", "wearable", "sleep"] as DataSource[]).map((src) => {
            const count = bySource(src).length;
            const cfg = SOURCE_CONFIG[src];
            return (
              <div key={src} className="flex items-center gap-3">
                <CheckCircle2 className={cn("size-4 shrink-0", count > 0 ? "text-emerald-500" : "text-muted-foreground/30")} />
                <div>
                  <p className="text-sm font-medium">{cfg.label}</p>
                  <p className="text-xs text-muted-foreground">{count} file{count !== 1 ? "s" : ""} uploaded</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
