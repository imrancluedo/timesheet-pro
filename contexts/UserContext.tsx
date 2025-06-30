import React, { createContext, useState, useCallback, ReactNode, useMemo } from 'react';
import { User } from '../types';
import { INITIAL_USERS } from '../constants';

const getInitialUsers = (): User[] => {
    try {
        const item = window.localStorage.getItem('users');
        const users = item ? JSON.parse(item) : INITIAL_USERS;
        // Simple validation to ensure we have some users
        if (Array.isArray(users) && users.length > 0) {
            return users;
        }
        return INITIAL_USERS;
    } catch (error) {
        console.error("Could not parse users from localStorage, falling back to initial data.", error);
        return INITIAL_USERS;
    }
};

const saveUsers = (users: User[]) => {
    try {
        window.localStorage.setItem('users', JSON.stringify(users));
    } catch (error) {
        console.error("Could not save users to localStorage", error);
    }
}

export interface UserDetailsToUpdate {
  managerId?: number;
  hourlyRate?: number;
  email?: string;
  phone?: string;
  serviceTitle?: string;
  clientId?: number;
}

interface UserContextType {
  users: User[];
  updateContractorDetails: (contractorId: number, details: UserDetailsToUpdate) => void;
  findUserById: (userId: number) => User | undefined;
}

export const UserContext = createContext<UserContextType>({
  users: [],
  updateContractorDetails: () => {},
  findUserById: () => undefined,
});

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(getInitialUsers);

  const updateContractorDetails = useCallback((contractorId: number, details: UserDetailsToUpdate) => {
    setUsers(prevUsers => {
      const updatedUsers = prevUsers.map(user =>
        user.id === contractorId ? { ...user, ...details } : user
      );
      saveUsers(updatedUsers);
      return updatedUsers;
    });
  }, []);
  
  const findUserById = useCallback((userId: number): User | undefined => {
      return users.find(u => u.id === userId);
  }, [users]);

  const value = useMemo(() => ({ users, updateContractorDetails, findUserById }), [users, updateContractorDetails, findUserById]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};