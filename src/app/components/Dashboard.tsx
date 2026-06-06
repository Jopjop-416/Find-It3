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
import {
  buildWhatsAppUrl,
  formatIndonesianPhoneDisplay,
} from "../appState";
import heroImage from "figma:asset/706763380527f5c21ddaccdcfcc1a4edffb8b3f2.png";
import laporHilangImg from "figma:asset/2412be6deea607ec6f8ef7e655eb41ff2289957e.png";
import laporTemuanImg from "figma:asset/6e0302b470dfeaee72f713a6f32bccb12ae8fd58.png";
import merahBg from "../../assets/merah.png";

interface DashboardProps {
  items: any[];
  onNavigate?: (view: string) => void;
  onUpdateStatus: (id: number, status: string) => void;
  canUpdateStatus?: boolean;
}

export function Dashboard({
  items,
  onNavigate,
  onUpdateStatus,
  canUpdateStatus = false,
}: DashboardProps) {
  const lostItems = items.filter(
    (item) => item.type === "lost",
  );
  const foundItems = items.filter(
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
              className="bg-white text-black hover:bg-gray-300 border-white"
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
          <Card className="overflow-hidden relative h-80 rounded-sm border-red-200">
            <img
              src={merahBg}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/25" />
            <CardContent className="relative z-10 p-6 h-full flex flex-col justify-between">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-sm bg-white/15 backdrop-blur-sm">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">
                    Lapor Kehilangan Darurat
                  </h3>
                  <p className="text-white/90 text-xs">
                    Untuk barang penting seperti KTM, SIM, atau
                    dokumen
                  </p>
                </div>
              </div>
              <Button
                onClick={() => onNavigate?.("contact")}
                className="bg-red-700 hover:bg-black hover:text-white  text-xs px-3 py-2 h-auto rounded-sm w-full text-white"
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
            className="text-orange-600 hover:text-orange-700 font-medium text-sm hover:underline"
          >
            Lihat Lainnya
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-[repeat(5,minmax(0,1fr))] gap-3">
          {items.map((item) => (
            <Dialog key={item.id}>
              <DialogTrigger className="text-left w-full h-full">
                <Card className="h-full cursor-pointer overflow-hidden rounded-sm transition-all duration-500 ease-in-out hover:-translate-y-1 flex flex-col">
                  <div className="relative h-32 shrink-0 sm:h-48">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    {/* LOST/FOUND Badge - Top Left */}
                    <Badge
                      variant={
                        item.type === "lost"
                          ? "destructive"
                          : "default"
                      }
                      className="absolute top-2 left-2 rounded-sm font-medium text-[10px] px-1.5 py-0.5 sm:top-3 sm:left-3 sm:px-2"
                    >
                      {item.type === "lost"
                        ? "Hilang"
                        : "Ditemukan"}
                    </Badge>
                    {/* Category Badge - Top Right */}
                    <Badge
                      variant="secondary"
                      className="absolute top-2 right-2 max-w-[48%] rounded-[2px] bg-white/90 text-gray-800 hover:bg-white text-[10px] px-1.5 py-0.5 sm:top-3 sm:right-3 sm:max-w-[45%] sm:px-2"
                    >
                      <span className="line-clamp-1 break-all">
                        {item.category}
                      </span>
                    </Badge>
                  </div>

                  <CardContent className="flex flex-1 flex-col p-3 pt-2 sm:p-4 sm:pt-1">
                    <h3 className="mb-1.5 line-clamp-1 text-sm font-semibold sm:mb-2 sm:text-base">
                      {item.title}
                    </h3>
                    <p className="mb-2 line-clamp-2 text-[11px] text-muted-foreground sm:mb-3 sm:text-xs">
                      {item.description}
                    </p>

                    <div className="mb-2.5 space-y-1.5 sm:mb-3">
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

                    {/* Status Badge */}
                    <Badge
                      variant={
                        item.status === "active" ||
                        item.status === "available"
                          ? "outline"
                          : "secondary"
                      }
                      className="mt-auto w-fit rounded-sm text-[11px] sm:text-xs"
                    >
                      {item.status === "active" &&
                        "Masih Dicari"}
                      {item.status === "available" &&
                        "Tersedia"}
                      {item.status === "returned" &&
                        "Sudah Kembali"}
                      {item.status === "claimed" &&
                        "Sudah Diambil"}
                    </Badge>
                  </CardContent>
                </Card>
              </DialogTrigger>

              <DialogContent className="max-w-2xl">
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
                  <div className="relative h-64">
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
                      className="rounded-sm"
                    >
                      {item.type === "lost"
                        ? "Barang Hilang"
                        : "Barang Ditemukan"}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="rounded-[2px]"
                    >
                      {item.category}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="rounded-sm"
                    >
                      {item.status === "active" &&
                        "Masih Dicari"}
                      {item.status === "available" &&
                        "Tersedia"}
                      {item.status === "returned" &&
                        "Sudah Kembali"}
                      {item.status === "claimed" &&
                        "Sudah Diambil"}
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
                          {formatIndonesianPhoneDisplay(
                            item.contact,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      className="flex-1"
                      asChild
                    >
                      <a
                        href={buildWhatsAppUrl(
                          item.contact,
                          item.title,
                        )}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Hubungi Pelapor
                      </a>
                    </Button>

                    {canUpdateStatus &&
                      (item.status === "active" ||
                        item.status === "available") && (
                        <>
                      {item.type === "lost" && (
                        <Button
                          onClick={() =>
                            onUpdateStatus(item.id, "returned")
                          }
                          className="flex-1"
                        >
                          Tandai Sudah Ditemukan
                        </Button>
                      )}
                      {item.type === "found" && (
                        <Button
                          onClick={() =>
                            onUpdateStatus(item.id, "claimed")
                          }
                          className="flex-1"
                        >
                          Tandai Sudah Diambil
                        </Button>
                      )}
                        </>
                      )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <NewsCarousel onNavigate={onNavigate} />
    </div>
  );
}
