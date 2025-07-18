#!/usr/bin/env node

const { ethers } = require('ethers');

// Contract ABI for the functions we need
const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "getAllAdmins",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalCertificates",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "startTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "endTime",
        "type": "uint256"
      }
    ],
    "name": "getCertificatesInTimeWindow",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const CONTRACT_ADDRESS = '0x322A88614F19c5B18F96694b74f1eb74334c9B2e';
const RPC_URL = 'https://polygon-rpc.com/';

async function generateScheduledReport() {
  try {
    // Connect to Polygon network
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    // Get current time and calculate time window (last 12 hours)
    const now = Math.floor(Date.now() / 1000);
    const twelveHoursAgo = now - (12 * 60 * 60);
    
    // Fetch data from contract
    const [admins, totalCerts, windowCerts] = await Promise.all([
      contract.getAllAdmins(),
      contract.totalCertificates(),
      contract.getCertificatesInTimeWindow(twelveHoursAgo, now)
    ]);

    // Format the report
    const report = {
      timestamp: new Date().toISOString(),
      timeWindow: {
        start: new Date(twelveHoursAgo * 1000).toISOString(),
        end: new Date(now * 1000).toISOString()
      },
      admins: admins.map(admin => admin.toLowerCase()),
      totalCertificates: totalCerts.toString(),
      certificatesInWindow: windowCerts.toString(),
      reportType: new Date().getHours() >= 12 ? 'Evening' : 'Morning'
    };

    console.log(JSON.stringify(report));
    process.exit(0);
  } catch (error) {
    console.error('Error generating report:', error.message);
    process.exit(1);
  }
}

generateScheduledReport(); 