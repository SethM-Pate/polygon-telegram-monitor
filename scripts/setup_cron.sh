#!/bin/bash

# Setup script for scheduled reports
# This script helps configure the cron job for automated reports

echo "🔧 Setting up scheduled reports..."

# Get the absolute path to the scheduled reports script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SCHEDULED_REPORTS_SCRIPT="$PROJECT_DIR/scripts/scheduled_reports.sh"

echo "📁 Project directory: $PROJECT_DIR"
echo "📄 Scheduled reports script: $SCHEDULED_REPORTS_SCRIPT"

# Check if the script exists
if [ ! -f "$SCHEDULED_REPORTS_SCRIPT" ]; then
    echo "❌ Scheduled reports script not found!"
    exit 1
fi

# Make sure the script is executable
chmod +x "$SCHEDULED_REPORTS_SCRIPT"

echo "✅ Script is executable"

# Show the cron command that should be added
echo ""
echo "📅 To set up automated reports, add this line to your crontab:"
echo "   (Run 'crontab -e' to edit your crontab)"
echo ""
echo "   0 6,18 * * * $SCHEDULED_REPORTS_SCRIPT"
echo ""
echo "This will run reports at 6:00 AM and 6:00 PM daily."
echo ""

# Ask if user wants to add it automatically
read -p "Would you like to add this to your crontab automatically? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Check if the cron job already exists
    if crontab -l 2>/dev/null | grep -q "$SCHEDULED_REPORTS_SCRIPT"; then
        echo "⚠️  Cron job already exists. Skipping..."
    else
        # Add the cron job
        (crontab -l 2>/dev/null; echo "0 6,18 * * * $SCHEDULED_REPORTS_SCRIPT") | crontab -
        echo "✅ Cron job added successfully!"
    fi
else
    echo "📝 Please add the cron job manually when ready."
fi

echo ""
echo "🧪 To test the scheduled reports script, run:"
echo "   $SCHEDULED_REPORTS_SCRIPT"
echo ""
echo "📋 To view your current crontab:"
echo "   crontab -l"
echo ""
echo "�� Setup complete!" 