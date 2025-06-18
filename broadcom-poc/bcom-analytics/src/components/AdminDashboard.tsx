import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ResponseSettings } from './tabs/ResponseSettings';
import { KnowledgeSources } from './tabs/KnowledgeSources';
import { AgentHandoff } from './tabs/AgentHandoff';
import { Guardrails } from './tabs/Guardrails';
import { Monitoring } from './tabs/Monitoring';
import { Notification } from './ui/Notification';

export type TabType = 'response' | 'knowledge' | 'handoff' | 'guardrails' | 'monitoring';

export const AdminDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('response');
  const [saved, setSaved] = useState(false);
  
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          sidebarOpen={sidebarOpen} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />

        <main className="flex-1 overflow-y-auto">
          {activeTab === 'response' && <ResponseSettings onSave={handleSave} saved={saved} />}
          {activeTab === 'knowledge' && <KnowledgeSources onSave={handleSave} saved={saved} />}
          {activeTab === 'handoff' && <AgentHandoff onSave={handleSave} saved={saved} />}
          {activeTab === 'guardrails' && <Guardrails onSave={handleSave} saved={saved} />}
          {activeTab === 'monitoring' && <Monitoring onSave={handleSave} saved={saved} />}
        </main>
      </div>
      
      {saved && (
        <Notification 
          message="Settings saved successfully!" 
          type="success" 
        />
      )}
    </div>
  );
}