<<<<<<< HEAD
# StudentBlockchain - Secure Student Result Management  

## Overview  
StudentBlockchain is a blockchain-based system for securely managing and verifying student academic results. Built on the Polygon network, it ensures transparency, security, and immutability of academic records.  

## Features  
- Secure student result storage on the blockchain.  
- Immutable and tamper-proof record verification.  
- Smart contract-based automation for result validation.  
- Decentralized and transparent access.  

## Tech Stack  
- Frontend: HTML, CSS, JavaScript  
- Backend: Node.js, Express.js  
- Blockchain: Solidity (Smart Contracts), Polygon Mumbai Testnet  
- Storage: IPFS (for storing result hashes)  
- Testing: Hardhat, Mocha, Chai  
- Deployment: GitHub Actions CI/CD, Hardhat  

## Prerequisites  
- Node.js (>=14.x)  
- MetaMask Extension (Chrome/Firefox)  
- Hardhat (npx hardhat)  
- Polygon Mumbai Testnet Faucet ([Get free MATIC](https://faucet.polygon.technology/))  

## Setup Guide  

### Step 1: Clone Repository  
```sh  
git clone https://github.com/Nuthanmc/StudentBlockchain.git  
cd StudentBlockchain  
```  

### Step 2: Install Dependencies  
```sh  
npm install  
```  

### Step 3: Configure Environment Variables  
Create a `.env` file in the root directory and add the following:  

```ini  
PRIVATE_KEY=your_wallet_private_key  
INFURA_API_KEY=your_infura_project_id  
POLYGONSCAN_API_KEY=your_polygonscan_api_key  
```  

Do not share your private key. Use environment variables for security.  

### Step 4: Compile Smart Contracts  
```sh  
npx hardhat compile  
```  

### Step 5: Deploy Smart Contracts  
```sh  
npx hardhat run scripts/deploy.js --network mumbai  
```  
Save the deployed contract address.  

### Step 6: Run the Frontend  
```sh  
npm run dev  
```  
Access the app at `http://localhost:3000`.  

## Testing  
To run unit tests:  
```sh  
npx hardhat test  
```  

## Security Measures  
- Sensitive data stored in `.env` (not in code).  
- MetaMask authentication for transactions.  
- Input validation to prevent injection attacks.  

## CI/CD - Automated Deployment  
- GitHub Actions configured for contract deployment.  
- Auto-linting and testing before merging PRs.  

## License  
MIT License  
=======

>>>>>>> 484bf59 (Testing Phase)
