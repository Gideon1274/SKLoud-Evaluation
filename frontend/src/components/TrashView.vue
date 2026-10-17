<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTrash } from '../composables/useTrash'
import { statusLabel } from '../composables/useTasks'
import ConfirmModal from './ConfirmModal.vue'

const emit = defineEmits(['back', 'restored'])

const {
  trashed,
  loading,
  busy,
  errorMessage,
  selectedIds,
  selectedCount,
  allSelected,
  isSelected,
  toggleSelect,
  toggleSelectAll,
  fetchTrash,
  restore,
  purge,
} = useTrash()

// confirm = 'restore' | 'purge' | null
const confirm = ref(null)

const plural = (n) => (n === 1 ? 'task' : 'tasks')

const confirmTitle = computed(() => {
  const n = selectedCount.value
  return confirm.value === 'restore'
    ? `Restore ${n} ${plural(n)}?`
    : `Permanently delete ${n} ${plural(n)}?`
})

const confirmMessage = computed(() => {
  const n = selectedCount.value
  return confirm.value === 'restore'
    ? `The selected ${plural(n)} will be moved back to your board with the same status and priority.`
    : `The selected ${plural(n)} will be permanently deleted. This can't be undone.`
})

const onConfirm = async () => {
  const action = confirm.value
  confirm.value = null
  const ids = [...selectedIds.value]
  if (action === 'restore') {
    if (await restore(ids)) emit('restored')
  } else if (action === 'purge') {
    await purge(ids)
  }
}

// Parse "YYYY-MM-DD" (or an ISO string) as a local calendar date so it never shifts by timezone.
const parseDate = (value) => {
  if (!value) return null
  const [y, m, d] = String(value).split('T')[0].split('-').map(Number)
  return new Date(y, m - 1, d)
}
const formatDate = (value) => parseDate(value)?.toLocaleDateString() || ''

onMounted(fetchTrash)
</script>

<template>
  <section class="trash">
    <header class="trash-header">
      <button type="button" class="ui-btn ui-btn-secondary back-btn" @click="emit('back')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Back to board
      </button>
      <div class="trash-title">
        <h2>Trash</h2>
        <span class="count">{{ trashed.length }}</span>
      </div>
    </header>

    <div v-if="errorMessage" class="state-msg error" role="alert">
      {{ errorMessage }}
      <button class="dismiss" aria-label="Dismiss" @click="errorMessage = ''">✕</button>
    </div>

    <div v-if="loading && trashed.length === 0" class="state-msg">Loading trash...</div>
    <div v-else-if="!errorMessage && trashed.length === 0" class="state-msg">
      Trash is empty. Deleted tasks will show up here.
    </div>

    <template v-if="trashed.length > 0">
      <div class="action-bar" :class="{ active: selectedCount > 0 }">
        <label class="select-all">
          <input type="checkbox" class="ui-checkbox" :checked="allSelected" @change="toggleSelectAll" />
          <span>{{ selectedCount > 0 ? `${selectedCount} selected` : 'Select all' }}</span>
        </label>

        <div class="bar-actions">
          <button
            type="button"
            class="ui-btn ui-btn-primary"
            :disabled="selectedCount === 0 || busy"
            @click="confirm = 'restore'"
          >
            Restore
          </button>
          <button
            type="button"
            class="ui-btn ui-btn-danger"
            :disabled="selectedCount === 0 || busy"
            @click="confirm = 'purge'"
          >
            Delete forever
          </button>
        </div>
      </div>

      <ul class="trash-list">
        <li
          v-for="task in trashed"
          :key="task.id"
          class="trash-row"
          :class="{ selected: isSelected(task.id) }"
          @click="toggleSelect(task.id)"
        >
          <label class="select-rail" @click.stop>
            <input
              type="checkbox"
              class="ui-checkbox"
              :checked="isSelected(task.id)"
              :aria-label="`Select ${task.title}`"
              @change="toggleSelect(task.id)"
            />
          </label>

          <div class="row-main">
            <div class="row-title">
              <h3>{{ task.title }}</h3>
              <span class="badge" :class="task.priority">{{ task.priority }}</span>
              <span class="badge status" :class="task.status">{{ statusLabel(task.status) }}</span>
            </div>
            <p v-if="task.description" class="description">{{ task.description }}</p>
          </div>

          <div class="row-meta">
            <span v-if="task.dueDate">📅 Due: {{ formatDate(task.dueDate) }}</span>
            <span v-else>No due date</span>
            <span class="deleted">Deleted {{ formatDate(task.updatedAt) }}</span>
          </div>
        </li>
      </ul>
    </template>

    <ConfirmModal
      v-if="confirm"
      :title="confirmTitle"
      :message="confirmMessage"
      :confirm-text="confirm === 'restore' ? 'Restore' : 'Delete forever'"
      :danger="confirm === 'purge'"
      @confirm="onConfirm"
      @cancel="confirm = null"
    />
  </section>
