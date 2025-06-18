import React from 'react';
import { ExternalLink } from 'lucide-react';

interface DocumentationCardProps {
  icon: React.ReactNode; // Expecting an icon element like <Cloud />
  title: string;
  description: string;
  url: string;
}

const DocumentationCard: React.FC<DocumentationCardProps> = ({ icon, title, description, url }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-full transform transition-transform duration-200 hover:scale-[1.02]">
      {/* Icon */}
      <div className="w-12 h-12 rounded-full bg-[#AE0E2A] flex items-center justify-center mb-4 flex-shrink-0">
        {icon} {/* Render the passed icon node */}
      </div>
      
      {/* Title */}
      <h3 className="font-bold text-gray-900 mb-2 text-lg">{title}</h3>
      
      {/* Description */}
      {/* Using line-clamp requires installing @tailwindcss/line-clamp plugin */}
      <p className="text-sm text-gray-600 mb-4 flex-grow line-clamp-3"> 
        {description}
      </p>
      
      {/* View More Link */}
      <a 
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-[#AE0E2A] hover:text-[#8a1a1d] mt-auto flex items-center group"
      >
        View More 
        <ExternalLink className="h-4 w-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
      </a>
    </div>
  );
};

export default DocumentationCard; 