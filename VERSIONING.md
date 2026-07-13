# 🚀 Versioning Strategy & Release Guide

## 📌 Current Version: 0.1.0

```
Current State: Beta (Development/Early Release)
Location: 
  - package.json
  - src-tauri/Cargo.toml
  - src-tauri/tauri.conf.json
```

---

## 🎯 Versioning Strategy (Semantic Versioning)

### Current Phase: Beta (0.x.x)

```
0.1.0 → 0.2.0 → 0.3.0 → ... → 1.0.0 (Stable)
```

| Version | Status | When to Use |
|---------|--------|------------|
| **0.1.0** | Current | First release (Beta) |
| **0.2.0** | Plan | After fixes & i18n |
| **0.3.0** | Plan | Add new features |
| **1.0.0** | Target | Stable release |

---

## 🏷️ Recommendation for First Release

### Option 1️⃣: Keep as 0.1.0 (Current)
```
✅ Pros:
- Signals "beta/early stage"
- Users know it's not production-ready
- No pressure to support all features
- Can iterate quickly

❌ Cons:
- Users may be hesitant to use
- Not clearly marked as "first release"
```

**When to use**: If you want flexibility to make breaking changes

---

### Option 2️⃣: Bump to 0.2.0
```
✅ Pros:
- Shows development progress
- Signals "better than initial version"
- Clearer release timeline

❌ Cons:
- Suggests previous 0.1.0 existed
- May confuse users
```

**When to use**: If first build had issues you fixed

---

### Option 3️⃣: Jump to 1.0.0 (Recommended if ready)
```
✅ Pros:
- Signals "stable, production-ready"
- Users trust the app
- Professional appearance
- Ready for wide distribution

❌ Cons:
- Commits to API stability
- More pressure to maintain
- Need to support bugfix releases (1.0.1, etc.)
```

**When to use**: If app is truly stable and feature-complete

**Current Status**: 🟠 **Borderline** - 95% feature-complete, so could work

---

## 📋 My Recommendation for Your Project

### 🎯 Release as: **v0.2.0-beta** or **v1.0.0-beta**

**Reasoning**:
1. ✅ 95% feature-complete (not just experimental)
2. ✅ All core features working
3. ✅ Proper error handling
4. ✅ Cross-platform builds ready
5. ⚠️ Internationalization not complete (only Thai)
6. ⚠️ Still beta quality (some features noted as "ready" but incomplete)

**Best Option**: 
```
Release as: v0.2.0 (or v0.2.0-beta)

Why:
- Shows it's improved from initial dev
- Signals it's still in active development
- Leaves room for 1.0.0 when full i18n is done
- More trustworthy than 0.1.0
```

---

## 📝 Version Bump Checklist

### Before Releasing v0.2.0

#### 1. Update Version Numbers (3 files)

**package.json**:
```json
{
  "version": "0.2.0"
}
```

**src-tauri/Cargo.toml**:
```toml
[package]
version = "0.2.0"
```

**src-tauri/tauri.conf.json**:
```json
{
  "version": "0.2.0"
}
```

#### 2. Update Version Command
```bash
# Change all 3 files at once (if you want)
find . -name "*.toml" -o -name "*.json" | xargs sed -i 's/"0.1.0"/"0.2.0"/g'
find . -name "package.json" | xargs sed -i 's/"version": "0.1.0"/"version": "0.2.0"/g'
```

#### 3. Create CHANGELOG
```markdown
# Changelog

## [0.2.0] - 2026-01-XX

### Added
- ✅ Queue management system
- ✅ Retry failed pages
- ✅ Multi-language support
- ✅ Real-time progress tracking

### Fixed
- ✅ Keyboard shortcut documentation
- ✅ Error handling improvements
- ✅ UI responsiveness

### Known Issues
- ⚠️ Only Thai UI (internationalization pending)
- ⚠️ Dark theme not accessible via UI (backend ready)
- ⚠️ No built-in reader (local files only)

### Planned
- [ ] English/Japanese UI
- [ ] Built-in manga viewer
- [ ] Settings preferences
- [ ] Download history
```

