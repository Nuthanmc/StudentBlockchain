import { ethers } from 'ethers';
import { create } from 'ipfs-http-client';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Set current year in footer
  document.getElementById('current-year').textContent = new Date().getFullYear();
  
  // Initialize navigation
  initNavigation();
  
  // Initialize Web3 connection
  initWeb3();
  
  // Initialize page-specific functionality
  initResultsPage();
  initUploadPage();
  initAdminPage();
});

// Contract address from environment variable
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

// Placeholder for contract ABI
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

// Global state
const state = {
  account: null,
  isConnected: false,
  isCorrectNetwork: false,
  isAdmin: false,
  isTeacher: false,
  connecting: false,
  provider: null,
  contract: null,
  ipfs: null
};

// Initialize IPFS client
function initIPFS() {
  const projectId = import.meta.env.VITE_IPFS_PROJECT_ID;
  const projectSecret = import.meta.env.VITE_IPFS_PROJECT_SECRET;
  const auth = 'Basic ' + btoa(projectId + ':' + projectSecret);

  state.ipfs = create({
    host: 'ipfs.inf ura.io',
    port: 5001,
    protocol: 'https',
    headers: {
      authorization: auth,
    },
  });
}

// Initialize navigation
function initNavigation() {
  // Handle page navigation
  document.querySelectorAll('[data-page]').forEach(element => {
    element.addEventListener('click', (e) => {
      e.preventDefault();
      const pageName = element.getAttribute('data-page');
      navigateToPage(pageName);
    });
  });
  
  // Mobile menu toggle
  const navbarToggle = document.getElementById('navbar-toggle');
  const navbarMenu = document.getElementById('navbar-menu');
  
  navbarToggle.addEventListener('click', () => {
    navbarMenu.classList.toggle('active');
  });
  
  // Back to results button
  document.getElementById('back-to-results').addEventListener('click', () => {
    document.getElementById('results-list').classList.remove('hidden');
    document.getElementById('result-details').classList.add('hidden');
  });
  
  // Upload another result button
  document.getElementById('upload-another').addEventListener('click', () => {
    document.getElementById('upload-success').classList.add('hidden');
    document.getElementById('upload-form-container').classList.remove('hidden');
  });
}

// Navigate to a specific page
function navigateToPage(pageName) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  // Show the selected page
  document.getElementById(`${pageName}-page`).classList.add('active');
  
  // Update active nav link
  document.querySelectorAll('[data-page]').forEach(link => {
    if (link.getAttribute('data-page') === pageName) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
  
  // Check permissions for restricted pages
  if (pageName === 'upload') {
    checkUploadPermissions();
  } else if (pageName === 'admin') {
    checkAdminPermissions();
  }
}
 

// Initialize Web3 connection
function initWeb3() {
  // Connect wallet buttons
  document.getElementById('connect-wallet').addEventListener('click', connectWallet);
  document.getElementById('connect-wallet-btn').addEventListener('click', connectWallet);
  document.getElementById('switch-network').addEventListener('click', switchToMumbai);
  
  // Check if MetaMask is installed
  if (window.ethereum) {
    // Listen for account changes
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    
    // Listen for chain changes
    window.ethereum.on('chainChanged', handleChainChanged);
    
    // Try to auto connect
    tryAutoConnect();
  } else {
    // MetaMask not installed
    showConnectWalletNotice("MetaMask is not installed. Please install MetaMask to use this application.");
  }
  
  // Initialize IPFS
  initIPFS();
  
  // Update contract address display
  if (contractAddress) {
    document.getElementById('contract-address').textContent = contractAddress;
  } else {
    document.getElementById('contract-address').textContent = 'Not configured';
  }
}

// Try to auto connect if previously connected
async function tryAutoConnect() {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        await handleAccountsChanged(accounts);
      }
    } catch (error) {
      console.error('Error auto-connecting:', error);
    }
  }
}

// Connect wallet
async function connectWallet() {
  if (!window.ethereum) {
    alert('MetaMask is not installed. Please install MetaMask to use this application.');
    return;
  }
  
  state.connecting = true;
  updateConnectButton();
  
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    await handleAccountsChanged(accounts);
  } catch (error) {
    console.error('Error connecting wallet:', error);
    alert('Error connecting wallet. Please try again.');
  } finally {
    state.connecting = false;
    updateConnectButton();
  }
}

