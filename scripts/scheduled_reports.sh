#!/bin/bash

# Scheduled Reports Script
# This script generates and sends scheduled reports at 6am and 6pm daily
# Should be run via cron: 0 6,18 * * * /path/to/scripts/scheduled_reports.sh

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Change to project directory
cd "$PROJECT_DIR"

# Check if it's the right time to run reports (6am or 6pm)
CURRENT_HOUR=$(date +%H)

if [ "$CURRENT_HOUR" = "06" ] || [ "$CURRENT_HOUR" = "18" ]; then
    echo "Scheduled report time - generating report..."
    
    # Run the enhanced report script
    if [ -f "config/triggers/scripts/enhanced_report.js" ]; then
        cd config/triggers/scripts
        node enhanced_report.js
        EXIT_CODE=$?
        
        if [ $EXIT_CODE -eq 0 ]; then
            echo "✅ Scheduled report generated and sent successfully"
        else
            echo "❌ Failed to generate scheduled report"
            exit 1
        fi
    else
        echo "❌ Enhanced report script not found"
        exit 1
    fi
else
    echo "Not scheduled report time (current hour: $CURRENT_HOUR) - skipping"
    exit 0
fi 