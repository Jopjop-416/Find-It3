import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Search,
  Calendar,
  MapPin,
  User,
  Filter,
  X,
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
import {
  buildWhatsAppUrl,
  formatIndonesianPhoneDisplay,
} from "../appState";

interface ItemGalleryProps {
  items: any[];
  onUpdateStatus: (id: number, status: string) => void;
  canUpdateStatus?: boolean;
}

export function ItemGallery({
  items,
  onUpdateStatus,
  canUpdateStatus = false,
}: ItemGalleryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const categories = [
    "Elektronik",
    "Buku",
    "Kartu Identitas",
    "Dompet",
    "Tas",
    "Kunci",
    "Aksesori",
    "Pakaian",
    "Lainnya",
  ];

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.location
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" ||
      item.category === categoryFilter;
    const matchesType =
      typeFilter === "all" || item.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesType &&
      matchesStatus
    );
  });

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setTypeFilter("all");
    setStatusFilter("all");
  };

  const hasActiveFilters =
    searchTerm ||
    categoryFilter !== "all" ||
    typeFilter !== "all" ||
    statusFilter !== "all";

  const handleStatusUpdate = (
    id: number,
    newStatus: string,
  ) => {
    onUpdateStatus(id, newStatus);
    setSelectedItem(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">
          Galeri Barang
        </h1>
        <p className="text-muted-foreground">
          Daftar lengkap barang hilang dan ditemukan di kampus
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="rounded-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Cari barang berdasarkan nama, deskripsi, atau lokasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-sm pl-10"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="rounded-sm">
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent className="rounded-sm">
                  <SelectItem value="all">
                    Semua Kategori
                  </SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={typeFilter}
                onValueChange={setTypeFilter}
              >
                <SelectTrigger className="rounded-sm">
                  <SelectValue placeholder="Semua Jenis" />
                </SelectTrigger>
                <SelectContent className="rounded-sm">
                  <SelectItem value="all">
                    Semua Jenis
                  </SelectItem>
                  <SelectItem value="lost">
                    Barang Hilang
                  </SelectItem>
                  <SelectItem value="found">
                    Barang Ditemukan
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="rounded-sm">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent className="rounded-sm">
                  <SelectItem value="all">
                    Semua Status
                  </SelectItem>
                  <SelectItem value="active">
                    Masih Dicari
                  </SelectItem>
                  <SelectItem value="available">
                    Tersedia
                  </SelectItem>
                  <SelectItem value="returned">
                    Sudah Kembali
                  </SelectItem>
                  <SelectItem value="claimed">
                    Sudah Diambil
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Menampilkan {filteredItems.length} dari{" "}
                  {items.length} barang
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="rounded-sm"
                >
                  <X className="w-4 h-4 mr-1" />
                  Hapus Filter
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Items Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-[repeat(5,minmax(0,1fr))] gap-3">
        {filteredItems.map((item) => (
          <Dialog key={item.id}>
            <DialogTrigger className="w-full text-left">
              <Card className="self-start cursor-pointer overflow-hidden rounded-sm gap-0 transition-all duration-500 ease-in-out hover:-translate-y-1 flex flex-col">
                <div className="relative h-32 shrink-0 sm:h-48">
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
                  className={`px-3 py-2 text-center text-xs font-semibold text-white ${
                    item.type === "lost"
                      ? "bg-[#AE0000]"
                      : "bg-black"
                  }`}
                >
                  {item.type === "lost"
                    ? "Hilang"
                    : "Ditemukan"}
                </div>

                <CardContent className="flex flex-col p-3 pt-2.5 sm:p-3.5 sm:pt-3">
                  <h3 className="mb-1 line-clamp-2 text-sm font-semibold leading-snug sm:mb-1.5 sm:text-base">
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
                      {new Date(item.date).toLocaleDateString(
                        "id-ID",
                        {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        },
                      )}
                    </div>
                  </div>
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
                  <Badge variant="secondary" className="rounded-[2px]">
                    {item.category}
                  </Badge>
                  <Badge variant="outline" className="rounded-sm">
                    {item.status === "active" && "Masih Dicari"}
                    {item.status === "available" && "Tersedia"}
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
                        {new Date(item.date).toLocaleDateString(
                          "id-ID",
                        )}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>{formatIndonesianPhoneDisplay(item.contact)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-sm"
                    asChild
                  >
                    <a
                      href={buildWhatsAppUrl(item.contact, item.title)}
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
                            handleStatusUpdate(
                              item.id,
                              "returned",
                            )
                          }
                          className="flex-1 rounded-sm"
                        >
                          Tandai Sudah Ditemukan
                        </Button>
                      )}
                      {item.type === "found" && (
                        <Button
                          onClick={() =>
                            handleStatusUpdate(
                              item.id,
                              "claimed",
                            )
                          }
                          className="flex-1 rounded-sm"
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

      {filteredItems.length === 0 && (
        <Card className="rounded-sm">
          <CardContent className="p-12 text-center">
            <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">
              Tidak ada barang ditemukan
            </h3>
            <p className="text-muted-foreground mb-4">
              Coba ubah filter pencarian atau kata kunci yang
              berbeda
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="rounded-sm">
                Hapus Semua Filter
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
