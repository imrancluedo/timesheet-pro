import React, { useContext } from 'react';
import { Timesheet, TimesheetStatus } from '../../types';
import { UserContext } from '../../contexts/UserContext';
import { ClientContext } from '../../contexts/ClientContext';

interface InvoiceProps {
  timesheet: Timesheet;
  isEditable?: boolean;
  service?: string;
  description?: string;
  onServiceChange?: (value: string) => void;
  onDescriptionChange?: (value: string) => void;
}

const Invoice: React.FC<InvoiceProps> = ({ 
  timesheet, 
  isEditable = false, 
  service = '', 
  description = '', 
  onServiceChange = () => {}, 
  onDescriptionChange = () => {} 
}) => {
  const { findUserById } = useContext(UserContext);
  const { findClientById } = useContext(ClientContext);

  const contractor = findUserById(timesheet.contractorId);
  const client = contractor?.clientId ? findClientById(contractor.clientId) : null;

  const formatDate = (isoDate?: string) => {
    if (!isoDate) return '';
    // Add T00:00:00 to ensure date is parsed in local timezone, not UTC
    return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-US');
  }
  
  const currencyFormat = (num?: number) => {
      if(num === undefined || num === null) return '0.00';
      return num.toFixed(2);
  }

  return (
    <div className="bg-white p-8 md:p-12 shadow-lg max-w-4xl mx-auto my-4 font-sans relative">
      {/* PAID Watermark */}
      {timesheet.status === TimesheetStatus.PAID && (
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-[12rem] font-black text-green-500 opacity-15 transform -rotate-25">
                PAID
            </div>
         </div>
      )}

      {/* Header */}
      <div className="grid grid-cols-2 items-start mb-12">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Cluedo Tech LLC</h1>
          <p className="text-gray-500">10432 Balls Ford Rd Ste 300</p>
          <p className="text-gray-500">Manassas, VA 20109 USA</p>
          <p className="text-gray-500">(703) 975-6498</p>
          <p className="text-gray-500">accounts@cluedotech.com</p>
          <p className="text-gray-500">www.cluedotech.com</p>
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-light text-gray-400 uppercase tracking-widest">Invoice</h2>
        </div>
      </div>

      {/* Bill To & Invoice Details */}
      <div className="grid grid-cols-2 items-start mb-12">
        <div>
          <p className="text-gray-400 font-semibold mb-2">BILL TO</p>
          {client ? (
            <>
              <h3 className="text-lg font-bold text-gray-700">{client.name}</h3>
              <p className="text-gray-500">{client.addressLine1}</p>
              <p className="text-gray-500">{client.addressLine2}</p>
            </>
          ) : (
             <p className="text-red-500">Client not found.</p>
          )}
        </div>
        <div className="text-right">
          <div className="flex justify-end space-x-8">
            <span className="text-gray-400 font-semibold">INVOICE #</span>
            <span className="text-gray-600">{timesheet.invoiceNumber}</span>
          </div>
          <div className="flex justify-end space-x-8 mt-2">
            <span className="text-gray-400 font-semibold">DATE</span>
            <span className="text-gray-600">{formatDate(timesheet.invoiceDate)}</span>
          </div>
           <div className="flex justify-end space-x-8 mt-2">
            <span className="text-gray-400 font-semibold">TERMS</span>
            <span className="text-gray-600">Due on receipt</span>
          </div>
          <div className="flex justify-end space-x-8 mt-2">
            <span className="text-gray-400 font-semibold">DUE DATE</span>
            <span className="text-gray-600">{formatDate(timesheet.invoiceDate)}</span>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <table className="w-full mb-12">
        <thead>
          <tr className="bg-blue-50 border-b border-blue-200">
            <th className="text-left p-3 font-semibold text-blue-800 uppercase text-sm">Service</th>
            <th className="text-left p-3 font-semibold text-blue-800 uppercase text-sm">Description</th>
            <th className="text-right p-3 font-semibold text-blue-800 uppercase text-sm">Qty</th>
            <th className="text-right p-3 font-semibold text-blue-800 uppercase text-sm">Rate</th>
            <th className="text-right p-3 font-semibold text-blue-800 uppercase text-sm">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-200">
            <td className="p-3 text-gray-700 align-top">
              {isEditable ? (
                <input 
                  type="text"
                  value={service}
                  onChange={(e) => onServiceChange(e.target.value)}
                  className="w-full p-1 border rounded-md"
                />
              ) : (
                service
              )}
            </td>
            <td className="p-3 text-gray-700 align-top">
               {isEditable ? (
                <textarea 
                  value={description}
                  onChange={(e) => onDescriptionChange(e.target.value)}
                  className="w-full p-1 border rounded-md"
                  rows={3}
                />
              ) : (
                description
              )}
            </td>
            <td className="text-right p-3 text-gray-700 align-top">{timesheet.totalHours.toFixed(2)}</td>
            <td className="text-right p-3 text-gray-700 align-top">${currencyFormat(contractor?.hourlyRate)}</td>
            <td className="text-right p-3 text-gray-700 align-top">${currencyFormat(timesheet.totalCost)}</td>
          </tr>
        </tbody>
      </table>

      {/* Total */}
      <div className="flex justify-end mb-12">
        <div className="w-full max-w-xs space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>${currencyFormat(timesheet.totalCost)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-800 text-lg border-t pt-2">
            <span>BALANCE DUE</span>
            <span>${timesheet.status === TimesheetStatus.PAID ? '0.00' : currencyFormat(timesheet.totalCost)}</span>
          </div>
        </div>
      </div>
      
      {/* Footer / Notes */}
      <div className="text-gray-500 text-sm">
        <p className="font-semibold text-gray-600 mb-2">Payment Information</p>
        <p>Bank of America</p>
        <p>Account Name: Cluedo Tech LLC</p>
        <p>Account number: 435054321067</p>
      </div>
    </div>
  );
};

export default Invoice;