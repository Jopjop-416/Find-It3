import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Toast } from "./ui/toast";
import foundItLogo from "figma:asset/6e20ff767bc819bcb65b83fac10d99d01f0c4fd8.png";
import ummCampusImage from "../../imports/umm1.png";
import { supabase } from "../../lib/supabase";

interface LoginPageProps {
  onLoginSuccess?: (email?: string) => void | Promise<void>;
  onSwitchToRegister?: () => void;
  onForgotPassword?: () => void;
}

export function LoginPage({ onLoginSuccess, onSwitchToRegister, onForgotPassword }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastVariant, setToastVariant] = useState<"success" | "error">("error");

  const showErrorToast = (message: string) => {
    setToastVariant("error");
    setToastMessage(message);
    setShowToast(true);
  };

  const getLoginErrorMessage = (errorMessage: string) => {
    const normalizedMessage = errorMessage.toLowerCase();

    if (normalizedMessage.includes("invalid login credentials")) {
      return "Email atau password salah.";
    }

    if (normalizedMessage.includes("email not confirmed")) {
      return "Email belum diverifikasi. Cek inbox Anda.";
    }

    return "Login gagal. Silakan coba lagi.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowToast(false);

    if (!email || !password) {
      showErrorToast("Email dan password wajib diisi.");
      return;
    }

    if (!supabase) {
      showErrorToast("Supabase belum dikonfigurasi. Tambahkan environment variables terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        showErrorToast(getLoginErrorMessage(error.message));
        return;
      }

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email.trim());
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      await onLoginSuccess?.(email.trim());
    } catch {
      showErrorToast("Login gagal karena koneksi atau konfigurasi Supabase bermasalah.");
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
              <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
              <p className="mt-2 text-sm text-gray-600">
                Please login to continue using Lost & Found UMM
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-12 rounded-sm border border-gray-300 bg-white px-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-12 rounded-sm border border-gray-300 bg-white px-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-700 cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={() => onForgotPassword?.()}
                  className="text-sm text-gray-600 hover:text-orange-600 transition-colors"
                >
                  Forgot password?{" "}
                  <span className="text-orange-600 font-medium">Change now</span>
                </button>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-sm bg-black text-white hover:bg-gray-800 font-medium"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or continue with email</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-sm border border-gray-300 hover:bg-gray-50"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-sm border border-gray-300 hover:bg-gray-50"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </Button>
              </div>

              <p className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    onSwitchToRegister?.();
                  }}
                  className="text-orange-600 font-medium hover:text-orange-700"
                >
                  Sign up
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
