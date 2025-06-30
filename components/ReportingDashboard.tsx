import React, { useMemo } from 'react';
import { Timesheet, User, Notification, TimesheetStatus, Role, ChartDataItem } from '../types';
import BarChart from './charts/BarChart';

interface ReportingDashboardProps {
  timesheets: Timesheet[];
  users: User[];
  notifications: Notification[];
}

const KpiCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</h3>
        <p className="mt-1 text-3xl font-semibold text-slate-800">{value}</p>
    </div>
);

const ReportingDashboard: React.FC<ReportingDashboardProps> = ({ timesheets, users, notifications }) => {
    const kpis = useMemo(() => {
        const totalRevenue = timesheets
            .filter(ts => ts.status === TimesheetStatus.PAID)
            .reduce((acc, ts) => acc + (ts.totalCost || 0), 0);

        const outstandingRevenue = timesheets
            .filter(ts => ts.status === TimesheetStatus.SENT)
            .reduce((acc, ts) => acc + (ts.totalCost || 0), 0);
        
        const activeContractors = users.filter(u => u.role === Role.CONTRACTOR).length;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of today

        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const hoursLast30Days = timesheets
            .filter(ts => {
                // Parse date string as local date by adding T00:00:00
                const periodEndDate = new Date(`${ts.payPeriodEnd}T00:00:00`);
                return periodEndDate >= thirtyDaysAgo;
            })
            .reduce((acc, ts) => acc + ts.totalHours, 0);

        return {
            totalRevenue,
            outstandingRevenue,
            activeContractors,
            hoursLast30Days
        }
    }, [timesheets, users]);

    const monthlyRevenueData = useMemo<ChartDataItem[]>(() => {
        const months: { [key: string]: number } = {};
        const monthLabels: string[] = [];
        
        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setDate(1); // Avoid month-end issues
            d.setMonth(d.getMonth() - i);
            const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const monthLabel = d.toLocaleString('default', { month: 'short' });
            months[monthKey] = 0;
            if(!monthLabels.includes(monthLabel)) {
                monthLabels.push(monthLabel);
            }
        }
        
        timesheets
            .filter(ts => ts.status === TimesheetStatus.PAID && ts.invoiceDate)
            .forEach(ts => {
                const date = new Date(`${ts.invoiceDate!}T00:00:00`);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                if (months.hasOwnProperty(monthKey)) {
                    months[monthKey] += ts.totalCost || 0;
                }
            });
        
        return Object.entries(months).map(([key, value]) => ({
            label: new Date(`${key}-02T00:00:00`).toLocaleString('default', { month: 'short' }), // Use a date to get month abbreviation
            value: Math.round(value)
        }));
    }, [timesheets]);

    const contractorHoursData = useMemo<ChartDataItem[]>(() => {
        const contractorHours: { [name: string]: number } = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const ninetyDaysAgo = new Date(today);
        ninetyDaysAgo.setDate(today.getDate() - 90);

        timesheets
            .filter(ts => {
                const periodEndDate = new Date(`${ts.payPeriodEnd}T00:00:00`);
                return periodEndDate >= ninetyDaysAgo;
            })
            .forEach(ts => {
                const contractor = users.find(u => u.id === ts.contractorId);
                if (contractor) {
                    if (!contractorHours[contractor.name]) {
                        contractorHours[contractor.name] = 0;
                    }
                    contractorHours[contractor.name] += ts.totalHours;
                }
            });
        
        return Object.entries(contractorHours)
            .map(([name, hours]) => ({ label: name, value: Math.round(hours) }))
            .sort((a,b) => b.value - a.value)
            .slice(0, 10); // Top 10
    }, [timesheets, users]);
    
    const recentActivity = useMemo(() => {
        return notifications
            .filter(n => users.find(u => u.id === n.userId)?.role === Role.SUPER_ADMIN)
            .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5);
    }, [notifications, users]);
    
    const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard title="Total Revenue (All Time)" value={currencyFormatter.format(kpis.totalRevenue)} />
          <KpiCard title="Outstanding Revenue" value={currencyFormatter.format(kpis.outstandingRevenue)} />
          <KpiCard title="Active Contractors" value={kpis.activeContractors.toString()} />
          <KpiCard title="Hours Billed (Last 30 Days)" value={kpis.hoursLast30Days.toFixed(0)} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
            <BarChart title="Monthly Revenue (Last 6 Months)" data={monthlyRevenueData} />
        </div>
        <div className="lg:col-span-2">
            <BarChart title="Hours by Contractor (Last 90 Days)" data={contractorHoursData} orientation="horizontal" />
        </div>
      </div>
      
      {/* Recent Activity */}
       <div className="bg-white shadow rounded-lg">
          <h3 className="text-lg font-semibold text-slate-800 p-4 border-b border-slate-200">Recent Activity</h3>
           <ul className="divide-y divide-slate-200">
            {recentActivity.map(item => (
                <li key={item.id} className="p-4 text-sm text-slate-600">{item.message}</li>
            ))}
            {recentActivity.length === 0 && <p className="p-4 text-slate-500">No recent activity.</p>}
           </ul>
      </div>
    </div>
  );
};

export default ReportingDashboard;