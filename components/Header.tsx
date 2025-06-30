import React, { useContext, useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { ClockIcon } from './icons/ClockIcon';
import { BellIcon } from './icons/BellIcon';
import { NotificationContext } from '../contexts/NotificationContext';
import NotificationPanel from './NotificationPanel';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLogout }) => {
  const { notifications, markNotificationAsRead } = useContext(NotificationContext);
  const [isPanelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const userNotifications = notifications.filter(n => n.userId === currentUser.id);
  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const togglePanel = () => {
    setPanelOpen(prev => !prev);
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <ClockIcon className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-slate-800">Timesheet<span className="text-indigo-600">Pro</span></h1>
          </div>
          <div className="flex items-center space-x-4">
             <div className="relative">
                 <button onClick={togglePanel} className="relative p-2 text-slate-500 hover:text-slate-700 focus:outline-none">
                     <BellIcon className="h-6 w-6" />
                     {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-[10px] ring-2 ring-white flex items-center justify-center">
                            {unreadCount}
                        </span>
                     )}
                 </button>
                 {isPanelOpen && (
                    <div ref={panelRef}>
                        <NotificationPanel 
                            notifications={userNotifications} 
                            onMarkRead={markNotificationAsRead}
                            onClose={() => setPanelOpen(false)}
                        />
                    </div>
                 )}
             </div>
            <div className="text-right">
                <p className="font-semibold text-slate-700">{currentUser.name}</p>
                <p className="text-sm text-slate-500">{currentUser.company} ({currentUser.role})</p>
            </div>
            <button
                onClick={onLogout}
                className="px-4 py-2 bg-slate-100 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                aria-label="Logout"
              >
                Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;