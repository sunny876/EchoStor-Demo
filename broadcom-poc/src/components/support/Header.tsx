import React from 'react';
import { Menu, X } from 'lucide-react'; // Using lucide-react icons

interface HeaderProps {
  toggleSidebar: () => void;
  // Add optional title prop for dynamic header text
  title?: string; 
  onDocumentationClick?: () => void;
  onContactClick?: () => void;
  isAuthenticated?: boolean;
  onAuthClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, title = "SUPPORT BOT", onDocumentationClick, onContactClick, isAuthenticated = false, onAuthClick }) => { // Default title
  // TODO: Implement close functionality - likely using react-router or similar
  const handleClose = () => {
    console.log("Close chat clicked");
    // navigate('/'); // Example navigation
  };

  return (
    <header className="bg-echostor-navy-800 border-b border-echostor-navy-700 shadow-header backdrop-blur-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-6 py-4">
        {/* Logo section */}
        <div className="flex items-center space-x-4 flex-shrink-0">
          {/* Logo */}
          <div className="flex items-center group">
            <div className="relative bg-white rounded-md py-1 shadow-sm">
              <img
                src="/echostor-logo.svg"
                alt="EchoStor Logo"
                className="h-12 w-auto flex-shrink-0 drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
              />
              {/* Subtle teal glow effect matching logo colors */}
              <div className="absolute inset-0 bg-echostor-teal-400 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-15 rounded-md"></div>
            </div>
            {/* Enhanced ECHOSTOR text with white text matching website */}
            <div className="ml-3 flex flex-col">
              <span className="font-display font-bold text-2xl tracking-wider text-white flex-shrink-0 transition-colors duration-300 group-hover:text-echostor-teal-300">
                ECHOSTOR
              </span>
              <span className="text-xs font-medium text-echostor-gray-300 tracking-wide uppercase">
                Enterprise Solutions
              </span>
            </div>
          </div>
        </div>

        {/* Navigation and actions */}
        <div className="flex items-center space-x-3">
          {/* Documentation button */}
          <button
            onClick={onDocumentationClick}
            className="group relative px-4 py-2.5 text-sm font-medium text-white hover:text-echostor-teal-300 rounded-lg transition-all duration-300 hover:bg-echostor-navy-700 hover:shadow-card"
          >
            <span className="relative z-10">Documentation</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-echostor-navy-700 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300"></div>
          </button>
          
          {/* Contact Support button */}
          <button
            onClick={onContactClick}
            className="group relative px-4 py-2.5 text-sm font-medium text-white hover:text-echostor-teal-300 rounded-lg transition-all duration-300 hover:bg-echostor-navy-700 hover:shadow-card"
          >
            <span className="relative z-10">Contact Support</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-echostor-navy-700 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300"></div>
          </button>
          
          {/* Authentication button with lime green matching website CTAs */}
          <button
            onClick={onAuthClick}
            className={`group relative px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lime-glow ${
              isAuthenticated
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:from-green-600 hover:to-green-700'
                : 'bg-gradient-to-r from-echostor-lime-400 to-echostor-lime-500 text-echostor-navy-900 shadow-lg hover:from-echostor-lime-500 hover:to-echostor-lime-600 font-bold'
            }`}
          >
            <span className="relative z-10 flex items-center">
              {isAuthenticated ? (
                <>
                  <div className="w-2 h-2 bg-green-300 rounded-full mr-2 animate-pulse"></div>
                  Authenticated
                </>
              ) : (
                'REQUEST INFO'
              )}
            </span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300"></div>
          </button>
        </div>
      </div>
      
      {/* Bottom border with subtle teal accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-echostor-teal-500 to-transparent opacity-30"></div>
    </header>
  );
};

export default Header; 