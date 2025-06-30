import React, { useState, useContext } from 'react';
import { User } from '../types';
import { ClockIcon } from './icons/ClockIcon';
import { UserContext } from '../contexts/UserContext';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { users } = useContext(UserContext);
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id.toString() ?? '');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.id === Number(selectedUserId));
    if (user) {
      onLogin(user);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 font-sans">
      <div className="w-full max-w-sm mx-auto p-4">
        <div className="bg-white shadow-2xl rounded-xl p-8">
            <div className="flex flex-col items-center space-y-4">
                 <ClockIcon className="h-12 w-12 text-indigo-600" />
                 <h1 className="text-3xl font-bold text-slate-800">Timesheet<span className="text-indigo-600">Pro</span></h1>
                 <p className="text-slate-500 text-center">Please sign in to continue</p>
            </div>

            <form onSubmit={handleLogin} className="mt-8 space-y-6">
                <div>
                    <label htmlFor="user-select" className="block text-sm font-medium text-slate-700">
                        Sign in as
                    </label>
                    <div className="mt-1 relative">
                        <select
                            id="user-select"
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            className="appearance-none w-full bg-slate-50 border border-slate-300 text-slate-700 py-3 pl-4 pr-10 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            aria-label="Select user to log in"
                        >
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.role})
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-700">
                             <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Sign In
                    </button>
                </div>
            </form>
        </div>
         <footer className="text-center p-4 text-xs text-slate-500 absolute bottom-0 left-0 right-0">
            <p>TimesheetPro | A Cluedo Tech & Kalpa Analytics Solution</p>
        </footer>
      </div>
    </div>
  );
};

export default Login;