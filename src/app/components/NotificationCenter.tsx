import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Toast } from './ui/toast';
import { Bell, CheckCircle, AlertCircle, Info, Trash2 } from 'lucide-react';

interface Notification {
  id: number;
  message: string;
  type: 'match' | 'verification' | 'success' | 'info';
  date: string;
  read: boolean;
  userEmail?: string;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: number) => void;
  onDeleteNotification: (id: number) => void;
}

export function NotificationCenter({ notifications, onMarkAsRead, onDeleteNotification }: NotificationCenterProps) {
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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Notifikasi</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Belum Dibaca</p>
                <p className="text-2xl font-bold text-blue-600">{unreadNotifications.length}</p>
              </div>
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sudah Dibaca</p>
                <p className="text-2xl font-bold text-gray-600">{readNotifications.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unread Notifications */}
      {unreadNotifications.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Notifikasi Baru</h2>
          {unreadNotifications.map((notification) => (
            <Card key={notification.id} className="border-l-4 border-green-600">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className="shrink-0 pt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={getNotificationBadgeVariant(notification.type)}>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMarkAsRead(notification.id)}
                      className="w-full sm:w-auto"
                    >
                      Tandai Dibaca
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(notification.id)}
                      className="self-end text-red-600 hover:text-red-700 hover:bg-red-50 sm:self-auto"
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
            <Card key={notification.id} className="opacity-75">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className="shrink-0 pt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                          {getNotificationLabel(notification.type)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.date).toLocaleDateString('id-ID')}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Sudah dibaca
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-6 break-words">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(notification.id)}
                    className="self-end text-red-600 hover:text-red-700 hover:bg-red-50 sm:self-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {notifications.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Belum ada notifikasi</h3>
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
