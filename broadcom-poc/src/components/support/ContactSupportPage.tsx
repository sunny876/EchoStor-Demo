import React, { useState } from 'react';
import ContactOptionCard from './ContactOptionCard'; // Import the card component
import { MessageSquare, BookText, PhoneCall } from 'lucide-react'; // Icons for option cards

const ContactSupportPage: React.FC = () => {
  // Basic form state example (consider using react-hook-form for robust handling)
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    email: '',
    product: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log("Form data submitted:", formData);
    // TODO: Implement actual form submission logic (e.g., API call)
    // Simulate submission delay
    setTimeout(() => {
      setIsSubmitting(false);
      // Optionally show a success message (e.g., using toast)
      // reset form?
      // setFormData({ fullName: '', company: '', email: '', product: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
        Need help? We're here for you.
      </h1>
      <p className="text-base text-gray-600 mt-2 mb-8">
        For product, billing, or account support, choose from the options below or send us a message.
      </p>

      {/* Contact Form */}
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl"> 
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            name="fullName"
            id="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2"
          />
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company/Organization</label>
          <input
            type="text"
            name="company"
            id="company"
            value={formData.company}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email*</label>
          <input
            type="email"
            name="email"
            id="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2"
          />
        </div>
        
        <div>
          <label htmlFor="product" className="block text-sm font-medium text-gray-700">Product</label>
          {/* Example: Simple input, replace with dropdown/select if needed */}
          <input
            type="text"
            name="product"
            id="product"
            value={formData.product}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2"
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
          <input
            type="text"
            name="subject"
            id="subject"
            value={formData.subject}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
          <textarea
            name="message"
            id="message"
            rows={4}
            value={formData.message}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2"
          ></textarea>
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center rounded-md border border-transparent bg-[#AE0E2A] py-2 px-6 text-sm font-medium text-white shadow-sm hover:bg-[#8a1a1d] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>

      <p className="text-xs text-gray-500 mt-4 max-w-2xl">
        We respect your privacy. You information is secure and only used to respond to your inquiry.
      </p>

      {/* Additional Support Options */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
        <ContactOptionCard 
          icon={<MessageSquare className="h-8 w-8 mx-auto mb-3 text-[#AE0E2A]" />} 
          title="Live Chat" 
          description="Chat with a Support Agent" 
        />
        <ContactOptionCard 
          icon={<BookText className="h-8 w-8 mx-auto mb-3 text-[#AE0E2A]" />} 
          title="Knowledge Base" 
          description="Browse Help Articles" 
        />
        <ContactOptionCard 
          icon={<PhoneCall className="h-8 w-8 mx-auto mb-3 text-[#AE0E2A]" />} 
          title="Request a Callback" 
          description="Speak with a representative" 
        />
      </div>

      {/* Footer Contact */}
      <p className="mt-12 text-center text-sm text-gray-600">
        Phone: 1-800-ECHOSTOR
      </p>

    </div>
  );
};

export default ContactSupportPage; 