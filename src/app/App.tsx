import React, { useState, useEffect, useRef } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { Search, Plus, Bell, Home, FileText, Camera, Contact, Menu, X, LogIn, User, LogOut } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Input } from './components/ui/input';
import { Badge } from './components/ui/badge';
import { Dashboard } from './components/Dashboard';
import { ReportLostForm } from './components/ReportLostForm';
import { ReportFoundForm } from './components/ReportFoundForm';
import { ItemGallery } from './components/ItemGallery';
import { ContactInfo } from './components/ContactInfo';
import { NotificationCenter } from './components/NotificationCenter';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { UserAvatar } from './components/UserAvatar';
import { ProfilePage } from './components/ProfilePage';
import { ReturnVerificationForm } from './components/ReturnVerificationForm';
import { Footer } from './components/Footer';
import { Toast } from './components/ui/toast';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import foundItLogo from 'figma:asset/6e20ff767bc819bcb65b83fac10d99d01f0c4fd8.png';
import {
  buildReporterIdentityUpdate,
  buildSubmissionSuccessNotification,
  buildItemInsertPayload,
  getItemStatusLabel,
  isAdminEmail,
  isMissingReporterIdentityColumnError,
  parseStoredJson,
  normalizeIndonesianPhone,
  buildUserDataFromAuthUser,
  shouldHideItemFromListings,
  stripReporterIdentityFromItemPayload,
  type ItemReturnVerification,
  type UserData,
} from './appState';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const mockItemsData = [
    {
      id: 1,
      title: 'Dompet Coklat',
      description: 'Dompet kulit warna coklat berisi KTM dan uang tunai',
      category: 'Dompet',
      type: 'lost',
      location: 'Perpustakaan Pusat',
      date: '2024-09-23',
      contact: '081234567801',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1661353559006-402f30f9e2a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb3N0JTIwcGhvbmUlMjB3YWxsZXQlMjBrZXlzfGVufDF8fHx8MTc1ODY5MDA0Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 2,
      title: 'iPhone 12 Pro',
      description: 'iPhone warna biru dengan casing hitam',
      category: 'Elektronik',
      type: 'found',
      location: 'Kantin Fakultas Teknik',
      date: '2024-09-22',
      contact: '081234567802',
      status: 'available',
      image: 'https://images.unsplash.com/photo-1661353559006-402f30f9e2a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb3N0JTIwcGhvbmUlMjB3YWxsZXQlMjBrZXlzfGVufDF8fHx8MTc1ODY5MDA0Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 3,
      title: 'Tas Ransel Hitam',
      description: 'Tas ransel merk Eiger warna hitam berisi buku dan alat tulis',
      category: 'Tas',
      type: 'lost',
      location: 'Ruang Kelas A203',
      date: '2024-09-21',
      contact: '081234567803',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1515590573546-cd05dc8557c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwYmFja3BhY2slMjBib29rc3xlbnwxfHx8fDE3NTg2OTAwNDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 4,
      title: 'Kunci Motor Yamaha',
      description: 'Kunci motor dengan gantungan boneka',
      category: 'Kunci',
      type: 'found',
      location: 'Parkiran Gedung B',
      date: '2024-09-20',
      contact: '081234567804',
      status: 'available',
      image: 'https://images.unsplash.com/photo-1661353559006-402f30f9e2a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb3N0JTIwcGhvbmUlMjB3YWxsZXQlMjBrZXlzfGVufDF8fHx8MTc1ODY5MDA0Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 5,
      title: 'Laptop Asus ROG',
      description: 'Laptop gaming Asus ROG warna hitam merah',
      category: 'Elektronik',
      type: 'lost',
      location: 'Lab Komputer',
      date: '2024-09-18',
      contact: '081234567805',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBjb21wdXRlciUyMGdyYXklMjBzaWx2ZXJ8ZW58MXx8fHwxNzcyOTc1MDY0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 6,
      title: 'Tumbler Biru',
      description: 'Tumbler warna biru merk Tupperware',
      category: 'Lainnya',
      type: 'found',
      location: 'Taman Kampus',
      date: '2024-09-19',
      contact: '081234567806',
      status: 'available',
      image: 'https://images.unsplash.com/photo-1760546607676-76c2bd048112?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibHVlJTIwdHVwcGVyd2FyZSUyMHdhdGVyJTIwYm90dGxlfGVufDF8fHx8MTc3Mjk3NTA2MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 7,
      title: 'KTM (Kartu Mahasiswa)',
      description: 'Kartu Tanda Mahasiswa atas nama Rani Permata Sari',
      category: 'Kartu Identitas',
      type: 'lost',
      location: 'Parkiran Motor',
      date: '2024-09-20',
      contact: '081234567807',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1680264370818-659352fa16f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwaWQlMjBjYXJkJTIwdW5pdmVyc2l0eXxlbnwxfHx8fDE3NzI5NzUwNjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 8,
      title: 'Headset Sony',
      description: 'Headset hitam merk Sony WH-1000XM4',
      category: 'Elektronik',
      type: 'found',
      location: 'Ruang Kelas B102',
      date: '2024-09-22',
      contact: '081234567808',
      status: 'available',
      image: 'https://images.unsplash.com/photo-1614860243518-c12eb2fdf66c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb255JTIwYmxhY2slMjBoZWFkc2V0JTIwaGVhZHBob25lc3xlbnwxfHx8fDE3NzI5NzUwNjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
  ];

const mockNotifications = [
  {
    id: 1,
    message: 'Barang yang sesuai dengan laporan Anda ditemukan: iPhone 14 Pro',
    type: 'match',
    date: '2024-09-23',
    read: false,
    userEmail: 'admin@gmail.com'
  },
  {
    id: 2,
    message: 'Laporan kehilangan Anda telah diverifikasi oleh admin',
    type: 'verification',
    date: '2024-09-22',
    read: true,
    userEmail: 'admin@gmail.com'
  },
  {
    id: 3,
    message: 'Dompet coklat yang Anda laporkan telah ditemukan di Perpustakaan Pusat',
    type: 'match',
    date: '2024-09-21',
    read: true,
    userEmail: 'admin@gmail.com'
  },
  {
    id: 4,
    message: 'Laporan penemuan barang berhasil disubmit dan sedang ditinjau',
    type: 'success',
    date: '2024-09-20',
    read: true,
    userEmail: 'admin@gmail.com'
  },
  {
    id: 5,
    message: 'Barang yang Anda temukan telah diklaim oleh pemiliknya',
    type: 'info',
    date: '2024-09-19',
    read: true,
    userEmail: 'admin@gmail.com'
  },
  {
    id: 6,
    message: 'Laporan Anda akan dihapus otomatis dalam 30 hari jika tidak ada klaim',
    type: 'info',
    date: '2024-09-18',
    read: true,
    userEmail: 'admin@gmail.com'
  }
];

const emptyUserData: UserData = {
  email: '',
  name: '',
  avatar: '',
  phone: '',
  address: '',
  nim: '',
};

type ProfileRow = {
  id: string;
  username: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  avatar_url: string | null;
  nim?: string | null;
};

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [items, setItems] = useState<any[]>([]);
  const [notifications, setNotifications] = useState(() => {
    return parseStoredJson(localStorage.getItem('notifications'), mockNotifications);
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData>(emptyUserData);
  const [authToastMessage, setAuthToastMessage] = useState('');
  const [showAuthToast, setShowAuthToast] = useState(false);
  const [galleryOwnershipFilter, setGalleryOwnershipFilter] = useState<"all" | "mine">("all");
  const [returnVerifications, setReturnVerifications] = useState<ItemReturnVerification[]>(() =>
    parseStoredJson(localStorage.getItem('itemReturnVerifications'), []),
  );
  const [selectedVerificationItemId, setSelectedVerificationItemId] = useState<number | null>(null);
  const [verificationReturnView, setVerificationReturnView] = useState('dashboard');
  const isHistoryNavigationRef = useRef(false);

  const alertMissingSupabaseConfig = () => {
    alert('Supabase belum dikonfigurasi. Tambahkan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di environment variables Vercel.');
  };

  const buildMergedUserData = (
    authUser: SupabaseUser,
    profile?: ProfileRow | null,
  ): UserData => {
    const authUserData = buildUserDataFromAuthUser(authUser);

    return {
      ...authUserData,
      email: profile?.email?.trim() || authUser.email || authUserData.email,
      name: profile?.username?.trim() || authUserData.name,
      avatar: profile?.avatar_url?.trim() || authUserData.avatar,
      phone: profile?.phone?.trim() || authUserData.phone,
      address: profile?.address?.trim() || authUserData.address,
      nim: profile?.nim?.trim() || authUserData.nim,
    };
  };

  const fetchProfileRow = async (userId: string): Promise<ProfileRow | null> => {
    if (!supabase) {
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, email, phone, address, avatar_url, nim')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching profile row:', error.message);
      return null;
    }

    return data;
  };

  // Mirror Supabase Auth into React state. Do not trust localStorage for auth.
  useEffect(() => {
    if (!supabase) {
      setIsLoggedIn(false);
      setUserData(emptyUserData);
      return;
    }

    let isMounted = true;

    const syncSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;

      if (!session?.user) {
        setIsLoggedIn(false);
        setUserData(emptyUserData);
        return;
      }

      setIsLoggedIn(true);
      setUserData(buildMergedUserData(session.user));

      const profile = await fetchProfileRow(session.user.id);
      if (!isMounted) return;
      setUserData(buildMergedUserData(session.user, profile));
    };

    syncSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setIsLoggedIn(false);
        setUserData(emptyUserData);
        return;
      }

      setIsLoggedIn(true);
      setUserData(buildMergedUserData(session.user));

      fetchProfileRow(session.user.id).then((profile) => {
        if (!isMounted) return;
        setUserData(buildMergedUserData(session.user, profile));
      });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Ambil data barang dari Supabase saat aplikasi dimuat
  useEffect(() => {
    const fetchItems = async () => {
      if (!supabase) {
        setItems(mockItemsData);
        return;
      }

      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('id', { ascending: false });
      
      if (error) console.error('Error fetching items:', error);
      else if (data) setItems(data);
    };
    fetchItems();
  }, []);

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('itemReturnVerifications', JSON.stringify(returnVerifications));
  }, [returnVerifications]);

  useEffect(() => {
    const initialState = window.history.state;
    if (!initialState?.view) {
      window.history.replaceState({ view: 'dashboard' }, '');
    }

    const handlePopState = (event: PopStateEvent) => {
      isHistoryNavigationRef.current = true;
      setCurrentView(event.state?.view || 'dashboard');
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    if (isHistoryNavigationRef.current) {
      isHistoryNavigationRef.current = false;
      return;
    }

    if (window.history.state?.view === currentView) {
      return;
    }

    window.history.pushState({ view: currentView }, '');
  }, [currentView]);

  const addItem = async (newItem: any): Promise<boolean> => {
    if (!supabase) {
      alertMissingSupabaseConfig();
      return false;
    }

    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      localStorage.setItem('redirectAfterLogin', currentView);
      setCurrentView('login');
      return false;
    }

    const itemToInsert = buildItemInsertPayload(newItem, userData);

    let insertResult = await supabase.from('items').insert([itemToInsert]).select();

    if (isMissingReporterIdentityColumnError(insertResult.error)) {
      console.warn('Items table belum punya kolom reporter identity, mencoba payload legacy.');
      insertResult = await supabase
        .from('items')
        .insert([stripReporterIdentityFromItemPayload(itemToInsert)])
        .select();

      if (insertResult.data && insertResult.data.length > 0) {
        insertResult.data = insertResult.data.map((item) => ({
          ...item,
          reporter_name: itemToInsert.reporter_name,
          reporter_email: itemToInsert.reporter_email,
        }));
      }
    }

    if (insertResult.error) {
      console.error('Error inserting item:', insertResult.error);
      alert('Terjadi kesalahan saat menyimpan data ke database.');
      return false;
    }
    
    if (insertResult.data && insertResult.data.length > 0) {
      setItems((currentItems) => [insertResult.data![0], ...currentItems]);
    }
    
    // Add notification for successful submission
    const notification = buildSubmissionSuccessNotification(newItem.type, userData.email);
    setNotifications((currentNotifications) => [notification, ...currentNotifications]);
    return true;
  };

  const updateItemStatus = async (id: number, status: string): Promise<boolean> => {
    if (!supabase) {
      alertMissingSupabaseConfig();
      return false;
    }

    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      localStorage.setItem('redirectAfterLogin', currentView);
      setCurrentView('login');
      return false;
    }

    const { error } = await supabase.from('items').update({ status }).eq('id', id);
    
    if (error) {
      console.error('Error updating item:', error);
      alert('Terjadi kesalahan saat mengupdate status di database.');
      return false;
    } else {
      setItems((currentItems) => currentItems.map(item =>
        item.id === id ? { ...item, status } : item
      ));
      return true;
    }
  };

  const markNotificationAsRead = (id: number) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const currentUserNotifications = notifications.filter((n: any) => n.userEmail === userData.email);
  const unreadCount = currentUserNotifications.filter((n: any) => !n.read).length;

  const handleLogout = async () => {
    if (!supabase) {
      setIsLoggedIn(false);
      setUserData(emptyUserData);
      setCurrentView('dashboard');
      return;
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      alert('Gagal logout: ' + error.message);
      return;
    }

    setIsLoggedIn(false);
    setUserData(emptyUserData);
    setCurrentView('dashboard');
  };

  const navigateToView = (view: string) => {
    if (view === 'gallery') {
      setGalleryOwnershipFilter('all');
    }
    setCurrentView(view);
  };

  const openOwnReportsGallery = () => {
    setGalleryOwnershipFilter('mine');
    setCurrentView('gallery');
  };

  const handleUpdateProfile = async (data: { email: string; name: string; avatar?: string; phone: string; address: string; nim: string }): Promise<boolean> => {
    if (!supabase) {
      alertMissingSupabaseConfig();
      return false;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert('Sesi login Anda tidak ditemukan. Silakan login ulang.');
      return false;
    }

    const trimmedEmail = data.email.trim();
    const trimmedName = data.name.trim();
    const normalizedPhone = normalizeIndonesianPhone(data.phone);
    const trimmedAddress = data.address.trim();
    const updatePayload: {
      email?: string;
      data: {
        name: string;
        full_name: string;
        username: string;
        avatar_url?: string;
        phone: string;
        address: string;
        nim: string;
      };
    } = {
      data: {
        name: trimmedName,
        full_name: trimmedName,
        username: trimmedName,
        avatar_url: data.avatar,
        phone: normalizedPhone,
        address: trimmedAddress,
        nim: data.nim.trim(),
      }
    };

    if (trimmedEmail && trimmedEmail !== userData.email) {
      updatePayload.email = trimmedEmail;
    }

    const { data: authData, error } = await supabase.auth.updateUser(updatePayload);

    if (error) {
      alert("Gagal memperbarui profile: " + error.message);
      return false;
    }

    const profilePayload = {
      id: user.id,
      username: trimmedName,
      email: trimmedEmail || user.email || '',
      phone: normalizedPhone,
      address: trimmedAddress,
      avatar_url: data.avatar || '',
      nim: data.nim.trim(),
    };

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' })
      .select('id, username, email, phone, address, avatar_url, nim')
      .maybeSingle();

    if (profileError) {
      alert('Profil Auth sudah diperbarui, tetapi penyimpanan tabel profiles gagal: ' + profileError.message);
      return false;
    }

    const updatedUser = authData.user ?? user;
    const updatedData = buildMergedUserData(updatedUser, profileData);
    const reporterIdentityUpdate = buildReporterIdentityUpdate(userData.email, updatedData);

    let reporterSyncWarning = '';
    if (reporterIdentityUpdate.matchEmails.length > 0) {
      const { error: itemReporterError } = await supabase
        .from('items')
        .update(reporterIdentityUpdate.payload)
        .in('reporter_email', reporterIdentityUpdate.matchEmails);

      if (itemReporterError && !isMissingReporterIdentityColumnError(itemReporterError)) {
        reporterSyncWarning = itemReporterError.message;
      }
    }

    setUserData(updatedData);
    setItems((currentItems) =>
      currentItems.map((item) =>
        reporterIdentityUpdate.matchEmails.includes(item.reporter_email)
          ? {
              ...item,
              reporter_name: reporterIdentityUpdate.payload.reporter_name,
              reporter_email: reporterIdentityUpdate.payload.reporter_email,
            }
          : item,
      ),
    );

    if (trimmedEmail && trimmedEmail !== userData.email) {
      alert('Jika konfirmasi email aktif, cek email baru Anda untuk menyelesaikan perubahan alamat email.');
    }

    if (reporterSyncWarning) {
      alert(`Profil berhasil diperbarui, tetapi sinkronisasi nama pada laporan gagal: ${reporterSyncWarning}`);
    }

    // Add notification for successful profile update
    const notification = {
      id: Date.now(),
      message: 'Profile berhasil diperbarui',
      type: 'success',
      date: new Date().toISOString().split('T')[0],
      read: false,
      userEmail: updatedData.email
    };
    setNotifications((currentNotifications) => [notification, ...currentNotifications]);

    return true;
  };

  const handleChangePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    if (!supabase) {
      alertMissingSupabaseConfig();
      return false;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const email = user?.email ?? userData.email;

    if (!email) {
      return false;
    }

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email,
      password: oldPassword,
    });

    if (verifyError) {
      return false;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      alert('Gagal mengubah password: ' + error.message);
      return false;
    }

    // Add notification
    const notification = {
      id: Date.now(),
      message: 'Password berhasil diubah',
      type: 'success',
      date: new Date().toISOString().split('T')[0],
      read: false,
      userEmail: userData.email
    };
    setNotifications((currentNotifications) => [notification, ...currentNotifications]);

    return true;
  };

  const handleDeleteAccount = async (confirmation: string, email: string): Promise<boolean> => {
    if (!supabase) {
      alertMissingSupabaseConfig();
      return false;
    }

    if (confirmation !== 'delete akun' || email !== userData.email) {
      return false;
    }

    const { error: deleteError } = await supabase.functions.invoke('delete-account', {
      method: 'POST',
    });

    if (deleteError) {
      alert('Gagal menghapus akun di backend: ' + deleteError.message);
      return false;
    }

    const { error: signOutError } = await supabase.auth.signOut({ scope: 'global' });

    if (signOutError) {
      alert('Permintaan hapus akun tersimpan, tetapi logout gagal: ' + signOutError.message);
      return false;
    }

    // Clear app-only cached data. Supabase Auth storage is cleared by signOut().
    localStorage.removeItem('registeredUser');
    localStorage.removeItem('redirectAfterLogin');

    // Reset state
    setIsLoggedIn(false);
    setUserData(emptyUserData);
    setCurrentView('dashboard');

    // Add notification
    const notification = {
      id: Date.now(),
      message: 'Akun berhasil dihapus',
      type: 'success',
      date: new Date().toISOString().split('T')[0],
      read: false,
      userEmail: userData.email
    };
    setNotifications((currentNotifications) => [notification, ...currentNotifications]);

    return true;
  };

  const selectedVerificationItem = items.find((item) => item.id === selectedVerificationItemId) ?? null;
  const isAdminUser = isAdminEmail(userData.email);

  const openReturnVerification = (itemId: number, fromView: string) => {
    setSelectedVerificationItemId(itemId);
    setVerificationReturnView(fromView);
    setCurrentView('return-verification');
  };

  const handleSubmitReturnVerification = async (payload: {
    itemId: number;
    reporterName: string;
    reporterEmail: string;
    reporterPhone: string;
    reporterNim: string;
    handoverPhoto: string;
  }): Promise<boolean> => {
    const verificationRecord: ItemReturnVerification = {
      id: Date.now(),
      itemId: payload.itemId,
      reporterName: payload.reporterName,
      reporterEmail: payload.reporterEmail,
      reporterPhone: payload.reporterPhone,
      reporterNim: payload.reporterNim,
      handoverPhoto: payload.handoverPhoto,
      verificationStatus: 'pending',
      submittedAt: new Date().toISOString(),
    };

    setReturnVerifications((currentRecords) => [verificationRecord, ...currentRecords.filter((record) => record.itemId !== payload.itemId)]);
    setNotifications((currentNotifications) => [
      {
        id: Date.now() + 1,
        message: 'Verifikasi barang sudah ditemukan sedang diproses admin',
        type: 'verification',
        date: new Date().toISOString().split('T')[0],
        read: false,
        userEmail: payload.reporterEmail,
      },
      ...currentNotifications,
    ]);
    setCurrentView(verificationReturnView);
    setSelectedVerificationItemId(null);
    return true;
  };

  const handleAdminApproveVerification = async (itemId: number): Promise<boolean> => {
    const success = await updateItemStatus(itemId, 'returned');
    if (!success) {
      return false;
    }

    const item = items.find((entry) => entry.id === itemId);
    if (item?.reporter_email) {
      setNotifications((currentNotifications) => [
        {
          id: Date.now() + 2,
          message: 'Verifikasi barang Anda telah disetujui admin',
          type: 'verification',
          date: new Date().toISOString().split('T')[0],
          read: false,
          userEmail: item.reporter_email,
        },
        ...currentNotifications,
      ]);
    }

    setReturnVerifications((currentRecords) =>
      currentRecords.map((record) =>
        record.itemId === itemId
          ? { ...record, verificationStatus: 'approved' }
          : record,
      ),
    );
    return true;
  };

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'report-lost', label: 'Lapor Hilang', icon: FileText },
    { id: 'report-found', label: 'Lapor Temuan', icon: Plus },
    { id: 'gallery', label: 'Galeri Barang', icon: Camera },
    { id: 'notifications', label: 'Notifikasi', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined },
    { id: 'contact', label: 'Kontak', icon: Contact }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Toast
        message={authToastMessage}
        isVisible={showAuthToast}
        onClose={() => setShowAuthToast(false)}
      />

      {/* Header - Hidden on login and register pages */}
      {currentView !== 'login' && currentView !== 'register' && (
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img
                src={foundItLogo}
                alt="Found It Logo"
                className="h-6 w-auto object-contain"
              />
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <nav className="flex items-center space-x-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant={currentView === item.id ? "default" : "ghost"}
                      onClick={() => navigateToView(item.id)}
                      className="relative text-xs"
                    >
                      <Icon className="w-3 h-3 mr-1" />
                      {item.label}
                      {item.badge && (
                        <Badge variant="destructive" className="ml-px rounded-full w-5 h-5 flex items-center justify-center p-0 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </nav>
              
              {/* Login/User Button - Desktop */}
              {!isLoggedIn ? (
                <Button
                  variant="outline"
                  onClick={() => setCurrentView('login')}
                  className="text-xs ml-2 bg-orange-600 text-white hover:bg-black hover:text-white"
                >
                  <LogIn className="w-3 h-3 mr-1" />
                  Login
                </Button>
              ) : (
                <div className="ml-2">
                  <UserAvatar
                    email={userData.email}
                    name={userData.name}
                    avatar={userData.avatar}
                    onLogout={handleLogout}
                    onProfileClick={() => navigateToView('profile')}
                  />
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentView === item.id ? "default" : "ghost"}
                    onClick={() => {
                      navigateToView(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start relative text-xs"
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {item.label}
                    {item.badge && (
                      <Badge variant="destructive" className="ml-auto rounded-full w-5 h-5 flex items-center justify-center p-0 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                );
              })}
              
              {/* Login/User Button - Mobile */}
              <div className="border-t border-border pt-2 mt-2">
                {!isLoggedIn ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentView('login');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start text-xs border-orange-500 text-orange-600"
                  >
                    <LogIn className="w-3 h-3 mr-1" />
                    Login
                  </Button>
                ) : (
                  <div className="space-y-1">
                    <div className="px-3 py-2 flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {userData.avatar ? (
                          <img
                            src={userData.avatar}
                            alt={userData.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-offset-2 ring-orange-600"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-medium text-sm ring-2 ring-offset-2 ring-orange-600">
                            {userData.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{userData.email}</p>
                        <p className="text-xs text-gray-500 truncate">{userData.name}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        navigateToView('profile');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-start text-xs"
                    >
                      <User className="w-3 h-3 mr-1" />
                      Profile
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-start text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="w-3 h-3 mr-1" />
                      Log out
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
      )}

      {/* Main Content */}
      <main
        className={
          currentView === 'login' || currentView === 'register'
            ? ''
            : currentView === 'dashboard'
              ? 'max-w-7xl mx-auto px-4 pt-8 sm:px-6 lg:px-8'
              : 'max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8'
        }
      >
        {!isSupabaseConfigured && currentView !== 'login' && currentView !== 'register' && (
          <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Supabase belum dikonfigurasi di environment deployment. Data demo tetap ditampilkan, tetapi login dan penyimpanan laporan belum aktif.
          </div>
        )}

        {currentView === 'dashboard' && (
          <Dashboard
            items={items}
            onNavigate={navigateToView}
            onUpdateStatus={updateItemStatus}
            canUpdateStatus={isLoggedIn}
            currentUserEmail={userData.email}
            isAdminUser={isAdminUser}
            onOpenReturnVerification={(itemId) => openReturnVerification(itemId, 'dashboard')}
            onApproveVerification={handleAdminApproveVerification}
            returnVerifications={returnVerifications}
          />
        )}

        {currentView === 'report-lost' && (
          <ReportLostForm
            onSubmit={addItem}
            onRequireLogin={() => {
              localStorage.setItem('redirectAfterLogin', 'report-lost');
              setCurrentView('login');
            }}
            isLoggedIn={isLoggedIn}
            userPhone={userData.phone}
            onRequireProfileCompletion={() => {
              alert('Lengkapi nomor HP Indonesia di halaman profil terlebih dahulu.');
              setCurrentView('profile');
            }}
          />
        )}

        {currentView === 'report-found' && (
          <ReportFoundForm
            onSubmit={addItem}
            onRequireLogin={() => {
              localStorage.setItem('redirectAfterLogin', 'report-found');
              setCurrentView('login');
            }}
            isLoggedIn={isLoggedIn}
            userPhone={userData.phone}
            onRequireProfileCompletion={() => {
              alert('Lengkapi nomor HP Indonesia di halaman profil terlebih dahulu.');
              setCurrentView('profile');
            }}
          />
        )}

        {currentView === 'gallery' && (
          <ItemGallery
            items={items}
            onUpdateStatus={updateItemStatus}
            canUpdateStatus={isLoggedIn}
            currentUserEmail={userData.email}
            ownershipFilter={galleryOwnershipFilter}
            onOwnershipFilterChange={setGalleryOwnershipFilter}
            isAdminUser={isAdminUser}
            onOpenReturnVerification={(itemId) => openReturnVerification(itemId, 'gallery')}
            onApproveVerification={handleAdminApproveVerification}
            returnVerifications={returnVerifications}
          />
        )}

        {currentView === 'return-verification' && selectedVerificationItem && (
          <ReturnVerificationForm
            item={selectedVerificationItem}
            userData={userData}
            onBack={() => setCurrentView(verificationReturnView)}
            onSubmit={handleSubmitReturnVerification}
          />
        )}

        {currentView === 'notifications' && (
          <NotificationCenter
            notifications={currentUserNotifications}
            onMarkAsRead={markNotificationAsRead}
            onDeleteNotification={deleteNotification}
          />
        )}

        {currentView === 'contact' && (
          <ContactInfo />
        )}

        {currentView === 'login' && (
          <LoginPage
            onLoginSuccess={async (email?: string) => {
              if (!supabase) {
                alertMissingSupabaseConfig();
                return;
              }

              // Mengambil detail profil pengguna langsung dari sesi Supabase
              const { data: { session } } = await supabase.auth.getSession();
              const user = session?.user;
              const userName = user?.user_metadata?.name || user?.user_metadata?.username || email?.split('@')[0] || 'User';
              const userAvatar = user?.user_metadata?.avatar_url || '';

              setAuthToastMessage('Login berhasil!');
              setShowAuthToast(true);
              setIsLoggedIn(true);
              if (user) {
                setUserData(buildMergedUserData(user));
              } else {
                setUserData({
                  email: email || '',
                  name: userName,
                  avatar: userAvatar,
                  phone: '',
                  address: '',
                  nim: '',
                });
              }

              // Check if there's a redirect after login
              const redirectTo = localStorage.getItem('redirectAfterLogin');
              if (redirectTo) {
                setCurrentView(redirectTo);
                localStorage.removeItem('redirectAfterLogin');
              } else {
                setCurrentView('dashboard');
              }

              if (user) {
                void fetchProfileRow(user.id).then((profile) => {
                  setUserData(buildMergedUserData(user, profile));
                });
              }
            }}
            onSwitchToRegister={() => setCurrentView('register')}
          />
        )}

        {currentView === 'register' && (
          <RegisterPage
            onRegisterSuccess={() => {
              setAuthToastMessage('Registrasi berhasil! Silakan login dengan akun Anda');
              setShowAuthToast(true);
              // After register, go to login page
              setCurrentView('login');
            }}
            onSwitchToLogin={() => setCurrentView('login')}
          />
        )}

        {currentView === 'profile' && isLoggedIn && (
          <ProfilePage
            userData={userData}
            onUpdateProfile={handleUpdateProfile}
            onChangePassword={handleChangePassword}
            onDeleteAccount={handleDeleteAccount}
            onBrowseOwnReports={openOwnReportsGallery}
          />
        )}
      </main>

      {currentView === 'dashboard' && <Footer />}
    </div>
  );
}
