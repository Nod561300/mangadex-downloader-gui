<script setup lang="ts">
import { UI_LIBRARY } from '../../config/uiLibrary'
import { computed } from 'vue'
import PButton from 'primevue/button'

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    class?: string
    variant?: 'primary' | 'ghost'
    size?: 'small' | 'medium' | 'large'
  }>(),
  { variant: 'primary', size: 'medium' }
)

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const usePrimeVue = computed(() => UI_LIBRARY === 'primevue')

const buttonClass = computed(() => {
  if (usePrimeVue.value) return ''
  let cls = 'btn'
  if (props.variant === 'primary') cls += ' primary'
  if (props.variant === 'ghost') cls += ' ghost'
  if (props.size === 'large') cls += ' large'
  if (props.class) cls += ' ' + props.class
  return cls
})

const primeVueSeverity = computed(() => {
  if (props.variant === 'ghost') return 'secondary'
  return 'primary'
})
</script>

<template>
  <PButton
    v-if="usePrimeVue"
    :class="props.class"
    :severity="primeVueSeverity"
    :disabled="disabled"
    @click="emit('click', $event)"
  >
    <slot />
  </PButton>
  <button v-else :class="buttonClass" :disabled="disabled" @click="emit('click', $event)">
    <slot />
  </button>
</template>

<style scoped>
.btn {
  padding: 8px 16px;
  border: 1px solid var(--ink-line);
  border-radius: 4px;
  background: var(--ink-panel);
  color: var(--paper);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.btn:hover:not(:disabled) {
  border-color: var(--stamp);
  background: rgba(193, 67, 45, 0.1);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn.primary {
  background: var(--stamp);
  border-color: var(--stamp);
  color: var(--paper);
}

.btn.primary:hover:not(:disabled) {
  background: var(--stamp-dim);
  border-color: var(--stamp-dim);
}

.btn.ghost {
  background: transparent;
  border-color: var(--ink-line);
}

.btn.ghost:hover:not(:disabled) {
  border-color: var(--paper-dim);
}

.btn.large {
  padding: 12px 24px;
  font-size: 14px;
}
</style>
