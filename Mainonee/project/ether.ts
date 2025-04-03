const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS as string;
const PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY as string;
const RPC_URL = process.env.BLOCKCHAIN_RPC_URL as string;

if (!CONTRACT_ADDRESS || !PRIVATE_KEY || !RPC_URL) {
    throw new Error("Missing environment variables. Check .env file.");
}
