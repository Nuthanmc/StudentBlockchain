# Student Result Monitoring System Using Blockchain Technology on Polygon

This project implements a secure and transparent system for managing student academic results using blockchain technology on the Polygon network.

## Features

- **Immutable Records**: Once uploaded to the blockchain, result records cannot be altered or tampered with.
- **Decentralized Storage**: Results are stored on the Polygon blockchain and IPFS.
- **Role-Based Access Control**: Only authorized teachers and administrators can upload results.
- **Verification System**: Students can verify the authenticity of their results.
- **MetaMask Integration**: Secure authentication using Web3 wallets.

## Technology Stack

- **Blockchain**: Polygon (Mumbai Testnet/Mainnet)
- **Smart Contracts**: Solidity
- **Frontend**: React, TypeScript, Tailwind CSS
- **Web3 Integration**: ethers.js, Web3Modal
- **Decentralized Storage**: IPFS via Infura
- **Development Tools**: Hardhat, Vite

## Getting Started

### Prerequisites

- Node.js and npm
- MetaMask browser extension
- Polygon Mumbai Testnet account with MATIC tokens (for testing)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/student-result-blockchain.git
   cd student-result-blockchain
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example` and fill in your configuration:
   ```
   cp .env.example .env
   ```

4. Compile the smart contracts:
   ```
   npm run compile
   ```

5. Deploy the smart contracts to Mumbai Testnet:
   ```
   npm run deploy:mumbai
   ```

6. Update the contract address in your `.env` file:
   ```
   VITE_CONTRACT_ADDRESS=your_deployed_contract_address
   ```

7. Start the development server:
   ```
   npm run dev
   ```

## Usage

### For Administrators

1. Connect your MetaMask wallet (must be the deployer of the contract)
2. Navigate to the Admin Panel to add or remove teachers

### For Teachers

1. Connect your MetaMask wallet (must be authorized by an admin)
2. Navigate to the Upload Results page to add new student results

### For Students

1. Navigate to the View Results page
2. Enter your student ID to view your results
3. Verify the authenticity of results using blockchain verification

## Smart Contract Architecture

The system uses a single smart contract (`StudentResultSystem.sol`) that implements:

- Role-based access control (Admin and Teacher roles)
- Result storage and retrieval functions
- Verification mechanisms

## License

This project is licensed under the MIT License - see the LICENSE file for details.
