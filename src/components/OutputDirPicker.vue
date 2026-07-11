<script setup lang="ts">
import { open } from '@tauri-apps/plugin-dialog'
import { state } from '../composables/useDownloadState'

async function chooseDir() {
  const dir = await open({ directory: true, multiple: false })
  if (dir) state.outputDir = dir as string
}
</script>

<template>
  <div class="output-row">
    <button class="btn ghost" @click="chooseDir">เลือกโฟลเดอร์ปลายทาง</button>
    <span class="dir-label">{{ state.outputDir || 'ยังไม่ได้เลือกโฟลเดอร์' }}</span>
  </div>
</template>