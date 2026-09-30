import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Toast } from './ui/toast';
import { Bell, CheckCircle, AlertCircle, Info, Trash2 } from 'lucide-react';
import biruPng from '../../assets/biru.png';
import merahPng from '../../assets/merah.png';
import hitamPng from '../../assets/hitam.png';

interface Notification {
  id: number;
  message: string;
  type: 'match' | 'verification' | 'success' | 'info';
  date: string;
  read: boolean;
  userEmail?: string;
  metadata?: {
    targetView?: string;
    matchId?: number;
    itemId?: number;
  };
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: number) => void;
  onDeleteNotification: (id: number) => void;
  onOpenNotification: (notification: Notification) => void;
}

export function NotificationCenter({ notifications, onMarkAsRead, onDeleteNotification, onOpenNotification }: NotificationCenterProps) {
  const [showToast, setShowToast] = useState(false);
  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  const handleDelete = (id: number) => {
    onDeleteNotification(id);
    setShowToast(true);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'verification':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationBadgeVariant = (type: string) => {
    switch (type) {
      case 'match':
        return 'default';
      case 'verification':
        return 'secondary';
      case 'success':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getNotificationLabel = (type: string) => {
    switch (type) {
      case 'match':
        return 'Kemungkinan Cocok';
      case 'verification':
        return 'Verifikasi';
      case 'success':
        return 'Berhasil';
      default:
        return 'Info';
    }
  };

  return (
    <>
      <Toast
        message="Notifikasi berhasil dihapus"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Pusat Notifikasi</h1>
          <p className="text-muted-foreground">
            Dapatkan update terbaru tentang laporan dan barang yang cocok
          </p>
        </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="relative overflow-hidden rounded-sm border-gray-900">
          <img
            src={hitamPng}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
          <CardContent className="relative z-10 p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/90 font-medium">Total Notifikasi</p>
                <p className="text-2xl font-bold text-white">{notifications.length}</p>
              </div>
              <Bell className="w-8 h-8 text-white/90" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden rounded-sm border-red-900">
          <img
            src={merahPng}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/15" />
          <CardContent className="relative z-10 p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/90 font-medium">Belum Dibaca</p>
                <p className="text-2xl font-bold text-white">{unreadNotifications.length}</p>
              </div>
              <div className="w-3.5 h-3.5 bg-white rounded-full ring-4 ring-white/20"></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden rounded-sm border-blue-300">
          <img
            src={biruPng}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/15" />
          <CardContent className="relative z-10 p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/90 font-medium">Sudah Dibaca</p>
                <p className="text-2xl font-bold text-white">{readNotifications.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-white/90" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unread Notifications */}
      {unreadNotifications.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Notifikasi Baru</h2>
          {unreadNotifications.map((notification) => (
            <Card key={notification.id} className="relative rounded-sm border border-green-600">
              <CardContent className="p-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(notification.id)}
                  className="absolute right-4 top-4 h-8 w-8 rounded-full p-0 text-red-600 hover:text-red-700 hover:bg-red-50 sm:hidden"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className="shrink-0 pt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={getNotificationBadgeVariant(notification.type)} className="rounded-xs">
                          {getNotificationLabel(notification.type)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.date).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <p className="text-sm leading-6 break-words">{notification.message}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
                    {notification.type === 'match' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onOpenNotification(notification)}
                        className="w-full rounded-sm bg-black text-xs text-white hover:bg-gray-800 sm:w-auto"
                      >
                        Lihat Kecocokan
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMarkAsRead(notification.id)}
                      className="w-full text-xs rounded-sm sm:w-auto"
                    >
                      Tandai Dibaca
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(notification.id)}
                      className="hidden h-8 w-8 rounded-full p-0 text-red-600 hover:text-red-700 hover:bg-red-50 sm:inline-flex"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Read Notifications */}
      {readNotifications.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-muted-foreground">Riwayat Notifikasi</h2>
          {readNotifications.map((notification) => (
            <Card key={notification.id} className="relative rounded-sm opacity-75">
              <CardContent className="p-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(notification.id)}
                  className="absolute right-4 top-4 h-8 w-8 rounded-full p-0 text-red-600 hover:text-red-700 hover:bg-red-50 sm:hidden"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className="shrink-0 pt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="rounded-sm">
                          {getNotificationLabel(notification.type)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.date).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-6 break-words">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
                    {notification.type === 'match' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onOpenNotification(notification)}
                        className="w-full rounded-sm bg-black text-xs text-white hover:bg-gray-800 sm:w-auto"
                      >
                        Lihat Kecocokan
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(notification.id)}
                      className="hidden h-8 w-8 rounded-full p-0 text-red-600 hover:text-red-700 hover:bg-red-50 sm:inline-flex"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {notifications.length === 0 && (
        <Card className="rounded-sm">
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Belum ada notifikasi</h3>
            <p className="text-muted-foreground">
              Notifikasi akan muncul ketika ada update terkait laporan Anda atau barang yang cocok ditemukan.
            </p>
          </CardContent>
        </Card>
      )}
      </div>
    </>
  );
}
