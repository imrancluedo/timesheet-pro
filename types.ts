export enum Role {
  CONTRACTOR = 'Contractor',
  MANAGER = 'Manager',
  SUPER_ADMIN = 'Super Admin',
}

export enum TimesheetStatus {
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted',
  APPROVED = 'Approved',
  SENT = 'Sent',
  PAID = 'Paid',
}

export interface User {
  id: number;
  name: string;
  role: Role;
  company: string;
  hourlyRate?: number; 
  managerId?: number; 
  email?: string;
  phone?: string;
  serviceTitle?: string;
  clientId?: number;
}

export interface Client {
  id: number;
  name: string;
  addressLine1: string;
  addressLine2: string;
  contactEmail: string;
}

export interface TimesheetEntry {
  date: string; // YYYY-MM-DD
  hours: number;
  taskName: string;
  taskDescription: string;
}

export interface Timesheet {
  id: string; // e.g., 'user-1-2023-09-15'
  contractorId: number;
  payPeriodEnd: string; // YYYY-MM-DD
  entries: TimesheetEntry[];
  status: TimesheetStatus;
  totalHours: number;
  totalCost?: number;
  approvedByManagerId?: number;
  approvedTimestamp?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  invoiceService?: string;
  invoiceDescription?: string;
}

export interface Notification {
  id: string;
  userId: number;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChartDataItem {
  label: string;
  value: number;
}