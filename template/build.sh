#!/bin/bash

# Bible RPG Template Build Script
# Version: 1.0.0
# Description: Simple build script for optimizing template files

set -e

# Configuration
VERSION="1.0.0"
BUILD_DIR="dist"
TEMPLATE_DIR="."

echo "🏗️  Building Bible RPG Template v${VERSION}"

# Clean previous build
if [ -d "$BUILD_DIR" ]; then
    echo "🧹 Cleaning previous build..."
    rm -rf "$BUILD_DIR"
fi

# Create build directory
mkdir -p "$BUILD_DIR"

# Copy template files
echo "📁 Copying template files..."
cp -r css js assets docs manifest.json sw.js index.html "$BUILD_DIR/"

# Update version placeholders
echo "🔄 Updating version placeholders..."
find "$BUILD_DIR" -type f \( -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "*.json" \) -exec sed -i.bak "s/{{VERSION}}/${VERSION}/g" {} \;

# Update current year
CURRENT_YEAR=$(date +%Y)
find "$BUILD_DIR" -type f \( -name "*.html" -o -name "*.js" -o -name "*.css" \) -exec sed -i.bak "s/{{CURRENT_YEAR}}/${CURRENT_YEAR}/g" {} \;

# Remove backup files
find "$BUILD_DIR" -name "*.bak" -delete

# Create cache manifest for service worker
echo "📋 Creating cache manifest..."
cat > "$BUILD_DIR/cache-manifest.json" << EOF
{
  "version": "$VERSION",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "files": [
$(find "$BUILD_DIR" -type f \( -name "*.html" -o -name "*.css" -o -name "*.js" -o -name "*.png" -o -name "*.jpg" -o -name "*.json" \) ! -name "cache-manifest.json" | sed 's|'"$BUILD_DIR"'/|    "./|g' | sed 's/$/",/' | sed '$s/,$//')
  ]
}
EOF

# Create version info file
echo "ℹ️  Creating version info..."
cat > "$BUILD_DIR/version.json" << EOF
{
  "version": "$VERSION",
  "buildDate": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "gitCommit": "$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')",
  "buildEnvironment": "production"
}
EOF

# Simple CSS minification (remove comments and extra whitespace)
echo "🎨 Optimizing CSS files..."
for css_file in "$BUILD_DIR"/css/*.css; do
    if [ -f "$css_file" ]; then
        # Remove comments and minimize whitespace
        sed -i.bak -e 's|/\*[^*]*\*\+\([^/*][^*]*\*\+\)*/||g' \
                   -e 's/[[:space:]]\+/ /g' \
                   -e 's/; /;/g' \
                   -e 's/: /:/g' \
                   -e 's/ {/{/g' \
                   -e 's/{ /{/g' \
                   -e 's/ }/}/g' \
                   "$css_file"
        rm "${css_file}.bak"
    fi
done

# Simple JS optimization (remove comments and extra whitespace)
echo "⚡ Optimizing JavaScript files..."
for js_file in "$BUILD_DIR"/js/*.min.js; do
    if [ -f "$js_file" ]; then
        # Remove single-line comments and minimize whitespace
        sed -i.bak -e 's|//.*$||g' \
                   -e '/^[[:space:]]*$/d' \
                   -e 's/[[:space:]]\+/ /g' \
                   "$js_file"
        rm "${js_file}.bak"
    fi
done

# Generate integrity hashes for critical files
echo "🔐 Generating file integrity hashes..."
for file in "$BUILD_DIR"/css/critical.css "$BUILD_DIR"/js/main.min.js; do
    if [ -f "$file" ]; then
        hash=$(openssl dgst -sha384 -binary "$file" | openssl base64 -A)
        filename=$(basename "$file")
        echo "  $filename: sha384-$hash"
    fi
done

# Create simple performance budget check
echo "📊 Checking performance budget..."
total_css_size=$(find "$BUILD_DIR"/css -name "*.css" -exec cat {} \; | wc -c)
total_js_size=$(find "$BUILD_DIR"/js -name "*.min.js" -exec cat {} \; | wc -c)

echo "  CSS size: $(echo "scale=1; $total_css_size/1024" | bc)KB"
echo "  JS size: $(echo "scale=1; $total_js_size/1024" | bc)KB"

# Check if sizes are reasonable
if [ $total_css_size -gt 51200 ]; then  # 50KB
    echo "⚠️  Warning: CSS bundle is larger than 50KB"
fi

if [ $total_js_size -gt 204800 ]; then  # 200KB
    echo "⚠️  Warning: JavaScript bundle is larger than 200KB"
fi

# Create deployment README
echo "📝 Creating deployment guide..."
cat > "$BUILD_DIR/DEPLOY.md" << EOF
# Deployment Guide

## Quick Start
1. Upload all files to your web server
2. Ensure HTTPS is configured
3. Set proper cache headers
4. Test on mobile devices

## Cache Headers (Apache .htaccess example)
\`\`\`apache
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
</IfModule>

<IfModule mod_headers.c>
    <FilesMatch "\.(css|js|png|jpg|jpeg|gif|webp)$">
        Header set Cache-Control "public, max-age=31536000"
    </FilesMatch>
</IfModule>
\`\`\`

## Security Headers
\`\`\`apache
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
\`\`\`

## Content Compression
Enable gzip/brotli compression for all text files.

## Built: $(date)
## Version: $VERSION
EOF

echo "✅ Build complete! Files are in the '$BUILD_DIR' directory."
echo ""
echo "Next steps:"
echo "1. Test the built files locally"
echo "2. Run accessibility and performance audits"
echo "3. Deploy to your hosting platform"
echo "4. Configure cache headers and compression"