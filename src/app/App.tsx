import React, { useState, useEffect } from 'react';
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
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import foundItLogo from 'figma:asset/6e20ff767bc819bcb65b83fac10d99d01f0c4fd8.png';
import {
  createPasswordHash,
  getStoredUser,
  isPasswordMatch,
  parseStoredJson,
  type UserData,
} from './appState';
import { supabase } from '../lib/supabase';

const mockItemsData = [
    {
      id: 1,
      title: 'Dompet Coklat',
      description: 'Dompet kulit warna coklat berisi KTM dan uang tunai',
      category: 'Dompet',
      type: 'lost',
      location: 'Perpustakaan Pusat',
      date: '2024-09-23',
      contact: 'ahmad@student.umm.ac.id',
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
      contact: 'security@umm.ac.id',
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
      contact: 'sari@student.umm.ac.id',
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
      contact: 'security@umm.ac.id',
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
      contact: 'budi@student.umm.ac.id',
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
      contact: 'security@umm.ac.id',
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
      contact: 'mahasiswa@student.umm.ac.id',
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
      contact: 'security@umm.ac.id',
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

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [items, setItems] = useState<any[]>([]);
  const [notifications, setNotifications] = useState(() => {
    return parseStoredJson(localStorage.getItem('notifications'), mockNotifications);
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return parseStoredJson(localStorage.getItem('isLoggedIn'), false);
  });
  const [userData, setUserData] = useState<UserData>(() =>
    parseStoredJson(localStorage.getItem('userData'), {
      email: '',
      name: '',
      avatar: '',
      passwordHash: '',
    })
  );

  // Save to localStorage whenever userData or isLoggedIn changes
  useEffect(() => {
    localStorage.setItem('isLoggedIn', JSON.stringify(isLoggedIn));
    localStorage.setItem('userData', JSON.stringify(userData));
  }, [isLoggedIn, userData]);

  // Ambil data barang dari Supabase saat aplikasi dimuat
  useEffect(() => {
    const fetchItems = async () => {
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

  const addItem = async (newItem: any) => {
    const itemToInsert = {
      ...newItem,
      status: newItem.type === 'lost' ? 'active' : 'available',
      date: new Date().toISOString().split('T')[0]
    };

    const { data, error } = await supabase.from('items').insert([itemToInsert]).select();
    
    if (error) {
      console.error('Error inserting item:', error);
      alert('Terjadi kesalahan saat menyimpan data ke database.');
      return;
    }
    
    if (data && data.length > 0) {
      setItems((currentItems) => [data[0], ...currentItems]);
    }
    
    // Add notification for successful submission
    const notification = {
      id: Date.now(),
      message: `Laporan ${newItem.type === 'lost' ? 'kehilangan' : 'penemuan'} berhasil disubmit`,
      type: 'success',
      date: new Date().toISOString().split('T')[0],
      read: false,
      userEmail: userData.email
    };
    setNotifications((currentNotifications) => [notification, ...currentNotifications]);
  };

  const updateItemStatus = async (id: number, status: string) => {
    if (!isLoggedIn) {
      localStorage.setItem('redirectAfterLogin', currentView);
      setCurrentView('login');
      return;
    }

    const { error } = await supabase.from('items').update({ status }).eq('id', id);
    
    if (error) {
      console.error('Error updating item:', error);
      alert('Terjadi kesalahan saat mengupdate status di database.');
    } else {
      setItems((currentItems) => currentItems.map(item =>
        item.id === id ? { ...item, status } : item
      ));
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

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserData({ email: '', name: '', avatar: '', passwordHash: '' });
    setCurrentView('dashboard');
  };

  const handleUpdateProfile = async (data: { email: string; name: string; avatar?: string }) => {
    // Update metadata user di Supabase (seperti nama dan avatar_url)
    const { error } = await supabase.auth.updateUser({
      data: { 
        name: data.name, 
        full_name: data.name,
        username: data.name,
        avatar_url: data.avatar 
      }
    });

    if (error) {
      alert("Gagal memperbarui profile: " + error.message);
      return;
    }

    const updatedData = {
      ...userData,
      email: data.email,
      name: data.name,
      avatar: data.avatar || userData.avatar
    };
    setUserData(updatedData);
    // Data akan otomatis tersimpan ke localStorage melalui useEffect

    // Add notification for successful profile update
    const notification = {
      id: Date.now(),
      message: 'Profile berhasil diperbarui',
      type: 'success',
      date: new Date().toISOString().split('T')[0],
      read: false,
      userEmail: data.email
    };
    setNotifications((currentNotifications) => [notification, ...currentNotifications]);
  };

  const handleChangePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    const storedPassword = userData.passwordHash || userData.password;

    if (!(await isPasswordMatch(oldPassword, storedPassword))) {
      return false;
    }

    const passwordHash = await createPasswordHash(newPassword);
    const updatedData = {
      ...userData,
      passwordHash,
      password: undefined
    };
    setUserData(updatedData);

    const registeredUser = getStoredUser();
    if (registeredUser?.email === userData.email) {
      localStorage.setItem(
        'registeredUser',
        JSON.stringify({
          email: registeredUser.email,
          username: registeredUser.username,
          passwordHash,
        })
      );
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

  const handleDeleteAccount = (confirmation: string, email: string): boolean => {
    if (confirmation !== 'delete akun' || email !== userData.email) {
      return false;
    }

    // Clear all user data from localStorage
    localStorage.removeItem('userData');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('registeredUser');
    localStorage.removeItem('redirectAfterLogin');

    // Reset state
    setIsLoggedIn(false);
    setUserData({ email: '', name: '', avatar: '', passwordHash: '' });
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
                      onClick={() => setCurrentView(item.id)}
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
                    onProfileClick={() => setCurrentView('profile')}
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
                      setCurrentView(item.id);
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
                        setCurrentView('profile');
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
      <main className={currentView === 'login' || currentView === 'register' ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
        {currentView === 'dashboard' && (
          <Dashboard
            items={items}
            onNavigate={setCurrentView}
            onUpdateStatus={updateItemStatus}
            canUpdateStatus={isLoggedIn}
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
          />
        )}

        {currentView === 'gallery' && (
          <ItemGallery
            items={items}
            onUpdateStatus={updateItemStatus}
            canUpdateStatus={isLoggedIn}
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
              // Mengambil detail profil pengguna langsung dari sesi Supabase
              const { data: { session } } = await supabase.auth.getSession();
              const user = session?.user;
              const userName = user?.user_metadata?.name || user?.user_metadata?.username || email?.split('@')[0] || 'User';
              const userAvatar = user?.user_metadata?.avatar_url || '';

              setIsLoggedIn(true);
              setUserData({
                email: email || user?.email || '',
                name: userName,
                avatar: userAvatar,
              });

              // Check if there's a redirect after login
              const redirectTo = localStorage.getItem('redirectAfterLogin');
              if (redirectTo) {
                setCurrentView(redirectTo);
                localStorage.removeItem('redirectAfterLogin');
              } else {
                setCurrentView('dashboard');
              }
            }}
            onSwitchToRegister={() => setCurrentView('register')}
          />
        )}

        {currentView === 'register' && (
          <RegisterPage
            onRegisterSuccess={() => {
              // After register, go to login page
              setCurrentView('login');
            }}
            onSwitchToLogin={() => setCurrentView('login')}
          />
        )}

        {currentView === 'profile' && (
          <ProfilePage
            userData={userData}
            onUpdateProfile={handleUpdateProfile}
            onChangePassword={handleChangePassword}
            onDeleteAccount={handleDeleteAccount}
          />
        )}
      </main>
    </div>
  );
}
