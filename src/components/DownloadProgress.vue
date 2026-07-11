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

    <div v-if="state.problems.length > 0" class="problems">
      <p class="problems-title">⚠ มีปัญหาระหว่างโหลด:</p>
      <ul>
        <li v-for="p in state.problems" :key="p.label">
          {{ p.label }} —
          <span v-if="p.error">{{ p.error }}</span>
          <span v-else>โหลดไม่สำเร็จ {{ p.failed_pages }}/{{ p.total }} หน้า</span>
        </li>
      </ul>
    </div>

    <div v-if="state.log.length > 0" class="log-box">
      <p v-for="(msg, i) in state.log" :key="i">{{ msg }}</p>
    </div>
  </div>
</template>