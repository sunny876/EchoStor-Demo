import React from 'react';

interface ContactOptionCardProps {
  icon: React.ReactNode; // Expecting an icon element
  title: string;
  description: string;
  // Optionally add onClick or href if these cards should be interactive
  // onClick?: () => void;
}

const ContactOptionCard: React.FC<ContactOptionCardProps> = ({ icon, title, description }) => {
  // Basic card structure - add onClick handler or wrap in <a> if needed
  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center border border-gray-200 flex flex-col items-center">
      {/* Icon */}
      <div className="mb-3">
        {icon} {/* Render the passed icon node */}
      </div>
      
      {/* Title */}
      <h4 className="font-semibold text-gray-800 mb-1 text-base">{title}</h4>
      
      {/* Description */}
      <p className="text-sm text-gray-500">
        {description}
      </p>
    </div>
  );
};

export default ContactOptionCard; 