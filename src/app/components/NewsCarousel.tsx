import React, { useState, useRef } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Gem,
  KeyRound,
  Package,
  Shirt,
  Smartphone,
  Wallet,
} from "lucide-react";
import { Card, CardContent } from "./ui/card";
import ik4Img from "../../assets/ik4.webp";
import { getBrowseCategoryItems } from "./newsCarouselState";
import { ItemCard } from "./ItemCard";
import type { ItemReturnVerification } from "../appState";

interface NewsCarouselProps {
  items?: any[];
  returnVerifications?: ItemReturnVerification[];
  onNavigate?: (view: string) => void;
  canUpdateStatus?: boolean;
  currentUserEmail?: string;
  currentUserId?: string;
  isAdminUser?: boolean;
  onOpenReturnVerification?: (itemId: number) => void;
  onApproveVerification?: (itemId: number) => Promise<boolean>;
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
  isAdminUser = false,
  onOpenReturnVerification,
  onApproveVerification,
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
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  returnVerifications={returnVerifications}
                  canUpdateStatus={canUpdateStatus}
                  currentUserEmail={currentUserEmail}
                  currentUserId={currentUserId}
                  isAdminUser={isAdminUser}
                  onOpenReturnVerification={onOpenReturnVerification}
                  onApproveVerification={onApproveVerification}
                />
              ))}
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
