import React from 'react';
import { Timesheet, TimesheetEntry } from '../types';

interface TimesheetGridProps {
  timesheet: Timesheet;
  onUpdateEntry: (date: string, hours: number, taskName: string, taskDescription: string) => void;
  isEditable: boolean;
}

const TimesheetGrid: React.FC<TimesheetGridProps> = ({ timesheet, onUpdateEntry, isEditable }) => {
  const getEntry = (date: string): TimesheetEntry => {
    return timesheet.entries.find(en => en.date === date) || { date, hours: 0, taskName: '', taskDescription: '' };
  }

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>, date: string) => {
    const entry = getEntry(date);
    const hours = Math.max(0, Math.min(24, parseFloat(e.target.value) || 0));
    onUpdateEntry(date, hours, entry.taskName, entry.taskDescription);
  };
  
  const handleTaskNameChange = (e: React.ChangeEvent<HTMLInputElement>, date: string) => {
    const entry = getEntry(date);
    onUpdateEntry(date, entry.hours, e.target.value, entry.taskDescription);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>, date: string) => {
    const entry = getEntry(date);
    onUpdateEntry(date, entry.hours, entry.taskName, e.target.value);
  };
  
  const formatDate = (dateStr: string) => {
      const date = new Date(`${dateStr}T00:00:00`);
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-slate-800">Log Your Hours</h3>
        <div className="overflow-x-auto">
            <div className="min-w-[700px]">
                {/* Headers */}
                <div className="grid grid-cols-[1fr_90px_1.5fr_2.5fr] gap-x-4">
                    <div className="font-semibold text-slate-600 p-2 border-b">Date</div>
                    <div className="font-semibold text-slate-600 p-2 border-b text-right">Hours</div>
                    <div className="font-semibold text-slate-600 p-2 border-b">Task Name</div>
                    <div className="font-semibold text-slate-600 p-2 border-b">Task Description</div>
                </div>
                
                {timesheet.entries.map((entry) => (
                    <div key={entry.date} className="grid grid-cols-[1fr_90px_1.5fr_2.5fr] gap-x-4 border-b last:border-b-0">
                        <div className="p-2 flex items-center text-slate-700 font-medium">
                           {formatDate(entry.date)}
                        </div>
                        <div className="p-2">
                            <input
                                type="number"
                                value={entry.hours === 0 ? '' : entry.hours}
                                onChange={(e) => handleHoursChange(e, entry.date)}
                                disabled={!isEditable}
                                className="w-full p-2 text-right border rounded-md disabled:bg-slate-100 disabled:text-slate-500 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="0"
                                step="0.25"
                                min="0"
                                max="24"
                            />
                        </div>
                        <div className="p-2">
                            <input
                                type="text"
                                value={entry.taskName}
                                onChange={(e) => handleTaskNameChange(e, entry.date)}
                                disabled={!isEditable}
                                className="w-full p-2 border rounded-md disabled:bg-slate-100 disabled:text-slate-500 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder={entry.hours > 0 ? "e.g., Header Redesign" : ""}
                            />
                        </div>
                         <div className="p-2">
                            <input
                                type="text"
                                value={entry.taskDescription}
                                onChange={(e) => handleDescriptionChange(e, entry.date)}
                                disabled={!isEditable}
                                className="w-full p-2 border rounded-md disabled:bg-slate-100 disabled:text-slate-500 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder={entry.hours > 0 ? "Details about the task..." : ""}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default TimesheetGrid;
