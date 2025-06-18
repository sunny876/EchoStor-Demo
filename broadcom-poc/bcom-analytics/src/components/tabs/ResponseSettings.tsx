import React from 'react';
import { SaveActions } from '../ui/SaveActions';

interface ResponseSettingsProps {
  onSave: () => void;
  saved: boolean;
}

export const ResponseSettings: React.FC<ResponseSettingsProps> = ({ onSave, saved }) => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-6">Response Settings</h2>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6 transition-shadow hover:shadow-lg">
        <h3 className="text-lg font-medium mb-4">Response Style & Format</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="tone">Response Tone</label>
            <select 
              id="tone"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            >
              <option>Professional</option>
              <option>Friendly</option>
              <option>Technical</option>
              <option>Concise</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Controls the overall tone of bot responses</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="format">Response Format</label>
            <select 
              id="format"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            >
              <option>Paragraphs</option>
              <option>Bulleted Lists</option>
              <option>Numbered Steps</option>
              <option>Hybrid</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Default formatting for explanations and instructions</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="length">Response Length</label>
            <select 
              id="length"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            >
              <option>Concise (1-2 paragraphs)</option>
              <option>Moderate (3-4 paragraphs)</option>
              <option>Detailed (5+ paragraphs)</option>
              <option>Adaptive (based on query complexity)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Controls the verbosity of chatbot responses</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="citation">Citation Style</label>
            <select 
              id="citation"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            >
              <option>Always Include Citations</option>
              <option>Only for Technical Information</option>
              <option>Minimized (Links Only)</option>
              <option>No Citations</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">How to handle source references in responses</p>
          </div>
        </div>
      </div>
      
      <SaveActions onSave={onSave} saved={saved} />
    </div>
  );
};