// Handle accounts changed
async function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // Disconnected
    state.account = null;
    state.isConnected = false;
    state.isAdmin = false;
    state.isTeacher = false;
  } else {
    // Connected
    state.account = accounts[0];
    state.isConnected = true;
    
    // Initialize provider and contract
    state.provider = new ethers.BrowserProvider(window.ethereum);
    
    if (contractAddress) {
      const signer = await state.provider.getSigner();
      state.contract = new ethers.Contract(
        contractAddress,
        StudentResultSystemABI,
        signer
      );
    }
    
    // Check if on correct network
    await checkNetwork();
    
    // Check roles if connected and on correct network
    if (state.isConnected && state.isCorrectNetwork && state.contract) {
      await checkRoles();
    }
  }
  
  updateUI();
}

// Check if on correct network
async function checkNetwork() {
  if (!window.ethereum) return false;
  
  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    // Polygon Mainnet: 0x89, Mumbai Testnet: 0x13881
    state.isCorrectNetwork = chainId === '0x89' || chainId === '0x13881';
    
    // Update network info display
    if (chainId === '0x89') {
      document.getElementById('network-info').textContent = 'Polygon Mainnet';
    } else if (chainId === '0x13881') {
      document.getElementById('network-info').textContent = 'Polygon Mumbai Testnet';
    } else {
      document.getElementById('network-info').textContent = 'Unknown Network';
    }
    
    return state.isCorrectNetwork;
  } catch (error) {
    console.error('Error checking network:', error);
    return false;
  }
}

// Handle chain changed
async function handleChainChanged() {
  // Reload the page to avoid any issues
  window.location.reload();
}

// Switch to Mumbai Testnet
async function switchToMumbai() {
  if (!window.ethereum) {
    alert('MetaMask is not installed');
    return;
  }
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x13881' }], // Mumbai Testnet
    });
  } catch (error) {
    // If the chain hasn't been added to MetaMask
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
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
      } catch (addError) {
        console.error('Error adding Mumbai network:', addError);
      }
    } else {
      console.error('Error switching network:', error);
    }
  }
}

// Check user roles
async function checkRoles() {
  try {
    state.isAdmin = await state.contract.hasRole(ADMIN_ROLE, state.account);
    state.isTeacher = await state.contract.hasRole(TEACHER_ROLE, state.account);
    
    // Update UI based on roles
    updateRolesUI();
  } catch (error) {
    console.error('Error checking roles:', error);
  }
}

// Update UI based on connection state
function updateUI() {
  // Update connect button
  updateConnectButton();
  
  // Update connect wallet notice
  if (state.isConnected && state.isCorrectNetwork) {
    document.getElementById('connect-wallet-notice').classList.add('hidden');
  } else {
    document.getElementById('connect-wallet-notice').classList.remove('hidden');
  }
  
  // Update roles UI
  updateRolesUI();
  
  // Check permissions for current page
  const currentPage = document.querySelector('.page.active').id.replace('-page', '');
  if (currentPage === 'upload') {
    checkUploadPermissions();
  } else if (currentPage === 'admin') {
    checkAdminPermissions();
  }
}

// Update connect button state
function updateConnectButton() {
  const connectWalletBtn = document.getElementById('connect-wallet');
  const switchNetworkBtn = document.getElementById('switch-network');
  const accountInfo = document.getElementById('account-info');
  
  if (!state.isConnected) {
    connectWalletBtn.classList.remove('hidden');
    switchNetworkBtn.classList.add('hidden');
    accountInfo.classList.add('hidden');
    
    connectWalletBtn.textContent = state.connecting ? 'Connecting...' : 'Connect Wallet';
    connectWalletBtn.disabled = state.connecting;
  } else if (!state.isCorrectNetwork) {
    connectWalletBtn.classList.add('hidden');
    switchNetworkBtn.classList.remove('hidden');
    accountInfo.classList.add('hidden');
  } else {
    connectWalletBtn.classList.add('hidden');
    switchNetworkBtn.classList.add('hidden');
    accountInfo.classList.remove('hidden');
    
    // Display truncated address
    accountInfo.textContent = `${state.account.slice(0, 6)}...${state.account.slice(-4)}`;
  }
}

