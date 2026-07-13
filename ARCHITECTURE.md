# 🏗️ MangaDex Downloader GUI - Architecture & Technical Details

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│              🖥️  Desktop Application                    │
│              (Windows / Linux / macOS)                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Frontend (Vue 3 + TypeScript)           │  │
│  │                                                  │  │
│  │  ┌────────────────────────────────────────────┐ │  │
│  │  │         UI Components                      │ │  │
│  │  │  • SearchBar      (Search input)           │ │  │
│  │  │  • ChapterList    (Selection)              │ │  │
│  │  │  • OutputDirPicker (Directory)             │ │  │
│  │  │  • DownloadProgress (Download button)      │ │  │
│  │  │  • QueueBar       (Queue management)       │ │  │
│  │  └────────────────────────────────────────────┘ │  │
│  │                    ▲                             │  │
│  │                    │                             │  │
│  │  ┌────────────────────────────────────────────┐ │  │
│  │  │      Vue Composables (State)               │ │  │
│  │  │  • useDownloadState (Main state)           │ │  │
│  │  │  • useQueueState    (Queue state)          │ │  │
│  │  │  • useQueueRunner   (Queue execution)      │ │  │
│  │  └────────────────────────────────────────────┘ │  │
│  │                    ▲                             │  │
│  │                    │ (invoke)                    │  │
│  └────────────────────┼──────────────────────────────┘  │
│                       │                                 │
│  ┌────────────────────┼──────────────────────────────┐  │
│  │         Backend (Rust + Tauri)                │  │  │
│  │                                                  │  │
│  │  ┌────────────────────────────────────────────┐ │  │
│  │  │      Tauri Bridge / IPC                    │ │  │
│  │  │  • Command Invocation                      │ │  │
│  │  │  • Event Emission                          │ │  │
│  │  └────────────────────────────────────────────┘ │  │
│  │                    ▲                             │  │
│  │                    │                             │  │
│  │  ┌────────────────────────────────────────────┐ │  │
│  │  │      Commands (Tauri Handler)             │ │  │
│  │  │  • fetch_manga_info()                      │ │  │
│  │  │  • fetch_chapters_for_lang()               │ │  │
│  │  │  • start_download()                        │ │  │
│  │  │  • cancel_download()                       │ │  │
│  │  │  • retry_failed_pages()                    │ │  │
│  │  └────────────────────────────────────────────┘ │  │
│  │                    ▲                             │  │
│  │                    │                             │  │
│  │  ┌────────────────────────────────────────────┐ │  │
│  │  │    Core Logic (Rust Modules)              │ │  │
│  │  │  • manga.rs      (API integration)         │ │  │
│  │  │  • download.rs   (Download engine)         │ │  │
│  │  └────────────────────────────────────────────┘ │  │
│  │                    ▲                             │  │
│  │                    │                             │  │
│  │  ┌────────────────────────────────────────────┐ │  │
│  │  │    External Dependencies                   │ │  │
│  │  │  • reqwest (HTTP Client)                   │ │  │
│  │  │  • tokio (Async Runtime)                   │ │  │
│  │  │  • serde (Serialization)                   │ │  │
│  │  └────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
                         ▼
        ┌──────────────────────────────────┐
        │   🌐 MangaDex API                │
        │ https://api.mangadex.org         │
        │                                  │
        │ • /manga/{id}                    │
        │ • /manga/{id}/feed               │
        │ • /at-home/server/{chapter_id}   │
        └──────────────────────────────────┘
                         ▼
        ┌──────────────────────────────────┐
        │   📚 Manga Content                │
        │ (Images, Metadata)               │
        └──────────────────────────────────┘
