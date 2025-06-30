import React from 'react';
import { Notification } from '../types';
import { BellIcon } from './icons/BellIcon';

interface NotificationPanelProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onMarkRead, onClose }) => {
    const sortedNotifications = [...notifications].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            onMarkRead(notification.id);
        }
        onClose();
    }
    
    const timeSince = (date: string): string => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return Math.floor(seconds) + "s ago";
    }

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-50">
      <div className="p-3 border-b border-slate-200">
        <h3 className="font-semibold text-slate-800">Notifications</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {sortedNotifications.length > 0 ? (
          <ul>
            {sortedNotifications.map(n => (
              <li key={n.id}>
                <button
                    onClick={() => handleNotificationClick(n)}
                    className={`w-full text-left p-3 flex items-start space-x-3 hover:bg-slate-50 ${!n.isRead ? 'bg-indigo-50' : ''}`}
                >
                    <div className={`mt-1 h-2 w-2 rounded-full ${!n.isRead ? 'bg-indigo-500' : 'bg-transparent'}`}></div>
                    <div>
                        <p className="text-sm text-slate-700">{n.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{timeSince(n.timestamp)}</p>
                    </div>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center p-8 text-slate-500">
            <BellIcon className="h-10 w-10 mx-auto text-slate-300" />
            <p className="mt-2 text-sm">You have no new notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;