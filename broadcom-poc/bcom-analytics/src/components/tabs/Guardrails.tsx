import React from 'react';
import { SaveActions } from '../ui/SaveActions';

interface GuardrailsProps {
  onSave: () => void;
  saved: boolean;
}

export const Guardrails: React.FC<GuardrailsProps> = ({ onSave, saved }) => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-6">Guardrails</h2>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6 transition-shadow hover:shadow-lg">
        <h3 className="text-lg font-medium mb-4">Content Limitations</h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex items-center h-5 mt-1">
              <input
                id="stay-on-topic"
                type="checkbox"
                className="h-4 w-4 text-red-600 rounded focus:ring-red-500 transition-colors"
                defaultChecked
              />
            </div>
            <div className="ml-3">
              <label htmlFor="stay-on-topic" className="text-sm font-medium text-gray-700">
                Stay on Topic
              </label>
              <p className="text-xs text-gray-500">
                Restrict responses to EchoStor products, services, and support information
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5 mt-1">
              <input
                id="factual-consistency"
                type="checkbox"
                className="h-4 w-4 text-red-600 rounded focus:ring-red-500 transition-colors"
                defaultChecked
              />
            </div>
            <div className="ml-3">
              <label htmlFor="factual-consistency" className="text-sm font-medium text-gray-700">
                Factual Consistency
              </label>
              <p className="text-xs text-gray-500">
                Check responses against knowledge base to reduce hallucinations
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5 mt-1">
              <input
                id="no-pricing-promises"
                type="checkbox"
                className="h-4 w-4 text-red-600 rounded focus:ring-red-500 transition-colors"
                defaultChecked
              />
            </div>
            <div className="ml-3">
              <label htmlFor="no-pricing-promises" className="text-sm font-medium text-gray-700">
                No Pricing/Promises
              </label>
              <p className="text-xs text-gray-500">
                Avoid making commitments about pricing, delivery dates, or future features
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6 transition-shadow hover:shadow-lg">
        <h3 className="text-lg font-medium mb-4">Hallucination Detection</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="detection-level">Detection Level</label>
            <select 
              id="detection-level"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            >
              <option>Standard</option>
              <option>Strict</option>
              <option>Relaxed</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">How aggressively to detect potential hallucinations</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="risk-threshold">Hallucination Risk Threshold</label>
            <div className="flex items-center">
              <input 
                id="risk-threshold"
                type="range" 
                min="0" 
                max="1" 
                step="0.05" 
                defaultValue="0.7" 
                className="w-full accent-red-600" 
              />
              <span className="ml-2 text-sm">0.7</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Threshold for flagging potential hallucinations</p>
          </div>
        </div>
      </div>
      
      <SaveActions onSave={onSave} saved={saved} />
    </div>
  );
};