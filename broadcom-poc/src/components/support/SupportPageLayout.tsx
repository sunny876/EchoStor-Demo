import React, { useState } from 'react';
import Header from './Header'; // Assuming Header component exists
import Sidebar from './Sidebar'; // Assuming Sidebar component exists
import MainChat from './MainChat'; // Assuming MainChat component exists
import DocumentationHub from './DocumentationHub'; // Import the new component
import ContactSupportPage from './ContactSupportPage'; // Import the new component

// Define props for the layout
interface SupportPageLayoutProps {
  page: 'bot' | 'documentation' | 'contact'; // Add 'contact' page type
}

const SupportPageLayout: React.FC<SupportPageLayoutProps> = ({ page }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar starts open

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Determine the title and content based on the page prop
  let pageTitle: string;
  let PageContentComponent: React.ComponentType<any>; // Use any for simplicity, or define shared props

  switch (page) {
    case 'documentation':
      pageTitle = "DOCUMENTATION";
      PageContentComponent = DocumentationHub;
      break;
    case 'contact': // Add case for contact page
      pageTitle = "CONTACT SUPPORT";
      PageContentComponent = ContactSupportPage;
      break;
    case 'bot':
    default:
      pageTitle = "SUPPORT BOT";
      PageContentComponent = MainChat;
      break;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Pass the dynamic title to the Header */}
      <Header toggleSidebar={toggleSidebar} title={pageTitle} /> 
      
      <div className="flex flex-1 overflow-hidden"> 
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} /> 

        {/* Main Chat Panel */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* 
            Pass initialMessage or other props to MainChat if needed. 
            MainChat needs to be adapted to render *only* the chat history and input, 
            without its own surrounding page structure or header.
          */}
          <PageContentComponent /> 
        </main>
      </div>
    </div>
  );
};

export default SupportPageLayout; 