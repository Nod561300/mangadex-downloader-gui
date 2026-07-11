<script setup lang="ts">
import SearchBar from './components/SearchBar.vue'
import ChapterList from './components/ChapterList.vue'
import OutputDirPicker from './components/OutputDirPicker.vue'
import DownloadProgress from './components/DownloadProgress.vue'
import { state } from './composables/useDownloadState'
</script>

<template>
  <div class="app">
    <SearchBar />
    <main class="content">
      <section v-if="state.phase === 'idle'" class="empty-state">
        <p>ใส่ Title ID แล้วกด "ค้นหา" เพื่อดูรายการตอนทั้งหมด</p>
      </section>

      <section v-if="state.phase === 'loading'" class="empty-state">
        <p>กำลังโหลด...</p>
      </section>

      <section v-if="state.phase === 'error'" class="error-state">
        <p>{{ state.errorMessage }}</p>
      </section>

      <section v-if="['ready', 'downloading', 'done'].includes(state.phase)" class="result-state">
        <ChapterList />
        <OutputDirPicker />
        <DownloadProgress />
      </section>
    </main>
  </div>
</template>