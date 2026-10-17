<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useSwipe } from '../composables/useSwipe'

const props = defineProps({
  task: { type: Object, required: true },
  dragging: { type: Boolean, default: false },
  selected: { type: Boolean, default: false },
})

const emit = defineEmits(['edit', 'pointerdown', 'swipe-move', 'toggle-select'])

const cardEl = ref(null)
const isTouchDevice = ref(false)

onMounted(() => {
  isTouchDevice.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0
})

// Parse "YYYY-MM-DD" (or an ISO string) as a local calendar date so it never shifts by timezone.
const parseDate = (value) => {
  if (!value) return null
  const [y, m, d] = String(value).split('T')[0].split('-').map(Number)
  return new Date(y, m - 1, d)
}

const formattedDate = computed(() => {
  const date = parseDate(props.task.dueDate)
  return date ? date.toLocaleDateString() : ''
})

const overdue = computed(() => {
  const date = parseDate(props.task.dueDate)
  if (!date || props.task.status === 'completed') return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
})

const getNextStatus = (status) => {
  if (status === 'todo') return 'in_progress'
  if (status === 'in_progress') return 'completed'
  return null
}

const { bind, unbind } = useSwipe({
  disabled: () => !isTouchDevice.value || props.dragging || props.task.status === 'completed',
  onSwipeRight: () => {
    const nextStatus = getNextStatus(props.task.status)
    if (nextStatus) emit('swipe-move', props.task, nextStatus)
  },
  onSwipeLeft: () => {
  },
})

onMounted(() => {
  if (cardEl.value) bind(cardEl.value)
})
onBeforeUnmount(() => {
  if (cardEl.value) unbind(cardEl.value)
})
</script>

<template>
  <article
    ref="cardEl"
    class="task-card"
    :data-task-id="task.id"
    :class="{ completed: task.status === 'completed', dragging, selected }"
    @pointerdown="$emit('pointerdown', $event)"
    style="touch-action: pan-y;"
  >
    <label class="select-rail" title="Select task" @click.stop>
      <input
        type="checkbox"
        class="ui-checkbox"
        :checked="selected"
        :aria-label="`Select ${task.title}`"
        @change="$emit('toggle-select')"
      />
    </label>

    <div class="task-body">
      <div class="task-header">
        <h3>{{ task.title }}</h3>
        <span class="badge" :class="task.priority">{{ task.priority }}</span>
      </div>

      <p v-if="task.description" class="description">{{ task.description }}</p>
    </div>

    <div class="task-footer">
      <span class="due" :class="{ overdue }">
        <template v-if="task.dueDate">
          📅 Due: {{ formattedDate }}
          <span v-if="overdue" class="overdue-text">(Overdue)</span>
        </template>
        <template v-else>No due date</template>
      </span>

      <button
        type="button"
        class="cog-btn"
        aria-label="Edit task"
        title="Edit task"
        @click="$emit('edit')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
    </div>
  </article>
</template>

<style scoped>
.task-card {
  width: 100%;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 0;
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr);
  grid-template-areas:
    'rail body'
    'footer footer';
  flex-shrink: 0; /* never squash cards inside the scrolling column */
  text-align: left;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  transition: border-color 0.2s, opacity 0.2s;
}

.task-card:hover {
  border-color: #475569;
}

.task-card.completed {
  opacity: 0.55;
}

.task-card.selected {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.08);
}

.select-rail {
  grid-area: rail;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 16px;
  cursor: pointer;
}

.select-rail:hover .ui-checkbox:not(:checked) {
  border-color: #94a3b8;
}

.task-body {
  grid-area: body;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  padding: 16px 18px 4px 0;
}

.task-card.dragging {
  opacity: 0.3;
  border-style: dashed;
}

.task-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px 10px;
}

.task-header h3 {
  flex: 1 1 0;
  min-width: 0;
  margin: 0;
  font-size: 18px;
  line-height: 1.3;
  font-weight: 700;
  color: #ffffff;
  text-align: left;
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

.description {
  margin: 0;
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.5;
  text-align: left;
  overflow-wrap: anywhere;
}

.task-footer {
  grid-area: footer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 18px 14px 18px;
}

.due {
  font-size: 13px;
  color: #64748b;
}

.due.overdue,
.overdue-text {
  color: #f87171;
  font-weight: 600;
}

.cog-btn {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  color: #94a3b8;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}

.cog-btn svg {
  width: 17px;
  height: 17px;
}

.cog-btn:hover {
  color: #ffffff;
  border-color: #3b82f6;
  background: #3b82f6;
}

.cog-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.35);
}

@media (pointer: coarse) {
  .task-card {
    grid-template-columns: 64px minmax(0, 1fr);
  }

  .cog-btn {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 480px) {
  .task-card {
    grid-template-columns: 48px minmax(0, 1fr);
  }

  .select-rail {
    padding-top: 14px;
  }

  .task-body {
    padding: 14px 14px 4px 0;
  }

  .task-footer {
    padding: 10px 14px 12px;
  }

  .task-header h3 {
    font-size: 17px;
  }
}
</style>