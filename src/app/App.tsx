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
import { MatchResultsPage } from './components/MatchResultsPage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { ForgotPasswordPage } from './components/ForgotPasswordPage';
import { ResetPasswordPage } from './components/ResetPasswordPage';
import { UserAvatar } from './components/UserAvatar';
import { ProfilePage } from './components/ProfilePage';
import { ReturnVerificationForm } from './components/ReturnVerificationForm';
import { Footer } from './components/Footer';
import { Toast } from './components/ui/toast';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import foundItLogo from 'figma:asset/6e20ff767bc819bcb65b83fac10d99d01f0c4fd8.png';
import {
  type AppNotification,
  buildAutoMatchNotificationMessage,
  buildDerivedMatchNotifications,
  buildReporterIdentityUpdate,
  buildSubmissionSuccessNotification,
  buildUserMatchSummaries,
  buildItemInsertPayload,
  findAutoMatchCandidates,
  isMissingReporterIdentityColumnError,
  parseStoredJson,
  normalizeIndonesianPhone,
  buildUserDataFromAuthUser,
  shouldHideItemFromListings,
  stripReporterIdentityFromItemPayload,
  type ItemReturnVerification,
  type UserData,
} from './appState';
import { getPasswordRecoveryUrlState } from '../lib/authRecovery';
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
  id: '',
  email: '',
  name: '',
  avatar: '',
  phone: '',
  address: '',
  nim: '',
  isAdmin: false,
};

type FoundReportContext = {
  sourceLostItemId: number;
  title: string;
  category: string;
  description: string;
  location: string;
  image?: string;
  returnView: string;
};

type VerificationFlowMode = 'verification' | 'history-claim';

type ProfileRow = {
  id: string;
  username: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  avatar_url: string | null;
  nim?: string | null;
  is_admin?: boolean | null;
};

const isMissingProfileOptionalColumnError = (
  error: { code?: string; message?: string | null } | null | undefined,
): boolean => {
  if (!error) {
    return false;
  }

  return (
    error.code === 'PGRST204'
    && typeof error.message === 'string'
    && (error.message.includes("'nim'") || error.message.includes("'is_admin'"))
    && error.message.includes("'profiles'")
  );
};

