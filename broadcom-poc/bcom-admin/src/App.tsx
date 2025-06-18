import React from 'react';
import AnalyticsDashboard from './components/AnalyticsDashboard';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#E31B0C] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="px-6 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <span className="font-semibold text-lg">ECHOSTOR • SUPPORT BOT ADMIN</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">Analytics Mode</span>
              <button className="hover:bg-white/10 p-2 rounded transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}

export default App;