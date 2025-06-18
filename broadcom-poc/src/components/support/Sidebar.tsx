import React from 'react';
import { MessageSquare, BookOpen, Mail, Zap } from 'lucide-react'; // Example icons
import { NavLink } from 'react-router-dom'; // Use NavLink for active state

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  // Enhanced styling with dark navy background and white text like website
  const baseLinkClasses = "group flex items-center py-4 text-sm font-medium rounded-xl transition-all duration-300 ease-in-out relative overflow-hidden"; 
  // Inactive state with white text and navy hover
  const inactiveLinkClasses = "text-white hover:bg-echostor-navy-700 hover:text-echostor-lime-400 hover:shadow-card px-4"; 
  // Active state with lime green accent matching website CTAs
  const activeLinkClasses = "bg-gradient-to-r from-echostor-lime-500/20 to-echostor-lime-400/10 text-echostor-lime-400 font-semibold border-l-4 border-echostor-lime-400 pl-3 pr-4 shadow-card";

  return (
    <aside 
      className={`bg-echostor-navy-800 border-r border-echostor-navy-700 shadow-lg transition-all duration-300 ease-in-out flex-shrink-0 ${isOpen ? 'w-64' : 'w-16'} overflow-hidden relative backdrop-blur-sm`}
    >
      {/* Lime green top border accent matching website CTAs */}
      <div className="h-1 bg-gradient-to-r from-echostor-lime-400 to-echostor-teal-400"></div>
      
      <div className="p-4 space-y-3">
        {/* Support Section Title with lime accent */}
        {isOpen && (
          <div className="px-3 pt-2 pb-4">
            <h3 className="text-xs font-bold text-echostor-gray-300 uppercase tracking-wider flex items-center">
              <Zap className="h-3 w-3 mr-2 text-echostor-lime-400" />
              Support
            </h3>
            <div className="mt-2 h-px bg-gradient-to-r from-echostor-lime-400 to-transparent opacity-50"></div>
          </div>
        )}
        
        <NavLink
          to="/" // Points to root (Bot/Chat page)
          end // Add end prop for exact root matching
          className={({ isActive }) => 
            `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`
          }
        >
          <div className={`flex items-center justify-center flex-shrink-0 ${isOpen ? '' : 'w-full px-4'}`}> 
            <div className="relative">
              <MessageSquare className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${isOpen ? '' : 'mx-auto'}`} />
              {/* Subtle lime glow effect on hover */}
              <div className="absolute inset-0 bg-echostor-lime-400 opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-300"></div>
            </div>
          </div>
          {isOpen && (
            <span className="ml-4 transition-all duration-300 group-hover:translate-x-1">
              Bot
              <div className="text-xs text-echostor-gray-400 font-normal">AI Assistant</div>
            </span>
          )}
          {/* Lime indicator dot matching website accent */}
          <div className="absolute right-2 w-2 h-2 bg-echostor-lime-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </NavLink>

        <NavLink
          to="/documentation" // Points to new Documentation page route
          className={({ isActive }) => 
            `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`
          }
        >
          <div className={`flex items-center justify-center flex-shrink-0 ${isOpen ? '' : 'w-full px-4'}`}> 
            <div className="relative">
              <BookOpen className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${isOpen ? '' : 'mx-auto'}`} />
              <div className="absolute inset-0 bg-echostor-teal-400 opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-300"></div>
            </div>
          </div>
          {isOpen && (
            <span className="ml-4 transition-all duration-300 group-hover:translate-x-1">
              Documentation
              <div className="text-xs text-echostor-gray-400 font-normal">Knowledge Base</div>
            </span>
          )}
          <div className="absolute right-2 w-2 h-2 bg-echostor-teal-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </NavLink>

        <NavLink
          to="/contact" // Points to Contact page route
          className={({ isActive }) => 
            `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`
          }
        >
          <div className={`flex items-center justify-center flex-shrink-0 ${isOpen ? '' : 'w-full px-4'}`}> 
            <div className="relative">
              <Mail className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${isOpen ? '' : 'mx-auto'}`} />
              <div className="absolute inset-0 bg-green-400 opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-300"></div>
            </div>
          </div>
          {isOpen && (
            <span className="ml-4 transition-all duration-300 group-hover:translate-x-1">
              Contact Us
              <div className="text-xs text-echostor-gray-400 font-normal">Get Help</div>
            </span>
          )}
          <div className="absolute right-2 w-2 h-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </NavLink>
      </div>

      {/* Enhanced bottom section with lime accent */}
      {isOpen && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-echostor-navy-900 to-transparent">
          <div className="text-center">
            <div className="text-xs text-echostor-gray-300 font-medium">EchoStor Support</div>
            <div className="text-xs text-echostor-gray-400">v2.0.1</div>
          </div>
        </div>
      )}
      
      {/* Subtle right border */}
      <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-echostor-navy-600 via-echostor-navy-700 to-echostor-navy-600"></div>
    </aside>
  );
};

export default Sidebar; 