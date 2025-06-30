import React, { useContext } from 'react';
import { Timesheet } from '../../types';
import { STATUS_COLORS, STATUS_TEXT } from '../../constants';
import { UserContext } from '../../contexts/UserContext';

interface ViewHistoryModalProps {
  timesheet: Timesheet;
  onClose: () => void;
}

const ViewHistoryModal: React.FC<ViewHistoryModalProps> = ({ timesheet, onClose }) => {
  const { findUserById } = useContext(UserContext);
  const contractor = findUserById(timesheet.contractorId);
  const totalCost = timesheet.totalCost ?? timesheet.totalHours * (contractor?.hourlyRate || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-800">Timesheet Details</h2>
          <p className="mt-1 text-slate-500">
            {contractor?.name} | Period ending {timesheet.payPeriodEnd}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-sm text-slate-600">Status</div>
                <div className={`mt-1 text-xs font-semibold rounded-full px-2 py-1 inline-block ${STATUS_COLORS[timesheet.status]}`}>{STATUS_TEXT[timesheet.status]}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-sm text-slate-600">Total Hours</div>
                <div className="text-xl font-bold text-indigo-600">{timesheet.totalHours.toFixed(2)}</div>
            </div>
             <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-sm text-slate-600">Total Cost</div>
                <div className="text-xl font-bold text-indigo-600">${totalCost.toFixed(2)}</div>
            </div>
          </div>
         
           <div className="mt-6 max-h-60 overflow-y-auto border-t border-slate-200 pt-4">
             <h3 className="font-semibold text-slate-700">Daily Entries</h3>
             <ul className="text-sm divide-y divide-slate-200">
                {timesheet.entries.filter(e => e.hours > 0).length > 0 ? (
                    timesheet.entries.filter(e => e.hours > 0).map(entry => (
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
                    ))
                ) : (
                    <p className="text-slate-500 text-center py-4">No hours were logged for this period.</p>
                )}
             </ul>
           </div>
        </div>
        <div className="bg-slate-50 px-6 py-4 flex justify-end items-center rounded-b-lg">
           <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewHistoryModal;