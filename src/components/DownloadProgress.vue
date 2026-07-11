<script setup lang="ts">
import { computed } from 'vue'
import { state } from '../composables/useDownloadState'
import { addToQueue } from '../composables/useQueueState'
import { startQueue } from '../composables/useQueueRunner'

const canAddToQueue = computed(() =>
  state.selected.size > 0 && !!state.outputDir && !!state.manga
)

function addAndStart() {
  if (!canAddToQueue.value || !state.manga) return
  const chapters = state.chapters.filter((c) => state.selected.has(c.id))
  addToQueue(state.manga, chapters, state.outputDir)
  startQueue()
}
</script>

<template>
  <div class="download-section">
    <div class="download-bar">
      <button class="btn primary large" :disabled="!canAddToQueue" @click="addAndStart">
        ➕ เพิ่มเข้าคิว ({{ state.selected.size }} ตอน)
      </button>
    </div>
  </div>
</template>
