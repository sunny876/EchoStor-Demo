import React from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <header className="bg-red-800 text-white p-4 flex justify-between items-center shadow-md">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 rounded hover:bg-red-700 transition-colors lg:hidden"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center">
          <h1 className="text-xl font-bold">ECHOSTOR<sup>®</sup></h1>
        </div>
      </div>
      <div className="text-xl font-bold hidden md:block">SUPPORT BOT ADMIN</div>
      <div className="flex items-center space-x-4">
        <div className="bg-red-700 px-3 py-1 rounded flex items-center">
          <span className="text-sm font-medium">Admin Mode</span>
        </div>
        <button 
          className="p-1 rounded hover:bg-red-700 transition-colors"
          aria-label="Close admin panel"
        >
          <X size={24} />
        </button>
      </div>
    </header>
  );
};