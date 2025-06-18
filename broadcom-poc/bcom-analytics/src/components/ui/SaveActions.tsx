import React from 'react';
import { RefreshCw, Save } from 'lucide-react';

interface SaveActionsProps {
  onSave: () => void;
  saved: boolean;
}

export const SaveActions: React.FC<SaveActionsProps> = ({ onSave, saved }) => {
  return (
    <div className="flex justify-end">
      <button
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded mr-2 hover:bg-gray-300 transition-colors flex items-center"
        aria-label="Reset to defaults"
      >
        <RefreshCw size={16} className="mr-2" />
        Reset to Defaults
      </button>
      <button
        onClick={onSave}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center"
        aria-label="Save changes"
      >
        <Save size={16} className="mr-2" />
        {saved ? 'Saved!' : 'Save Changes'}
      </button>
    </div>
  );
};