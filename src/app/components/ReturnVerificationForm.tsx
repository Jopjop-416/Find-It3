import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Upload, ShieldCheck, ArrowLeft } from "lucide-react";
import {
  compressImage,
  formatIndonesianPhoneDisplay,
  normalizeIndonesianPhone,
  validateImageFile,
} from "../appState";

interface ReturnVerificationFormProps {
  item: any;
  userData: {
    id: string;
    email: string;
    name: string;
    phone: string;
    nim: string;
  };
  onBack: () => void;
  onSubmit: (payload: {
    itemId: number;
    reporterId: string;
    reporterName: string;
    reporterEmail: string;
    reporterPhone: string;
    reporterNim: string;
    handoverPhoto: string;
  }) => Promise<boolean>;
}

export function ReturnVerificationForm({
  item,
  userData,
  onBack,
  onSubmit,
}: ReturnVerificationFormProps) {
  const [nim, setNim] = useState(userData.nim);
  const [handoverPhoto, setHandoverPhoto] = useState<string>("");
  const [validationError, setValidationError] = useState("");
  const [nimProfileError, setNimProfileError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nimInputRef = useRef<HTMLInputElement | null>(null);

  const formattedPhone = useMemo(
    () => formatIndonesianPhoneDisplay(userData.phone),
    [userData.phone],
  );

  useEffect(() => {
    if (!userData.nim.trim()) {
      setNimProfileError("Lengkapi data NIM anda di profile.");
      nimInputRef.current?.focus();
    }
  }, [userData.nim]);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setValidationError(validation.message);
      event.target.value = "";
      return;
    }

    try {
      const compressedImage = await compressImage(file, 1200, 0.8);
      setHandoverPhoto(compressedImage);
      setValidationError("");
    } catch {
      setValidationError("Gagal memproses foto serah terima.");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setValidationError("");

    if (!nim.trim()) {
      setNimProfileError("Lengkapi data NIM anda di profile.");
      setValidationError("Lengkapi data NIM anda di profile.");
      nimInputRef.current?.focus();
      return;
    }

    setNimProfileError("");

    if (!handoverPhoto) {
      setValidationError("Foto serah terima wajib diunggah.");
      return;
    }

    setIsSubmitting(true);
    const success = await onSubmit({
      itemId: item.id,
      reporterId: userData.id,
      reporterName: userData.name,
      reporterEmail: userData.email,
      reporterPhone: normalizeIndonesianPhone(userData.phone),
      reporterNim: nim.trim(),
      handoverPhoto,
    });

    setIsSubmitting(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">
              Verifikasi Barang Sudah Ditemukan
            </h1>
            <p className="text-sm text-muted-foreground">
              Lengkapi data serah terima untuk diteruskan ke admin.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="rounded-sm"
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>

        <Card className="rounded-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-orange-600" />
              Form Verifikasi Serah Terima
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="rounded-sm">
              <ShieldCheck className="h-4 w-4" />
              <AlertDescription>
                Data profil dan barang diisi otomatis agar proses verifikasi admin lebih cepat.
              </AlertDescription>
            </Alert>

            {validationError && (
              <Alert className="rounded-sm border-red-200 text-red-700">
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nama Pelapor</Label>
                  <Input value={userData.name} readOnly className="rounded-sm bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={userData.email} readOnly className="rounded-sm bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label>Nomor HP</Label>
                  <Input value={formattedPhone} readOnly className="rounded-sm bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nim">NIM</Label>
                  <Input
                    ref={nimInputRef}
                    id="nim"
                    value={nim}
                    onChange={(event) => {
                      setNim(event.target.value);
                      if (event.target.value.trim()) {
                        setNimProfileError("");
                      }
                    }}
                    placeholder="Masukkan NIM Anda"
                    className={`rounded-sm ${nimProfileError ? "border-red-500 ring-red-100" : ""}`}
                    aria-invalid={Boolean(nimProfileError)}
                  />
                  {nimProfileError && (
                    <p className="text-xs text-red-600">
                      {nimProfileError}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Barang Dilaporkan</Label>
                <div className="rounded-sm border bg-gray-50 p-4 text-sm">
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="mt-1 text-muted-foreground">{item.description}</p>
                  <div className="mt-3 flex flex-col gap-1 text-xs text-muted-foreground">
                    <span>Kategori: {item.category}</span>
                    <span>Lokasi: {item.location}</span>
                    <span>Tanggal Lapor: {new Date(item.date).toLocaleDateString("id-ID")}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="handover-photo">Foto Serah Terima</Label>
                <label
                  htmlFor="handover-photo"
                  className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-sm border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center"
                >
                  {handoverPhoto ? (
                    <img
                      src={handoverPhoto}
                      alt="Foto serah terima"
                      className="max-h-56 rounded-sm object-cover"
                    />
                  ) : (
                    <>
                      <Upload className="mb-3 h-8 w-8 text-gray-400" />
                      <p className="text-sm font-medium text-gray-700">
                        Upload foto serah terima barang
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        JPG, PNG, atau WebP maksimal 2MB
                      </p>
                    </>
                  )}
                </label>
                <input
                  id="handover-photo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="rounded-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Mengirim..." : "Kirim Verifikasi"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
  );
}
