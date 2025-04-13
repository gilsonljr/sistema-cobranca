import { useState, useCallback } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  autoHideDuration?: number;
}

interface UseNotificationReturn {
  notifications: Notification[];
  showNotification: (message: string, type?: NotificationType, autoHideDuration?: number) => string;
  hideNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

/**
 * Custom hook for handling notifications
 */
export function useNotification(): UseNotificationReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Show a notification
  const showNotification = useCallback(
    (
      message: string,
      type: NotificationType = 'info',
      autoHideDuration: number = 5000
    ): string => {
      const id = Date.now().toString();
      
      const notification: Notification = {
        id,
        message,
        type,
        autoHideDuration,
      };
      
      setNotifications(prev => [...prev, notification]);
      
      // Auto-hide notification after duration
      if (autoHideDuration > 0) {
        setTimeout(() => {
          hideNotification(id);
        }, autoHideDuration);
      }
      
      return id;
    },
    []
  );
  
  // Hide a notification
  const hideNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);
  
  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);
  
  return {
    notifications,
    showNotification,
    hideNotification,
    clearAllNotifications,
  };
}
