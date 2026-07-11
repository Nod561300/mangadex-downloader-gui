import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { queueState } from './useQueueState'
import type { QueueItem } from './useQueueState'

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

async function runItem(item: QueueItem, command: string, chapters: any[]) {
  item.status = 'downloading'
  item.chapterProgress = { completed: 0, total: chapters.length }
  item.pageProgress = { label: '', current: 0, total: 0 }
  item.log = []
  queueState.activeItemId = item.id
  queueState.expanded = true

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

export async function startQueue() {
  if (queueState.isRunning) return
  queueState.isRunning = true
  await setupListeners()

  try {
    while (true) {
      const next = queueState.items.find((i) => i.status === 'waiting')
      if (!next) break
      await runItem(next, 'start_download', next.chapters)
    }
  } finally {
    teardownListeners()
    queueState.isRunning = false
    queueState.activeItemId = null
  }
}

export async function retryItem(id: string) {
  const item = queueState.items.find((i) => i.id === id)
  if (!item || item.status === 'downloading') return

  // โหลดเฉพาะตอนที่มี failed_pages — skip ไฟล์ที่มีแล้วอยู่แล้วใน Rust
  const failedChapters = item.problems
    .filter((p) => p.failed_pages !== 0)
    .map((p) => ({ id: p.chapter_id, chapter: p.label.match(/Ch\.(.+?) \(/)?.[1] ?? null }))

  if (failedChapters.length === 0) return

  item.problems = []

  if (queueState.isRunning) {
    // ถ้า queue กำลังวิ่งอยู่ ให้รอ — แทรก waiting item แล้วปล่อยให้ loop หยิบไปเอง
    // แต่เราต้องการ retry เฉพาะตอนที่พัง ไม่ใช่ทั้งเรื่อง
    // ใช้วิธี clone item ใหม่ที่มีแค่ failedChapters
    const { addToQueue } = await import('./useQueueState')
    addToQueue(item.manga, failedChapters.map(fc => ({
      id: fc.id,
      chapter: fc.chapter,
      title: null,
      pages: 0,
    })), item.outputDir)
  } else {
    // queue หยุดอยู่ — รัน retry โดยตรงแล้วเริ่ม queue ใหม่
    await setupListeners()
    queueState.isRunning = true
    try {
      await runItem(item, 'retry_failed_pages', failedChapters)
      // รัน waiting items ที่เหลือต่อ
      while (true) {
        const next = queueState.items.find((i) => i.status === 'waiting')
        if (!next) break
        await runItem(next, 'start_download', next.chapters)
      }
    } finally {
      teardownListeners()
      queueState.isRunning = false
      queueState.activeItemId = null
    }
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