// Update UI based on user roles
function updateRolesUI() {
  // Show/hide teacher-only elements
  document.querySelectorAll('.teacher-only').forEach(element => {
    if (state.isAdmin || state.isTeacher) {
      element.classList.remove('hidden');
    } else {
      element.classList.add('hidden');
    }
  });
  
  // Show/hide admin-only elements
  document.querySelectorAll('.admin-only').forEach(element => {
    if (state.isAdmin) {
      element.classList.remove('hidden');
    } else {
      element.classList.add('hidden');
    }
  });
  
  // Update user role display
  if (state.isAdmin) {
    document.getElementById('user-role').textContent = 'Administrator';
  } else if (state.isTeacher) {
    document.getElementById('user-role').textContent = 'Teacher';
  } else {
    document.getElementById('user-role').textContent = 'Student/Guest';
  }
}

// Show connect wallet notice with custom message
function showConnectWalletNotice(message) {
  const notice = document.getElementById('connect-wallet-notice');
  const noticeContent = notice.querySelector('p');
  noticeContent.textContent = message;
  notice.classList.remove('hidden');
}

// Initialize Results Page
function initResultsPage() {
  const searchForm = document.getElementById('search-results-form');
  
  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const studentId = document.getElementById('student-id').value.trim();
    
    if (!studentId) {
      showError('Please enter a student ID');
      return;
    }
    
    await searchResults(studentId);
  });
}

// Search for student results
async function searchResults(studentId) {
  // Clear previous results
  document.getElementById('results-list').classList.add('hidden');
  document.getElementById('result-details').classList.add('hidden');
  document.getElementById('error-message').classList.add('hidden');
  
  // Check if connected to blockchain
  if (!state.isConnected || !state.isCorrectNetwork) {
    showError('Please connect your wallet to the Polygon network to search for results');
    return;
  }
  
  try {
    // Get all result IDs for the student
    const resultIds = await state.contract.getStudentResultIds(studentId);
    
    if (resultIds.length === 0) {
      showError('No results found for this student ID');
      return;
    }
    
    // Display student ID
    document.getElementById('results-student-id').textContent = studentId;
    
    // Clear previous results
    const tableBody = document.getElementById('results-table-body');
    tableBody.innerHTML = '';
    
    // Get details for each result
    for (const id of resultIds) {
      const result = await state.contract.getResult(Number(id));
      
      const row = document.createElement('tr');
      
      // Exam name cell
      const examCell = document.createElement('td');
      examCell.innerHTML = `<div class="flex items-center">
        <i class="fas fa-file-alt text-gray-400 mr-2"></i>
        <span>${result[2]}</span>
      </div>`;
      
      // Date cell
      const dateCell = document.createElement('td');
      const date = new Date(Number(result[4]) * 1000);
      dateCell.textContent = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      // Actions cell
      const actionsCell = document.createElement('td');
      const viewButton = document.createElement('button');
      viewButton.className = 'text-primary-color hover:text-primary-dark font-medium';
      viewButton.textContent = 'View Details';
      viewButton.addEventListener('click', () => viewResultDetails(result));
      actionsCell.appendChild(viewButton);
      
      // Add cells to row
      row.appendChild(examCell);
      row.appendChild(dateCell);
      row.appendChild(actionsCell);
      
      // Add row to table
      tableBody.appendChild(row);
    }
    
    // Show results list
    document.getElementById('results-list').classList.remove('hidden');
  } catch (error) {
    console.error('Error fetching results:', error);
    showError('Error fetching results. Please try again.');
  }
}

