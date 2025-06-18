import React from 'react';
import { TabType } from './AdminDashboard';
import { 
  MessageSquare, Database, AlertTriangle, 
  Users, Shield 
} from 'lucide-react';

interface SidebarProps {
  sidebarOpen: boolean;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  sidebarOpen, 
  activeTab, 
  setActiveTab 
}) => {
  const navItems: NavItem[] = [
    { id: 'response', label: 'Response Settings', icon: <MessageSquare size={18} /> },
    { id: 'knowledge', label: 'Knowledge Sources', icon: <Database size={18} /> },
    { id: 'handoff', label: 'Agent Handoff', icon: <Users size={18} /> },
    { id: 'guardrails', label: 'Guardrails', icon: <Shield size={18} /> },
    { id: 'monitoring', label: 'Monitoring', icon: <AlertTriangle size={18} /> },
  ];

  return (
    <aside className={`bg-white border-r border-gray-200 w-64 flex-shrink-0 transition-all duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-gray-600 text-sm font-medium">CONFIGURATION</h2>
      </div>
      <nav className="p-2">
        {navItems.map((item) => (
          <button 
            key={item.id}
            className={`p-2 w-full text-left flex items-center space-x-2 rounded transition-colors ${
              activeTab === item.id 
                ? 'bg-red-100 text-red-800' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab(item.id)}
            aria-current={activeTab === item.id ? 'page' : undefined}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};