export default function App() {
  const getDerivedMatchReadStorageKey = (userId?: string, userEmail?: string) =>
    `derivedMatchRead:${userId || userEmail || 'guest'}`;

  const [currentView, setCurrentView] = useState('dashboard');
  const [items, setItems] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    return supabase ? [] : parseStoredJson(localStorage.getItem('notifications'), mockNotifications);
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData>(emptyUserData);
  const [authToastMessage, setAuthToastMessage] = useState('');
  const [showAuthToast, setShowAuthToast] = useState(false);
  const [galleryOwnershipFilter, setGalleryOwnershipFilter] = useState<"all" | "mine" | "history">("all");
  const [returnVerifications, setReturnVerifications] = useState<ItemReturnVerification[]>([]);
  const [itemMatches, setItemMatches] = useState<any[]>([]);
  const [readDerivedMatchIds, setReadDerivedMatchIds] = useState<number[]>([]);
  const [foundReportContext, setFoundReportContext] = useState<FoundReportContext | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [selectedVerificationItemId, setSelectedVerificationItemId] = useState<number | null>(null);
  const [verificationReturnView, setVerificationReturnView] = useState('dashboard');
  const [verificationFlowMode, setVerificationFlowMode] = useState<VerificationFlowMode>('verification');
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
      id: authUser.id,
      email: profile?.email?.trim() || authUser.email || authUserData.email,
      name: profile?.username?.trim() || authUserData.name,
      avatar: profile?.avatar_url?.trim() || authUserData.avatar,
      phone: profile?.phone?.trim() || authUserData.phone,
      address: profile?.address?.trim() || authUserData.address,
      nim: profile?.nim?.trim() || authUserData.nim,
      isAdmin: Boolean(profile?.is_admin),
    };
  };

  const fetchProfileRow = async (userId: string): Promise<ProfileRow | null> => {
    if (!supabase) {
      return null;
    }

    let profileResult = await supabase
      .from('profiles')
      .select('id, username, email, phone, address, avatar_url, nim, is_admin')
      .eq('id', userId)
      .maybeSingle();

    if (isMissingProfileOptionalColumnError(profileResult.error)) {
      console.warn('Profiles table belum punya semua kolom opsional baru, memakai schema legacy.');
      profileResult = await supabase
        .from('profiles')
        .select('id, username, email, phone, address, avatar_url')
        .eq('id', userId)
        .maybeSingle();
    }

    if (profileResult.error) {
      console.warn('Error fetching profile row:', profileResult.error.message);
      return null;
    }

    return profileResult.data;
  };

  // Mirror Supabase Auth into React state. Do not trust localStorage for auth.
  useEffect(() => {
    if (!supabase) {
      setIsLoggedIn(false);
      setUserData(emptyUserData);
      return;
    }

    let isMounted = true;
    const passwordRecoveryState = getPasswordRecoveryUrlState(window.location.href);

    if (passwordRecoveryState.shouldShowResetPassword) {
      setCurrentView('reset-password');
    }

    const syncSession = async () => {
      if (passwordRecoveryState.recoveryCode) {
        const { error } = await supabase.auth.exchangeCodeForSession(passwordRecoveryState.recoveryCode);
        if (error) {
          console.error('Error exchanging password recovery code:', error);
          if (isMounted) {
            setAuthToastMessage('Link reset password tidak valid atau sudah kedaluwarsa. Silakan minta link baru.');
            setShowAuthToast(true);
          }
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;

      if (window.location.pathname + window.location.search !== passwordRecoveryState.cleanedUrl) {
        const nextHistoryView = passwordRecoveryState.shouldShowResetPassword ? 'reset-password' : (window.history.state?.view || 'dashboard');
        window.history.replaceState({ view: nextHistoryView }, '', passwordRecoveryState.cleanedUrl);
      }

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        window.history.replaceState({ view: 'reset-password' }, '', passwordRecoveryState.cleanedUrl);
        setCurrentView('reset-password');
      }

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
    if (!supabase) {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  useEffect(() => {
    if (!userData.id && !userData.email) {
      setReadDerivedMatchIds([]);
      return;
    }

    setReadDerivedMatchIds(
      parseStoredJson(
        localStorage.getItem(getDerivedMatchReadStorageKey(userData.id, userData.email)),
        [],
      ),
    );
  }, [userData.id, userData.email]);

  useEffect(() => {
    if (!userData.id && !userData.email) {
      return;
    }

    localStorage.setItem(
      getDerivedMatchReadStorageKey(userData.id, userData.email),
      JSON.stringify(readDerivedMatchIds),
    );
  }, [readDerivedMatchIds, userData.id, userData.email]);

  useEffect(() => {
    const fetchUserScopedData = async () => {
      if (!supabase) {
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const authUser = session?.user;

      if (!authUser) {
        setNotifications([]);
        setItemMatches([]);
        setReturnVerifications([]);
        return;
      }

      let notificationsResult = await supabase
        .from('notifications')
        .select('id, message, type, read, created_at, user_id, metadata')
        .order('created_at', { ascending: false });

      if (
        notificationsResult.error
        && notificationsResult.error.code === 'PGRST204'
        && notificationsResult.error.message?.includes("'metadata'")
      ) {
        notificationsResult = await supabase
          .from('notifications')
          .select('id, message, type, read, created_at, user_id')
          .order('created_at', { ascending: false });
      }

      if (notificationsResult.error) {
        console.error('Error fetching notifications:', notificationsResult.error);
      } else if (notificationsResult.data) {
        setNotifications(
          notificationsResult.data.map((notification) => ({
            id: Number(notification.id),
            message: notification.message,
            type: notification.type,
            read: notification.read,
            date: notification.created_at,
            user_id: notification.user_id,
            userEmail: userData.email,
            metadata: 'metadata' in notification ? notification.metadata ?? undefined : undefined,
          })),
        );
      }

      const { data: matchData, error: matchError } = await supabase
        .from('item_matches')
        .select('*')
        .order('created_at', { ascending: false });

      if (matchError) {
        console.error('Error fetching item matches:', matchError);
      } else if (matchData) {
        setItemMatches(matchData);
      }

      const { data: verificationData, error: verificationError } = await supabase
        .from('item_return_verifications')
        .select('id, item_id, reporter_id, reporter_name, reporter_email, reporter_phone, reporter_nim, handover_photo, verification_status, submitted_at, approved_at, approved_by')
        .order('submitted_at', { ascending: false });

      if (verificationError) {
        console.error('Error fetching return verifications:', verificationError);
      } else if (verificationData) {
        setReturnVerifications(
          verificationData.map((record) => ({
            id: Number(record.id),
            itemId: Number(record.item_id),
            reporterId: record.reporter_id,
            reporterName: record.reporter_name,
            reporterEmail: record.reporter_email,
            reporterPhone: record.reporter_phone,
            reporterNim: record.reporter_nim,
            handoverPhoto: record.handover_photo,
            verificationStatus: record.verification_status,
            submittedAt: record.submitted_at,
            approvedAt: record.approved_at,
            approvedBy: record.approved_by,
          })),
        );
      }
    };

    void fetchUserScopedData();
  }, [isLoggedIn, userData.id, userData.email]);

  useEffect(() => {
    const initialState = window.history.state;
    const requestedView = new URLSearchParams(window.location.search).get('view');
    const initialView = requestedView === 'reset-password' ? 'reset-password' : 'dashboard';

    if (!initialState?.view) {
      window.history.replaceState({ view: initialView }, '');
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

    if (newItem.autoAcceptReturn && typeof newItem.sourceLostItemId === 'number') {
      const statusUpdated = await updateItemStatus(newItem.sourceLostItemId, 'returned');

      if (!statusUpdated) {
        return false;
      }

      await createNotification({
        userId: userData.id,
        userEmail: userData.email,
        message: `Laporan kehilangan "${newItem.title}" berhasil ditandai sudah ditemukan.`,
        type: 'success',
      });

      return true;
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
    
    let insertedItem: any | null = null;

    if (insertResult.data && insertResult.data.length > 0) {
      insertedItem = {
        ...insertResult.data[0],
        reporter_id: insertResult.data[0].reporter_id ?? itemToInsert.reporter_id,
        reporter_name: insertResult.data[0].reporter_name ?? itemToInsert.reporter_name,
        reporter_email: insertResult.data[0].reporter_email ?? itemToInsert.reporter_email,
      };

      setItems((currentItems) => [insertedItem, ...currentItems]);
    }
    
    // Add notification for successful submission
    const notification = buildSubmissionSuccessNotification(newItem.type, userData.email);
    await createNotification({
      userId: userData.id,
      userEmail: userData.email,
      message: notification.message,
      type: notification.type,
    });

    if (insertedItem) {
      await runAutoMatching(insertedItem);
    }

    return true;
  };

  const runAutoMatching = async (insertedItem: any) => {
    if (!supabase) {
      return;
    }

    const oppositeType = insertedItem.type === 'lost' ? 'found' : 'lost';
    const { data: candidateItems, error: candidateItemsError } = await supabase
      .from('items')
      .select('*')
      .eq('type', oppositeType)
      .neq('id', insertedItem.id)
      .order('id', { ascending: false });

    if (candidateItemsError) {
      console.error('Error fetching match candidates:', candidateItemsError);
      return;
    }

    const matchedCandidates = findAutoMatchCandidates(insertedItem, candidateItems ?? [])
      .filter((candidate) => candidate.scoreStatus === 'matched');

    if (matchedCandidates.length === 0) {
      return;
    }

    for (const candidate of matchedCandidates) {
      const matchedItem = (candidateItems ?? []).find((item) => Number(item.id) === candidate.matchedItemId);
      if (!matchedItem) {
        continue;
      }

      const lostItemId = insertedItem.type === 'lost' ? insertedItem.id : matchedItem.id;
      const foundItemId = insertedItem.type === 'found' ? insertedItem.id : matchedItem.id;

      const { error: insertMatchError } = await supabase
        .from('item_matches')
        .upsert([{
          lost_item_id: lostItemId,
          found_item_id: foundItemId,
          score: candidate.score,
          status: 'matched',
          match_reason: candidate.reason,
        }], { onConflict: 'lost_item_id,found_item_id' });

      if (insertMatchError) {
        console.error('Error saving item match:', insertMatchError);
        continue;
      }

      setItemMatches((currentMatches) => {
        const nextMatch = {
          id: Date.now() + Number(matchedItem.id),
          lost_item_id: lostItemId,
          found_item_id: foundItemId,
          score: candidate.score,
          status: 'matched',
          match_reason: candidate.reason,
          created_at: new Date().toISOString(),
        };

        const withoutDuplicate = currentMatches.filter((entry) => !(
          Number(entry.lost_item_id) === lostItemId &&
          Number(entry.found_item_id) === foundItemId
        ));

        return [nextMatch, ...withoutDuplicate];
      });

      await createNotification({
        userId: insertedItem.reporter_id,
        userEmail: insertedItem.reporter_email,
        message: buildAutoMatchNotificationMessage(insertedItem.type, insertedItem.title, candidate.score),
        type: 'match',
        metadata: {
          targetView: 'match-results',
          itemId: insertedItem.id,
        },
      });

      if (matchedItem.reporter_id && matchedItem.reporter_id !== insertedItem.reporter_id) {
        await createNotification({
          userId: matchedItem.reporter_id,
          userEmail: matchedItem.reporter_email,
          message: buildAutoMatchNotificationMessage(matchedItem.type, matchedItem.title, candidate.score),
          type: 'match',
          metadata: {
            targetView: 'match-results',
            itemId: matchedItem.id,
          },
        });
      }
    }
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

  const createNotification = async (payload: {
    userId?: string;
    userEmail: string;
    message: string;
    type: AppNotification['type'];
    metadata?: AppNotification['metadata'];
  }) => {
    const notificationDate = new Date().toISOString();

    if (!supabase || !payload.userId) {
      const notification: AppNotification = {
        id: Date.now(),
        message: payload.message,
        type: payload.type,
        date: notificationDate,
        read: false,
        userEmail: payload.userEmail,
        metadata: payload.metadata,
      };
      setNotifications((currentNotifications) => [notification, ...currentNotifications]);
      return;
    }

    let insertResult = await supabase
      .from('notifications')
      .insert([{
        user_id: payload.userId,
        message: payload.message,
        type: payload.type,
        metadata: payload.metadata ?? {},
      }])
      .select('id, message, type, read, created_at, user_id, metadata')
      .maybeSingle();

    if (
      insertResult.error
      && insertResult.error.code === 'PGRST204'
      && insertResult.error.message?.includes("'metadata'")
    ) {
      insertResult = await supabase
        .from('notifications')
        .insert([{
          user_id: payload.userId,
          message: payload.message,
          type: payload.type,
        }])
        .select('id, message, type, read, created_at, user_id')
        .maybeSingle();
    }

    if (insertResult.error) {
      console.error('Error creating notification:', insertResult.error);
      return;
    }

    const data = insertResult.data;
    if (data) {
      setNotifications((currentNotifications) => [
        {
          id: Number(data.id),
          message: data.message,
          type: data.type,
          read: data.read,
          date: data.created_at,
          user_id: data.user_id,
          userEmail: payload.userEmail,
          metadata: 'metadata' in data ? data.metadata ?? undefined : payload.metadata,
        },
        ...currentNotifications,
      ]);
    }
  };

  const markNotificationAsRead = (id: number) => {
    const currentNotification = currentUserNotifications.find((notification) => notification.id === id);
    const derivedMatchId = currentNotification?.metadata?.matchId;

    if (
      currentNotification?.type === 'match'
      && typeof derivedMatchId === 'number'
      && id < 0
    ) {
      setReadDerivedMatchIds((currentReadIds) => (
        currentReadIds.includes(derivedMatchId)
          ? currentReadIds
          : [...currentReadIds, derivedMatchId]
      ));
      return;
    }

    if (!supabase) {
      setNotifications(notifications.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      ));
      return;
    }

    void supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          console.error('Error marking notification as read:', error);
          return;
        }

        setNotifications((currentNotifications) => currentNotifications.map((notif) =>
          notif.id === id ? { ...notif, read: true } : notif
        ));
      });
  };

  const deleteNotification = (id: number) => {
    if (!supabase) {
      setNotifications(notifications.filter(notif => notif.id !== id));
      return;
    }

    void supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          console.error('Error deleting notification:', error);
          return;
        }

        setNotifications((currentNotifications) => currentNotifications.filter((notif) => notif.id !== id));
      });
  };

  const currentUserMatches = buildUserMatchSummaries(itemMatches, items, userData.email, userData.id);
  const currentUserNotifications = buildDerivedMatchNotifications(
    notifications,
    currentUserMatches,
    userData.email,
    readDerivedMatchIds,
  );
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
    if (view === 'report-found') {
      setFoundReportContext(null);
    }
    if (view !== 'report-found' && foundReportContext) {
      setFoundReportContext(null);
    }
    if (view !== 'match-results') {
      setSelectedMatchId(null);
    }
    setCurrentView(view);
  };

  const openMatchResults = (matchId?: number | null) => {
    setSelectedMatchId(matchId ?? null);
    setCurrentView('match-results');
  };

  const openOwnReportsGallery = () => {
    setGalleryOwnershipFilter('mine');
    setCurrentView('gallery');
  };

  const openMarkFoundReport = (itemId: number, returnView: string) => {
    const sourceItem = items.find((item) => item.id === itemId);

    if (!sourceItem) {
      return;
    }

    setFoundReportContext({
      sourceLostItemId: itemId,
      title: sourceItem.title,
      category: sourceItem.category,
      description: sourceItem.description,
      location: sourceItem.location,
      image: sourceItem.image,
      returnView,
    });
    setCurrentView('report-found');
  };

  const openItemOwnerFollowUp = (itemId: number, fromView: string) => {
    const sourceItem = items.find((item) => item.id === itemId);

    if (!sourceItem) {
      return;
    }

    if (sourceItem.type === 'found') {
      openReturnVerification(itemId, fromView, 'history-claim');
      return;
    }

    openMarkFoundReport(itemId, fromView);
  };

  const handleResolvedLostReportSuccess = () => {
    setFoundReportContext(null);
    setGalleryOwnershipFilter('history');
    setAuthToastMessage('Barang berhasil ditandai sudah ditemukan dan dipindahkan ke Riwayat Anda');
    setShowAuthToast(true);
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

    let profileResult = await supabase
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' })
      .select('id, username, email, phone, address, avatar_url, nim, is_admin')
      .maybeSingle();

    if (isMissingProfileOptionalColumnError(profileResult.error)) {
      console.warn('Profiles table belum punya semua kolom opsional baru, mencoba simpan schema legacy.');
      const { nim: _nim, ...legacyProfilePayload } = profilePayload;
      profileResult = await supabase
        .from('profiles')
        .upsert(legacyProfilePayload, { onConflict: 'id' })
        .select('id, username, email, phone, address, avatar_url')
        .maybeSingle();

      if (profileResult.data) {
        profileResult.data = {
          ...profileResult.data,
          nim: data.nim.trim(),
          is_admin: false,
        };
      }
    }

    if (profileResult.error) {
      alert('Profil Auth sudah diperbarui, tetapi penyimpanan tabel profiles gagal: ' + profileResult.error.message);
      return false;
    }

    const updatedUser = authData.user ?? user;
    const updatedData = buildMergedUserData(updatedUser, profileResult.data);
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
    await createNotification({
      userId: updatedData.id,
      userEmail: updatedData.email,
      message: 'Profile berhasil diperbarui',
      type: 'success',
    });

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
    await createNotification({
      userId: userData.id,
      userEmail: userData.email,
      message: 'Password berhasil diubah',
      type: 'success',
    });

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
    return true;
  };

  const selectedVerificationItem = items.find((item) => item.id === selectedVerificationItemId) ?? null;
  const isAdminUser = userData.isAdmin;

  const openReturnVerification = (
    itemId: number,
    fromView: string,
    mode: VerificationFlowMode = 'verification',
  ) => {
    setSelectedVerificationItemId(itemId);
    setVerificationReturnView(fromView);
    setVerificationFlowMode(mode);
    setCurrentView('return-verification');
  };

  const handleSubmitReturnVerification = async (payload: {
    itemId: number;
    reporterId: string;
    reporterName: string;
    reporterEmail: string;
    reporterPhone: string;
    reporterNim: string;
    handoverPhoto: string;
  }): Promise<boolean> => {
    const isDirectHistoryClaim = verificationFlowMode === 'history-claim';

    if (!supabase) {
      const verificationRecord: ItemReturnVerification = {
        id: Date.now(),
        itemId: payload.itemId,
        reporterId: payload.reporterId,
        reporterName: payload.reporterName,
        reporterEmail: payload.reporterEmail,
        reporterPhone: payload.reporterPhone,
        reporterNim: payload.reporterNim,
        handoverPhoto: payload.handoverPhoto,
        verificationStatus: isDirectHistoryClaim ? 'approved' : 'pending',
        submittedAt: new Date().toISOString(),
      };

      setReturnVerifications((currentRecords) => [verificationRecord, ...currentRecords.filter((record) => record.itemId !== payload.itemId)]);
      if (isDirectHistoryClaim) {
        setItems((currentItems) => currentItems.map((item) =>
          item.id === payload.itemId ? { ...item, status: 'claimed' } : item
        ));
        setGalleryOwnershipFilter('history');
        setAuthToastMessage('Serah terima berhasil disimpan dan laporan dipindahkan ke Riwayat Anda');
        setShowAuthToast(true);
        setCurrentView('gallery');
      } else {
        await createNotification({
          userId: payload.reporterId,
          userEmail: payload.reporterEmail,
          message: 'Verifikasi barang sudah ditemukan sedang diproses admin',
          type: 'verification',
        });
        setAuthToastMessage('Permintaan verifikasi berhasil dikirim');
        setShowAuthToast(true);
        setCurrentView(verificationReturnView);
      }
      setSelectedVerificationItemId(null);
      setVerificationFlowMode('verification');
      return true;
    }

    const { data: insertedVerification, error: insertVerificationError } = await supabase
      .from('item_return_verifications')
      .upsert([{
        item_id: payload.itemId,
        reporter_id: payload.reporterId,
        reporter_name: payload.reporterName,
        reporter_email: payload.reporterEmail,
        reporter_phone: payload.reporterPhone,
        reporter_nim: payload.reporterNim,
        handover_photo: payload.handoverPhoto,
        verification_status: isDirectHistoryClaim ? 'approved' : 'pending',
      }], { onConflict: 'item_id' })
      .select('id, item_id, reporter_id, reporter_name, reporter_email, reporter_phone, reporter_nim, handover_photo, verification_status, submitted_at, approved_at, approved_by')
      .maybeSingle();

    if (insertVerificationError) {
      console.error('Error inserting return verification:', insertVerificationError);
      alert('Terjadi kesalahan saat menyimpan verifikasi serah terima.');
        return false;
      }

      const statusUpdated = await updateItemStatus(
        payload.itemId,
        isDirectHistoryClaim ? 'claimed' : 'pending_verification',
      );
      if (!statusUpdated) {
        await supabase.from('item_return_verifications').delete().eq('item_id', payload.itemId);
        return false;
      }

    if (insertedVerification) {
      setReturnVerifications((currentRecords) => [
        {
          id: Number(insertedVerification.id),
          itemId: Number(insertedVerification.item_id),
          reporterId: insertedVerification.reporter_id,
          reporterName: insertedVerification.reporter_name,
          reporterEmail: insertedVerification.reporter_email,
          reporterPhone: insertedVerification.reporter_phone,
          reporterNim: insertedVerification.reporter_nim,
          handoverPhoto: insertedVerification.handover_photo,
          verificationStatus: insertedVerification.verification_status,
          submittedAt: insertedVerification.submitted_at,
          approvedAt: insertedVerification.approved_at,
          approvedBy: insertedVerification.approved_by,
        },
          ...currentRecords.filter((record) => record.itemId !== payload.itemId),
        ]);
      }

      if (isDirectHistoryClaim) {
        setGalleryOwnershipFilter('history');
        setAuthToastMessage('Serah terima berhasil disimpan dan laporan dipindahkan ke Riwayat Anda');
        setShowAuthToast(true);
        setCurrentView('gallery');
      } else {
        await createNotification({
          userId: payload.reporterId,
          userEmail: payload.reporterEmail,
          message: 'Verifikasi barang sudah ditemukan sedang diproses admin',
          type: 'verification',
        });
        setAuthToastMessage('Permintaan verifikasi berhasil dikirim');
        setShowAuthToast(true);
        setCurrentView(verificationReturnView);
      }
      setSelectedVerificationItemId(null);
      setVerificationFlowMode('verification');
      return true;
    };

  const handleAdminApproveVerification = async (itemId: number): Promise<boolean> => {
    const success = await updateItemStatus(itemId, 'returned');
    if (!success) {
      return false;
    }

    const item = items.find((entry) => entry.id === itemId);
    if (supabase) {
      const { error } = await supabase
        .from('item_return_verifications')
        .update({
          verification_status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: userData.id,
        })
        .eq('item_id', itemId);

      if (error) {
        console.error('Error approving return verification:', error);
        alert('Status barang berhasil diperbarui, tetapi data verifikasi gagal disetujui.');
      }
    }

    setReturnVerifications((currentRecords) =>
      currentRecords.map((record) =>
        record.itemId === itemId
          ? { ...record, verificationStatus: 'approved' }
          : record,
      ),
    );

    if (item?.reporter_email) {
      await createNotification({
        userId: item.reporter_id,
        userEmail: item.reporter_email,
        message: 'Verifikasi barang Anda telah disetujui admin',
        type: 'verification',
      });
    }
    return true;
  };

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'report-lost', label: 'Lapor Hilang', icon: FileText },
    { id: 'report-found', label: 'Lapor Temuan', icon: Plus },
    { id: 'gallery', label: 'Galeri Barang', icon: Camera },
    { id: 'match-results', label: 'Kecocokan', icon: Search },
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
      {currentView !== 'login' && currentView !== 'register' && currentView !== 'forgot-password' && currentView !== 'reset-password' && (
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
          currentView === 'login' || currentView === 'register' || currentView === 'forgot-password' || currentView === 'reset-password'
            ? ''
            : currentView === 'dashboard'
              ? 'max-w-7xl mx-auto px-4 pt-8 sm:px-6 lg:px-8'
              : 'max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8'
        }
      >
        {!isSupabaseConfigured && currentView !== 'login' && currentView !== 'register' && currentView !== 'forgot-password' && currentView !== 'reset-password' && (
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
            currentUserId={userData.id}
            isAdminUser={isAdminUser}
            onOpenReturnVerification={(itemId) => openItemOwnerFollowUp(itemId, 'dashboard')}
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
            mode={foundReportContext ? 'resolve-lost' : 'standard'}
            presetData={foundReportContext}
            onSuccess={foundReportContext ? handleResolvedLostReportSuccess : undefined}
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
            currentUserId={userData.id}
            ownershipFilter={galleryOwnershipFilter}
            onOwnershipFilterChange={setGalleryOwnershipFilter}
            isAdminUser={isAdminUser}
            onOpenReturnVerification={(itemId) => openItemOwnerFollowUp(itemId, 'gallery')}
            onApproveVerification={handleAdminApproveVerification}
            returnVerifications={returnVerifications}
          />
        )}

        {currentView === 'return-verification' && selectedVerificationItem && (
          <ReturnVerificationForm
            item={selectedVerificationItem}
            userData={userData}
            onBack={() => setCurrentView(verificationReturnView)}
            mode={verificationFlowMode}
            onSubmit={handleSubmitReturnVerification}
          />
        )}

        {currentView === 'match-results' && (
          <MatchResultsPage
            matches={currentUserMatches}
            currentUserEmail={userData.email}
            currentUserId={userData.id}
            selectedMatchId={selectedMatchId}
            onOpenReturnVerification={(itemId) => openMarkFoundReport(itemId, 'match-results')}
          />
        )}

        {currentView === 'notifications' && (
          <NotificationCenter
            notifications={currentUserNotifications}
            onMarkAsRead={markNotificationAsRead}
            onDeleteNotification={deleteNotification}
            onOpenNotification={(notification) => {
              markNotificationAsRead(notification.id);
              if (notification.metadata?.targetView === 'match-results') {
                openMatchResults(notification.metadata.matchId ?? null);
              }
            }}
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
                  id: '',
                  email: email || '',
                  name: userName,
                  avatar: userAvatar,
                  phone: '',
                  address: '',
                  nim: '',
                  isAdmin: false,
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
            onForgotPassword={() => setCurrentView('forgot-password')}
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

        {currentView === 'forgot-password' && (
          <ForgotPasswordPage
            onBackToLogin={() => setCurrentView('login')}
          />
        )}

        {currentView === 'reset-password' && (
          <ResetPasswordPage
            onSuccess={() => {
              setAuthToastMessage('Password berhasil diganti! Silakan login dengan password baru Anda.');
              setShowAuthToast(true);
              window.history.replaceState({ view: 'login' }, '', window.location.pathname);
              setCurrentView('login');
            }}
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
