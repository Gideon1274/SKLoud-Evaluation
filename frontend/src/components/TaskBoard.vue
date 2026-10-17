<script setup>
import { ref, computed } from 'vue'
import TaskCard from './TaskCard.vue'
import { STATUSES } from '../composables/useTasks'
import { useDragDrop } from '../composables/useDragDrop'

const props = defineProps({
  tasksByStatus: { type: Object, required: true },
  // When a status filter is active, only that column is shown.
  statusFilter: { type: String, default: '' },
  // Ids of the tasks currently checked (they are dragged / swiped together).
  selectedIds: { type: Array, default: () => [] },
})

const emit = defineEmits(['edit', 'move', 'toggle-select'])

const boardEl = ref(null)

// ---------- Ordering: high → medium → low, then oldest created first ----------
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }
const priorityRank = (p) => PRIORITY_ORDER[p] ?? 3

const createdTime = (task) => {
  const t = Date.parse(task.createdAt ?? task.created_at ?? '')
  return Number.isNaN(t) ? null : t
}

// Falls back to id (auto-increment) when there is no usable creation timestamp.
const compareAge = (a, b) => {
  const ta = createdTime(a)
  const tb = createdTime(b)
  if (ta !== null && tb !== null && ta !== tb) return ta - tb
  return Number(a.id) - Number(b.id)
}

const sortedTasks = computed(() => {
  const result = {}
  for (const col of STATUSES) {
    result[col.key] = [...(props.tasksByStatus[col.key] || [])].sort(
      (a, b) => priorityRank(a.priority) - priorityRank(b.priority) || compareAge(a, b)
    )
  }
  return result
})

const { draggingId, overStatus, startDrag } = useDragDrop({
  getDragElements: (task) =>
  props.selectedIds.includes(task.id)
    ? props.selectedIds
        .filter((id) => id !== task.id)
        .map((id) => boardEl.value?.querySelector(`[data-task-id="${id}"]`))
        .filter(Boolean)
    : [],

  onDrop: (task, status) => emit('move', task, status),
  getDragCount: (task) => (props.selectedIds.includes(task.id) ? props.selectedIds.length : 1),
  getScroller: () => {
    if (!boardEl.value) return null
    let column = boardEl.value.querySelector('.column.over')
    if (!column) {
      const columns = boardEl.value.querySelectorAll('.column')
      column = columns[0]
    }
    return column?.querySelector('.column-body') ?? boardEl.value
  },
})

// While a checked card is dragged, every checked card looks "picked up".
const isDragging = (task) =>
  draggingId.value !== null &&
  (draggingId.value === task.id ||
    (props.selectedIds.includes(draggingId.value) && props.selectedIds.includes(task.id)))

const isVisible = (key) => !props.statusFilter || props.statusFilter === key

const handleSwipeMove = (task, newStatus) => {
  emit('move', task, newStatus)
}
</script>

<template>
  <div ref="boardEl" class="board" :class="{ single: !!statusFilter }">
    <section
      v-for="col in STATUSES"
      v-show="isVisible(col.key)"
      :key="col.key"
      class="column"
      :class="[col.key, { over: overStatus === col.key && draggingId !== null }]"
      :data-drop-status="col.key"
    >
      <header class="column-header">
        <span class="dot"></span>
        <h2>{{ col.label }}</h2>
        <span class="count">{{ sortedTasks[col.key].length }}</span>
      </header>

      <div class="column-body" style="touch-action: pan-y;">
        <TaskCard
          v-for="task in sortedTasks[col.key]"
          :key="task.id"
          :task="task"
          :dragging="isDragging(task)"
          :selected="selectedIds.includes(task.id)"
          @pointerdown="startDrag($event, task, $event.currentTarget)"
          @edit="emit('edit', task)"
          @toggle-select="emit('toggle-select', task.id)"
          @swipe-move="handleSwipeMove"
        />

        <div v-if="sortedTasks[col.key].length === 0" class="empty">
          {{ draggingId !== null ? 'Drop here' : 'No tasks' }}
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.board {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  align-items: stretch;
}

.board.single {
  grid-template-columns: minmax(0, 1fr);
}

.column {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 320px;
  background: rgba(30, 41, 59, 0.35);
  border: 1px solid #334155;
  border-radius: 14px;
  padding: 14px;
  transition: border-color 0.2s, background 0.2s;
}

.column.over {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.08);
}

.column-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 2px 4px 14px;
}

.column-header h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.2px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #64748b;
}

.column.in_progress .dot {
  background: #3b82f6;
}

.column.completed .dot {
  background: #4ade80;
}

.count {
  margin-left: auto;
  min-width: 24px;
  padding: 2px 8px;
  border-radius: 12px;
  background: #334155;
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
}

.column-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  max-height: calc(100vh - 350px);
  padding-right: 4px;
  margin-right: -4px;
}

.column-body::-webkit-scrollbar {
  width: 6px;
}

.column-body::-webkit-scrollbar-track {
  background: transparent;
}

.column-body::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 3px;
}

.column-body::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

.column-body {
  scrollbar-width: thin;
  scrollbar-color: #475569 transparent;
}

.empty {
  flex: 1;
  min-height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #334155;
  border-radius: 10px;
  color: #64748b;
  font-size: 14px;
}

.column.over .empty {
  border-color: #3b82f6;
  color: #93c5fd;
}

/* Tablet & mobile: keep the horizontal 3-column layout, swipe sideways between columns. */
@media (max-width: 900px) {
  .board {
    display: flex;
    gap: 14px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    margin: 0 -16px;
    padding: 0 16px 12px;
    scroll-padding: 0 16px;
  }

  .board.single {
    display: flex;
  }

  .column {
    flex: 0 0 min(78vw, 360px);
    scroll-snap-align: start;
  }

  .board.single .column {
    flex: 1 0 100%;
  }
}

:global(body.is-dragging-task) .board {
  scroll-snap-type: none;
}

@media (max-width: 480px) {
  .column {
    flex-basis: 86vw;
    padding: 12px;
  }
}
</style>