import React, { useState } from 'react';
import { addTeacher, removeTeacher } from '../utils/web3';
import { useWeb3 } from '../contexts/Web3Context';
import { Users, UserPlus, UserMinus, AlertTriangle, CheckCircle } from 'lucide-react';
import ConnectWallet from '../components/ConnectWallet';

const AdminPanel: React.FC = () => {
  const { isConnected, isCorrectNetwork, isAdmin } = useWeb3();
  
  const [teacherAddress, setTeacherAddress] = useState('');
  const [removeAddress, setRemoveAddress] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!teacherAddress) {
      setError("Please enter a teacher address");
      return;
    }
  
    setLoading(true);
    setError('');
    setSuccess('');
  
    try {
      await addTeacher(teacherAddress); // Use the imported function
      setSuccess(`Teacher ${teacherAddress} added successfully`);
      setTeacherAddress('');
    } catch (error) {
      setError("Error adding teacher. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  // Function to handle removing a teacher  
  
  
  const handleRemoveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!removeAddress) {
      setError('Please enter a teacher address');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await removeTeacher(removeAddress);
      setSuccess(`Teacher ${removeAddress} removed successfully`);
      setRemoveAddress('');
    } catch (error) {
      console.error('Error removing teacher:', error);
      setError('Error removing teacher. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isConnected || !isCorrectNetwork) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
        <ConnectWallet />
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          <div className="flex items-center">
            <AlertTriangle size={20} className="mr-2" />
            <span>You don't have admin privileges. Only administrators can access this panel.</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <div className="flex items-center">
            <CheckCircle size={20} className="mr-2" />
            <span>{success}</span>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <UserPlus size={24} className="text-indigo-600 mr-2" />
            <h2 className="text-xl font-semibold">Add Teacher</h2>
          </div>
          
          <form onSubmit={handleAddTeacher}>
            <div className="mb-4">
              <label htmlFor="teacherAddress" className="block text-sm font-medium text-gray-700 mb-1">
                Teacher Wallet Address
              </label>
              <input
                type="text"
                id="teacherAddress"
                value={teacherAddress}
                onChange={(e) => setTeacherAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Add Teacher'}
            </button>
          </form>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <UserMinus size={24} className="text-red-600 mr-2" />
            <h2 className="text-xl font-semibold">Remove Teacher</h2>
          </div>
          
          <form onSubmit={handleRemoveTeacher}>
            <div className="mb-4">
              <label htmlFor="removeAddress" className="block text-sm font-medium text-gray-700 mb-1">
                Teacher Wallet Address
              </label>
              <input
                type="text"
                id="removeAddress"
                value={removeAddress}
                onChange={(e) => setRemoveAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Remove Teacher'}
            </button>
          </form>
        </div>
      </div>
      
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <Users size={24} className="text-indigo-600 mr-2" />
          <h2 className="text-xl font-semibold">System Information</h2>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="mb-2">
            <span className="font-medium">Contract Address:</span>{' '}
            <span className="font-mono text-sm">{import.meta.env.VITE_CONTRACT_ADDRESS || 'Not configured'}</span>
          </p>
          <p className="mb-2">
            <span className="font-medium">Network:</span>{' '}
            <span>Polygon {window.ethereum?.chainId === '0xaa36a7' ? 'Sepolia Testnet' : 'Unknown Network'}</span>
          </p>
          <p>
            <span className="font-medium">Your Role:</span>{' '}
            <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm">Administrator</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;