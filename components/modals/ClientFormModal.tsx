import React, { useState } from 'react';
import { Client } from '../../types';

interface ClientFormModalProps {
  client: Client | null;
  onClose: () => void;
  onSave: (clientData: Omit<Client, 'id'> | Client) => void;
}

const ClientFormModal: React.FC<ClientFormModalProps> = ({ client, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: client?.name || '',
    addressLine1: client?.addressLine1 || '',
    addressLine2: client?.addressLine2 || '',
    contactEmail: client?.contactEmail || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (client) {
      onSave({ ...client, ...formData });
    } else {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-xl font-bold text-slate-800">{client ? 'Edit Client' : 'Add New Client'}</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700">Client Name</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
              </div>
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-slate-700">Contact Email</label>
                <input type="email" name="contactEmail" id="contactEmail" value={formData.contactEmail} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
              </div>
              <div>
                <label htmlFor="addressLine1" className="block text-sm font-medium text-slate-700">Address Line 1</label>
                <input type="text" name="addressLine1" id="addressLine1" value={formData.addressLine1} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
              </div>
              <div>
                <label htmlFor="addressLine2" className="block text-sm font-medium text-slate-700">Address Line 2 (City, State, Zip)</label>
                <input type="text" name="addressLine2" id="addressLine2" value={formData.addressLine2} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700">
              Save Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientFormModal;