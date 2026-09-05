import React from "react";
import { Calendar, MapPin, Eye, Cpu, Zap } from "lucide-react";

import type { UserMatchSummary } from "../appState";
import { shouldShowContactAction } from "../appState";
import { ItemDetailActions } from "./ItemDetailActions";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface MatchResultsPageProps {
  matches: UserMatchSummary[];
  currentUserEmail?: string;
  currentUserId?: string;
  selectedMatchId?: number | null;
  onOpenReturnVerification: (itemId: number) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function CircularScore({
  value,
  size = 52,
  strokeWidth = 5,
  color = "#0d9488",
  trackColor = "#ccfbf1",
  label,
}: {
  value: number | null;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
}) {
  if (value === null) return null;
  const pct = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const innerRadius = Math.max(0, radius - strokeWidth / 2 - 1);
  const isZero = pct <= 0;

  const activeColor = isZero ? "#94a3b8" : color;
  const activeTrack = isZero ? "#f1f5f9" : trackColor;

  return (
    <div
      className="relative inline-flex flex-col items-center justify-center select-none"
      title={label ? `${label}: ${pct.toFixed(1)}%` : `${pct.toFixed(1)}%`}
      aria-label={label ? `${label}: ${pct.toFixed(1)}%` : `${pct.toFixed(1)}%`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={activeTrack}
          strokeWidth={strokeWidth}
        />
        {/* Active progress arc */}
        {!isZero && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={activeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{
              transition: "stroke-dashoffset 0.6s ease-in-out",
            }}
          />
        )}
        {/* Inner solid circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={innerRadius}
          fill={activeColor}
        />
        {/* Centered value */}
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-white font-bold"
          fontSize={size >= 56 ? 14 : size >= 48 ? 12 : 11}
          style={{ fontWeight: 700 }}
        >
          {Math.round(pct)}
        </text>
      </svg>
    </div>
  );
}

function ScoreCard({
  label,
  value,
  color,
  trackColor,
  description,
}: {
  label: string;
  value: number | null;
  color: string;
  trackColor: string;
  description?: string;
}) {
  if (value === null) return null;
  const pct = Math.min(100, Math.max(0, value));

  return (
    <div className="rounded-sm border bg-card/60 p-3 flex items-start justify-between gap-3 shadow-xs hover:bg-card transition-colors">
      <div className="space-y-1">
        <span className="text-sm font-semibold text-foreground tracking-tight">{label}</span>
        {description && (
          <p className="text-xs text-muted-foreground leading-tight">{description}</p>
        )}
        <p className="text-[11px] font-medium text-muted-foreground/80">
          Skor: <span className="font-semibold text-foreground">{pct.toFixed(1)}%</span>
        </p>
      </div>
      <div className="shrink-0">
        <CircularScore
          value={value}
          color={color}
          trackColor={trackColor}
          size={46}
          strokeWidth={4.5}
          label={label}
        />
      </div>
    </div>
  );
}

function MatchStatusBadge({ score }: { score: number }) {
  if (score >= 80) {
    return (
      <Badge className="rounded-xs bg-emerald-600 text-white hover:bg-emerald-600">
        ✓ Kecocokan Kuat
      </Badge>
    );
  }
  if (score >= 65) {
    return (
      <Badge className="rounded-xs bg-amber-500 text-white hover:bg-amber-500">
        ~ Kemungkinan Cocok
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="rounded-xs">
      Kandidat
    </Badge>
  );
}

function AlgorithmBadge({ version }: { version: string | null }) {
  const isAI = version && version.startsWith("ai-");
  return (
    <Badge
      variant="outline"
      className={`rounded-xs text-xs flex items-center gap-1 ${isAI ? "border-blue-400 text-blue-600" : "border-muted-foreground text-muted-foreground"}`}
    >
      {isAI ? <Cpu className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
      {isAI ? "AI Matching" : "Legacy Matching"}
    </Badge>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MatchResultsPage({
  matches,
  currentUserEmail = "",
  currentUserId = "",
  selectedMatchId = null,
  onOpenReturnVerification,
}: MatchResultsPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Kemungkinan Kecocokan</h1>
        <p className="text-muted-foreground">
          Daftar laporan yang dinilai sistem mirip dengan barang yang Anda laporkan.
        </p>
      </div>

      {matches.length === 0 ? (
        <Card className="rounded-xs">
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            Belum ada kemungkinan kecocokan untuk laporan Anda.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => {
            const myItem = match.myItem;
            const matchedItem = match.matchedItem;
            const isSelected = selectedMatchId === match.matchId;
            const showVerifyAction =
              myItem.type === "lost" &&
              shouldShowContactAction(myItem, currentUserEmail, currentUserId) === false;

            const isAIMatch = match.algorithmVersion?.startsWith("ai-") ?? false;

            // Parse match details breakdown
            const breakdown = match.matchDetails as Record<string, number> | null;

            return (
              <Card
                key={match.matchId}
                className={`rounded-sm ${isSelected ? "border border-orange-500" : ""}`}
              >
                <CardHeader className="space-y-3">
                  {/* ── Score header ── */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">Ringkasan Kecocokan</CardTitle>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="rounded-xs bg-black text-white hover:bg-black text-sm px-2.5 py-0.5">
                          {match.score}% cocok
                        </Badge>
                        <MatchStatusBadge score={match.score} />
                        <AlgorithmBadge version={match.algorithmVersion} />
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <CircularScore
                        value={match.score}
                        color="#0f766e"
                        trackColor="#ccfbf1"
                        size={56}
                        strokeWidth={5.5}
                        label="Total Match Score"
                      />
                      <span className="text-[11px] font-medium text-muted-foreground">Match Score</span>
                    </div>
                  </div>

                  {/* ── Visual Similarity (AI only) ── */}
                  {isAIMatch && match.visualScore !== null && (
                    <div className="rounded-sm border border-blue-200 bg-blue-50/70 dark:bg-blue-950/20 dark:border-blue-800 p-3.5 flex items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1 pr-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-400">
                          <Eye className="h-4 w-4 shrink-0" />
                          Kemiripan Visual (AI)
                        </div>
                        <p className="text-xs font-medium text-blue-900/80 dark:text-blue-300/80">
                          Visual Similarity · Skor: <span className="font-semibold text-foreground">{match.visualScore.toFixed(1)}%</span>
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          * Kemiripan visual berdasarkan analisis foto oleh AI (OpenCLIP).
                          Nilai ini bukan probabilitas pasti bahwa barang identik.
                        </p>
                      </div>
                      <div className="shrink-0">
                        <CircularScore
                          value={match.visualScore}
                          color="#2563eb"
                          trackColor="#dbeafe"
                          size={54}
                          strokeWidth={5}
                          label="Visual Similarity"
                        />
                      </div>
                    </div>
                  )}

                  {/* ── Score breakdown ── */}
                  {breakdown && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Detail Skor</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        <ScoreCard
                          label="Kategori"
                          value={breakdown.category ?? null}
                          color="#059669"
                          trackColor="#d1fae5"
                          description="Kesesuaian kategori barang"
                        />
                        <ScoreCard
                          label="Judul"
                          value={breakdown.title ?? null}
                          color="#7c3aed"
                          trackColor="#ede9fe"
                          description="Kemiripan nama/judul barang"
                        />
                        <ScoreCard
                          label="Deskripsi"
                          value={breakdown.description ?? null}
                          color="#8b5cf6"
                          trackColor="#f3e8ff"
                          description="Kesesuaian rincian deskripsi"
                        />
                        <ScoreCard
                          label="Lokasi"
                          value={breakdown.location ?? null}
                          color="#ea580c"
                          trackColor="#ffedd5"
                          description="Kesesuaian lokasi kejadian"
                        />
                        <ScoreCard
                          label="Tanggal"
                          value={breakdown.date ?? null}
                          color="#0891b2"
                          trackColor="#cffafe"
                          description="Kedekatan waktu pelaporan"
                        />
                      </div>
                    </div>
                  )}

                  {/* ── Match reason ── */}
                  {match.reason && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Alasan Kecocokan</p>
                      <ul className="text-sm text-muted-foreground space-y-0.5 list-none">
                        {match.reason.split(";").map((r, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-primary font-bold">•</span>
                            <span>{r.trim()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* ── Model info ── */}
                  {isAIMatch && match.modelName && match.modelName !== 'unknown' && (
                    <p className="text-xs text-muted-foreground">
                      Model: <code className="bg-muted px-1 rounded text-xs">{match.modelName}</code>
                      {" · "}Algoritma: <code className="bg-muted px-1 rounded text-xs">{match.algorithmVersion}</code>
                    </p>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* ── Side-by-side item comparison ── */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      { label: "Laporan Anda", item: myItem },
                      { label: "Laporan yang Cocok", item: matchedItem },
                    ].map(({ label, item }) => (
                      <div key={`${match.matchId}-${label}`} className="rounded-sm border p-4">
                        <p className="mb-3 text-sm font-semibold">{label}</p>
                        <div className="space-y-3">
                          <div className="relative h-50 overflow-hidden rounded-sm">
                            <ImageWithFallback
                              src={String(item.image ?? "")}
                              alt={String(item.title ?? label)}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="rounded-xs">
                              {String(item.category ?? "")}
                            </Badge>
                            <Badge
                              variant={item.type === "lost" ? "destructive" : "outline"}
                              className="rounded-xs"
                            >
                              {item.type === "lost" ? "Barang Hilang" : "Barang Ditemukan"}
                            </Badge>
                          </div>
                          <h3 className="font-semibold">{String(item.title ?? "")}</h3>
                          <p className="text-sm text-muted-foreground">
                            {String(item.description ?? "")}
                          </p>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{String(item.location ?? "")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(String(item.date ?? "")).toLocaleDateString("id-ID")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <ItemDetailActions
                    contact={
                      typeof matchedItem.contact === "string"
                        ? matchedItem.contact
                        : undefined
                    }
                    itemTitle={String(matchedItem.title ?? "")}
                    showContact={shouldShowContactAction(
                      matchedItem,
                      currentUserEmail,
                      currentUserId,
                    )}
                    extraActions={
                      showVerifyAction
                        ? [
                            {
                              key: `verify-${match.matchId}`,
                              label: "Verifikasi Barang Sudah Ditemukan",
                              onClick: () =>
                                onOpenReturnVerification(Number(myItem.id)),
                            },
                          ]
                        : []
                    }
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
