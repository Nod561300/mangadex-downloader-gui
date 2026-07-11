<script setup lang="ts">
import { invoke } from '@tauri-apps/api/core'
import { state, setChapters } from '../composables/useDownloadState'
import { getLangLabel } from '../utils/langMeta'

async function search() {
  if (!state.mangaId.trim()) return
  state.phase = 'loading'
  state.errorMessage = ''

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
</script>

<template>
  <header class="topbar">
    <div class="brand">
      <span class="brand-mark">頁</span>
      <span class="brand-name">MangaDex Downloader</span>
    </div>
    <div class="search-row">
      <input
        v-model="state.mangaId"
        type="text"
        placeholder="วาง Title ID หรือ URL จาก MangaDex"
        autocomplete="off"
        @keyup.enter="search"
      />
      <button class="btn primary" :disabled="state.phase === 'loading'" @click="search">
        {{ state.phase === 'loading' ? 'กำลังค้นหา...' : 'ค้นหา' }}
      </button>
    </div>
    <div v-if="state.manga && state.phase !== 'loading'" class="lang-row">
      <label>ภาษา:</label>
      <select v-model="state.selectedLang" @change="onLangChange">
        <option v-for="lang in state.manga.available_langs" :key="lang" :value="lang">
          {{ getLangLabel(lang) }}
        </option>
      </select>
    </div>
  </header>
</template>
