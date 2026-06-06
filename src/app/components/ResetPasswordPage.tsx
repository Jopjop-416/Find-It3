import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Toast } from "./ui/toast";
import foundItLogo from "figma:asset/6e20ff767bc819bcb65b83fac10d99d01f0c4fd8.png";
import ummCampusImage from "../../imports/umm1.png";
import { supabase } from "../../lib/supabase";

interface ResetPasswordPageProps {
  onSuccess?: () => void;
}

export function ResetPasswordPage({ onSuccess }: ResetPasswordPageProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastVariant, setToastVariant] = useState<"success" | "error">("error");

  const showErrorToast = (message: string) => {
    setToastVariant("error");
    setToastMessage(message);
    setShowToast(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setShowToast(false);

    if (!password || !confirmPassword) {
      showErrorToast("Password baru dan konfirmasi password wajib diisi.");
      return;
    }

    if (password !== confirmPassword) {
      showErrorToast("Konfirmasi password tidak cocok.");
      return;
    }

    if (!supabase) {
      showErrorToast("Supabase belum dikonfigurasi. Tambahkan environment variables terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        showErrorToast("Gagal mengganti password.");
        return;
      }

      await supabase.auth.signOut();
      onSuccess?.();
    } catch {
      showErrorToast("Gagal mengganti password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        variant={toastVariant}
      />
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 relative">
          <img
            src={ummCampusImage}
            alt="UMM Campus"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md space-y-8">
            <div className="flex flex-col items-start">
              <img
                src={foundItLogo}
                alt="Lost & Found UMM"
                className="h-5 w-auto object-contain mb-4"
              />
              <h1 className="text-2xl font-bold text-gray-900">Ganti Password</h1>
              <p className="mt-2 text-sm text-gray-600">
                Masukkan password baru Anda untuk menyelesaikan proses reset.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-sm font-medium text-gray-700">
                  Password Baru
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Masukkan password baru"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="w-full h-12 rounded-sm border border-gray-300 bg-white px-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-new-password" className="text-sm font-medium text-gray-700">
                  Konfirmasi Password Baru
                </Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  placeholder="Ulangi password baru"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  className="w-full h-12 rounded-sm border border-gray-300 bg-white px-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-sm bg-black text-white hover:bg-gray-800 font-medium"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Password Baru"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
