import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Toast } from './ui/toast';
import { AlertTriangle, Upload, X } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import {
  compressImage,
  formatIndonesianPhoneDisplay,
  normalizeIndonesianPhone,
  parseStoredJson,
  validateImageFile,
  validateReportData,
} from '../appState';

interface ReportLostFormProps {
  onSubmit: (item: any) => Promise<boolean>;
  onRequireLogin: () => void;
  onRequireProfileCompletion: () => void;
  isLoggedIn: boolean;
  userPhone: string;
  mode?: 'standard' | 'edit';
  initialData?: any;
  onCancel?: () => void;
}

export function ReportLostForm({
  onSubmit,
  onRequireLogin,
  onRequireProfileCompletion,
  isLoggedIn,
  userPhone,
  mode = 'standard',
  initialData = null,
  onCancel,
}: ReportLostFormProps) {
  const isEditMode = mode === 'edit';
  const canUseLocalStorage = typeof localStorage !== 'undefined';

  const [formData, setFormData] = useState(() => {
    if (isEditMode && initialData) {
      return {
        title: initialData.title || '',
        category: initialData.category || '',
        description: initialData.description || '',
        location: initialData.location || '',
        contact: initialData.contact || '',
        image: initialData.image || '',
      };
    }

    return parseStoredJson(canUseLocalStorage ? localStorage.getItem('reportLostDraft') : null, {
      title: '',
      category: '',
      description: '',
      location: '',
      contact: '',
      image: ''
    });
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginToast, setShowLoginToast] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(() => {
    if (isEditMode && initialData) {
      return initialData.image || null;
    }

    const draft = parseStoredJson(canUseLocalStorage ? localStorage.getItem('reportLostDraft') : null, {
      image: '',
    });
    return draft.image || null;
  });

  // Keep form data synced if initialData changes in edit mode
  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        title: initialData.title || '',
        category: initialData.category || '',
        description: initialData.description || '',
        location: initialData.location || '',
        contact: initialData.contact || '',
        image: initialData.image || '',
      });
      setImagePreview(initialData.image || null);
    }
  }, [isEditMode, initialData]);

  // Save draft to localStorage whenever formData changes (only in standard mode)
  useEffect(() => {
    if (!isEditMode && canUseLocalStorage) {
      localStorage.setItem('reportLostDraft', JSON.stringify(formData));
    }
  }, [canUseLocalStorage, formData, isEditMode]);

  const categories = [
    'Elektronik',
    'Buku',
    'Kartu Identitas',
    'Dompet',
    'Tas',
    'Kunci',
    'Aksesori',
    'Pakaian',
    'Lainnya'
  ];

  const commonLocations = [
    'Perpustakaan Pusat',
    'Kantin Utama',
    'Fakultas Teknik',
    'Fakultas Ekonomi',
    'Fakultas Hukum',
    'Fakultas Kedokteran',
    'Ruang Kelas A',
    'Ruang Kelas B',
    'Ruang Kelas C',
    'Auditorium',
    'Parkiran Gedung A',
    'Parkiran Gedung B',
    'Masjid Kampus',
    'Lapangan Olahraga',
    'Lainnya'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const normalizedUserPhone = normalizeIndonesianPhone(userPhone);

    const validation = validateReportData({
      ...formData,
      contact: normalizedUserPhone,
    });
    if (!validation.isValid) {
      setValidationError(validation.message);
      return;
    }

    // Check if user is logged in
    if (!isLoggedIn) {
      // Save current form data to localStorage
      if (canUseLocalStorage) {
        localStorage.setItem('reportLostDraft', JSON.stringify(formData));
      }
      // Show toast notification
      setShowLoginToast(true);
      // Redirect to login after delay
      setTimeout(() => {
        onRequireLogin();
      }, 1500);
      return;
    }

    if (!userPhone) {
      setValidationError('Lengkapi nomor HP Indonesia di halaman profil sebelum mengirim laporan.');
      setTimeout(() => {
        onRequireProfileCompletion();
      }, 1200);
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const success = await onSubmit({
      ...formData,
      ...(isEditMode && initialData?.id ? { id: initialData.id } : {}),
      type: 'lost',
      contact: normalizedUserPhone,
      image: imagePreview || (isEditMode ? '' : 'https://images.unsplash.com/photo-1661353559006-402f30f9e2a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb3N0JTIwcGhvbmUlMjB3YWxsZXQlMjBrZXlzfGVufDF8fHx8MTc1ODY5MDA0Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')
    });

    if (!success) {
      setIsSubmitting(false);
      return;
    }

    if (!isEditMode) {
      // Clear draft and reset form
      if (canUseLocalStorage) {
        localStorage.removeItem('reportLostDraft');
      }
      setFormData({
        title: '',
        category: '',
        description: '',
        location: '',
        contact: '',
        image: ''
      });
      setImagePreview(null);
      setShowSuccessToast(true);
    }
    setIsSubmitting(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setValidationError(validation.message);
        e.target.value = '';
        return;
      }

      try {
        const compressedImage = await compressImage(file, 800, 0.7);
        setImagePreview(compressedImage);
        setFormData(prev => ({ ...prev, image: compressedImage }));
        setValidationError('');
      } catch (error) {
        console.error("Gagal mengkompres gambar:", error);
        setValidationError('Gagal memproses foto barang.');
      } finally {
        e.target.value = '';
      }
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: '' }));
  };

  return (
    <>
      <Toast
        message="Silakan login terlebih dahulu untuk melaporkan kehilangan barang"
        isVisible={showLoginToast}
        onClose={() => setShowLoginToast(false)}
      />
      <Toast
        message="Laporan kehilangan berhasil disubmit"
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />
      <div className="max-w-2xl mx-auto">
        <Card className="rounded-sm">
          <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <span>{isEditMode ? "Edit Laporan Kehilangan Barang" : "Laporan Kehilangan Barang"}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6 rounded-sm">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {isEditMode
                ? "Perbarui informasi atau foto barang kehilangan Anda jika ada data yang perlu dikoreksi."
                : "Pastikan informasi yang Anda berikan akurat dan lengkap untuk mempermudah proses pencarian barang."}
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Nama Barang *</Label>
                <Input
                  id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Contoh: iPhone 14 Pro - Hitam"
                  required
                  className="rounded-sm"
                />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                required
              >
                <SelectTrigger className="rounded-sm">
                  <SelectValue placeholder="Pilih kategori barang" />
                </SelectTrigger>
                <SelectContent className="rounded-sm">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi Detail *</Label>
                <Textarea
                  id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Berikan deskripsi yang detail tentang barang (warna, merk, ciri khas, kondisi, dll)"
                rows={4}
                  required
                  className="rounded-sm"
                />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Lokasi Terakhir Terlihat *</Label>
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                required
              >
                <SelectTrigger className="rounded-sm">
                  <SelectValue placeholder="Pilih lokasi terakhir melihat barang" />
                </SelectTrigger>
                <SelectContent className="rounded-sm">
                  {commonLocations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {validationError && (
              <Alert variant="destructive" className="rounded-sm">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="contact">Nomor WhatsApp Pelapor *</Label>
              <Input
                id="contact"
                type="tel"
                value={formatIndonesianPhoneDisplay(userPhone)}
                readOnly
                placeholder="Lengkapi nomor HP di profil"
                className="rounded-sm bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Nomor diambil dari profil Anda dan akan dipakai untuk chat WhatsApp.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lost-item-photo">Foto Barang (Opsional)</Label>
              <div className="relative">
                <label
                  htmlFor="lost-item-photo"
                  className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-sm border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center hover:bg-gray-100 transition-colors"
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview foto barang"
                      className="max-h-56 rounded-sm object-cover"
                    />
                  ) : (
                    <>
                      <Upload className="mb-3 h-8 w-8 text-gray-400" />
                      <p className="text-sm font-medium text-gray-700">
                        Upload foto barang
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        JPG, PNG, atau WebP maksimal 2MB
                      </p>
                    </>
                  )}
                </label>
                {imagePreview && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 rounded-sm shadow-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeImage();
                    }}
                    title="Hapus foto"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <input
                id="lost-item-photo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            <div className="flex gap-3 pt-2">
              {isEditMode && onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-1/3 rounded-sm"
                  onClick={onCancel}
                >
                  Batal
                </Button>
              )}
              <Button 
                type="submit" 
                className={`${isEditMode && onCancel ? 'w-2/3' : 'w-full'} rounded-sm`} 
                disabled={isSubmitting}
              >
                {isSubmitting 
                  ? (isEditMode ? 'Menyimpan Perubahan...' : 'Mengirim Laporan...') 
                  : (isEditMode ? 'Simpan Perubahan Laporan' : 'Kirim Laporan Kehilangan')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </>
  );
}
