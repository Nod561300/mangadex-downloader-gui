# UI Library Abstraction Layer

## วิธีสลับ Library

เปลี่ยนแค่ไฟล์เดียว: [src/config/uiLibrary.ts](src/config/uiLibrary.ts)

```typescript
// ปัจจุบัน: PrimeVue
export const UI_LIBRARY: UILibrary = 'primevue'

// เพื่อกลับไปใช้ Custom CSS
export const UI_LIBRARY: UILibrary = 'default'
```

## Architecture

- **Config**: [src/config/uiLibrary.ts](src/config/uiLibrary.ts) — เลือก library ที่ใช้
- **Shared Components**: [src/components/shared/](src/components/shared/) — Wrapper components ที่ support ทั้ง PrimeVue และ custom CSS
  - `Button.vue` — ปุ่ม
  - `Input.vue` — Input text
  - `Checkbox.vue` — Checkbox
  - `Select.vue` — Dropdown/Select

## Shared Components

### Button.vue
```vue
<Button variant="primary|ghost" size="small|medium|large" @click="..." />
```

### Input.vue
```vue
<Input v-model="value" placeholder="..." @keyup="..." />
```

### Checkbox.vue
```vue
<Checkbox v-model="checked" />
```

### Select.vue
```vue
<Select v-model="value" :options="[{label:'', value:''}]" />
```

## Components ที่ใช้ Shared Components

1. [SearchBar.vue](SearchBar.vue) — ใช้ Input, Button, Select
2. [ChapterList.vue](ChapterList.vue) — ใช้ Checkbox
3. [DownloadProgress.vue](DownloadProgress.vue) — ใช้ Button
4. [OutputDirPicker.vue](OutputDirPicker.vue) — ใช้ Button
5. [QueueBar.vue](QueueBar.vue) — ใช้ Button

## PrimeVue Setup

เมื่อเลือก `'primevue'`:
- ต้องมี `primevue` package installed (`^4.5.5`)
- ใช้ Aura theme ที่ custom ตามสีของ project
- PrimeVue components จะถูก render แทน native HTML

## CSS Styling

- Custom CSS ยังคงอยู่ใน [style.css](../style.css)
- Shared components มี fallback CSS สำหรับ default mode
- PrimeVue components จะใช้ PrimeVue styling