</template>

<style scoped>
.trash-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 20px;
  margin-bottom: 20px;
}

.back-btn svg {
  width: 16px;
  height: 16px;
}

.trash-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.trash-title h2 {
  margin: 0;
  font-size: 22px;
  color: #ffffff;
}

.count {
  min-width: 24px;
  padding: 2px 8px;
  border-radius: 12px;
  background: #334155;
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
}

/* ---------- Action bar ---------- */
.action-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  padding: 10px 14px;
  background: rgba(30, 41, 59, 0.35);
  border: 1px solid #334155;
  border-radius: 12px;
  transition: border-color 0.2s, background 0.2s;
}

.action-bar.active {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.08);
}

.select-all {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 32px;
  font-size: 14px;
  font-weight: 600;
  color: #cbd5e1;
  cursor: pointer;
}

.bar-actions {
  display: flex;
  gap: 10px;
}

/* ---------- List ---------- */
.trash-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.trash-row {
  display: flex;
  align-items: stretch;
  gap: 14px;
  padding: 0 18px 0 0;
  flex-shrink: 0;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.trash-row:hover {
  border-color: #475569;
}

.trash-row.selected {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.08);
}

.select-rail {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 56px;
  border-right: 1px solid #334155;
  cursor: pointer;
}

.trash-row.selected .select-rail {
  border-right-color: rgba(59, 130, 246, 0.5);
}

.row-main {
  flex: 1;
  min-width: 0;
  align-self: center;
  padding: 14px 0;
}

.row-title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px 10px;
}

.row-title h3 {
  margin: 0;
  font-size: 17px;
  line-height: 1.3;
  font-weight: 700;
  color: #ffffff;
  overflow-wrap: anywhere;
}

.badge {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 12px;
  text-transform: uppercase;
  font-weight: 700;
  white-space: nowrap;
}

.badge.low {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.badge.medium {
  background: rgba(234, 179, 8, 0.15);
  color: #facc15;
}

.badge.high {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.badge.status.todo {
  background: rgba(100, 116, 139, 0.2);
  color: #94a3b8;
}

.badge.status.in_progress {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
}

.badge.status.completed {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.description {
  margin: 6px 0 0;
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
  align-self: center;
  font-size: 13px;
  color: #64748b;
  white-space: nowrap;
}

.row-meta .deleted {
  color: #94a3b8;
}

/* ---------- States (same look as the dashboard) ---------- */
.state-msg {
  position: relative;
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
  font-size: 15px;
}

.state-msg.error {
  padding: 14px 44px 14px 16px;
  margin-bottom: 20px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #f87171;
  font-size: 14px;
  text-align: left;
}

.dismiss {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 14px;
  padding: 6px;
}

/* ---------- Responsive ---------- */
@media (pointer: coarse) {
  .select-rail {
    width: 64px;
  }
}

@media (max-width: 700px) {
  .trash-row {
    display: grid;
    grid-template-columns: 48px minmax(0, 1fr);
    grid-template-areas:
      'rail main'
      'meta meta';
    gap: 0;
    padding: 0;
  }

  .select-rail {
    grid-area: rail;
    align-items: flex-start;
    padding-top: 16px;
    border-right: none;
  }

  .row-main {
    grid-area: main;
    padding: 14px 14px 4px 0;
  }

  .row-meta {
    grid-area: meta;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 14px;
    padding: 8px 14px 12px;
    white-space: normal;
  }

  .description {
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}

@media (max-width: 480px) {
  .bar-actions {
    width: 100%;
  }

  .bar-actions .ui-btn {
    flex: 1;
  }

  .back-btn {
    width: 100%;
  }
}
</style>