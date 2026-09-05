import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Calendar,
  MapPin,
  User,
  FileText,
  Plus,
  Phone,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { NewsCarousel } from "./NewsCarousel";
import { ItemDetailActions } from "./ItemDetailActions";
import {
  getEffectiveItemStatus,
  getItemStatusLabel,
  getReturnVerificationForItem,
  getReporterDisplayName,
  isReporterForItem,
  shouldShowContactAction,
  shouldHideItemFromListings,
  type ItemReturnVerification,
} from "../appState";
import heroImage from "figma:asset/706763380527f5c21ddaccdcfcc1a4edffb8b3f2.webp";
import laporHilangImg from "figma:asset/2412be6deea607ec6f8ef7e655eb41ff2289957e.webp";
import laporTemuanImg from "figma:asset/6e0302b470dfeaee72f713a6f32bccb12ae8fd58.webp";
import card1Img from "../../assets/card2.webp";

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
          <h1 className="text-4xl font-bold mb-4">
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
              View our Gallery
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
          {visibleItems.map((item) => {
            const verificationRecord = getReturnVerificationForItem(item, returnVerifications);
            const effectiveStatus = getEffectiveItemStatus(item, returnVerifications);
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
                    {item.type === "lost"
                      ? "Hilang"
                      : "Ditemukan"}
                  </div>

                  <CardContent className="flex flex-col p-3 pt-2.5 sm:p-3.5 sm:pt-3">
                    <h3 className="mb-1 line-clamp-1 text-sm font-semibold leading-snug sm:mb-1.5 sm:text-base">
                      {item.title}
                    </h3>
                    <p className="mb-2 line-clamp-1 text-[11px] text-muted-foreground sm:mb-2.5 sm:text-xs">
                      {item.description}
                    </p>

                    <div className="space-y-1.5">
                      <div className="flex min-w-0 items-center text-[11px] text-muted-foreground sm:text-xs">
                        <MapPin className="mr-1 h-3 w-3 shrink-0 text-orange-500 sm:mr-1.5 sm:h-3.5 sm:w-3.5" />
                        <span className="line-clamp-1">
                          {item.location}
                        </span>
                      </div>
                      <div className="flex items-center text-[11px] text-muted-foreground sm:text-xs">
                        <Calendar className="mr-1 h-3 w-3 shrink-0 text-orange-500 sm:mr-1.5 sm:h-3.5 sm:w-3.5" />
                        {new Date(
                          item.date,
                        ).toLocaleDateString("id-ID", {
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
                    {item.type === "lost"
                      ? "hilang"
                      : "ditemukan"}
                    .
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
                      variant={
                        item.type === "lost"
                          ? "destructive"
                          : "default"
                      }
                      className="rounded-xs"
                    >
                      {item.type === "lost"
                        ? "Barang Hilang"
                        : "Barang Ditemukan"}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="rounded-xs"
                    >
                      {item.category}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="rounded-xs"
                    >
                      {getItemStatusLabel(effectiveStatus)}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold mb-1">
                        Deskripsi:
                      </h4>
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
                        <span>
                          {new Date(
                            item.date,
                          ).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span>
                          {getReporterDisplayName(item)}
                        </span>
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
                      item.type === "lost"
                        ? [
                              {
                                key: "verify-found",
                              label: "Verifikasi Barang Sudah Ditemukan",
                              onClick: () => onOpenReturnVerification(item.id),
                            },
                          ]
                        : []),
                      ...(canUpdateStatus &&
                      isReporterForItem(item, currentUserEmail, currentUserId) &&
                        effectiveStatus === "available" &&
                        item.type === "found"
                          ? [
                              {
                                key: "mark-claimed",
                                label: "Tandai Sudah Diambil",
                                onClick: () => onOpenReturnVerification(item.id),
                              },
                            ]
                          : []),
                      ...(isAdminUser && effectiveStatus === "pending_verification"
                        ? [
                            {
                              key: "admin-approve",
                              label: "Verifikasi Admin",
                              onClick: () => {
                                void onApproveVerification(item.id);
                              },
                              className: "bg-black text-white hover:bg-gray-800",
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
      </div>

      {/* Quick Tips */}
      <NewsCarousel
        items={visibleItems}
        returnVerifications={returnVerifications}
        onNavigate={onNavigate}
        canUpdateStatus={canUpdateStatus}
        currentUserEmail={currentUserEmail}
        currentUserId={currentUserId}
        onOpenReturnVerification={onOpenReturnVerification}
      />
    </div>
  );
}
