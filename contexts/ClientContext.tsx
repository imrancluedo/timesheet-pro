import React, { createContext, useState, useCallback, ReactNode, useMemo } from 'react';
import { Client } from '../types';
import { INITIAL_CLIENTS } from '../constants';

const getInitialClients = (): Client[] => {
    try {
        const item = window.localStorage.getItem('clients');
        const clients = item ? JSON.parse(item) : INITIAL_CLIENTS;
        if (Array.isArray(clients) && clients.length > 0) {
            return clients;
        }
        return INITIAL_CLIENTS;
    } catch (error) {
        console.error("Could not parse clients from localStorage, falling back to initial data.", error);
        return INITIAL_CLIENTS;
    }
};

const saveClients = (clients: Client[]) => {
    try {
        window.localStorage.setItem('clients', JSON.stringify(clients));
    } catch (error) {
        console.error("Could not save clients to localStorage", error);
    }
}

interface ClientContextType {
  clients: Client[];
  findClientById: (clientId: number) => Client | undefined;
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (client: Client) => void;
  deleteClient: (clientId: number) => void;
}

export const ClientContext = createContext<ClientContextType>({
  clients: [],
  findClientById: () => undefined,
  addClient: () => {},
  updateClient: () => {},
  deleteClient: () => {},
});

export const ClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>(getInitialClients);
  
  const findClientById = useCallback((clientId: number): Client | undefined => {
      return clients.find(c => c.id === clientId);
  }, [clients]);

  const addClient = useCallback((clientData: Omit<Client, 'id'>) => {
    setClients(prev => {
      const newClient = { ...clientData, id: Date.now() };
      const updated = [...prev, newClient];
      saveClients(updated);
      return updated;
    });
  }, []);

  const updateClient = useCallback((updatedClient: Client) => {
    setClients(prev => {
      const updated = prev.map(c => c.id === updatedClient.id ? updatedClient : c);
      saveClients(updated);
      return updated;
    });
  }, []);

  const deleteClient = useCallback((clientId: number) => {
    setClients(prev => {
      const updated = prev.filter(c => c.id !== clientId);
      saveClients(updated);
      return updated;
    });
  }, []);

  const value = useMemo(() => ({ clients, findClientById, addClient, updateClient, deleteClient }), [clients, findClientById, addClient, updateClient, deleteClient]);

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
};