// View result details
async function viewResultDetails(result) {
  try {
    // Hide results list and show details
    document.getElementById('results-list').classList.add('hidden');
    document.getElementById('result-details').classList.remove('hidden');
    
    // Get result data
    const resultId = Number(result[0]);
    const studentId = result[1];
    const examName = result[2];
    const resultHash = result[3];
    const timestamp = Number(result[4]);
    const uploadedBy = result[5];
    
    // Set result title
    document.getElementById('result-title').textContent = `${examName}`;
    
    // Set result ID
    document.getElementById('result-id').textContent = resultId;
    
    // Set student ID
    document.getElementById('detail-student-id').textContent = studentId;
    
    // Set exam date
    const date = new Date(timestamp * 1000);
    document.getElementById('exam-date').textContent = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    // Set IPFS hash and link
    document.getElementById('ipfs-hash').textContent = resultHash;
    document.getElementById('ipfs-link').href = `https://ipfs.io/ipfs/${resultHash}`;
    
    // Set uploaded by
    document.getElementById('uploaded-by').textContent = uploadedBy;
    
    // Fetch result details from IPFS
    const details = await getFromIPFS(resultHash);
    
    // Set student name
    document.getElementById('student-name').textContent = details.name;
    
    // Set total score
    document.getElementById('total-score').textContent = `${details.totalScore}/${details.totalMaxScore}`;
    
    // Set percentage
    document.getElementById('percentage').textContent = `${details.percentage.toFixed(2)}%`;
    
    // Set grade
    document.getElementById('grade').textContent = details.grade;
    
    // Clear previous marks
    const marksTableBody = document.getElementById('marks-table-body');
    marksTableBody.innerHTML = '';
    
    // Add marks to table
    details.marks.forEach(mark => {
      const row = document.createElement('tr');
      
      // Subject cell
      const subjectCell = document.createElement('td');
      subjectCell.textContent = mark.subject;
      
      // Marks cell
      const marksCell = document.createElement('td');
      marksCell.textContent = `${mark.score}/${mark.maxScore}`;
      
      // Percentage cell
      const percentageCell = document.createElement('td');
      const percentage = (mark.score / mark.maxScore) * 100;
      percentageCell.textContent = `${percentage.toFixed(2)}%`;
      
      // Add cells to row
      row.appendChild(subjectCell);
      row.appendChild(marksCell);
      row.appendChild(percentageCell);
      
      // Add row to table
      marksTableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error fetching result details:', error);
    showError('Error fetching result details from IPFS');
  }
}

// Initialize Upload Page
function initUploadPage() {
  // Add subject button
  document.getElementById('add-subject').addEventListener('click', addSubjectRow);
  
  // Upload result form
  document.getElementById('upload-result-form').addEventListener('submit', handleUploadResult);
  
  // Initialize subject inputs to update summary
  initSubjectInputs();
}

// Check upload permissions
function checkUploadPermissions() {
  if (!state.isConnected || !state.isCorrectNetwork) {
    // Not connected or wrong network
    document.getElementById('upload-form-container').classList.add('hidden');
    document.getElementById('permission-error').classList.add('hidden');
    document.getElementById('upload-success').classList.add('hidden');
    return;
  }
  
  if (!state.isAdmin && !state.isTeacher) {
    // Not authorized
    document.getElementById('upload-form-container').classList.add('hidden');
    document.getElementById('permission-error').classList.remove('hidden');
    document.getElementById('upload-success').classList.add('hidden');
  } else {
    // Authorized
    document.getElementById('permission-error').classList.add('hidden');
    
    // Show form if not showing success message
    if (document.getElementById('upload-success').classList.contains('hidden')) {
      document.getElementById('upload-form-container').classList.remove('hidden');
    }
  }
}

// Add a new subject row
function addSubjectRow() {
  const container = document.getElementById('subjects-container');
  const newRow = document.createElement('div');
  newRow.className = 'subject-row';
  
  newRow.innerHTML = `
    <div class="subject-name">
      <input type="text" placeholder="Subject Name" required>
    </div>
    <div class="subject-score">
      <input type="number" placeholder="Score" min="0" required>
    </div>
    <div class="subject-max">
      <span>/</span>
      <input type="number" placeholder="Max Score" min="1" value="100" required>
    </div>
    <div class="subject-action">
      <button type="button" class="remove-subject">
        <i class="fas fa-minus"></i>
      </button>
    </div>
  `};
    
   

    
  // Add event listener to remove button
  newRow.querySelector('.remove-subject').addEventListener('click', () => {
    container.removeChild(newRow);
    updateResultSummary();
  });
  
  // Add event listeners to inputs
  newRow.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', updateResultSummary);
  });
  
  // Add row to container
  container.appendChild(newRow);


// Initialize subject inputs
function initSubjectInputs() {
  // Add event listeners to initial inputs
  document.querySelectorAll('#subjects-container input').forEach(input => {
    input.addEventListener('input', updateResultSummary);
  });
  
  // Initial summary update
  updateResultSummary();
}

