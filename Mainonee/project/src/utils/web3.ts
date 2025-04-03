import { ethers, Eip1193Provider, isAddress } from 'ethers';

// Contract address from environment variable
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

// Placeholder for contract ABI until we compile the contract
const StudentResultSystemABI = [
  // Admin functions
  "function addTeacher(address teacher) external",
  "function removeTeacher(address teacher) external",
  
  // Teacher functions
  "function uploadResult(string memory studentId, string memory examName, string memory resultHash) external returns (uint256)",
  
  // View functions
  "function getResult(uint256 resultId) external view returns (uint256 id, string memory studentId, string memory examName, string memory resultHash, uint256 timestamp, address uploadedBy)",
  "function getStudentResultIds(string memory studentId) external view returns (uint256[] memory)",
  "function verifyResult(uint256 resultId, string memory resultHash) external view returns (bool)",
  
  // Role checking
  "function hasRole(bytes32 role, address account) external view returns (bool)"
];

// Role constants
const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
const TEACHER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("TEACHER_ROLE"));

interface Window {
  ethereum: Eip1193Provider; // Revert to Eip1193Provider type
}

// Connect to MetaMask
export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed. Please install MetaMask to use this application.');
  }

  try {
    // Request account access
    const accounts = await (window.ethereum as Eip1193Provider).request({ method: 'eth_requestAccounts' });
    return accounts[0];
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
    throw error;
  }
};

// Get contract instance
export const getContract = async (withSigner = false) => {
  if (!contractAddress) {
    throw new Error('Contract address is not defined');
  }

  try {
    // Use MetaMask provider with Mumbai
    const provider = new ethers.BrowserProvider(window.ethereum as Eip1193Provider);
    
    if (withSigner) {
      const signer = await provider.getSigner();
      return new ethers.Contract(contractAddress, StudentResultSystemABI, signer);
    }
    
    return new ethers.Contract(contractAddress, StudentResultSystemABI, provider);
  } catch (error) {
    console.error('Error getting contract instance:', error);
    throw error;
  }
};


// Check if user has a specific role
export const hasRole = async (role: string, address: string) => {
  try {
    const contract = await getContract();
    const roleHash = role === 'ADMIN_ROLE' ? ADMIN_ROLE : TEACHER_ROLE;
    return await contract.hasRole(roleHash, address);
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
};

// Upload a result to the blockchain
export const uploadResult = async (studentId: string, examName: string, resultHash: string) => {
  try {
    const contract = await getContract(true);
    const tx = await contract.uploadResult(studentId, examName, resultHash);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error uploading result:', error);
    throw error;
  }
};

// Get a specific result
export const getResult = async (resultId: number) => {
  try {
    const contract = await getContract();
    return await contract.getResult(resultId);
  } catch (error) {
    console.error('Error getting result:', error);
    throw error;
  }
};

// Get all result IDs for a student
export const getStudentResultIds = async (studentId: string) => {
  try {
    const contract = await getContract();
    return await contract.getStudentResultIds(studentId);
  } catch (error) {
    console.error('Error getting student result IDs:', error);
    throw error;
  }
};

// Add a teacher (admin only)
export const addTeacher = async (teacherAddress: string) => {
  if (!isAddress(teacherAddress)) {
    throw new Error('Invalid Ethereum address');
  }

  try {
    const contract = await getContract(true);
    const tx = await contract.addTeacher(teacherAddress);
    await tx.wait();
    return tx;
  } catch (error: any) {
    console.error('Error adding teacher:', error);

    if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
      throw new Error('Transaction may fail due to gas estimation issues. Please check the contract and permissions.');
    } else if (error.code === 'CALL_EXCEPTION') {
      throw new Error('Call exception occurred. Ensure the account has the necessary permissions.');
    } else {
      throw new Error(`Error adding teacher: ${error.message || 'Please try again'}`);
    }
  }
};

// Remove a teacher (admin only)
export const removeTeacher = async (teacherAddress: string) => {
  try {
    const contract = await getContract(true);
    const tx = await contract.removeTeacher(teacherAddress);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error removing teacher:', error);
    throw error;
  }
};

// Verify if the current network is Mumbai
export const checkNetwork = async () => {
  if (!window.ethereum) return false;
  try {
    const chainId = await (window.ethereum as Eip1193Provider).request({ method: 'eth_chainId' });
    return chainId === '0x13881'; // Mumbai Testnet (80001)
  } catch (error) {
    console.error('Error checking network:', error);
    return false;
  }
};



// Switch to Mumbai Testnet
export const switchToMumbai = async () => {
  if (!window.ethereum) throw new Error('MetaMask is not installed');
  
  try {
    await (window.ethereum as Eip1193Provider).request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x13881' }], // Mumbai Testnet
    });
  } catch (error: any) {
    // If the chain hasn't been added to MetaMask, prompt user to add it
    if (error.code === 4902) {
      await (window.ethereum as Eip1193Provider).request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x13881',
            chainName: 'Polygon Mumbai Testnet',
            nativeCurrency: {
              name: 'MATIC',
              symbol: 'MATIC',
              decimals: 18,
            },
            rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
            blockExplorerUrls: ['https://mumbai.polygonscan.com'],
          },
        ],
      });
    } else {
      throw error;
    }
  }
};
