import React, { useState, useContext } from 'react';
import { UserContext, UserDetailsToUpdate } from '../contexts/UserContext';
import { Role, User } from '../types';
import { ClientContext } from '../contexts/ClientContext';

type PendingChanges = UserDetailsToUpdate;

const UserManagement: React.FC = () => {
  const { users, updateContractorDetails } = useContext(UserContext);
  const { clients } = useContext(ClientContext);

  const contractors = users.filter(u => u.role === Role.CONTRACTOR);
  const managers = users.filter(u => u.role === Role.MANAGER);

  const [pendingChanges, setPendingChanges] = useState<{ [contractorId: number]: PendingChanges }>({});

  const handleFieldChange = (contractorId: number, field: keyof PendingChanges, value: string) => {
    let processedValue: string | number | undefined = value;
    if (field === 'managerId' || field === 'hourlyRate' || field === 'clientId') {
      processedValue = parseFloat(value);
      if (isNaN(processedValue)) {
         processedValue = field === 'hourlyRate' ? undefined : Number(value);
      }
    }
    
    setPendingChanges(prev => ({
      ...prev,
      [contractorId]: { ...prev[contractorId], [field]: processedValue },
    }));
  };
  
  const handleSaveChanges = () => {
    Object.entries(pendingChanges).forEach(([contractorIdStr, changes]) => {
      const contractorId = Number(contractorIdStr);
      if (Object.keys(changes).length > 0) {
        updateContractorDetails(contractorId, changes);
      }
    });
    setPendingChanges({});
  };
  
  const hasChanges = Object.keys(pendingChanges).length > 0;

  const getContractorValue = (contractor: User) => {
      const changes = pendingChanges[contractor.id];
      return {
          managerId: changes?.managerId ?? contractor.managerId ?? 0,
          hourlyRate: changes?.hourlyRate ?? contractor.hourlyRate ?? 0,
          email: changes?.email ?? contractor.email ?? '',
          phone: changes?.phone ?? contractor.phone ?? '',
          serviceTitle: changes?.serviceTitle ?? contractor.serviceTitle ?? '',
          clientId: changes?.clientId ?? contractor.clientId ?? 0,
      }
  }

  return (
    <div className="bg-white shadow rounded-lg">
        <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-center">
            <div>
                <h3 className="text-lg font-semibold text-slate-800">Manage Contractor Assignments</h3>
                <p className="text-sm text-slate-500 mt-1">Re-assign contractors and manage their contact and rate information.</p>
            </div>
            <button
                onClick={handleSaveChanges}
                disabled={!hasChanges}
                className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                Save Changes
            </button>
        </div>
      <ul role="list" className="divide-y divide-gray-200">
        {contractors.map(contractor => {
          const { managerId, hourlyRate, email, phone, serviceTitle, clientId } = getContractorValue(contractor);
          return (
            <li key={contractor.id} className="px-4 py-4 sm:px-6">
              <div className="space-y-4">
                <div>
                    <p className="text-md font-medium text-slate-800 truncate">{contractor.name}</p>
                    <p className="text-sm text-slate-500">{contractor.company}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor={`manager-select-${contractor.id}`} className="text-xs text-slate-500">Manager</label>
                        <select
                            id={`manager-select-${contractor.id}`}
                            value={managerId}
                            onChange={(e) => handleFieldChange(contractor.id, 'managerId', e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                        >
                            {managers.map(manager => (
                                <option key={manager.id} value={manager.id}>
                                    {manager.name}
                                </option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor={`client-select-${contractor.id}`} className="text-xs text-slate-500">Client</label>
                        <select
                            id={`client-select-${contractor.id}`}
                            value={clientId}
                            onChange={(e) => handleFieldChange(contractor.id, 'clientId', e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                        >
                            <option value={0} disabled>Select a client</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>
                                    {client.name}
                                </option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor={`rate-input-${contractor.id}`} className="text-xs text-slate-500">Hourly Rate ($)</label>
                        <input
                            type="number"
                            id={`rate-input-${contractor.id}`}
                            value={hourlyRate}
                            onChange={(e) => handleFieldChange(contractor.id, 'hourlyRate', e.target.value)}
                            className="mt-1 block w-full py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                        />
                    </div>
                    <div>
                        <label htmlFor={`email-input-${contractor.id}`} className="text-xs text-slate-500">Email Address</label>
                        <input
                            type="email"
                            id={`email-input-${contractor.id}`}
                            value={email}
                            onChange={(e) => handleFieldChange(contractor.id, 'email', e.target.value)}
                            className="mt-1 block w-full py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                            placeholder="user@example.com"
                        />
                    </div>
                     <div>
                        <label htmlFor={`phone-input-${contractor.id}`} className="text-xs text-slate-500">Phone Number</label>
                        <input
                            type="tel"
                            id={`phone-input-${contractor.id}`}
                            value={phone}
                            onChange={(e) => handleFieldChange(contractor.id, 'phone', e.target.value)}
                            className="mt-1 block w-full py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                            placeholder="+15551234567"
                        />
                    </div>
                </div>
                 <div className="col-span-full">
                    <label htmlFor={`service-title-input-${contractor.id}`} className="text-xs text-slate-500">Invoice Service Title</label>
                    <input
                        type="text"
                        id={`service-title-input-${contractor.id}`}
                        value={serviceTitle}
                        onChange={(e) => handleFieldChange(contractor.id, 'serviceTitle', e.target.value)}
                        className="mt-1 block w-full py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                        placeholder="e.g., Software Engineering Services"
                    />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default UserManagement;