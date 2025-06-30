import { useState, useMemo, useCallback, useEffect, useContext } from 'react';
import { Timesheet, TimesheetStatus, User, Role } from '../types';
import { getPayPeriodDays } from '../constants';
import { NotificationContext } from '../contexts/NotificationContext';
import { UserContext } from '../contexts/UserContext';
import { ClientContext } from '../contexts/ClientContext';

const getInitialTimesheets = (): Timesheet[] => {
  try {
    const item = window.localStorage.getItem('timesheets');
    const timesheets = item ? JSON.parse(item) : [];
    // Data migration for old structure
    return timesheets.map((ts: any) => {
        if (ts.entries && ts.entries.some((e: any) => e.description !== undefined)) {
            return {
                ...ts,
                entries: ts.entries.map((e: any) => ({
                    date: e.date,
                    hours: e.hours,
                    taskName: e.taskName || e.description || '',
                    taskDescription: e.taskDescription || '',
                }))
            };
        }
        return ts;
    });
  } catch (error) {
    console.error("Could not parse timesheets from localStorage", error);
    return [];
  }
};

const saveTimesheets = (timesheets: Timesheet[]) => {
    try {
        window.localStorage.setItem('timesheets', JSON.stringify(timesheets));
    } catch (error) {
        console.error("Could not save timesheets to localStorage", error);
    }
}

const getNextInvoiceNumber = (): string => {
    let lastInvoice = parseInt(window.localStorage.getItem('lastInvoiceNumber') || '1038', 10);
    lastInvoice++;
    window.localStorage.setItem('lastInvoiceNumber', lastInvoice.toString());
    return lastInvoice.toString();
}


