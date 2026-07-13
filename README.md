# 📚 MangaDex Downloader GUI

A modern, fast, and feature-rich **GUI application** for downloading manga from [MangaDex](https://mangadex.org/) with support for multiple languages and batch processing.

Built with **Tauri + Vue 3 + TypeScript** for a lightweight desktop experience.

![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20%7C%20macOS-blue)
![Version](https://img.shields.io/badge/Version-0.1.0-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ Features

### 🔍 **Search & Discovery**
- ✅ Search by **Title ID** or paste **MangaDex URL** directly
- ✅ Auto-extract manga metadata from MangaDex API
- ✅ Display manga cover art, title, and chapter count
- ✅ Real-time error feedback

### 🗣️ **Multi-Language Support**
- ✅ Download chapters in **any language** available on MangaDex
- ✅ Language selector with **flags** and full language names
- ✅ Automatic language detection (defaults to English)
- ✅ Dynamic chapter list updates when changing language

### 📖 **Smart Chapter Selection**
- ✅ Select/deselect individual chapters
- ✅ **"Select All"** functionality with checkbox
- ✅ Display chapter numbers, titles, and page counts
- ✅ Visual indicators for selection status
- ✅ One-click chapter toggling

### ⬇️ **Advanced Download Features**
- ✅ **Concurrent downloads** (3 parallel connections)
- ✅ **Queue management** - add multiple manga to download queue
- ✅ **Pause/Resume** - pause and resume downloads anytime
- ✅ **Cancel downloads** - stop current download operation
- ✅ **Retry failed pages** - automatically recover from errors
- ✅ **Progress tracking** - real-time chapter and page progress
- ✅ **Batch processing** - download multiple manga sequentially

### 📊 **Queue System**
- ✅ Persistent download queue with status tracking
- ✅ **Status indicators**: Waiting ⏳ | Downloading ⬇ | Done ✅ | Error ⚠
- ✅ **Mini progress bars** showing chapter and page completion
- ✅ **Expandable queue list** with detailed item information
- ✅ Per-item error reporting and retry buttons
- ✅ Clear completed items from queue
- ✅ Retry all failed items at once
- ✅ Real-time queue badge showing progress

### 🛡️ **Error Handling**
- ✅ Automatic retry mechanism for failed pages
- ✅ Detailed error messages with recovery options
- ✅ Rate limiting handling (respects MangaDex API)
- ✅ Connection timeout management
- ✅ Failed page recovery during retry

### 💾 **File Management**
- ✅ Choose custom download directory
- ✅ Auto-sanitize folder names (removes invalid characters)
- ✅ Organized manga folder structure
- ✅ Each manga in separate folder

### 🎨 **User Interface**
- ✅ Clean and intuitive Thai-language UI
- ✅ PrimeVue component library for modern styling
- ✅ Responsive design (works on different screen sizes)
- ✅ Dark/Light theme support (via PrimeVue)
- ✅ Real-time visual feedback

---

## 📋 System Requirements

### Windows
- **Windows 7 or later**
- **Visual C++ Redistributable** (auto-installed)
- **WebView2 Runtime** (auto-installed by Tauri)
- Minimum: **500MB** free disk space

### Linux (Ubuntu/Debian)
- **Ubuntu 20.04+** or **Debian 11+**
- **GTK 3** libraries
- **WebKit2GTK** runtime
- Minimum: **500MB** free disk space

### macOS
- **macOS 10.13** or later
- **Xcode Command Line Tools**
- Minimum: **500MB** free disk space

---

## 🚀 Installation

### Option 1: Pre-built Executables

#### Windows
1. Download `.exe` from [Releases](https://github.com/Nod561300/mangadex-downloader-gui/releases)
2. Double-click to run (portable) or use installer

#### Linux (Debian/Ubuntu)
```bash
# Download and install DEB package
sudo apt install ./mangadex-downloader-gui_0.1.0_amd64.deb

# Or install directly
sudo dpkg -i mangadex-downloader-gui_0.1.0_amd64.deb
```

#### Linux (Other distributions)
```bash
# Download AppImage
chmod +x mangadex-downloader-gui_0.1.0_x64.AppImage
./mangadex-downloader-gui_0.1.0_x64.AppImage
```

### Option 2: Build from Source

#### Prerequisites
- **Node.js** v18+ ([download](https://nodejs.org/))
- **Rust** 1.70+ ([install](https://rustup.rs/))
- **pnpm** 9.15.0 (`npm install -g pnpm@9.15.0`)

#### Windows
```bash
# Install Visual Studio Build Tools
# Download from: https://visualstudio.microsoft.com/downloads/
# Select "Desktop development with C++"

git clone https://github.com/Nod561300/mangadex-downloader-gui.git
cd mangadex-downloader-gui
pnpm install
pnpm build
pnpm tauri build

# Output: src-tauri/target/release/bundle/nsis/*-setup.exe
```

#### Linux
```bash
# Install dependencies (Ubuntu/Debian)
sudo apt update && sudo apt install -y \
  build-essential libssl-dev libgtk-3-dev \
  libwebkit2gtk-4.1-dev libsoup-3.0-dev \
  libjavascriptcoregtk-4.1-dev

git clone https://github.com/Nod561300/mangadex-downloader-gui.git
cd mangadex-downloader-gui
pnpm install
pnpm build
pnpm tauri build

# Output: src-tauri/target/release/bundle/deb/*.deb
```

---

## 📖 Usage Guide

### 1️⃣ Search for Manga
- Paste a **MangaDex URL** (e.g., `https://mangadex.org/title/abc123...`)
- Or enter the **Title ID** directly (UUID format)
- Click **"ค้นหา"** (Search)
- Wait for manga info to load

### 2️⃣ Select Language
- Choose desired language from dropdown
- Chapter list updates automatically
- Displays available languages for this manga

### 3️⃣ Select Chapters
- Check individual chapters
- Or use **"Select All"** to select everything
- Counter shows how many chapters selected
- View page count for each chapter

### 4️⃣ Choose Download Location
- Click **"เลือกโฟลเดอร์ปลายทาง"** (Choose Folder)
- Select where to save downloaded manga

### 5️⃣ Start Download
- Click **"➕ เพิ่มเข้าคิว"** (Add to Queue) button
- Download starts automatically
- View progress in queue bar at bottom

### 6️⃣ Manage Queue
- **Pause**: Click pause button to pause current download
- **Resume**: Click play button to resume
- **Cancel**: Stop current download
- **Retry**: Fix failed chapters
- **Clear**: Remove completed items

---

## 🎮 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Search for manga |
| `Alt+F4` (Windows) or `Cmd+Q` (macOS) | Quit application |

*Note: Use standard OS shortcuts to close the window*

---

## 📂 Download Structure

```
📁 Selected Folder/
└── 📁 Manga Title/
    ├── 📁 Chapter 1/
    │   ├── 001.jpg
    │   ├── 002.jpg
    │   └── ...
    ├── 📁 Chapter 2/
    │   ├── 001.jpg
    │   ├── 002.jpg
    │   └── ...
    └── ...
```

---

## 🔧 Advanced Configuration

### config/uiLibrary.ts
Customize PrimeVue theme:
```typescript
// Default: Orange primary color
// Customize colors, fonts, spacing
```

### Tauri Config (src-tauri/tauri.conf.json)
- App window size: 800x600
- Security settings
- Bundle configuration

---

## 🐛 Troubleshooting

### "Title ID not found"
- Verify the manga exists on MangaDex
- Use full MangaDex URL: `https://mangadex.org/title/[ID]`
- Check internet connection

### "Download failed"
- Check internet connection
- MangaDex server might be rate-limiting
- Try "Retry" button
- Use VPN if region-restricted

### Windows: "WebView2 not found"
- Tauri automatically installs it
- Or download from: https://developer.microsoft.com/en-us/microsoft-edge/webview2/

### Linux: "GTK libraries missing"
```bash
# Ubuntu/Debian
sudo apt install libgtk-3-dev libwebkit2gtk-4.1-dev

# Fedora
sudo dnf install gtk3-devel webkit2gtk3-devel
```

### App won't start
- Check system logs
- Delete cache: `~/.cache/mangadex-downloader-gui`
- Reinstall application

---

## 🏗️ Project Structure

```
mangadex-downloader-gui/
├── src/                          # Frontend (Vue 3 + TypeScript)
│   ├── components/               # Vue components
│   │   ├── SearchBar.vue         # Search interface
│   │   ├── ChapterList.vue       # Chapter selection
│   │   ├── DownloadProgress.vue  # Download button
│   │   ├── QueueBar.vue          # Queue management
│   │   ├── OutputDirPicker.vue   # Directory selection
│   │   └── shared/               # Reusable components
│   ├── composables/              # Vue composables (state)
│   │   ├── useDownloadState.ts   # Main state
│   │   ├── useQueueState.ts      # Queue state
│   │   └── useQueueRunner.ts     # Queue executor
│   ├── App.vue                   # Root component
│   └── main.ts                   # Entry point
├── src-tauri/                    # Backend (Rust)
│   ├── src/
│   │   ├── commands/
│   │   │   ├── manga.rs          # MangaDex API integration
│   │   │   └── download.rs       # Download logic
│   │   ├── lib.rs                # Tauri setup
│   │   └── main.rs               # Entry point
│   ├── Cargo.toml                # Rust dependencies
│   └── tauri.conf.json           # App configuration
├── package.json                  # Node.js dependencies
└── README.md                     # This file
```

---

## 🛠️ Tech Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Next generation build tool
- **PrimeVue 4.5** - Vue UI component library
- **Tauri API** - Desktop app integration

### Backend
- **Tauri 2** - Lightweight desktop framework
- **Rust** - Systems programming language
- **reqwest** - HTTP client
- **tokio** - Async runtime
- **serde** - Serialization library

### Build & Deployment
- **pnpm** - Fast package manager
- **GitHub Actions** - CI/CD pipeline
- **Docker** - Containerization (optional)

---

## 📊 Statistics

- **Frontend**: ~700 lines of Vue/TypeScript
- **Backend**: ~600 lines of Rust
- **Bundle Size**: ~150MB (includes WebKit2)
- **Memory Usage**: ~100-200MB at runtime
- **Download Speed**: Limited by MangaDex API rate limit

---

## 📝 Development

### Setup Dev Environment
```bash
pnpm install
pnpm tauri dev
```

### Build for Release
```bash
pnpm build
pnpm tauri build --release
```

### Run Linting
```bash
cargo clippy
pnpm run build
```

### Update Dependencies
```bash
pnpm update
cargo update
```

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

### Areas for Contribution
- 🌍 Translation (add more languages)
- 🎨 UI/UX improvements
- 🐛 Bug fixes
- 📖 Documentation
- ⚡ Performance optimization

---

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

---

## ⚠️ Legal Notice

This tool is for **personal use only**. Respect copyright and MangaDex's terms of service. The author assumes no liability for misuse.

**Using this tool, you acknowledge:**
- You have the right to download content
- You won't redistribute copyrighted materials
- You comply with local laws and MangaDex ToS

---

## 🔗 Links

- 🌐 **MangaDex Official**: https://mangadex.org/
- 🐙 **GitHub Repository**: https://github.com/Nod561300/mangadex-downloader-gui
- 🦀 **Tauri Framework**: https://tauri.app/
- 💚 **Vue 3**: https://vuejs.org/
- 📦 **PrimeVue**: https://primevue.org/

---

## 💬 Support & Feedback

- 🐛 **Report Bugs**: [GitHub Issues](https://github.com/Nod561300/mangadex-downloader-gui/issues)
- 💡 **Request Features**: [GitHub Discussions](https://github.com/Nod561300/mangadex-downloader-gui/discussions)
- 📧 **Email**: [Contact Developer]

---

## 🙏 Acknowledgments

- **MangaDex** team for the amazing platform
- **Tauri** community for the desktop framework
- **Vue.js** team for the awesome framework
- All contributors and testers

---

**Made with ❤️ using Tauri, Vue 3, and Rust**

*Last Updated: 2026*
