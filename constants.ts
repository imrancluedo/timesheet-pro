import { Role, User, TimesheetStatus, Client } from './types';

export const INITIAL_USERS: User[] = [
  // Contractors
  { id: 1, name: 'Alex Doe', role: Role.CONTRACTOR, company: 'Cluedo Tech (1099)', hourlyRate: 75, managerId: 3, email: 'alex.doe@example.com', phone: '+12345678901', serviceTitle: 'Software Engineering Services', clientId: 1 },
  { id: 2, name: 'Jane Roe', role: Role.CONTRACTOR, company: 'Cluedo Tech (1099)', hourlyRate: 85, managerId: 3, email: 'jane.roe@example.com', phone: '+12345678902', serviceTitle: 'UX/UI Design Services', clientId: 1 },
  { id: 5, name: 'John Smith', role: Role.CONTRACTOR, company: 'Cluedo Tech (1099)', hourlyRate: 80, managerId: 6, email: 'john.smith@example.com', phone: '+12345678903', serviceTitle: 'Product Management Consulting', clientId: 1 },
  
  // Managers
  { id: 3, name: 'Brenda Smith', role: Role.MANAGER, company: 'Kalpa Analytics', email: 'brenda.smith@example.com', phone: '+15555550101' },
  { id: 6, name: 'David Lee', role: Role.MANAGER, company: 'Kalpa Analytics', email: 'david.lee@example.com', phone: '+15555550102' },

  // Super Admin (previously Admin)
  { id: 4, name: 'Charlie Brown', role: Role.SUPER_ADMIN, company: 'Cluedo Tech', email: 'charlie.brown@example.com', phone: '+15555550103' },
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 1,
    name: 'Kalpa Analytics LLC',
    addressLine1: '42763 Conquest Circle',
    addressLine2: 'Ashburn VA 20148',
    contactEmail: 'accounts@kalpa-analytics.demo',
  }
];

export const HOURLY_RATE = 75; // Kept as a fallback, but individual rates are preferred.

const getNearestFriday = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 5); // adjust when day is sunday
  return new Date(d.setDate(diff));
}

export const getInitialPayPeriodEndDate = (today: Date): string => {
  const dayOfWeek = today.getDay(); 
  const date = new Date(today);

  let lastFriday = new Date(date);
  lastFriday.setDate(date.getDate() - (dayOfWeek >= 5 ? dayOfWeek - 5 : dayOfWeek + 2));
  
  const seriesStartDate = getNearestFriday(new Date('2024-01-05'));
  
  const diffTime = lastFriday.getTime() - seriesStartDate.getTime();
  const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));

  if (diffWeeks % 2 !== 0) {
     const prevFriday = new Date(lastFriday);
     prevFriday.setDate(lastFriday.getDate() - 7);
     return prevFriday.toISOString().split('T')[0];
  } else {
    return lastFriday.toISOString().split('T')[0];
  }
};

export const generatePayPeriodEndDates = (): string[] => {
    const periods = new Set<string>();
    const today = new Date();
    const currentPeriodEnd = new Date(`${getInitialPayPeriodEndDate(today)}T00:00:00`);

    // Add current, 2 future, and 10 past periods
    for(let i = -10; i <= 2; i++) {
        const d = new Date(currentPeriodEnd);
        d.setDate(d.getDate() + (i * 14));
        periods.add(d.toISOString().split('T')[0]);
    }
    
    return Array.from(periods).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
};


export const getPayPeriodDays = (endDateStr: string): string[] => {
    const endDate = new Date(`${endDateStr}T00:00:00`);
    const days: string[] = [];
    for (let i = 13; i >= 0; i--) {
        const day = new Date(endDate);
        day.setDate(endDate.getDate() - i);
        days.push(day.toISOString().split('T')[0]);
    }
    return days;
};

export const STATUS_COLORS: { [key in TimesheetStatus]: string } = {
  [TimesheetStatus.DRAFT]: 'bg-gray-200 text-gray-800',
  [TimesheetStatus.SUBMITTED]: 'bg-blue-200 text-blue-800',
  [TimesheetStatus.APPROVED]: 'bg-yellow-200 text-yellow-800',
  [TimesheetStatus.SENT]: 'bg-teal-200 text-teal-800',
  [TimesheetStatus.PAID]: 'bg-green-200 text-green-800',
};

export const STATUS_TEXT: { [key in TimesheetStatus]: string } = {
    [TimesheetStatus.DRAFT]: 'Draft',
    [TimesheetStatus.SUBMITTED]: 'Submitted for Approval',
    [TimesheetStatus.APPROVED]: 'Approved - Ready to Send',
    [TimesheetStatus.SENT]: 'Sent to Client',
    [TimesheetStatus.PAID]: 'Paid',
};