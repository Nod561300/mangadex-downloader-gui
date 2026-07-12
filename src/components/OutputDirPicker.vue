<script setup lang="ts">
import { open } from '@tauri-apps/plugin-dialog'
import { state } from '../composables/useDownloadState'
import Button from './shared/Button.vue'

async function chooseDir() {
  const dir = await open({ directory: true, multiple: false })
  if (dir) state.outputDir = dir as string
}
</script>

<template>
  <div class="output-row">
    <Button
      variant="ghost"
      @click="chooseDir"
    >
      เลือกโฟลเดอร์ปลายทาง
    </Button>
    <span class="dir-label">{{ state.outputDir || 'ยังไม่ได้เลือกโฟลเดอร์' }}</span>
  </div>
</template>