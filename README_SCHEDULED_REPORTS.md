# Polygon Smart Contract Monitoring with Scheduled Reports

This system provides **scheduled daily reports** for your Polygon smart contract without continuous blockchain monitoring, avoiding rate limiting issues.

## 🎯 **Features**

- **📊 Daily Reports**: Generated at 6am and 6pm daily
- **📈 Comprehensive Statistics**: 
  - Total certificates (all time)
  - Unique wallet addresses holding certificates
  - Certificates minted in the last 12 hours
  - Admin events in the last 12 hours
- **📱 Telegram Integration**: Reports sent directly to your Telegram
- **⚡ On-Demand Only**: No continuous blockchain monitoring
- **🔄 Automated**: Runs via cron job

## 🚀 **Quick Setup**

### 1. **Install Dependencies**
```bash
cd config/triggers/scripts
npm install
```

### 2. **Setup Automated Reports**
```bash
./scripts/setup_cron.sh
```

This will:
- Configure the cron job to run reports at 6am and 6pm daily
- Test the system to ensure it's working

### 3. **Test the System**
```bash
# Test the scheduled reports script
./scripts/scheduled_reports.sh

# Test the enhanced report directly
cd config/triggers/scripts && node enhanced_report.js
```

## 📋 **Configuration**

### **Contract Details**
- **Address**: `0x322A88614F19c5B18F96694b74f1eb74334c9B2e`
- **Network**: Polygon Mainnet
- **Telegram Bot**: `@ContractMonitoringBot`

### **Report Schedule**
- **Morning Report**: 6:00 AM daily
- **Evening Report**: 6:00 PM daily

## 📊 **Report Content**

Each report includes:

```
📊 Morning/Evening Certificate Report

Contract: 0x322A88614F19c5B18F96694b74f1eb74334c9B2e

📈 Statistics:
• Total Certificates (All Time): [count]
• Unique Wallet Addresses: [count]
• Certificates Minted (Last 12h): [count]

⏰ Time Window:
[12 hours ago] to [current time]

🕐 Generated: [timestamp]

👥 Admin Events (Last 12h):
• [number] admin-related events detected
• [or] No admin-related events detected

🎯 Recent Mints (Last 12h):
• [details of any mints in the period]
```

## 🔧 **Manual Operations**

### **Generate Report Now**
```bash
cd config/triggers/scripts
node enhanced_report.js
```

### **View Cron Jobs**
```bash
crontab -l
```

### **Edit Cron Jobs**
```bash
crontab -e
```

### **Remove Cron Job**
```bash
crontab -r  # Removes all cron jobs
# Then re-add only the ones you want
```

## 📁 **File Structure**

```
├── scripts/
│   ├── scheduled_reports.sh      # Main scheduled reports script
│   └── setup_cron.sh            # Setup script for cron
├── config/
│   └── triggers/
│       └── scripts/
│           ├── enhanced_report.js    # Enhanced report generator
│           └── package.json          # Node.js dependencies
└── README_SCHEDULED_REPORTS.md   # This file
```

## 🛠️ **Troubleshooting**

### **Report Not Generating**
1. Check if cron is running: `systemctl status cron`
2. Check cron logs: `tail -f /var/log/cron`
3. Test script manually: `./scripts/scheduled_reports.sh`

### **Telegram Not Receiving Messages**
1. Verify bot token is correct
2. Check if you've started the bot in Telegram
3. Test with: `curl -X POST "https://api.telegram.org/bot[TOKEN]/sendMessage" -d "chat_id=[CHAT_ID]&text=test"`

### **Blockchain Connection Issues**
1. Check internet connection
2. Verify Polygon RPC endpoint is accessible
3. The script includes retry logic for temporary failures

## 🔒 **Security Notes**

- Bot token is stored in the script (consider using environment variables)
- Script runs with your user permissions
- No sensitive data is logged

## 📈 **Performance**

- **Report Generation**: ~10-30 seconds
- **Blockchain Queries**: Only when generating reports
- **Rate Limiting**: Avoided by not monitoring continuously
- **Storage**: Minimal (only script files)

## 🔄 **Updates**

To update the system:
1. Pull latest changes: `git pull`
2. Update dependencies: `cd config/triggers/scripts && npm install`
3. Test: `./scripts/scheduled_reports.sh`

---

**✅ System Status**: Ready for production use
**📱 Telegram**: Connected and tested
**⏰ Schedule**: 6am and 6pm daily reports
**🔧 Monitoring**: On-demand only (no continuous monitoring) 