```

---

## Component Architecture

### Frontend Components Hierarchy

```
App.vue (Root)
│
├── SearchBar.vue
│   ├── Input.vue (Custom component)
│   ├── Select.vue (Language selector)
│   └── Button.vue (Search button)
│
├── Main Content Area
│   ├── Empty State (Initial)
│   ├── Loading State (Fetching data)
│   ├── Error State (Display errors)
│   └── Result State
│       ├── ChapterList.vue
│       │   ├── Manga Info Display
│       │   │   ├── Cover Image
│       │   │   ├── Title
│       │   │   └── Chapter Count
│       │   ├── Checkbox.vue (Select All)
│       │   └── Chapter Items (List)
│       │       ├── Checkbox.vue (Per-chapter)
│       │       ├── Chapter Label
│       │       └── Page Count
│       │
│       ├── OutputDirPicker.vue
│       │   ├── Button.vue (Browse)
│       │   └── Dir Label
│       │
│       └── DownloadProgress.vue
│           └── Button.vue (Add to Queue)
│
└── QueueBar.vue (Persistent)
    ├── Queue Header (Collapsed/Expanded)
    │   ├── Title & Badge
    │   ├── Status Label
    │   ├── Action Buttons
    │   │   ├── Start/Stop
    │   │   ├── Retry All
    │   │   └── Clear Done
    │   └── Toggle Expand
    │
    ├── Mini Progress
    │   ├── Chapter Progress Bar
    │   └── Page Progress Bar
    │
    └── Queue List (Expanded)
        └── Queue Items (Per Download)
            ├── Item Status Badge
            ├── Action Buttons
            │   ├── Retry (if error)
            │   ├── Re-queue (if cancelled)
            │   └── Remove
            ├── Progress Bar
            ├── Progress Label
            └── Error Messages
```

---

## Data Flow Diagram

### Search & Load Flow

```
User Input (Manga ID)
    ↓
SearchBar.search()
    ↓
invoke('fetch_manga_info', {mangaId})
    ↓
Tauri Command Handler
    ↓
normalize_manga_id() → validate UUID
    ↓
reqwest::Client.get(API_URL)
    ↓
Parse MangaResponse
    ↓
Extract: title, cover_url, available_langs
    ↓
Return MangaInfo
    ↓
Update state.manga
    ↓
invoke('fetch_chapters_for_lang', {mangaId, lang})
    ↓
Loop: Pagination (offset += 100)
    ↓
Parse ChapterResponse[]
    ↓
Deduplicate & Sort
    ↓
Return ChapterInfo[]
    ↓
setChapters(chapters)
    ↓
UI Updates: phase = 'ready'
```

### Download Flow

```
User Action: Click "Add to Queue"
    ↓
addToQueue(manga, chapters, outputDir)
    ↓
Create QueueItem {
  id, manga, chapters, status,
  chapterProgress, pageProgress, problems
}
    ↓
startQueue()
    ↓
processNext()
    ↓
invoke('start_download', payload)
    ↓
Tauri Command Handler
    ↓
For Each Chapter:
  ├─ Fetch at-home server
  ├─ Parse page list
  └─ For Each Page:
      ├─ Generate image URL
      ├─ Download with reqwest
      ├─ Save to disk
      ├─ Emit progress event
      └─ Handle errors (retry)
    ↓
Emit completion event
    ↓
Update queue item status
    ↓
Process next item or complete
```

---

## State Management

### useDownloadState Composable

```typescript
export const state = reactive({
  // Search/Load state
  mangaId: '',           // User input
  manga: null,           // MangaInfo response
  selectedLang: 'en',    // Language choice
  chapters: [],          // ChapterInfo[]
  
  // Selection state
  selected: new Set(),   // Selected chapter IDs
  
  // Download state
  outputDir: '',         // User-selected path
  phase: 'idle',         // 'idle' | 'loading' | 'ready' | 'downloading' | 'done' | 'error'
  errorMessage: '',      // Error display
})

// Methods
export function toggleSelect(chapterId)
export function toggleSelectAll()
export function setChapters(chapters)
```

### useQueueState Composable

```typescript
export const queueState = reactive({
  items: [],             // QueueItem[]
  expanded: false,       // UI state
  isRunning: false,      // Download running?
})

export const activeItem = computed(() => 
  queueState.items.find(i => i.status === 'downloading')
)

// Methods
export function addToQueue(manga, chapters, outputDir)
export function removeFromQueue(itemId)
export function clearDone()
```

### QueueItem Structure

```typescript
interface QueueItem {
  id: string
  manga: MangaInfo
  chapters: ChapterInput[]
  status: 'waiting' | 'downloading' | 'done' | 'error' | 'cancelled'
  chapterProgress: { completed: number; total: number }
  pageProgress: { label: string; current: number; total: number }
  problems: Problem[]
}

