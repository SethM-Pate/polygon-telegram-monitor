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
const TELEGRAM_BOT_TOKEN = '7629593696:AAFY3BGRiK0HgC7tN7c6ALFlwRiqCFuRj3E';
const TELEGRAM_CHAT_ID = '5387351914';

async function sendTelegramMessage(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const data = {
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: 'MarkdownV2'
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    if (!result.ok) {
      throw new Error(`Telegram API error: ${result.description}`);
    }
    return result;
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    throw error;
  }
}

function escapeMarkdown(text) {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}

async function generateAndSendScheduledReport() {
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

    // Format admin addresses
    const adminList = admins.map(admin => `• \`${admin.toLowerCase()}\``).join('\n');
    
    // Determine report type
    const reportType = new Date().getHours() >= 12 ? 'Evening' : 'Morning';
    
    // Format time window
    const timeWindowStart = new Date(twelveHoursAgo * 1000).toLocaleString();
    const timeWindowEnd = new Date(now * 1000).toLocaleString();
    
    // Create the message
    const message = `📊 *${reportType} Certificate Report*

*Contract:* \`${CONTRACT_ADDRESS}\`

*📈 Statistics:*
• Total Certificates \\(All Time\\): \`${totalCerts.toString()}\`
• Certificates \\(Last 12h\\): \`${windowCerts.toString()}\`

*👥 Admin Addresses:*
${adminList}

*⏰ Time Window:*
${escapeMarkdown(timeWindowStart)} to ${escapeMarkdown(timeWindowEnd)}

*🕐 Generated:* ${escapeMarkdown(new Date().toLocaleString())}`;

    // Send via Telegram
    await sendTelegramMessage(message);
    console.log('Scheduled report sent successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error generating/sending report:', error.message);
    process.exit(1);
  }
}

generateAndSendScheduledReport(); 