import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Toast } from './ui/toast';
import { Eye, Upload, X, MapPin } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import {
  compressImage,
  formatIndonesianPhoneDisplay,
  normalizeIndonesianPhone,
  parseStoredJson,
  validateImageFile,
  validateReportData,
} from '../appState';

interface ReportFoundFormProps {
  onSubmit: (item: any) => Promise<boolean>;
  onRequireLogin: () => void;
  onRequireProfileCompletion: () => void;
  isLoggedIn: boolean;
  userPhone: string;
  mode?: 'standard' | 'resolve-lost' | 'edit';
  presetData?: {
    sourceLostItemId: number;
    title: string;
    category: string;
    description: string;
    location: string;
    image?: string;
  } | null;
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReportFoundForm({
  onSubmit,
  onRequireLogin,
  onRequireProfileCompletion,
  isLoggedIn,
  userPhone,
  mode = 'standard',
  presetData = null,
  initialData = null,
  onSuccess,
  onCancel,
}: ReportFoundFormProps) {
  const isEditMode = mode === 'edit';
  const isResolveMode = mode === 'resolve-lost' && Boolean(presetData);
  const draftStorageKey = isResolveMode || isEditMode ? null : 'reportFoundDraft';
  const canUseLocalStorage = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

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

    if (isResolveMode && presetData) {
      return {
        title: presetData.title,
        category: presetData.category,
        description: presetData.description,
        location: presetData.location,
        contact: '',
        image: presetData.image || '',
      };
    }

    return parseStoredJson(canUseLocalStorage ? localStorage.getItem('reportFoundDraft') : null, {
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

    if (isResolveMode && presetData?.image) {
      return presetData.image;
    }

    const draft = parseStoredJson(canUseLocalStorage ? localStorage.getItem('reportFoundDraft') : null, {
      image: '',
    });
    return draft.image || null;
  });

  // Save draft to localStorage whenever formData changes
  useEffect(() => {
    if (draftStorageKey && canUseLocalStorage) {
      localStorage.setItem(draftStorageKey, JSON.stringify(formData));
    }
  }, [canUseLocalStorage, draftStorageKey, formData]);

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
      setValidationError('');
    }
  }, [isEditMode, initialData]);

  useEffect(() => {
    if (!isResolveMode || !presetData) {
      return;
    }

    setFormData({
      title: presetData.title,
      category: presetData.category,
      description: presetData.description,
      location: presetData.location,
      contact: '',
      image: presetData.image || '',
    });
    setImagePreview(presetData.image || null);
    setValidationError('');
  }, [isResolveMode, presetData]);

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

    if (!imagePreview && !formData.image) {
      setValidationError('Foto barang temuan wajib diunggah.');
      return;
    }

    // Check if user is logged in
    if (!isLoggedIn) {
      // Save current form data to localStorage
      if (draftStorageKey && canUseLocalStorage) {
        localStorage.setItem(draftStorageKey, JSON.stringify(formData));
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
      type: 'found',
      contact: normalizedUserPhone,
      image: imagePreview || (isEditMode ? '' : 'https://images.unsplash.com/photo-1661353559006-402f30f9e2a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb3N0JTIwcGhvbmUlMjB3YWxsZXQlMjBrZXlzfGVufDF8fHx8MTc1ODY5MDA0Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'),
      autoAcceptReturn: isResolveMode,
      sourceLostItemId: presetData?.sourceLostItemId,
    });

    if (!success) {
      setIsSubmitting(false);
      return;
    }

    if (!isEditMode) {
      // Clear draft and reset form
      if (draftStorageKey && canUseLocalStorage) {
        localStorage.removeItem(draftStorageKey);
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
    onSuccess?.();
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
        message="Silakan login terlebih dahulu untuk melaporkan penemuan barang"
        isVisible={showLoginToast}
        onClose={() => setShowLoginToast(false)}
      />
      <Toast
        message={isEditMode ? "Perubahan laporan berhasil disimpan" : isResolveMode ? "Barang berhasil ditandai sudah ditemukan" : "Laporan penemuan berhasil disubmit"}
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />
      <div className="max-w-2xl mx-auto">
        <Card className="rounded-sm">
          <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-green-600" />
            <span>{isEditMode ? "Edit Laporan Penemuan Barang" : isResolveMode ? "Konfirmasi Barang Sudah Ditemukan" : "Laporan Penemuan Barang"}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6 rounded-sm">
            <MapPin className="h-4 w-4" />
            <AlertDescription>
              {isEditMode
                ? "Perbarui informasi atau foto barang temuan Anda jika ada data yang perlu dikoreksi."
                : isResolveMode
                ? "Gunakan formulir ini untuk mengonfirmasi bahwa barang hilang Anda sudah ditemukan. Setelah dikirim, laporan akan langsung dipindahkan ke riwayat tanpa proses pending."
                : "Terima kasih telah menemukan barang! Silakan laporkan dan serahkan ke security atau pusat informasi terdekat."}
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Nama/Jenis Barang *</Label>
                <Input
                  id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Contoh: Dompet Kulit Coklat"
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
              <Label htmlFor="description">Deskripsi Barang *</Label>
                <Textarea
                  id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Berikan deskripsi detail barang yang ditemukan (warna, merk, kondisi, isi barang jika relevan)"
                rows={4}
                  required
                  className="rounded-sm"
                />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Lokasi Ditemukan *</Label>
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                required
              >
                <SelectTrigger className="rounded-sm">
                  <SelectValue placeholder="Pilih lokasi menemukan barang" />
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

            {validationError && (
              <Alert variant="destructive" className="rounded-sm">
                <MapPin className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="found-item-photo">Foto Barang *</Label>
              <div className="relative">
                <label
                  htmlFor="found-item-photo"
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
                id="found-item-photo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            {!isEditMode && (
              <div className="bg-muted p-4 rounded-sm">
                <h4 className="font-semibold mb-2">Langkah Selanjutnya:</h4>
                {isResolveMode ? (
                  <ol className="text-sm text-muted-foreground space-y-1">
                    <li>1. Periksa kembali detail barang yang sudah ditemukan</li>
                    <li>2. Kirim konfirmasi untuk menutup laporan kehilangan Anda</li>
                    <li>3. Laporan akan langsung hilang dari daftar publik dan masuk ke Riwayat Anda</li>
                  </ol>
                ) : (
                  <ol className="text-sm text-muted-foreground space-y-1">
                    <li>1. Serahkan barang ke security atau pusat informasi terdekat</li>
                    <li>2. Tunjukkan laporan ini sebagai bukti penemuan</li>
                    <li>3. Admin akan memverifikasi dan mencocokkan dengan laporan kehilangan</li>
                    <li>4. Anda akan dihubungi jika ada update terkait barang ini</li>
                  </ol>
                )}
              </div>
            )}

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
                  ? (isEditMode ? 'Menyimpan Perubahan...' : isResolveMode ? 'Mengonfirmasi Barang...' : 'Mengirim Laporan...')
                  : (isEditMode ? 'Simpan Perubahan Laporan' : isResolveMode ? 'Tandai Sudah Ditemukan' : 'Kirim Laporan Penemuan')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </>
  );
}