interface Problem {
  chapter_id: string
  label: string
  failed_pages: number
  total: number
  error?: string
}
```

---

## Backend Modules

### manga.rs - MangaDex API Integration

```rust
// Constants
const MANGADEX_API: &str = "https://api.mangadex.org"
const USER_AGENT: &str = "mangadex-downloader-gui/2.0"

// Functions
pub async fn fetch_manga_info(manga_id: String) -> Result<MangaInfo>
  ├─ normalize_manga_id() → Validate UUID
  ├─ reqwest::Client.get()
  ├─ Error handling (404, etc)
  └─ Extract & return MangaInfo

pub async fn fetch_chapters_for_lang(
  manga_id: String,
  lang: String
) -> Result<Vec<ChapterInfo>>
  ├─ Pagination loop (offset += 100)
  ├─ Deduplication (HashSet)
  └─ Return sorted chapters
```

### download.rs - Download Engine

```rust
// Constants
const CONCURRENCY: usize = 3          // Parallel downloads
const AT_HOME_GAP_MS: u64 = 1000      // Rate limiting
const RETRIES: u32 = 4                // Max retries

// Global State
static CANCEL_DOWNLOAD: Lazy<Arc<Mutex<bool>>>
static AT_HOME_LOCK: Lazy<tokio::sync::Mutex<()>>

// Functions
pub async fn start_download(payload: DownloadPayload)
  ├─ Create output folders
  ├─ For each chapter:
  │  ├─ fetch_at_home_server()
  │  ├─ Fetch page list
  │  └─ For each page (concurrent):
  │     ├─ Download image
  │     ├─ Retry on failure
  │     └─ Emit progress
  ├─ Handle errors
  └─ Emit completion

pub async fn cancel_download()
  └─ Set CANCEL_DOWNLOAD = true

pub async fn retry_failed_pages(item_id)
  └─ Retry failed chapters
```

---

## Data Models

### Frontend Types

```typescript
interface MangaInfo {
  id: string
  title: string
  cover_url?: string
  available_langs: string[]
}

interface ChapterInfo {
  id: string
  chapter?: string
  title?: string
  pages: number
}

interface QueueItem {
  id: string
  manga: MangaInfo
  chapters: ChapterInput[]
  status: Status
  chapterProgress: Progress
  pageProgress: Progress
  problems: Problem[]
}
```

### Backend Types

```rust
#[derive(Serialize, Deserialize)]
pub struct MangaInfo {
    pub id: String,
    pub title: String,
    pub cover_url: Option<String>,
    pub available_langs: Vec<String>,
}

#[derive(Serialize, Deserialize)]
pub struct ChapterInfo {
    pub id: String,
    pub chapter: Option<String>,
    pub title: Option<String>,
    pub pages: u32,
}

#[derive(Serialize, Deserialize)]
pub struct DownloadResult {
    pub ok: bool,
    pub completed_chapters: u32,
    pub total: u32,
    pub problems: Vec<Problem>,
}
```

---

## API Integration Points

### MangaDex API Endpoints Used

```
1. Get Manga Info
   GET /api/manga/{id}?includes[]=cover_art
   Response: MangaResponse
   
2. Get Chapters
   GET /api/manga/{id}/feed?translatedLanguage[]={lang}&order[chapter]=desc&limit=100&offset={offset}
   Response: ChapterResponse[] (paginated)
   
3. Get At-Home Server
   GET /api/at-home/server/{chapter_id}
   Response: AtHomeServer with base URL
   
4. Download Pages
   GET {at_home_base_url}/data/{hash}/{filename}
   Response: Image file (binary)
```

### API Rate Limiting Strategy

```
1. At-Home Gap: 1 second between at-home requests
2. Concurrent: 3 parallel page downloads
3. Backoff: Exponential (2s → 4s → 8s) on 429
4. User-Agent: Proper identification
```

---

## File System Structure

### Download Output

```
User Selected Path/
│
├── Manga 1/
│   ├── Chapter 1/
│   │   ├── 001.jpg
│   │   ├── 002.jpg
│   │   └── ...
│   ├── Chapter 2/
│   │   ├── 001.jpg
│   │   └── ...
│   └── ...
│
├── Manga 2/
│   └── ...
```

### Application Directories

```
Windows:
C:\Users\{user}\AppData\Local\mangadex-downloader-gui\
├── Cache/
└── Config/

