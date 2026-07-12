<script setup lang="ts">
import { UI_LIBRARY } from '../../config/uiLibrary'
import { computed } from 'vue'
import PInputText from 'primevue/inputtext'

const props = withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    class?: string
  }>(),
  {}
)

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined]
  keyup: [event: KeyboardEvent]
}>()

const usePrimeVue = computed(() => UI_LIBRARY === 'primevue')

const inputClass = computed(() => {
  if (usePrimeVue.value) return ''
  return 'input-default ' + (props.class || '')
})
</script>

<template>
  <PInputText
    v-if="usePrimeVue"
    :model-value="modelValue"
    :placeholder="placeholder"
    :class="props.class"
    type="text"
    @update:model-value="emit('update:modelValue', $event)"
    @keyup="emit('keyup', $event)"
  />
  <input
    v-else
    :class="inputClass"
    type="text"
    :value="modelValue"
    :placeholder="placeholder"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    @keyup="emit('keyup', $event)"
  />
</template>

<style scoped>
.input-default {
  flex: 1;
  padding: 8px 12px;
  background: var(--ink-panel);
  border: 1px solid var(--ink-line);
  border-radius: 4px;
  color: var(--paper);
  font-size: 13px;
}

.input-default::placeholder {
  color: var(--paper-dim);
}

.input-default:focus {
  outline: none;
  border-color: var(--stamp);
  box-shadow: 0 0 0 2px rgba(193, 67, 45, 0.1);
}
</style>
