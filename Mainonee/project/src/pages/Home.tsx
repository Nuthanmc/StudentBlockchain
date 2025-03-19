import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Shield, Database, FileCheck, ExternalLink } from 'lucide-react';
import ConnectWallet from '../components/ConnectWallet';

const Home: React.FC = () => {
  return (
    <div>
      <ConnectWallet />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white p-8 mb-12">
        <div className="max-w-3xl mx-auto text-center">
          <GraduationCap size={64} className="mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4 text-red-500">Blockchain-Based Student Results</h1>
          <p className="text-xl mb-8">
            Secure, transparent, and tamper-proof academic results using blockchain technology on Polygon
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/results"
              className="bg-white text-indigo-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              View Results
            </Link>
            <Link
              to="/upload"
              className="bg-indigo-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-900 transition"
            >
              Upload Results
            </Link>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="bg-indigo-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Shield className="text-indigo-600" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Immutable Records</h3>
            <p className="text-gray-600">
              Once uploaded to the blockchain, result records cannot be altered or tampered with, ensuring data integrity.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="bg-indigo-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Database className="text-indigo-600" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Decentralized Storage</h3>
            <p className="text-gray-600">
              Results are stored on the Polygon blockchain and IPFS, eliminating single points of failure.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="bg-indigo-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <FileCheck className="text-indigo-600" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Verification System</h3>
            <p className="text-gray-600">
              Easily verify the authenticity of any result using cryptographic proofs on the blockchain.
            </p>
          </div>
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="bg-white p-8 rounded-lg shadow-md mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <span className="text-indigo-600 font-bold">1</span>
            </div>
            <h3 className="font-semibold mb-2">Authentication</h3>
            <p className="text-gray-600 text-sm">
              Teachers and administrators connect their MetaMask wallet to authenticate.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <span className="text-indigo-600 font-bold">2</span>
            </div>
            <h3 className="font-semibold mb-2">Result Upload</h3>
            <p className="text-gray-600 text-sm">
              Authorized users upload student results which are stored on IPFS.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <span className="text-indigo-600 font-bold">3</span>
            </div>
            <h3 className="font-semibold mb-2">Blockchain Storage</h3>
            <p className="text-gray-600 text-sm">
              Result hashes are stored on the Polygon blockchain for verification.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <span className="text-indigo-600 font-bold">4</span>
            </div>
            <h3 className="font-semibold mb-2">Result Verification</h3>
            <p className="text-gray-600 text-sm">
              Students can verify and access their results using their student ID.
            </p>
          </div>
        </div>
      </div>
      
      {/* Getting Started Section */}
      <div className="bg-white p-8 rounded-lg shadow-md mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">Getting Started</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">For Students</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="bg-indigo-100 text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5">1</span>
                <span>Navigate to the "View Results" page</span>
              </li>
              <li className="flex items-start">
                <span className="bg-indigo-100 text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5">2</span>
                <span>Enter your student ID to search for your results</span>
              </li>
              <li className="flex items-start">
                <span className="bg-indigo-100 text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5">3</span>
                <span>View and verify your results with blockchain proof</span>
              </li>
            </ul>
            <div className="mt-4">
              <Link to="/results" className="text-indigo-600 font-medium hover:text-indigo-800 flex items-center">
                <span>View Your Results</span>
                <ExternalLink size={16} className="ml-1" />
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4">For Teachers & Administrators</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="bg-indigo-100 text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5">1</span>
                <span>Connect your MetaMask wallet to authenticate</span>
              </li>
              <li className="flex items-start">
                <span className="bg-indigo-100 text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5">2</span>
                <span>Navigate to the "Upload Results" page</span>
              </li>
              <li className="flex items-start">
                <span className="bg-indigo-100 text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5">3</span>
                <span>Enter student details and upload results securely</span>
              </li>
            </ul>
            <div className="mt-4">
              <Link to="/upload" className="text-indigo-600 font-medium hover:text-indigo-800 flex items-center">
                <span>Upload Results</span>
                <ExternalLink size={16} className="ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Blockchain Benefits */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Why Blockchain for Academic Results?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Tamper-Proof Records</h3>
            <p className="text-gray-300">
              Blockchain's immutable nature ensures that once results are recorded, they cannot be altered or falsified.
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Transparent Verification</h3>
            <p className="text-gray-300">
              Anyone can verify the authenticity of results without relying on a central authority.
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Reduced Fraud</h3>
            <p className="text-gray-300">
              Eliminates the possibility of fake certificates and unauthorized result modifications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;