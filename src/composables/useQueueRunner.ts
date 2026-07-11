import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { queueState } from './useQueueState'

let unlistenLog: (() => void) | null = null
let unlistenPage: (() => void) | null = null
let unlistenChapter: (() => void) | null = null

async function setupListeners() {
  unlistenLog = await listen<string>('download-log', (e) => {
    const item = queueState.items.find((i) => i.id === queueState.activeItemId)
    if (item) item.log.push(e.payload)
  })
  unlistenPage = await listen<any>('page-progress', (e) => {
    const item = queueState.items.find((i) => i.id === queueState.activeItemId)
    if (item) item.pageProgress = { label: e.payload.label, current: e.payload.current, total: e.payload.total }
  })
  unlistenChapter = await listen<any>('chapter-progress', (e) => {
    const item = queueState.items.find((i) => i.id === queueState.activeItemId)
    if (item) item.chapterProgress = { completed: e.payload.completed, total: e.payload.total }
  })
}

function teardownListeners() {
  unlistenLog?.(); unlistenPage?.(); unlistenChapter?.()
  unlistenLog = null; unlistenPage = null; unlistenChapter = null
}

export async function startQueue() {
  if (queueState.isRunning) return
  queueState.isRunning = true
  await setupListeners()

  try {
    while (true) {
      const next = queueState.items.find((i) => i.status === 'waiting')
      if (!next) break

      next.status = 'downloading'
      queueState.activeItemId = next.id
      queueState.expanded = true

      try {
        const result = await invoke<any>('start_download', {
          payload: {
            manga_title: next.manga.title,
            output_dir: next.outputDir,
            chapters: next.chapters,
          },
        })
        next.problems = result.problems
        next.status = result.problems.length > 0 ? 'error' : 'done'
      } catch (e: any) {
        next.log.push(`Error: ${e}`)
        next.status = 'error'
      }

      queueState.activeItemId = null
    }
  } finally {
    teardownListeners()
    queueState.isRunning = false
    queueState.activeItemId = null
  }
}

export async function cancelCurrent() {
  try {
    await invoke('cancel_download')
    const item = queueState.items.find((i) => i.id === queueState.activeItemId)
    if (item) {
      item.status = 'cancelled'
      item.log.push('ยกเลิกแล้ว')
    }
  } catch {}
}
