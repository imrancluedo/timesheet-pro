import React, { useContext } from 'react';
import { Timesheet } from '../../types';
import { UserContext } from '../../contexts/UserContext';

interface SubmitModalProps {
  timesheet: Timesheet;
  onClose: () => void;
  onSubmit: () => void;
}

const SubmitModal: React.FC<SubmitModalProps> = ({ timesheet, onClose, onSubmit }) => {
    const { findUserById } = useContext(UserContext);
    const contractor = findUserById(timesheet.contractorId);
    const manager = contractor?.managerId ? findUserById(contractor.managerId) : undefined;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-800">Confirm Submission</h2>
          <p className="mt-2 text-slate-600">
            You are about to submit your timesheet with a total of <span className="font-bold">{timesheet.totalHours.toFixed(2)} hours</span> for the period ending {timesheet.payPeriodEnd}.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            This will be sent to <span className="font-semibold">{manager?.name || 'your manager'}</span> at {manager?.company} for approval. You will not be able to make changes after submission.
          </p>
        </div>
        <div className="bg-slate-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Cancel
          </button>
          <button onClick={onSubmit} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Submit Timesheet
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitModal;