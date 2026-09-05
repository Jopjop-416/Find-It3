import React, { useState, useRef } from "react";
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Gem,
  KeyRound,
  MapPin,
  Package,
  Shirt,
  Smartphone,
  Wallet,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import ik4Img from "../../assets/ik4.webp";
import { getBrowseCategoryItems } from "./newsCarouselState";
import { Button } from "./ui/button";
import { ItemDetailActions } from "./ItemDetailActions";
import {
  getEffectiveItemStatus,
  getItemStatusLabel,
  getReturnVerificationForItem,
  isReporterForItem,
  shouldShowContactAction,
  type ItemReturnVerification,
} from "../appState";

interface NewsCarouselProps {
  items?: any[];
  returnVerifications?: ItemReturnVerification[];
  onNavigate?: (view: string) => void;
  canUpdateStatus?: boolean;
  currentUserEmail?: string;
  currentUserId?: string;
  onOpenReturnVerification?: (itemId: number) => void;
}

const browseCategories = [
  { id: "elektronik", label: "Elektronik", icon: Smartphone },
  { id: "buku", label: "Buku", icon: BookOpen },
  { id: "kartu-identitas", label: "Kartu Identitas", icon: CreditCard },
  { id: "dompet", label: "Dompet", icon: Wallet },
  { id: "tas", label: "Tas", icon: Package },
  { id: "kunci", label: "Kunci", icon: KeyRound },
  { id: "aksesori", label: "Aksesori", icon: Gem },
  { id: "pakaian", label: "Pakaian", icon: Shirt },
  { id: "lainnya", label: "Lainnya", icon: Package },
] as const;

export function NewsCarousel({
  items = [],
  returnVerifications = [],
  onNavigate,
  canUpdateStatus = false,
  currentUserEmail = "",
  currentUserId = "",
  onOpenReturnVerification,
}: NewsCarouselProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const categoryScrollerRef = useRef<HTMLDivElement | null>(null);

  const filteredItems = getBrowseCategoryItems(items, activeCategory);
  const activeCategoryLabel =
    browseCategories.find((category) => category.id === activeCategory)?.label ??
    "Semua Kategori";

  const scrollCategories = (direction: "left" | "right") => {
    categoryScrollerRef.current?.scrollBy({
      left: direction === "left" ? -240 : 240,
      behavior: "smooth",
    });
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="relative h-[150px] w-full rounded-sm overflow-hidden sm:h-[260px] md:h-[400px] lg:h-[460px]">
        <img
          src={ik4Img}
          alt="Cara Melaporkan Barang Hilang Dengan Efektif"
          className="w-full h-full object-cover"
        />
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold mb-2 text-black">
              Browse By Category
            </h2>
            <p className="text-sm text-muted-foreground">
              Cari barang anda berdasarkan kategori yang anda tetapkan
            </p>
          </div>
          <div className="hidden items-center gap-1.5 sm:flex">
            <button
              type="button"
              onClick={() => scrollCategories("left")}
              className="flex h-8 w-8 items-center justify-center text-black transition-colors hover:text-gray-600"
              aria-label="Geser kategori ke kiri"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollCategories("right")}
              className="flex h-8 w-8 items-center justify-center text-black transition-colors hover:text-gray-600"
              aria-label="Geser kategori ke kanan"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          ref={categoryScrollerRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-4"
        >
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={`flex min-w-[92px] sm:min-w-[110px] md:min-w-[120px] snap-start flex-col items-center justify-center rounded-sm border px-3 py-3 text-center transition-colors sm:px-3.5 sm:py-4 ${
              activeCategory === null
                ? "border-black bg-black text-white"
                : "border-gray-300 bg-white text-black hover:bg-gray-50"
            }`}
          >
            <Package className="mb-2 h-5 w-5 stroke-[1.75] sm:h-6 sm:w-6" />
            <span className="text-xs sm:text-xs font-medium leading-tight">
              Semua Kategori
            </span>
          </button>

          {browseCategories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  setActiveCategory((currentCategory) =>
                    currentCategory === category.id ? null : category.id,
                  )
                }
                className={`flex min-w-[92px] sm:min-w-[110px] md:min-w-[110px] snap-start flex-col items-center justify-center rounded-sm border px-3 py-3 text-center transition-colors sm:px-3.5 sm:py-4 ${
                  isActive
                    ? "border-black bg-black text-white"
                    : "border-gray-300 bg-white text-black hover:bg-gray-50"
                }`}
              >
                <Icon className="mb-2 h-5 w-5 stroke-[1.75] sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-xs font-medium leading-tight">
                  {category.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-black">
                {activeCategoryLabel}
              </h3>
              <p className="text-sm text-muted-foreground">
                Menampilkan {filteredItems.length} barang hilang dan temuan
              </p>
            </div>
            {activeCategory && (
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                className="text-sm font-medium text-black hover:text-orange-700 hover:underline"
              >
                Reset Filter
              </button>
            )}
          </div>

          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-[repeat(5,minmax(0,1fr))] gap-3">
              {filteredItems.map((item) => {
                const effectiveStatus = getEffectiveItemStatus(item, returnVerifications);
                const verificationRecord = getReturnVerificationForItem(item, returnVerifications);

                return (
                <Dialog key={item.id}>
                  <DialogTrigger className="w-full text-left">
                    <Card className={`self-start cursor-pointer overflow-hidden rounded-sm gap-0 transition-all duration-500 ease-in-out hover:-translate-y-1 flex flex-col ${effectiveStatus === "pending_verification" ? "bg-gray-200 text-gray-600" : ""}`}>
                      <div className={`relative h-32 shrink-0 sm:h-48 ${effectiveStatus === "pending_verification" ? "grayscale" : ""}`}>
                        <ImageWithFallback
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <Badge
                          variant="secondary"
                          className="absolute top-2 right-2 max-w-[48%] rounded-[2px] bg-white/95 text-gray-800 hover:bg-white text-[10px] px-1.5 py-0.5 sm:top-3 sm:right-3 sm:max-w-[45%] sm:px-2"
                        >
                          <span className="line-clamp-1 break-all">
                            {item.category}
                          </span>
                        </Badge>
                      </div>

                      <div
                        className={`px-3 py-1 text-center text-xs font-semibold text-white ${
                          effectiveStatus === "pending_verification"
                            ? "bg-gray-500"
                            : item.type === "lost"
                              ? "bg-[#AE0000]"
                              : "bg-black"
                        }`}
                      >
                        {item.type === "lost" ? "Hilang" : "Ditemukan"}
                      </div>

                      <CardContent className="flex flex-col p-3 pt-2.5 sm:p-3.5 sm:pt-3">
                        <h4 className="mb-1 line-clamp-1 text-sm font-semibold leading-snug sm:mb-1.5 sm:text-base">
                          {item.title}
                        </h4>
                        <p className="mb-2 line-clamp-1 text-[11px] text-muted-foreground sm:mb-2.5 sm:text-xs">
                          {item.description}
                        </p>

                        <div className="space-y-1.5">
                          <div className="flex min-w-0 items-center text-[11px] text-muted-foreground sm:text-xs">
                            <MapPin className="mr-1 h-3 w-3 shrink-0 text-orange-500 sm:mr-1.5 sm:h-3.5 sm:w-3.5" />
                            <span className="line-clamp-1">{item.location}</span>
                          </div>
                          <div className="flex items-center text-[11px] text-muted-foreground sm:text-xs">
                            <Calendar className="mr-1 h-3 w-3 shrink-0 text-orange-500 sm:mr-1.5 sm:h-3.5 sm:w-3.5" />
                            {new Date(item.date).toLocaleDateString("id-ID", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>

                  <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto rounded-sm">
                    <DialogHeader>
                      <DialogTitle>{item.title}</DialogTitle>
                      <DialogDescription>
                        Detail lengkap tentang barang{" "}
                        {item.type === "lost" ? "hilang" : "ditemukan"}.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="relative h-48 sm:h-64">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover rounded-sm"
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant={item.type === "lost" ? "destructive" : "default"}
                          className="rounded-xs"
                        >
                          {item.type === "lost" ? "Barang Hilang" : "Barang Ditemukan"}
                        </Badge>
                        <Badge variant="secondary" className="rounded-xs">
                          {item.category}
                        </Badge>
                        <Badge variant="outline" className="rounded-xs">
                          {getItemStatusLabel(effectiveStatus)}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold mb-1">Deskripsi:</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                            <span>{item.location}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                            <span>{new Date(item.date).toLocaleDateString("id-ID")}</span>
                          </div>
                        </div>
                      </div>

                      {verificationRecord && effectiveStatus === "pending_verification" && (
                        <div className="space-y-3 rounded-sm border bg-gray-50 p-4">
                          <h4 className="font-semibold text-sm">Data Verifikasi Serah Terima</h4>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div>
                              <p className="text-muted-foreground text-xs">Nama</p>
                              <p>{verificationRecord.reporterName}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Email</p>
                              <p>{verificationRecord.reporterEmail}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">No HP</p>
                              <p>{verificationRecord.reporterPhone}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">NIM</p>
                              <p>{verificationRecord.reporterNim}</p>
                            </div>
                          </div>
                          <div>
                            <p className="mb-2 text-sm text-muted-foreground">Foto Serah Terima</p>
                            <img
                              src={verificationRecord.handoverPhoto}
                              alt="Foto serah terima"
                              className="max-h-64 w-full max-w-md rounded-sm border bg-white object-contain"
                            />
                          </div>
                        </div>
                      )}

                      <ItemDetailActions
                        contact={item.contact}
                        itemTitle={item.title}
                        showContact={shouldShowContactAction(item, currentUserEmail, currentUserId)}
                        extraActions={[
                          ...(canUpdateStatus &&
                          isReporterForItem(item, currentUserEmail, currentUserId) &&
                          effectiveStatus === "active" &&
                          item.type === "lost" &&
                          onOpenReturnVerification
                            ? [
                                {
                                  key: "verify-found",
                                  label: "Verifikasi Barang Sudah Ditemukan",
                                  onClick: () => onOpenReturnVerification(item.id),
                                },
                              ]
                            : []),
                        ]}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
                );
              })}
            </div>
          ) : (
            <Card className="rounded-sm border-dashed">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Belum ada barang pada kategori ini.
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
