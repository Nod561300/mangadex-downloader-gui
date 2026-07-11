<script setup lang="ts">
import { computed } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { state, resetDownload } from '../composables/useDownloadState'
import { onMounted, onUnmounted } from 'vue'

const chapterPct = computed(() => {
  if (!state.chapterProgress.total) return 0
  return Math.round((state.chapterProgress.completed / state.chapterProgress.total) * 100)
})

const pagePct = computed(() => {
  if (!state.pageProgress.total) return 0
  return Math.round((state.pageProgress.current / state.pageProgress.total) * 100)
})

const canDownload = computed(() =>
  state.selected.size > 0 && state.outputDir && !state.isDownloading
)

const retryableProblems = computed(() =>
  state.problems.filter((p) => p.failed_pages !== 0)
)

let unlistenLog: (() => void) | null = null
let unlistenPage: (() => void) | null = null
let unlistenChapter: (() => void) | null = null

onMounted(async () => {
  unlistenLog = await listen<string>('download-log', (e) => {
    state.log.push(e.payload)
  })
  unlistenPage = await listen<any>('page-progress', (e) => {
    state.pageProgress = e.payload
  })
  unlistenChapter = await listen<any>('chapter-progress', (e) => {
    state.chapterProgress = e.payload
  })
})

onUnmounted(() => {
  unlistenLog?.()
  unlistenPage?.()
  unlistenChapter?.()
})

async function startDownload() {
  if (!canDownload.value || !state.manga) return
  resetDownload()
  state.isDownloading = true
  state.phase = 'downloading'

  const chapters = state.chapters.filter((c) => state.selected.has(c.id))

  try {
    const result = await invoke<any>('start_download', {
      payload: {
        manga_title: state.manga.title,
        output_dir: state.outputDir,
        chapters,
      },
    })
    state.problems = result.problems
    state.phase = 'done'
  } catch (e: any) {
    state.log.push(`Error: ${e}`)
  } finally {
    state.isDownloading = false
  }
}

async function cancelDownload() {
  try {
    await invoke('cancel_download')
    state.log.push('ยกเลิกการดาวน์โหลด...')
  } catch (e: any) {
    state.log.push(`Error cancelling: ${e}`)
  }
}

async function retryFailed() {
  if (!state.manga || retryableProblems.value.length === 0) return

  const chapters = retryableProblems.value.map((p) => ({
    id: p.chapter_id,
    chapter: p.label.match(/Ch\.(.+?) \(/)?.[1] ?? null,
  }))

  state.log = []
  state.chapterProgress = { completed: 0, total: chapters.length }
  state.pageProgress = { chapterId: '', label: '', current: 0, total: 0 }
  state.isDownloading = true
  state.phase = 'downloading'

  try {
    const result = await invoke<any>('retry_failed_pages', {
      payload: {
        manga_title: state.manga.title,
        output_dir: state.outputDir,
        chapters,
      },
    })
    state.problems = result.problems
    state.phase = 'done'
  } catch (e: any) {
    state.log.push(`Error: ${e}`)
  } finally {
    state.isDownloading = false
  }
}
</script>

<template>
  <div class="download-section">
    <div class="download-bar">
      <button class="btn primary large" :disabled="!canDownload" @click="startDownload">
        ดาวน์โหลดตอนที่เลือก ({{ state.selected.size }})
      </button>
      <button
        v-if="state.isDownloading"
        class="btn danger large"
        @click="cancelDownload"
      >
        ⏹ หยุดดาวน์โหลด
      </button>
    </div>

    <div v-if="state.isDownloading || state.phase === 'done'" class="progress-wrap">
      <div class="progress-label">
        ตอน {{ state.chapterProgress.completed }}/{{ state.chapterProgress.total }}
      </div>
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: chapterPct + '%' }"></div>
      </div>

      <div v-if="state.pageProgress.label" class="page-progress">
        <span>{{ state.pageProgress.label }}</span>
        <div class="progress-track">
          <div class="progress-fill secondary" :style="{ width: pagePct + '%' }"></div>
        </div>
        <span>{{ state.pageProgress.current }}/{{ state.pageProgress.total }} หน้า</span>
      </div>
    </div>

    <div v-if="retryableProblems.length > 0 && !state.isDownloading" class="problems">
      <p class="problems-title">⚠ โหลดไม่สำเร็จ {{ retryableProblems.length }} ตอน</p>
      <ul>
        <li v-for="p in retryableProblems" :key="p.chapter_id">
          {{ p.label }} —
          <span v-if="p.error">{{ p.error }}</span>
          <span v-else>{{ p.failed_pages }}/{{ p.total }} หน้าพัง</span>
        </li>
      </ul>
      <button class="btn ghost" style="margin-top: 8px" @click="retryFailed">
        🔁 Retry {{ retryableProblems.length }} ตอน
      </button>
    </div>

    <div v-if="state.log.length > 0" class="log-box">
      <p v-for="(msg, i) in state.log" :key="i">{{ msg }}</p>
    </div>
  </div>
</template>