#### 4. Create Release Notes
```markdown
# MangaDex Downloader GUI v0.2.0

Initial public release! 🎉

## Features
- Download manga from MangaDex
- Multi-language support
- Batch queue management
- Automatic error recovery
- Cross-platform (Windows/Linux)

## Downloads
- Windows: [mangadex-downloader-gui_0.2.0_x64-setup.exe]
- Linux DEB: [mangadex-downloader-gui_0.2.0_amd64.deb]
- Linux AppImage: [mangadex-downloader-gui_0.2.0_x64.AppImage]

## Known Limitations
- Thai UI only
- No built-in reader
- Theme not customizable via UI

## Installation
See [README.md](README.md) for detailed instructions

## Feedback
Report issues or request features via GitHub Issues
```

---

## 🔄 Version Progression Plan

### Phase 1: Beta (Current → v0.2.0)
```
Status: Feature Complete, UI Partial
Version: 0.2.0
When: Now
Features:
  ✅ Download system
  ✅ Queue management
  ✅ Error handling
  ⚠️ Thai UI only
  
Next: Fix UI/i18n
```

### Phase 2: Development (v0.3.0 - v0.9.0)
```
Status: Adding features
Versions: 0.3.0 → 0.4.0 → 0.5.0 ...
When: Next 3-6 months
Features:
  - English UI
  - Built-in reader
  - Settings panel
  - Search history
  - Favorites system
  
Next: Polish & fix bugs
```

### Phase 3: Stable (v1.0.0)
```
Status: Production Ready
Version: 1.0.0
When: After all i18n + features done
Features:
  ✅ All features
  ✅ Multiple languages
  ✅ Full documentation
  ✅ Tested & stable
  
Next: Maintenance & bugfixes
```

### Phase 4: Maintenance (v1.1.0+)
```
Status: Stable with improvements
Versions: 1.1.0 → 1.2.0 → 2.0.0 (if major changes)
When: Ongoing
Features:
  - Bugfixes
  - Performance improvements
  - New features (non-breaking)
  - Security updates
```

---

## 📦 Release Package Names

### For v0.2.0 Release

**Windows**:
```
mangadex-downloader-gui_0.2.0_x64-setup.exe      (Installer)
mangadex-downloader-gui_0.2.0_x64.msi             (Windows Installer)
mangadex-downloader-gui-0.2.0.exe                 (Portable)
```

**Linux**:
```
mangadex-downloader-gui_0.2.0_amd64.deb           (Debian/Ubuntu)
mangadex-downloader-gui_0.2.0_x64.AppImage        (Universal)
```

**macOS** (when ready):
```
mangadex-downloader-gui_0.2.0_x64.dmg             (App Bundle)
```

---

## 🎯 Release Checklist

### Before Publishing v0.2.0

- [ ] Update version in 3 config files
- [ ] Create CHANGELOG.md
- [ ] Create release notes
- [ ] Test all 3 platforms (Windows/Linux/macOS)
- [ ] Build production binaries
  - [ ] Windows EXE
  - [ ] Linux DEB
  - [ ] Linux AppImage
- [ ] Test installers work
- [ ] Test portable mode
- [ ] Create GitHub release page
- [ ] Upload binaries to GitHub
- [ ] Write announcement

### Testing Checklist

- [ ] Download & install on Windows
- [ ] Download & install on Linux (DEB)
- [ ] Test basic features:
  - [ ] Search manga
  - [ ] Select chapters
  - [ ] Download works
  - [ ] Progress tracking
  - [ ] Error handling
- [ ] Test on clean system (no dependencies)
- [ ] Verify file structure correct
- [ ] Check disk usage reasonable

---