export const useTimesheet = (currentUser: User, selectedPayPeriod: string) => {
  const [allTimesheets, setAllTimesheets] = useState<Timesheet[]>(getInitialTimesheets);
  const [currentTimesheet, setCurrentTimesheet] = useState<Timesheet | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  
  const { createNotification } = useContext(NotificationContext);
  const { users, findUserById } = useContext(UserContext);
  const { findClientById } = useContext(ClientContext);

  const payPeriodDays = useMemo(() => {
    if (selectedPayPeriod === 'all' || !/^\d{4}-\d{2}-\d{2}$/.test(selectedPayPeriod)) {
        return [];
    }
    return getPayPeriodDays(selectedPayPeriod);
  }, [selectedPayPeriod]);

  useEffect(() => {
    if (currentUser.role !== Role.CONTRACTOR) {
      setCurrentTimesheet(null);
      return;
    }

    const existingTimesheet = allTimesheets.find(
      (ts) => ts.contractorId === currentUser.id && ts.payPeriodEnd === selectedPayPeriod
    );

    if (existingTimesheet) {
      setCurrentTimesheet(existingTimesheet);
    } else {
      // This part uses payPeriodDays. It will only run for contractors, for whom 'selectedPayPeriod' is always a valid date.
      const newTimesheet: Timesheet = {
        id: `${currentUser.id}-${selectedPayPeriod}`,
        contractorId: currentUser.id,
        payPeriodEnd: selectedPayPeriod,
        status: TimesheetStatus.DRAFT,
        totalHours: 0,
        entries: payPeriodDays.map(day => ({ date: day, hours: 0, taskName: '', taskDescription: '' })),
      };
      setCurrentTimesheet(newTimesheet);
    }
    setIsDirty(false);
  }, [allTimesheets, currentUser, selectedPayPeriod, payPeriodDays]);

  const updateTimesheetInList = useCallback((updatedTimesheet: Timesheet | Timesheet[]) => {
    setAllTimesheets(prevTimesheets => {
        const updatedList = Array.isArray(updatedTimesheet) ? updatedTimesheet : [updatedTimesheet];
        const updatedIds = new Set(updatedList.map(ts => ts.id));
        const newAllTimesheets = prevTimesheets.filter(ts => !updatedIds.has(ts.id));
        newAllTimesheets.push(...updatedList);
        const sorted = newAllTimesheets.sort((a, b) => new Date(b.payPeriodEnd).getTime() - new Date(a.payPeriodEnd).getTime());
        saveTimesheets(sorted);
        return sorted;
    });
  }, []);
  
  const updateEntry = (date: string, hours: number, taskName: string, taskDescription: string) => {
    if (!currentTimesheet) return;
    
    const newEntries = currentTimesheet.entries.map(entry =>
      entry.date === date ? { ...entry, hours, taskName, taskDescription } : entry
    );

    const totalHours = newEntries.reduce((acc, entry) => acc + entry.hours, 0);

    setCurrentTimesheet({ ...currentTimesheet, entries: newEntries, totalHours });
    setIsDirty(true);
  };

  const saveProgress = useCallback(() => {
    if (!currentTimesheet || !isDirty) return;
    updateTimesheetInList(currentTimesheet);
    setIsDirty(false);
  }, [currentTimesheet, isDirty, updateTimesheetInList]);

  const submitTimesheet = () => {
    if (!currentTimesheet || currentUser.role !== Role.CONTRACTOR || !currentUser.managerId) return;
    saveProgress(); // Save any pending changes first
    const manager = findUserById(currentUser.managerId);
    
    if (manager) {
        createNotification(manager.id, `${currentUser.name} has submitted a timesheet for your approval.`);
        console.log(`[NOTIFICATION SIMULATION]
- Type: Email & SMS
- To: ${manager.name} (${manager.email}, ${manager.phone})
- Message: Timesheet from ${currentUser.name} for period ending ${currentTimesheet.payPeriodEnd} is ready for approval.`);
    }
    
    const submittedTimesheet = { ...currentTimesheet, status: TimesheetStatus.SUBMITTED };
    updateTimesheetInList(submittedTimesheet);
    setCurrentTimesheet(submittedTimesheet);
    setIsDirty(false);
  };
  
  const approveTimesheet = (timesheetId: string) => {
    const timesheet = allTimesheets.find(ts => ts.id === timesheetId);
    if(!timesheet) return;

    const contractor = findUserById(timesheet.contractorId);
    if (!contractor) return;

    const superAdmins = users.filter(u => u.role === Role.SUPER_ADMIN);
    const totalCost = timesheet.totalHours * (contractor.hourlyRate || 0);
    const approver = findUserById(currentUser.id);

    if (superAdmins.length > 0) {
        const message = `${approver?.name || 'A manager'} has approved a timesheet for ${contractor.name}. An invoice has been generated.`;
        superAdmins.forEach(admin => {
            createNotification(admin.id, message);
            console.log(`[NOTIFICATION SIMULATION]
- Type: Email
- To: ${admin.name} (${admin.email})
- Message: ${message}`);
        });
    }
    
    const updatedTimesheet = { 
        ...timesheet, 
        status: TimesheetStatus.APPROVED, 
        totalCost,
        approvedByManagerId: currentUser.id,
        approvedTimestamp: new Date().toISOString(),
        invoiceNumber: getNextInvoiceNumber(),
        invoiceDate: new Date().toISOString().split('T')[0],
    };
    updateTimesheetInList(updatedTimesheet);
  }

  const sendInvoice = (timesheetId: string, service: string, description: string) => {
    const timesheet = allTimesheets.find(ts => ts.id === timesheetId);
    if (!timesheet) return;

    const contractor = findUserById(timesheet.contractorId);
    const client = contractor?.clientId ? findClientById(contractor.clientId) : null;

    if (client) {
      const message = `Invoice #${timesheet.invoiceNumber} has been sent to ${client.name}.`;
      createNotification(currentUser.id, message);
      console.log(`[NOTIFICATION SIMULATION]
- Type: Email
- To: ${client.name} (${client.contactEmail})
- From: accounts@cluedotech.com
- Subject: Invoice #${timesheet.invoiceNumber} from Cluedo Tech LLC
- Body: Please find attached Invoice #${timesheet.invoiceNumber} for services provided by ${contractor.name}. Total amount due: $${timesheet.totalCost?.toFixed(2)}.`);
    }

    updateTimesheetInList({ 
      ...timesheet, 
      status: TimesheetStatus.SENT,
      invoiceService: service,
      invoiceDescription: description,
    });
  };

  const markAsPaid = (timesheetId: string) => {
    const timesheet = allTimesheets.find(ts => ts.id === timesheetId);
    if(!timesheet) return;
    updateTimesheetInList({ ...timesheet, status: TimesheetStatus.PAID });
  }

  const bulkApproveTimesheets = (timesheetIds: string[]) => {
    const updatedTimesheets: Timesheet[] = [];
    let notificationSent = false;

    timesheetIds.forEach(id => {
        const timesheet = allTimesheets.find(ts => ts.id === id && ts.status === TimesheetStatus.SUBMITTED);
        if(!timesheet) return;

        const contractor = findUserById(timesheet.contractorId);
        if(!contractor) return;

        const totalCost = timesheet.totalHours * (contractor.hourlyRate || 0);
        
        updatedTimesheets.push({
            ...timesheet,
            status: TimesheetStatus.APPROVED,
            totalCost,
            approvedByManagerId: currentUser.id,
            approvedTimestamp: new Date().toISOString(),
            invoiceNumber: getNextInvoiceNumber(),
            invoiceDate: new Date().toISOString().split('T')[0],
        });
    });

    if (updatedTimesheets.length > 0) {
        const superAdmins = users.filter(u => u.role === Role.SUPER_ADMIN);
        const approver = findUserById(currentUser.id);
        const message = `${approver?.name || 'A manager'} has bulk-approved ${updatedTimesheets.length} timesheets.`;

        if (superAdmins.length > 0) {
            superAdmins.forEach(admin => {
                createNotification(admin.id, message);
                 console.log(`[NOTIFICATION SIMULATION]
- Type: Email
- To: ${admin.name} (${admin.email})
- Message: ${message}`);
            });
        }
        updateTimesheetInList(updatedTimesheets);
    }
  }
  
  const bulkSendInvoices = (timesheetIds: string[]) => {
      const updatedTimesheets = allTimesheets.map(ts => {
          if (timesheetIds.includes(ts.id) && ts.status === TimesheetStatus.APPROVED) {
              const contractor = findUserById(ts.contractorId);
              const client = contractor?.clientId ? findClientById(contractor.clientId) : null;
              if (client) {
                   console.log(`[NOTIFICATION SIMULATION] - BULK SEND
- Type: Email
- To: ${client.name} (${client.contactEmail})
- Subject: Invoice #${ts.invoiceNumber} from Cluedo Tech LLC`);
              }
              return {
                  ...ts,
                  status: TimesheetStatus.SENT,
                  invoiceService: ts.invoiceService || contractor?.serviceTitle || 'Consulting Services',
                  invoiceDescription: ts.invoiceDescription || `Services provided by ${contractor?.name} for pay period ending ${ts.payPeriodEnd}`
              }
          }
          return ts;
      });
      createNotification(currentUser.id, `You have bulk-sent ${timesheetIds.length} invoices.`);
      setAllTimesheets(updatedTimesheets);
      saveTimesheets(updatedTimesheets);
  }
  
  const bulkMarkAsPaid = (timesheetIds: string[]) => {
      const updatedTimesheets = allTimesheets.map(ts => {
          if (timesheetIds.includes(ts.id) && ts.status === TimesheetStatus.SENT) {
              return { ...ts, status: TimesheetStatus.PAID };
          }
          return ts;
      });
      createNotification(currentUser.id, `You have bulk-marked ${timesheetIds.length} invoices as paid.`);
      setAllTimesheets(updatedTimesheets);
      saveTimesheets(updatedTimesheets);
  }
  
  const viewableTimesheets = useMemo(() => {
    const sorter = (a: Timesheet, b: Timesheet) => new Date(b.payPeriodEnd).getTime() - new Date(a.payPeriodEnd).getTime();
    
    let baseList: Timesheet[];
    switch(currentUser.role) {
        case Role.SUPER_ADMIN:
            baseList = allTimesheets.filter(ts => ts.status !== TimesheetStatus.DRAFT);
            break;
        case Role.CONTRACTOR:
            return [];
        case Role.MANAGER:
            const managedContractorIds = users
                .filter(u => u.role === Role.CONTRACTOR && u.managerId === currentUser.id)
                .map(u => u.id);
            baseList = allTimesheets.filter(ts => managedContractorIds.includes(ts.contractorId) && ts.status !== TimesheetStatus.DRAFT);
            break;
        default:
            baseList = [];
    }
    
    if (selectedPayPeriod !== 'all') {
        baseList = baseList.filter(ts => ts.payPeriodEnd === selectedPayPeriod);
    }
    
    return baseList.sort(sorter);

  }, [allTimesheets, currentUser, selectedPayPeriod, users]);


  return {
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
    bulkMarkAsPaid
  };
};