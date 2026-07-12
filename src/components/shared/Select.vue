<script setup lang="ts">
import { UI_LIBRARY } from '../../config/uiLibrary'
import { computed } from 'vue'
import PDropdown from 'primevue/dropdown'

interface Option {
  label: string
  value: string
}

const props = withDefaults(
  defineProps<{
    modelValue: string
    options: Option[]
    class?: string
    placeholder?: string
  }>(),
  { placeholder: 'Select an option' }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const usePrimeVue = computed(() => UI_LIBRARY === 'primevue')

const selectClass = computed(() => {
  if (usePrimeVue.value) return ''
  return 'select-default ' + (props.class || '')
})
</script>

<template>
  <PDropdown
    v-if="usePrimeVue"
    :model-value="modelValue"
    :options="options"
    option-label="label"
    option-value="value"
    :class="props.class"
    :placeholder="placeholder"
    @update:model-value="emit('update:modelValue', $event)"
  />
  <select v-else :class="selectClass" :value="modelValue" @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)">
    <option v-if="placeholder" disabled value="">{{ placeholder }}</option>
    <option v-for="opt in options" :key="opt.value" :value="opt.value">
      {{ opt.label }}
    </option>
  </select>
</template>

<style scoped>
.select-default {
  background: var(--ink-panel);
  border: 1px solid var(--ink-line);
  color: var(--paper);
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.select-default:focus {
  outline: none;
  border-color: var(--stamp);
}
</style>
