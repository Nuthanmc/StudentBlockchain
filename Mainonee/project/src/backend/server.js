import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve('D:/Std Result Blockchain/Mainonee/project/src/backend/.env') });

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;

// Validate environment variables
if (!CONTRACT_ADDRESS || !PRIVATE_KEY || !RPC_URL) {
    throw new Error("❌ Missing required environment variables (CONTRACT_ADDRESS, PRIVATE_KEY, RPC_URL)");
}

console.log("PRIVATE_KEY Loaded:", PRIVATE_KEY ? "✔️ Yes" : "❌ No");

// Ensure private key is properly formatted
const trimmedPrivateKey = PRIVATE_KEY.trim();

// Connect to blockchain
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(trimmedPrivateKey, provider);

// Load contract ABI
const ABI_PATH = path.resolve('D:/Std Result Blockchain/Mainonee/project/src/backend/contractABI.json');

if (!fs.existsSync(ABI_PATH)) {
    throw new Error(`❌ ABI file not found: ${ABI_PATH}`);
}

const CONTRACT_ABI = JSON.parse(fs.readFileSync(ABI_PATH, 'utf-8'));

// Create contract instance
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

// Define path for teachers.json
const teachersFilePath = path.resolve('D:/Std Result Blockchain/Mainonee/project/src/backend/teachers.json');

// Utility function to read teachers.json safely
const readTeachersFile = () => {
    try {
        if (!fs.existsSync(teachersFilePath)) return [];
        const data = fs.readFileSync(teachersFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading teachers.json:", error);
        return [];
    }
};

// Utility function to write to teachers.json safely
const writeTeachersFile = (data) => {
    try {
        fs.writeFileSync(teachersFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error writing to teachers.json:", error);
    }
};

// API to Add a Teacher
app.post('/add-teacher', async (req, res) => {
    const { teacherAddress } = req.body;

    if (!ethers.isAddress(teacherAddress)) {
        return res.status(400).json({ error: "Invalid Ethereum address" });
    }

    try {
        const tx = await contract.addTeacher(teacherAddress);
        await tx.wait();

        // Update teachers.json
        let teachers = readTeachersFile();
        if (!teachers.includes(teacherAddress)) {
            teachers.push(teacherAddress);
            writeTeachersFile(teachers);
        }

        res.json({ success: true, message: `✅ Teacher ${teacherAddress} added successfully` });
    } catch (error) {
        console.error("Error adding teacher:", error);
        res.status(500).json({ error: "❌ Error adding teacher. Check logs." });
    }
});

// API to Remove a Teacher
app.post('/remove-teacher', async (req, res) => {
    const { teacherAddress } = req.body;

    if (!ethers.isAddress(teacherAddress)) {
        return res.status(400).json({ error: "Invalid Ethereum address" });
    }

    try {
        const tx = await contract.removeTeacher(teacherAddress);
        await tx.wait();

        // Update teachers.json
        let teachers = readTeachersFile();
        teachers = teachers.filter(addr => addr !== teacherAddress);
        writeTeachersFile(teachers);

        res.json({ success: true, message: `✅ Teacher ${teacherAddress} removed successfully` });
    } catch (error) {
        console.error("Error removing teacher:", error);
        res.status(500).json({ error: "❌ Error removing teacher. Check logs." });
    }
});

// Server Start
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
