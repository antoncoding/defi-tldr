import React from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react'; // Example icon

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-gray-800 hover:text-gray-900">
              <Zap size={24} className="text-teal-500" /> 
              <span>Crypto TLDR</span>
            </Link>
          </div>
          {/* Add other nav items here if needed later */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 