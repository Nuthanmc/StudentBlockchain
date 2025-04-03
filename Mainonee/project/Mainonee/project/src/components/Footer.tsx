import React from 'react';
import { GraduationCap, Github, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <GraduationCap size={24} />
            <span className="text-lg font-bold">BlockEdu Results</span>
          </div>
          
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p>Secure Student Result Monitoring Using Blockchain Technology</p>
            <p className="text-gray-400 text-sm mt-1">© {new Date().getFullYear()} BlockEdu. All rights reserved.</p>
          </div>
          
          <div className="flex space-x-4">
            <a href="#" className="hover:text-indigo-400 transition">
              <Github size={20} />
            </a>
            <a href="#" className="hover:text-indigo-400 transition">
              <Twitter size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;