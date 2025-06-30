import React, { useContext, useState } from 'react';
import { ClientContext } from '../contexts/ClientContext';
import { UserContext } from '../contexts/UserContext';
import { Client } from '../types';
import ClientFormModal from './modals/ClientFormModal';

const ClientManagement: React.FC = () => {
  const { clients, addClient, updateClient, deleteClient } = useContext(ClientContext);
  const { users } = useContext(UserContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const handleOpenAddModal = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };
  
  const handleSaveClient = (clientData: Omit<Client, 'id'> | Client) => {
    if ('id' in clientData) {
      updateClient(clientData);
    } else {
      addClient(clientData);
    }
    setIsModalOpen(false);
  }

  const isClientInUse = (clientId: number): boolean => {
    return users.some(user => user.clientId === clientId);
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg">
          <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-center">
              <div>
                  <h3 className="text-lg font-semibold text-slate-800">Manage Clients</h3>
                  <p className="text-sm text-slate-500 mt-1">Add, edit, or remove client profiles.</p>
              </div>
              <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                  Add New Client
              </button>
          </div>
        <ul role="list" className="divide-y divide-gray-200">
          {clients.map(client => {
            const inUse = isClientInUse(client.id);
            return (
              <li key={client.id} className="px-4 py-4 sm:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="md:col-span-1">
                      <p className="text-md font-medium text-slate-800 truncate">{client.name}</p>
                      <p className="text-sm text-slate-500">{client.contactEmail}</p>
                  </div>
                  <div className="text-sm text-slate-600 md:col-span-1">
                      <p>{client.addressLine1}</p>
                      <p>{client.addressLine2}</p>
                  </div>
                  <div className="flex space-x-2 justify-start md:justify-end md:col-span-1">
                      <button 
                        onClick={() => handleOpenEditModal(client)}
                        className="px-3 py-1 text-sm bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteClient(client.id)}
                        disabled={inUse}
                        title={inUse ? 'Cannot delete a client assigned to a contractor' : 'Delete client'}
                        className="px-3 py-1 text-sm bg-red-100 border border-red-300 text-red-700 font-semibold rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Delete
                      </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {isModalOpen && (
        <ClientFormModal 
          client={editingClient}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveClient}
        />
      )}
    </>
  );
};

export default ClientManagement;