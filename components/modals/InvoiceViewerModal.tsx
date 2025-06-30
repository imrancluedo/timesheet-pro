import React, { useState, useContext } from 'react';
import { Timesheet, User, Role, TimesheetStatus } from '../../types';
import { PrintIcon } from '../invoice/PrintIcon';
import Invoice from '../invoice/Invoice';
import { UserContext } from '../../contexts/UserContext';

interface InvoiceViewerModalProps {
  timesheet: Timesheet;
  currentUser: User;
  onClose: () => void;
  onSendInvoice: (timesheetId: string, service: string, description: string) => void;
  onMarkPaid: () => void;
}

const InvoiceViewerModal: React.FC<InvoiceViewerModalProps> = ({ timesheet, currentUser, onClose, onSendInvoice, onMarkPaid }) => {
  const { findUserById } = useContext(UserContext);
  const contractor = findUserById(timesheet.contractorId);

  const [invoiceService, setInvoiceService] = useState(
    timesheet.invoiceService || contractor?.serviceTitle || 'Consulting Services'
  );
  const [invoiceDescription, setInvoiceDescription] = useState(
    timesheet.invoiceDescription || `Services provided by ${contractor?.name} for pay period ending ${timesheet.payPeriodEnd}`
  );
  
  const isEditable = currentUser.role === Role.SUPER_ADMIN && timesheet.status === TimesheetStatus.APPROVED;

  const handlePrint = () => {
    window.print();
  };

  const handleSend = () => {
    onSendInvoice(timesheet.id, invoiceService, invoiceDescription);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col no-print">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Invoice #{timesheet.invoiceNumber}</h2>
          <div className="flex items-center space-x-3">
             {isEditable && (
                <button 
                    onClick={handleSend} 
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
                >
                    Send Invoice
                </button>
            )}
             {currentUser.role === Role.SUPER_ADMIN && timesheet.status === TimesheetStatus.SENT && (
                <button 
                    onClick={onMarkPaid} 
                    className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700"
                >
                    Mark as Paid
                </button>
            )}
            <button 
              onClick={handlePrint} 
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
            >
              <PrintIcon className="h-5 w-5" />
              <span>Print</span>
            </button>
            <button 
              onClick={onClose} 
              className="p-2 rounded-full hover:bg-slate-100"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-2 sm:p-4 bg-slate-50 overflow-y-auto">
          <div id="invoice-container">
            <Invoice 
              timesheet={timesheet} 
              isEditable={isEditable}
              service={invoiceService}
              description={invoiceDescription}
              onServiceChange={setInvoiceService}
              onDescriptionChange={setInvoiceDescription}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceViewerModal;