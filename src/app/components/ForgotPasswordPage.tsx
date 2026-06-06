import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Toast } from "./ui/toast";
import foundItLogo from "figma:asset/6e20ff767bc819bcb65b83fac10d99d01f0c4fd8.png";
import ummCampusImage from "../../imports/umm1.png";
import { supabase } from "../../lib/supabase";

interface ForgotPasswordPageProps {
  onBackToLogin?: () => void;
}

export function ForgotPasswordPage({
  onBackToLogin,
}: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastVariant, setToastVariant] = useState<"success" | "error">("success");
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const showErrorToast = (message: string) => {
    setToastVariant("error");
    setToastMessage(message);
    setShowToast(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setShowToast(false);

    if (!email.trim()) {
      showErrorToast("Email wajib diisi.");
      return;
    }

    if (!supabase) {
      showErrorToast("Supabase belum dikonfigurasi. Tambahkan environment variables terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);

    try {
      const redirectTo = `${window.location.origin}${window.location.pathname}?view=reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      if (error) {
        showErrorToast("Gagal mengirim link reset password.");
        return;
      }

      setShowSuccessToast(true);
    } catch {
      showErrorToast("Gagal mengirim link reset password.");
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
      <Toast
        message="Link ganti password berhasil dikirim ke email Anda."
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
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
              <h1 className="text-2xl font-bold text-gray-900">Lupa Password</h1>
            <p className="mt-2 text-sm text-gray-600">
                Masukkan email Anda, lalu kami akan kirim link untuk mengganti password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="forgot-email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="w-full h-12 rounded-sm border border-gray-300 bg-white px-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-sm bg-black text-white hover:bg-gray-800 font-medium"
              >
                {isSubmitting ? "Mengirim..." : "Kirim Link Reset"}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Sudah ingat password?{" "}
                <button
                  type="button"
                  onClick={() => onBackToLogin?.()}
                  className="text-orange-600 font-medium hover:text-orange-700"
                >
                  Kembali ke Login
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
