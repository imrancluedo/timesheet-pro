import React, { useState, useMemo, useContext } from 'react';
import { User, Role, Timesheet, TimesheetStatus } from '../types';
import { useTimesheet } from '../hooks/useTimesheet';
import TimesheetGrid from './TimesheetGrid';
import SummaryCard from './SummaryCard';
import { STATUS_COLORS, STATUS_TEXT, getInitialPayPeriodEndDate, generatePayPeriodEndDates } from '../constants';
import ApproveModal from './modals/ApproveModal';
import SubmitModal from './modals/SubmitModal';
import ViewHistoryModal from './modals/ViewHistoryModal';
import { UserContext } from '../contexts/UserContext';
import UserManagement from './UserManagement';
import InvoiceViewerModal from './modals/InvoiceViewerModal';
import ClientManagement from './ClientManagement';
import { NotificationContext } from '../contexts/NotificationContext';
import ReportingDashboard from './ReportingDashboard';
import { ChartBarIcon } from './icons/ChartBarIcon';
import DropdownMenu from './DropdownMenu';
import { exportInvoiceToCsv } from '../services/exportService';
import { ClientContext } from '../contexts/ClientContext';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { MailIcon } from './icons/MailIcon';
import { CurrencyDollarIcon } from './icons/CurrencyDollarIcon';

