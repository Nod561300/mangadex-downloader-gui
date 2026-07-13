# Build MangaDex Downloader GUI for Windows
# Run: powershell -ExecutionPolicy Bypass -File build-windows.ps1

Write-Host "🚀 Building MangaDex Downloader GUI for Windows..." -ForegroundColor Green
Write-Host ""

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Cyan

# Check Node.js
try {
    $node = node --version
    Write-Host "✅ Node.js $node" -ForegroundColor Green
}
catch {
    Write-Host "❌ Node.js not found. Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check Rust
try {
    $rust = rustc --version
    Write-Host "✅ Rust installed: $rust" -ForegroundColor Green
}
catch {
    Write-Host "❌ Rust not found. Please install from https://rustup.rs/" -ForegroundColor Red
    exit 1
}

# Check Visual Studio Build Tools
$vsPath = "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC"
if (Test-Path $vsPath) {
    Write-Host "✅ Visual Studio Build Tools detected" -ForegroundColor Green
}
else {
    Write-Host "⚠️  Visual Studio Build Tools might not be installed" -ForegroundColor Yellow
    Write-Host "    Download from: https://visualstudio.microsoft.com/downloads/" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
pnpm install

Write-Host ""
Write-Host "🔨 Building frontend..." -ForegroundColor Cyan
pnpm build

Write-Host ""
Write-Host "🎁 Bundling Tauri app..." -ForegroundColor Cyan
pnpm tauri build

Write-Host ""
Write-Host "✅ Build complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Output files:" -ForegroundColor Cyan
Write-Host "  - src-tauri/target/release/mangadex-downloader-gui.exe (Portable)" -ForegroundColor White
Write-Host "  - src-tauri/target/release/bundle/nsis/*-setup.exe (Installer)" -ForegroundColor White
Write-Host "  - src-tauri/target/release/bundle/msi/*.msi (Windows Installer)" -ForegroundColor White
Write-Host ""
