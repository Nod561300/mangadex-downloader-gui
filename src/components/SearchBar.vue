<script setup lang="ts">
import { invoke, isTauri } from '@tauri-apps/api/core'
import { state, setChapters } from '../composables/useDownloadState'
import { getLangLabel } from '../utils/langMeta'
import Button from './shared/Button.vue'
import Input from './shared/Input.vue'
import Select from './shared/Select.vue'
import { computed } from 'vue'

async function search() {
  if (!state.mangaId.trim()) return
  state.phase = 'loading'
  state.errorMessage = ''

  if (!isTauri) {
    state.phase = 'error'
    state.errorMessage = 'Tauri runtime not available. Please run in the Tauri app environment.'
    return
  }

  try {
    const manga = await invoke<any>('fetch_manga_info', { mangaId: state.mangaId.trim() })
    state.manga = manga
    state.selectedLang = manga.available_langs.includes('en') ? 'en' : manga.available_langs[0] ?? 'en'
    await loadChapters()
    state.phase = 'ready'
  } catch (e: any) {
    state.phase = 'error'
    state.errorMessage = e
  }
}

async function loadChapters() {
  const chapters = await invoke<any[]>('fetch_chapters_for_lang', {
    mangaId: state.manga!.id,
    lang: state.selectedLang,
  })
  setChapters(chapters)
}

async function onLangChange() {
  if (!state.manga) return
  state.phase = 'loading'
  try {
    await loadChapters()
    state.phase = 'ready'
  } catch (e: any) {
    state.phase = 'error'
    state.errorMessage = e
  }
}

const langOptions = computed(() =>
  state.manga?.available_langs.map((lang) => ({ label: getLangLabel(lang), value: lang })) || []
)
</script>

<template>
  <header class="topbar">
    <div class="brand">
      <span class="brand-mark">頁</span>
      <span class="brand-name">MangaDex Downloader</span>
    </div>
    <div class="search-row">
      <Input
        v-model="state.mangaId"
        placeholder="วาง Title ID หรือ URL จาก MangaDex"
        @keyup.enter="search"
      />
      <Button
        :disabled="state.phase === 'loading'"
        variant="primary"
        @click="search"
      >
        {{ state.phase === 'loading' ? 'กำลังค้นหา...' : 'ค้นหา' }}
      </Button>
    </div>
    <div v-if="state.manga && state.phase !== 'loading'" class="lang-row">
      <label>ภาษา:</label>
      <Select
        v-model="state.selectedLang"
        :options="langOptions"
        @update:model-value="onLangChange"
      />
    </div>
  </header>
</template>
