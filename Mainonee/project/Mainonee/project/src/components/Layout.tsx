import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { Web3Provider } from '../contexts/Web3Context';

const Layout: React.FC = () => {
  return (
    <Web3Provider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Outlet />
        </main>
        <Footer />
      </div>
    </Web3Provider>
  );
};

export default Layout;