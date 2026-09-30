import React, { useState } from "react";
import { ChevronDown, Cpu, Zap, LogIn, Trash2 } from "lucide-react";

import type { UserMatchSummary, ItemReturnVerification } from "../appState";
import { shouldShowContactAction } from "../appState";
import { ItemDetailActions } from "./ItemDetailActions";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ItemCard } from "./ItemCard";
import hijauPng from "../../assets/hijau.png";

interface MatchResultsPageProps {
  matches: UserMatchSummary[];
  currentUserEmail?: string;
  currentUserId?: string;
  selectedMatchId?: number | null;
  onOpenReturnVerification: (itemId: number) => void;
  returnVerifications?: ItemReturnVerification[];
  onNavigateToLogin?: () => void;
  onDismissMatch?: (matchId: number, lostItemId: number, foundItemId: number) => void;
}

// ── Badges ────────────────────────────────────────────────────────────────────

function MatchStatusBadge({ score }: { score: number }) {
  if (score >= 80) {
    return (
      <Badge className="rounded-[2px] bg-emerald-600 text-white hover:bg-emerald-600 text-xs px-2 py-0.5 shadow-xs border border-white/20">
        ✓ Kecocokan Kuat
      </Badge>
    );
  }
  if (score >= 65) {
    return (
      <Badge className="rounded-[2px] bg-amber-500 text-white hover:bg-amber-500 text-xs px-2 py-0.5 shadow-xs">
        ~ Kemungkinan Cocok
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="rounded-[2px] text-xs px-2 py-0.5 bg-white text-gray-800 shadow-xs">
      Kandidat
    </Badge>
  );
}

function AlgorithmBadge({ version }: { version: string | null | undefined }) {
  const isAI = Boolean(version && version.startsWith("ai-"));
  return (
    <Badge
      variant="outline"
      className={`rounded-[2px] text-xs flex items-center gap-1 px-2 py-0.5 bg-white shadow-xs ${
        isAI
          ? "border-gray-500 text-gray-600"
          : "border-gray-300 text-gray-700"
      }`}
    >
      {isAI ? <Cpu className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
      {isAI ? "AI Matching" : "Legacy Matching"}
    </Badge>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDaysDifference(date1?: unknown, date2?: unknown): number {
  if (typeof date1 !== "string" || typeof date2 !== "string") return 0;
  const d1 = new Date(date1).getTime();
  const d2 = new Date(date2).getTime();
  if (Number.isNaN(d1) || Number.isNaN(d2)) return 0;
  return Math.round(Math.abs(d1 - d2) / (1000 * 60 * 60 * 24));
}

function getMatchHeadline(score: number): string {
  if (score >= 80) return "Sangat mungkin barang yang sama";
  if (score >= 65) return "Kemungkinan barang yang sama";
  return "Kandidat kecocokan potensial";
}

function getMatchSummaryDescription(match: UserMatchSummary): string {
  const breakdown = match.matchDetails as Record<string, number> | null;
  const loc = breakdown?.location ?? (match.myItem.location === match.matchedItem.location ? 100 : 70);
  const date = breakdown?.date ?? 80;
  const cat = breakdown?.category ?? 100;
  const photo = match.visualScore ?? 80;
  const title = breakdown?.title ?? 0;
  const desc = breakdown?.description ?? 60;

  const matchedGood: string[] = [];
  if (loc >= 70) matchedGood.push("lokasi");
  if (date >= 70) matchedGood.push("tanggal");
  if (cat >= 70) matchedGood.push("kategori");
  if (photo >= 70) matchedGood.push("tampilan foto");

  if (matchedGood.length >= 3) {
    let text = `${matchedGood.join(", ")} semuanya cocok.`;
    text = text.charAt(0).toUpperCase() + text.slice(1);
    if (title <= 10) {
      return `${text} Hanya judul barang yang belum bisa dibandingkan.`;
    }
    if (desc < 50) {
      return `${text} Namun detail deskripsi memiliki sedikit perbedaan.`;
    }
    return text;
  }

  if (match.reason) {
    return match.reason.replace(/;/g, " • ");
  }

  return "Sistem menemukan beberapa atribut yang memiliki kesamaan antara kedua laporan.";
}

interface CriteriaItem {
  id: string;
  label: string;
  value: number;
  description: string;
  isLow?: boolean;
}

function buildCriteriaList(match: UserMatchSummary): CriteriaItem[] {
  const breakdown = match.matchDetails as Record<string, number> | null;
  const myItem = match.myItem;
  const matchedItem = match.matchedItem;

  const diffDays = getDaysDifference(myItem.date, matchedItem.date);

  // 1. Lokasi kejadian
  const locScore = breakdown?.location ?? (myItem.location && matchedItem.location && myItem.location === matchedItem.location ? 100 : 70);
  const locDescription =
    myItem.location && matchedItem.location && String(myItem.location).toLowerCase() === String(matchedItem.location).toLowerCase()
      ? `Sama-sama dilaporkan di ${myItem.location}.`
      : myItem.location && matchedItem.location
        ? `Dilaporkan di lokasi berdekatan (${myItem.location} & ${matchedItem.location}).`
        : "Kesesuaian lokasi kejadian.";

  // 2. Tanggal laporan
  const dateScore = breakdown?.date ?? (diffDays <= 1 ? 100 : diffDays <= 3 ? 80 : 50);
  const dateDescription =
    diffDays === 0
      ? "Dilaporkan pada hari yang sama."
      : `Dilaporkan dalam rentang waktu ${diffDays} hari.`;

  // 3. Kategori barang
  const catScore = breakdown?.category ?? (myItem.category && matchedItem.category && myItem.category === matchedItem.category ? 100 : 50);
  const catDescription =
    myItem.category
      ? `Keduanya masuk kategori "${myItem.category}".`
      : "Kategori kedua barang sesuai.";

  // 4. Kemiripan foto
  const hasPhotoScore = match.visualScore !== null && match.visualScore !== undefined;
  const photoScore = hasPhotoScore ? match.visualScore! : 100;
  const photoDescription =
    photoScore >= 85
      ? "Foto kedua barang dinilai identik oleh AI."
      : photoScore >= 60
        ? "Foto kedua barang dinilai memiliki kemiripan visual yang kuat oleh AI."
        : "Foto kedua barang menunjukkan beberapa kemiripan visual.";

  // 5. Deskripsi barang
  const descScore = breakdown?.description ?? 60;
  const descDescription =
    descScore >= 80
      ? "Detail deskripsi kedua laporan sangat cocok."
      : descScore >= 50
        ? "Sebagian besar detail deskripsi cocok."
        : "Detail deskripsi memiliki sedikit kesamaan.";

  // 6. Judul barang
  const titleScore = breakdown?.title ?? 0;
  const titleDescription =
    titleScore === 0
      ? "Judul belum diisi pada salah satu laporan, sehingga belum bisa dibandingkan."
      : titleScore >= 80
        ? "Judul barang dinilai sangat mirip."
        : "Terdapat kemiripan pada judul barang.";

  const items: CriteriaItem[] = [
    {
      id: "lokasi",
      label: "Lokasi kejadian",
      value: locScore,
      description: locDescription,
    },
    {
      id: "tanggal",
      label: "Tanggal laporan",
      value: dateScore,
      description: dateDescription,
    },
    {
      id: "kategori",
      label: "Kategori barang",
      value: catScore,
      description: catDescription,
    },
  ];

  if (hasPhotoScore || match.algorithmVersion?.startsWith("ai-")) {
    items.push({
      id: "foto",
      label: "Kemiripan foto",
      value: photoScore,
      description: photoDescription,
    });
  }

  items.push(
    {
      id: "deskripsi",
      label: "Deskripsi barang",
      value: descScore,
      description: descDescription,
    },
    {
      id: "judul",
      label: "Judul barang",
      value: titleScore,
      description: titleDescription,
      isLow: titleScore <= 15,
    },
  );

  return items;
}

// ── MatchCard Component ───────────────────────────────────────────────────────

interface MatchCardProps {
  match: UserMatchSummary;
  isSelected?: boolean;
  currentUserEmail?: string;
  currentUserId?: string;
  onOpenReturnVerification: (itemId: number) => void;
  returnVerifications?: ItemReturnVerification[];
  onDismissMatch?: (matchId: number, lostItemId: number, foundItemId: number) => void;
}

function MatchCard({
  match,
  isSelected = false,
  currentUserEmail = "",
  currentUserId = "",
  onOpenReturnVerification,
  returnVerifications = [],
  onDismissMatch,
}: MatchCardProps) {
  const [showDismissConfirm, setShowDismissConfirm] = useState(false);
  const myItem = match.myItem;
  const matchedItem = match.matchedItem;
  const showVerifyAction =
    myItem.type === "lost" &&
    shouldShowContactAction(myItem, currentUserEmail, currentUserId) === false;

  const criteriaList = buildCriteriaList(match);
  const headline = getMatchHeadline(match.score);
  const summaryText = getMatchSummaryDescription(match);

  return (
    <Card
      className={`relative rounded-sm p-5 sm:p-6 bg-white dark:bg-card border transition-shadow shadow-xs flex flex-col space-y-4 ${
        isSelected ? "border border-orange-500 ring-1 ring-orange-500" : "border-border/80 hover:shadow-sm"
      }`}
    >
      {/* Tombol Tolak Kecocokan (Bukan Barang Saya) */}
      {onDismissMatch && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowDismissConfirm(true);
          }}
          title="Bukan Barang Saya"
          aria-label="Bukan Barang Saya"
          className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center bg-white justify-center rounded-full text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors focus:outline-hidden"
        >
          <Trash2 className="h-4 w-4 text-red-600" />
        </button>
      )}

      <Dialog open={showDismissConfirm} onOpenChange={setShowDismissConfirm}>
        <DialogContent className="max-w-md rounded-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5 text-red-600" />
              <span>Bukan Barang Anda?</span>
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus kecocokan ini? Hasil kecocokan ini tidak akan ditampilkan lagi.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="rounded-sm text-xs"
              onClick={() => setShowDismissConfirm(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-sm text-xs bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                setShowDismissConfirm(false);
                onDismissMatch(match.matchId, Number(match.myItem.id), Number(match.matchedItem.id));
              }}
            >
              Ya, Bukan Barang Saya
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <div className="space-y-5">
        {/* ── 1. Match Score Highlight Card with hijau.png Background ── */}
        <div className="relative overflow-hidden rounded-sm p-4 sm:p-5 text-center shadow-xs border border-emerald-900/30">
          <img
            src={hijauPng}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10" />

          <div className="relative z-10 space-y-2.5">
            {/* Badges: % Cocok, MatchStatusBadge, AlgorithmBadge */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge className="rounded-[2px] bg-black text-white hover:bg-black text-xs px-2.5 py-0.5 shadow-xs">
                {match.score}% cocok
              </Badge>
              <MatchStatusBadge score={match.score} />
              <AlgorithmBadge version={match.algorithmVersion} />
            </div>

            {/* Big Match Score, Headline, and Summary Description */}
            <div className="pt-1">
              <div className="inline-flex items-baseline justify-center text-white tracking-tight drop-shadow-xs">
                <span className="text-4xl text-[45px] font-semibold leading-none">{Math.round(match.score)}</span>
                <span className="text-2xl sm:text-xl font-semibold ml-0.5">%</span>
              </div>

              <h3 className="mt-3 text-base sm:text-md font-normal text-white italic drop-shadow-xs">
                {headline}
              </h3>

              <p className="text-xs sm:text-md text-white/90 max-w-md mx-auto leading-relaxed px-2 drop-shadow-2xs">
                {summaryText}
              </p>
            </div>
          </div>
        </div>

        {/* ── 2. Rincian Penilaian Dropdown ── */}
        <details className="group space-y-2">
          <summary className="flex items-center justify-between cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden py-1.5 px-2 rounded-sm bg-gray-50/80 hover:bg-gray-100 dark:bg-muted/40 dark:hover:bg-muted/70 text-xs sm:text-sm font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors border border-gray-200/60 dark:border-border/60">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-normal text-muted-foreground">Rincian penilaian</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
            </div>
            <span className="text-[11px] font-normal text-muted-foreground group-open:hidden">
              Lihat rincian
            </span>
            <span className="text-[11px] font-normal text-muted-foreground hidden group-open:inline">
              Tutup rincian
            </span>
          </summary>

          <div className="rounded-sm border border-gray-200/90 dark:border-border bg-white dark:bg-card overflow-hidden divide-y divide-gray-100 dark:divide-border/60 shadow-xs">
            {criteriaList.map((crit) => (
              <div key={crit.id} className="p-3 sm:p-3.5 space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {crit.label}
                  </span>
                  <span
                    className={`font-semibold ${
                      crit.isLow
                        ? "text-amber-700 dark:text-amber-500"
                        : "text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {Math.round(crit.value)}%
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  className={`h-1.5 w-full rounded-sm overflow-hidden ${
                    crit.isLow
                      ? "bg-[#fed7aa]/50 dark:bg-amber-950/40"
                      : "bg-gray-100 dark:bg-muted"
                  }`}
                >
                  <div
                    className={`h-full rounded-sm transition-all duration-500 ${
                      crit.isLow
                        ? "bg-amber-500"
                        : "bg-[#1e4a38] dark:bg-[#34d399]"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, crit.value))}%` }}
                  />
                </div>

                {/* Description subtext */}
                <p
                  className={`text-xs leading-normal ${
                    crit.isLow
                      ? "text-[#c2410c] dark:text-amber-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {crit.description}
                </p>
              </div>
            ))}
          </div>
        </details>

        {/* ── 3. Comparison Items Cards: Laporan Anda & Barang Hilang/Temuan ── */}
        <div className="grid grid-cols-2 gap-3 !mt-2 pt-0">
          <div className="flex flex-col min-w-0">
            <ItemCard
              item={myItem}
              roleBadge="Laporan Anda"
              returnVerifications={returnVerifications}
              currentUserEmail={currentUserEmail}
              currentUserId={currentUserId}
              onOpenReturnVerification={onOpenReturnVerification}
            />
          </div>

          <div className="flex flex-col min-w-0">
            <ItemCard
              item={matchedItem}
              roleBadge={matchedItem.type === "found" ? "Barang Temuan" : "Barang Hilang"}
              returnVerifications={returnVerifications}
              currentUserEmail={currentUserEmail}
              currentUserId={currentUserId}
              onOpenReturnVerification={onOpenReturnVerification}
            />
          </div>
        </div>

        {/* ── 4. Bottom Action Button: Hubungi Pelapor & Verifikasi ── */}
        <div className="pt-0.5">
          <ItemDetailActions
            bordered={false}
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
        </div>
      </div>
    </Card>
  );
}

// ── Main Page Component ───────────────────────────────────────────────────────

export function MatchResultsPage({
  matches,
  currentUserEmail = "",
  currentUserId = "",
  selectedMatchId = null,
  onOpenReturnVerification,
  returnVerifications = [],
  onNavigateToLogin,
  onDismissMatch,
}: MatchResultsPageProps) {
  const isGuest = !currentUserEmail && !currentUserId;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Kemungkinan Kecocokan</h1>
        <p className="text-muted-foreground">
          Daftar laporan yang dinilai sistem mirip dengan barang yang Anda laporkan.
        </p>
      </div>

      {matches.length === 0 ? (
        <Card className="rounded-sm">
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">
              Belum ada kemungkinan kecocokan untuk laporan Anda.
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {isGuest
                ? "Silakan masuk ke akun Anda untuk melihat kemungkinan kecocokan dari laporan yang Anda buat."
                : "Kecocokan akan otomatis muncul ketika ada laporan barang hilang atau temuan yang memiliki kesamaan dengan laporan Anda."}
            </p>
          </CardContent>
        </Card>
      ) : (
        /* 2-column horizontal grid: allows 2 match cards to fit side by side on large screens */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {matches.map((match) => (
            <MatchCard
              key={match.matchId}
              match={match}
              isSelected={selectedMatchId === match.matchId}
              currentUserEmail={currentUserEmail}
              currentUserId={currentUserId}
              onOpenReturnVerification={onOpenReturnVerification}
              returnVerifications={returnVerifications}
              onDismissMatch={onDismissMatch}
            />
          ))}
        </div>
      )}
    </div>
  );
}
