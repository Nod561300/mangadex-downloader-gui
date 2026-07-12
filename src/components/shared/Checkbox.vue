<script setup lang="ts">
import { UI_LIBRARY } from '../../config/uiLibrary'
import { computed } from 'vue'
import PCheckbox from 'primevue/checkbox'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    class?: string
    label?: string
  }>(),
  {}
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const usePrimeVue = computed(() => UI_LIBRARY === 'primevue')

const checkboxClass = computed(() => {
  if (usePrimeVue.value) return ''
  return 'checkbox-default ' + (props.class || '')
})
</script>

<template>
  <PCheckbox
    v-if="usePrimeVue"
    :model-value="modelValue"
    binary
    :label="label"
    :class="props.class"
    @update:modelValue="emit('update:modelValue', $event)"
  />
  <input
    v-else
    :class="checkboxClass"
    type="checkbox"
    :checked="modelValue"
    @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
  />
</template>

<style scoped>
.checkbox-default {
  cursor: pointer;
  accent-color: var(--stamp);
}
</style>