// Update result summary
function updateResultSummary() {
  const subjects = [];
  
  // Get all subject rows
  document.querySelectorAll('.subject-row').forEach(row => {
    const nameInput = row.querySelector('.subject-name input');
    const scoreInput = row.querySelector('.subject-score input');
    const maxInput = row.querySelector('.subject-max input');
    
    if (nameInput.value && scoreInput.value && maxInput.value) {
      subjects.push({
        subject: nameInput.value,
        score: Number(scoreInput.value),
        maxScore: Number(maxInput.value)
      });
    }
  });
  
  // Calculate totals
  const totalScore = subjects.reduce((sum, subject) => sum + subject.score, 0);
  const totalMaxScore = subjects.reduce((sum, subject) => sum + subject.maxScore, 0);
  const percentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
  
  // Calculate grade
  let grade = '';
  if (percentage >= 90) grade = 'A+';
  else if (percentage >= 80) grade = 'A';
  else if (percentage >= 70) grade = 'B';
  else if (percentage >= 60) grade = 'C';
  else if (percentage >= 50) grade = 'D';
  else grade = 'F';
  
  // Update summary
  document.getElementById('summary-total').textContent = `${totalScore}/${totalMaxScore}`;
  document.getElementById('summary-percentage').textContent = `${percentage.toFixed(2)}%`;
  document.getElementById('summary-grade').textContent = grade;
}

// Handle upload result form submission
async function handleUploadResult(e) {
  e.preventDefault();
  
  // Hide error message
  document.getElementById('upload-error').classList.add('hidden');
  
  // Get form data
  const studentId = document.getElementById('upload-student-id').value.trim();
  const studentName = document.getElementById('upload-student-name').value.trim();
  const examName = document.getElementById('exam-name').value.trim();
  
  // Validate form
  if (!studentId || !studentName || !examName) {
    showUploadError('Please fill in all required fields');
    return;
  }
  
  // Get subjects
  const subjects = [];
  let hasEmptySubject = false;
  
  document.querySelectorAll('.subject-row').forEach(row => {
    const nameInput = row.querySelector('.subject-name input');
    const scoreInput = row.querySelector('.subject-score input');
    const maxInput = row.querySelector('.subject-max input');
    
    if (!nameInput.value) {
      hasEmptySubject = true;
    }
    
    subjects.push({
      subject: nameInput.value,
      score: Number(scoreInput.value),
      maxScore: Number(maxInput.value)
    });
  });
  
  if (hasEmptySubject) {
    showUploadError('Please provide a name for all subjects');
    return;
  }
  
  // Calculate totals
  const totalScore = subjects.reduce((sum, subject) => sum + subject.score, 0);
  const totalMaxScore = subjects.reduce((sum, subject) => sum + subject.maxScore, 0);
  const percentage = (totalScore / totalMaxScore) * 100;
  
  // Calculate grade
  let grade = '';
  if (percentage >= 90) grade = 'A+';
  else if (percentage >= 80) grade = 'A';
  else if (percentage >= 70) grade = 'B';
  else if (percentage >= 60) grade = 'C';
  else if (percentage >= 50) grade = 'D';
  else grade = 'F';
  
  // Prepare result data
  const resultData = {
    name: studentName,
    marks: subjects,
    totalScore,
    totalMaxScore,
    percentage,
    grade
  };
  
  try {
    // Disable submit button
    const submitButton = document.getElementById('submit-result');
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
    
    // Upload to IPFS
    const ipfsHash = await uploadJSONToIPFS(resultData);
    
    // Upload to blockchain
    const tx = await state.contract.uploadResult(studentId, examName, ipfsHash);
    await tx.wait();
    
    // Show success message
    document.getElementById('tx-hash').textContent = tx.hash;
    document.getElementById('upload-form-container').classList.add('hidden');
    document.getElementById('upload-success').classList.remove('hidden');
    
    // Reset form
    document.getElementById('upload-result-form').reset();
    
    // Reset subjects
    const subjectsContainer = document.getElementById('subjects-container');
    const subjectRows = subjectsContainer.querySelectorAll('.subject-row');
    
    // Keep only the first row and clear its inputs
    for (let i = 1; i < subjectRows.length; i++) {
      subjectsContainer.removeChild(subjectRows[i]);
    }
    
    const firstRow = subjectRows[0];
    firstRow.querySelector('.subject-name input').value = '';
    firstRow.querySelector('.subject-score input').value = '';
    firstRow.querySelector('.subject-max input').value = '100';
    
    // Update summary
    updateResultSummary();
  } catch (error) {
    console.error('Error uploading result:', error);
    showUploadError('Error uploading result. Please try again.');
  } finally {
    // Re-enable submit button
    const submitButton = document.getElementById('submit-result');
    submitButton.disabled = false;
    submitButton.innerHTML = '<i class="fas fa-upload"></i> Upload Result';
  }
}

