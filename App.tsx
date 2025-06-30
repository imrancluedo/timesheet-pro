import React, { useState, useCallback } from 'react';
import { User } from './types';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import Login from './components/Login';
import { NotificationProvider } from './contexts/NotificationContext';
import { UserProvider } from './contexts/UserContext';
import { ClientProvider } from './contexts/ClientContext';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = useCallback((user: User) => {
    setCurrentUser(user);
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  return (
    <UserProvider>
      <ClientProvider>
        <NotificationProvider>
          {!currentUser ? (
            <Login onLogin={handleLogin} />
          ) : (
            <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
              <Header
                currentUser={currentUser}
                onLogout={handleLogout}
              />
              <main className="p-4 sm:p-6 lg:p-8">
                <Dashboard key={currentUser.id} currentUser={currentUser} />
              </main>
              <footer className="text-center p-4 text-xs text-slate-500">
                <p>TimesheetPro | A Cluedo Tech & Kalpa Analytics Solution</p>
              </footer>
            </div>
          )}
        </NotificationProvider>
      </ClientProvider>
    </UserProvider>
  );
};

export default App;