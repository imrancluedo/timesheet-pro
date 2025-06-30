import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { Notification } from '../types';

interface NotificationContextType {
  notifications: Notification[];
  createNotification: (userId: number, message: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
}

export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  createNotification: () => {},
  markNotificationAsRead: () => {},
});

const getInitialNotifications = (): Notification[] => {
    try {
        const item = window.localStorage.getItem('notifications');
        return item ? JSON.parse(item) : [];
    } catch (error) {
        console.error("Could not parse notifications from localStorage", error);
        return [];
    }
};

const saveNotifications = (notifications: Notification[]) => {
    try {
        window.localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
        console.error("Could not save notifications to localStorage", error);
    }
}

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(getInitialNotifications);

  const createNotification = useCallback((userId: number, message: string) => {
    const newNotification: Notification = {
      id: `${Date.now()}-${userId}`,
      userId,
      message,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    
    setNotifications(prev => {
        const updated = [newNotification, ...prev];
        saveNotifications(updated);
        return updated;
    });
  }, []);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => {
        const updated = prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n);
        saveNotifications(updated);
        return updated;
    });
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, createNotification, markNotificationAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};