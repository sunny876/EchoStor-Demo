import React from 'react';
import { SaveActions } from '../ui/SaveActions';

interface MonitoringProps {
  onSave: () => void;
  saved: boolean;
}

export const Monitoring: React.FC<MonitoringProps> = ({ onSave, saved }) => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-6">Monitoring</h2>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6 transition-shadow hover:shadow-lg">
        <h3 className="text-lg font-medium mb-4">Usage Alerts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="volume-alert">High Volume Alert</label>
            <div className="flex items-center">
              <input 
                id="volume-alert"
                type="number" 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                defaultValue="1000"
              />
              <span className="ml-2 text-sm whitespace-nowrap">queries/day</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Alert when daily query volume exceeds threshold</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="handoff-rate">Handoff Rate Alert</label>
            <div className="flex items-center">
              <input 
                id="handoff-rate"
                type="number" 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                defaultValue="25"
              />
              <span className="ml-2 text-sm">%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Alert when handoff rate exceeds threshold</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6 transition-shadow hover:shadow-lg">
        <h3 className="text-lg font-medium mb-4">Feedback Tracking</h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex items-center h-5 mt-1">
              <input
                id="collect-feedback"
                type="checkbox"
                className="h-4 w-4 text-red-600 rounded focus:ring-red-500 transition-colors"
                defaultChecked
              />
            </div>
            <div className="ml-3">
              <label htmlFor="collect-feedback" className="text-sm font-medium text-gray-700">
                Collect User Feedback
              </label>
              <p className="text-xs text-gray-500">
                Show thumbs up/down buttons after each response
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5 mt-1">
              <input
                id="prompt-comment"
                type="checkbox"
                className="h-4 w-4 text-red-600 rounded focus:ring-red-500 transition-colors"
                defaultChecked
              />
            </div>
            <div className="ml-3">
              <label htmlFor="prompt-comment" className="text-sm font-medium text-gray-700">
                Prompt for Comment on Negative Feedback
              </label>
              <p className="text-xs text-gray-500">
                Ask users to explain why a response wasn't helpful
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5 mt-1">
              <input
                id="track-categories"
                type="checkbox"
                className="h-4 w-4 text-red-600 rounded focus:ring-red-500 transition-colors"
                defaultChecked
              />
            </div>
            <div className="ml-3">
              <label htmlFor="track-categories" className="text-sm font-medium text-gray-700">
                Track Issue Categories
              </label>
              <p className="text-xs text-gray-500">
                Categorize feedback to identify common problem areas
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6 transition-shadow hover:shadow-lg">
        <h3 className="text-lg font-medium mb-4">Analytics Dashboard</h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex items-center h-5 mt-1">
              <input
                id="usage-analytics"
                type="checkbox"
                className="h-4 w-4 text-red-600 rounded focus:ring-red-500 transition-colors"
                defaultChecked
              />
            </div>
            <div className="ml-3">
              <label htmlFor="usage-analytics" className="text-sm font-medium text-gray-700">
                Enable Usage Analytics
              </label>
              <p className="text-xs text-gray-500">
                Track conversation metrics, user satisfaction, and common queries
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <SaveActions onSave={onSave} saved={saved} />
    </div>
  );
};