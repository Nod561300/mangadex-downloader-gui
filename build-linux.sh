#!/bin/bash

# Build MangaDex Downloader GUI for Linux (DEB)
# Run: bash build-linux.sh

set -e

echo "🚀 Building MangaDex Downloader GUI for Linux (DEB)..."
echo ""

# Detect Linux distribution
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VERSION=$VERSION_ID
else
    echo "❌ Could not detect Linux distribution"
    exit 1
fi

echo "📋 Checking prerequisites..."
echo "   OS: $OS $VERSION"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js $NODE_VERSION"
else
    echo "❌ Node.js not found. Please install from https://nodejs.org/"
    exit 1
fi

# Check Rust
if command -v rustc &> /dev/null; then
    RUST_VERSION=$(rustc --version)
    echo "✅ $RUST_VERSION"
else
    echo "❌ Rust not found. Please install from https://rustup.rs/"
    exit 1
fi

# Install dependencies based on OS
echo ""
echo "📦 Installing system dependencies..."

if [[ "$OS" == "ubuntu" || "$OS" == "debian" ]]; then
    sudo apt-get update
    sudo apt-get install -y \
        build-essential \
        curl \
        wget \
        file \
        libssl-dev \
        libayatana-appindicator3-dev \
        librsvg2-dev \
        libglib2.0-dev \
        libgtk-3-dev \
        libsoup-3.0-dev \
        libjavascriptcoregtk-4.1-dev \
        libwebkit2gtk-4.1-dev
    
    # For older Ubuntu versions
    if [[ "$VERSION" == "20.04" ]]; then
        echo "⚠️  Ubuntu 20.04 detected, installing gtk 4.0 instead of 4.1..."
        sudo apt-get install -y libwebkit2gtk-4.0-dev
    fi

elif [[ "$OS" == "fedora" || "$OS" == "rhel" || "$OS" == "centos" ]]; then
    sudo dnf install -y \
        gcc \
        g++ \
        make \
        cmake \
        openssl-devel \
        gtk3-devel \
        libsoup-devel \
        webkit2gtk3-devel \
        libappindicator-gtk3-devel

elif [[ "$OS" == "arch" || "$OS" == "manjaro" ]]; then
    sudo pacman -S --needed \
        base-devel \
        curl \
        wget \
        file \
        openssl \
        libayatana-appindicator \
        librsvg \
        gtk3 \
        libsoup \
        webkit2gtk-4.1

else
    echo "⚠️  Unsupported Linux distribution: $OS"
    echo "    Please install dependencies manually:"
    echo "    - build-essential (or equivalent)"
    echo "    - libgtk-3-dev"
    echo "    - libwebkit2gtk-4.1-dev"
    echo "    - libsoup-3.0-dev"
fi

# Install pnpm if not present
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    echo "✅ pnpm $PNPM_VERSION"
else
    echo "📦 Installing pnpm..."
    npm install -g pnpm@9.15.0
fi

echo ""
echo "📦 Installing Node dependencies..."
pnpm install

echo ""
echo "🔨 Building frontend..."
pnpm build

echo ""
echo "🎁 Bundling Tauri app..."
pnpm tauri build

echo ""
echo "✅ Build complete!"
echo ""
echo "📁 Output files:"
echo "  - src-tauri/target/release/mangadex-downloader-gui (Binary)"
echo "  - src-tauri/target/release/bundle/deb/mangadex-downloader-gui_0.1.0_amd64.deb"
echo ""
echo "📥 To install the DEB package:"
echo "   sudo apt install -y ./src-tauri/target/release/bundle/deb/mangadex-downloader-gui_0.1.0_amd64.deb"
echo ""
echo "🚀 To run directly:"
echo "   ./src-tauri/target/release/mangadex-downloader-gui"
echo ""
