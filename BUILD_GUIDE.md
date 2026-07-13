# Build Guide: MangaDex Downloader GUI (EXE & DEB)

## 📋 ข้อกำหนดเบื้องต้น

### ทั้งสอง Platform
```bash
# Node.js & pnpm
node --version        # ต้อง v18+
pnpm install -g pnpm@9.15.0

# Rust
rustup update
rustc --version       # ต้อง 1.70+
cargo --version
```

---

## 🪟 Build สำหรับ Windows (EXE)

### ข้อกำหนดเพิ่มเติม
- **OS**: Windows 7 ขึ้นไป
- **Visual Studio**: Build Tools for Visual C++ (ทำให้ติดตั้ง)
  - https://visualstudio.microsoft.com/downloads/
  - เลือก "Desktop development with C++" workload

### ขั้นตอน Build

```bash
# 1. Clone & Install dependencies
git clone https://github.com/Nod561300/mangadex-downloader-gui.git
cd mangadex-downloader-gui
pnpm install

# 2. Build Frontend
pnpm build

# 3. Build Tauri Application (สร้าง EXE)
pnpm tauri build

# ✅ Output: src-tauri/target/release/
#    - mangadex-downloader-gui.exe (portable)
#    - mangadex-downloader-gui_0.1.0_x64-setup.exe (installer)
#    - *.msi (Windows installer)
```

### Output Files
```
src-tauri/target/release/
├── mangadex-downloader-gui.exe              # Portable executable
├── bundle/
│   ├── msi/
│   │   └── mangadex-downloader-gui_0.1.0_x64_en-US.msi
│   └── nsis/
│       └── mangadex-downloader-gui_0.1.0_x64-setup.exe
```

### ปัญหาเกิดขึ้นบ่อย

**Error: Microsoft Visual C++ Build Tools not found**
```bash
# ติดตั้ง Visual Studio Build Tools
# Download from: https://visualstudio.microsoft.com/downloads/
# เลือก "Desktop development with C++"
```

**Error: WebView2 Runtime not found**
```bash
# Tauri จะ download อัตโนมัติ หรือติดตั้งเอง
# https://developer.microsoft.com/en-us/microsoft-edge/webview2/
```

---

## 🐧 Build สำหรับ Linux (DEB)

### ข้อกำหนดเพิ่มเติม

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install -y \
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
```

**Fedora/RHEL:**
```bash
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
```

### ขั้นตอน Build

```bash
# 1. Clone & Install dependencies
git clone https://github.com/Nod561300/mangadex-downloader-gui.git
cd mangadex-downloader-gui
pnpm install

# 2. Build Frontend
pnpm build

# 3. Build Tauri Application (สร้าง DEB)
pnpm tauri build

# ✅ Output: src-tauri/target/release/
#    - mangadex-downloader-gui (binary)
#    - bundle/deb/ (DEB package)
```

### Output Files
```
src-tauri/target/release/
├── mangadex-downloader-gui                  # Binary executable
└── bundle/
    └── deb/
        └── mangadex-downloader-gui_0.1.0_amd64.deb
```

### ติดตั้ง DEB Package
```bash
# วิธี 1: ใช้ dpkg
sudo dpkg -i mangadex-downloader-gui_0.1.0_amd64.deb

# วิธี 2: ใช้ GUI (Double-click)
# วิธี 3: ใช้ apt
sudo apt install -y ./mangadex-downloader-gui_0.1.0_amd64.deb
```

### ปัญหาเกิดขึ้นบ่อย

**Error: libwebkit2gtk-4.1-dev not found**
```bash
# สำหรับ Ubuntu 22.04+
sudo apt install libwebkit2gtk-4.1-dev

# สำหรับ Ubuntu 20.04
sudo apt install libwebkit2gtk-4.0-dev
```

**Error: Rust not installed**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

---

## 🔧 Build ทั้ง EXE และ DEB บนเครื่องเดียว

### ใช้ Docker (ยิ่งง่าย)

```dockerfile
# Dockerfile.build
FROM node:20-bullseye

WORKDIR /app

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Install Linux build dependencies
RUN apt-get update && apt-get install -y \
    build-essential curl wget file libssl-dev \
    libayatana-appindicator3-dev librsvg2-dev libglib2.0-dev \
    libgtk-3-dev libsoup-3.0-dev libjavascriptcoregtk-4.1-dev \
    libwebkit2gtk-4.1-dev

# Install pnpm
RUN npm install -g pnpm@9.15.0

COPY . .

# Build for Linux
RUN pnpm install
RUN pnpm build
RUN pnpm tauri build

# Output สำเร็จ
```

**Build with Docker:**
```bash
docker build -f Dockerfile.build -t mangadex-builder .
docker run --rm -v $(pwd)/src-tauri/target:/app/src-tauri/target mangadex-builder
```

---

## 📦 Cross-Platform Build (Advanced)

### สำหรับ Windows → Linux (ด้วย WSL2)

```bash
# Windows Subsystem for Linux 2
wsl --list --verbose
wsl --install Ubuntu-22.04

# ใน WSL:
cd /mnt/c/path/to/mangadex-downloader-gui
# ทำตามขั้นตอน Linux build ด้านบน
```

### GitHub Actions (CI/CD - อัตโนมัติ)

`.github/workflows/build.yml`:
```yaml
name: Build

on:
  push:
    tags:
      - 'v*'

jobs:
  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - uses: tauri-apps/tauri-action@v0
      - uses: actions/upload-artifact@v3
        with:
          name: windows-build
          path: src-tauri/target/release/bundle/

  build-linux:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - uses: tauri-apps/tauri-action@v0
      - uses: actions/upload-artifact@v3
        with:
          name: linux-build
          path: src-tauri/target/release/bundle/
```

---

## ✅ Checklist ก่อน Build

- [ ] Update version ใน `package.json`
- [ ] Update version ใน `src-tauri/Cargo.toml`
- [ ] Update version ใน `src-tauri/tauri.conf.json`
- [ ] Test ด้วย `pnpm tauri dev`
- [ ] สร้าง icons (ถ้ายังไม่มี)
- [ ] ตรวจสอบ dependencies ทั้งหมด

---

## 📊 Summary ความแตกต่าง

| Feature | EXE | DEB |
|---------|-----|-----|
| **OS** | Windows | Linux |
| **File Size** | ~150MB | ~150MB |
| **Installation** | .exe setup / portable | .deb package |
| **Dependencies** | WebView2 (auto) | GTK3, WebKit2 |
| **Build Time** | 5-10 min | 5-10 min |
| **Updater** | Built-in (Tauri) | Via apt/dpkg |

---

## 🚀 Quick Commands

```bash
# Clean build
cargo clean

# Release build (optimized)
pnpm tauri build --release

# Development build
pnpm tauri dev

# Check for issues
cargo clippy
cargo test
```

สำเร็จ! 🎉
