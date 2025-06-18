import React from 'react';
import { PlusCircle } from 'lucide-react';
import { SaveActions } from '../ui/SaveActions';

interface KnowledgeSourcesProps {
  onSave: () => void;
  saved: boolean;
}

export const KnowledgeSources: React.FC<KnowledgeSourcesProps> = ({ onSave, saved }) => {
  const sources = [
    { 
      name: 'Product Documentation', 
      status: 'Active', 
      priority: '1 (Highest)', 
      updated: 'Apr 28, 2025' 
    },
    { 
      name: 'Knowledge Base Articles', 
      status: 'Active', 
      priority: '2', 
      updated: 'Apr 29, 2025' 
    },
    { 
      name: 'Support Forum Threads', 
      status: 'Active', 
      priority: '3', 
      updated: 'Apr 25, 2025' 
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-6">Knowledge Sources</h2>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6 transition-shadow hover:shadow-lg">
        <h3 className="text-lg font-medium mb-4">Source Prioritization</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sources.map((source, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {source.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {source.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {source.priority}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {source.updated}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors">
            <PlusCircle size={16} className="mr-1" />
            Add Source
          </button>
        </div>
      </div>
      
      <SaveActions onSave={onSave} saved={saved} />
    </div>
  );
};