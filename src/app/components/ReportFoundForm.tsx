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
  onSubmit: (item: any) => void;
  onRequireLogin: () => void;
  onRequireProfileCompletion: () => void;
  isLoggedIn: boolean;
  userPhone: string;
}

export function ReportFoundForm({
  onSubmit,
  onRequireLogin,
  onRequireProfileCompletion,
  isLoggedIn,
  userPhone,
}: ReportFoundFormProps) {
  const [formData, setFormData] = useState(() => {
    return parseStoredJson(localStorage.getItem('reportFoundDraft'), {
      title: '',
      category: '',
      description: '',
      location: '',
      contact: '',
      image: ''
    });
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(() => {
    const draft = parseStoredJson(localStorage.getItem('reportFoundDraft'), {
      image: '',
    });
    return draft.image || null;
  });

  // Save draft to localStorage whenever formData changes
  useEffect(() => {
    localStorage.setItem('reportFoundDraft', JSON.stringify(formData));
  }, [formData]);

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
      localStorage.setItem('reportFoundDraft', JSON.stringify(formData));
      // Show toast notification
      setShowToast(true);
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

    onSubmit({
      ...formData,
      type: 'found',
      contact: normalizedUserPhone,
      image: imagePreview || 'https://images.unsplash.com/photo-1661353559006-402f30f9e2a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb3N0JTIwcGhvbmUlMjB3YWxsZXQlMjBrZXlzfGVufDF8fHx8MTc1ODY5MDA0Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    });

    // Clear draft and reset form
    localStorage.removeItem('reportFoundDraft');
    setFormData({
      title: '',
      category: '',
      description: '',
      location: '',
      contact: '',
      image: ''
    });
    setImagePreview(null);
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
      } catch (error) {
        console.error("Gagal mengkompres gambar:", error);
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
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-green-600" />
            <span>Laporan Penemuan Barang</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <MapPin className="h-4 w-4" />
            <AlertDescription>
              Terima kasih telah menemukan barang! Silakan laporkan dan serahkan ke security atau pusat informasi terdekat.
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori barang" />
                </SelectTrigger>
                <SelectContent>
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Lokasi Ditemukan *</Label>
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih lokasi menemukan barang" />
                </SelectTrigger>
                <SelectContent>
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
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Nomor diambil dari profil Anda dan akan dipakai untuk chat WhatsApp.
              </p>
            </div>

            {validationError && (
              <Alert variant="destructive">
                <MapPin className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="image">Foto Barang *</Label>
              <div className="space-y-4">
                {!imagePreview ? (
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload foto barang yang ditemukan
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Foto sangat penting untuk verifikasi pemilik
                    </p>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="max-w-xs mx-auto"
                      required
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Langkah Selanjutnya:</h4>
              <ol className="text-sm text-muted-foreground space-y-1">
                <li>1. Serahkan barang ke security atau pusat informasi terdekat</li>
                <li>2. Tunjukkan laporan ini sebagai bukti penemuan</li>
                <li>3. Admin akan memverifikasi dan mencocokkan dengan laporan kehilangan</li>
                <li>4. Anda akan dihubungi jika ada update terkait barang ini</li>
              </ol>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Mengirim Laporan...' : 'Kirim Laporan Penemuan'}
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </>
  );
}
