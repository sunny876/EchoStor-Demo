import React from 'react';
import { SaveActions } from '../ui/SaveActions';
import { Plus, Minus } from 'lucide-react';

interface AgentHandoffProps {
  onSave: () => void;
  saved: boolean;
}

export const AgentHandoff: React.FC<AgentHandoffProps> = ({ onSave, saved }) => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-6">Agent Handoff Settings</h2>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6 transition-shadow hover:shadow-lg">
        <h3 className="text-lg font-medium mb-4">Handoff Triggers</h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex items-center h-5 mt-1">
              <input
                id="user-request"
                type="checkbox"
                className="h-4 w-4 text-red-600 rounded focus:ring-red-500 transition-colors"
                defaultChecked
              />
            </div>
            <div className="ml-3">
              <label htmlFor="user-request" className="text-sm font-medium text-gray-700">
                Explicit User Request
              </label>
              <p className="text-xs text-gray-500">
                Transfer to human agent when user explicitly asks for human assistance
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5 mt-1">
              <input
                id="not-helpful"
                type="checkbox"
                className="h-4 w-4 text-red-600 rounded focus:ring-red-500 transition-colors"
                defaultChecked
              />
            </div>
            <div className="ml-3">
              <label htmlFor="not-helpful" className="text-sm font-medium text-gray-700">
                "Not Helpful" Feedback
              </label>
              <p className="text-xs text-gray-500">
                Offer agent handoff when user marks a response as "Not Helpful"
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5 mt-1">
              <input
                id="multiple-attempts"
                type="checkbox"
                className="h-4 w-4 text-red-600 rounded focus:ring-red-500 transition-colors"
                defaultChecked
              />
            </div>
            <div className="ml-3">
              <label htmlFor="multiple-attempts" className="text-sm font-medium text-gray-700">
                Multiple Failed Attempts
              </label>
              <p className="text-xs text-gray-500">
                Suggest human handoff after 3+ attempts to resolve the same issue
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6 transition-shadow hover:shadow-lg">
        <h3 className="text-lg font-medium mb-4">Queue Settings</h3>
        
        {/* VMware Queue */}
        <div className="mb-8 border-b pb-6">
          <h4 className="text-md font-medium mb-4 text-red-800">VMware Support Queue</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Key Terms</label>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="bg-gray-100 px-2 py-1 rounded text-sm flex items-center">
                  vsphere
                  <button className="ml-1 text-gray-500 hover:text-red-600">
                    <Minus size={14} />
                  </button>
                </span>
                <span className="bg-gray-100 px-2 py-1 rounded text-sm flex items-center">
                  workstation
                  <button className="ml-1 text-gray-500 hover:text-red-600">
                    <Minus size={14} />
                  </button>
                </span>
                <button className="text-red-600 hover:text-red-700 flex items-center">
                  <Plus size={14} className="mr-1" /> Add Term
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Queue Capacity</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  defaultValue={50}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">SLA Response Time (minutes)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  defaultValue={30}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mainframe Queue */}
        <div className="mb-8 border-b pb-6">
          <h4 className="text-md font-medium mb-4 text-red-800">Mainframe Support Queue</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Key Terms</label>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="bg-gray-100 px-2 py-1 rounded text-sm flex items-center">
                  zos
                  <button className="ml-1 text-gray-500 hover:text-red-600">
                    <Minus size={14} />
                  </button>
                </span>
                <span className="bg-gray-100 px-2 py-1 rounded text-sm flex items-center">
                  mainframe
                  <button className="ml-1 text-gray-500 hover:text-red-600">
                    <Minus size={14} />
                  </button>
                </span>
                <button className="text-red-600 hover:text-red-700 flex items-center">
                  <Plus size={14} className="mr-1" /> Add Term
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Queue Capacity</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  defaultValue={30}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">SLA Response Time (minutes)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  defaultValue={45}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Carbon Black Queue */}
        <div className="mb-8 border-b pb-6">
          <h4 className="text-md font-medium mb-4 text-red-800">Carbon Black Support Queue</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Key Terms</label>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="bg-gray-100 px-2 py-1 rounded text-sm flex items-center">
                  endpoint
                  <button className="ml-1 text-gray-500 hover:text-red-600">
                    <Minus size={14} />
                  </button>
                </span>
                <span className="bg-gray-100 px-2 py-1 rounded text-sm flex items-center">
                  security
                  <button className="ml-1 text-gray-500 hover:text-red-600">
                    <Minus size={14} />
                  </button>
                </span>
                <button className="text-red-600 hover:text-red-700 flex items-center">
                  <Plus size={14} className="mr-1" /> Add Term
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Queue Capacity</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  defaultValue={40}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">SLA Response Time (minutes)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  defaultValue={20}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Account Queue */}
        <div className="mb-8">
          <h4 className="text-md font-medium mb-4 text-red-800">Account Support Queue</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Key Terms</label>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="bg-gray-100 px-2 py-1 rounded text-sm flex items-center">
                  billing
                  <button className="ml-1 text-gray-500 hover:text-red-600">
                    <Minus size={14} />
                  </button>
                </span>
                <span className="bg-gray-100 px-2 py-1 rounded text-sm flex items-center">
                  account
                  <button className="ml-1 text-gray-500 hover:text-red-600">
                    <Minus size={14} />
                  </button>
                </span>
                <button className="text-red-600 hover:text-red-700 flex items-center">
                  <Plus size={14} className="mr-1" /> Add Term
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Queue Capacity</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  defaultValue={25}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">SLA Response Time (minutes)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  defaultValue={15}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6 transition-shadow hover:shadow-lg">
        <h3 className="text-lg font-medium mb-4">Handoff Messages</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="handoff-message" className="block text-sm font-medium mb-2">
              Handoff Suggestion Message
            </label>
            <textarea
              id="handoff-message"
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              defaultValue="I'm having trouble solving your issue. Would you like to speak with a human support agent?"
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">
              Message shown when suggesting a handoff to a human agent
            </p>
          </div>
        </div>
      </div>
      
      <SaveActions onSave={onSave} saved={saved} />
    </div>
  );
};