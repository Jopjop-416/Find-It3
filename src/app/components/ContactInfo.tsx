import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
} from "lucide-react";

export function ContactInfo() {
  const campusMapEmbedUrl =
    "https://www.google.com/maps?q=Universitas%20Muhammadiyah%20Malang%20Kampus%203%2C%20Jl.%20Raya%20Tlogomas%20No.246%2C%20Malang&z=17&output=embed";
  const campusMapUrl =
    "https://www.google.com/maps/search/?api=1&query=Universitas%20Muhammadiyah%20Malang%20Kampus%203%2C%20Jl.%20Raya%20Tlogomas%20No.246%2C%20Malang";
  const campusDirectionsUrl =
    "https://www.google.com/maps/dir/?api=1&destination=Universitas%20Muhammadiyah%20Malang%20Kampus%203%2C%20Jl.%20Raya%20Tlogomas%20No.246%2C%20Malang";

  const contactPoints = [
    {
      title: "Sekretariat & Keamanan Utama UMM",
      location:
        "Gedung Rektorat Kampus III, Lt. Ground, Jl. Raya Tlogomas 246",
      phone: "+6282139706403", 
      email: "sekun@umm.ac.id",
      hours: "24 Jam (Keamanan) / 08:00 - 16:00 (Kantor)",
      type: "primary",
    },
    {
      title: "Biro Kemahasiswaan (BAK)",
      location: "Gedung Rektorat Kampus III UMM Lt. 1",
      phone: "+62341464318", 
      email: "kemahasiswaan@umm.ac.id",
      hours: "08:00 - 16:00",
      type: "info",
    },
  ];

  const faqs = [
    {
      question: "Bagaimana cara melaporkan barang hilang?",
      answer:
        'Gunakan form "Lapor Hilang" di website ini, atau datang langsung ke pusat informasi/security terdekat dengan membawa identitas.',
    },
    {
      question: "Berapa lama barang disimpan jika ditemukan?",
      answer:
        "Barang ditemukan akan disimpan selama 3 bulan. Setelah itu akan didonasikan atau dimusnahkan sesuai kebijakan kampus.",
    },
    {
      question:
        "Apa yang harus saya bawa saat mengambil barang?",
      answer:
        "Bawa KTM/identitas diri dan bukti kepemilikan barang (foto, nota pembelian, atau deskripsi detail yang sesuai).",
    },
    {
      question: "Bagaimana jika saya menemukan barang?",
      answer:
        'Serahkan segera ke security/pusat informasi terdekat dan laporkan melalui form "Lapor Temuan" di website ini.',
    },
  ];


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-2">
          Kontak & Bantuan
        </h1>
        <p className="text-muted-foreground">
          Hubungi kami untuk bantuan terkait barang hilang dan
          ditemukan
        </p>
      </div>


      {/* Contact Points */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Kontak Langsung
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contactPoints.map((contact, index) => (
            <Card key={index} className="rounded-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {contact.title}
                  </CardTitle>
                  <Badge
                    variant={
                      contact.type === "primary"
                        ? "default"
                        : "secondary"
                    }
                    className={
                      contact.type === "primary"
                        ? "rounded-sm"
                        : "rounded-[2px]"
                    }
                  >
                    {contact.type === "primary" && "24/7"}
                    {contact.type === "info" && "Info"}
                    {contact.type === "faculty" && "Fakultas"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{contact.location}</span>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{contact.phone}</span>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{contact.email}</span>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{contact.hours}</span>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-sm"
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    Telepon
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-sm"
                  >
                    <Mail className="w-4 h-4 mr-1" />
                    Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Pertanyaan Umum
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="rounded-sm">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">
                  {faq.question}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {faq.answer}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Operational Hours */}
      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle>Jam Operasional</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">
                Hari Kerja (Senin - Jumat)
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Security Utama</span>
                  <span className="font-medium">24 Jam</span>
                </div>
                <div className="flex justify-between">
                  <span>Pusat Informasi</span>
                  <span className="font-medium">
                    08:00 - 17:00
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Security Fakultas</span>
                  <span className="font-medium">
                    08:00 - 20:00
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">
                Akhir Pekan (Sabtu - Minggu)
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Security Utama</span>
                  <span className="font-medium">24 Jam</span>
                </div>
                <div className="flex justify-between">
                  <span>Pusat Informasi</span>
                  <span className="font-medium text-red-600">
                    Tutup
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Security Fakultas</span>
                  <span className="font-medium">
                    08:00 - 15:00
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Map */}
      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle>Lokasi Kampus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted rounded-sm h-64 overflow-hidden">
              <iframe
                src={campusMapEmbedUrl}
                title="Peta Lokasi Kampus Universitas Muhammadiyah Malang"
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1 rounded-sm"
                asChild
              >
                <a href={campusMapUrl} target="_blank" rel="noreferrer">
                <MapPin className="w-4 h-4 mr-2" />
                Buka Google Maps
                </a>
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-sm"
                asChild
              >
                <a href={campusDirectionsUrl} target="_blank" rel="noreferrer">
                Petunjuk Arah
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
