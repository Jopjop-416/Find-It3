import React from "react";
import { Calendar, MapPin } from "lucide-react";

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

            return (
              <Card
                key={match.matchId}
                className={`rounded-sm ${isSelected ? "border border-orange-500" : ""}`}
              >
                <CardHeader className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="rounded-xs bg-black text-white hover:bg-black">
                      {match.score}% cocok
                    </Badge>
                    <Badge variant="outline" className="rounded-xs">
                      {match.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">Ringkasan Kecocokan</CardTitle>
                  <p className="text-sm text-muted-foreground">{match.reason}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {[{ label: "Laporan Anda", item: myItem }, { label: "Laporan yang Cocok", item: matchedItem }].map(({ label, item }) => (
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
                            <Badge variant={item.type === "lost" ? "destructive" : "outline"} className="rounded-xs">
                              {item.type === "lost" ? "Barang Hilang" : "Barang Ditemukan"}
                            </Badge>
                          </div>
                          <h3 className="font-semibold">{String(item.title ?? "")}</h3>
                          <p className="text-sm text-muted-foreground">{String(item.description ?? "")}</p>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{String(item.location ?? "")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(String(item.date ?? "")).toLocaleDateString("id-ID")}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <ItemDetailActions
                    contact={typeof matchedItem.contact === "string" ? matchedItem.contact : undefined}
                    itemTitle={String(matchedItem.title ?? "")}
                    showContact={shouldShowContactAction(matchedItem, currentUserEmail, currentUserId)}
                    extraActions={
                      showVerifyAction
                        ? [
                            {
                              key: `verify-${match.matchId}`,
                              label: "Tandai Sudah Ditemukan",
                              onClick: () => onOpenReturnVerification(Number(myItem.id)),
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
