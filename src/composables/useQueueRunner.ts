import { invoke, isTauri } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { queueState } from './useQueueState'
import type { QueueItem } from './useQueueState'

let unlistenLog: (() => void) | null = null
let unlistenPage: (() => void) | null = null
let unlistenChapter: (() => void) | null = null
let listenerCount = 0

async function setupListeners() {
  if (listenerCount++ > 0) return  // ป้องกัน double-listen
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
  listenerCount = 0
  unlistenLog?.(); unlistenPage?.(); unlistenChapter?.()
  unlistenLog = null; unlistenPage = null; unlistenChapter = null
}

async function runItem(item: QueueItem, command: string, chapters: any[]) {
  item.status = 'downloading'
  item.chapterProgress = { completed: 0, total: chapters.length }
  item.pageProgress = { label: '', current: 0, total: 0 }
  item.log = []
  item.problems = []
  queueState.activeItemId = item.id
  queueState.expanded = true

  if (!isTauri) {
    item.log.push('Tauri runtime not available. Cannot start download from browser preview.')
    item.status = 'error'
    queueState.activeItemId = null
    return
  }

  try {
    const result = await invoke<any>(command, {
      payload: {
        manga_title: item.manga.title,
        output_dir: item.outputDir,
        chapters,
      },
    })
    item.problems = result.problems
    item.status = result.problems.length > 0 ? 'error' : 'done'
  } catch (e: any) {
    item.log.push(`Error: ${e}`)
    item.status = 'error'
  } finally {
    queueState.activeItemId = null
  }
}

async function runQueue() {
  while (true) {
    const next = queueState.items.find((i) => i.status === 'waiting')
    if (!next) break
    await runItem(next, 'start_download', next.chapters)
  }
}

export async function startQueue() {
  if (queueState.isRunning) return
  queueState.isRunning = true
  await setupListeners()
  try {
    await runQueue()
  } finally {
    teardownListeners()
    queueState.isRunning = false
    queueState.activeItemId = null
  }
}

export async function retryItem(id: string) {
  const item = queueState.items.find((i) => i.id === id)
  if (!item) return
  if (item.status === 'downloading') return  // กำลังโหลดอยู่ ข้ามไป

  const failedChapters = item.problems
    .filter((p) => p.failed_pages !== 0)
    .map((p) => ({
      id: p.chapter_id,
      chapter: p.label.match(/Ch\.(.+?) \(/)?.[1] ?? null,
      title: null,
      pages: 0,
    }))

  if (failedChapters.length === 0) return

  if (queueState.isRunning) {
    // queue กำลังวิ่ง — mark item กลับเป็น waiting แต่เปลี่ยน chapters เป็น failedChapters เท่านั้น
    item.chapters = failedChapters as any
    item.chapterProgress = { completed: 0, total: failedChapters.length }
    item.problems = []
    item.status = 'waiting'
    // loop ใน startQueue จะหยิบไปรันเองเมื่อถึงคิว
  } else {
    // queue หยุด — รัน retry แล้วต่อด้วย waiting items ที่เหลือ
    queueState.isRunning = true
    await setupListeners()
    try {
      await runItem(item, 'retry_failed_pages', failedChapters)
      await runQueue()  // รัน waiting items ที่เหลือต่อ
    } finally {
      teardownListeners()
      queueState.isRunning = false
      queueState.activeItemId = null
    }
  }
}

export async function retryAll() {
  const errorItems = queueState.items.filter((i) => i.status === 'error')
  if (errorItems.length === 0) return

  // mark ทุก error item เป็น waiting พร้อม failedChapters
  for (const item of errorItems) {
    const failedChapters = item.problems
      .filter((p) => p.failed_pages !== 0)
      .map((p) => ({
        id: p.chapter_id,
        chapter: p.label.match(/Ch\.(.+?) \(/)?.[1] ?? null,
        title: null,
        pages: 0,
      }))
    if (failedChapters.length === 0) continue
    item.chapters = failedChapters as any
    item.chapterProgress = { completed: 0, total: failedChapters.length }
    item.problems = []
    item.status = 'waiting'
  }

  await startQueue()
}

export async function cancelCurrent() {
  if (!isTauri) {
    return
  }

  try {
    await invoke('cancel_download')
    const item = queueState.items.find((i) => i.id === queueState.activeItemId)
    if (item) {
      item.status = 'cancelled'
      item.log.push('ยกเลิกแล้ว')
    }
  } catch {}
}
