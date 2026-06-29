#!/usr/bin/env bash
set -euo pipefail

echo "==> Setting up Shorts Factory for OCI..."

# Check if running on Ubuntu/Debian
if ! command -v apt-get &> /dev/null; then
  echo "Warning: This script is designed for Ubuntu/Debian. Adapt as needed."
fi

# Install FFmpeg
echo "==> Installing FFmpeg..."
if ! command -v ffmpeg &> /dev/null; then
  sudo apt-get update
  sudo apt-get install -y ffmpeg
else
  echo "FFmpeg already installed: $(ffmpeg -version | head -n1)"
fi

# Install Xvfb for headless display
echo "==> Installing Xvfb..."
if ! command -v xvfb-run &> /dev/null; then
  sudo apt-get install -y xvfb
else
  echo "Xvfb already installed"
fi

# Install Node.js dependencies for the factory script
echo "==> Installing Node.js dependencies..."
pnpm add playwright axios

# Install Playwright browsers
echo "==> Installing Playwright Chromium browser..."
npx playwright install chromium

# Install Playwright system dependencies
echo "==> Installing Playwright system dependencies..."
npx playwright install-deps chromium

# Create required directories
echo "==> Creating directories..."
cd "$(dirname "$0")/../.."
mkdir -p raw_captures
mkdir -p output
mkdir -p logs

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  cat > .env <<'ENVEOF'
SHORTS_CDN_URL=SET_ME
POSTIZ_BASE_URL=https://postiz.arcadeum.games/api/public/v1
POSTIZ_API_KEY=SET_ME
POSTIZ_YOUTUBE_INTEGRATION_ID=SET_ME
ENVEOF
  echo "Created .env file — edit it and fill in POSTIZ_API_KEY and POSTIZ_YOUTUBE_INTEGRATION_ID"
  echo "Get API key from: https://postiz.arcadeum.games -> Settings -> API Keys"
  echo "Get integration ID from: https://postiz.arcadeum.games -> Integrations -> YouTube"
fi

# Create wrapper script with random delay
echo "==> Creating wrapper script with random delay..."
sudo tee /opt/arcadeum/scripts/shorts-factory-random.sh > /dev/null <<'EOF'
#!/usr/bin/env bash
# Random delay between 4pm-6pm (0-7200 seconds)
DELAY=$(( RANDOM % 7200 ))
echo "[$(date)] Waiting ${DELAY} seconds before running shorts factory..."
sleep $DELAY
cd /opt/arcadeum
exec node scripts/shorts-factory/factory.js
EOF
sudo chmod +x /opt/arcadeum/scripts/shorts-factory-random.sh

# Create systemd service for daily execution
echo "==> Creating systemd service..."
sudo tee /etc/systemd/system/shorts-factory.service > /dev/null <<EOF
[Unit]
Description=Arcadeum Shorts Factory
After=network.target

[Service]
Type=oneshot
WorkingDirectory=/opt/arcadeum
ExecStart=/usr/bin/xvfb-run /opt/arcadeum/scripts/shorts-factory-random.sh
Environment=NODE_ENV=production
StandardOutput=append:/opt/arcadeum/logs/shorts-factory.log
StandardError=append:/opt/arcadeum/logs/shorts-factory-error.log

[Install]
WantedBy=multi-user.target
EOF

# Create systemd timer for daily execution (runs at 4pm, random delay added by script)
echo "==> Creating systemd timer..."
sudo tee /etc/systemd/system/shorts-factory.timer > /dev/null <<EOF
[Unit]
Description=Run Shorts Factory daily (4pm-6pm)

[Timer]
OnCalendar=*-*-* 16:00:00
Persistent=true

[Install]
WantedBy=timers.target
EOF

# Enable and start the timer
sudo systemctl daemon-reload
sudo systemctl enable shorts-factory.timer
sudo systemctl start shorts-factory.timer

echo ""
echo "============================================"
echo "  Shorts Factory Setup Complete"
echo "============================================"
echo ""
echo "Cron job configured via systemd timer:"
echo "  - Runs daily between 4pm-6pm (random delay)"
echo "  - sudo systemctl status shorts-factory.timer"
echo ""
echo "To run manually:"
echo "  node scripts/shorts-factory/factory.js"
echo ""
echo "To run with xvfb (headless display):"
echo "  xvfb-run node scripts/shorts-factory/factory.js"
echo ""
echo "To view logs:"
echo "  tail -f logs/shorts-factory.log"
echo ""
echo "To configure Postiz API:"
echo "  Edit .env file and set POSTIZ_API_KEY"
echo ""
echo "To configure CDN URL for music:"
echo "  Edit .env file and set SHORTS_CDN_URL"
echo ""
