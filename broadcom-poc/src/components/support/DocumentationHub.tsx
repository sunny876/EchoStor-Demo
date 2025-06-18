import React from 'react';
import DocumentationCard from './DocumentationCard'; // Component for individual cards
import { 
  BookCopy, Cloud, Database, HardDrive, KeyRound, Lock, Server, ShieldCheck, Users, Wifi, Settings, Globe 
} from 'lucide-react'; // Example icons

// --- Updated Data for Documentation Cards ---
const categories = [
  { 
    title: 'Enterprise Software', 
    description: 'Solutions for enterprise digital services', 
    url: '#' 
  },
  { 
    title: 'Mainframe Software', 
    description: 'Mainframe modernization and security', 
    url: '#' 
  },
  { 
    title: 'Security Software', 
    description: 'Cybersecurity and compliance', 
    url: '#' 
  },
  { 
    title: 'Cloud Infrastructure Solutions', 
    description: 'Modern Software-Defined Data Center (SDDC).', 
    url: '#' 
  },
  { 
    title: 'Virtualization & Cloud Management', 
    description: 'Hybrid cloud for data center and cloud', 
    url: '#' 
  },
  { 
    title: 'Software-Defined Edge', 
    description: 'Edge AI and Application Domain Manager', 
    url: '#' 
  },
  { 
    title: 'Application Development', 
    description: 'Modern application development and Kubernetes', 
    url: '#' 
  },
  { 
    title: 'Endpoint Security', 
    description: 'Protect every endpoint in your organization.', 
    url: '#' 
  },
];
// --------------------------------------------

const DocumentationHub: React.FC = () => {
  // Use the updated documentation items
  const documentationItems = categories;

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-8">
        Documentation
      </h1>
      
      {/* Responsive Grid for Documentation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"> {/* Adjusted grid for potentially 4 columns */}
        {documentationItems.map((item) => (
          <DocumentationCard
            key={item.title}
            icon={<Globe className="h-6 w-6 text-white" />}
            title={item.title}
            description={item.description}
            url={item.url}
          />
        ))}
      </div>
    </div>
  );
};

export default DocumentationHub; 