// Initialize Admin Page
function initAdminPage() {
  // Add teacher form
  document.getElementById('add-teacher-form').addEventListener('submit', handleAddTeacher);
  
  // Remove teacher form
  document.getElementById('remove-teacher-form').addEventListener('submit', handleRemoveTeacher);
}

// Check admin permissions
function checkAdminPermissions() {
  if (!state.isConnected || !state.isCorrectNetwork) {
    // Not connected or wrong network
    document.getElementById('admin-grid').classList.add('hidden');
    document.getElementById('admin-permission-error').classList.add('hidden');
    return;
  }
  
  if (!state.isAdmin) {
    // Not authorized
    document.getElementById('admin-grid').classList.add('hidden');
    document.getElementById('admin-permission-error').classList.remove('hidden');
  } else {
    // Authorized
    document.getElementById('admin-permission-error').classList.add('hidden');
    document.getElementById('admin-grid').classList.remove('hidden');
  }
}

// Handle add teacher form submission
async function handleAddTeacher(e) {
  e.preventDefault();
  
  // Get teacher address
  const teacherAddress = document.getElementById('teacher-address').value.trim();
  
  if (!teacherAddress) {
    showAdminMessage('Please enter a teacher address', 'error');
    return;
  }
  
  try {
    // Add teacher
    const tx = await state.contract.addTeacher(teacherAddress);
    await tx.wait();
    
    // Show success message
    showAdminMessage(`Teacher ${teacherAddress} added successfully`, 'success');
    
    // Reset form
    document.getElementById('add-teacher-form').reset();
  } catch (error) {
    console.error('Error adding teacher:', error);
    showAdminMessage('Error adding teacher. Please try again.', 'error');
  }
}

// Handle remove teacher form submission
async function handleRemoveTeacher(e) {
  e.preventDefault();
  
  // Get teacher address
  const teacherAddress = document.getElementById('remove-address').value.trim();
  
  if (!teacherAddress) {
    showAdminMessage('Please enter a teacher address', 'error');
    return;
  }
  
  try {
    // Remove teacher
    const tx = await state.contract.removeTeacher(teacherAddress);
    await tx.wait();
    
    // Show success message
    showAdminMessage(`Teacher ${teacherAddress} removed successfully`, 'success');
    
    // Reset form
    document.getElementById('remove-teacher-form').reset();
  } catch (error) {
    console.error('Error removing teacher:', error);
    showAdminMessage('Error removing teacher. Please try again.', 'error');
  }
}

// Show admin message
function showAdminMessage(message, type) {
  const messageElement = document.getElementById('admin-message');
  messageElement.textContent = message;
  messageElement.className = `message ${type}`;
  messageElement.classList.remove('hidden');
  
  // Hide message after 5 seconds
  setTimeout(() => {
    messageElement.classList.add('hidden');
  }, 5000);
}

// Show error message
function showError(message) {
  const errorElement = document.getElementById('error-message');
  errorElement.textContent = message;
  errorElement.classList.remove('hidden');
}

// Show upload error message
function showUploadError(message) {
  const errorElement = document.getElementById('upload-error');
  errorElement.textContent = message;
  errorElement.classList.remove('hidden');
}

// Upload JSON data to IPFS
async function uploadJSONToIPFS(data) {
  try {
    const jsonString = JSON.stringify(data);
    const buffer = new TextEncoder().encode(jsonString);
    const added = await state.ipfs.add(buffer);
    return added.path;
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error);
    throw error;
  }
}

// Get content from IPFS
async function getFromIPFS(cid) {
  try {
    const stream = state.ipfs.cat(cid);
    const decoder = new TextDecoder();
    let data = '';
    
    for await (const chunk of stream) {
      data += decoder.decode(chunk);
    }
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Error getting content from IPFS:', error);
    throw error;
  }
} 'error'