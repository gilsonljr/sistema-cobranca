import React, { createContext, useContext, ReactNode } from 'react';
import { useNotification, Notification, NotificationType } from '../hooks/useNotification';
import { Alert, Snackbar, Stack } from '@mui/material';

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (message: string, type?: NotificationType, autoHideDuration?: number) => string;
  hideNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const {
    notifications,
    showNotification,
    hideNotification,
    clearAllNotifications,
  } = useNotification();
  
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        showNotification,
        hideNotification,
        clearAllNotifications,
      }}
    >
      {children}
      
      {/* Render notifications */}
      <Stack spacing={2} sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 2000 }}>
        {notifications.map((notification) => (
          <Snackbar
            key={notification.id}
            open={true}
            autoHideDuration={notification.autoHideDuration}
            onClose={() => hideNotification(notification.id)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert
              onClose={() => hideNotification(notification.id)}
              severity={notification.type}
              variant="filled"
              sx={{ width: '100%' }}
            >
              {notification.message}
            </Alert>
          </Snackbar>
        ))}
      </Stack>
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  
  return context;
};
