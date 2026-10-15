<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

defineProps({
  title: { type: String, required: true },
  message: { type: String, required: true },
  confirmText: { type: String, default: 'Confirm' },
  cancelText: { type: String, default: 'Cancel' },
  danger: { type: Boolean, default: false },
})

const emit = defineEmits(['confirm', 'cancel'])
const confirmBtn = ref(null)

const onKey = (e) => {
  if (e.key === 'Escape') emit('cancel')
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
  confirmBtn.value?.focus()
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="ui-overlay confirm-overlay" @click.self="emit('cancel')">
    <div class="ui-modal confirm" role="alertdialog" aria-modal="true" :aria-label="title">
      <div class="icon" :class="{ danger }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
      <h2>{{ title }}</h2>
      <p>{{ message }}</p>
      <div class="actions">
        <button type="button" class="ui-btn ui-btn-secondary" @click="emit('cancel')">{{ cancelText }}</button>
        <button
          ref="confirmBtn"
          type="button"
          class="ui-btn"
          :class="danger ? 'ui-btn-danger' : 'ui-btn-primary'"
          @click="emit('confirm')"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.confirm-overlay {
  z-index: 200;
}

.confirm {
  width: 400px;
  text-align: center;
}

.confirm h2 {
  margin: 0 0 8px;
  font-size: 20px;
}

.confirm p {
  margin: 0 0 24px;
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.5;
}

.icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
}

.icon.danger {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.icon svg {
  width: 24px;
  height: 24px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}

@media (max-width: 480px) {
  .confirm {
    border-radius: 16px;
  }

  .confirm-overlay {
    align-items: center;
    padding: 16px;
  }

  .confirm.ui-modal {
    border-bottom: 1px solid #334155;
  }

  .actions {
    flex-direction: column-reverse;
  }

  .actions .ui-btn {
    width: 100%;
  }
}
</style>
