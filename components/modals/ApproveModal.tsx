import React, { useState, useEffect, useContext } from 'react';
import { Timesheet, TimesheetStatus } from '../../types';
import { generateTimesheetSummary } from '../../services/geminiService';
import { UserContext } from '../../contexts/UserContext';

interface ApproveModalProps {
  timesheet: Timesheet;
  onClose: () => void;
  onApprove: () => void;
}

const ApproveModal: React.FC<ApproveModalProps> = ({ timesheet, onClose, onApprove }) => {
  const [summary, setSummary] = useState<string>('');
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);

  const { findUserById } = useContext(UserContext);
  const contractor = findUserById(timesheet.contractorId);

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoadingSummary(true);
      const generatedSummary = await generateTimesheetSummary(timesheet.entries);
      setSummary(generatedSummary);
      setIsLoadingSummary(false);
    };
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timesheet.entries]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-800">Review Timesheet</h2>
          <p className="mt-1 text-slate-500">
            {contractor?.name} | Period ending {timesheet.payPeriodEnd}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <div className="bg-slate-100 p-3 rounded-lg">
                <div className="text-sm text-slate-600">Total Hours</div>
                <div className="text-2xl font-bold text-indigo-600">{timesheet.totalHours.toFixed(2)}</div>
            </div>
             <div className="bg-slate-100 p-3 rounded-lg">
                <div className="text-sm text-slate-600">Total Cost</div>
                <div className="text-2xl font-bold text-indigo-600">${(timesheet.totalHours * (contractor?.hourlyRate || 0)).toFixed(2)}</div>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold text-slate-700">AI-Generated Summary</h3>
            <div className="mt-2 p-3 bg-slate-50 rounded-lg min-h-[60px] text-slate-700 text-sm">
              {isLoadingSummary ? <div className="animate-pulse h-4 bg-slate-300 rounded w-3/4"></div> : summary}
            </div>
          </div>
           <div className="mt-4 max-h-60 overflow-y-auto">
             <h3 className="font-semibold text-slate-700">Daily Entries</h3>
             <ul className="text-sm divide-y divide-slate-200">
                {timesheet.entries.filter(e => e.hours > 0).map(entry => (
                    <li key={entry.date} className="py-3">
                        <div className="flex justify-between items-start">
                           <div>
                             <span className="font-medium">{entry.date}:</span>
                             <span className="ml-2 font-semibold text-slate-800">{entry.taskName || <i className="text-slate-400">No task name</i>}</span>
                           </div>
                           <span className="font-mono">{entry.hours}h</span>
                        </div>
                        {entry.taskDescription && <p className="text-slate-600 mt-1 pl-4">{entry.taskDescription}</p>}
                    </li>
                ))}
             </ul>
           </div>
        </div>
        <div className="bg-slate-50 px-6 py-4 flex justify-between items-center rounded-b-lg">
           <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Close
          </button>
          {timesheet.status === TimesheetStatus.SUBMITTED && (
             <button onClick={onApprove} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Approve Timesheet
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApproveModal;