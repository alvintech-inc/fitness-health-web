"use client";

import * as React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  FlaskConical,
  Trash2,
  Upload,
  X,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type LabFileType = "pdf" | "excel";

interface LabResult {
  id: string;
  name: string;
  fileType: LabFileType;
  size: number;
  uploadedAt: Date;
  file: File;
  category?: string;
}

// ─── Sample data ──────────────────────────────────────────────────────────────

const SAMPLE_RESULTS: LabResult[] = [
  {
    id: "sample-1",
    name: "CBC_Panel_2024-01-15.pdf",
    fileType: "pdf",
    size: 248_000,
    uploadedAt: new Date("2024-01-15"),
    file: new File([], "CBC_Panel_2024-01-15.pdf"),
    category: "Blood Panel",
  },
  {
    id: "sample-2",
    name: "Lipid_Profile_2024-03-10.xlsx",
    fileType: "excel",
    size: 82_400,
    uploadedAt: new Date("2024-03-10"),
    file: new File([], "Lipid_Profile_2024-03-10.xlsx"),
    category: "Lipid Panel",
  },
  {
    id: "sample-3",
    name: "Thyroid_TSH_T4_2024-04-01.pdf",
    fileType: "pdf",
    size: 195_200,
    uploadedAt: new Date("2024-04-01"),
    file: new File([], "Thyroid_TSH_T4_2024-04-01.pdf"),
    category: "Thyroid",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function fileTypeFromName(name: string): LabFileType {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  return "excel";
}

function inferCategory(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("cbc") || lower.includes("blood")) return "Blood Panel";
  if (lower.includes("lipid") || lower.includes("cholesterol")) return "Lipid Panel";
  if (lower.includes("thyroid") || lower.includes("tsh")) return "Thyroid";
  if (lower.includes("glucose") || lower.includes("hba1c") || lower.includes("diabetes")) return "Metabolic";
  if (lower.includes("vitamin") || lower.includes("mineral")) return "Vitamins & Minerals";
  if (lower.includes("urine") || lower.includes("ua")) return "Urinalysis";
  if (lower.includes("hormone") || lower.includes("testosterone") || lower.includes("estrogen")) return "Hormones";
  return "General";
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
];

const ACCEPTED_EXT = [".pdf", ".xlsx", ".xls", ".csv"];

// ─── File Icon ─────────────────────────────────────────────────────────────────

function FileIcon({ type, className }: { type: LabFileType; className?: string }) {
  if (type === "pdf") {
    return <FileText className={cn("text-red-500", className)} />;
  }
  return <FileSpreadsheet className={cn("text-emerald-500", className)} />;
}

// ─── Result Card ──────────────────────────────────────────────────────────────

function ResultCard({
  result,
  onDelete,
  onPreview,
}: {
  result: LabResult;
  onDelete: (id: string) => void;
  onPreview: (result: LabResult) => void;
}) {
  return (
    <div
      className="group flex items-center gap-4 rounded-xl border border-foreground/8 bg-card px-4 py-3.5 transition-colors hover:bg-muted/40 cursor-pointer"
      onClick={() => onPreview(result)}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
        <FileIcon type={result.fileType} className="size-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{result.name}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          <span>{formatDate(result.uploadedAt)}</span>
          <span>·</span>
          <span>{formatBytes(result.size)}</span>
          {result.category && (
            <>
              <span>·</span>
              <span>{result.category}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.stopPropagation();
            const url = URL.createObjectURL(result.file);
            const a = document.createElement("a");
            a.href = url;
            a.download = result.name;
            a.click();
            URL.revokeObjectURL(url);
          }}
          title="Download"
        >
          <Download className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(result.id);
          }}
          title="Delete"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      <Badge
        variant="outline"
        className={cn(
          "ml-1 shrink-0 text-xs hidden sm:flex",
          result.fileType === "pdf"
            ? "border-red-200 text-red-600 dark:border-red-800 dark:text-red-400"
            : "border-emerald-200 text-emerald-600 dark:border-emerald-800 dark:text-emerald-400",
        )}
      >
        {result.fileType.toUpperCase()}
      </Badge>
    </div>
  );
}

// ─── Drop Zone ────────────────────────────────────────────────────────────────

function DropZone({ onFiles }: { onFiles: (files: File[]) => void }) {
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      ACCEPTED_TYPES.includes(f.type),
    );
    if (files.length) onFiles(files);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length) onFiles(files);
    e.target.value = "";
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center cursor-pointer transition-colors",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-foreground/15 bg-muted/20 hover:border-primary/50 hover:bg-muted/40",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_EXT.join(",")}
        className="sr-only"
        onChange={handleChange}
      />
      <div className={cn("rounded-2xl p-3.5 transition-colors", isDragging ? "bg-primary/15" : "bg-muted")}>
        <Upload className={cn("size-7 transition-colors", isDragging ? "text-primary" : "text-muted-foreground")} />
      </div>
      <div>
        <p className="text-sm font-medium">
          {isDragging ? "Drop files to upload" : "Drag & drop lab results here"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Supports PDF, Excel (.xlsx / .xls) and CSV files
        </p>
      </div>
      <Button variant="outline" size="sm" className="pointer-events-none">
        Browse files
      </Button>
    </div>
  );
}

// ─── Preview Dialog ───────────────────────────────────────────────────────────

