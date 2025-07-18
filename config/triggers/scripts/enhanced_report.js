#!/usr/bin/env node

const { ethers } = require('ethers');
const { execSync } = require('child_process');

const CONTRACT_ADDRESS = '0x322A88614F19c5B18F96694b74f1eb74334c9B2e';
const RPC_URL = 'https://polygon-rpc.com/';
const TELEGRAM_BOT_TOKEN = '7629593696:AAFY3BGRiK0HgC7tN7c6ALFlwRiqCFuRj3E';
const TELEGRAM_CHAT_ID = '5387351914';

function sendTelegramMessage(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const data = JSON.stringify({
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: 'MarkdownV2'
  });

  try {
    const result = execSync(`curl -X POST "${url}" -H "Content-Type: application/json" -d '${data}'`, { encoding: 'utf8' });
    const response = JSON.parse(result);
    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.description}`);
    }
    return response;
  } catch (error) {
    console.error('Failed to send Telegram message:', error.message);
    throw error;
  }
}

function escapeMarkdown(text) {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}

async function getCertificatesMintedInTimeWindow(provider, startTime, endTime) {
  try {
    // Get current block number
    const latestBlock = await provider.getBlockNumber();
    
    // Estimate blocks to look back (assuming ~2 second block time on Polygon)
    const blocksToLookBack = Math.ceil((endTime - startTime) / 2);
    const fromBlock = Math.max(0, latestBlock - blocksToLookBack);
    
    console.log(`Looking for Transfer events from block ${fromBlock} to ${latestBlock}`);
    
    // Transfer event signature: Transfer(address,address,uint256)
    const transferEventSignature = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
    
    const logs = await provider.getLogs({
      address: CONTRACT_ADDRESS,
      topics: [transferEventSignature],
      fromBlock: fromBlock,
      toBlock: latestBlock
    });
    
    console.log(`Found ${logs.length} Transfer events`);
    
    let mintedInWindow = 0;
    const mintEvents = [];
    
    for (const log of logs) {
      try {
        // Get block timestamp
        const block = await provider.getBlock(log.blockNumber);
        const blockTime = block.timestamp;
        
        // Check if this event is within our time window
        if (blockTime >= startTime && blockTime <= endTime) {
          // Decode the Transfer event
          // topics[0] = event signature
          // topics[1] = from address (indexed)
          // topics[2] = to address (indexed)
          // data = value (uint256)
          
          const fromAddress = '0x' + log.topics[1].slice(-40);
          const toAddress = '0x' + log.topics[2].slice(-40);
          const value = ethers.getBigInt(log.data);
          
          // If from address is 0x0000..., it's a mint
          if (fromAddress === '0x0000000000000000000000000000000000000000') {
            mintedInWindow++;
            mintEvents.push({
              to: toAddress,
              value: value.toString(),
              blockNumber: log.blockNumber,
              timestamp: blockTime
            });
          }
        }
      } catch (error) {
        console.log(`Error processing log: ${error.message}`);
      }
    }
    
    return { mintedInWindow, mintEvents };
  } catch (error) {
    console.error('Error getting minted certificates:', error.message);
    return { mintedInWindow: 0, mintEvents: [] };
  }
}

async function getAdminEventsInTimeWindow(provider, startTime, endTime) {
  try {
    const latestBlock = await provider.getBlockNumber();
    const blocksToLookBack = Math.ceil((endTime - startTime) / 2);
    const fromBlock = Math.max(0, latestBlock - blocksToLookBack);
    
    console.log(`Looking for admin events from block ${fromBlock} to ${latestBlock}`);
    
    // Get all events from the contract in the time window
    const logs = await provider.getLogs({
      address: CONTRACT_ADDRESS,
      fromBlock: fromBlock,
      toBlock: latestBlock
    });
    
    console.log(`Found ${logs.length} total events`);
    
    const adminEvents = [];
    
    for (const log of logs) {
      try {
        const block = await provider.getBlock(log.blockNumber);
        const blockTime = block.timestamp;
        
        if (blockTime >= startTime && blockTime <= endTime) {
          // Look for events that might be admin-related
          // Common admin event signatures
          const adminEventSignatures = [
            '0x704b6c02', // setAdmin
            '0x8f283970', // removeAdmin
            '0x24d7806c', // AdminAdded
            '0x7d3e3dbe', // AdminRemoved
            '0xe9523c97'  // AdminSet
          ];
          
          if (adminEventSignatures.includes(log.topics[0])) {
            adminEvents.push({
              eventSignature: log.topics[0],
              blockNumber: log.blockNumber,
              timestamp: blockTime,
              data: log.data,
              topics: log.topics
            });
          }
        }
      } catch (error) {
        console.log(`Error processing admin log: ${error.message}`);
      }
    }
    
    return adminEvents;
  } catch (error) {
    console.error('Error getting admin events:', error.message);
    return [];
  }
}

async function generateEnhancedReport() {
  try {
    console.log('🔍 Generating enhanced scheduled report...');
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // Get current time and calculate time window (last 12 hours)
    const now = Math.floor(Date.now() / 1000);
    const twelveHoursAgo = now - (12 * 60 * 60);
    
    // Get basic contract data
    const totalSupplyCall = await provider.call({
      to: CONTRACT_ADDRESS,
      data: '0x18160ddd' // totalSupply()
    });
    
    const ownerCall = await provider.call({
      to: CONTRACT_ADDRESS,
      data: '0x8da5cb5b' // owner()
    });

    const totalSupply = ethers.getBigInt(totalSupplyCall);
    const ownerHex = ownerCall.slice(-40);
    const owner = '0x' + ownerHex;

    console.log('📊 Basic contract data retrieved:');
    console.log(`- Total Supply: ${totalSupply.toString()}`);
    console.log(`- Owner: ${owner}`);
    
    // Get certificates minted in the last 12 hours
    const { mintedInWindow, mintEvents } = await getCertificatesMintedInTimeWindow(provider, twelveHoursAgo, now);
    
    // Get admin events in the last 12 hours
    const adminEvents = await getAdminEventsInTimeWindow(provider, twelveHoursAgo, now);
    
    // Determine report type
    const reportType = new Date().getHours() >= 12 ? 'Evening' : 'Morning';
    
    // Format time window
    const timeWindowStart = new Date(twelveHoursAgo * 1000).toLocaleString();
    const timeWindowEnd = new Date(now * 1000).toLocaleString();
    
    // Create the message
    let message = `📊 *${reportType} Certificate Report*

*Contract:* \`${CONTRACT_ADDRESS}\`

*📈 Statistics:*
• Total Certificates \\(All Time\\): \`${totalSupply.toString()}\`
• Certificates Minted \\(Last 12h\\): \`${mintedInWindow}\`

*👤 Contract Owner:*
• \`${owner.toLowerCase()}\`

*⏰ Time Window:*
${escapeMarkdown(timeWindowStart)} to ${escapeMarkdown(timeWindowEnd)}

*🕐 Generated:* ${escapeMarkdown(new Date().toLocaleString())}`;

    // Add admin events if any found
    if (adminEvents.length > 0) {
      message += `\n\n*👥 Admin Events \\(Last 12h\\):*
• ${adminEvents.length} admin\\-related events detected`;
      
      adminEvents.forEach((event, index) => {
        message += `\n• Event ${index + 1}: ${event.eventSignature} at block ${event.blockNumber}`;
      });
    } else {
      message += `\n\n*👥 Admin Events \\(Last 12h\\):*
• No admin\\-related events detected`;
    }

    // Add minting details if any
    if (mintEvents.length > 0) {
      message += `\n\n*🎯 Recent Mints \\(Last 12h\\):*
• ${mintEvents.length} certificates minted`;
      
      mintEvents.forEach((mint, index) => {
        message += `\n• Mint ${index + 1}: ${mint.value} to ${mint.to.slice(0, 10)}...`;
      });
    }

    console.log('📱 Sending Telegram message...');
    
    // Send via Telegram using curl
    sendTelegramMessage(message);
    console.log('✅ Enhanced scheduled report sent successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating/sending report:', error.message);
    process.exit(1);
  }
}

generateEnhancedReport(); 