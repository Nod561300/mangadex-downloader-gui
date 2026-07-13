# 🚀 Quick Build Guide - MangaDex Downloader GUI

## ⚡ วิธีที่เร็วที่สุด

### Windows → EXE
```powershell
cd mangadex-downloader-gui
powershell -ExecutionPolicy Bypass -File ../build-windows.ps1
```

### Linux → DEB
```bash
cd mangadex-downloader-gui
bash ../build-linux.sh
```

---

## 📦 Build Methods (เลือกวิธีใดวิธีหนึ่ง)

### Method 1️⃣: Direct Build (Recommended for beginners)

#### Windows
```bash
pnpm install
pnpm build
pnpm tauri build
# Output: src-tauri/target/release/bundle/
```

#### Linux
```bash
pnpm install
pnpm build
pnpm tauri build
# Output: src-tauri/target/release/bundle/deb/
```

---

### Method 2️⃣: Using Build Scripts

#### Windows (PowerShell)
```powershell
# ให้สิทธิ์ execute
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser

# รัน script
powershell -ExecutionPolicy Bypass -File build-windows.ps1
```

#### Linux (Bash)
```bash
chmod +x build-linux.sh
./build-linux.sh
```

---

### Method 3️⃣: Using Docker (Best for CI/CD)

```bash
# Build image
docker build -f Dockerfile -t mangadex-builder .

# Run and get output
docker run --rm -v $(pwd)/output:/app/output mangadex-builder

# Check result
ls -lah output/
```

---

## 📂 Output Locations

### Windows EXE
```
mangadex-downloader-gui/
└── src-tauri/target/release/
    ├── mangadex-downloader-gui.exe          ✅ Portable
    └── bundle/
        ├── nsis/
        │   └── *-setup.exe                  ✅ Installer
        └── msi/
            └── *.msi                        ✅ Windows Installer
```

### Linux DEB
```
mangadex-downloader-gui/
└── src-tauri/target/release/
    ├── mangadex-downloader-gui              ✅ Binary
    └── bundle/
        ├── deb/
        │   └── mangadex-downloader-gui_0.1.0_amd64.deb  ✅ Package
        └── appimage/
            └── *.AppImage                   ✅ Portable
```

---

## ✅ Pre-Build Checklist

- [ ] **Node.js** v18+ installed (`node --version`)
- [ ] **Rust** installed (`rustc --version`)
- [ ] **pnpm** 9.15.0 installed (`pnpm --version`)

### Windows Only
- [ ] **Visual Studio Build Tools** installed (with C++ workload)
- [ ] **WebView2 Runtime** (Tauri installs automatically)

### Linux Only
- [ ] **build-essential** installed (`apt install build-essential`)
- [ ] **GTK3 & WebKit2** libraries installed
- [ ] Run: `sudo apt install libgtk-3-dev libwebkit2gtk-4.1-dev`

---

## 🔧 Troubleshooting

### "pnpm not found"
```bash
npm install -g pnpm@9.15.0
```

### Windows: "Visual C++ not found"
- Download: https://visualstudio.microsoft.com/downloads/
- Install: "Desktop development with C++"

### Linux: "libwebkit2gtk not found"
```bash
# Ubuntu/Debian
sudo apt install libwebkit2gtk-4.1-dev

# Fedora
sudo dnf install webkit2gtk3-devel
```

### "Tauri command not found"
```bash
pnpm install -D @tauri-apps/cli@2
```

---

## 🎯 Full Command Reference

```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Full rebuild
cargo clean
pnpm install
pnpm build
pnpm tauri build

# Dev mode (for testing)
pnpm tauri dev

# Release build (optimized)
pnpm tauri build --release

# Check for errors
cargo clippy
pnpm run build

# Update Tauri
pnpm install -D @tauri-apps/cli@latest
```

---

## 📊 Expected Build Times

| Step | Windows | Linux |
|------|---------|-------|
| Dependencies | 2-3 min | 2-3 min |
| Frontend Build | 1-2 min | 1-2 min |
| Tauri Build | 3-8 min | 3-8 min |
| **Total** | **8-13 min** | **8-13 min** |

> Note: First build ช้ากว่า เพราะต้อง compile Rust dependencies

---

## 🚀 After Build

### Windows
```powershell
# Run EXE directly
.\src-tauri\target\release\mangadex-downloader-gui.exe

# Or run installer
.\src-tauri\target\release\bundle\nsis\*-setup.exe
```

### Linux
```bash
# Run binary directly
./src-tauri/target/release/mangadex-downloader-gui

# Or install DEB
sudo apt install ./src-tauri/target/release/bundle/deb/*.deb

# Launch from applications menu
mangadex-downloader-gui
```

---

## 📝 Useful Files

- 📖 **Full Guide**: `BUILD_GUIDE.md`
- 🔧 **Windows Script**: `build-windows.ps1`
- 🐧 **Linux Script**: `build-linux.sh`
- 🐳 **Docker**: `Dockerfile`

---

## 💡 Pro Tips

1. **Faster builds**: Use `--release` flag (larger binary, faster runtime)
   ```bash
   pnpm tauri build --release
   ```

2. **Specific target**: Build only for one platform
   ```bash
   pnpm tauri build --target x86_64-pc-windows-gnu  # Windows
   pnpm tauri build --target x86_64-unknown-linux-gnu  # Linux
   ```

3. **Sign your build** (Windows):
   - Get code signing certificate
   - Update `tauri.conf.json` with certificate info

4. **Cross-platform build** via Docker:
   ```bash
   docker run --rm -v $(pwd):/app -w /app mangadex-builder pnpm tauri build
   ```

---

**Let's build! 🎉**
