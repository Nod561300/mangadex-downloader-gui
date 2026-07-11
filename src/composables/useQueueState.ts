import { reactive, computed } from 'vue'
import type { ChapterInfo, MangaInfo, Problem } from './useDownloadState'

export type QueueItemStatus = 'waiting' | 'downloading' | 'done' | 'error' | 'cancelled'

export interface QueueItem {
  id: string                    // unique id สำหรับ queue item
  manga: MangaInfo
  chapters: ChapterInfo[]
  outputDir: string
  status: QueueItemStatus
  chapterProgress: { completed: number; total: number }
  pageProgress: { label: string; current: number; total: number }
  problems: Problem[]
  log: string[]
}

export const queueState = reactive({
  items: [] as QueueItem[],
  isRunning: false,
  expanded: false,             // toggle ขยาย/ยุบ queue bar
  activeItemId: null as string | null,
})

let _idCounter = 0
function genId() { return `q-${Date.now()}-${_idCounter++}` }

export function addToQueue(manga: MangaInfo, chapters: ChapterInfo[], outputDir: string) {
  queueState.items.push({
    id: genId(),
    manga,
    chapters,
    outputDir,
    status: 'waiting',
    chapterProgress: { completed: 0, total: chapters.length },
    pageProgress: { label: '', current: 0, total: 0 },
    problems: [],
    log: [],
  })
}

export function removeFromQueue(id: string) {
  const idx = queueState.items.findIndex((i) => i.id === id)
  if (idx !== -1) queueState.items.splice(idx, 1)
}

export function clearDone() {
  queueState.items = queueState.items.filter((i) => i.status !== 'done')
}

export const waitingCount = computed(() => queueState.items.filter((i) => i.status === 'waiting').length)
export const activeItem = computed(() => queueState.items.find((i) => i.id === queueState.activeItemId) ?? null)