## 🔀 Git Tagging

After version bump, create git tag:

```bash
# Tag the release
git tag -a v0.2.0 -m "Release version 0.2.0: Initial public release"

# Push tag to GitHub
git push origin v0.2.0

# Or push all tags
git push origin --tags
```

### Git Commands

```bash
# Check current tags
git tag -l

# View tag details
git show v0.2.0

# Delete local tag (if mistake)
git tag -d v0.2.0

# Delete remote tag
git push origin --delete v0.2.0
```

---

## 📊 Semantic Versioning Guide

### Format: MAJOR.MINOR.PATCH-PRERELEASE

```
v0.2.0-beta
│ │ │  │
│ │ │  └─ Prerelease (beta, alpha, rc)
│ │ └──── Patch (bugfixes)
│ └────── Minor (new features, backward compatible)
└──────── Major (breaking changes)
```

### Examples

| Version | Meaning |
|---------|---------|
| **0.1.0** | Initial beta |
| **0.1.1** | Bugfix to 0.1 |
| **0.2.0** | New features, backward compatible |
| **1.0.0** | Stable release |
| **1.0.1** | Bugfix to 1.0 |
| **1.1.0** | New features, backward compatible |
| **2.0.0** | Major breaking changes |

### Your Case
```
0.1.0 (initial dev) → 0.2.0 (first real release) → 1.0.0 (stable)
```

---

## 📋 Comparison: When to Use What

| Version | Your Status | When Ready |
|---------|------------|-----------|
| **0.1.x** | Current (beta) | Now |
| **0.2.x** | Recommended | Ready to release |
| **0.3.x** | After i18n | 1-2 months |
| **1.0.x** | Production | When fully polished |

---

## 🎬 My Recommended Action Plan

### Step 1: Prepare v0.2.0 (This Week)
```bash
# 1. Update versions
sed -i 's/0.1.0/0.2.0/g' package.json
sed -i 's/0.1.0/0.2.0/g' src-tauri/Cargo.toml
sed -i 's/0.1.0/0.2.0/g' src-tauri/tauri.conf.json

# 2. Create CHANGELOG.md
# 3. Commit changes
git add .
git commit -m "chore: bump version to 0.2.0"

# 4. Tag release
git tag -a v0.2.0 -m "Release v0.2.0: Initial public release"
git push origin v0.2.0
```

### Step 2: Build Release (This Week)
```bash
pnpm install
pnpm build
pnpm tauri build --release

# Binaries in: src-tauri/target/release/bundle/
```

### Step 3: Create GitHub Release (This Week)
```
Title: MangaDex Downloader v0.2.0
Description: Initial public release
Files: 
  - Windows EXE
  - Linux DEB
  - Linux AppImage
```

### Step 4: Announce (This Week)
```
- Post on GitHub
- Update README badges (if any)
- Share with community
```

---

## ✅ Final Recommendation

### 🎯 Release Version: **v0.2.0**

**Reasoning**:
1. Current code is too mature for 0.1.0
2. But not ready for 1.0.0 (missing i18n)
3. 0.2.0 signals "improved beta" 
4. Room to grow to 1.0.0
5. Professional versioning

**Timeline**:
- **Now**: Release v0.2.0
- **1-2 months**: v0.3.0 (with i18n)
- **2-3 months**: v1.0.0 (stable)

---

## 📚 Version References

### Semantic Versioning
- Spec: https://semver.org/

### Common Versioning Schemes
- Tauri: Uses semantic versioning
- Vue: Uses semantic versioning
- Rust: Uses semantic versioning

### Pre-release Labels
- `alpha` - Early testing
- `beta` - More testing
- `rc` (release candidate) - Final testing
- No label = Stable release

---

**Recommendation**: 📦 **Build as v0.2.0** 🚀

This signals the app is mature enough for users while acknowledging it's still in active development.

---

*Version Planning Completed: 2026*
