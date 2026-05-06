import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Toast } from "./ui/toast";
import { ChangePasswordDialog } from "./ChangePasswordDialog";
import { DeleteAccountDialog } from "./DeleteAccountDialog";
import { User, Camera, Mail, Phone, MapPin, Save } from "lucide-react";
import { compressImage, validateImageFile } from "../appState";

interface ProfilePageProps {
  userData: {
    email: string;
    name: string;
    avatar?: string;
  };
  onUpdateProfile: (data: { email: string; name: string; avatar?: string }) => void;
  onChangePassword: (oldPassword: string, newPassword: string) => boolean | Promise<boolean>;
  onDeleteAccount: (confirmation: string, email: string) => boolean | Promise<boolean>;
}

export function ProfilePage({ userData, onUpdateProfile, onChangePassword, onDeleteAccount }: ProfilePageProps) {
  const [name, setName] = useState(userData.name);
  const [email, setEmail] = useState(userData.email);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [avatar, setAvatar] = useState<string | null>(userData.avatar || null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(userData.avatar || null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Perubahan berhasil disimpan!");
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setToastMessage(validation.message);
        setShowToast(true);
        e.target.value = "";
        return;
      }

      try {
        const compressedImage = await compressImage(file, 400, 0.8);
        setPreviewUrl(compressedImage);
        setAvatar(compressedImage);
        
        onUpdateProfile({
          email,
          name,
          avatar: compressedImage,
        });
        
        setToastMessage("Foto profile berhasil diubah!");
        setShowToast(true);
      } catch (error) {
        setToastMessage("Gagal memproses foto.");
        setShowToast(true);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      email,
      name,
      avatar: avatar || undefined,
    });
    setToastMessage("Perubahan berhasil disimpan!");
    setShowToast(true);
  };

  const handleChangePasswordSuccess = async (oldPassword: string, newPassword: string) => {
    const success = await onChangePassword(oldPassword, newPassword);
    if (success) {
      setToastMessage("Password berhasil diubah!");
      setShowToast(true);
    }
    return success;
  };

  const handleDeleteAccountSuccess = async (confirmation: string, emailInput: string) => {
    return await onDeleteAccount(confirmation, emailInput);
  };

  return (
    <>
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
      <ChangePasswordDialog
        isOpen={showChangePasswordDialog}
        onClose={() => setShowChangePasswordDialog(false)}
        onChangePassword={handleChangePasswordSuccess}
      />
      <DeleteAccountDialog
        isOpen={showDeleteAccountDialog}
        onClose={() => setShowDeleteAccountDialog(false)}
        onDeleteAccount={handleDeleteAccountSuccess}
        userEmail={userData.email}
      />
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola informasi akun dan preferensi Anda
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar Section */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Foto Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="relative group">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full object-cover ring-4 ring-offset-4 ring-orange-600"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-orange-600 flex items-center justify-center text-white text-4xl font-bold ring-4 ring-offset-4 ring-orange-600">
                  {getInitials(name)}
                </div>
              )}
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-orange-600 text-white p-3 rounded-full cursor-pointer hover:bg-orange-700 transition-colors shadow-lg"
              >
                <Camera className="w-5 h-5" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Klik icon kamera untuk mengubah foto
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPG, PNG max 2MB
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Informasi Personal</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Nama Lengkap
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="email@umm.ac.id"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Nomor Telepon
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                    placeholder="08xx-xxxx-xxxx"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                  Alamat
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[80px] resize-none"
                    placeholder="Masukkan alamat lengkap"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pengaturan Akun</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <h4 className="font-medium text-gray-900">Ubah Password</h4>
              <p className="text-sm text-gray-500">
                Perbarui password Anda secara berkala untuk keamanan
              </p>
            </div>
            <Button
              variant="outline"
              className="text-sm"
              onClick={() => setShowChangePasswordDialog(true)}
            >
              Ubah Password
            </Button>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <h4 className="font-medium text-gray-900">Notifikasi Email</h4>
              <p className="text-sm text-gray-500">
                Terima pemberitahuan tentang barang yang cocok dengan laporan Anda
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="font-medium text-gray-900">Hapus Akun</h4>
              <p className="text-sm text-gray-500">
                Hapus akun Anda secara permanen
              </p>
            </div>
            <Button
              variant="outline"
              className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
              onClick={() => setShowDeleteAccountDialog(true)}
            >
              Hapus Akun
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  );
}
