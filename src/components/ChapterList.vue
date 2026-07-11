<script setup lang="ts">
import { computed } from 'vue'
import { state, toggleSelect, toggleSelectAll } from '../composables/useDownloadState'

const allSelected = computed(() => state.selected.size === state.chapters.length && state.chapters.length > 0)
</script>

<template>
  <div class="chapter-section">
    <div class="manga-info" v-if="state.manga">
      <img v-if="state.manga.cover_url" :src="state.manga.cover_url" class="cover" alt="ปก" />
      <div class="manga-meta">
        <h1>{{ state.manga.title }}</h1>
        <span class="chapter-count">{{ state.chapters.length }} ตอน</span>
      </div>
    </div>

    <div class="toolbar">
      <label class="checkbox-label">
        <input type="checkbox" :checked="allSelected" @change="toggleSelectAll" />
        เลือกทั้งหมด ({{ state.selected.size }})
      </label>
    </div>

    <ul class="chapter-list">
      <li
        v-for="ch in state.chapters"
        :key="ch.id"
        class="chapter-item"
        :class="{ selected: state.selected.has(ch.id) }"
        @click="toggleSelect(ch.id)"
      >
        <input
          type="checkbox"
          :checked="state.selected.has(ch.id)"
          @click.stop
          @change="toggleSelect(ch.id)"
        />
        <span class="chapter-label">
          ตอนที่ {{ ch.chapter ?? 'Oneshot' }}
          <span v-if="ch.title" class="chapter-title">— {{ ch.title }}</span>
        </span>
        <span class="chapter-pages">{{ ch.pages }} หน้า</span>
      </li>
    </ul>
  </div>
</template>