interface DashboardProps {
  currentUser: User;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser }) => {
  const currentPayPeriod = useMemo(() => getInitialPayPeriodEndDate(new Date()), []);
  const payPeriods = useMemo(() => generatePayPeriodEndDates(), []);
  
  const [selectedPayPeriod, setSelectedPayPeriod] = useState<string>(
    currentUser.role === Role.CONTRACTOR ? currentPayPeriod : 'all'
  );

  const { findUserById, users } = useContext(UserContext);
  const { clients, findClientById } = useContext(ClientContext);
  const { notifications } = useContext(NotificationContext);

  const { 
    allTimesheets,
    currentTimesheet, 
    isDirty,
    saveProgress,
    viewableTimesheets,
    updateEntry, 
    submitTimesheet,
    approveTimesheet,
    sendInvoice,
    markAsPaid,
    bulkApproveTimesheets,
    bulkSendInvoices,
    bulkMarkAsPaid,
  } = useTimesheet(currentUser, selectedPayPeriod);

  const [selectedTimesheet, setSelectedTimesheet] = useState<Timesheet | null>(null);
  const [isApproveModalOpen, setApproveModalOpen] = useState(false);
  const [isSubmitModalOpen, setSubmitModalOpen] = useState(false);
  const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
  const [isInvoiceViewerOpen, setInvoiceViewerOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState('review');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        return newSet;
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        setSelectedIds(new Set(viewableTimesheets.map(ts => ts.id)));
    } else {
        setSelectedIds(new Set());
    }
  };

  const handleReview = (timesheet: Timesheet) => {
    setSelectedTimesheet(timesheet);
    switch (currentUser.role) {
      case Role.MANAGER:
        if (timesheet.status === TimesheetStatus.SUBMITTED) {
          setApproveModalOpen(true);
        } else {
          setHistoryModalOpen(true);
        }
        break;
      case Role.SUPER_ADMIN:
        if (timesheet.status === TimesheetStatus.APPROVED || timesheet.status === TimesheetStatus.SENT || timesheet.status === TimesheetStatus.PAID) {
          setInvoiceViewerOpen(true);
        } else {
          setHistoryModalOpen(true);
        }
        break;
      default:
        setHistoryModalOpen(true);
        break;
    }
  };

  const handleExport = (timesheet: Timesheet) => {
    const contractor = findUserById(timesheet.contractorId);
    const client = contractor?.clientId ? findClientById(contractor.clientId) : null;
    if(contractor && client) {
      exportInvoiceToCsv(timesheet, contractor, client);
    } else {
      alert("Could not export: Contractor or Client data missing.");
    }
  };
  
  const PayPeriodSelector = () => (
     <div className="mb-6 max-w-xs">
        <label htmlFor="period-select" className="block text-sm font-medium text-slate-700">
            Pay Period Ending
        </label>
        <select
            id="period-select"
            value={selectedPayPeriod}
            onChange={(e) => {
              setSelectedPayPeriod(e.target.value);
              setSelectedIds(new Set());
            }}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
        >
            {currentUser.role !== Role.CONTRACTOR && <option value="all">All Periods</option>}
            {payPeriods.map(period => (
                <option key={period} value={period}>
                    {period}{period === currentPayPeriod ? ' (Current)' : ''}
                </option>
            ))}
        </select>
    </div>
  );

  const renderContractorView = () => {
    if (!currentTimesheet) return <p>Loading contractor data...</p>;

    const isEditable = currentTimesheet.payPeriodEnd === currentPayPeriod && currentTimesheet.status === TimesheetStatus.DRAFT;
    
    return (
      <div className="space-y-8">
        <div>
           <PayPeriodSelector />
           <h2 className="text-2xl font-bold text-slate-700">
                {currentTimesheet.payPeriodEnd === currentPayPeriod ? 'Current Timesheet' : 'Viewing Timesheet'}
           </h2>
          <p className="text-slate-500">For pay period ending: <span className="font-semibold">{currentTimesheet.payPeriodEnd}</span></p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard title="Status" value={STATUS_TEXT[currentTimesheet.status]} colorClass={STATUS_COLORS[currentTimesheet.status]}/>
            <SummaryCard title="Total Hours" value={currentTimesheet.totalHours.toFixed(2)} />
            <SummaryCard title="Est. Earnings" value={`$${(currentTimesheet.totalHours * (currentUser.hourlyRate || 0)).toFixed(2)}`} />
        </div>
        
        <TimesheetGrid 
            timesheet={currentTimesheet} 
            onUpdateEntry={updateEntry}
            isEditable={isEditable} 
        />
        
        {isEditable && (
          <div className="flex justify-end items-center space-x-4">
            {isDirty && <p className="text-sm text-slate-500 italic mr-auto">You have unsaved changes.</p>}
            <button
                onClick={saveProgress}
                disabled={!isDirty}
                className="px-6 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Progress
            </button>
            <button
              onClick={() => setSubmitModalOpen(true)}
              disabled={currentTimesheet.totalHours === 0 || isDirty}
              className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              title={isDirty ? "Please save your changes before submitting" : ""}
            >
              Submit for Approval
            </button>
          </div>
        )}
        
        {!isEditable && currentTimesheet.status === TimesheetStatus.DRAFT && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md">
                <p className="font-bold">Read-Only View</p>
                <p>You can only edit the timesheet for the current pay period.</p>
            </div>
        )}

        {isSubmitModalOpen && currentTimesheet && (
            <SubmitModal
                timesheet={currentTimesheet}
                onClose={() => setSubmitModalOpen(false)}
                onSubmit={() => {
                    submitTimesheet();
                    setSubmitModalOpen(false);
                }}
            />
        )}
      </div>
    );
  };

  const renderManagerAdminView = () => {
    const isSuperAdmin = currentUser.role === Role.SUPER_ADMIN;

    const TabButton: React.FC<{tabName: string, activeTab: string, onClick: () => void, children: React.ReactNode}> = ({tabName, activeTab, onClick, children}) => (
        <button
            onClick={onClick}
            className={`${
                activeTab === tabName
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } flex items-center space-x-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
            {children}
        </button>
    )

    const viewTitle = isSuperAdmin ? 'Super Admin Dashboard' : 'Timesheet Review';
    const hasTimesheets = viewableTimesheets.length > 0;
    
    const selectedTimesheets = viewableTimesheets.filter(ts => selectedIds.has(ts.id));
    const canApprove = selectedTimesheets.length > 0 && selectedTimesheets.every(ts => ts.status === TimesheetStatus.SUBMITTED);
    const canSend = selectedTimesheets.length > 0 && selectedTimesheets.every(ts => ts.status === TimesheetStatus.APPROVED);
    const canPay = selectedTimesheets.length > 0 && selectedTimesheets.every(ts => ts.status === TimesheetStatus.SENT);
    
    const handleBulkApprove = () => {
      bulkApproveTimesheets(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
    const handleBulkSend = () => {
      bulkSendInvoices(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
    const handleBulkPay = () => {
      bulkMarkAsPaid(Array.from(selectedIds));
      setSelectedIds(new Set());
    }

    const BulkActionToolBar = () => (
      <div className="bg-slate-200 p-2 rounded-t-lg border-b border-slate-300 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">{selectedIds.size} item(s) selected</p>
        <div className="space-x-2">
            {isSuperAdmin ? (
              <>
                <button disabled={!canSend} onClick={handleBulkSend} className="flex items-center space-x-2 px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"><MailIcon className="h-4 w-4"/><span>Send Selected</span></button>
                <button disabled={!canPay} onClick={handleBulkPay} className="flex items-center space-x-2 px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"><CurrencyDollarIcon className="h-4 w-4"/><span>Mark Selected as Paid</span></button>
              </>
            ) : (
                <button disabled={!canApprove} onClick={handleBulkApprove} className="flex items-center space-x-2 px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"><CheckCircleIcon className="h-4 w-4"/><span>Approve Selected</span></button>
            )}
        </div>
      </div>
    )

    return (
        <div>
        <h2 className="text-2xl font-bold text-slate-700 mb-4">
            {viewTitle}
        </h2>
        {isSuperAdmin && (
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <TabButton tabName="review" activeTab={activeTab} onClick={() => setActiveTab('review')}><span>Invoice Review</span></TabButton>
                    <TabButton tabName="users" activeTab={activeTab} onClick={() => setActiveTab('users')}><span>User Management</span></TabButton>
                    <TabButton tabName="clients" activeTab={activeTab} onClick={() => setActiveTab('clients')}><span>Client Management</span></TabButton>
                    <TabButton tabName="reporting" activeTab={activeTab} onClick={() => setActiveTab('reporting')}>
                      <ChartBarIcon className="w-5 h-5" />
                      <span>Reporting</span>
                    </TabButton>
                </nav>
            </div>
        )}
        
        {activeTab === 'review' && (
            <div>
            <PayPeriodSelector />
            
            <div className="bg-white shadow overflow-hidden rounded-lg">
                {selectedIds.size > 0 && <BulkActionToolBar />}
                <ul role="list" className="divide-y divide-gray-200">
                {hasTimesheets && viewableTimesheets.map(ts => {
                    const contractor = findUserById(ts.contractorId);
                    return (
                    <li key={ts.id} className="hover:bg-gray-50">
                        <div className="flex items-center px-4 py-4 sm:px-6">
                            <div className="mr-4">
                              <input 
                                type="checkbox" 
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                checked={selectedIds.has(ts.id)}
                                onChange={() => handleSelectOne(ts.id)}
                              />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                <p className="text-md font-medium text-indigo-600 truncate">
                                    {contractor?.name} - Period ending {ts.payPeriodEnd}
                                </p>
                                <div className="ml-2 flex-shrink-0 flex">
                                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_COLORS[ts.status]}`}>
                                    {STATUS_TEXT[ts.status]}
                                    </p>
                                </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                <div className="sm:flex">
                                    <p className="flex items-center text-sm text-gray-500">
                                    Total Hours: {ts.totalHours.toFixed(2)}
                                    </p>
                                    {ts.totalCost != null && <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">Total Cost: ${ts.totalCost.toFixed(2)}</p>}
                                </div>
                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                  <DropdownMenu 
                                    onView={() => handleReview(ts)} 
                                    onExport={() => handleExport(ts)}
                                    canExport={ts.status === TimesheetStatus.APPROVED || ts.status === TimesheetStatus.SENT || ts.status === TimesheetStatus.PAID}
                                  />
                                </div>
                                </div>
                            </div>
                        </div>
                    </li>
                    )
                })}
                </ul>
                <div className="px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                    <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox"
                          id="select-all"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          onChange={handleSelectAll}
                          checked={viewableTimesheets.length > 0 && selectedIds.size === viewableTimesheets.length}
                          disabled={viewableTimesheets.length === 0}
                        />
                        <label htmlFor="select-all" className="text-sm text-slate-600">Select All</label>
                    </div>
                </div>
                {!hasTimesheets && <p className="text-center p-8 text-slate-500">No timesheets match your filter criteria.</p>}
            </div>
            </div>
        )}

        {activeTab === 'users' && isSuperAdmin && <UserManagement />}
        {activeTab === 'clients' && isSuperAdmin && <ClientManagement />}
        {activeTab === 'reporting' && isSuperAdmin && (
            <ReportingDashboard 
              timesheets={allTimesheets} 
              users={users} 
              notifications={notifications}
            />
        )}
        
        </div>
    );
    };

  return (
    <div className="container mx-auto">
        {currentUser.role === Role.CONTRACTOR ? renderContractorView() : renderManagerAdminView()}
        {isApproveModalOpen && selectedTimesheet && (
            <ApproveModal 
                timesheet={selectedTimesheet}
                onClose={() => setApproveModalOpen(false)}
                onApprove={() => {
                    approveTimesheet(selectedTimesheet.id);
                    setApproveModalOpen(false);
                }}
            />
        )}
        {isInvoiceViewerOpen && selectedTimesheet && (
            <InvoiceViewerModal
                timesheet={selectedTimesheet}
                onClose={() => setInvoiceViewerOpen(false)}
                onSendInvoice={(id, service, description) => {
                    sendInvoice(id, service, description);
                    setInvoiceViewerOpen(false);
                }}
                onMarkPaid={() => {
                    markAsPaid(selectedTimesheet.id);
                    setInvoiceViewerOpen(false);
                }}
                currentUser={currentUser}
            />
        )}
         {isHistoryModalOpen && selectedTimesheet && (
            <ViewHistoryModal 
                timesheet={selectedTimesheet}
                onClose={() => setHistoryModalOpen(false)}
            />
        )}
    </div>
  );
};

export default Dashboard;