function PreviewDialog({
  result,
  onClose,
}: {
  result: LabResult | null;
  onClose: () => void;
}) {
  const objectUrl = React.useMemo(() => {
    if (!result || result.file.size === 0) return null;
    return URL.createObjectURL(result.file);
  }, [result]);

  React.useEffect(() => {
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [objectUrl]);

  return (
    <Dialog open={!!result} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {result && <FileIcon type={result.fileType} className="size-4" />}
            <span className="truncate">{result?.name}</span>
          </DialogTitle>
          <DialogDescription>
            {result && (
              <span className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                <span>Uploaded {formatDate(result.uploadedAt)}</span>
                <span>·</span>
                <span>{formatBytes(result.size)}</span>
                {result.category && <><span>·</span><span>{result.category}</span></>}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden rounded-xl border bg-muted/30">
          {result?.fileType === "pdf" && objectUrl ? (
            <iframe src={objectUrl} className="h-[60vh] w-full" title={result.name} />
          ) : (
            <div className="flex h-48 flex-col items-center justify-center gap-3 text-center">
              {result && <FileIcon type={result.fileType} className="size-10 opacity-40" />}
              <p className="text-sm text-muted-foreground">
                {result?.fileType === "pdf" && !objectUrl
                  ? "Preview unavailable for this file"
                  : "Preview not available for spreadsheet files."}
              </p>
              {result && result.file.size > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!objectUrl) return;
                    const a = document.createElement("a");
                    a.href = objectUrl;
                    a.download = result.name;
                    a.click();
                  }}
                >
                  <Download className="size-3.5" />
                  Download to view
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LabResultsPage() {
  const [results, setResults] = React.useState<LabResult[]>(SAMPLE_RESULTS);
  const [previewResult, setPreviewResult] = React.useState<LabResult | null>(null);
  const [uploadErrors, setUploadErrors] = React.useState<string[]>([]);

  function handleFiles(files: File[]) {
    const errors: string[] = [];
    const valid: LabResult[] = [];

    for (const file of files) {
      if (file.size > 20 * 1024 * 1024) {
        errors.push(`${file.name} exceeds the 20 MB limit.`);
        continue;
      }
      const existing = results.find((r) => r.name === file.name);
      if (existing) {
        errors.push(`${file.name} is already uploaded.`);
        continue;
      }
      valid.push({
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        fileType: fileTypeFromName(file.name),
        size: file.size,
        uploadedAt: new Date(),
        file,
        category: inferCategory(file.name),
      });
    }

    if (errors.length) setUploadErrors(errors);
    if (valid.length) setResults((prev) => [...valid, ...prev]);
  }

  function handleDelete(id: string) {
    setResults((prev) => prev.filter((r) => r.id !== id));
  }

  const grouped = React.useMemo(() => {
    const map = new Map<string, LabResult[]>();
    for (const r of results) {
      const key = r.category ?? "General";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [results]);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="size-5 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold">Lab Results</h1>
            <p className="text-sm text-muted-foreground">
              Upload and manage your laboratory test results
            </p>
          </div>
        </div>
        <Badge variant="outline" className="w-fit">
          {results.length} {results.length === 1 ? "file" : "files"}
        </Badge>
      </div>

      {/* Upload errors */}
      {uploadErrors.length > 0 && (
        <div className="flex flex-col gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-destructive">
              <AlertCircle className="size-4" />
              Upload issues
            </div>
            <button
              onClick={() => setUploadErrors([])}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
          <ul className="flex flex-col gap-1">
            {uploadErrors.map((err, i) => (
              <li key={i} className="text-xs text-destructive/80">{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Upload zone */}
      <Card size="sm">
        <CardHeader>
          <CardTitle>Upload Lab Results</CardTitle>
          <CardDescription>
            Add PDF reports or Excel spreadsheets from your laboratory visits. Max 20 MB per file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DropZone onFiles={handleFiles} />
        </CardContent>
      </Card>

      {/* Results list */}
      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-16 text-center">
          <FlaskConical className="size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No lab results yet. Upload your first file above.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {grouped.map(([category, items]) => (
            <div key={category} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {category}
                </span>
                <div className="flex-1 border-t border-foreground/8" />
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {items.map((result) => (
                  <ResultCard
                    key={result.id}
                    result={result}
                    onDelete={handleDelete}
                    onPreview={setPreviewResult}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <Card size="sm" className="mt-2">
        <CardContent className="flex flex-col gap-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tips</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {[
              {
                icon: CheckCircle2,
                title: "Accepted formats",
                desc: "PDF, Excel (.xlsx / .xls), and CSV files are supported.",
                color: "text-emerald-500",
              },
              {
                icon: CheckCircle2,
                title: "Auto-categorisation",
                desc: "Files are grouped by test type based on their filename.",
                color: "text-blue-500",
              },
              {
                icon: CheckCircle2,
                title: "PDF preview",
                desc: "Click any PDF result to preview it directly in the browser.",
                color: "text-violet-500",
              },
            ].map((tip) => (
              <div key={tip.title} className="flex items-start gap-2">
                <tip.icon className={cn("mt-0.5 size-3.5 shrink-0", tip.color)} />
                <div>
                  <p className="text-xs font-medium">{tip.title}</p>
                  <p className="text-xs text-muted-foreground">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview dialog */}
      <PreviewDialog result={previewResult} onClose={() => setPreviewResult(null)} />
    </div>
  );
}