Linux:
~/.local/share/mangadex-downloader-gui/
├── Cache/
└── Config/

macOS:
~/Library/Application Support/com.natthphum.mangadex-downloader-gui/
├── Cache/
└── Config/
```

---

## Communication Protocol

### Tauri IPC (Frontend ↔ Backend)

```
Frontend (Vue)
    ↓ invoke()
Tauri Bridge
    ↓ (JSON serialization)
Backend (Rust)
    ↓ Command Handler
    ↓ Async Processing
Backend Response
    ↓ (JSON serialization)
Tauri Bridge
    ↓ event()
Frontend (Vue)
    ↓ onReceive()
Update State
```

### Event Flow

```
Frontend Action
    ↓
invoke('command_name', {params})
    ↓
Tauri Command Handler (Rust)
    ↓
Async Processing
    ↓
emit('progress_event', {data})
    ↓
Frontend Listener
    ↓
Update Reactive State
    ↓
Vue Component Re-render
```

---

## Performance Characteristics

### Time Complexity

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| Search Manga | O(1) | Single API call |
| Load Chapters | O(n) | n = chapter count / 100 |
| Download Chapter | O(m) | m = page count |
| Select All | O(n) | n = chapter count |
| Queue Processing | O(n*m) | n = queue items, m = avg pages |

### Space Complexity

| Data | Space | Notes |
|------|-------|-------|
| Manga Info | ~1KB | Fixed size |
| Chapter List | O(n) | n = chapter count |
| Selected Set | O(k) | k = selected chapters |
| Queue Items | O(n) | n = queue size |
| Downloaded Images | O(n*m*s) | n*m = total pages, s = avg size |

### Network Characteristics

| Operation | Requests | Data | Time |
|-----------|----------|------|------|
| Fetch Manga | 1 | ~10KB | ~200ms |
| Fetch Chapters | n/100 | ~50KB per 100 | ~500ms per page |
| Download Chapter | m + 1 | ~5-50MB | 10-30 seconds |

---

## Security Considerations

### Input Validation
- ✅ UUID format validation (regex)
- ✅ Directory path validation
- ✅ Filename sanitization
- ✅ SQL injection prevention (N/A - no DB)

### Network Security
- ✅ HTTPS only (MangaDex API)
- ✅ User-Agent identification
- ✅ Rate limit compliance
- ✅ Timeout handling

### File Safety
- ✅ Path traversal prevention
- ✅ Special character removal
- ✅ Unicode handling
- ✅ Permission checks

---

## Testing Strategy

### Unit Tests (Planned)
- Manga ID validation
- Chapter sorting
- File name sanitization
- State management

### Integration Tests (Planned)
- API communication
- Download workflow
- Queue processing
- Error recovery

### Manual Testing
- UI responsiveness
- Download success rate
- Error handling
- Cross-platform compatibility

---

## Deployment Architecture

### Build Pipeline

```
Source Code
    ↓
pnpm install (Frontend)
cargo build (Backend)
    ↓
pnpm build (Vue compilation)
    ↓
pnpm tauri build (Bundling)
    ↓
Platform-specific Bundles
    ├─ Windows: .exe, .msi
    ├─ Linux: .deb, .AppImage
    └─ macOS: .dmg
    ↓
Distribution
    ├─ GitHub Releases
    ├─ Package Managers
    └─ Direct Downloads
```

---

## Future Architecture Improvements

### Planned Enhancements
- [ ] Database for download history
- [ ] Settings persistence layer
- [ ] Plugin system for extensions
- [ ] Real-time sync protocol
- [ ] Cloud integration layer

### Scalability
- [ ] Server mode (for multiple clients)
- [ ] API caching layer
- [ ] Download resume from checkpoint
- [ ] Bandwidth throttling

---

*Architecture Documentation Last Updated: 2026*
