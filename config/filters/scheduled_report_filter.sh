#!/bin/bash

# Scheduled Report Filter
# This script triggers reports at 6am and 6pm daily

# Get current hour (0-23)
CURRENT_HOUR=$(date +%H)

# Check if it's 6am (06) or 6pm (18)
if [ "$CURRENT_HOUR" = "06" ] || [ "$CURRENT_HOUR" = "18" ]; then
    echo "Scheduled report time - proceeding with report generation"
    exit 0
else
    echo "Not scheduled report time - skipping"
    exit 1
fi 