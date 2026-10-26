#!/bin/bash
# ==============================================================================
# cPanel Deployment Script for thttcms.triphimalaya.com.np
# Server Home: /home8/triphima
# Target Root: /home8/triphima/thttcms.triphimalaya.com.np
# ==============================================================================

set -e

DEPLOYPATH="${DEPLOYPATH:-/home8/triphima/thttcms.triphimalaya.com.np}"
echo "Deploying to: $DEPLOYPATH"
/bin/mkdir -p "$DEPLOYPATH"

# Load NVM or Node if available in cPanel environment
if [ -s "$HOME/.nvm/nvm.sh" ]; then
    . "$HOME/.nvm/nvm.sh"
fi

# Build if npm is available
if command -v npm >/dev/null 2>&1; then
    echo "Node/npm detected. Building production assets..."
    npm install --silent
    npm run build
fi

# Copy production assets to the target document root
if [ -d "dist" ]; then
    echo "Copying files from dist/ to $DEPLOYPATH..."
    /bin/cp -a dist/. "$DEPLOYPATH/"
else
    echo "ERROR: 'dist' folder not found and npm was not available to build."
    echo "Please build locally with 'npm run build' before pushing."
    exit 1
fi

# Ensure .htaccess is in place for React Router routing
if [ -f "dist/.htaccess" ]; then
    /bin/cp -f dist/.htaccess "$DEPLOYPATH/.htaccess"
    /bin/chmod 644 "$DEPLOYPATH/.htaccess" 2>/dev/null || true
elif [ -f "public/.htaccess" ]; then
    /bin/cp -f public/.htaccess "$DEPLOYPATH/.htaccess"
    /bin/chmod 644 "$DEPLOYPATH/.htaccess" 2>/dev/null || true
fi

echo "=== Deployment to thttcms.triphimalaya.com.np completed successfully! ==="
