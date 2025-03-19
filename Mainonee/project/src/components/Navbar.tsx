import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { GraduationCap, FileText, Upload, Users, Home, Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { account, isConnected, isCorrectNetwork, isAdmin, isTeacher, connecting, connect, switchNetwork } = useWeb3();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-indigo-700' : '';
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-indigo-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <GraduationCap size={28} />
            <span className="text-xl font-bold">BlockEdu Results</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-4">
            <Link to="/" className={`px-3 py-2 rounded hover:bg-indigo-700 transition ${isActive('/')}`}>
              <div className="flex items-center space-x-1">
                <Home size={18} />
                <span>Home</span>
              </div>
            </Link>
            
            <Link to="/results" className={`px-3 py-2 rounded hover:bg-indigo-700 transition ${isActive('/results')}`}>
              <div className="flex items-center space-x-1">
                <FileText size={18} />
                <span>View Results</span>
              </div>
            </Link>
            
            {(isAdmin || isTeacher) && (
              <Link to="/upload" className={`px-3 py-2 rounded hover:bg-indigo-700 transition ${isActive('/upload')}`}>
                <div className="flex items-center space-x-1">
                  <Upload size={18} />
                  <span>Upload Results</span>
                </div>
              </Link>
            )}
            
            {isAdmin && (
              <Link to="/admin" className={`px-3 py-2 rounded hover:bg-indigo-700 transition ${isActive('/admin')}`}>
                <div className="flex items-center space-x-1">
                  <Users size={18} />
                  <span>Admin Panel</span>
                </div>
              </Link>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={toggleMobileMenu} className="text-white focus:outline-none">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {!isConnected ? (
              <button
                onClick={connect}
                disabled={connecting}
                className="bg-white text-indigo-800 px-4 py-2 rounded font-medium hover:bg-gray-100 transition disabled:opacity-50"
              >
                {connecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            ) : !isCorrectNetwork ? (
              <button
                onClick={switchNetwork}
                className="bg-yellow-500 text-white px-4 py-2 rounded font-medium hover:bg-yellow-600 transition"
              >
                Switch to Polygon
              </button>
            ) : (
              <div className="bg-indigo-700 px-4 py-2 rounded">
                {account && truncateAddress(account)}
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-indigo-700">
            <div className="flex flex-col space-y-2">
              <Link 
                to="/" 
                className={`px-3 py-2 rounded hover:bg-indigo-700 transition ${isActive('/')}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center space-x-1">
                  <Home size={18} />
                  <span>Home</span>
                </div>
              </Link>
              
              <Link 
                to="/results" 
                className={`px-3 py-2 rounded hover:bg-indigo-700 transition ${isActive('/results')}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center space-x-1">
                  <FileText size={18} />
                  <span>View Results</span>
                </div>
              </Link>
              
              {(isAdmin || isTeacher) && (
                <Link 
                  to="/upload" 
                  className={`px-3 py-2 rounded hover:bg-indigo-700 transition ${isActive('/upload')}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center space-x-1">
                    <Upload size={18} />
                    <span>Upload Results</span>
                  </div>
                </Link>
              )}
              
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className={`px-3 py-2 rounded hover:bg-indigo-700 transition ${isActive('/admin')}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center space-x-1">
                    <Users size={18} />
                    <span>Admin Panel</span>
                  </div>
                </Link>
              )}
              
      
              
              <div className="pt-2 border-t border-indigo-700 mt-2">
                {!isConnected ? (
                  <button
                    onClick={connect}
                    disabled={connecting}
                    className="w-full bg-white text-indigo-800 px-4 py-2 rounded font-medium hover:bg-gray-100 transition disabled:opacity-50"
                  >
                    {connecting ? 'Connecting...' : 'Connect Wallet'}
                  </button>
                ) : !isCorrectNetwork ? (
                  <button
                    onClick={switchNetwork}
                    className="w-full bg-yellow-500 text-white px-4 py-2 rounded font-medium hover:bg-yellow-600 transition"
                  >
                    Switch to Polygon
                  </button>
                ) : (
                  <div className="bg-indigo-700 px-4 py-2 rounded text-center">
                    {account && truncateAddress(account)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;