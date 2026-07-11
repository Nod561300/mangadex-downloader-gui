<script setup lang="ts">
import { computed } from 'vue'
import { queueState, removeFromQueue, clearDone, activeItem } from '../composables/useQueueState'
import { startQueue, cancelCurrent } from '../composables/useQueueRunner'

const statusLabel: Record<string, string> = {
  waiting: '⏳ รอ',
  downloading: '⬇ กำลังโหลด',
  done: '✅ เสร็จ',
  error: '⚠ มีปัญหา',
  cancelled: '⏹ ยกเลิก',
}

const totalItems = computed(() => queueState.items.length)
const doneCount = computed(() => queueState.items.filter((i) => i.status === 'done').length)
const waitingCount = computed(() => queueState.items.filter((i) => i.status === 'waiting').length)

const chapterPct = computed(() => {
  const item = activeItem.value
  if (!item || !item.chapterProgress.total) return 0
  return Math.round((item.chapterProgress.completed / item.chapterProgress.total) * 100)
})

const pagePct = computed(() => {
  const item = activeItem.value
  if (!item || !item.pageProgress.total) return 0
  return Math.round((item.pageProgress.current / item.pageProgress.total) * 100)
})

function toggleExpand() {
  queueState.expanded = !queueState.expanded
}
</script>

<template>
  <div class="queue-bar" :class="{ expanded: queueState.expanded }">

    <!-- Header row — always visible -->
    <div class="queue-header" @click="toggleExpand">
      <span class="queue-title">
        📋 คิว
        <span class="queue-badge" v-if="totalItems > 0">{{ doneCount }}/{{ totalItems }}</span>
      </span>

      <span v-if="activeItem" class="queue-active-label">
        ⬇ {{ activeItem.manga.title }}
        — ตอน {{ activeItem.chapterProgress.completed }}/{{ activeItem.chapterProgress.total }}
      </span>
      <span v-else-if="waitingCount > 0" class="queue-active-label dim">
        {{ waitingCount }} รายการรอ
      </span>
      <span v-else-if="totalItems > 0" class="queue-active-label dim">เสร็จทั้งหมด</span>

      <div class="queue-header-actions" @click.stop>
        <button
          v-if="!queueState.isRunning && waitingCount > 0"
          class="btn primary"
          @click="startQueue"
        >▶ เริ่ม</button>
        <button
          v-if="queueState.isRunning"
          class="btn danger"
          @click="cancelCurrent"
        >⏹ หยุด</button>
        <button v-if="doneCount > 0" class="btn ghost" @click="clearDone">ล้างที่เสร็จ</button>
      </div>

      <span class="queue-chevron">{{ queueState.expanded ? '▼' : '▲' }}</span>
    </div>

    <!-- Active progress bar — always visible when downloading -->
    <div v-if="activeItem" class="queue-mini-progress">
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: chapterPct + '%' }"></div>
      </div>
      <div v-if="activeItem.pageProgress.label" class="progress-track" style="margin-top: 3px">
        <div class="progress-fill secondary" :style="{ width: pagePct + '%' }"></div>
      </div>
    </div>

    <!-- Expanded list -->
    <div v-if="queueState.expanded && totalItems > 0" class="queue-list">
      <div
        v-for="item in queueState.items"
        :key="item.id"
        class="queue-item"
        :class="item.status"
      >
        <div class="queue-item-main">
          <span class="queue-item-title">{{ item.manga.title }}</span>
          <span class="queue-item-meta">{{ item.chapters.length }} ตอน</span>
          <span class="queue-item-status">{{ statusLabel[item.status] }}</span>
          <button
            v-if="item.status === 'waiting' || item.status === 'error' || item.status === 'cancelled' || item.status === 'done'"
            class="btn-icon"
            title="ลบออกจากคิว"
            @click="removeFromQueue(item.id)"
          >✕</button>
        </div>

        <!-- Per-item progress (when active) -->
        <div v-if="item.status === 'downloading'" class="queue-item-progress">
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: chapterPct + '%' }"></div>
          </div>
          <span class="progress-label">
            ตอน {{ item.chapterProgress.completed }}/{{ item.chapterProgress.total }}
            <span v-if="item.pageProgress.label"> — {{ item.pageProgress.label }} ({{ item.pageProgress.current }}/{{ item.pageProgress.total }} หน้า)</span>
          </span>
        </div>

        <!-- Problems -->
        <div v-if="item.status === 'error' && item.problems.length > 0" class="queue-item-problems">
          <span v-for="p in item.problems" :key="p.chapter_id" class="problem-tag">
            {{ p.label }}: {{ p.failed_pages === -1 ? p.error : `${p.failed_pages}/${p.total} หน้าพัง` }}
          </span>
        </div>
      </div>
    </div>

  </div>
</template>
