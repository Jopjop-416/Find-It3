import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { FileText, Plus } from "lucide-react";
import { NewsCarousel } from "./NewsCarousel";
import { ItemCard } from "./ItemCard";
import {
  shouldHideItemFromListings,
  type ItemReturnVerification,
} from "../appState";
import heroImage from "figma:asset/706763380527f5c21ddaccdcfcc1a4edffb8b3f2.webp";
import laporHilangImg from "figma:asset/2412be6deea607ec6f8ef7e655eb41ff2289957e.webp";
import laporTemuanImg from "figma:asset/6e0302b470dfeaee72f713a6f32bccb12ae8fd58.webp";
import card1Img from "../../assets/card4.webp";

interface DashboardProps {
  items: any[];
  onNavigate?: (view: string) => void;
  onUpdateStatus: (id: number, status: string) => Promise<boolean>;
  canUpdateStatus?: boolean;
  currentUserEmail?: string;
  currentUserId?: string;
  isAdminUser?: boolean;
  onOpenReturnVerification: (itemId: number) => void;
  onApproveVerification: (itemId: number) => Promise<boolean>;
  returnVerifications: ItemReturnVerification[];
  onStartEdit?: (item: any) => void;
  onDeleteItem?: (itemId: number) => Promise<boolean> | void;
}

export function Dashboard({
  items,
  onNavigate,
  onUpdateStatus,
  canUpdateStatus = false,
  currentUserEmail = "",
  currentUserId = "",
  isAdminUser = false,
  onOpenReturnVerification,
  onApproveVerification,
  returnVerifications,
  onStartEdit,
  onDeleteItem,
}: DashboardProps) {
  const visibleItems = items.filter(
    (item) => !shouldHideItemFromListings(item, returnVerifications),
  );
  const lostItems = visibleItems.filter(
    (item) => item.type === "lost",
  );
  const foundItems = visibleItems.filter(
    (item) => item.type === "found",
  );

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="grid md:grid-cols-2 gap-0 rounded-sm overflow-hidden min-h-[400px] md:min-h-[500px]">
        {/* Left Side - Text Content */}
        <div className="bg-black text-white p-8 md:p-12 flex flex-col justify-center">
          <h1 className="text-5xl font-bold mb-4">
            Lost &{" "}
            <span className="text-orange-500">Found</span>
          </h1>
          <h2 className="text-xl font-medium mb-6">
            Universitas Muhammadiyah Malang
          </h2>
          <p className="text-gray-300 mb-8 text-xs leading-relaxed">
            Platform digital untuk membantu mahasiswa dan
            civitas akademika menemukan atau melaporkan barang
            hilang dan ditemukan di lingkungan kampus.
          </p>
          <div>
            <Button
              variant="outline"
              className="bg-white text-black hover:bg-gray-300 border-white rounded-sm"
              onClick={() => onNavigate?.("gallery")}
            >
              Lihat Gallery barang
            </Button>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="relative h-64 md:h-auto">
          <img
            src={heroImage}
            alt="Universitas Muhammadiyah Malang"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Action Cards Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Lapor Barang Hilang
          </h2>
          <p className="text-sm text-muted-foreground">
            Masukan deksripsi barang yang ingin anda posting
            ataupun anda laporkan
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Lapor Hilang Card */}
          <Card
            className="overflow-hidden relative h-80 rounded-sm cursor-pointer group"
            onClick={() => onNavigate?.("report-lost")}
          >
            <img
              src={laporHilangImg}
              alt="Lapor Hilang"
              className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
            />
            <div className="absolute top-4 left-4">
              <div className="bg-white rounded-sm p-2">
                <FileText className="w-5 h-5 text-black" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <div>
                <h3 className="text-white font-semibold mb-1">
                  Lapor Kehilangan
                </h3>
                <p className="text-white text-xs">
                  Laporkan barang yang Anda hilangkan di area
                  kampus
                </p>
              </div>
            </div>
          </Card>

          {/* Lapor Temuan Card */}
          <Card
            className="overflow-hidden relative h-80 rounded-sm cursor-pointer group"
            onClick={() => onNavigate?.("report-found")}
          >
            <img
              src={laporTemuanImg}
              alt="Lapor Temuan"
              className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
            />
            <div className="absolute top-4 left-4">
              <div className="bg-white rounded-sm p-2">
                <Plus className="w-5 h-5 text-black" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <div>
                <h3 className="text-white font-semibold mb-1">
                  Lapor Penemuan
                </h3>
                <p className="text-white text-xs">
                  Laporkan barang temuan yang Anda temukan di
                  kampus
                </p>
              </div>
            </div>
          </Card>

          {/* Kontak Card */}
          <Card
            className="overflow-hidden relative h-80 rounded-sm cursor-pointer group border-red-200"
            onClick={() => onNavigate?.("contact")}
          >
            <img
              src={card1Img}
              alt="Lapor Kehilangan Darurat"
              className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-80"
            />
            <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20 pointer-events-none" />
            <CardContent className="relative z-10 p-6 h-full flex flex-col justify-end">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate?.("contact");
                }}
                className="bg-red-700 hover:bg-black hover:text-white text-xs px-3 py-2 h-auto rounded-sm w-full text-white shadow-md"
                variant="destructive"
              >
                Hubungi Security
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            Laporan Terbaru
          </h2>
          <button
            onClick={() => onNavigate?.("gallery")}
            className="text-black hover:text-orange-700 font-medium text-sm hover:underline"
          >
            Lihat Lainnya
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-[repeat(5,minmax(0,1fr))] gap-3">
          {visibleItems.map((item) => (
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
              onStartEdit={onStartEdit}
              onDeleteItem={onDeleteItem}
            />
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <NewsCarousel />
    </div>
  );
}
