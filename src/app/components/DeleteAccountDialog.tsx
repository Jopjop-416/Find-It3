import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { AlertTriangle } from "lucide-react";

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteAccount: (confirmation: string, email: string) => boolean | Promise<boolean>;
  userEmail: string;
}

export function DeleteAccountDialog({
  isOpen,
  onClose,
  onDeleteAccount,
  userEmail,
}: DeleteAccountDialogProps) {
  const [confirmationText, setConfirmationText] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validasi
    if (confirmationText !== "delete akun") {
      setError('Ketik "delete akun" untuk konfirmasi');
      return;
    }

    if (emailInput !== userEmail) {
      setError("Email tidak sesuai dengan akun Anda");
      return;
    }

    // Call parent function to delete account
    setIsSubmitting(true);
    const success = await onDeleteAccount(confirmationText, emailInput);
    setIsSubmitting(false);

    if (success) {
      // Reset form and close
      setConfirmationText("");
      setEmailInput("");
      setError("");
      onClose();
    }
  };

  const handleClose = () => {
    setConfirmationText("");
    setEmailInput("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Hapus Akun
          </DialogTitle>
          <DialogDescription>
            Tindakan ini tidak dapat dibatalkan. Akun Anda akan dihapus secara permanen.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Warning Box */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>Peringatan:</strong> Semua data Anda termasuk laporan kehilangan dan penemuan akan terhapus permanen.
            </p>
          </div>

          {/* Confirmation Text */}
          <div className="space-y-2">
            <Label htmlFor="confirmText" className="text-sm font-medium text-gray-700">
              Ketik "delete akun" untuk konfirmasi
            </Label>
            <Input
              id="confirmText"
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="delete akun"
              className="border-red-300 focus:ring-red-500"
            />
          </div>

          {/* Email Confirmation */}
          <div className="space-y-2">
            <Label htmlFor="emailConfirm" className="text-sm font-medium text-gray-700">
              Masukkan email Anda untuk konfirmasi
            </Label>
            <Input
              id="emailConfirm"
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder={userEmail}
              className="border-red-300 focus:ring-red-500"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? "Memproses..." : "Kirim Permintaan Hapus Akun"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
