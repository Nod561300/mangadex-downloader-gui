import { reactive } from 'vue'

export interface ChapterInfo {
  id: string
  chapter: string | null
  title: string | null
  pages: number
}

export interface MangaInfo {
  id: string
  title: string
  cover_url: string | null
  available_langs: string[]
}

export interface Problem {
  label: string
  failed_pages: number
  total: number
  error?: string
}

export const state = reactive({
  // Search
  mangaId: '',
  manga: null as MangaInfo | null,
  chapters: [] as ChapterInfo[],
  selectedLang: 'en',

  // Selection
  selected: new Set<string>(),

  // Output
  outputDir: '' as string,

  // Download
  isDownloading: false,
  chapterProgress: { completed: 0, total: 0 },
  pageProgress: { chapterId: '', label: '', current: 0, total: 0 },
  log: [] as string[],
  problems: [] as Problem[],

  // UI state
  phase: 'idle' as 'idle' | 'loading' | 'ready' | 'downloading' | 'done' | 'error',
  errorMessage: '',
})

export function setChapters(chapters: ChapterInfo[]) {
  state.chapters = chapters
  state.selected = new Set(chapters.map((c) => c.id))
}

export function toggleSelect(id: string) {
  if (state.selected.has(id)) {
    state.selected.delete(id)
  } else {
    state.selected.add(id)
  }
}

export function toggleSelectAll() {
  if (state.selected.size === state.chapters.length) {
    state.selected.clear()
  } else {
    state.selected = new Set(state.chapters.map((c) => c.id))
  }
}

export function resetDownload() {
  state.chapterProgress = { completed: 0, total: 0 }
  state.pageProgress = { chapterId: '', label: '', current: 0, total: 0 }
  state.log = []
  state.problems = []
}