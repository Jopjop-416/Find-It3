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
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Cari barang berdasarkan nama, deskripsi, atau lokasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
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
                <SelectTrigger>
                  <SelectValue placeholder="Semua Jenis" />
                </SelectTrigger>
                <SelectContent>
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
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-[repeat(5,minmax(0,1fr))] gap-3">
        {filteredItems.map((item) => (
          <Dialog key={item.id}>
            <DialogTrigger className="text-left w-full h-full">
              <Card className="h-full cursor-pointer overflow-hidden transition-all duration-500 ease-in-out hover:-translate-y-1 flex flex-col">
                <div className="relative h-48 shrink-0">
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
                    className="absolute top-3 left-3 font-medium text-[10px] px-2 py-0.5"
                  >
                    {item.type === "lost"
                      ? "Hilang"
                      : "Ditemukan"}
                  </Badge>
                  {/* Category Badge - Top Right */}
                  <Badge
                    variant="secondary"
                    className="absolute top-3 right-3 max-w-[45%] bg-white/90 text-gray-800 hover:bg-white text-[10px] px-2 py-0.5"
                  >
                    <span className="line-clamp-1 break-all">
                      {item.category}
                    </span>
                  </Badge>
                </div>

                <CardContent className="p-4 pt-1 flex flex-1 flex-col">
                  <h3 className="font-semibold mb-2 text-base line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center min-w-0 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 shrink-0 text-orange-500" />
                      <span className="line-clamp-1">
                        {item.location}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 shrink-0 text-orange-500" />
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

                  {/* Status Badge */}
                  <Badge
                    variant={
                      item.status === "active" ||
                      item.status === "available"
                        ? "outline"
                        : "secondary"
                    }
                    className="mt-auto w-fit text-xs"
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
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={
                      item.type === "lost"
                        ? "destructive"
                        : "default"
                    }
                  >
                    {item.type === "lost"
                      ? "Barang Hilang"
                      : "Barang Ditemukan"}
                  </Badge>
                  <Badge variant="secondary">
                    {item.category}
                  </Badge>
                  <Badge variant="outline">
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
                      <span>{item.contact}</span>
                    </div>
                  </div>
                </div>

                {canUpdateStatus && (item.status === "active" ||
                  item.status === "available") && (
                  <div className="flex gap-2 pt-4 border-t">
                    {item.type === "lost" && (
                      <Button
                        onClick={() =>
                          handleStatusUpdate(
                            item.id,
                            "returned",
                          )
                        }
                        className="flex-1"
                      >
                        Tandai Sudah Ditemukan
                      </Button>
                    )}
                    {item.type === "found" && (
                      <Button
                        onClick={() =>
                          handleStatusUpdate(item.id, "claimed")
                        }
                        className="flex-1"
                      >
                        Tandai Sudah Diambil
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="flex-1"
                    >
                      Hubungi Pelapor
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card>
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
              <Button variant="outline" onClick={clearFilters}>
                Hapus Semua Filter
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
